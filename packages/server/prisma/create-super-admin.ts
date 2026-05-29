import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const DEFAULT_PHONE = '+243990000001';
const DEFAULT_EMAIL = 'admin@edugoma360.cd';
const DEFAULT_PASSWORD = 'Admin@2025';

async function main() {
  const phone = process.env.SUPER_ADMIN_PHONE ?? DEFAULT_PHONE;
  const email = process.env.SUPER_ADMIN_EMAIL ?? DEFAULT_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

  const school = await prisma.school.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  }) ?? await prisma.school.findFirst({
    orderBy: { createdAt: 'asc' },
  }) ?? await prisma.school.create({
    data: {
      name: process.env.DEFAULT_SCHOOL_NAME ?? 'EduGoma360',
      type: 'PRIVE',
      province: process.env.DEFAULT_PROVINCE ?? 'Nord-Kivu',
      ville: process.env.DEFAULT_VILLE ?? 'Goma',
      email: process.env.DEFAULT_SCHOOL_EMAIL ?? 'contact@edugoma360.cd',
      telephone: process.env.DEFAULT_SCHOOL_PHONE ?? '+243970000000',
    },
  });

  const passwordHash = await bcrypt.hash(password, rounds);

  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      schoolId: school.id,
      role: 'SUPER_ADMIN',
    },
    orderBy: { createdAt: 'asc' },
  });

  const existingByLogin = existingSuperAdmin ?? await prisma.user.findFirst({
    where: {
      schoolId: school.id,
      OR: [
        { phone },
        { email },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  const emailOwner = email
    ? await prisma.user.findFirst({
        where: {
          schoolId: school.id,
          email,
          NOT: existingByLogin ? { id: existingByLogin.id } : undefined,
        },
      })
    : null;

  const emailToSave = emailOwner ? existingByLogin?.email ?? null : email;

  const user = existingByLogin
    ? await prisma.user.update({
        where: { id: existingByLogin.id },
        data: {
          nom: existingByLogin.nom || 'Super',
          postNom: existingByLogin.postNom || 'Admin',
          prenom: existingByLogin.prenom || 'EduGoma360',
          phone,
          email: emailToSave,
          role: 'SUPER_ADMIN',
          passwordHash,
          isActive: true,
          mustChangePassword: false,
        },
      })
    : await prisma.user.create({
        data: {
          schoolId: school.id,
          nom: 'Super',
          postNom: 'Admin',
          prenom: 'EduGoma360',
          phone,
          email: emailToSave,
          role: 'SUPER_ADMIN',
          passwordHash,
          isActive: true,
          mustChangePassword: false,
        },
      });

  console.log('\nSuper admin prêt, sans suppression de données.');
  console.log(`Ecole   : ${school.name} (${school.id})`);
  console.log(`Login   : ${user.phone}`);
  console.log(`Email   : ${user.email ?? 'non défini'}`);
  console.log(`Mot de passe : ${password}`);

  if (emailOwner) {
    console.log(`Note    : l'email ${email} appartient déjà à un autre utilisateur, donc le login téléphone a été privilégié.`);
  }
}

main()
  .catch((error) => {
    console.error('Erreur création super admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

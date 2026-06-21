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

  const passwordHash = await bcrypt.hash(password, rounds);

  // Le Super Admin est indépendant de toute école (schoolId = null).
  // On le retrouve par isSuperAdmin, sinon par téléphone / email.
  const existingByLogin =
    (await prisma.user.findFirst({
      where: { isSuperAdmin: true },
      orderBy: { createdAt: 'asc' },
    })) ??
    (await prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] },
      orderBy: { createdAt: 'asc' },
    }));

  // Si l'email cible appartient déjà à un AUTRE utilisateur, on garde le login téléphone.
  const emailOwner = email
    ? await prisma.user.findFirst({
        where: {
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
          schoolId: null, // détache le super admin de toute école
          nom: existingByLogin.nom || 'Super',
          postNom: existingByLogin.postNom || 'Admin',
          prenom: existingByLogin.prenom || 'EduGoma360',
          phone,
          email: emailToSave,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
          passwordHash,
          isActive: true,
          mustChangePassword: false,
        },
      })
    : await prisma.user.create({
        data: {
          schoolId: null,
          nom: 'Super',
          postNom: 'Admin',
          prenom: 'EduGoma360',
          phone,
          email: emailToSave,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
          passwordHash,
          isActive: true,
          mustChangePassword: false,
        },
      });

  console.log('\nSuper admin prêt (indépendant de toute école).');
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

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Début du peuplement minimal de la base de données...\n');

    const BCRYPT_ROUNDS = 12;

    // ── 1. Create School (Required for User) ──────────────────────────────────
    console.log('🏫 Création de l\'école par défaut...');
    const school = await prisma.school.upsert({
        where: { id: 'school-001' },
        update: {},
        create: {
            id: 'school-001',
            name: 'Direction Générale EduGoma360',
            type: 'PRIVE',
            province: 'Nord-Kivu',
            ville: 'Goma',
            commune: 'Goma',
            adresse: 'Siège Social, Goma',
            telephone: '+243970000000',
            email: 'contact@edugoma360.cd',
        },
    });

    // ── 2. Create Super Admin ──────────────────────────────────────────────────
    console.log('👑 Création du Super Administrateur...');
    const adminData = {
        nom: 'KAHINDO',
        postNom: 'MUTABESHA',
        prenom: 'Jean',
        phone: '+243990000001',
        email: 'admin@edugoma360.cd',
        role: 'SUPER_ADMIN',
        password: 'Admin@2025'
    };

    const hash = await bcrypt.hash(adminData.password, BCRYPT_ROUNDS);

    const user = await prisma.user.upsert({
        where: { schoolId_phone: { schoolId: school.id, phone: adminData.phone } },
        update: {
            role: 'SUPER_ADMIN',
            passwordHash: hash,
            isActive: true
        },
        create: {
            schoolId: school.id,
            nom: adminData.nom,
            postNom: adminData.postNom,
            prenom: adminData.prenom,
            phone: adminData.phone,
            email: adminData.email,
            role: 'SUPER_ADMIN',
            passwordHash: hash,
            isActive: true
        },
    });

    // ── 3. Default Settings ────────────────────────────────────────────────────
    console.log('⚙️ Configuration des paramètres système...');
    const defaultSettings: Record<string, any> = {
        'exchange_rate': 2500,
        'sms_language': 'fr',
        'sms_provider': 'africas_talking',
        'app_version': '1.0.0',
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
        await prisma.setting.upsert({
            where: { schoolId_key: { schoolId: school.id, key } },
            update: { value: JSON.stringify(value) },
            create: { schoolId: school.id, key, value: JSON.stringify(value) },
        });
    }

    console.log('\n✅ Seed minimal terminé avec succès !');
    console.log('═══════════════════════════════════════════');
    console.log(`👤 Super Admin: ${user.nom} ${user.prenom}`);
    console.log(`📱 Login: ${user.phone}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log('═══════════════════════════════════════════\n');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

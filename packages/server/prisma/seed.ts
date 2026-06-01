import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Début du peuplement minimal de la base de données...\n');

    const BCRYPT_ROUNDS = 12;

    // ── 0. Seed SaaS Subscription Plans ───────────────────────────────────────
    console.log('📦 Création des plans d\'abonnement SaaS...');

    const plans = [
        {
            id: 'plan-trial',
            name: 'Essai',
            slug: 'trial',
            priceUSD: 0,
            priceCDF: 0,
            maxStudents: 150,
            maxTeachers: 10,
            maxSmsPerMonth: 50,
            durationDays: 30,
            features: JSON.stringify([
                'Inscriptions & Dossiers élèves',
                'Présences (appel matin/après-midi)',
                'Saisie des notes',
                'Accès limité à 150 élèves',
                'Support par email',
            ]),
        },
        {
            id: 'plan-bronze',
            name: 'Bronze',
            slug: 'bronze',
            priceUSD: 15,
            priceCDF: 37500,
            maxStudents: 300,
            maxTeachers: 20,
            maxSmsPerMonth: 200,
            durationDays: 30,
            features: JSON.stringify([
                'Toutes les fonctionnalités Essai',
                'Bulletins officiels EPSP-RDC (PDF)',
                'Gestion financière bi-devise (FC/USD)',
                'SMS parents (200/mois)',
                'Export Excel',
                'Support prioritaire',
            ]),
        },
        {
            id: 'plan-silver',
            name: 'Argent',
            slug: 'silver',
            priceUSD: 30,
            priceCDF: 75000,
            maxStudents: 800,
            maxTeachers: 60,
            maxSmsPerMonth: 1000,
            durationDays: 30,
            features: JSON.stringify([
                'Toutes les fonctionnalités Bronze',
                'Délibérations & Palmarès automatiques',
                'Gestion des enseignants & Congés',
                'Campagnes SMS/Email parents',
                'Inventaire & Bibliothèque',
                'SMS parents (1000/mois)',
                'Mode offline avancé (IndexedDB)',
            ]),
        },
        {
            id: 'plan-gold',
            name: 'Or',
            slug: 'gold',
            priceUSD: 60,
            priceCDF: 150000,
            maxStudents: -1, // illimité
            maxTeachers: -1,
            maxSmsPerMonth: 5000,
            durationDays: 30,
            features: JSON.stringify([
                'Toutes les fonctionnalités Argent',
                'Élèves illimités',
                'Enseignants illimités',
                'Rapports analytiques avancés',
                'Convocations & Annonces',
                'Emploi du temps (timetable)',
                'SMS parents (5000/mois)',
                'Support dédié 24/7',
            ]),
        },
    ];

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { slug: plan.slug },
            update: {
                name: plan.name,
                priceUSD: plan.priceUSD,
                priceCDF: plan.priceCDF,
                maxStudents: plan.maxStudents,
                maxTeachers: plan.maxTeachers,
                maxSmsPerMonth: plan.maxSmsPerMonth,
                durationDays: plan.durationDays,
                features: plan.features,
                isActive: true,
            },
            create: plan,
        });
        console.log(`   ✔ Plan "${plan.name}" (${plan.slug}) — $${plan.priceUSD}/mois`);
    }

    // ── 1. Create School (Required for User) ──────────────────────────────────
    console.log('\n🏫 Création de l\'école / siège social EduGoma360...');

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
            subdomain: 'admin',   // admin.edugoma360.cd
            planId: 'plan-gold',  // Le siège a le plan Or
            trialEndsAt: null,    // Pas de période d'essai pour le siège
        },
    });

    // ── 1b. Active subscription for the default school ────────────────────────
    await prisma.subscription.upsert({
        where: { id: 'sub-school-001' },
        update: {},
        create: {
            id: 'sub-school-001',
            schoolId: school.id,
            planId: 'plan-gold',
            startDate: new Date(),
            endDate: new Date('2099-12-31'),
            status: 'ACTIVE',
            amountPaid: 0,
            currency: 'USD',
            paymentMethod: 'MANUAL',
            notes: 'Abonnement interne — Siège social EduGoma360',
        },
    });

    // ── 2. Create Super Admin ──────────────────────────────────────────────────
    console.log('👑 Création du Super Administrateur de la plateforme...');
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

    const existingPlatformAdmin = await prisma.user.findFirst({
        where: {
            OR: [
                { schoolId: school.id, phone: adminData.phone },
                { phone: adminData.phone },
                { email: adminData.email },
            ],
        },
        orderBy: [
            { isSuperAdmin: 'desc' },
            { updatedAt: 'desc' },
        ],
    });

    const platformAdminData = {
        schoolId: school.id,
        nom: adminData.nom,
        postNom: adminData.postNom,
        prenom: adminData.prenom,
        phone: adminData.phone,
        email: adminData.email,
        role: 'SUPER_ADMIN',
        isSuperAdmin: true,
        passwordHash: hash,
        isActive: true,
        mustChangePassword: false,
    };

    const user = existingPlatformAdmin
        ? await prisma.user.update({
            where: { id: existingPlatformAdmin.id },
            data: platformAdminData,
        })
        : await prisma.user.create({ data: platformAdminData });

    // ── 3. Default Settings ────────────────────────────────────────────────────
    console.log('⚙️  Configuration des paramètres système...');
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

    console.log('\n✅ Seed terminé avec succès !');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📦 Plans SaaS : Essai (0$) | Bronze (15$) | Argent (30$) | Or (60$)');
    console.log(`👤 Super Admin     : ${user.nom} ${user.prenom} [isSuperAdmin=true]`);
    console.log(`📱 Login Téléphone : ${user.phone}`);
    console.log(`📧 Login Email     : ${user.email}`);
    console.log(`🔑 Mot de passe    : ${adminData.password}`);
    console.log(`🌐 Sous-domaine    : ${school.subdomain}.edugoma360.cd`);
    console.log('═══════════════════════════════════════════════════════════\n');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

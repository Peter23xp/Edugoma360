import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...\n');

  // 1. Vérifier si une école existe déjà
  const existingSchool = await prisma.school.findFirst();
  
  if (existingSchool) {
    console.log('⚠️  Une école existe déjà. Seed annulé pour éviter les doublons.');
    console.log('   Pour réinitialiser : npm run db:reset\n');
    return;
  }

  // 2. Créer l'école
  console.log('🏫 Création de l\'école...');
  const school = await prisma.school.create({
    data: {
      name: 'Institut Technique de Goma',
      code: 'ISS001',
      type: 'CONVENTIONNEE',
      conventionReligieuse: 'Catholique',
      numeroAgrement: 'NK/EPSP/2024/001',
      province: 'Nord-Kivu',
      territoire: 'Goma',
      commune: 'Karisimbi',
      adresse: 'Avenue de la Paix, N°12, Quartier Himbi',
      telephone: '+243810000000',
      email: 'contact@itgoma.edu.cd',
      logoUrl: null,
      isConfigured: true
    }
  });
  console.log(`✅ École créée : ${school.name}\n`);

  // 3. Créer le Super Admin
  console.log('👤 Création du Super Admin...');
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@itgoma.edu.cd',
      passwordHash: hashedPassword,
      nom: 'ADMIN',
      postNom: 'SYSTEM',
      prenom: 'Super',
      telephone: '+243810000001',
      role: 'SUPER_ADMIN',
      schoolId: school.id,
      isActive: true
    }
  });
  console.log(`✅ Super Admin créé : ${superAdmin.email}\n`);

  // 4. Créer l'année scolaire
  console.log('📅 Création de l\'année scolaire...');
  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      label: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-07-01'),
      isActive: true
    }
  });
  console.log(`✅ Année scolaire : ${academicYear.label}\n`);

  // 5. Créer les 3 trimestres
  console.log('📆 Création des trimestres...');
  await prisma.term.createMany({
    data: [
      {
        academicYearId: academicYear.id,
        name: 'Trimestre 1',
        number: 1,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-14'),
        examStartDate: new Date('2024-12-05'),
        examEndDate: new Date('2024-12-13'),
        isActive: true
      },
      {
        academicYearId: academicYear.id,
        name: 'Trimestre 2',
        number: 2,
        startDate: new Date('2025-01-06'),
        endDate: new Date('2025-03-28'),
        examStartDate: new Date('2025-03-17'),
        examEndDate: new Date('2025-03-27'),
        isActive: false
      },
      {
        academicYearId: academicYear.id,
        name: 'Trimestre 3',
        number: 3,
        startDate: new Date('2025-04-07'),
        endDate: new Date('2025-06-27'),
        examStartDate: new Date('2025-06-09'),
        examEndDate: new Date('2025-06-20'),
        isActive: false
      }
    ]
  });
  console.log('✅ 3 trimestres créés\n');

  // 6. Afficher les informations de connexion
  console.log('═══════════════════════════════════════════');
  console.log('🎉 SEED TERMINÉ AVEC SUCCÈS !');
  console.log('═══════════════════════════════════════════');
  console.log('\n📝 INFORMATIONS DE CONNEXION :');
  console.log('   URL      : http://localhost:5173');
  console.log('   Email    : admin@itgoma.edu.cd');
  console.log('   Password : Admin123!');
  console.log('\n🏫 ÉCOLE : Institut Technique de Goma');
  console.log('   Code     : ISS001');
  console.log('   Année    : 2024-2025 (Trimestre 1 actif)');
  console.log('\n💡 PROCHAINES ÉTAPES :');
  console.log('   1. npm run dev (démarrer le serveur)');
  console.log('   2. Se connecter avec les identifiants ci-dessus');
  console.log('   3. Utiliser le wizard SCR-004 pour compléter la configuration\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
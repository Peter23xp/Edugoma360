
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Creating Test Super Admin User...');

    // 1. Get or create a school
    let school = await prisma.school.findFirst();
    if (!school) {
        console.log('🏫 No school found. Creating strict default school...');
        school = await prisma.school.create({
            data: {
                id: 'school-test-01',
                name: 'Test School',
                type: 'PRIVE',
                province: 'Nord-Kivu',
                ville: 'Goma',
            },
        });
    } else {
        console.log(`🏫 Using existing school: ${school.name} (${school.id})`);
    }

    // 2. Create the User
    const phone = '+243999999999';
    const email = 'superadmin@test.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        const user = await prisma.user.upsert({
            where: {
                schoolId_phone: {
                    schoolId: school.id,
                    phone: phone,
                }
            },
            update: {
                passwordHash: hashedPassword,
                role: 'SUPER_ADMIN', // Use string directly as Enum might be different in object
                isActive: true,
                nom: 'Super',
                postNom: 'Admin',
                prenom: 'Test',
                email: email
            },
            create: {
                schoolId: school.id,
                nom: 'Super',
                postNom: 'Admin',
                prenom: 'Test',
                phone: phone,
                email: email,
                passwordHash: hashedPassword,
                role: 'SUPER_ADMIN',
                isActive: true,
            },
        });

        console.log('\n✅ User created successfully!');
        console.log('👤 Name: Super Admin Test');
        console.log(`📧 Email: ${email}`);
        console.log(`📱 Phone: ${phone}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`🏫 School ID: ${school.id}`);

    } catch (e) {
        console.error('❌ Error creating user:', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

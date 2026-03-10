import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from './src/config/env';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!user) {
        console.error('No admin found');
        return;
    }
    const token = jwt.sign(
        { id: user.id, role: user.role, schoolId: user.schoolId },
        env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    console.log(token);
}

main().finally(() => prisma.$disconnect());

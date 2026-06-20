import { Request } from 'express';
import prisma from '../../lib/prisma';

export type AuditAction =
    | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
    | 'CREATE' | 'UPDATE' | 'DELETE'
    | 'EXPORT' | 'IMPORT'
    | 'SUSPEND' | 'ACTIVATE' | 'PAYMENT'
    | 'SUBSCRIPTION_UPDATE' | 'PLAN_CREATE' | 'PLAN_UPDATE' | 'PLAN_TOGGLE'
    | 'ADMIN_CREATE' | 'ADMIN_PERMISSIONS_UPDATE' | 'ADMIN_TOGGLE'
    | 'NEW_SCHOOL';

interface AuditInput {
    req?: Request;
    actorId?: string;
    actorRole?: string;
    actorName?: string;
    schoolId?: string;
    schoolName?: string;
    action: AuditAction;
    entity?: string;
    entityId?: string;
    summary: string;
    before?: object;
    after?: object;
}

export async function auditLog(input: AuditInput): Promise<void> {
    try {
        const ip        = input.req ? (input.req.ip ?? input.req.headers['x-forwarded-for'] as string) : undefined;
        const userAgent = input.req?.headers['user-agent'];

        await prisma.auditLog.create({
            data: {
                actorId:    input.actorId   ?? input.req?.user?.userId,
                actorRole:  input.actorRole ?? input.req?.user?.role,
                actorName:  input.actorName,
                schoolId:   input.schoolId,
                schoolName: input.schoolName,
                action:     input.action,
                entity:     input.entity,
                entityId:   input.entityId,
                summary:    input.summary,
                before:     input.before ? JSON.stringify(input.before) : undefined,
                after:      input.after  ? JSON.stringify(input.after)  : undefined,
                ip:         typeof ip === 'string' ? ip : undefined,
                userAgent:  typeof userAgent === 'string' ? userAgent : undefined,
            },
        });
    } catch (err) {
        // Never throw — audit failures must not break business logic
        console.error('[AUDIT LOG ERROR]', err);
    }
}

export async function auditSAAction(
    req: Request,
    action: AuditAction,
    summary: string,
    extra?: { schoolId?: string; schoolName?: string; entity?: string; entityId?: string; before?: object; after?: object },
): Promise<void> {
    const userId = req.user?.userId;
    let actorName: string | undefined;
    if (userId) {
        const u = await prisma.user.findUnique({ where: { id: userId }, select: { nom: true, prenom: true } });
        if (u) actorName = `${u.nom} ${u.prenom ?? ''}`.trim();
    }
    await auditLog({ req, actorName, action, summary, ...extra });
}

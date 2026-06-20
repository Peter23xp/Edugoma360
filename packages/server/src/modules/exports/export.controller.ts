import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import {
    createWorkbook, styleHeader, addTableRows,
    createPDF, pdfHeader, pdfSection, pdfRow, pdfTable,
} from './export.service';
import { auditSAAction } from '../audit/audit.service';

const fmt = (d: any) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const money = (n: number, cur = 'USD') => `${n.toLocaleString('fr-FR')} ${cur}`;

// ── GET /superadmin/exports/schools  (Excel) ──────────────────────────────────
export async function exportSchoolsExcel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const schools = await prisma.school.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                plan: { select: { name: true } },
                subscriptions: { where: { status: { in: ['ACTIVE', 'TRIAL'] } }, orderBy: { createdAt: 'desc' }, take: 1 },
                _count: { select: { students: true, teachers: true } },
            },
        });

        const wb    = createWorkbook();
        const sheet = wb.addWorksheet('Écoles');
        styleHeader(sheet, [
            { header: 'Nom',          key: 'name',         width: 30 },
            { header: 'Sous-domaine', key: 'subdomain',    width: 20 },
            { header: 'Province',     key: 'province',     width: 18 },
            { header: 'Ville',        key: 'ville',        width: 18 },
            { header: 'Plan',         key: 'plan',         width: 14 },
            { header: 'Statut abo',   key: 'status',       width: 14 },
            { header: 'Fin abo',      key: 'endDate',      width: 14 },
            { header: 'Élèves',       key: 'students',     width: 10 },
            { header: 'Profs',        key: 'teachers',     width: 10 },
            { header: 'Inscription',  key: 'createdAt',    width: 14 },
        ]);

        addTableRows(sheet, schools.map(s => ({
            name:      s.name,
            subdomain: s.subdomain ?? '',
            province:  s.province ?? '',
            ville:     s.ville ?? '',
            plan:      s.plan?.name ?? 'Sans plan',
            status:    s.subscriptions[0]?.status ?? 'AUCUN',
            endDate:   fmt(s.subscriptions[0]?.endDate),
            students:  s._count.students,
            teachers:  s._count.teachers,
            createdAt: fmt(s.createdAt),
        })));

        auditSAAction(req, 'EXPORT', 'Export Excel — liste des écoles').catch(() => {});
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="ecoles-${Date.now()}.xlsx"`);
        await wb.xlsx.write(res);
        res.end();
    } catch (error) { next(error); }
}

// ── GET /superadmin/exports/subscriptions  (Excel) ───────────────────────────
export async function exportSubscriptionsExcel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const subs = await prisma.subscription.findMany({
            orderBy: { createdAt: 'desc' },
            include: { school: { select: { name: true, subdomain: true } } },
        });

        const planIds = [...new Set(subs.map(s => s.planId).filter(Boolean))] as string[];
        const plans   = await prisma.subscriptionPlan.findMany({ where: { id: { in: planIds } }, select: { id: true, name: true } });
        const planMap = new Map(plans.map(p => [p.id, p.name]));

        const wb    = createWorkbook();
        const sheet = wb.addWorksheet('Abonnements');
        styleHeader(sheet, [
            { header: 'École',         key: 'school',    width: 30 },
            { header: 'Sous-domaine',  key: 'subdomain', width: 20 },
            { header: 'Plan',          key: 'plan',      width: 14 },
            { header: 'Statut',        key: 'status',    width: 14 },
            { header: 'Début',         key: 'start',     width: 14 },
            { header: 'Fin',           key: 'end',       width: 14 },
            { header: 'Montant',       key: 'amount',    width: 14 },
            { header: 'Devise',        key: 'currency',  width: 10 },
            { header: 'Méthode',       key: 'method',    width: 14 },
            { header: 'Référence',     key: 'ref',       width: 24 },
            { header: 'Créé le',       key: 'createdAt', width: 14 },
        ]);

        addTableRows(sheet, subs.map(s => ({
            school:    s.school?.name ?? s.schoolId,
            subdomain: s.school?.subdomain ?? '',
            plan:      s.planId ? (planMap.get(s.planId) ?? 'Inconnu') : 'Sans plan',
            status:    s.status,
            start:     fmt(s.startDate),
            end:       fmt(s.endDate),
            amount:    s.amountPaid,
            currency:  s.currency,
            method:    s.paymentMethod ?? '',
            ref:       s.paymentRef ?? '',
            createdAt: fmt(s.createdAt),
        })));

        auditSAAction(req, 'EXPORT', 'Export Excel — historique abonnements').catch(() => {});
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="abonnements-${Date.now()}.xlsx"`);
        await wb.xlsx.write(res);
        res.end();
    } catch (error) { next(error); }
}

// ── GET /superadmin/exports/sms  (Excel) ─────────────────────────────────────
export async function exportSmsExcel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const month      = req.query.month as string | undefined;
        const monthStart = month ? new Date(month + '-01') : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthEnd   = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);

        const usage = await prisma.sMSCampaign.groupBy({
            by: ['schoolId'],
            _sum: { sentSMS: true, cost: true },
            _count: { _all: true },
            where: { createdAt: { gte: monthStart, lte: monthEnd } },
            orderBy: { _sum: { sentSMS: 'desc' } },
        });

        const ids     = usage.map(u => u.schoolId);
        const schools = await prisma.school.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, plan: { select: { name: true, maxSmsPerMonth: true } } },
        });
        const sMap = new Map(schools.map(s => [s.id, s]));

        const wb    = createWorkbook();
        const sheet = wb.addWorksheet('Usage SMS');
        styleHeader(sheet, [
            { header: 'École',          key: 'school',    width: 30 },
            { header: 'Plan',           key: 'plan',      width: 14 },
            { header: 'SMS envoyés',    key: 'sent',      width: 14 },
            { header: 'Quota mensuel',  key: 'quota',     width: 14 },
            { header: '% utilisé',      key: 'pct',       width: 12 },
            { header: 'Campagnes',      key: 'campaigns', width: 12 },
            { header: 'Coût (USD)',     key: 'cost',      width: 14 },
        ]);

        addTableRows(sheet, usage.map(u => {
            const school = sMap.get(u.schoolId);
            const quota  = school?.plan?.maxSmsPerMonth ?? 0;
            const sent   = u._sum.sentSMS ?? 0;
            return {
                school:    school?.name ?? u.schoolId,
                plan:      school?.plan?.name ?? 'Sans plan',
                sent,
                quota:     quota === 0 ? 'Illimité' : quota,
                pct:       quota > 0 ? `${Math.round((sent / quota) * 100)}%` : '—',
                campaigns: u._count._all,
                cost:      (u._sum.cost ?? 0).toFixed(2),
            };
        }));

        auditSAAction(req, 'EXPORT', `Export Excel — usage SMS ${monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`).catch(() => {});
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="sms-${monthStart.toISOString().slice(0, 7)}.xlsx"`);
        await wb.xlsx.write(res);
        res.end();
    } catch (error) { next(error); }
}

// ── GET /superadmin/exports/financial  (PDF + Excel) ─────────────────────────
export async function exportFinancialPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const month      = req.query.month as string | undefined;
        const monthStart = month ? new Date(month + '-01') : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthEnd   = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
        const monthLabel = monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        const [activeSubs, mrr, trialCount, newSchools] = await Promise.all([
            prisma.subscription.findMany({
                where: { status: 'ACTIVE', createdAt: { gte: monthStart, lte: monthEnd } },
                include: { school: { select: { name: true } } },
            }),
            prisma.subscription.aggregate({
                _sum: { amountPaid: true },
                where: { status: 'ACTIVE', createdAt: { gte: monthStart, lte: monthEnd } },
            }),
            prisma.subscription.count({ where: { status: 'TRIAL', endDate: { gte: new Date() } } }),
            prisma.school.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
        ]);

        const totalRevenue = mrr._sum.amountPaid ?? 0;
        const { doc, stream } = createPDF();

        pdfHeader(doc, `Rapport Financier — ${monthLabel}`, `Généré le ${new Date().toLocaleDateString('fr-FR')}`);

        pdfSection(doc, 'Résumé mensuel');
        pdfRow(doc, 'Revenu mensuel (MRR)',    money(totalRevenue));
        pdfRow(doc, 'Abonnements activés',     activeSubs.length);
        pdfRow(doc, 'Nouvelles écoles',        newSchools);
        pdfRow(doc, 'Écoles en essai actives', trialCount);

        pdfSection(doc, 'Détail des paiements');
        pdfTable(doc,
            ['École', 'Montant', 'Devise', 'Méthode', 'Date'],
            activeSubs.map(s => [
                s.school?.name ?? s.schoolId,
                s.amountPaid.toLocaleString('fr-FR'),
                s.currency,
                s.paymentMethod ?? 'MANUAL',
                fmt(s.createdAt),
            ]),
            [200, 80, 60, 80, 80],
        );

        doc.end();
        auditSAAction(req, 'EXPORT', `Export PDF — rapport financier ${monthLabel}`).catch(() => {});
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="financier-${monthStart.toISOString().slice(0, 7)}.pdf"`);
        stream.pipe(res);
    } catch (error) { next(error); }
}

// ── GET /superadmin/exports/school/:id  (PDF fiche école) ────────────────────
export async function exportSchoolPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { id } = req.params;
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const [school, smsThisMonth] = await Promise.all([
            prisma.school.findUnique({
                where: { id },
                include: {
                    plan: true,
                    subscriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
                    _count: { select: { students: true, teachers: true, users: true } },
                },
            }),
            prisma.sMSCampaign.aggregate({
                _sum: { sentSMS: true },
                where: { schoolId: id, createdAt: { gte: monthStart } },
            }),
        ]);

        if (!school) { res.status(404).json({ error: 'École introuvable' }); return; }

        const { doc, stream } = createPDF();
        pdfHeader(doc, `Fiche École — ${school.name}`, `Généré le ${new Date().toLocaleDateString('fr-FR')}`);

        pdfSection(doc, 'Informations générales');
        pdfRow(doc, 'Nom officiel',    school.nomOfficiel ?? school.name);
        pdfRow(doc, 'Sous-domaine',    school.subdomain ?? '—');
        pdfRow(doc, 'Province',        school.province ?? '—');
        pdfRow(doc, 'Ville',           school.ville ?? '—');
        pdfRow(doc, 'Téléphone',       school.telephonePrincipal ?? school.telephone ?? '—');
        pdfRow(doc, 'Email',           school.email ?? '—');

        pdfSection(doc, 'Abonnement actuel');
        pdfRow(doc, 'Plan',          school.plan?.name ?? 'Aucun');
        pdfRow(doc, 'Max élèves',    school.plan?.maxStudents === -1 ? 'Illimité' : (school.plan?.maxStudents ?? '—'));
        pdfRow(doc, 'Max SMS/mois',  school.plan?.maxSmsPerMonth ?? '—');

        const activeSub = school.subscriptions.find(s => ['ACTIVE', 'TRIAL'].includes(s.status));
        pdfRow(doc, 'Statut',        activeSub?.status ?? 'AUCUN');
        pdfRow(doc, 'Expire le',     fmt(activeSub?.endDate));

        pdfSection(doc, 'Usage');
        pdfRow(doc, 'Élèves actifs', school._count.students);
        pdfRow(doc, 'Enseignants',   school._count.teachers);
        pdfRow(doc, 'Utilisateurs',  school._count.users);
        pdfRow(doc, 'SMS ce mois',   smsThisMonth._sum.sentSMS ?? 0);

        if (school.subscriptions.length > 0) {
            pdfSection(doc, 'Historique abonnements (5 derniers)');
            pdfTable(doc,
                ['Statut', 'Plan', 'Début', 'Fin', 'Montant', 'Méthode'],
                school.subscriptions.map(s => [
                    s.status,
                    s.planId ?? '—',
                    fmt(s.startDate),
                    fmt(s.endDate),
                    money(s.amountPaid, s.currency),
                    s.paymentMethod ?? '—',
                ]),
            );
        }

        doc.end();
        auditSAAction(req, 'EXPORT', `Export PDF — fiche école ${school.name}`, { schoolId: id, entity: 'School', entityId: id }).catch(() => {});
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ecole-${school.subdomain ?? id}.pdf"`);
        stream.pipe(res);
    } catch (error) { next(error); }
}

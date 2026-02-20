# 🔧 EDUGOMA 360 — CORRECTIONS MODULE ÉLÈVES
## Plan d'action pour validation complète | Basé sur audit du 18/02/2026

> **CONTEXTE :**
> Le module Élèves est fonctionnel à 85% mais présente 12 corrections critiques
> et importantes qui bloquent la validation complète.
> Ce prompt corrige systématiquement chaque point pour atteindre ✅ VALIDÉ.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 1 — CORRECTIONS CRITIQUES (BLOQUEURS PRODUCTION)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
OBJECTIF
--------
Corriger les 5 erreurs TypeScript bloquantes qui empêchent la compilation
et le déploiement du module.

PRIORITÉ : 🔴 CRITIQUE — À faire EN PREMIER
```

---

## CORRECTION 1 — Installer les dépendances NPM manquantes

```bash
# Exécuter dans packages/server
npm install jsbarcode canvas handlebars pdf-lib

# Types TypeScript
npm install -D @types/jsbarcode @types/handlebars
```

**Vérification :**
```bash
npm list jsbarcode canvas handlebars pdf-lib
# Toutes les dépendances doivent apparaître installées
```

---

## CORRECTION 2 — Corriger l'import Prisma

**Fichier :** `packages/server/src/modules/students/students.pdf.service.ts`

**Ligne 9 — AVANT :**
```typescript
import { prisma } from '../../lib/prisma';
```

**APRÈS :**
```typescript
import prisma from '../../lib/prisma';
```

**Explication :** Le client Prisma est exporté par défaut, pas comme named export.

---

## CORRECTION 3 — Corriger l'erreur TypeScript StudentFormPage

**Fichier :** `packages/client/src/pages/students/StudentFormPage.tsx`

**Ligne ~118 — AVANT :**
```typescript
<ProgressBar 
  currentStep={currentStep} 
  steps={['Identité', 'Scolarité', 'Contacts', 'Confirmation']} 
/>
```

**APRÈS :**
```typescript
<ProgressBar 
  currentStep={currentStep} 
  steps={[
    { id: 1, label: 'Identité' },
    { id: 2, label: 'Scolarité' },
    { id: 3, label: 'Contacts' },
    { id: 4, label: 'Confirmation' }
  ]} 
/>
```

**Explication :** `ProgressBar` attend un tableau de `{ id: number; label: string }[]`, pas `string[]`.

---

## CORRECTION 4 — Supprimer les imports inutilisés

### Fichier 1 : `packages/client/src/hooks/useStudentForm.ts`

**Lignes 2-3 — SUPPRIMER :**
```typescript
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
```

**Garder seulement :**
```typescript
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// ... autres imports nécessaires
```

---

### Fichier 2 : `packages/client/src/lib/excel/parseStudents.ts`

**Lignes 142 et 245 — AVANT :**
```typescript
function validateRow(data: any, rowNum: number): string[] {
  // ... code utilise rowNum dans les messages d'erreur
}
```

**Si `rowNum` n'est vraiment pas utilisé, le supprimer :**
```typescript
function validateRow(data: any): string[] {
  // ... code
}
```

**Ou si nécessaire pour les messages, l'utiliser :**
```typescript
if (!data.nom || data.nom.length < 2) {
  errors.push(`Ligne ${rowNum}: Nom invalide`);
}
```

---

### Fichier 3 : `packages/client/src/components/students/import/PreviewTable.tsx`

**Ligne 28 — SUPPRIMER :**
```typescript
const getStatusIcon = (status: string) => {
  // ... code jamais appelé
};
```

---

### Fichier 4 : `packages/client/src/pages/students/StudentsImportPage.tsx`

**Ligne 26 — AVANT :**
```typescript
const [file, setFile] = useState<File | null>(null);
```

**Si vraiment inutilisé, supprimer. Sinon, ajouter le préfixe underscore :**
```typescript
const [_file, setFile] = useState<File | null>(null);
```

---

## CORRECTION 5 — Typer le paramètre `page` (pdf.service)

**Fichier :** `packages/server/src/modules/students/students.pdf.service.ts`

**Ligne 187 — AVANT :**
```typescript
const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
pages.forEach(page => mergedPdf.addPage(page));
```

**APRÈS :**
```typescript
import { PDFPage } from 'pdf-lib';

const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
pages.forEach((page: PDFPage) => mergedPdf.addPage(page));
```

---

## ✅ VÉRIFICATION PARTIE 1

Exécuter après toutes les corrections :

```bash
# Client
cd packages/client && npm run type-check
# Attendu : 0 erreur liée au module students

# Server
cd packages/server && npm run type-check
# Attendu : 0 erreur liée au module students
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PARTIE 2 — CORRECTIONS IMPORTANTES (AVANT MVP)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
OBJECTIF
--------
Compléter les fonctionnalités manquantes qui sont attendues dans les prompts
mais pas encore implémentées.

PRIORITÉ : 🟡 IMPORTANTE — À faire AVANT le MVP
```

---

## CORRECTION 6 — Créer students.import.service.ts (séparation responsabilités)

**Fichier à créer :** `packages/server/src/modules/students/students.import.service.ts`

**Contenu :**

```typescript
import ExcelJS from 'exceljs';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { generateMatricule } from '@edugoma360/shared/utils/matricule';
import { StudentStatus } from '@prisma/client';

// ── SCHEMAS ───────────────────────────────────────────────────

const importRowSchema = z.object({
  nom: z.string().min(2).transform(s => s.toUpperCase()),
  postNom: z.string().min(2).transform(s => s.toUpperCase()),
  prenom: z.string().optional(),
  sexe: z.enum(['M', 'F']),
  dateNaissance: z.string(), // Format JJ/MM/AAAA
  lieuNaissance: z.string().min(2),
  nationalite: z.string().default('Congolaise'),
  classe: z.string(), // Nom exact de la classe
  statut: z.nativeEnum(StudentStatus),
  ecoleOrigine: z.string().optional(),
  resultatTenasosp: z.number().min(0).max(100).optional(),
  nomPere: z.string().optional(),
  telPere: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/).optional(),
  nomMere: z.string().optional(),
  telMere: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/).optional(),
  nomTuteur: z.string().optional(),
  telTuteur: z.string().regex(/^\+243(81|82|97|98|89)\d{7}$/),
  tuteurPrincipal: z.enum(['pere', 'mere', 'tuteur']).default('tuteur')
});

type ImportRow = z.infer<typeof importRowSchema>;

interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
  students: any[];
}

// ── TEMPLATE EXCEL ────────────────────────────────────────────

export async function generateImportTemplate(schoolId: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Feuille 1 : Élèves
  const sheet = workbook.addWorksheet('Élèves');
  
  // En-têtes
  sheet.columns = [
    { header: 'nom *', key: 'nom', width: 20 },
    { header: 'postNom *', key: 'postNom', width: 20 },
    { header: 'prenom', key: 'prenom', width: 20 },
    { header: 'sexe *', key: 'sexe', width: 5 },
    { header: 'dateNaissance *', key: 'dateNaissance', width: 15 },
    { header: 'lieuNaissance *', key: 'lieuNaissance', width: 25 },
    { header: 'nationalite *', key: 'nationalite', width: 15 },
    { header: 'classe *', key: 'classe', width: 10 },
    { header: 'statut *', key: 'statut', width: 15 },
    { header: 'ecoleOrigine', key: 'ecoleOrigine', width: 30 },
    { header: 'resultatTenasosp', key: 'resultatTenasosp', width: 15 },
    { header: 'nomPere', key: 'nomPere', width: 25 },
    { header: 'telPere', key: 'telPere', width: 15 },
    { header: 'nomMere', key: 'nomMere', width: 25 },
    { header: 'telMere', key: 'telMere', width: 15 },
    { header: 'nomTuteur', key: 'nomTuteur', width: 25 },
    { header: 'telTuteur *', key: 'telTuteur', width: 15 },
    { header: 'tuteurPrincipal *', key: 'tuteurPrincipal', width: 15 }
  ];
  
  // Formater les en-têtes
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E7D32' }
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  
  // Exemple ligne 2 (valide)
  sheet.addRow({
    nom: 'AMISI',
    postNom: 'KALOMBO',
    prenom: 'Jean-Baptiste',
    sexe: 'M',
    dateNaissance: '12/03/2008',
    lieuNaissance: 'Goma, Nord-Kivu',
    nationalite: 'Congolaise',
    classe: '4ScA',
    statut: 'NOUVEAU',
    ecoleOrigine: '',
    resultatTenasosp: 67,
    nomPere: 'AMISI PIERRE',
    telPere: '+243810000000',
    nomMere: 'KAHINDO ALICE',
    telMere: '+243820000000',
    nomTuteur: '',
    telTuteur: '+243810000000',
    tuteurPrincipal: 'pere'
  });
  
  // Feuille 2 : Instructions
  const instructions = workbook.addWorksheet('Instructions');
  instructions.addRow(['GUIDE D\'IMPORTATION - EDUGOMA 360']);
  instructions.addRow([]);
  instructions.addRow(['1. Remplissez une ligne par élève dans la feuille "Élèves"']);
  instructions.addRow(['2. Les colonnes marquées * sont obligatoires']);
  instructions.addRow(['3. Formats acceptés:']);
  instructions.addRow(['   - Date: JJ/MM/AAAA (ex: 12/03/2008)']);
  instructions.addRow(['   - Téléphone: +243XXXXXXXXX (Airtel: 81/82, Vodacom: 97/98)']);
  instructions.addRow(['   - Sexe: M ou F']);
  instructions.addRow(['4. Sauvegardez et importez le fichier']);
  
  return await workbook.xlsx.writeBuffer() as Buffer;
}

// ── IMPORT PRINCIPAL ──────────────────────────────────────────

export async function importStudentsFromExcel(
  fileBuffer: Buffer,
  schoolId: string
): Promise<ImportResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    throw new Error('Feuille "Élèves" introuvable');
  }
  
  const rows: any[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip headers
    rows.push({ rowNumber, data: row.values });
  });
  
  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: [],
    students: []
  };
  
  // Transaction pour tout ou rien
  await prisma.$transaction(async (tx) => {
    for (const { rowNumber, data } of rows) {
      try {
        // Parse la ligne
        const parsed = parseRowData(data);
        const validated = importRowSchema.parse(parsed);
        
        // Vérifier doublon
        const existing = await tx.student.findFirst({
          where: {
            schoolId,
            nom: validated.nom,
            postNom: validated.postNom,
            dateNaissance: parseDate(validated.dateNaissance)
          }
        });
        
        if (existing) {
          result.skipped++;
          continue;
        }
        
        // Trouver la classe
        const classe = await tx.class.findFirst({
          where: { schoolId, name: validated.classe }
        });
        
        if (!classe) {
          result.errors.push({
            row: rowNumber,
            message: `Classe "${validated.classe}" introuvable`
          });
          continue;
        }
        
        // Générer matricule
        const school = await tx.school.findUnique({ where: { id: schoolId } });
        const lastStudent = await tx.student.findFirst({
          where: { schoolId },
          orderBy: { createdAt: 'desc' }
        });
        
        const sequence = lastStudent 
          ? parseInt(lastStudent.matricule.split('-')[3]) + 1
          : 1;
        
        const matricule = generateMatricule(
          getProvinceCode(school!.province),
          getCityCode(school!.ville),
          school!.code || 'ISS001',
          sequence
        );
        
        // Créer l'élève
        const student = await tx.student.create({
          data: {
            schoolId,
            matricule,
            nom: validated.nom,
            postNom: validated.postNom,
            prenom: validated.prenom,
            sexe: validated.sexe,
            dateNaissance: parseDate(validated.dateNaissance),
            lieuNaissance: validated.lieuNaissance,
            nationalite: validated.nationalite,
            statut: validated.statut,
            nomPere: validated.nomPere,
            telPere: validated.telPere,
            nomMere: validated.nomMere,
            telMere: validated.telMere,
            nomTuteur: validated.nomTuteur,
            telTuteur: validated.telTuteur,
            enrollments: {
              create: {
                classId: classe.id,
                academicYearId: await getCurrentAcademicYearId(tx, schoolId),
                ecoleOrigine: validated.ecoleOrigine,
                resultatTenasosp: validated.resultatTenasosp
              }
            }
          }
        });
        
        result.imported++;
        result.students.push(student);
        
      } catch (error: any) {
        result.errors.push({
          row: rowNumber,
          message: error.message
        });
      }
    }
  });
  
  return result;
}

// ── HELPERS ───────────────────────────────────────────────────

function parseRowData(values: any): any {
  return {
    nom: values[1],
    postNom: values[2],
    prenom: values[3],
    sexe: values[4],
    dateNaissance: values[5],
    lieuNaissance: values[6],
    nationalite: values[7] || 'Congolaise',
    classe: values[8],
    statut: values[9],
    ecoleOrigine: values[10],
    resultatTenasosp: values[11] ? Number(values[11]) : undefined,
    nomPere: values[12],
    telPere: values[13],
    nomMere: values[14],
    telMere: values[15],
    nomTuteur: values[16],
    telTuteur: values[17],
    tuteurPrincipal: values[18] || 'tuteur'
  };
}

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function getProvinceCode(province: string): string {
  const codes: Record<string, string> = {
    'Nord-Kivu': 'NK',
    'Sud-Kivu': 'SK',
    'Kinshasa': 'KIN'
    // ... autres provinces
  };
  return codes[province] || 'XX';
}

function getCityCode(ville: string): string {
  const codes: Record<string, string> = {
    'Goma': 'GOM',
    'Bukavu': 'BKV',
    'Kinshasa': 'KIN'
    // ... autres villes
  };
  return codes[ville] || 'XXX';
}

async function getCurrentAcademicYearId(tx: any, schoolId: string): Promise<string> {
  const year = await tx.academicYear.findFirst({
    where: { schoolId, isActive: true }
  });
  
  if (!year) {
    throw new Error('Aucune année scolaire active');
  }
  
  return year.id;
}
```

**Ensuite, modifier `students.service.ts` pour utiliser ce service :**

```typescript
// Dans students.service.ts
import { importStudentsFromExcel, generateImportTemplate } from './students.import.service';

// Supprimer les fonctions importStudents et getImportTemplate
// Les remplacer par des appels directs :

export const getImportTemplate = generateImportTemplate;
export const importStudents = importStudentsFromExcel;
```

---

## CORRECTION 7 — Ajouter le seed des 30 élèves

**Fichier :** `packages/server/prisma/seed.ts`

**Ajouter après la création de l'école et des classes :**

```typescript
// Seed 30 élèves de démonstration
console.log('🎓 Seeding students...');

const studentData = [
  { nom: 'AMISI', postNom: 'KALOMBO', prenom: 'Jean-Baptiste', sexe: 'M', date: '2008-03-12', classe: '4ScA' },
  { nom: 'BAHATI', postNom: 'MARIE', prenom: 'Claire', sexe: 'F', date: '2007-05-18', classe: '5PédB' },
  { nom: 'CIZA', postNom: 'PIERRE', prenom: null, sexe: 'M', date: '2009-11-03', classe: 'TC-1A' },
  { nom: 'DUSABE', postNom: 'ALICE', prenom: 'Yvette', sexe: 'F', date: '2008-07-22', classe: '4ScA' },
  { nom: 'FURAHA', postNom: 'JEAN', prenom: 'Emmanuel', sexe: 'M', date: '2006-01-15', classe: '6ScA' },
  // ... ajouter 25 autres élèves
];

for (let i = 0; i < studentData.length; i++) {
  const data = studentData[i];
  const classe = await prisma.class.findFirst({
    where: { schoolId: school.id, name: data.classe }
  });
  
  if (!classe) continue;
  
  await prisma.student.create({
    data: {
      schoolId: school.id,
      matricule: `NK-GOM-ISS001-${String(i + 1).padStart(4, '0')}`,
      nom: data.nom,
      postNom: data.postNom,
      prenom: data.prenom,
      sexe: data.sexe as any,
      dateNaissance: new Date(data.date),
      lieuNaissance: 'Goma, Nord-Kivu',
      nationalite: 'Congolaise',
      statut: 'NOUVEAU',
      telTuteur: `+24381${String(i).padStart(7, '0')}`,
      enrollments: {
        create: {
          classId: classe.id,
          academicYearId: academicYear.id
        }
      }
    }
  });
}

console.log('✅ 30 students created');
```

---

## CORRECTION 8 — Implémenter badge retard paiement

**Fichier :** `packages/client/src/components/students/StudentHeader.tsx`

**AVANT (ligne ~28) :**
```typescript
const hasPaymentDue = false; // TODO: implement
```

**APRÈS :**
```typescript
const { data: paymentSummary } = useQuery({
  queryKey: ['payment-summary', student.id],
  queryFn: () => api.get(`/api/payments/summary/${student.id}`),
  enabled: !!student.id
});

const hasPaymentDue = (paymentSummary?.remaining || 0) > 0;
const amountDue = paymentSummary?.remaining || 0;
```

**Et modifier l'affichage :**
```tsx
{hasPaymentDue && (
  <Badge variant="destructive" className="gap-1">
    <AlertCircle className="h-3 w-3" />
    Solde dû : {amountDue.toLocaleString('fr-CD')} FC
  </Badge>
)}
```

**Backend — créer la route :**
```typescript
// students.routes.ts
router.get(
  '/payment-summary/:id',
  requirePermission('students:read'),
  async (req, res) => {
    const { id } = req.params;
    
    const payments = await prisma.payment.findMany({
      where: { studentId: id }
    });
    
    const expected = payments.reduce((sum, p) => sum + p.amountDue, 0);
    const paid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    
    res.json({
      expected,
      paid,
      remaining: expected - paid
    });
  }
);
```

---

## CORRECTION 9 — Toast avec matricule après création

**Fichier :** `packages/client/src/pages/students/StudentFormPage.tsx`

**Dans la mutation onSuccess :**

```typescript
const createMutation = useMutation({
  mutationFn: (data: FormData) => api.post('/api/students', data),
  onSuccess: (response) => {
    toast({
      title: "✅ Élève inscrit avec succès !",
      description: `Matricule : ${response.data.student.matricule}`,
      variant: "default"
    });
    
    // Rediriger vers la fiche de l'élève
    navigate(`/students/${response.data.student.id}`);
  }
});
```

---

## CORRECTION 10 — Redirection vers fiche détail après création

Déjà corrigé dans CORRECTION 9 ci-dessus avec :
```typescript
navigate(`/students/${response.data.student.id}`);
```

---

## CORRECTION 11 — SMS bienvenue après création

**Fichier :** `packages/server/src/modules/students/students.service.ts`

**Dans la méthode `createStudent`, après la création :**

```typescript
// Après avoir créé l'élève
const student = await prisma.student.create({ ... });

// Envoyer SMS de bienvenue
const phoneNumber = student.telTuteur;
const message = `EduGoma360: Bienvenue ${student.nom} ${student.postNom} ! Matricule: ${student.matricule}. Classe: ${classe.name}.`;

await sendSMS(phoneNumber, message, 'fr');

return student;
```

**Créer le helper `sendSMS` dans `lib/sms.ts` :**

```typescript
import axios from 'axios';

export async function sendSMS(
  to: string,
  message: string,
  language: 'fr' | 'sw' = 'fr'
): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SMS Mock] To: ${to}, Message: ${message}`);
    return;
  }
  
  try {
    await axios.post('https://api.africastalking.com/version1/messaging', {
      username: process.env.AT_USERNAME,
      to,
      message,
      from: process.env.AT_SENDER_ID || 'EduGoma360'
    }, {
      headers: {
        'apiKey': process.env.AT_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    // Logger dans la base
    await prisma.smsLog.create({
      data: {
        schoolId: '...', // À passer en paramètre
        recipient: to,
        message,
        language,
        status: 'SENT',
        provider: 'africas_talking'
      }
    });
  } catch (error) {
    console.error('[SMS Error]', error);
    // Ne pas bloquer la création de l'élève si SMS échoue
  }
}
```

---

## CORRECTION 12 — Ajouter REDIS_URL dans .env.example

**Fichier :** `packages/server/.env.example`

**Ajouter :**
```env
# Cache Redis (pour cartes PDF)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
```

**Et dans `packages/server/src/lib/redis.ts` :**

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3
});

export default redis;
```

---

## ✅ VÉRIFICATION PARTIE 2

```bash
# Vérifier que tout compile
npm run type-check

# Vérifier que le seed fonctionne
npm run db:seed

# Tester l'import Excel
# Uploader le fichier template généré et vérifier qu'il s'importe

# Tester la création d'élève
# Vérifier que le toast affiche le matricule ET redirige vers /students/:id
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CHECKLIST FINALE DE VALIDATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Après avoir appliqué toutes les corrections :

## TypeScript
- [ ] `npm run type-check` client → 0 erreur
- [ ] `npm run type-check` server → 0 erreur

## Fonctionnalités
- [ ] Liste élèves charge avec 30 élèves seed
- [ ] Filtres fonctionnent
- [ ] Création élève → toast avec matricule → redirection
- [ ] SMS envoyé (vérifier logs)
- [ ] Badge retard paiement s'affiche
- [ ] Import Excel fonctionne
- [ ] Carte PDF se génère

## Build
- [ ] `npm run build` réussit sans erreur

## Résultat attendu
✅ MODULE ÉLÈVES VALIDÉ POUR PRODUCTION

---

*EduGoma 360 — Corrections Module Élèves — Goma, RDC — © 2025*

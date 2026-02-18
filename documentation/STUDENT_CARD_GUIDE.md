# 🎴 Carte d'élève PDF - Guide complet

## Vue d'ensemble

La génération de carte d'élève permet de créer des cartes d'identité officielles au format PDF imprimable. Les cartes respectent le format ID standard (85.6mm × 54mm) pour impression recto-verso.

## Accès

**Endpoint** : `GET /api/students/:id/card`  
**Rôle minimum** : SECRETAIRE

## Paramètres de requête

### Query parameters

- **format** (optionnel) : `pdf` | `png`
  - Par défaut : `pdf`
  - Format de sortie du fichier

- **side** (optionnel) : `front` | `back` | `both`
  - Par défaut : `both`
  - Côté(s) à générer

### Exemples d'URLs

```
# Carte complète recto-verso en PDF
GET /api/students/abc-123/card

# Recto uniquement en PDF
GET /api/students/abc-123/card?side=front

# Verso uniquement en PNG
GET /api/students/abc-123/card?format=png&side=back

# Recto-verso en PNG (2 pages)
GET /api/students/abc-123/card?format=png&side=both
```

## Format de la carte

### Dimensions

Format carte ID standard (ISO/IEC 7810 ID-1) :
- **Largeur** : 85.6 mm (3.370 inches)
- **Hauteur** : 54.0 mm (2.125 inches)
- **Ratio** : 1.586:1

Conversion en pixels (300 DPI pour impression) :
- **Largeur** : 1011px
- **Hauteur** : 638px

Marges internes : 4mm sur tous les bords

### Recto de la carte

```
┌─────────────────────────────────────────────────────────┐
│ [LOGO]              INSTITUT TECHNIQUE DE GOMA          │
│                     Province du Nord-Kivu               │
│                                                         │
│ ┌────────┐  AMISI KALOMBO                               │
│ │ PHOTO  │  Jean-Baptiste                               │
│ │ 120x   │                                              │
│ │ 150px  │  Matricule : NK-GOM-ISS001-0234              │
│ └────────┘  Classe : 4ème Scientifique A                │
│                                                         │
│                       [CODE-BARRES]                      │
│              Année scolaire : 2024-2025                 │
└─────────────────────────────────────────────────────────┘
```

**Éléments affichés** :
- Logo de l'école (en haut à gauche)
- Nom de l'école (centré)
- Province (sous le nom)
- Photo de l'élève (120x150px)
- Nom complet (NOM POST-NOM en majuscules)
- Prénom (en minuscules avec capitale)
- Matricule (police monospace)
- Classe actuelle
- Date de naissance
- Code-barres (encode le matricule)
- Année scolaire

### Verso de la carte

```
┌─────────────────────────────────────────────────────────┐
│ CARTE D'ÉLÈVE OFFICIELLE                                │
│                                                         │
│ En cas de perte, veuillez retourner à :                 │
│                                                         │
│ INSTITUT TECHNIQUE DE GOMA                              │
│ Avenue de la Paix, N°12                                 │
│ Goma, Nord-Kivu                                         │
│ Tél : +243 810 000 000                                  │
│                                                         │
│ ─────────────────────────────────────────────────       │
│                                                         │
│ Cette carte est valable pour l'année scolaire          │
│ 2024-2025 uniquement.                                   │
│                                                         │
│ [Signature du Préfet]         [CACHET OFFICIEL]        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Éléments affichés** :
- Titre "Carte d'Élève Officielle"
- Informations de contact de l'école
- Adresse complète
- Téléphone
- Validité (année scolaire)
- Zone de signature du Préfet
- Zone pour cachet officiel

## Code-barres

### Format
- **Type** : CODE128
- **Contenu** : Matricule de l'élève
- **Dimensions** : 600x100px
- **Couleurs** : Noir sur blanc
- **Affichage** : Sans texte sous le code

### Exemple
```
Matricule : NK-GOM-ISS001-0234
Code-barres : [|||||| |||| |||||| ||]
```

## Réponse API

### Headers

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="Carte_NK-GOM-ISS001-0234.pdf"
```

### Body

Binaire (PDF ou PNG selon le format demandé)

### Codes d'erreur

| Code | Erreur | Description |
|------|--------|-------------|
| 404 | STUDENT_NOT_FOUND | Élève introuvable |
| 404 | NO_ENROLLMENT | Aucune inscription active |
| 500 | PDF_GENERATION_FAILED | Erreur lors de la génération |
| 500 | TEMPLATE_NOT_FOUND | Template HTML manquant |

## Utilisation depuis le frontend

### Téléchargement direct

```typescript
async function downloadStudentCard(studentId: string) {
  try {
    const response = await api.get(`/students/${studentId}/card`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Carte_${studentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success('Carte téléchargée');
  } catch (error) {
    toast.error('Erreur lors du téléchargement');
  }
}
```

### Prévisualisation dans un modal

```typescript
async function previewStudentCard(studentId: string) {
  try {
    const response = await api.get(`/students/${studentId}/card`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Open in new window
    window.open(url, '_blank');
  } catch (error) {
    toast.error('Erreur lors de la prévisualisation');
  }
}
```

### Bouton dans StudentDetailPage

```typescript
<button
  onClick={() => downloadStudentCard(student.id)}
  className="flex items-center gap-2 px-4 py-2 bg-primary text-white 
             rounded-lg hover:bg-primary-dark"
>
  <CreditCard size={16} />
  Générer carte d'élève
</button>
```

## Impression physique

### Matériel recommandé

#### Imprimantes
- **Canon PIXMA iP7250** : Accepte cartes PVC
- **Evolis Primacy** : Imprimante dédiée cartes ID
- **Zebra ZC300** : Imprimante cartes professionnelle

#### Support d'impression
- **Cartes PVC blanches** : 85.6×54mm pré-découpées
- **Grammage** : 0.76mm d'épaisseur
- **Finition** : Brillante ou mate

### Paramètres d'impression

```
Qualité : Haute (300 DPI minimum)
Support : "Carte / Épais"
Mode : Recto-verso (si imprimante capable)
Marges : 0mm (borderless)
Orientation : Paysage
```

### Alternative économique

1. **Imprimer sur papier cartonné**
   - Grammage : 300g/m²
   - Format : A4
   - Disposition : 10 cartes par page

2. **Plastifier**
   - Plastifieuse à chaud
   - Pochettes 125 microns

3. **Découper**
   - Massicot ou cutter
   - Dimensions exactes : 85.6×54mm

## Architecture technique

### Stack

- **Puppeteer** : Génération PDF depuis HTML
- **Handlebars** : Templating HTML
- **JsBarcode** : Génération code-barres
- **Canvas** : Rendu code-barres
- **pdf-lib** : Fusion PDFs recto-verso
- **date-fns** : Formatage dates

### Flux de génération

```
1. Récupération données élève (Prisma)
   ↓
2. Génération code-barres (JsBarcode + Canvas)
   ↓
3. Compilation templates HTML (Handlebars)
   ↓
4. Génération PDF (Puppeteer)
   ↓
5. Fusion recto-verso (pdf-lib)
   ↓
6. Envoi au client (Express)
```

### Fichiers

```
packages/server/src/
├── modules/students/
│   ├── templates/
│   │   ├── card-front.html      # Template recto
│   │   └── card-back.html       # Template verso
│   ├── students.pdf.service.ts  # Service génération PDF
│   ├── students.controller.ts   # Controller (route handler)
│   └── students.routes.ts       # Routes
└── lib/
    └── barcode.ts               # Génération code-barres
```

## Performance

### Temps de génération

- **Recto seul** : ~2 secondes
- **Verso seul** : ~1.5 secondes
- **Recto-verso** : ~3.5 secondes

### Optimisations

#### Cache Redis (à implémenter)

```typescript
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours

async function getCachedCard(studentId: string): Promise<Buffer | null> {
  const cacheKey = `card:${studentId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return Buffer.from(cached, 'base64');
  }
  
  return null;
}

async function setCachedCard(studentId: string, buffer: Buffer): Promise<void> {
  const cacheKey = `card:${studentId}`;
  await redis.set(cacheKey, buffer.toString('base64'), 'EX', CACHE_TTL / 1000);
}
```

#### Invalidation du cache

Invalider le cache quand :
- Photo de l'élève modifiée
- Informations personnelles modifiées
- Changement de classe
- Nouvelle année scolaire

```typescript
// Dans students.service.ts
async function updateStudent(id: string, data: UpdateStudentDto) {
  const student = await prisma.student.update({ where: { id }, data });
  
  // Invalider le cache de la carte
  await invalidateCardCache(id);
  
  return student;
}
```

## Sécurité

### Contrôle d'accès

- Authentification requise (JWT)
- Permission `students:read` minimum
- Vérification que l'élève appartient à l'école de l'utilisateur

### Validation

- ID élève valide (UUID)
- Format valide (pdf ou png)
- Side valide (front, back, both)

### Limites

- Rate limiting : 10 requêtes/minute par utilisateur
- Timeout : 30 secondes max par génération
- Taille max : 5 MB par carte

## Tests

### Test 1 : Génération recto-verso

```bash
curl -X GET \
  'http://localhost:3000/api/students/abc-123/card' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  --output carte.pdf
```

**Résultat attendu** : Fichier PDF avec 2 pages

### Test 2 : Génération recto seul

```bash
curl -X GET \
  'http://localhost:3000/api/students/abc-123/card?side=front' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  --output carte-recto.pdf
```

**Résultat attendu** : Fichier PDF avec 1 page (recto)

### Test 3 : Format PNG

```bash
curl -X GET \
  'http://localhost:3000/api/students/abc-123/card?format=png&side=front' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  --output carte.png
```

**Résultat attendu** : Image PNG

### Test 4 : Élève inexistant

```bash
curl -X GET \
  'http://localhost:3000/api/students/invalid-id/card' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Résultat attendu** : Erreur 404 STUDENT_NOT_FOUND

## Dépannage

### Puppeteer ne démarre pas

**Problème** : `Error: Failed to launch the browser process`

**Solution** :
```bash
# Installer les dépendances système
sudo apt-get install -y \
  chromium-browser \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0
```

### Code-barres ne s'affiche pas

**Problème** : Zone blanche à la place du code-barres

**Solution** :
- Vérifier que `canvas` est installé
- Vérifier que le matricule est valide
- Vérifier les logs pour les erreurs JsBarcode

### PDF vide ou corrompu

**Problème** : Le PDF se télécharge mais est vide

**Solution** :
- Vérifier que les templates HTML existent
- Vérifier les chemins des images (logo, photo)
- Vérifier les logs Puppeteer
- Augmenter le timeout de génération

### Images ne s'affichent pas

**Problème** : Logo ou photo manquants dans la carte

**Solution** :
- Utiliser des URLs absolues pour les images
- Vérifier que les images sont accessibles
- Utiliser des placeholders si images manquantes

## Améliorations futures

### Court terme
- [ ] Implémenter le cache Redis
- [ ] Ajouter des tests unitaires
- [ ] Optimiser les performances
- [ ] Ajouter des logs détaillés

### Moyen terme
- [ ] Support de plusieurs langues (FR/EN/SW)
- [ ] Personnalisation des couleurs par école
- [ ] QR code en plus du code-barres
- [ ] Génération en masse (batch)

### Long terme
- [ ] Intégration avec imprimantes de cartes
- [ ] Historique des cartes générées
- [ ] Signature électronique du Préfet
- [ ] Watermark de sécurité

---

**Dernière mise à jour** : 18 Février 2026

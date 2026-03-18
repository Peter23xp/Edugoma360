import { z } from 'zod';

export const schoolInfoSchema = z.object({
  // IDENTITÉ
  nomOfficiel: z.string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(200, "Le nom ne peut pas dépasser 200 caractères"),
  
  nomCourt: z.string()
    .min(2, "Le nom court doit contenir au moins 2 caractères")
    .max(50, "Le nom court ne peut pas dépasser 50 caractères"),
  
  code: z.string()
    .min(3, "Le code doit contenir au moins 3 caractères")
    .max(10, "Le code ne peut pas dépasser 10 caractères")
    .regex(/^[A-Z0-9]+$/, "Le code ne peut contenir que des lettres majuscules et des chiffres")
    .regex(/^[A-Z]/, "Le code doit commencer par une lettre"),
  
  logoFile: z.instanceof(File)
    .refine((file) => file.size <= 2097152, "Le fichier ne doit pas dépasser 2MB")
    .refine(
      (file) => ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type),
      "Format invalide. Utilisez PNG, JPG ou SVG"
    )
    .optional(),
  
  // LOCALISATION
  province: z.string()
    .min(1, "Veuillez sélectionner une province"),
  
  ville: z.string()
    .min(1, "Veuillez sélectionner une ville"),
  
  commune: z.string()
    .min(2, "Le nom de la commune est requis"),
  
  avenue: z.string()
    .min(2, "Le nom de l'avenue est requis"),
  
  numero: z.string().optional(),
  
  reference: z.string().optional(),
  
  // CONTACT
  telephonePrincipal: z.string()
    .regex(
      /^\+243(81|82|97|98|89|90|91|99)\d{7}$/,
      "Format invalide. Utilisez +243 XX XXX XXXX (opérateurs congolais)"
    ),
  
  telephoneSecondaire: z.string()
    .regex(/^\+243(81|82|97|98|89|90|91|99)\d{7}$/)
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .email("Format d'email invalide")
    .toLowerCase(),
  
  siteWeb: z.string()
    .url("URL invalide. Format : https://exemple.com")
    .optional()
    .or(z.literal('')),
  
  // OFFICIEL
  type: z.enum(['OFFICIELLE', 'PRIVEE', 'CONVENTIONNEE'], {
    errorMap: () => ({ message: "Veuillez sélectionner un type d'école" })
  }),
  
  numeroAgrement: z.string()
    .min(5, "Le numéro d'agrément doit contenir au moins 5 caractères")
    .regex(
      /^AGR\/[A-Z]{2,3}\/\d{4}\/\d+$/,
      "Format invalide. Utilisez AGR/PROVINCE/ANNÉE/NUMÉRO (ex: AGR/NK/2010/042)"
    ),
  
  dateAgrement: z.date({
    required_error: "La date d'agrément est requise",
    invalid_type_error: "Date invalide"
  })
    .max(new Date(), "La date d'agrément ne peut pas être dans le futur"),
  
  devise: z.string()
    .max(200, "La devise ne peut pas dépasser 200 caractères")
    .optional(),
  
  // ACADÉMIQUE
  langueEnseignement: z.enum(['FRANCAIS', 'ANGLAIS', 'BILINGUE']),
  
  systemeEvaluation: z.enum(['NOTE_20', 'NOTE_10', 'MIXTE']),
  
  nombrePeriodes: z.enum(['TRIMESTRES', 'SEMESTRES'])
});

export type SchoolInfoFormData = z.infer<typeof schoolInfoSchema>;

import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

interface OptimizedImages {
  original: string;     // 500×500px WebP
  thumbnail: string;    // 200×200px WebP
  icon: string;         // 64×64px WebP
}

export async function optimizeSchoolLogo(
  file: Express.Multer.File
): Promise<OptimizedImages> {
  const fileId = uuidv4();
  const uploadDir = path.join(process.cwd(), 'uploads', 'logos');
  
  // Créer dossier si inexistant
  await fs.mkdir(uploadDir, { recursive: true });
  
  // Charger l'image
  const image = sharp(file.buffer);
  const metadata = await image.metadata();
  
  // Validation dimensions minimales
  if (!metadata.width || !metadata.height || metadata.width < 100 || metadata.height < 100) {
    throw new Error('Dimensions minimales : 100×100px');
  }
  
  // 1. Original - 500×500px WebP
  const originalPath = path.join(uploadDir, `${fileId}-original.webp`);
  await image
    .resize(500, 500, { 
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 90 })
    .toFile(originalPath);
  
  // 2. Thumbnail - 200×200px WebP
  const thumbnailPath = path.join(uploadDir, `${fileId}-thumb.webp`);
  await image
    .resize(200, 200, { 
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 85 })
    .toFile(thumbnailPath);
  
  // 3. Icon - 64×64px WebP
  const iconPath = path.join(uploadDir, `${fileId}-icon.webp`);
  await image
    .resize(64, 64, { 
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 80 })
    .toFile(iconPath);
  
  // Retourner URLs publiques
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  return {
    original: `${baseUrl}/uploads/logos/${fileId}-original.webp`,
    thumbnail: `${baseUrl}/uploads/logos/${fileId}-thumb.webp`,
    icon: `${baseUrl}/uploads/logos/${fileId}-icon.webp`
  };
}

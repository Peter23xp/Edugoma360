import { Router } from 'express';
import { GeneratorController } from './generator.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.post('/generate', GeneratorController.generate);
router.get('/saved', GeneratorController.getSaved);
router.delete('/saved/:id', GeneratorController.deleteSaved);
export { router as generatorRoutes };

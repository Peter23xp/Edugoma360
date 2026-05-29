import cron from 'node-cron';
import { ConvocationsService } from '../../modules/communication/convocations/convocations.service';

// Rappels convocations J-3 et J-1 — tous les jours à 8h00
export function startConvocationReminders() {
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Envoi des rappels de convocations...');
    try {
      await ConvocationsService.sendReminders();
      console.log('[CRON] Rappels envoyés avec succès');
    } catch (e) {
      console.error('[CRON] Erreur rappels convocations:', e);
    }
  }, { timezone: 'Africa/Lubumbashi' });
}

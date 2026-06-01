import crypto from 'crypto';
import axios from 'axios';
import prisma from '../../lib/prisma';

// ── Environment Variables & Configuration ─────────────────────────────────────
const MERCHANT_ID = process.env.FLEXPAY_MERCHANT_ID || '';
const TOKEN = process.env.FLEXPAY_TOKEN || '';
const WEBHOOK_SECRET = process.env.FLEXPAY_WEBHOOK_SECRET || '';
const BASE_URL = process.env.FLEXPAY_BASE_URL || 'https://backend.flexpay.cd/api/rest/v1';
const MOCK_MODE = process.env.FLEXPAY_MOCK_MODE === 'true';

export interface InitPaymentParams {
    amount: number;
    currency: 'USD' | 'CDF';
    phone: string;
    reference: string;
    description: string;
    callbackUrl: string;
}

export interface FlexPayWebhookPayload {
    reference: string;
    orderNumber: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    signature?: string;
}

export class FlexPayService {
    /**
     * initPayment
     *
     * Registers a checkout transaction with FlexPay.
     * Returns the orderNumber and paymentUrl.
     */
    async initPayment(params: InitPaymentParams): Promise<{ orderNumber: string; paymentUrl: string }> {
        const { amount, currency, phone, reference, description, callbackUrl } = params;

        // ── Mock Mode Branch ──────────────────────────────────────────────────────────
        if (MOCK_MODE) {
            console.log(`[FLEXPAY MOCK] Initiating payment for Ref: ${reference}, Amount: ${amount} ${currency}`);
            const mockOrderNumber = `MOCK-${reference}`;
            // Mock payment callback page URL on the client
            const mockPaymentUrl = `/billing/callback?order=${mockOrderNumber}`;
            return {
                orderNumber: mockOrderNumber,
                paymentUrl: mockPaymentUrl,
            };
        }

        // ── Production Branch ───────────────────────────────────────────────────────
        try {
            const payload = {
                merchant_code: MERCHANT_ID,
                token: TOKEN,
                phone: phone.replace(/\+/g, ''), // Ensure clean numeric format
                amount: amount.toString(),
                currency,
                reference,
                description,
                callbackUrl,
            };

            const response = await axios.post(`${BASE_URL}/paymentService`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`,
                },
            });

            if (response.status !== 200 || !response.data) {
                throw new Error('Erreur de réponse de l\'API FlexPay');
            }

            // FlexPay typically returns: { code: '0', orderNumber: '...', paymentUrl: '...' }
            const { orderNumber, paymentUrl, code } = response.data;

            if (code !== '0' && code !== 0 && !orderNumber) {
                throw new Error(response.data.message || 'Échec d\'initialisation du paiement FlexPay');
            }

            return {
                orderNumber,
                paymentUrl: paymentUrl || `${BASE_URL}/vpos/ask?orderNumber=${orderNumber}`,
            };
        } catch (error: any) {
            console.error('[FLEXPAY ERROR] Error in initPayment:', error.response?.data || error.message);
            throw new Error(`FlexPay Initiation Failed: ${error.message}`);
        }
    }

    /**
     * checkPaymentStatus
     *
     * Directly checks the transaction status on FlexPay gateway.
     * Returns: 'PENDING' | 'SUCCESSFUL' | 'FAILED'
     */
    async checkPaymentStatus(orderNumber: string): Promise<'PENDING' | 'SUCCESSFUL' | 'FAILED'> {
        // ── Mock Mode Branch ──────────────────────────────────────────────────────────
        if (MOCK_MODE || orderNumber.startsWith('MOCK-')) {
            // Find subscription created in DB to determine if 5 seconds have passed
            const subscription = await prisma.subscription.findFirst({
                where: { paymentRef: orderNumber },
            });

            if (!subscription) {
                return 'FAILED';
            }

            const elapsed = Date.now() - subscription.createdAt.getTime();
            if (elapsed >= 5000) {
                console.log(`[FLEXPAY MOCK] 5s elapsed for ${orderNumber} -> SUCCESSFUL`);
                return 'SUCCESSFUL';
            }

            console.log(`[FLEXPAY MOCK] Still pending for ${orderNumber} (${Math.round(elapsed / 1000)}s)...`);
            return 'PENDING';
        }

        // ── Production Branch ───────────────────────────────────────────────────────
        try {
            const response = await axios.get(`${BASE_URL}/check/${orderNumber}`, {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                },
            });

            const data = response.data;
            if (!data) return 'PENDING';

            // Custom robust parsing for different response layouts from FlexPay
            const status = (data.status || data.transaction?.status || '').toString().toUpperCase();
            const code = data.code;

            if (status === 'SUCCESS' || status === 'SUCCESSFUL' || code === '0' || code === 0) {
                return 'SUCCESSFUL';
            } else if (status === 'FAILED' || code === '1' || code === 1) {
                return 'FAILED';
            }

            return 'PENDING';
        } catch (error: any) {
            console.error('[FLEXPAY ERROR] Error in checkPaymentStatus:', error.response?.data || error.message);
            return 'PENDING'; // Fallback to pending rather than failing client UI
        }
    }

    /**
     * verifyWebhookSignature
     *
     * Validates FlexPay webhook callback request signature using HMAC-SHA256.
     */
    verifyWebhookSignature(rawBody: string, signature: string): boolean {
        if (MOCK_MODE) return true; // Always allow in dev/sandbox

        if (!WEBHOOK_SECRET || !signature) return false;

        try {
            const hash = crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(rawBody)
                .digest('hex');

            return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
        } catch (e) {
            console.error('[FLEXPAY SIGNATURE ERROR]', e);
            return false;
        }
    }
}

export const flexpayService = new FlexPayService();

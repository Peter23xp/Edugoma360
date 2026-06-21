import Stripe from 'stripe';
import { env } from '../config/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    // Use the SDK's pinned API version (avoids type drift on upgrade)
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
});

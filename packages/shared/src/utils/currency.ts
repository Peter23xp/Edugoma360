// ── Conversion & Formatage Devises — FC/USD ──────────────────────────────────

/**
 * Taux de change par défaut FC / USD
 * Modifiable via les paramètres de l'école
 */
export const DEFAULT_EXCHANGE_RATE_FC_USD = 2500;

/**
 * Convertit un montant en FC vers USD
 * 
 * @param amountFC - Montant en Francs Congolais
 * @param rate - Taux de change FC → 1 USD
 * @returns Montant en USD
 */
export function fcToUsd(amountFC: number, rate: number = DEFAULT_EXCHANGE_RATE_FC_USD): number {
    if (rate <= 0) throw new Error('Le taux de change doit être positif');
    return Math.round((amountFC / rate) * 100) / 100;
}

/**
 * Convertit un montant en USD vers FC
 * 
 * @param amountUSD - Montant en USD
 * @param rate - Taux de change FC → 1 USD
 * @returns Montant en FC (entier)
 */
export function usdToFc(amountUSD: number, rate: number = DEFAULT_EXCHANGE_RATE_FC_USD): number {
    if (rate <= 0) throw new Error('Le taux de change doit être positif');
    return Math.round(amountUSD * rate);
}

/**
 * Formate un montant en Francs Congolais
 * 
 * @param amount - Montant en FC
 * @returns Chaîne formatée (ex: "75 000 FC")
 */
export function formatFC(amount: number): string {
    const formatted = new Intl.NumberFormat('fr-CD', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} FC`;
}

/**
 * Formate un montant en USD
 * 
 * @param amount - Montant en USD
 * @returns Chaîne formatée (ex: "$30.00")
 */
export function formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Formate un montant dans la devise spécifiée
 * 
 * @param amount - Montant
 * @param currency - 'FC' | 'USD'
 * @returns Chaîne formatée
 */
export function formatCurrency(amount: number, currency: 'FC' | 'USD' = 'FC'): string {
    return currency === 'FC' ? formatFC(amount) : formatUSD(amount);
}

/**
 * Formate un montant avec l'équivalent dans l'autre devise
 * @example formatDualCurrency(75000, 'FC', 2500) → "75 000 FC (≈ $30.00)"
 */
export function formatDualCurrency(
    amount: number,
    currency: 'FC' | 'USD' = 'FC',
    rate: number = DEFAULT_EXCHANGE_RATE_FC_USD,
): string {
    if (currency === 'FC') {
        const usd = fcToUsd(amount, rate);
        return `${formatFC(amount)} (≈ ${formatUSD(usd)})`;
    } else {
        const fc = usdToFc(amount, rate);
        return `${formatUSD(amount)} (≈ ${formatFC(fc)})`;
    }
}

/** 1 acre = 40 guntas (standard survey unit used alongside acres in this region). */
const GUNTAS_PER_ACRE = 40;

/**
 * Formats a decimal acre value as "X acre(s) Y gunta(s) (Z.ZZ acres)",
 * dropping the acres part entirely when under 1 acre (e.g. "22 guntas (0.56 acres)").
 */
export function formatAcresGuntas(acres: number): string {
  if (!Number.isFinite(acres) || acres <= 0) return '0 guntas';

  let wholeAcres = Math.floor(acres);
  let guntas = Math.round((acres - wholeAcres) * GUNTAS_PER_ACRE);

  if (guntas >= GUNTAS_PER_ACRE) {
    wholeAcres += 1;
    guntas = 0;
  }

  const acresPart = wholeAcres > 0 ? `${wholeAcres} ${wholeAcres === 1 ? 'acre' : 'acres'}` : '';
  const guntasPart = guntas > 0 ? `${guntas} ${guntas === 1 ? 'gunta' : 'guntas'}` : '';
  const combined = [acresPart, guntasPart].filter(Boolean).join(' ') || '0 guntas';

  return `${combined} (${acres.toFixed(2)} acres)`;
}

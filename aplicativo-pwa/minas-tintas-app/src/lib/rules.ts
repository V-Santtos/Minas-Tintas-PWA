// O default/fallback — usado se a taxa do banco não estiver disponível.
export const BONUS_PERCENT = 0.01;

// Cálculo: continua SÍNCRONO e PURO. A taxa entra como parâmetro,
// com fallback pro default. Quem chama decide qual taxa passar.
export function bonusPoints(
  grossTotal: number,
  percent: number = BONUS_PERCENT,
): number {
  return Math.round(grossTotal * percent);
}

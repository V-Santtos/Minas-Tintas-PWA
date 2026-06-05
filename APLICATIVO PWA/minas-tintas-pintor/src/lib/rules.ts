// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Regras de negÃ³cio â€” FONTE ÃšNICA DE VERDADE para constantes e cÃ¡lculos.
//
// âš ï¸  Este arquivo Ã© mantido IDÃŠNTICO nos dois apps (admin e pintor) de
//     propÃ³sito. Ã‰ o primeiro candidato Ã  lib compartilhada (backlog #7):
//     quando essa lib existir, basta movÃª-lo e importar dos dois lados.
//
//     Por enquanto, NÃƒO edite sÃ³ um lado â€” qualquer mudanÃ§a aqui precisa ser
//     espelhada no outro app.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Percentual de bÃ´nus sobre o valor BRUTO do orÃ§amento aprovado.
 * Acordado com a loja: 1%. ConfigurÃ¡vel pelo admin no futuro.
 */
export const BONUS_PERCENT = 0.01;

/**
 * Pontos de bÃ´nus creditados ao pintor responsÃ¡vel.
 * Base de cÃ¡lculo = valor BRUTO (descontos ao cliente final NÃƒO reduzem a base).
 * O crÃ©dito de fato sÃ³ ocorre quando o admin confirma o pagamento.
 */
export function bonusPoints(grossTotal: number): number {
  return Math.round(grossTotal * BONUS_PERCENT);
}

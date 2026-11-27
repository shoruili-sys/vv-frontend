export interface AnalysisCriteria {
  /** Prazo da proposta: meses entre o início da primeira série e a entrega. */
  maxFinancingTermMonths: number;
  minCashCapturePercentage: number;
  minPreDeliveryCapturePercentage: number;
  minMonthlyCapturePercentage: number;
}

/**
 * Valores padrão. São premissas de uso pessoal — não são regras emitidas pelas
 * construtoras. Podem ser alterados na tela e ficam salvos no navegador.
 */
export const ANALYSIS_CRITERIA: AnalysisCriteria = {
  maxFinancingTermMonths: 18,
  minCashCapturePercentage: 5,
  minPreDeliveryCapturePercentage: 35,
  minMonthlyCapturePercentage: 0.35,
};

// Tolera pequenas diferenças causadas por parcelas já arredondadas em centavos.
export const COMPARISON_EPSILON = 0.00001;

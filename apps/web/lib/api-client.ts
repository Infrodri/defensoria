'use client';

import { fetchApi } from './api';

// ============================================================================
// LEGAL TOOLS - Tipos y Funciones
// ============================================================================

export interface LegalDiscrepanciesRequest {
  caseId: string;
  transcriptionId?: string;
  comparableDocuments?: string[];
}

export interface LegalDiscrepanciesResponse {
  analysisId: string;
  caseId: string;
  discrepancies: {
    id: string;
    testimony1Index: number;
    testimony2Index: number;
    discrepancy: string;
    severity: 'BAJA' | 'MEDIA' | 'ALTA';
    implication: string;
  }[];
  overallConsistencyScore: number;
  recommendation: string;
  analyzedAt: string;
  analyzedBy: string;
}

export async function analyzeLegalDiscrepancies(
  payload: LegalDiscrepanciesRequest,
): Promise<LegalDiscrepanciesResponse> {
  return fetchApi<LegalDiscrepanciesResponse>('/legal-tools/discrepancies/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface PenalTypicalityRequest {
  transcriptionId: string;
  caseTypeCode: string;
}

export interface PenalTypicalityResponse {
  analysisId: string;
  caseId: string;
  typicalCrimes: {
    id: string;
    crimeType: string;
    articleNumber: string;
    description: string;
    matchPercentage: number;
    aggravatingFactors: string[];
    mitigatingFactors: string[];
  }[];
  primaryCrime: string;
  typicalityScore: number;
  recommendation: string;
  analyzedAt: string;
  analyzedBy: string;
}

export async function analyzePenalTypicality(
  payload: PenalTypicalityRequest,
): Promise<PenalTypicalityResponse> {
  return fetchApi<PenalTypicalityResponse>('/legal-tools/typicality/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export enum EventType {
  MEDIDAS_PROTECCION = 'MEDIDAS_PROTECCION',
  AUDIENCIA = 'AUDIENCIA',
  DENUNCIA = 'DENUNCIA',
}

export interface ProcessualDeadlineRequest {
  caseId: string;
  eventDate: string;
  eventType: EventType;
}

export interface ProcessualDeadlineResponse {
  analysisId: string;
  caseId: string;
  deadlines: {
    id: string;
    eventType: string;
    deadlineDate: string;
    businessDaysRemaining: number;
    calendarDaysRemaining: number;
    legalBasis: string;
    consequences: string;
    priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  }[];
  criticalDeadlines: number;
  recommendation: string;
  calculatedAt: string;
  calculatedBy: string;
}

export async function calculateProcessualDeadlines(
  payload: ProcessualDeadlineRequest,
): Promise<ProcessualDeadlineResponse> {
  return fetchApi<ProcessualDeadlineResponse>('/legal-tools/deadlines/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============================================================================
// PSYCHOLOGICAL TOOLS - Tipos y Funciones
// ============================================================================

export interface TraumaIndicatorsRequest {
  caseId: string;
  transcriptionId?: string;
}

export interface Indicator {
  id: string;
  name: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  description: string;
  evidence?: string;
}

export interface TraumaIndicatorsResponse {
  analysisId: string;
  caseId: string;
  traumaLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  indicators: Indicator[];
  overallScore: number;
  recommendation: string;
  analyzedAt: string;
  analyzedBy: string;
}

export async function extractTraumaIndicators(
  payload: TraumaIndicatorsRequest,
): Promise<TraumaIndicatorsResponse> {
  return fetchApi<TraumaIndicatorsResponse>('/psychological-tools/indicators/extract', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface RiskScalesRequest {
  caseId: string;
  transcriptionId: string;
}

export interface Subscale {
  id: string;
  name: string;
  score: number;
  maxScore: number;
}

export interface Scale {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  interpretation: 'BAJO' | 'MEDIO' | 'ALTO';
  subscales?: Subscale[];
}

export interface RiskScalesResponse {
  analysisId: string;
  caseId: string;
  scales: Scale[];
  overallClinicalRisk: 'BAJO' | 'MEDIO' | 'ALTO';
  analyzedAt: string;
  analyzedBy: string;
}

export async function prefillRiskScales(
  payload: RiskScalesRequest,
): Promise<RiskScalesResponse> {
  return fetchApi<RiskScalesResponse>('/psychological-tools/risk-scales/prefill', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface ClinicalTranslationRequest {
  caseId: string;
  notesText: string;
}

export interface TranslationPair {
  id: string;
  original: string;
  translated: string;
  clinicalTerm?: string;
  forensicTerm?: string;
  explanation?: string;
}

export interface ClinicalTranslationResponse {
  analysisId: string;
  caseId: string;
  translations: TranslationPair[];
  keyTerms?: string[];
  translatedSummary?: string;
  analyzedAt: string;
  analyzedBy: string;
}

export async function translateClinically(
  payload: ClinicalTranslationRequest,
): Promise<ClinicalTranslationResponse> {
  return fetchApi<ClinicalTranslationResponse>('/psychological-tools/clinical-translator/translate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface TraumaAnalysisRequest {
  caseId: string;
  indicadores: string[];
}

export interface TraumaAnalysisResponse {
  analysisId: string;
  caseId: string;
  cumulativeTraumaLevel: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
  exposureCount: number;
  traumaType: string;
  accumulationFactors: string[];
  overallScore: number;
  recommendation: string;
  analyzedAt: string;
  analyzedBy: string;
}

export async function analyzeTrauma(
  payload: TraumaAnalysisRequest,
): Promise<TraumaAnalysisResponse> {
  return fetchApi<TraumaAnalysisResponse>('/psychological-tools/trauma/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============================================================================
// SOCIAL TOOLS - Tipos y Funciones
// ============================================================================

export interface FamilyMapRequest {
  caseId: string;
  transcriptionId?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  livesWithNNA: boolean;
  socialVulnerabilities?: string[];
}

export interface FamilyMapResponse {
  analysisId: string;
  caseId: string;
  nnaName: string;
  nuclearFamily: FamilyMember[];
  extendedFamily?: FamilyMember[];
  familyDynamics: string;
  vulnerabilities: string[];
  analyzedAt: string;
  analyzedBy: string;
}

export async function generateFamilyMap(
  payload: FamilyMapRequest,
): Promise<FamilyMapResponse> {
  return fetchApi<FamilyMapResponse>('/social-tools/familymap/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface VulnerabilityRequest {
  caseId: string;
  ingresos: number;
  vivienda: string;
  cargasFamiliares: number;
}

export interface RiskFactor {
  id: string;
  name: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  description: string;
}

export interface SupportProgram {
  id: string;
  name: string;
  type: string;
  availability: string;
}

export interface VulnerabilityResponse {
  analysisId: string;
  caseId: string;
  vulnerabilityScore: number;
  vulnerabilityLevel: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO';
  riskFactors: RiskFactor[];
  supportPrograms: SupportProgram[];
  recommendations: string;
  analyzedAt: string;
  analyzedBy: string;
}

export async function calculateVulnerability(
  payload: VulnerabilityRequest,
): Promise<VulnerabilityResponse> {
  return fetchApi<VulnerabilityResponse>('/social-tools/vulnerability/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface EnvironmentalMapRequest {
  caseId: string;
  transcriptionId: string;
}

export interface EnvironmentalFactor {
  id: string;
  category: string;
  factor: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  mitigationStrategy: string;
}

export interface EnvironmentalMapResponse {
  analysisId: string;
  caseId: string;
  environmentalFactors: EnvironmentalFactor[];
  riskProfile: string;
  protectionFactors: string[];
  recommendations: string;
  analyzedAt: string;
  analyzedBy: string;
}

export async function mapEnvironmental(
  payload: EnvironmentalMapRequest,
): Promise<EnvironmentalMapResponse> {
  return fetchApi<EnvironmentalMapResponse>('/social-tools/environmental/map', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============================================================================
// TRANSVERSAL TOOLS - Tipos y Funciones
// ============================================================================

export interface UnifiedTimelineRequest {
  caseId: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'legal' | 'psychological' | 'social' | 'system';
  documentId?: string;
  metadata?: Record<string, unknown>;
}

export interface UnifiedTimelineResponse {
  timelineId: string;
  caseId: string;
  events: TimelineEvent[];
  analyzedAt: string;
}

export async function createUnifiedTimeline(
  payload: UnifiedTimelineRequest,
): Promise<UnifiedTimelineResponse> {
  return fetchApi<UnifiedTimelineResponse>('/transversal-tools/timeline/unified', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface AnonymizeReportRequest {
  caseId: string;
  reporteId: string;
}

export interface AnonymizationRule {
  id: string;
  original: string;
  replacement: string;
  occurrences: number;
}

export interface AnonymizedReportResponse {
  anonymizationId: string;
  caseId: string;
  reportId: string;
  reportContent: string;
  anonymizationRules: AnonymizationRule[];
  confidentialityLevel: 'PÚBLICO' | 'CONFIDENCIAL' | 'ALTAMENTE_CONFIDENCIAL';
  generatedAt: string;
  generatedBy: string;
}

export async function anonymizeReport(
  payload: AnonymizeReportRequest,
): Promise<AnonymizedReportResponse> {
  return fetchApi<AnonymizedReportResponse>('/transversal-tools/anonymizer/anonymize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============================================================================
// CASES - Tipos y Funciones (para obtener listados y detalles)
// ============================================================================

export interface CaseDetail {
  id: string;
  caseCode: string;
  caseType: string;
  phase: string;
  nnaName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CasesListResponse {
  cases: CaseDetail[];
  total: number;
}

export async function getCasesList(): Promise<CaseDetail[]> {
  return fetchApi<CaseDetail[]>('/cases', {
    method: 'GET',
  });
}

/**
 * Transcripción y búsqueda en base de conocimiento
 */
export interface TranscriptionResult {
  id: string;
  text: string;
  language: string;
  status: string;
  confidence: number;
}

export async function uploadAndTranscribeAudio(
  caseId: string,
  evidenceId: string,
  audioFile: File,
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append('caseId', caseId);
  formData.append('evidenceId', evidenceId);
  formData.append('file', audioFile);

  return fetchApi<TranscriptionResult>('/knowledge/transcribe', {
    method: 'POST',
    body: formData,
  });
}

export async function searchInTranscriptions(
  caseId: string,
  query: string,
): Promise<Array<{ text: string; matchedText: string }>> {
  return fetchApi<Array<{ text: string; matchedText: string }>>(
    '/knowledge/search-transcriptions',
    {
      method: 'POST',
      body: JSON.stringify({ caseId, query }),
    },
  );
}

export async function getCaseDetail(caseId: string): Promise<CaseDetail> {
  return fetchApi<CaseDetail>(`/cases/${caseId}`, {
    method: 'GET',
  });
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

export function formatApiError(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido en la solicitud';
}

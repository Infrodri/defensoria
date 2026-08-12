import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EvidenceRagService } from '../evidence-rag.service';

@Injectable()
export class InformeApprovedListener {
  private readonly logger = new Logger(InformeApprovedListener.name);

  constructor(private readonly evidenceRagService: EvidenceRagService) {}

  @OnEvent('informe.approved')
  async handleInformeApproved(payload: { caseId: string; informe: any }) {
    this.logger.log(`Procesando evento informe.approved para expediente ${payload.caseId}`);
    try {
      await this.evidenceRagService.indexChunkPublic(
        payload.caseId,
        payload.informe.id,
        'report',
        payload.informe.contenido,
        {
          author: payload.informe.autor,
          tipo: payload.informe.tipo,
          fase: payload.informe.fase,
          fecha: payload.informe.fecha,
        },
      );
      
      // Regenerar resumen del caso tras nuevo informe
      await this.evidenceRagService.refreshCaseDigest(payload.caseId);
      this.logger.log(`Digest del expediente ${payload.caseId} regenerado exitosamente.`);
    } catch (error: any) {
      this.logger.error(`Error al procesar informe.approved para expediente ${payload.caseId}: ${error.message}`);
    }
  }
}

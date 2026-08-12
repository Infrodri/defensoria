import { Module, forwardRef } from '@nestjs/common';
import { EvidencesService } from './evidences.service';
import { EvidencesController } from './evidences.controller';
import { EvidenceRagService } from './evidence-rag.service';
import { EvidenceWorker } from './evidence.worker';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { AudioParser } from './parsers/audio.parser';
import { ImageParser } from './parsers/image.parser';
import { PdfParser } from './parsers/pdf.parser';
import { DocxParser } from './parsers/docx.parser';
import { EvidenceParserFactory } from './parsers/evidence-parser.factory';
import { InformeApprovedListener } from './listeners/informe-approved.listener';

@Module({
  imports: [forwardRef(() => KnowledgeModule)],
  controllers: [EvidencesController],
  providers: [
    EvidencesService,
    EvidenceRagService,
    EvidenceWorker,
    AudioParser,
    ImageParser,
    PdfParser,
    DocxParser,
    EvidenceParserFactory,
    InformeApprovedListener,
  ],
  exports: [EvidencesService, EvidenceRagService],
})
export class EvidencesModule {}

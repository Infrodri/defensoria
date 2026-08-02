import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { KnowledgeService } from '../modules/knowledge/knowledge.service';
import { Logger } from '@nestjs/common';

const LEY_548_TEXT = `Artículo 1. (OBJETO).
El presente Código tiene por objeto reconocer, desarrollar y regular el ejercicio de los derechos de la niña, niño y adolescente, implementando un Sistema Plurinacional Integral de la Niña, Niño y Adolescente, para la garantía de esos derechos mediante la corresponsabilidad del Estado en todos sus niveles, la familia y la sociedad.

Artículo 2. (FINALIDAD).
La finalidad del presente Código es garantizar a la niña, niño y adolescente, el ejercicio pleno y efectivo de sus derechos, para su desarrollo integral y exigir el cumplimiento de sus deberes.

Artículo 3. (MARCO CONSTITUCIONAL Y ÁMBITO DE APLICACIÓN).
I. El presente Código se rige por la Constitución Política del Estado.
II. Las disposiciones del presente Código son de orden público y de aplicación preferente a favor de todas las niñas, niños y adolescentes.

Artículo 4. (SUJETOS DE DERECHOS).
I. Son sujetos de derechos las niñas, niños y adolescentes hasta los dieciocho (18) años.
II. Para la aplicación de este Código se consideran:
a) Niña o niño, desde la concepción hasta los doce (12) años cumplidos; y
b) Adolescente, desde los doce (12) años hasta los dieciocho (18) años cumplidos.`;

async function bootstrap() {
  const logger = new Logger('SeedLey548');
  logger.log('Iniciando contexto de NestJS para ingesta de datos...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const knowledgeService = app.get(KnowledgeService);

  logger.log('Fragmentando Ley 548...');
  
  // Separar por la palabra "Artículo X."
  const articulos = LEY_548_TEXT.split(/(?=Artículo \d+\.)/g).filter(text => text.trim().length > 0);

  const chunks = articulos.map((text) => {
    const articuloMatch = text.match(/Artículo (\d+)\./);
    const numero = articuloMatch ? parseInt(articuloMatch[1], 10) : null;
    
    return {
      content: text.trim(),
      metadata: {
        type: 'ley',
        norma: 'Ley 548',
        articulo: numero,
      }
    };
  });

  logger.log(`Se encontraron ${chunks.length} artículos. Ingiriendo en BD Vectorial...`);

  try {
    await knowledgeService.ingestDocument('Ley 548 - Código Niña, Niño y Adolescente', chunks);
    logger.log('✅ Ingesta finalizada correctamente.');
  } catch (error) {
    logger.error('❌ Error durante la ingesta:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

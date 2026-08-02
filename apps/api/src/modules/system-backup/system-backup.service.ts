import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const execAsync = promisify(exec);

@Injectable()
export class SystemBackupService {
  private readonly logger = new Logger(SystemBackupService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateDatabaseBackup(): Promise<string> {
    this.logger.log('Iniciando volcado de base de datos (pg_dump)...');
    
    // Obtener la URL de conexión. NOTA: Para pg_dump local, se extraerán las variables
    // pero si es Docker, puede necesitar ajustes. Asumiremos DATABASE_URL local.
    const dbUrl = this.configService.get<string>('DATABASE_URL');
    
    if (!dbUrl) {
      throw new InternalServerErrorException('DATABASE_URL no configurada.');
    }

    // Archivo temporal
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `dna-sucre-backup-${timestamp}.sql`;
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, fileName);

    try {
      // Configuramos para Windows (usando pg_dump si está instalado localmente)
      // Nota de diseño: Set client_encoding='UTF8' previene corrupción en Windows.
      const command = `pg_dump "${dbUrl}" -f "${filePath}" --encoding=UTF8`;
      
      await execAsync(command);
      
      this.logger.log(`Backup generado exitosamente en: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error('Error al generar el backup de base de datos', error);
      throw new InternalServerErrorException('No se pudo generar el backup. Verifique que pg_dump esté instalado en el servidor.');
    }
  }
}

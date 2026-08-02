import { Controller, Post, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { SystemBackupService } from './system-backup.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@defensoria/shared';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Seguridad e Infraestructura (Backups)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('system-backup')
export class SystemBackupController {
  constructor(private readonly systemBackupService: SystemBackupService) {}

  @Post('generate')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Generar y descargar una copia de seguridad de la base de datos (pg_dump)' })
  async generateDatabaseBackup(@Res() res: Response) {
    const filePath = await this.systemBackupService.generateDatabaseBackup();
    const fileName = path.basename(filePath);

    res.set({
      'Content-Type': 'application/sql',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    const fileStream = fs.createReadStream(filePath);
    
    // Una vez descargado, eliminamos el temporal para no llenar el servidor
    fileStream.on('end', () => {
      fs.unlinkSync(filePath);
    });

    fileStream.pipe(res);
  }
}

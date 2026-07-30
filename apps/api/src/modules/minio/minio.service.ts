import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  public readonly defaultBucket = 'defensoria-evidences';

  onModuleInit() {
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minio_admin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minio_dev_password';

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL: false,
      accessKey,
      secretKey,
    });

    this.ensureBucketExists(this.defaultBucket);
  }

  private async ensureBucketExists(bucketName: string) {
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
        this.logger.log(`Bucket de MinIO creado exitosamente: ${bucketName}`);
      } else {
        this.logger.log(`Bucket de MinIO verificado: ${bucketName}`);
      }
    } catch (error) {
      this.logger.error(`Error al verificar/crear bucket en MinIO: ${error.message}`);
    }
  }

  async uploadFile(
    objectName: string,
    buffer: Buffer,
    size: number,
    mimeType: string,
    bucketName = this.defaultBucket,
  ): Promise<string> {
    await this.minioClient.putObject(bucketName, objectName, buffer, size, {
      'Content-Type': mimeType,
    });
    return objectName;
  }

  async getFileStream(objectName: string, bucketName = this.defaultBucket) {
    return this.minioClient.getObject(bucketName, objectName);
  }
}

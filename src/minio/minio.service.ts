import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
    private readonly logger = new Logger(MinioService.name);
    private minioClient: Minio.Client;
    private readonly bucketName: string;

    constructor(private configService: ConfigService) {
        this.minioClient = new Minio.Client({
            endPoint: this.configService.get<string>('MINIO_ENDPOINT') ?? '',
            port: parseInt(this.configService.get<string>('MINIO_PORT') ?? '9000', 10),
            useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
            accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
            secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
        });
        this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'company-logos');
    }

    async onModuleInit() {
        await this.ensureBucketExists();
    }

    private async ensureBucketExists() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                this.logger.log(`✅ Bucket '${this.bucketName}' created`);
            } else {
                this.logger.log(`✅ Bucket '${this.bucketName}' already exists`);
            }
        } catch (error) {
            this.logger.error(`❌ Failed to initialize bucket`);
            throw error;
        }
    }

    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'logos',
    ): Promise<string> {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

        const metadata = {
            'Content-Type': file.mimetype,
        };

        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);

        try {
            await this.minioClient.putObject(
                this.bucketName,
                fileName,
                bufferStream,
                file.size,
                metadata,
            );

            const fileUrl = this.getFileUrl(fileName);
            this.logger.log(`✅ File uploaded: ${fileUrl}`);
            return fileUrl;
        } catch (error) {
            this.logger.error(`❌ Upload failed`);
            throw error;
        }
    }

    getFileUrl(fileName: string): string {
        const endPoint = this.configService.get<string>('MINIO_ENDPOINT');
        const port = this.configService.get<string>('MINIO_PORT');
        const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
        const protocol = useSSL ? 'https' : 'http';

        return `${protocol}://${endPoint}:${port}/${this.bucketName}/${fileName}`;
    }

    async deleteFile(fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, fileName);
            this.logger.log(`✅ File deleted: ${fileName}`);
        } catch (error) {
            this.logger.error(`❌ Delete failed`);
            throw error;
        }
    }
}
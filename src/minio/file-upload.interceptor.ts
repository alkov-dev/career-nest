import { Injectable, mixin, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { FileInterceptor as MulterFileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export function FileUploadInterceptor(fieldName: string = 'logo') {
    @Injectable()
    class MixinInterceptor implements NestInterceptor {
        readonly interceptor: NestInterceptor;

        constructor() {
            this.interceptor = new (MulterFileInterceptor(fieldName, {
                storage: memoryStorage(),
                limits: {
                    fileSize: 5 * 1024 * 1024, // 5MB
                },
                fileFilter: (req, file, callback) => {
                    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                        return callback(new BadRequestException('Только изображения (JPG, PNG, GIF, WebP)'), false);
                    }
                    callback(null, true);
                },
            }))();
        }

        intercept(context: ExecutionContext, next: CallHandler) {
            return this.interceptor.intercept(context, next);
        }
    }

    return mixin(MixinInterceptor);
}
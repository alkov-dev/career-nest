import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || !user) {

            const request = context.switchToHttp().getRequest();
            this.logger.warn(
                `[JwtAuthGuard]: Unauthorized access attempt: ${request.method} ${request.url} - ${info?.message || 'No token'}`,
            );

            throw err || new UnauthorizedException('[JwtAuthGuard]: Invalid or expired token');
        }
        return user;
    }
}
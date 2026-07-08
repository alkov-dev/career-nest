import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export enum UserRole {
    CANDIDATE = 'candidate',
    EMPLOYER = 'employer',
    ADMIN = 'admin',
}

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsEnum(UserRole)
    role!: UserRole;
}
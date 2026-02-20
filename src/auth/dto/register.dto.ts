import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
@IsEmail()
email: string;

@IsOptional()
@IsString()
@MaxLength(100)
name?: string;

@IsString()
@MinLength(8)
@MaxLength(100)
password: string;
}
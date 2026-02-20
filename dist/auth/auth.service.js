"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.bcryptSaltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10));
    }
    sanitizeUser(user) {
        const { password, refreshToken, ...rest } = user;
        return rest;
    }
    async hashData(data) {
        return bcrypt.hash(data, this.bcryptSaltRounds);
    }
    async getTokens(userId, email) {
        const payload = { sub: userId, email };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.ConflictException({ message: 'Email already in use', error: 'Conflict' });
        }
        const hashedPassword = await this.hashData(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: hashedPassword,
            },
        });
        const tokens = await this.getTokens(user.id, user.email);
        const hashedRefreshToken = await this.hashData(tokens.refreshToken);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefreshToken },
        });
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            throw new common_1.UnauthorizedException({ message: 'Invalid credentials', error: 'Unauthorized' });
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException({ message: 'Invalid credentials', error: 'Unauthorized' });
        }
        const tokens = await this.getTokens(user.id, user.email);
        const hashedRefreshToken = await this.hashData(tokens.refreshToken);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefreshToken },
        });
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async logout(userId) {
        await this.prisma.user.updateMany({
            where: { id: userId, refreshToken: { not: null } },
            data: { refreshToken: null },
        });
        return { success: true };
    }
    async refreshTokens(dto) {
        const { refreshToken } = dto;
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.ForbiddenException({ message: 'Invalid refresh token', error: 'Forbidden' });
        }
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || !user.refreshToken) {
            throw new common_1.ForbiddenException({ message: 'Access denied', error: 'Forbidden' });
        }
        const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!tokenMatches) {
            throw new common_1.ForbiddenException({ message: 'Access denied', error: 'Forbidden' });
        }
        const tokens = await this.getTokens(user.id, user.email);
        const hashedRefreshToken = await this.hashData(tokens.refreshToken);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefreshToken },
        });
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
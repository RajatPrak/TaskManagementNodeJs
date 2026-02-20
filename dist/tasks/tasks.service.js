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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const task_status_enum_1 = require("./task-status.enum");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    ensureOwnership(task, userId) {
        if (!task) {
            throw new common_1.NotFoundException({ message: 'Task not found', error: 'Not Found' });
        }
        if (task.userId !== userId) {
            throw new common_1.ForbiddenException({
                message: 'You do not have access to this task',
                error: 'Forbidden',
            });
        }
    }
    async create(userId, dto) {
        var _a;
        const task = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                status: (_a = dto.status) !== null && _a !== void 0 ? _a : task_status_enum_1.TaskStatusEnum.pending,
                userId,
            },
        });
        return task;
    }
    async findAll(userId, query) {
        var _a, _b;
        const page = (_a = query.page) !== null && _a !== void 0 ? _a : 1;
        const limit = (_b = query.limit) !== null && _b !== void 0 ? _b : 10;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (query.status) {
            where.status = query.status;
        }
        if (query.search) {
            where.title = { contains: query.search, mode: 'insensitive' };
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.task.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.task.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: items,
            meta: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
    async findOne(userId, id) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        this.ensureOwnership(task, userId);
        return task;
    }
    async update(userId, id, dto) {
        var _a, _b, _c;
        const task = await this.prisma.task.findUnique({ where: { id } });
        this.ensureOwnership(task, userId);
        const updated = await this.prisma.task.update({
            where: { id },
            data: {
                title: (_a = dto.title) !== null && _a !== void 0 ? _a : task.title,
                description: (_b = dto.description) !== null && _b !== void 0 ? _b : task.description,
                status: (_c = dto.status) !== null && _c !== void 0 ? _c : task.status,
            },
        });
        return updated;
    }
    async remove(userId, id) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        this.ensureOwnership(task, userId);
        await this.prisma.task.delete({ where: { id } });
        return { success: true };
    }
    async toggleStatus(userId, id) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        this.ensureOwnership(task, userId);
        let newStatus;
        switch (task.status) {
            case task_status_enum_1.TaskStatusEnum.pending:
                newStatus = task_status_enum_1.TaskStatusEnum.ongoing;
                break;
            case task_status_enum_1.TaskStatusEnum.ongoing:
                newStatus = task_status_enum_1.TaskStatusEnum.completed;
                break;
            case task_status_enum_1.TaskStatusEnum.completed:
            default:
                newStatus = task_status_enum_1.TaskStatusEnum.pending;
                break;
        }
        const updated = await this.prisma.task.update({
            where: { id },
            data: { status: newStatus },
        });
        return updated;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
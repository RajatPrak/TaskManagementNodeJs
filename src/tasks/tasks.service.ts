import {
    ForbiddenException,
Injectable,
NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { TaskStatusEnum } from './task-status.enum';

@Injectable()
export class TasksService {
constructor(private prisma: PrismaService) {}

  private ensureOwnership(task: any, userId: string) {
    if (!task) {
      throw new NotFoundException({ message: 'Task not found', error: 'Not Found' });
    }
    if (task.userId !== userId) {
      throw new ForbiddenException({
        message: 'You do not have access to this task',
        error: 'Forbidden',
      });
    }
  }

  async create(userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? TaskStatusEnum.pending,
        userId,
      },
    });
    return task;
  }

  async findAll(userId: string, query: QueryTasksDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

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

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    this.ensureOwnership(task, userId);
    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    this.ensureOwnership(task, userId);

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title ?? task.title,
        description: dto.description ?? task.description,
        status: dto.status ?? task.status,
      },
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    this.ensureOwnership(task, userId);

    await this.prisma.task.delete({ where: { id } });
    return { success: true };
  }

  async toggleStatus(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    this.ensureOwnership(task, userId);

    let newStatus: TaskStatusEnum;
    switch (task.status) {
      case TaskStatusEnum.pending:
        newStatus = TaskStatusEnum.ongoing;
        break;
      case TaskStatusEnum.ongoing:
        newStatus = TaskStatusEnum.completed;
        break;
      case TaskStatusEnum.completed:
      default:
        newStatus = TaskStatusEnum.pending;
        break;
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });

    return updated;
  }
}
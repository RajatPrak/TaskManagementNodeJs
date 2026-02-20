import {
    Body,
Controller,
Delete,
Get,
HttpCode,
HttpStatus,
Param,
Patch,
Post,
Query,
UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
constructor(private readonly tasksService: TasksService) {}

  // GET /tasks
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @GetUser('userId') userId: string,
    @Query() query: QueryTasksDto,
  ) {
    return this.tasksService.findAll(userId, query);
  }

  // POST /tasks
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser('userId') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(userId, dto);
  }

  // GET /tasks/:id
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.findOne(userId, id);
  }

  // PATCH /tasks/:id
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(userId, id, dto);
  }

  // DELETE /tasks/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    await this.tasksService.remove(userId, id);
  }

  // PATCH /tasks/:id/toggle
  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  toggle(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.toggleStatus(userId, id);
  }
}
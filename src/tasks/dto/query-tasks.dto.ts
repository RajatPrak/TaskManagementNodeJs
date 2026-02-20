import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatusEnum } from '../task-status.enum';

export class QueryTasksDto {
@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
page?: number = 1;

@IsOptional()
@Type(() => Number)
@IsInt()
@Min(1)
@Max(100)
limit?: number = 10;

@IsOptional()
@IsEnum(TaskStatusEnum)
status?: TaskStatusEnum;

@IsOptional()
@IsString()
search?: string;
}
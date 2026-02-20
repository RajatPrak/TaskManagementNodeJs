import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TaskStatusEnum } from '../task-status.enum';

export class UpdateTaskDto {
@IsOptional()
@IsString()
@MinLength(1)
@MaxLength(255)
title?: string;

@IsOptional()
@IsString()
@MaxLength(2000)
description?: string;

@IsOptional()
@IsEnum(TaskStatusEnum)
status?: TaskStatusEnum;
}
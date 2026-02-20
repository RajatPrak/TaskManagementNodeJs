import { TaskStatusEnum } from '../task-status.enum';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatusEnum;
}

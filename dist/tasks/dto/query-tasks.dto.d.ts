import { TaskStatusEnum } from '../task-status.enum';
export declare class QueryTasksDto {
    page?: number;
    limit?: number;
    status?: TaskStatusEnum;
    search?: string;
}

import { IsOptional } from "class-validator";

export class QuestionRequest {
    @IsOptional()
    random: boolean;
}
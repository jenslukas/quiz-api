import { PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import Answer from "../../common/entities/Answer.entity.";
import Question from "../../common/entities/Question.entity.";

export default class CreateQuestionDto extends PickType(Question, ['number', 'question', 'answers'] as const){
    @IsOptional()
    public category: string;

    @IsOptional()
    public number: number;

    @IsNotEmpty()
    public question: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Answer)
    public answers: Answer[];
}
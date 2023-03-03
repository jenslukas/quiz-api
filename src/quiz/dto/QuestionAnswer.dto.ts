import { PickType } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import QuestionAnswer from "../../common/entities/QuestionAnswer.entity";

export default class QuestionAnswerDto {
    @IsNotEmpty()
    public questionId: number;

    @IsNotEmpty()
    public answerIds: string[];
}
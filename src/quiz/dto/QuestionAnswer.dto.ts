import { IsNotEmpty } from "class-validator";
import { QuestionRequest } from "./QuestionRequest.dto";

export default class QuestionAnswerDto extends QuestionRequest {
    @IsNotEmpty()
    public questionId: number;

    @IsNotEmpty()
    public answerIds: string[];
}
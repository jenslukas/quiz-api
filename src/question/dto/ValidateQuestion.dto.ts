import { IsNotEmpty } from "class-validator";

export default class ValidateQuestionDto {
    @IsNotEmpty()
    public answerIds: number[];
}
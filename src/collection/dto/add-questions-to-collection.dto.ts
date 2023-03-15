import { IsNotEmpty } from "class-validator";

export default class AddQuestionToCollection {
    @IsNotEmpty()
    public questionIds: number[];
}
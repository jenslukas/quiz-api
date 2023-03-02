import { IsNotEmpty } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Question from "./Question.entity.";

@Entity()
export default class Answer {
    @PrimaryGeneratedColumn()
    public id: number;

    @IsNotEmpty()
    @Column({type: "text"})
    public answer: string;

    @IsNotEmpty()
    @Column()
    public correct: boolean;

   @ManyToOne(() => Question, (question) => question.answers)
   public question: Question;
}
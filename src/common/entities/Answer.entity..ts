import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Question from "./Question.entity.";

@Entity()
export default class Answer {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: "text"})
    public answer: string;

    @Column()
    public correct: boolean;

   @ManyToOne(() => Question, (question) => question.answers)
   public question: Question;
}
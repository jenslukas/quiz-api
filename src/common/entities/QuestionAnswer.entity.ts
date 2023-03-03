import { Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Answer from "./Answer.entity.";
import Question from "./Question.entity.";
import Run from "./Run.entity";

@Entity()
export default class QuestionAnswer {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Run)
    public run: Run;
    
    @ManyToOne(() => Question)
    public question: Question;

    @ManyToMany(() => Answer)
    @JoinTable()
    public answers: Answer[];
}
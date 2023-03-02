import { Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Answer from "./Answer.entity.";
import Question from "./Question.entity.";

@Entity()
export default class QuestionAnswer {
    @PrimaryGeneratedColumn()
    public id: number;
    
    @OneToOne(() => Question)
    @JoinColumn()
    public question: Question;

    @ManyToMany(() => Answer)
    @JoinTable()
    public answers: Answer[];
}
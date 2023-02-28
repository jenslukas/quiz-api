import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Answer from "./Answer.entity.";
import Category from "./Category.entity";

@Entity()
export default class Question {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Category)
    @JoinColumn()
    public category: Category;

    @Column()
    public number: number;

    @Column({ type: "text" })
    public question: string;

    @Column({ default: false })
    public validated: boolean;

    @OneToMany(() => Answer, (answer) => answer.question)
    @JoinColumn()
    public answers: Answer[];
}
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import Question from "./Question.entity.";

@Entity()
export default class Run {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public code: string;

    @ManyToMany(() => Question)
    @JoinTable()
    public openQuestions: Question[];

    @ManyToMany(() => Question)
    @JoinTable()
    public closedQuestions: Question[];

    @Column({nullable: true})
    public name: string;

    @Column({nullable: true})
    public description: string;

    @Column({ default: false })
    public deleted: boolean;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;
}
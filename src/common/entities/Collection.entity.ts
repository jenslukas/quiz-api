import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Question from "./Question.entity.";

@Entity()
export default class Collection {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column({type: "text", nullable: true})
    public description: string;

    @ManyToMany(() => Question)
    @JoinTable()
    public questions: Question[];
}
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Category {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public short_name: string;

    @Column()
    public long_name: string;
}
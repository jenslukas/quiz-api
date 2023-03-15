import { PickType } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import Collection from "../../common/entities/Collection.entity";

export class CreateCollectionDto extends PickType(Collection, ['name'] as const) {
    @IsNotEmpty()
    public name: string;
}

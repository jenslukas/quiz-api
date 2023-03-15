import { PartialType } from '@nestjs/swagger';
import Collection from '../../common/entities/Collection.entity';
import { CreateCollectionDto } from './create-collection.dto';

export class UpdateCollectionDto extends Collection {}

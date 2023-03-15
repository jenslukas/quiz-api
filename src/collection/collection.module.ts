import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Collection from '../common/entities/Collection.entity';
import Question from '../common/entities/Question.entity.';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Question])],
  controllers: [CollectionController],
  providers: [CollectionService]
})
export class CollectionModule {}

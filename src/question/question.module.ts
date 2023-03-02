import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Question from '../common/entities/Question.entity.';
import Answer from '../common/entities/Answer.entity.';
import Category from '../common/entities/Category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer, Category])],
  controllers: [QuestionController],
  providers: [QuestionService]
})
export class QuestionModule {}

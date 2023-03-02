import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Answer from '../common/entities/Answer.entity.';
import Question from '../common/entities/Question.entity.';
import Run from '../common/entities/Run.entity';
import QuestionAnswer from '../common/entities/QuestionAnswer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Run, Question, Answer, QuestionAnswer])],
  controllers: [QuizController],
  providers: [QuizService]
})
export class QuizModule {}

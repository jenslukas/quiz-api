import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import QuestionAnswerDto from './dto/QuestionAnswer.dto';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService) {}

    @Post()
    createNewRun() {
      return this.quizService.createNewRun();
    }

    @Get(':id')
    getNextQuestion(@Param('id') id: number) {
      return this.quizService.getNextQuestion(id);
    }

    @Post(':id')
    answerQuestion(@Param('id') id: number, @Body() answerDTO: QuestionAnswerDto) {
      return this.quizService.answerQuestion(id, answerDTO.questionId, answerDTO.answerIds);
    }

    @Get(':id/result')
    getResult(@Param('id') id: number) {
      return this.quizService.getResult(id);
    }
}

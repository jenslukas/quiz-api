import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import QuestionAnswerDto from './dto/QuestionAnswer.dto';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService) {}

    @Post('/:code')
    createNewRun(@Param('code') code: string) {
      return this.quizService.createNewRun(code);
    }

    @Get('/id/:runId')
    getNextQuestion(@Param('runId') runId: number) {
      return this.quizService.getNextQuestion(runId);
    }

    @Post('/id/:runId')
    answerQuestion(@Param('runId') runId: number, @Body() answerDTO: QuestionAnswerDto) {
      return this.quizService.answerQuestion(runId, answerDTO.questionId, answerDTO.answerIds);
    }

    @Get('/:id/result')
    getResult(@Param('id') id: number) {
      return this.quizService.getResult(id);
    }

    @Get('/list')
    getRuns() {
      return this.quizService.getRuns();
    }
}

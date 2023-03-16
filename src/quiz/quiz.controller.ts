import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import QuestionAnswerDto from './dto/QuestionAnswer.dto';
import { QuestionRequest } from './dto/QuestionRequest.dto';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService) {}

    @Post('/:code')
    createNewRun(@Param('code') code: string) {
      return this.quizService.createNewRun(code);
    }

    @Post('/wrong/:id')
    createNewWrongRun(@Param('id') id: number) {
      return this.quizService.createNewWrongRun(id);
    }    

    @Get(':id')
    getRun(@Param('id') id: number) {
      return this.quizService.getRun(id);
    }    

    @Get('/id/:runId')
    getNextQuestion(@Param('runId') runId: number, @Query('random') random: boolean) {
      return this.quizService.getNextQuestion(runId, random ?? false);
    }

    @Post('/id/:runId')
    answerQuestion(@Param('runId') runId: number, @Body() answerDTO: QuestionAnswerDto) {
      return this.quizService.answerQuestion(runId, answerDTO);
    }

    @Delete('/:id')
    deleteRun(@Param('id') id: number) {
      return this.quizService.deleteRun(id);
    }

    @Get('/:id/result')
    getResult(@Param('id') id: number) {
      return this.quizService.getResult(id);
    }

    @Get('/list/all')
    getRuns() {
      return this.quizService.getRuns();
    }
}

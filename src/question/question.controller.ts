import { Body, Controller, Get, Post } from '@nestjs/common';
import CreateQuestionDto from './dto/CreateQuestion.dto';
import ValidateQuestionDto from './dto/ValidateQuestion.dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

    @Get()
    async getQuestions() {
      return this.questionService.getAllQuestions();
    }   

    @Post('/add')
    async addQuestion(@Body() addQuestion: CreateQuestionDto) {
      return this.questionService.addQuestion(addQuestion);
    }

    @Get('/validate')
    async getQuestionToValidate() {
      return this.questionService.getQuestionToValidate();
    }

    @Post('/validate')
    async validateAnswers(@Body() dto: ValidateQuestionDto) {
      return this.questionService.validateAnswers(dto.answerIds);
    }
}

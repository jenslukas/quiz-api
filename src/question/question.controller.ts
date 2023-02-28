import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Question from '../common/entities/Question.entity.';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService, 
    @InjectRepository(Question) private questionRepo: Repository<Question>) {}

    @Get()
    async getQuestions() {
      return await this.questionRepo.find();
    }   
}

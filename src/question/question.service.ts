import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Answer from '../common/entities/Answer.entity.';
import Category from '../common/entities/Category.entity';
import Question from '../common/entities/Question.entity.';
import CreateQuestionDto from './dto/CreateQuestion.dto';

@Injectable()
export class QuestionService {

    constructor(@InjectRepository(Question) private questionRepo: Repository<Question>,
        @InjectRepository(Answer) private answerRepo: Repository<Answer>,
        @InjectRepository(Category) private categoryRepo: Repository<Category>) { }

    public async validateAnswers(answerIds: number[]) {
        let questionId = 0;
        for(let answerId of answerIds) {
            let answer = await this.answerRepo.findOne({ where: { id: answerId }, relations: ['question'] });
            questionId = answer.question.id;
            answer.correct = true;
            await this.answerRepo.save(answer);
        }

        let question = await this.questionRepo.findOne({ where: { id: questionId }, relations: ['answers'] });
        question.validated = true;
        await this.questionRepo.save(question);
    }

    public async getAllQuestions() {
        return await this.questionRepo.find();
    }

    public async getQuestionToValidate() {
        let q = await this.questionRepo.findOne({ where: { validated: false }, relations: ['answers'] });
        if(q) {
          return q;
        } else {
           throw new NotFoundException();
        }
    }

    async addQuestion(addQuestion: CreateQuestionDto) {
        console.log(addQuestion);
  
        // find category by short name
        let category = await this.categoryRepo.findOne({ where: {short_name: addQuestion.category}});
        if(!category) {
          category = new Category();
          category.short_name = addQuestion.category;
          category = await this.categoryRepo.save(category);
        }
        
        // store question in database
        let question = new Question();
        question.question = addQuestion.question;
        question.validated = false;
        question.category = category;
        
        if(addQuestion.number) {
          question.number = addQuestion.number;
        }
        
        question = await this.questionRepo.save(question);
    
        // create answers, if available
        if(addQuestion.answers) {
          for(let answer of addQuestion.answers) {
            // store answers in database
            let a = new Answer();
            a.answer = answer.answer;
            a.correct = answer.correct;
            a.question = question;
  
            await this.answerRepo.save(a);
          }
        }
  
        return question;
      }    
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Answer from '../common/entities/Answer.entity.';
import Question from '../common/entities/Question.entity.';
import QuestionAnswer from '../common/entities/QuestionAnswer.entity';
import Run from '../common/entities/Run.entity';

@Injectable()
export class QuizService {
    
    constructor(
        @InjectRepository(Question) private questionRepo: Repository<Question>,
        @InjectRepository(Answer) private answerRepo: Repository<Answer>,
        @InjectRepository(Run) private runRepo: Repository<Run>,
        @InjectRepository(QuestionAnswer) private questionAnswerRepo: Repository<QuestionAnswer>
        ) {}

    public async createNewRun() {
        // by now we get all questions
        let run = new Run();
        run.code = '1234';
        run.openQuestions = await this.questionRepo.find();
        run = await this.runRepo.save(run);

        return run;
    }

    public async getNextQuestion(id: number) {
        // get next open question for run with id
        let run = await this.runRepo.findOne({ where: { id: id}, relations: ['openQuestions']});
        let question = run.openQuestions.pop();
        return question;
    }

    public checkAnswer(question: Question, answers: Answer[]) {
        // check if answers are correct
        // return true if correct, false if not
        let correct = true;
        for(let i = 0; i < answers.length; i++) {
            let answer = answers[i];
            let found = false;
            for(let j = 0; j < question.answers.length; j++) {
                if(question.answers[j].id === answer.id) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                correct = false;
                break;
            }
        }

        return correct;
    }

    public async getResult(id: number) {
        // get result for run with id
        let run = await this.runRepo.findOne({ where: { id: id}, relations: ['closedQuestions', 'closedQuestions.answers']});
        let result = {
            openQuestions: 0,
            closedQuestions: 0,
            correctAnswers: 0,
            wrongAnswers: 0
        };

        result.openQuestions = run.openQuestions.length;
        result.closedQuestions = run.closedQuestions.length;

        for(let i = 0; i < run.closedQuestions.length; i++) {
            let question = run.closedQuestions[i];
            // skip question if not validated
            if(question.validated === false) break;

            let questionAnswer = await this.questionAnswerRepo.findOne({ where: { question: question}, relations: ['answers']});
            if(this.checkAnswer(question, questionAnswer.answers)) {
                result.correctAnswers++;
            } else {
                result.wrongAnswers++;
            }
        }

        return result;
    }

    public async answerQuestion(id: number, question: number, answers: number[]) {
        // save answer for question for run with id
        let run = await this.runRepo.findOne({ where: { id: id}, relations: ['openQuestions', 'closedQuestions']});
        let questionEntity = await this.questionRepo.findOne({ where: { id: question}, relations: ['answers']});

        if(!question) {
            return 'Invalid question';
        }

        // check if question is already answered
        // if yes, return error
        for(let i = 0; i < run.closedQuestions.length; i++) {
            if(run.closedQuestions[i].id === question) {
                return 'Question already answered';
            }
        }

        // check if question is open
        // if not, return error
        for(let i = 0; i < run.openQuestions.length; i++) {
            if(run.openQuestions[i].id === question) {
                // remove question from open questions
                run.openQuestions.splice(i, 1);

                break;
            }
            if(i === run.openQuestions.length - 1) {
                return 'Question not open';
            }
        }

        // check if all answers are valid
        // if not, return error
        let answerList = [];
        for(let i = 0; i < answers.length; i++) {
            let answer = answers[i];
            let found = false;
            for(let j = 0; j < questionEntity.answers.length; j++) {
                if(questionEntity.answers[j].id === answer) {
                    answerList.push(questionEntity.answers[j]);
                    found = true;
                    break;
                }
            }
            if(!found) {
                return 'Invalid answer';
            }
        }


        // store QuestionAnswer
        let questionAnswer = new QuestionAnswer();
        questionAnswer.question = questionEntity;
        questionAnswer.answers = answerList;
        questionAnswer = await this.questionAnswerRepo.save(questionAnswer);
        
        run.closedQuestions.push(questionEntity);
        run = await this.runRepo.save(run);
        return run;
    }
    
}

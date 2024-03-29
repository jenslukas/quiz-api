import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Answer from '../common/entities/Answer.entity.';
import Question from '../common/entities/Question.entity.';
import QuestionAnswer from '../common/entities/QuestionAnswer.entity';
import Run from '../common/entities/Run.entity';
import QuestionAnswerDto from './dto/QuestionAnswer.dto';

@Injectable()
export class QuizService {
    
    constructor(
        @InjectRepository(Question) private questionRepo: Repository<Question>,
        @InjectRepository(Answer) private answerRepo: Repository<Answer>,
        @InjectRepository(Run) private runRepo: Repository<Run>,
        @InjectRepository(QuestionAnswer) private questionAnswerRepo: Repository<QuestionAnswer>
        ) {}

    public async createNewRun(code: string) {
        // by now we get all questions
        let run = new Run();
        run.code = code;
        run.openQuestions = await this.questionRepo.find();
        run = await this.runRepo.save(run);

        return run;
    }

    public async createNewWrongRun(id: number) {
        let previousRun = await this.runRepo.findOne({ where: { id: id}, relations: ['openQuestions', 'closedQuestions']});
        if(!previousRun) {
            throw new NotFoundException();
        }

        let result = await this.getResult(id);
        let wrongQuestions = result.wrongClosedQuestions;

        // create new run with all wrong questions
        let run = new Run();
        run.code = previousRun.code + ' - wrong rerun';
        run.openQuestions = wrongQuestions;
        run = await this.runRepo.save(run);

        return run;
    }    

    public async getNextQuestion(runId: number, random : boolean) {
        // get next open question for run with id
        let run = await this.runRepo.findOne({ where: { id: runId}, relations: ['openQuestions']});
        
        // get first new question or random one
        let question; 
        if(random) {
            let index = Math.floor(Math.random() * run.openQuestions.length);
            question = run.openQuestions[index];
        } else {
            question = run.openQuestions.shift();
        }

        question = await this.questionRepo.findOne({ where: { id: question.id}, relations: ['answers']});
        if(!question) {
            throw new NotFoundException();
        }
        return question;
    }

    public checkAnswer(question: Question, answers: Answer[]) {
        // check if answers are correct
        // return true if correct, false if not
        let correct = true;
        for(let i = 0; i < question.answers.length; i++) {
            let questionAnswer = question.answers[i];
            
            let found = false;
            for(let j = 0; j < answers.length; j++) {
                let userAnswer = answers[j];

                if(questionAnswer.id === userAnswer.id) {
                    found = true;
                    break;
                }
            }

            if(questionAnswer.correct && !found) {
                correct = false;
                break;
            }

            if(!questionAnswer.correct && found) {
                correct = false;
                break;
            }
        }

        return correct;
    }

    public async getResult(runId: number) {
        // get result for run with id
        let currentRun = await this.runRepo.findOne({ where: { id: runId}, relations: ['openQuestions', 'closedQuestions', 'closedQuestions.answers']});
        let result = {
            openQuestions: 0,
            closedQuestions: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            correctClosedQuestions: [],
            wrongClosedQuestions: []
        };

        result.openQuestions = currentRun.openQuestions.length;
        result.closedQuestions = currentRun.closedQuestions.length;

        for(let i = 0; i < currentRun.closedQuestions.length; i++) {
            let question = currentRun.closedQuestions[i];
            // skip question if not validated
            if(question.validated === false) break;

            let questionAnswer = await this.questionAnswerRepo.findOne({ where: { run: { id: runId}, question: { id: question.id}}, relations: ['answers']});
            if(this.checkAnswer(question, questionAnswer.answers)) {
                result.correctAnswers++;
                result.correctClosedQuestions.push(question);
            } else {
                result.wrongAnswers++;
                result.wrongClosedQuestions.push(question);
            }
        }

        return result;
    }

    public async getRun(id: number) {
        let run = await this.runRepo.findOne({ where: { id: id}, relations: ['openQuestions', 'closedQuestions']});

        if(!run) {
            throw new NotFoundException();
        } else {
            // get result of closed questions
            let result = await this.getResult(id);
            
            return result;
        }
    }

    public async getRuns() {
        // get all runs
        let runs = await this.runRepo.find({ where: { deleted: false }, relations: ['openQuestions', 'closedQuestions']});

        let runInfoList = [];
        // sum up run stats
        for(let i = 0; i < runs.length; i++) {
            let run = runs[i];
            let result = await this.getResult(run.id);

            let runInfo = {
                id: run.id,
                code: run.code,
                openQuestions: result.openQuestions,
                closedQuestions: result.closedQuestions,
                correctAnswers: result.correctAnswers,
                wrongAnswers: result.wrongAnswers
            }
            runInfoList.push(runInfo);
        }
        
        return runInfoList;
    }

    public async answerQuestion(runId: number, questionDto : QuestionAnswerDto) {
        let question = questionDto.questionId;
        let answers = questionDto.answerIds;
        let random = questionDto.random ?? false;

        // save answer for question for run with id
        let run = await this.runRepo.findOne({ where: { id: runId}, relations: ['openQuestions', 'closedQuestions']});
        let questionEntity = await this.questionRepo.findOne({ where: { id: question}, relations: ['answers']});

        if(!questionEntity) {
            throw new BadRequestException('Question not found');
        }

        // check if question is already answered
        // if yes, return error
        for(let i = 0; i < run.closedQuestions.length; i++) {
            if(run.closedQuestions[i].id === question) {
                throw new BadRequestException(' Question already answered');
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
                throw new BadRequestException(' Question not part of this Quiz Run');
            }
        }

        // check if all answers are valid
        // if not, return error
        let answerList = [];
        for(let i = 0; i < answers.length; i++) {
            let answer : number = parseInt(answers[i]);
            let found = false;
            for(let j = 0; j < questionEntity.answers.length; j++) {
                let curAnswer = questionEntity.answers[j];
                if(curAnswer.id === answer) {
                    answerList.push(questionEntity.answers[j]);
                    found = true;
                    break;
                }
            }
            if(!found) {
                throw new BadRequestException('Answer not part of the Question');
            }
        }


        // store QuestionAnswer
        let questionAnswer = new QuestionAnswer();
        questionAnswer.run = run;
        questionAnswer.question = questionEntity;
        questionAnswer.answers = answerList;
        questionAnswer = await this.questionAnswerRepo.save(questionAnswer);
        
        run.closedQuestions.push(questionEntity);
        run = await this.runRepo.save(run);

        let correct = this.checkAnswer(questionEntity, answerList);

        // get next question
        let nextQuestion = null;
        
        try {
            nextQuestion = await this.getNextQuestion(runId, random);
        } catch (e) {

        }

        let result = {
            correct: correct,
            formerQuestion: questionEntity,
            formerAnswers: answerList,
            nextQuestion: nextQuestion
        }
        
        return result;
    }
    
    public async deleteRun(id: number) {
        // delete run with id
        let run = await this.runRepo.findOne({ where: { id: id}, relations: ['openQuestions', 'closedQuestions']});
        if(!run) {
            throw new NotFoundException();
        } else {
            run.deleted = true;
            await this.runRepo.save(run);
        }
        return
    }
}

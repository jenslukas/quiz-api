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

    public async createNewRun(code: string) {
        // by now we get all questions
        let run = new Run();
        run.code = code;
        run.openQuestions = await this.questionRepo.find();
        run = await this.runRepo.save(run);

        return run;
    }

    public async getNextQuestion(runId: number) {
        // get next open question for run with id
        let run = await this.runRepo.findOne({ where: { id: runId}, relations: ['openQuestions']});
        let question = run.openQuestions.shift();
        question = await this.questionRepo.findOne({ where: { id: question.id}, relations: ['answers']});
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
            wrongAnswers: 0
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
            } else {
                result.wrongAnswers++;
            }
        }

        return result;
    }

    public async getRuns() {
        // get all runs
        let runs = await this.runRepo.find({ relations: ['openQuestions', 'closedQuestions']});

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

    public async answerQuestion(runId: number, question: number, answers: string[]) {
        // save answer for question for run with id
        let run = await this.runRepo.findOne({ where: { id: runId}, relations: ['openQuestions', 'closedQuestions']});
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
                return 'Invalid answer';
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
        return run;
    }
    
}

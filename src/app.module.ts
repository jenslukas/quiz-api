import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import Answer from './common/entities/Answer.entity.';
import Category from './common/entities/Category.entity';
import Collection from './common/entities/Collection.entity';
import Question from './common/entities/Question.entity.';
import { QuestionModule } from './question/question.module';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      "type": "mysql",
      "host": "127.0.0.1",
      "port": 3307,
      "username": "root",
      "password": "root",
      "database": "quiz",
      /*
      "type": "mysql",
      "host": config.get<string>('DB_HOST'),
      "port": config.get<number>('DB_PORT'),
      "username": config.get<string>('DB_USER'),
      "password": config.get<string>('DB_PASSWORD'),
      "database": config.get<string>('DB_NAME'),
      */
      "synchronize": true,
      "logging": true,
      "entities": [Question, Answer, Collection, Category]
    }),
     inject: [ConfigService]
  }), QuestionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
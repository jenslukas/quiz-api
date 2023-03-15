import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Collection from '../common/entities/Collection.entity';
import Question from '../common/entities/Question.entity.';
import AddQuestionToCollection from './dto/add-questions-to-collection.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection) private collectionRepo: Repository<Collection>,
    @InjectRepository(Question) private questionRepo: Repository<Question>
   ) {}

  async create(createCollectionDto: CreateCollectionDto) {
    let coll = new Collection();
    coll.name = createCollectionDto.name;
    coll = await this.collectionRepo.save(coll);
    return coll;
  }

  async addQuestionCollection(id: number, addQuestionCollection: AddQuestionToCollection) {
    console.log(addQuestionCollection)
    let coll = await this.collectionRepo.findOne({ where: { id: id }, relations: ['questions']});
    if(coll) {
      // get all questions
      let questions = addQuestionCollection.questionIds;
      for(let i = 0; i < questions.length; i++) {
        let q = await this.questionRepo.findOne({ where: { id: questions[i]}});
        if(q) {
          coll.questions.push(q);
        }
      }
      console.log(coll);
      this.collectionRepo.save(coll);
    } else {
      throw new NotFoundException();
    }
  }

  findAll() {
    return `This action returns all collection`;
  }

  findOne(id: number) {
    return `This action returns a #${id} collection`;
  }

  update(id: number, updateCollectionDto: UpdateCollectionDto) {
    return `This action updates a #${id} collection`;
  }

  remove(id: number) {
    return `This action removes a #${id} collection`;
  }
}

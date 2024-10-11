import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';

import OpenAI from 'openai';
import { EventEntity } from '../event/event.entity';
import { ParticipationEntity } from '../participation/participation.entity';

const token =
  'REDACTED';
const endpoint = 'https://models.inference.ai.azure.com';
const modelName = 'gpt-4o';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: MongoRepository<UserEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepository: MongoRepository<EventEntity>,
    @InjectRepository(ParticipationEntity)
    private readonly participationRepository: MongoRepository<ParticipationEntity>,
  ) {}

  async findOne(id: ObjectId) {
    const id_num = new ObjectId(id);
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(id_num) },
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${id}`);
    }

    return user;
  }

  async getUserInfos(userId: ObjectId) {
    const user = await this.userRepository.findOne({
      select: ['_id', 'email', 'username', 'preferences'],
      where: { _id: new ObjectId(userId) },
    });

    return user;
  }

  async updatePassword(
    userId: ObjectId,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) },
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${userId}`);
    }

    if (!oldPassword) {
      throw new NotFoundException("Couldn't find old password");
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { success: true };
  }

  async updateEmail(userId: ObjectId, email: string) {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) },
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${userId}`);
    }

    user.email = email;
    await this.userRepository.save(user);

    return { success: true };
  }

  async updatePreferences(userId: ObjectId, preferences: string[]) {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) },
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${userId}`);
    }

    user.preferences = preferences;
    await this.userRepository.save(user);

    return { success: true };
  }

  async deleteAccount(userId: ObjectId) {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) },
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${userId}`);
    }

    await this.userRepository.delete({ _id: new ObjectId(userId) });

    return { success: true };
  }

  async getUserSuggestions(userId: ObjectId) {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(userId) },
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${userId}`);
    }

    const allEvents = await this.eventRepository.find();
    const participations = await this.participationRepository.find({
      where: {
        'user._id': new ObjectId(userId),
      },
    });
    const attendedEvents = participations.map(
      (participation) => participation.event._id,
    );
    const filteredEvents = allEvents.filter(
      (event) =>
        !attendedEvents.includes(event._id) &&
        event.tags &&
        event.tags.length > 0,
    );
    const toSend = filteredEvents.map((event) => {
      return { _id: event._id, tags: event.tags };
    });

    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    try {
      console.log(
        'Sending messages to AI : ',
        user.preferences,
        toSend.map((event) => event._id + ' ' + event.tags.join(' ')),
      );
      const response = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant helping a user find events they might like. We are sending you the users preferences and a list of all events existing in the database (you only get their ID and tags). Please suggest some events that the user might like according to the events tags. It is important that you only return a raw json object with all the selected IDs (example : { "ids": ["1234", "5678"]} do not try to format it please only send the raw json). YOU ARE FORBIDDEN TO USE MARKDOWN. You have to return 3 events. So take the ones that fits the best the user preferences. If user doesn\'t have preferences or there are no corresponding events, just return random events. If you are unable to find any events, just return {"ids": []}',
          },
          {
            role: 'user',
            content:
              "Here are the user's preferences: " +
              user.preferences.join(' ') +
              'Now here is the list of all events in the database: ' +
              toSend.map((event) => event._id + ' ' + event.tags.join(' ')),
          },
        ],
        temperature: 1.0,
        top_p: 1.0,
        max_tokens: 1000,
        model: modelName,
      });

      const jsonParsed = this.parseJson(response.choices[0].message.content);
      const events = jsonParsed.ids.map((id) => {
        return filteredEvents.find((event) =>
          event._id.equals(new ObjectId(id)),
        );
      });

      return {
        success: true,
        suggestions: events,
      };
    } catch (error) {
      console.error('Error generating user suggestions :', error);
      throw new Error('Failed to generate user suggestions');
    }
  }

  private parseJson(jsonString: string) {
    console.log('Json string :', jsonString);
    const json = jsonString.replace(/'/g, '"');
    return JSON.parse(json);
  }
}

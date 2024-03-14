import { User, Quiz } from './returnInterfaces';

export interface DataStore {
  users: User[];
  quizzes: Quiz[];
}
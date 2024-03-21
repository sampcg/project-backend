import { User, Quiz, Trash } from './returnInterfaces';

export interface DataStore {
  users: User[];
  quizzes: Quiz[];
  trash: Trash[],
}
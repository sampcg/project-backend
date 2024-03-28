import { User, Quiz, Token } from './returnInterfaces';

export interface DataStore {
  users: User[],
  quizzes: Quiz[],
  trash: Quiz[],
  token: Token[]
}

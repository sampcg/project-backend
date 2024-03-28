import { User, Quiz, Trash, Token } from './returnInterfaces';

export interface DataStore {
  users: User[],
  quizzes: Quiz[],
  trash: Trash[],
  token: Token[]
}

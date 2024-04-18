import { User, Quiz, Token, Session } from './returnInterfaces';

export interface DataStore {
  users: User[],
  quizzes: Quiz[],
  trash: Quiz[],
  token: Token[],
  session: Session[],
  guest: Guest[]
}

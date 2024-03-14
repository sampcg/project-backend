export type EmptyObject = Record<string, never>;

export interface ErrorObject {
  error: string;
}

export interface User {
  userId: number;
  name: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface Quiz {
  userId: number;
  quizId: number;
  quizName: string;
  quizDescription: string;
  timeCreated: number;
  timeLastEdited: number;
}


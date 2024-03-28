export type EmptyObject = Record<string, never>;

export interface ErrorObject {
  error: string;
  code?: number;
}
export interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface Question {
  questionId: number,
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
  position: number;
}

export interface User {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  oldPassword: string;
  newPassword: string;
}

export interface Quiz {
  userId?: number;
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
}

export interface Token {
  userId: number;
  sessionId: string;
}

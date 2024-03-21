export type EmptyObject = Record<string, never>;

export interface ErrorObject {
  error: string;
}
export interface Answer {
  answer: string;
  correct: boolean;
}
export interface Question {
  questionId: number,
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
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
  userId: number;
  quizId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  questions: Question[];
}

export interface Trash {
  userId: number;
  quizId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
}


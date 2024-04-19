export type EmptyObject = Record<string, never>;

export interface ErrorObject {
  error: string;
  code: number;
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
  thumbnailUrl: string;
  position: number;
}

export interface QuestionInfo {
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

export interface Player {
  name: string;
  playerId: number;
}

export interface Quiz {
  userId: number;
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
  thumbnailUrl: string;
}

export interface QuizInfo {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: QuestionInfo[];
  duration: number;
  thumbnailUrl: string;
}

export interface Token {
  userId: number;
  sessionId: string;
}

export enum States {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_CLOSE',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum Actions {
  NextQuestion = 'NEXT_QUESTION',
  SkipCountdown = 'SKIP_COUNTDOWN',
  GoToAnswer = 'GO_TO_ANSWER',
  GoToFinalResults = 'GO_TO_FINAL_RESULTS',
  End = 'END'
}

export interface Session {
  quizSessionId: number;
  quiz: Quiz;
  state: States;
  atQuestion: number;
  players: Player[];
  autoStartNum: number;
}

export interface FinalResults {
  usersRankedByScore: UserRankedByScore[];
  questionResults: QuestionResult[];
}

export interface UserRankedByScore {
  name: string;
  score: number;
}

export interface QuestionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

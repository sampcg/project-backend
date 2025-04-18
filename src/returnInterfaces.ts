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
  score: number;
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

export interface Message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

export interface PlayerAnswer {
  playerId: number;
  answersId: number[];
  questionPosition: number;
  timeAnswered: number;
  isCorrect: boolean;
}

export interface Session {
  quizSessionId: number;
  quiz: Quiz;
  state: States;
  atQuestion: number;
  players: Player[];
  playerAnswers: PlayerAnswer[];
  autoStartNum: number;
  messages: Message[];
}

export interface SessionStatus {
  state: States;
  atQuestion: number;
  players: string[];
  metadata: QuizInfo;
}

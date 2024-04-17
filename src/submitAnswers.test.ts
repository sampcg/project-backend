import {
  adminQuizCreateV2,
  adminAuthRegister,
  clear,
  adminSessionStart,
  adminQuestionCreateV2,
  addPlayerToSession,
  adminSessionStatus,
  submitAnswers,
  adminSessionUpdate,
  adminQuizInfo,
  findCorrectAnswerIds,
  getQuestionResults
}; 
import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };
const anyNumber = expect.any(Number);
const SUCCESS = 200;
const BADREQUEST = 400;
const UNAUTHORIZED = 401;

let user: any;
let quizId: number;
let sessionId: number;
let player: number;
beforeEach(() => {
  clear();
  user = adminAuthRegister('hayden123@unsw.edu.au', '1234123abcd@#$', 'Haydennn', 'Smith');
  quizId = adminQuizCreateV2(user.body.token, 'RandomQuiz', 'I dont know what to type').body.quizId;
  adminQuestionCreateV2(user.body.token, quizId, 'What course?', 4, 3, 'COMP1531', true);
  sessionId = adminSessionStart(quizId, user.body.token, 5).body.sessionId;
  player = addPlayerToSession(sessionId, 'Hayden').body.playerId;
});
describe('Errors', () => {
  test('Invalid Player Id', () => {
    adminSessionUpdate(quizId, sessionId, user.body.token, Action.NEXT_QUESTION);
    adminSessionUpdate(quizId, sessionId, user.body.token, Action.QUESTION_OPEN);
    const status = adminSessionStatus(quizId, sessionId, user.body.token);
    const quizInfo = adminQuizInfo(user.body.token, quizId);
    const correctAnswer = findCorrectAnswerIds(quizInfo.body);
    const successView = submitAnswers(correctAnswer, -1, status.body.atQuestion);
    expect(successView.statusCode).toStrictEqual(BAD_REQUEST);
    expect(successView.body).toStrictEqual(ERROR);
  });

  test('Incorrect Quiz Position', () => {
    adminSessionUpdate(quizId, sessionId, user.body.token, Action.NEXT_QUESTION);
    adminSessionUpdate(quizId, sessionId, user.body.token, Action.QUESTION_OPEN);
    const quizInfo = adminQuizInfo(user.body.token, quizId);
    const correctAnswer = findCorrectAnswerIds(quizInfo.body);
    const successView = submitAnswers(correctAnswer, player, -1);
    expect(successView.statusCode).toStrictEqual(BAD_REQUEST);
    expect(successView.body).toStrictEqual(ERROR);
  });

});

describe('Success', () => {
  test('Return type', () => {
    const quizInfo = adminQuizInfo(user.body.token, quizId);
    const correctAnswer = findCorrectAnswerIds(quizInfo.body);
    adminSessionUpdate(quizId, sessionId, user.body.token, Action.NEXT_QUESTION);
    adminSessionUpdate(quizId, sessionId, user.body.token, Action.QUESTION_OPEN);
    const status = adminSessionStatus(quizId, sessionId, user.body.token);
    const successView = submitAnswers(correctAnswer, player, status.body.atQuestion);
    expect(successView.statusCode).toStrictEqual(SUCCESS);

    adminQuestionCreateV2(user.body.token, quizId, 'New Course?', 4, 3, 'COMP1531', false);
    adminSessionUpdate(quizId, sessionId, user.body.token, Action.NEXT_QUESTION);
    adminSessionUpdate(quizId, sessionId, user.body.token, Action.GO_TO_ANSWER);
    const successView2 = getQuestionResults(player, status.body.atQuestion);
    expect(successView2.statusCode).toStrictEqual(SUCCESS);
  });
});

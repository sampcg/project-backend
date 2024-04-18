import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { IncomingHttpHeaders } from 'http';
import { Quiz, States, Actions } from './returnInterfaces';

interface AnswerInput {
  answer: string;
  correct: boolean;
}

interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerInput[];
  thumbnailUrl: string;
}

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };
// const anyNumber = expect.any(Number);
const SUCCESS = 200;
const BADREQUEST = 400;
// const UNAUTHORIZED = 401;

// helper functions
function findCorrectAnswerIds(quiz: Quiz): number[] {
  const correctAnswerIds: number[] = [];

  for (const question of quiz.questions) {
    const correctAnswers = question.answers.filter(answer => answer.correct);
    correctAnswerIds.push(...correctAnswers.map(answer => answer.answerId));
  }

  return correctAnswerIds;
}

export const createRequest = (method: HttpVerb, path: string, payload: object, headers: IncomingHttpHeaders = {}) => {
  let qs = {};
  let json = {};
  json = payload;
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  }
  const requestOptions = {
    qs,
    json,
    timeout: 10000,
    headers: {
      ...(headers || {}),
      token: headers?.token,
    },
  };
  const res = request(method, SERVER_URL + path, requestOptions);
  const responseBody = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, body: responseBody };
};

/// ///////////////////////// Wrapper Functions /////////////////////////////////
const clear = () => {
  return createRequest('DELETE', '/v1/clear', {});
};

const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return createRequest('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

const adminQuizCreateV2 = (token: string, name: string, description: string) => {
  return createRequest('POST', '/v2/admin/quiz', { name, description }, { token });
};

const adminQuestionCreateV2 = (token: string, quizId: number, questionBody: QuestionBody) => {
  return createRequest('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
};

const adminQuizInfo = (token: string, quizId: number) => {
  return createRequest('GET', `/v2/admin/quiz/${quizId}`, { quizId }, { token });
};

const adminSessionStart = (quizId: number, token: string, autoStartNum: number) => {
  return createRequest('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });
};

const adminSessionStatus = (quizId: number, sessionid: number, token: string) => {
  return createRequest('GET', `/v1/admin/quiz/${quizId}/session/${sessionid}`, {}, { token });
};

const adminSessionUpdate = (quizId: number, sessionId: number, token: string, action: string) => {
  return createRequest('PUT', `/v1/admin/quiz/${quizId}/session/${sessionId}`, { action }, { token });
};

const createGuestPlayer = (sessionId: number, name: string) => {
  return createRequest('POST', '/v1/player/join', { sessionId, name });
};

// const getPlayerStatus = (playerid: number) => {
//   return createRequest('GET', `/v1/player/${playerid}`, {});
// };

const playerQuestionView = (playerId: number, questionPosition: number) => {
  return createRequest('GET', '/v1/player/' + playerId + '/question/' + questionPosition, { playerId, questionPosition });
};

const submitAnswers = (answerIds: number[], playerId: number, questionPosition: number) => {
  const answerId = JSON.stringify(answerIds);
  return createRequest('PUT', '/v1/player/' + playerId + '/question/' + questionPosition + '/answer', { answerId, playerId, questionPosition });
};

const getQuestionResults = (playerId: number, questionPosition: number) => {
  return createRequest('GET', '/v1/player/' + playerId + '/question/' + questionPosition + '/results', { playerId, questionPosition });
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  clear();
});

let user: { statusCode: number; body: {token: string}; };
let quizId: number;
let sessionId: number;
let player: number;
let question: string, duration: number, points: number, answers: AnswerInput[], thumbnailUrl: string;
beforeEach(() => {
  user = adminAuthRegister('hayden123@unsw.edu.au', '1234123abcd@#$', 'Haydennn', 'Smith');
  quizId = adminQuizCreateV2(user.body.token, 'RandomQuiz', 'I dont know what to type').body.quizId;
  // Standard values
  question = 'Question';
  duration = 1;
  points = 1;
  answers =
           [{
             answer: 'Answer 1',
             correct: true
           },
           {
             answer: 'Answer 2',
             correct: false
           }];
  thumbnailUrl = 'http://google.com/some/image/path.jpg';
  const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
  adminQuestionCreateV2(user.body.token, quizId, questionBody);
  sessionId = adminSessionStart(quizId, user.body.token, 5).body.sessionId;
  player = createGuestPlayer(sessionId, 'Hayden').body.playerId;
});

// player submission of answers
describe('Errors', () => {
  test('Invalid Player Id', () => {
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.NextQuestion);
    adminSessionUpdate(quizId, sessionId, user.body.token, States.QUESTION_OPEN);
    const status = adminSessionStatus(quizId, sessionId, user.body.token);
    const quizInfo = adminQuizInfo(user.body.token, quizId);
    const correctAnswer = findCorrectAnswerIds(quizInfo.body);
    const successView = submitAnswers(correctAnswer, -1, status.body.atQuestion);
    expect(successView.statusCode).toStrictEqual(BADREQUEST);
    expect(successView.body).toStrictEqual(ERROR);
  });

  test('Incorrect Quiz Position', () => {
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.NextQuestion);
    adminSessionUpdate(quizId, sessionId, user.body.token, States.QUESTION_OPEN);
    const quizInfo = adminQuizInfo(user.body.token, quizId);
    const correctAnswer = findCorrectAnswerIds(quizInfo.body);
    const successView = submitAnswers(correctAnswer, player, -1);
    expect(successView.statusCode).toStrictEqual(BADREQUEST);
    expect(successView.body).toStrictEqual(ERROR);
  });
});

describe('Success', () => {
  test('Return type', () => {
    const quizInfo = adminQuizInfo(user.body.token, quizId);
    const correctAnswer = findCorrectAnswerIds(quizInfo.body);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.NextQuestion);
    adminSessionUpdate(quizId, sessionId, user.body.token, States.QUESTION_OPEN);
    const status = adminSessionStatus(quizId, sessionId, user.body.token);
    const successView = submitAnswers(correctAnswer, player, status.body.atQuestion);
    expect(successView.statusCode).toStrictEqual(SUCCESS);
    // Standard values
    question = 'Question';
    duration = 1;
    points = 1;
    answers =
             [{
               answer: 'Answer 1',
               correct: true
             },
             {
               answer: 'Answer 2',
               correct: false
             }];
    thumbnailUrl = 'http://google.com/some/image/path.jpg';
    const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
    adminQuestionCreateV2(user.body.token, quizId, questionBody);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.NextQuestion);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.GoToAnswer);
    const successView2 = getQuestionResults(player, status.body.atQuestion);
    expect(successView2.statusCode).toStrictEqual(SUCCESS);
  });
});

// results for a question
describe('Errors', () => {
  test('Invalid Player Id', () => {
    const status = adminSessionStatus(quizId, sessionId, user.body.token);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.NextQuestion);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.NextQuestion);
    const successView = playerQuestionView(player - 99, status.body.atQuestion);
    expect(successView.statusCode).toStrictEqual(BADREQUEST);
    expect(successView.body).toStrictEqual(ERROR);
  });

  test('Question Position is Invalid', () => {
    question = 'New Course?';
    duration = 4;
    points = 3;
    answers =
             [{
               answer: 'Answer 1',
               correct: false
             },
             {
               answer: 'Answer 2',
               correct: false
             }];
    thumbnailUrl = 'http://google.com/some/image/path.jpg';
    const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
    adminQuestionCreateV2(user.body.token, quizId, questionBody);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.NextQuestion);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.NextQuestion);
    const successView = getQuestionResults(player, -7);
    const successView2 = getQuestionResults(player, 2);
    expect(successView.statusCode).toStrictEqual(BADREQUEST);
    expect(successView.body).toStrictEqual(ERROR);
    expect(successView2.statusCode).toStrictEqual(BADREQUEST);
    expect(successView2.body).toStrictEqual(ERROR);
  });

  test('Session is not in LOBBY state', () => {
    const status = adminSessionStatus(quizId, sessionId, user.body.token);
    question = 'New Course?';
    duration = 4;
    points = 3;
    answers =
             [{
               answer: 'Answer 1',
               correct: true
             },
             {
               answer: 'Answer 2',
               correct: false
             }];
    thumbnailUrl = 'http://google.com/some/image/path.jpg';
    const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
    adminQuestionCreateV2(user.body.token, quizId, questionBody);
    const successView = getQuestionResults(player, status.body.atQuestion);
    expect(successView.statusCode).toStrictEqual(BADREQUEST);
    expect(successView.body).toStrictEqual(ERROR);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.End);
    const successView2 = getQuestionResults(player, status.body.atQuestion);
    expect(successView2.statusCode).toStrictEqual(BADREQUEST);
    expect(successView2.body).toStrictEqual(ERROR);
  });
});

describe('Success', () => {
  test('Return type', () => {
    question = 'New Course?';
    duration = 4;
    points = 3;
    answers =
             [{
               answer: 'Answer 1',
               correct: true
             },
             {
               answer: 'Answer 2',
               correct: false
             }];
    thumbnailUrl = 'http://google.com/some/image/path.jpg';
    const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
    adminQuestionCreateV2(user.body.token, quizId, questionBody);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.NextQuestion);
    adminSessionUpdate(quizId, sessionId, user.body.token, Actions.GoToAnswer);
    const status = adminSessionStatus(quizId, sessionId, user.body.token);
    const successView = getQuestionResults(player, status.body.atQuestion);
    expect(successView.statusCode).toStrictEqual(SUCCESS);
  });
});

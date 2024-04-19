import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from '../config.json';
import { IncomingHttpHeaders } from 'http';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };
const SUCCESS = 200;
const BADREQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;

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

const adminQuizTransfer = (quizId: number, token: string, userEmail: string) => {
  return createRequest('POST', `/v1/admin/quiz/${quizId}/transfer`, { quizId, token, userEmail });
};
const adminQuizTransferV2 = (quizId: number, token: string, userEmail: string) => {
  return createRequest('POST', `/v2/admin/quiz/${quizId}/transfer`, { quizId, userEmail }, { token });
};
/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  clear();
});

describe('adminQuizTransfer function tests', () => {
  let user: { statusCode: number; body: {token: string}; };
  let user2: { statusCode: number; body: {token: string}; };
  let quiz: { statusCode: number; body: {quizId: number}; };
  let quiz2: { statusCode: number; body: {quizId: number}; };
  beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
    user2 = adminAuthRegister('validemail@gmail.com', '123456ABC', 'Jake', 'Renzella');
    quiz = adminQuizCreateV2(user.body.token, 'my quiz name', 'my quiz description');
    quiz2 = adminQuizCreateV2(user2.body.token, 'my quiz name', 'my origin quiz description');
  });
  test('Test transferring a quiz successfully', () => {
    const transfer = adminQuizTransfer(quiz.body.quizId, user.body.token, 'validemail@gmail.com');
    expect(transfer.body).toStrictEqual({});
    expect(transfer.statusCode).toBe(SUCCESS);
  });
  test('userEmail is not a real user', () => {
    const transfer = adminQuizTransfer(quiz.body.quizId, user.body.token, 'validema1531il@gmail.com');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(BADREQUEST);
  });
  test('userEmail is the current logged in user', () => {
    const transfer = adminQuizTransfer(quiz.body.quizId, user.body.token, 'hayden.smith@unsw.edu.au');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(BADREQUEST);
  });
  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const transfer = adminQuizTransfer(quiz2.body.quizId, user2.body.token, 'hayden.smith@unsw.edu.au');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(BADREQUEST);
  });
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const transfer = adminQuizTransfer(quiz.body.quizId, user.body.token + 'Math.random()', 'validema1531il@gmail.com');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(UNAUTHORIZED);
    const transfer2 = adminQuizTransfer(quiz.body.quizId, '', 'validema1531il@gmail.com');
    expect(transfer2.body).toStrictEqual(ERROR);
    expect(transfer2.statusCode).toBe(UNAUTHORIZED);
  });
  test('Valid token is provided, but either the quiz ID is invalid, or the user does not own the quiz', () => {
    const transfer = adminQuizTransfer(quiz.body.quizId, user2.body.token, 'hayden.smith@unsw.edu.au');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(FORBIDDEN);
  });
});

// adminQuizTransferV2
describe('adminQuizTransferV2 function tests', () => {
  let user: { statusCode: number; body: {token: string}; };
  let user2: { statusCode: number; body: {token: string}; };
  let quiz: { statusCode: number; body: {quizId: number}; };
  let quiz2: { statusCode: number; body: {quizId: number}; };
  beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
    user2 = adminAuthRegister('validemail@gmail.com', '123456ABC', 'Jake', 'Renzella');
    quiz = adminQuizCreateV2(user.body.token, 'my quiz name', 'my quiz description');
    quiz2 = adminQuizCreateV2(user2.body.token, 'my quiz name', 'my origin quiz description');
  });
  test('Test transferring a quiz successfully', () => {
    const transfer = adminQuizTransferV2(quiz.body.quizId, user.body.token, 'validemail@gmail.com');
    expect(transfer.body).toStrictEqual({});
    expect(transfer.statusCode).toBe(SUCCESS);
  });
  test('userEmail is not a real user', () => {
    const transfer = adminQuizTransferV2(quiz.body.quizId, user.body.token, 'validema1531il@gmail.com');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(BADREQUEST);
  });
  test('userEmail is the current logged in user', () => {
    const transfer = adminQuizTransferV2(quiz.body.quizId, user.body.token, 'hayden.smith@unsw.edu.au');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(BADREQUEST);
  });
  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const transfer = adminQuizTransferV2(quiz2.body.quizId, user2.body.token, 'hayden.smith@unsw.edu.au');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(BADREQUEST);
  });
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const transfer = adminQuizTransferV2(quiz.body.quizId, user.body.token + 'Math.random()', 'validema1531il@gmail.com');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(UNAUTHORIZED);
    const transfer2 = adminQuizTransferV2(quiz.body.quizId, '', 'validema1531il@gmail.com');
    expect(transfer2.body).toStrictEqual(ERROR);
    expect(transfer2.statusCode).toBe(UNAUTHORIZED);
  });
  test('Valid token is provided, but either the quiz ID is invalid, or the user does not own the quiz', () => {
    const transfer = adminQuizTransferV2(quiz.body.quizId, user2.body.token, 'hayden.smith@unsw.edu.au');
    expect(transfer.body).toStrictEqual(ERROR);
    expect(transfer.statusCode).toBe(FORBIDDEN);
  });
});

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { IncomingHttpHeaders } from 'http';
// import { ErrorObject } from './returnInterfaces';
// import { User } from './returnInterfaces';
// import { Quiz } from './returnInterfaces';
// import { Trash } from './returnInterfaces';

// Hasn't been updated to Iter 3 yet

const SERVER_URL = `${url}:${port}`;
// const ERROR = { error: expect.any(String) };
// const SUCCESS = 200;
const BADREQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;

const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });

interface Payload {
    [key: string]: any;
  }

const createRequest = (method: HttpVerb, path: string, payload: Payload, headers: IncomingHttpHeaders = {}) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method.toUpperCase())) {
    qs = payload;
  } else {
    json = payload;
  }
  const url = SERVER_URL + path;
  const res = request(method, url, { qs, json, headers, timeout: 20000 });

  let bodyObject: any;
  try {
    bodyObject = JSON.parse(res.body.toString());
  } catch (error: any) {
    bodyObject = {
      error: `Server responded with ${res.statusCode}, but body is not JSON. Given: ${res.body.toString()}. Reason: ${error.message}.`
    };
  }
  if ('error' in bodyObject) {
    return { status: res.statusCode, ...bodyObject };
  }
  return bodyObject;
};

/// ///////////////////////// Wrapper Functions /////////////////////////////////

const clear = () => {
  return createRequest('DELETE', '/v1/clear', {});
};

const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return createRequest('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

const adminQuizCreate = (token: string, name: string, description: string) => {
  return createRequest('POST', '/v2/admin/quiz', { name, description }, { token });
};

const adminQuizTransfer = (quizId: number, token: string, userEmail: string) => {
  return createRequest('POST', `/v1/admin/quiz/${quizId}/transfer`, { quizId, token, userEmail });
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  clear();
});

describe('adminQuizTransfer function tests', () => {
  let user: { token: string };
  let user2: { token: string };
  let quiz: { quizId: number };
  let quiz2: { quizId: number };
  beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
    user2 = adminAuthRegister('validemail@gmail.com', '123456ABC', 'Jake', 'Renzella');
    quiz = adminQuizCreate(user.token, 'my quiz name', 'my quiz description');
    quiz2 = adminQuizCreate(user2.token, 'my quiz name', 'my origin quiz description');
  });
  test('Test transferring a quiz successfully', () => {
    const transfer = adminQuizTransfer(quiz.quizId, user.token, 'validemail@gmail.com');
    expect(transfer).toStrictEqual({});
  });
  test('userEmail is not a real user', () => {
    const transfer = adminQuizTransfer(quiz.quizId, user.token, 'validema1531il@gmail.com');
    expect(transfer).toStrictEqual(makeCustomErrorForTest(BADREQUEST));
  });
  test('userEmail is the current logged in user', () => {
    const transfer = adminQuizTransfer(quiz.quizId, user.token, 'hayden.smith@unsw.edu.au');
    expect(transfer).toStrictEqual(makeCustomErrorForTest(BADREQUEST));
  });
  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const transfer = adminQuizTransfer(quiz2.quizId, user2.token, 'hayden.smith@unsw.edu.au');
    expect(transfer).toStrictEqual(makeCustomErrorForTest(BADREQUEST));
  });
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const transfer = adminQuizTransfer(quiz.quizId, user.token + 'Math.random()', 'validema1531il@gmail.com');
    expect(transfer).toStrictEqual(makeCustomErrorForTest(UNAUTHORIZED));
    const transfer2 = adminQuizTransfer(quiz.quizId, '', 'validema1531il@gmail.com');
    expect(transfer2).toStrictEqual(makeCustomErrorForTest(UNAUTHORIZED));
  });
  test('Valid token is provided, but either the quiz ID is invalid, or the user does not own the quiz', () => {
    const transfer = adminQuizTransfer(quiz.quizId, user2.token, 'hayden.smith@unsw.edu.au');
    expect(transfer).toStrictEqual(makeCustomErrorForTest(FORBIDDEN));
  });
});

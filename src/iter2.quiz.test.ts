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

// BEGINNING OF QUIZ QUESTION DUPLICATE
/*
  describe('Testing POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {

    test('Checking for a valid quiz question duplication', () => {

      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: {
          email: 'aaa@bbb.com',
          password: 'abcde12345',
          nameFirst: 'Michael',
          nameLast: 'Hourn'
        }
      });

      expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      const AuthUserId = AuthRegisterJSON.token;
      //Now have to create a quiz using the UserId
      let AdminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
      { json: { token: AuthRegisterJSON.token, name: 'Question 1',
      description: "A description of my quiz"}});
      expect(AdminQuizCreateResponse.statusCode).toStrictEqual(200);
      const AdminQuizCreateJSON = JSON.parse(AdminQuizCreateResponse.body.toString());
      const AdminQuizId = AdminQuizCreateJSON.quizId;

      let QuizObject = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: "Prince Charles",
            correct: true
          }
        ]
      }

      let AdminQuizQuestionCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizId}/question`,
      { json: { token: AuthRegisterJSON.token, questionBody: QuizObject}});

      expect(AdminQuizQuestionCreateResponse.statusCode).toStrictEqual(200);
      const AdminQuizQuestionCreateJSON = JSON.parse(AdminQuizQuestionCreateResponse.body.toString());

      const QuestionId = AdminQuizQuestionCreateJSON.questionId;

      //Actual Testing bit (Rest above is setup for function call)
      let AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: AdminQuizId, questionId: QuestionId, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(200);
      let AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({newQuestionId: expect.any(Number)})

      //Going to pass invalid QuestionID

      AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: AdminQuizId, questionId: -1, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(400);
      AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)});

      //Going provide invalid Quizid

      AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: -1, questionId: QuestionId, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(403);
      AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)});

      //Going to give invalid Owner of Quiz's ID

      const AuthRegisterResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: {
          email: 'aaa1@bbb.com',
          password: 'abcde12345',
          nameFirst: 'Michael',
          nameLast: 'Hourn'
        }
      });

      expect(AuthRegisterResponse2.statusCode).toStrictEqual(200);
      const AuthRegisterJSON2 = JSON.parse(AuthRegisterResponse2.body.toString());
      const AnotherOwnerId = AuthRegisterJSON2.token;

      AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: AnotherOwnerId, questionId: QuestionId, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(403);
      AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)})

      //Logging Out User
      const AuthLogoutResponse = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
      { json: { token: AuthRegisterJSON.token }});
      expect(AuthLogoutResponse.statusCode).toStrictEqual(200);

      //Checking for If the user is logged out
      AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
      { json: { quizId: AdminQuizId, questionId: QuestionId, token: AuthUserId}});

      expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(401);
      AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

      expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)})
    });

  });
  */

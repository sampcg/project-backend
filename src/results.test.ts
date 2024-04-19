import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { IncomingHttpHeaders } from 'http';

const SERVER_URL = `${url}:${port}`;

const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });

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

interface Payload {
  [key: string]: any;
}

const requestHelper = (method: HttpVerb, path: string, payload: Payload, headers: IncomingHttpHeaders = {}) => {
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

const requestRegisterAuth = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast }, {});
};
const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
};

const requestQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
};

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {}, {});
};
const requestSessionStart = (quizId: number, token: string, autoStartNum: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  requestClear();
});

/// /////////////////////  Testing for Viewing Session  /////////////////////////
describe('Testing GET /v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
  let author: { token: string }, quiz: { quizId: number }, session: { sessionId: number }, answers: AnswerInput[];

  beforeEach(() => {
    // Set up the test environment
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    quiz = requestQuizCreate(author.token, 'Quiz 1', 'a');
    answers =
      [{
        answer: 'Answer 1',
        correct: true
      },
      {
        answer: 'Answer 2',
        correct: false
      }];
    const questionBody: QuestionBody = { question: 'Question 1', duration: 5, points: 5, answers: answers, thumbnailUrl: 'http://google.com/some/image/path.jpg' };
    const question1 = requestQuestionCreate(author.token, quiz.quizId, questionBody);
    session = requestSessionStart(quiz.quizId, author.token, 35);
  });

  test('Testing: Error Case - Invalid Token', () => {
    // Test for an invalid token
    const invalidToken = 'invalid-token';
    expect(requestSessionResults(quiz.quizId, session.sessionId, invalidToken)).toStrictEqual(makeCustomErrorForTest(401));
  });

  test('Testing: Error Case - Session Id does not exist', () => {
    // Test for a session ID that does not exist
    const invalidSessionId = session.sessionId + 1;
    expect(requestSessionResults(quiz.quizId, invalidSessionId, author.token)).toStrictEqual(makeCustomErrorForTest(400));
  });

  test('Testing: Error Case - User not owner of the quiz', () => {
    // Test for a user who is not the owner of the quiz
    const unauthorizedUser = requestRegisterAuth('unauthorized@test.com', 'abcdefgh1234', 'Unauthorized', 'User');
    expect(requestSessionResults(quiz.quizId, session.sessionId, unauthorizedUser.token)).toStrictEqual(makeCustomErrorForTest(403));
  });

  test('Testing: Successful Case', () => {
    // Test for a successful request
    // Expecting the response to contain the final results data
    const sessionResults = requestSessionResults(quiz.quizId, session.sessionId, author.token);
    expect(sessionResults).toHaveProperty('usersRankedByScore');
    expect(sessionResults).toHaveProperty('questionResults');
    // Add more specific expectations based on the structure of the response
  });
});

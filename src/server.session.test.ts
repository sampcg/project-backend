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

/*
const requestAuthLogin = (email: string, password: string) => {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password }, {});
};
*/

const requestAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', {}, { token });
};

const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
};

const requestQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v2/admin/quiz/${quizId}`, { quizId }, { token });
};

const requestQuizRemove = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { quizId }, { token });
};

const requestQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
};

/*
const requestQuestionUpdate = (quizId: number, questionId: number, body: CreateQuestionBody) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { quizId, questionId, body });
};

const requestQuestionMove = (quizId: number, questionId: number, body: CreateQuestionBody) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { quizId, questionId, body });
};

const requestQuestionDelete = (token: string, quizId: number, questionId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { quizId, questionId }, {token});
};
*/

const requestSessionView = (quizId: number, token: string) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/sessions`, null, { token });
};

const requestSessionStart = (quizId: number, token: string, autoStartNum: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });
};

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {}, {});
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  requestClear();
});

/// /////////////////////  Testing for Viewing Session  /////////////////////////
describe('Testing Put /v1/admin/quiz/{quizid}/sessions', () => {
  let author: {token: string}, quiz: {quizId: number};

  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Kaarl', 'Tarapore');
    quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz 1 Des');
  });

  describe('Testing Error Cases', () => {
    test('Invalid Token', () => {
      const invalidToken = 'invalid-token';
      expect(requestSessionView(quiz.quizId, invalidToken)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('User does not own quiz', () => {
      requestAuthLogout(author.token);

      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      expect(requestSessionView(quiz.quizId, author2.token)).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing Success Cases', () => {
    /*
    test('Function Correctly prints active and inactive sessions', () => {
      // To make this work properly I need the sessionStart and sessionEnd functions
      const activeSessions = [5, 4, 3];
      const inactiveSessions = [2, 1, 6];
      const sessions = {activeSessions, inactiveSessions}
      expect(adminSessionView(author.token, quiz.quizId)).toStrictEqual(sessions);
    })
    */
  });
});

/// /////////////////////  Testing for Starting Session  ////////////////////////
describe('Testing Post /v1/admin/quiz/{quizid}/session/start', () => {
  let author: {token: string}, quiz: {quizId: number}, answers: AnswerInput[];
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz 1 Des');
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
    console.log(question1);
  });

  describe('Testing Error Cases', () => {
    test('autoStartNum is a number greater than 50', () => {
      expect(requestSessionStart(quiz.quizId, author.token, 55)).toStrictEqual(makeCustomErrorForTest(400));
    });

    // Come Back to this
    /*
    test('A maximum of 10 sessions that are not in END state currently exist for this quiz', () => {
      const requestBody = { autoStartNum: 35 };
      expect(requestSessionStart(quiz.quizId, author.token, requestBody)).toStrictEqual(makeCustomErrorForTest(400));
    });
    */

    test('A quiz does not have any questions in it', () => {
      console.log(quiz.quizId);
      const quiz2 = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      console.log(quiz2);
      console.log(quiz2.quizId);
      expect(requestSessionStart(quiz2.quizId, author.token, 35)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('The quiz is in trash', () => {
      const quiz2 = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      requestQuizRemove(author.token, quiz2.quizId);
      expect(requestSessionStart(quiz2.quizId, author.token, 35)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Invalid Token', () => {
      const invalidToken = 'invalid-token';
      expect(requestSessionStart(quiz.quizId, invalidToken, 35)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('User does not own quiz', () => {
      requestAuthLogout(author.token);

      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      expect(requestSessionStart(quiz.quizId, author2.token, 35)).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing Success Cases', () => {
    test('Session is Successfully Started', () => {
      console.log(requestQuizInfo(author.token, quiz.quizId));
      console.log(requestQuizInfo(author.token, quiz.quizId).questions);
      expect(requestSessionStart(quiz.quizId, author.token, 35)).toStrictEqual({ sessionId: expect.any(Number) });
    });
  });
});

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { IncomingHttpHeaders } from 'http';

const SERVER_URL = `${url}:${port}`;

const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });

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

/// /////////////Wrapper Functions

const requestRegisterAuth = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

const requestAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
};

const requestTrashList = (token: string) => {
  return requestHelper('GET', '/v2/admin/quiz/trash', {}, { token });
};

const requestTrashRestore = (token: string, quizId: number) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/restore`, {}, { token });
};

const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
};

const requestQuizList = (token: string) => {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token });
};

const requestQuizRemove = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, {}, { token });
};

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

/// /////////////////////////////////////////////////////
beforeEach(() => {
  requestClear();
});

/// ///////////// Testing for view trash  ///////////

describe('Testing GET /v2/admin/quiz/trash', () => {
  let author: {token: string};

  beforeEach(() => {
    author = requestRegisterAuth('abcea@bbb.com', 'abcde12345', 'Samuel', 'Gray');
  });

  test('Testing: Error Case - Invalid token', () => {
    const invalidToken = author.token + 'Math.random()';
    expect(requestTrashList(invalidToken)).toStrictEqual(makeCustomErrorForTest(401));
  });

  describe('Testing: Successful cases for trash quiz list', () => {
    test('Empty list', () => {
      expect(requestTrashList(author.token)).toStrictEqual({ quizzes: [] });
    });

    test('1 trashed quiz', () => {
      const quiz1: { quizId: number } = requestQuizCreate(author.token, 'Quiz 1', 'a');
      requestQuizRemove(author.token, quiz1.quizId);
      expect(requestTrashList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz1.quizId,
            name: 'Quiz 1'
          }
        ]
      });
    });

    test('3 trashed quizzes', () => {
      const quiz1: { quizId: number } = requestQuizCreate(author.token, 'Quiz 1', 'a');
      const quiz2: { quizId: number } = requestQuizCreate(author.token, 'Quiz 2', 'b');
      const quiz3: { quizId: number } = requestQuizCreate(author.token, 'Quiz 3', 'c');

      requestQuizRemove(author.token, quiz1.quizId);
      requestQuizRemove(author.token, quiz2.quizId);
      requestQuizRemove(author.token, quiz3.quizId);

      expect(requestTrashList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz1.quizId,
            name: 'Quiz 1'
          },
          {
            quizId: quiz2.quizId,
            name: 'Quiz 2'
          },
          {
            quizId: quiz3.quizId,
            name: 'Quiz 3'
          }
        ]
      });
    });

    test('Trashed quizzes logged by another author', () => {
      const quiz1: { quizId: number } = requestQuizCreate(author.token, 'Quiz 1', 'a');
      requestQuizRemove(author.token, quiz1.quizId);

      requestAuthLogout(author.token);

      const author2: { token: string } = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');

      const quiz2: { quizId: number } = requestQuizCreate(author2.token, 'Quiz 2', 'b');
      const quiz3: { quizId: number } = requestQuizCreate(author2.token, 'Quiz 3', 'c');
      const quiz4: { quizId: number } = requestQuizCreate(author2.token, 'Quiz 4', 'd');

      requestQuizRemove(author2.token, quiz2.quizId);
      requestQuizRemove(author2.token, quiz3.quizId);
      requestQuizRemove(author2.token, quiz4.quizId);

      expect(requestTrashList(author2.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz2.quizId,
            name: 'Quiz 2'
          },
          {
            quizId: quiz3.quizId,
            name: 'Quiz 3'
          },
          {
            quizId: quiz4.quizId,
            name: 'Quiz 4'
          }
        ]
      });
    });
  });
});

/// ///////////// Testing for restoring quiz from trash  ///////////

describe('Testing POST /v1/admin/{quizid}/restore', () => {
  let author: {token: string}, quiz: {quizId: number};

  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Samuel', 'Gray');
    quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz description');
    requestQuizRemove(author.token, quiz.quizId);
  });

  test('Testing: Error Case - Invalid token', () => {
    const invalidToken = author.token + 'Math.random()';
    expect(requestTrashRestore(invalidToken, quiz.quizId)).toStrictEqual(makeCustomErrorForTest(401));
  });

  test('Valid token, but user does not own quiz', () => {
    const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
    expect(requestTrashRestore(author2.token, quiz.quizId)).toStrictEqual(makeCustomErrorForTest(403));
  });

  test('Quiz ID refers to a quiz that is not currently in trash', () => {
    const quiz2 = requestQuizCreate(author.token, 'Quiz 2', 'Quiz description2');
    const result = requestTrashRestore(author.token, quiz2.quizId);
    // Quiz2 is not in trash, therefore need to return error 400
    expect((result)).toStrictEqual(makeCustomErrorForTest(400));
  });

  describe('Testing: Successful Cases', () => {
    test('Successfully shows quizzes in the trash', () => {
      const restoreResult = requestTrashRestore(author.token, quiz.quizId);
      expect((restoreResult)).toStrictEqual({});
      // Assert that the response contains the correct quiz that was removed
      // const restoreQuizzes = requestQuizList(author.token);
      // expect((quiz.quizId)).toStrictEqual(restoreQuizzes.quizId);

      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Quiz 1',
          }
        ]
      });
    });
  });
});

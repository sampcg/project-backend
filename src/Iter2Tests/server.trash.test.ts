test('expect 2', () => {
  expect(1 + 1).toStrictEqual(2);
});

/*
import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });

const requestHelper = (method: HttpVerb, path: string, payload: object) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });

  const bodyString = res.body.toString();
  let bodyObject: any;
  try {
    bodyObject = JSON.parse(bodyString);
  } catch (error: any) {
    bodyObject = {
      error: `Server responded with ${res.statusCode}, but body is not JSON. Given: ${bodyString}. Reason: ${error.message}.`
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
const requestTrashList = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
};

const requestTrashRestore = (token: string, quizId: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/restore`, { token });
};

const requestQuizRemove = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token, quizId });
};

const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
};

const requestQuizList = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
};

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

/// /////////////////////////////////////////////////////
beforeEach(() => {
  requestClear();
});

/// ///////////// Testing for view trash  ///////////

describe('Testing GET /v1/admin/quiz/trash', () => {
  let author: {token: string}, quiz: {quizId: number};

  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde1234578', 'Weird', 'Yankovic');
    quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz description');
    requestQuizRemove(author.token, quiz.quizId);
  });

  describe('Testing: Successful Cases', () => {
    test('Successfully shows quizzes in the trash', () => {
      // Fetch quizzes in the trash
      const trashQuizzes = requestTrashList(author.token);

      // Assert that the response contains the correct quiz that was removed
      expect(trashQuizzes).toEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Quiz 1'
          }
        ]
      });
    });
  });

  describe('Testing: Error Cases', () => {
    test('Testing: Error Case - Invalid token', () => {
      const invalidToken = author.token + Math.random();
      expect(requestTrashList(invalidToken)).toStrictEqual(makeCustomErrorForTest(401));
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

  test('Invalid quizId (does not exist)', () => {
    const invalidQuizId = quiz.quizId + 11;
    expect(requestTrashRestore(author.token, invalidQuizId)).toStrictEqual(makeCustomErrorForTest(400));
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
*/

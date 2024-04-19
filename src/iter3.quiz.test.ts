import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { IncomingHttpHeaders } from 'http';

const SERVER_URL = `${url}:${port}`;

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

/// ///////////////////////// Wrapper Functions /////////////////////////////////

const requestRegisterAuth = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

const requestAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
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

const requestUpdateQuizName = (token: string, quizId: number, name: string) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/name`, { name }, { token });
};

const requestUpdateQuizDescription = (token: string, quizId: number, description: string) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/description`, { description }, { token });
};

const requestQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v2/admin/quiz/${quizId}`, {}, { token });
};

const requestUpdateQuizThumbnail = (token: string, quizId: number, imgUrl: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/thumbnail`, { imgUrl }, { token });
};

const requestQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
};

const requestSessionStart = (quizId: number, token: string, autoStartNum: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });
};

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  requestClear();
});

/// /////////////////       Testing for Listing Quizzes      ////////////////////

describe('Testing GET /v1/admin/quiz/list', () => {
  let author: {token: string};
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
  });

  test('Testing: Error Case - Invalid token', () => {
    const invalidToken = author.token + 'Math.random()';
    expect(requestQuizList(invalidToken)).toStrictEqual(makeCustomErrorForTest(401));
  });

  describe('Testing: Successful cases', () => {
    test('Empty list', () => {
      expect(requestQuizList(author.token)).toStrictEqual({ quizzes: [] });
    });

    test('1 quiz', () => {
      const quiz1: {quizId: number} = requestQuizCreate(author.token, 'Quiz 1', 'a');
      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz1.quizId,
            name: 'Quiz 1'
          }
        ]
      });
    });

    test('3 quizzes', () => {
      const quiz1: {quizId: number} = requestQuizCreate(author.token, 'Quiz 1', 'a');
      const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', 'b');
      const quiz3: {quizId: number} = requestQuizCreate(author.token, 'Quiz 3', 'c');

      expect(requestQuizList(author.token)).toStrictEqual({
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

    test('Quizzes logged by another author', () => {
      requestQuizCreate(author.token, 'Quiz 1', 'a');
      requestAuthLogout(author.token);

      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');

      const quiz2: {quizId: number} = requestQuizCreate(author2.token, 'Quiz 2', 'b');
      const quiz3: {quizId: number} = requestQuizCreate(author2.token, 'Quiz 3', 'c');
      const quiz4: {quizId: number} = requestQuizCreate(author2.token, 'Quiz 4', 'd');

      expect(requestQuizList(author2.token)).toStrictEqual({
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

/// /////////////////        Testing for Creating Quiz       ////////////////////

describe('Testing POST /v1/admin/quiz', () => {
  let author: {token: string}, quizName: string, quizDescription: string;
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    // Standard values
    quizName = 'Quiz Name';
    quizDescription = 'Quiz Description';
  });

  describe('Testing: Error Cases', () => {
    test('Invalid token', () => {
      expect(requestQuizCreate(author.token + 1, quizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('Invalid Characters', () => {
      const invalidQuizName = 'aB1 -';
      expect(requestQuizCreate(author.token, invalidQuizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Name less than 3 characters', () => {
      const shortQuizName = 'a';
      expect(requestQuizCreate(author.token, shortQuizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Name greater than 30 characters', () => {
      const longQuizName = '123456789 123456789 123456789 123456789';
      expect(requestQuizCreate(author.token, longQuizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Description greater than 100 characters', () => {
      const longQuizDescription = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789';
      expect(requestQuizCreate(author.token, quizName, longQuizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Testing name already in use', () => {
      const quizName = 'Quiz Name';
      const quizDescription = 'Quiz Description';
      requestQuizCreate(author.token, quizName, quizDescription);
      requestAuthLogout(author.token);

      const author2 = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');

      expect(requestQuizCreate(author2.token, quizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });
  });

  describe('Testing: Successful cases', () => {
    test('General case', () => {
      const quiz: {quizId: number} = requestQuizCreate(author.token, quizName, quizDescription);
      expect(quiz.quizId).toStrictEqual(expect.any(Number));

      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Quiz Name',
          }
        ]
      });
    });

    test('Empty Description', () => {
      const quiz: {quizId: number} = requestQuizCreate(author.token, quizName, '');
      expect(quiz.quizId).toStrictEqual(expect.any(Number));

      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Quiz Name',
          }
        ]
      });
    });

    test('Create multiple quizzes', () => {
      const quiz2Name = 'Quiz 2 Name';
      const quiz1 = requestQuizCreate(author.token, quizName, quizDescription);
      const quiz2 = requestQuizCreate(author.token, quiz2Name, quizDescription);
      expect(quiz1).toStrictEqual({ quizId: quiz1.quizId });
      expect(quiz2).toStrictEqual({ quizId: quiz2.quizId });

      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz1.quizId,
            name: quizName
          },
          {
            quizId: quiz2.quizId,
            name: quiz2Name
          }
        ]
      });
    });

    test('Create quiz with another author', () => {
      const quiz1 = requestQuizCreate(author.token, quizName, quizDescription);

      requestAuthLogout(author.token);

      const author2 = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');

      const quiz2Name = 'Quiz 2 Name';
      const quiz2 = requestQuizCreate(author2.token, quiz2Name, quizDescription);

      expect(quiz1).toStrictEqual({ quizId: quiz1.quizId });
      expect(quiz2).toStrictEqual({ quizId: quiz2.quizId });
      expect(quiz1).not.toStrictEqual(quiz2);
    });
  });
});

/// /////////////////        Testing for Removing Quiz       ////////////////////

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  let author: {token: string}, quiz: {quizId: number};
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    quiz = requestQuizCreate(author.token, 'Quiz Name', '');
  });

  describe('Testing: Error Cases', () => {
    test('Invalid token (does not exist)', () => {
      expect(requestQuizRemove(author.token + 1, quiz.quizId)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('Invalid quizId (does not exist)', () => {
      expect(requestQuizRemove(author.token, quiz.quizId + 1)).toStrictEqual(makeCustomErrorForTest(403));
    });

    test('Invalid token (does not correlate to given quiz)', () => {
      requestAuthLogout(author.token);
      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      expect(requestQuizRemove(author2.token, quiz.quizId)).toStrictEqual(makeCustomErrorForTest(403));
    });

    test('Session not in END state', () => {
      const answers =
            [{
              answer: 'Answer 1',
              correct: true
            },
            {
              answer: 'Answer 2',
              correct: false
            }];
      const thumbnailUrl = 'http://google.com/some/image/path.jpg';
      const questionBody: QuestionBody = { question: 'Question', duration: 1, points: 1, answers: answers, thumbnailUrl: thumbnailUrl };
      requestQuestionCreate(author.token, quiz.quizId, questionBody);
      requestSessionStart(quiz.quizId, author.token, 3);
      expect(requestQuizRemove(author.token, quiz.quizId)).toStrictEqual(makeCustomErrorForTest(400));
    });
  });

  describe('Testing: Successful Cases', () => {
    test('Deletes 1 of 1', () => {
      const quizRemoveResponse: Record<string, never> = requestQuizRemove(author.token, quiz.quizId);
      expect(quizRemoveResponse).toStrictEqual({});
      expect(requestQuizList(author.token)).toStrictEqual({ quizzes: [] });
    });

    test('Deletes 1st of 2', () => {
      const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      requestQuizRemove(author.token, quiz.quizId);
      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz2.quizId,
            name: 'Quiz 2'
          }
        ]
      });
      /*
      expect(requestTrashList(author.token)).toStrictEqual({
        trash: [
          {
            quizId: quiz.quizId,
            name: ''
          }
        ]
      });
      */
    });

    test('Deletes 2nd of 2', () => {
      const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      requestQuizRemove(author.token, quiz2.quizId);
      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Quiz Name'
          }
        ]
      });
      /*
      expect(requestTrashList(author.token)).toStrictEqual({
        trash: [
          {
            quizId: quiz2.quizId,
            name: 'Quiz 2 Des'
          }
        ]
      });
      */
    });

    test('Deletes 2 of 2', () => {
      const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      requestQuizRemove(author.token, quiz.quizId);
      requestQuizRemove(author.token, quiz2.quizId);
      expect(requestQuizList(author.token)).toStrictEqual({ quizzes: [] });
      /*
      expect(requestTrashList(author.token)).toStrictEqual({
        trash: [
          {
            quizId: quiz.quizId,
            name: ''
          },
          {
            quizId: quiz2.quizId,
            name: 'Quiz 2 Des'
          }
        ]
      });
      */
    });
  });
});

/// /////////////////        Testing for Updating Quiz Name       ////////////////////
describe('Testing PUT /v1/admin/quiz/{quizid}/name', () => {
  let author: {token: string}, quiz: {quizId: number}, name:string;
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Samuel', 'Gray');
    quiz = requestQuizCreate(author.token, 'Quiz Name', '');
  });

  test('Testing: Error Case - Invalid token', () => {
    const invalidToken = author.token + 'Math.random()';
    expect(requestUpdateQuizName(invalidToken, quiz.quizId, name)).toStrictEqual(makeCustomErrorForTest(401));
  });

  test('Testing: Error Case - Unauthorized access to quiz', () => {
    requestAuthLogout(author.token);
    const unauthorizedUser = requestRegisterAuth('unauthorized@test.com', 'abcdefgh1234', 'Unauthorized', 'User');
    const newName = 'Updated Quiz Name';
    expect(requestUpdateQuizName(unauthorizedUser.token, quiz.quizId, newName)).toStrictEqual(makeCustomErrorForTest(403));
  });

  test('Testing: Error Case - Invalid quiz name', () => {
    const invalidName = 'Abc$%'; // Invalid characters
    expect(requestUpdateQuizName(author.token, quiz.quizId, invalidName)).toStrictEqual(makeCustomErrorForTest(400));
  });

  test('Testing: Error Case - Quiz name length', () => {
    const longName = 'This is a very long quiz name that exceeds the maximum length allowed'; // More than 30 characters
    expect(requestUpdateQuizName(author.token, quiz.quizId, longName)).toStrictEqual(makeCustomErrorForTest(400));
  });

  test('Testing: Successful Case - Update quiz name', () => {
    const updatedName = 'New Name for Quiz';
    const updateResult = requestUpdateQuizName(author.token, quiz.quizId, updatedName);

    // Assert that the update operation was successful
    expect(updateResult).toEqual({}); // Assuming the function returns an empty object on success

    // Retrieve the updated quiz details
    const updatedQuizInfo = requestQuizInfo(author.token, quiz.quizId);
    console.log('This is the test', updatedQuizInfo.name);
    expect(updatedQuizInfo.name).toBe(updatedName);
  });
});

/// ///////////// Testing for Update Quiz Description  ///////////
describe('Testing PUT /v1/admin/quiz/{quizid}/description', () => {
  let author: {token: string}, quiz: {quizId: number}, description: string;
  beforeEach(() => {
    // Assuming you have functions like requestRegisterAuth, requestAuthLogin, requestQuizCreate, etc.
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Samuel', 'Gray');
    quiz = requestQuizCreate(author.token, 'Quiz Name', 'Quiz Description');
  });

  test('Testing: Error Case - Invalid token', () => {
    const invalidToken = author.token + 'Math.random()';
    expect(requestUpdateQuizDescription(invalidToken, quiz.quizId, description)).toStrictEqual(makeCustomErrorForTest(401));
  });

  test('Testing: Error Case - Invalid quiz Description', () => {
    const invalidDescription = 'A'.repeat(101); // Invalid characters
    expect(requestUpdateQuizDescription(author.token, quiz.quizId, invalidDescription)).toStrictEqual(makeCustomErrorForTest(400));
  });

  test('Testing: Successful Case - Update quiz description', () => {
    const newDescription = 'Updated Quiz Description';

    // Perform the update operation
    const updateResult = requestUpdateQuizDescription(author.token, quiz.quizId, newDescription);

    // Assert that the update operation was successful
    expect(updateResult).toEqual({}); // Assuming the function returns an empty object on success

    // Retrieve the updated quiz details using adminQuizInfo
    const updatedQuizInfo = requestQuizInfo(author.token, quiz.quizId);

    // Check if the description is updated
    expect(updatedQuizInfo).toEqual(expect.objectContaining({
      description: newDescription
    }));
  });
});

/// /////////////////        Testing for Admin Quiz Info     ////////////////////
describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  let author: {token: string}, quiz: {quizId: number};
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Samuel', 'Gray');
    quiz = requestQuizCreate(author.token, 'Quiz Name', '');
  });

  test('Testing: Error Case - Invalid token', () => {
    const invalidToken = author.token + 'Math.random()';
    expect(requestQuizInfo(invalidToken, quiz.quizId)).toStrictEqual(makeCustomErrorForTest(401));
  });

  test('Testing: Error Case - Unauthorized access to quiz', () => {
    requestAuthLogout(author.token);
    const unauthorizedUser = requestRegisterAuth('unauthorized@test.com', 'abcdefgh123', 'Unauthorized', 'User');
    expect(requestQuizInfo(unauthorizedUser.token, quiz.quizId)).toStrictEqual(makeCustomErrorForTest(403));
  });

  test('Valid token and quiz ID', () => {
    // requestQuestionCreate
    const expectedData = {
      quizId: quiz.quizId,
      name: expect.any(String),
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: expect.any(String),
      numQuestions: expect.any(Number),
      questions: expect.any(Array),
      duration: expect.any(Number),
      thumbnailUrl: expect.any(String)
    };

    // Call the function and compare with expected data
    expect(requestQuizInfo(author.token, quiz.quizId)).toEqual(expectedData);
  });
});

/**                    Testing for Update Quiz Thumbnail                      */
describe('Testing PUT /v1/admin/quiz/{quizid}/thumbnail', () => {
  let author: {token: string}, quiz: {quizId: number}, imgUrl: string;
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    quiz = requestQuizCreate(author.token, 'Quiz Name', '');
    // Standard value
    imgUrl = 'http://google.com/some/image/path.jpg';
  });

  describe('Testing: Error Cases', () => {
    test("'imgUrl does not end with 'jpg', 'jpeg', or 'png'", () => {
      expect(requestUpdateQuizThumbnail(author.token, quiz.quizId, 'http://invalid.file')).toStrictEqual(makeCustomErrorForTest(400));
    });

    test("imgUrl does not begin with 'http://' or 'https://'", () => {
      expect(requestUpdateQuizThumbnail(author.token, quiz.quizId, 'invalid.file.jpeg')).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Token is empty', () => {
      expect(requestUpdateQuizThumbnail('', quiz.quizId, imgUrl)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('Token is invalid (not logged in)', () => {
      requestAuthLogout(author.token);
      expect(requestUpdateQuizThumbnail(author.token, quiz.quizId, imgUrl)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('User does not own quiz', () => {
      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      expect(requestUpdateQuizThumbnail(author2.token, quiz.quizId, imgUrl)).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing: Successful Cases', () => {
    test('Works', () => {
      requestUpdateQuizThumbnail(author.token, quiz.quizId, imgUrl);
      expect(requestQuizInfo(author.token, quiz.quizId)).toStrictEqual({
        quizId: quiz.quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      });
    });

    test('Works on second quiz', () => {
      requestUpdateQuizThumbnail(author.token, quiz.quizId, 'http://google.com/some/image/path.jpeg');
      const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', '');
      requestUpdateQuizThumbnail(author.token, quiz2.quizId, 'http://google.com/some/image/path.png');

      expect(requestQuizInfo(author.token, quiz.quizId)).toStrictEqual({
        quizId: quiz.quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: 'http://google.com/some/image/path.jpeg'
      });

      expect(requestQuizInfo(author.token, quiz2.quizId)).toStrictEqual({
        quizId: quiz2.quizId,
        name: 'Quiz 2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: 'http://google.com/some/image/path.png'
      });
    });

    test('Works from second author', () => {
      requestAuthLogout(author.token);
      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      const quiz2: {quizId: number} = requestQuizCreate(author2.token, 'Quiz Auth 2', '');
      requestUpdateQuizThumbnail(author2.token, quiz2.quizId, imgUrl);

      expect(requestQuizInfo(author2.token, quiz2.quizId)).toStrictEqual({
        quizId: quiz2.quizId,
        name: 'Quiz Auth 2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: '',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      });
    });
  });
});

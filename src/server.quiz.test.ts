import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { ErrorObject, User, Quiz, Trash } from './returnInterfaces';

const SERVER_URL = `${url}:${port}`;

const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });

const requestHelper = (method: HttpVerb, path: string, payload: object) => {
  let qs = {};
  let json= {};
  if (['GET', 'DELETE', 'PUT'].includes(method)) {
      qs = payload;
  } else {
      json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  const bodyString = res.body.toString();
  let bodyObject: any;
  try {
      bodyObject = JSON.parse(bodyString)
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


/// ///////////////////////// Wrapper Functions /////////////////////////////////

const requestRegisterAuth = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

const requestAuthLogin = (email: string, password: string) => {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
};

const requestAuthLogout = (token: number) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
};

const requestQuizCreate = (token: number, name: string, description: string) => {
  return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
};

const requestQuizList = (token: number) => {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
};

const requestQuizRemove = (token: number, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token, quizId });
};

const requestTrashList = (token: number) => {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
};

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

const requestQuizInfo = (token: number, quizId: number) => {
  return requestHelper('GET', '/v1/admin/quiz/${quizId}', { token, quizId })
}

const requestUpdateQuizName = (quizId: number, token: number, name: string) => {
  return requestHelper('PUT', '/v1/admin/quiz/{quizId}/name', {quizId, token, name})
}

/// /////////////////       Testing for Listing Quizzes      ////////////////////

/// /////////////////       Testing for Quiz Info     ///////////////////////////

beforeEach(() => {
  requestClear();
});
/** 
describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  let author: {token: number}, quiz: {quizId: number};

    beforeEach(() => {
      author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Samuel', 'Gray');
      requestAuthLogin('aaa@bbb.com', 'abcde12345');
  });

  test('Testing: Error Case - Invalid token', () => {
    expect(requestQuizInfo(author.token + 1, quiz.quizId + 11)).toStrictEqual(makeCustomErrorForTest(401));
});


test('Testing: Error Case - Unauthorized access to quiz', () => {
  const unauthorizedUser = requestRegisterAuth('unauthorized@test.com', 'password', 'Unauthorized', 'User');
  requestAuthLogin('unauthorized@test.com', 'password');
  expect(requestQuizInfo(unauthorizedUser.token, 5546)).toStrictEqual(makeCustomErrorForTest(403));
});

test('Testing: Successful Case - Get quiz details', () => {
  // Create a quiz
  const quizId = requestQuizCreate(author.token, 'This is the name of the quiz', 'This quiz is so we can have a lot of fun');
  
  // Add a question to the quiz
  const questionId = requestQuestionCreate(author.token, quizId, 'Who is the Monarch of England?', 4, 5, [
      { answer: 'Prince Charles', color: 'red', correct: true }
  ]);

  // Get quiz details
  const quizDetails = requestQuizInfo(author.token, quizId);

  // Expected quiz details response
  const expectedResponse = {
      quizId: quizId,
      name: 'This is the name of the quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'This quiz is so we can have a lot of fun',
      numQuestions: 1,
      questions: [
          {
              questionId: questionId,
              question: 'Who is the Monarch of England?',
              duration: 4,
              points: 5,
              answers: [
                  {
                      answerId: expect.any(Number),
                      answer: 'Prince Charles',
                      colour: 'red',
                      correct: true
                  }
              ]
          }
      ],
      duration: expect.any(Number)
  };

  expect(quizDetails).toEqual(expectedResponse);
  });
});
*/
//////////////// Testing for Update Quiz Name ///////////
describe('Testing PUT /v1/admin/quiz/{quizid}/name', () => {
  let author: {token: number}, quiz: {quizId: number}, name:string;
  beforeEach(() => {
    // Assuming you have functions like requestRegisterAuth, requestAuthLogin, requestQuizCreate, etc.
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Samuel', 'Gray');
    requestAuthLogin('aaa@bbb.com', 'abcde12345');
    quiz = requestQuizCreate(author.token, 'Quiz Name', '');
});

test('Invalid token', () => {
  expect(requestUpdateQuizName(author.token + 1, quiz.quizId, name)).toStrictEqual(makeCustomErrorForTest(401))
});


test('Testing: Error Case - Unauthorized access to quiz', () => {
    const quizId = requestQuizCreate(author.token, 'Initial Quiz Name', 'This quiz is so we can have a lot of fun');
    const unauthorizedUser = requestRegisterAuth('unauthorized@test.com', 'password', 'Unauthorized', 'User');
    requestAuthLogin('unauthorized@test.com', 'password');
    const newName = 'Updated Quiz Name';
    expect(requestUpdateQuizName(unauthorizedUser.token, quizId, newName)).toStrictEqual(makeCustomErrorForTest(403));
});

test('Invalid quizId (does not exist)', () => {
  expect(requestUpdateQuizName(author.token, quiz.quizId + 11, name)).toStrictEqual(makeCustomErrorForTest(403));
});


test('Testing: Error Case - Invalid quiz name', () => {
    const quizId = requestQuizCreate(author.token, 'Initial Quiz Name', 'This quiz is so we can have a lot of fun');
    const invalidName = 'Abc$%'; // Invalid characters
    expect(requestUpdateQuizName(author.token, quizId, invalidName)).toStrictEqual(makeCustomErrorForTest(400));
});

test('Testing: Error Case - Quiz name length', () => {
    const quizId = requestQuizCreate(author.token, 'Initial Quiz Name', 'This quiz is so we can have a lot of fun');
    const longName = 'This is a very long quiz name that exceeds the maximum length allowed'; // More than 30 characters
    expect(requestUpdateQuizName(author.token, quizId, longName)).toStrictEqual(makeCustomErrorForTest(400));
});

test('Testing: Successful Case - Update quiz name', () => {
    // Create a quiz
    const initialName = 'Initial Quiz Name';
    const quizId = requestQuizCreate(author.token, initialName, 'This quiz is so we can have a lot of fun');

    // Update quiz name
    const newName = 'Updated Quiz Name';
    const updatedQuiz = requestUpdateQuizName(author.token, quizId, newName);

    // Get updated quiz details
    const quizDetails = requestQuizInfo(author.token, quizId);

    // Expected updated quiz name
    const expectedName = {
        quizId: quizId,
        name: newName,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This quiz is so we can have a lot of fun',
        numQuestions: 0, // Assuming no questions added yet
        questions: expect.any,
        duration: expect.any(Number)
    };

    expect(quizDetails).toEqual(expectedName);
});
});
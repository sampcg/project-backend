import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { adminSessionView } from './session';
import { IncomingHttpHeaders } from 'http';

const SERVER_URL = `${url}:${port}`;

const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });

interface SessionStartRequestBody {
  autoStartNum: number;
};

interface AnswerInput {
  answer: string;
  correct: boolean;
}

interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerInput[];
}


const requestHelper = (method: HttpVerb, path: string, payload: object, headers: IncomingHttpHeaders) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, headers, timeout: 20000 });
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

/// ///////////////////////// Wrapper Functions /////////////////////////////////

const requestRegisterAuth = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast }, {});
};

const requestAuthLogin = (email: string, password: string) => {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password }, {});
};

const requestAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', {}, { token });
};

const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, {token});
};


const requestQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, {quizId}, {  token });
};


const requestQuizRemove = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, {quizId}, { token });
};

const requestQuestionCreate = (token: string, quizId: number, body: QuestionBody) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`, { quizId, body }, {token},);
};

/*
const requestQuestionUpdate = (quizId: number, questionId: number, body: CreateQuestionBody) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { quizId, questionId, body });
};

const requestQuestionMove = (quizId: number, questionId: number, body: CreateQuestionBody) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { quizId, questionId, body });
};
*/

const requestQuestionDelete = (token: string, quizId: number, questionId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { quizId, questionId }, {token});
};

const requestSessionView = (quizId: number, token: string) => {
  return requestHelper('PUT',  `/v1/admin/quiz/${quizId}/sessions`, { quizId }, {token});
}

const requestSessionStart = (quizId: number, token: string, body: SessionStartRequestBody) => {
  return requestHelper('POST',  `/v1/admin/quiz/${quizId}/session/start`, { body }, {token});
}

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {}, {});
};

////////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  requestClear();
});

////////////////////////  Testing for Viewing Session  /////////////////////////
describe('Testing Put /v1/admin/quiz/{quizid}/sessions', () => {
  let author: {token: string}, quiz: {quizId: number};

  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Kaarl', 'Tarapore');
    quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz 1 Des');
  });

  describe('Testing Error Cases', () => {
    test('Invalid token', () => {
      expect(adminSessionView(quiz.quizId, author.token + 1)).toStrictEqual({ error: 'Token is empty or invalid (does not refer to valid logged in user session)', code: 401 });
    });

    test('User does not own quiz', () => {
      requestAuthLogout(author.token);
      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      expect(adminSessionView(quiz.quizId, author2.token)).toStrictEqual({ error: 'Valid token is provided, but user is not an owner of this quiz', code: 403 });
    });
  });

  describe('Testing Success Cases', () => {
    test('Function Correctly prints active and inactive sessions', () => {
      // To make this work properly I need the sessionStart and sessionEnd functions 
      const activeSessions = [5, 4, 3];
      const inactiveSessions = [2, 1, 6];
      const sessions = {activeSessions, inactiveSessions}
      expect(adminSessionView(quiz.quizId, author.token)).toStrictEqual(sessions);
    })
  }); 
});

////////////////////////  Testing for Starting Session  ////////////////////////
describe('Testing Post /v1/admin/quiz/{quizid}/session/start', () => {
  let author: {token: string}, quiz: {quizId: number}, question1: {questionId: number}, answers: AnswerInput[];
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
    const questionBody: QuestionBody = { question: 'Question 1', duration: 5, points: 5, answers: answers };
    question1 = requestQuestionCreate(author.token, quiz.quizId, questionBody);
  });


  describe('Testing Error Cases', () => {
    test('autoStartNum is a number greater than 50', () => {
      const requestBody = { autoStartNum: 55 };
      expect(requestSessionStart(quiz.quizId, author.token, requestBody)).toStrictEqual(makeCustomErrorForTest(400));
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
      let quiz2 = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      const requestBody = { autoStartNum: 30 };
      console.log(quiz2);
      console.log(quiz2.quizId);
      expect(requestSessionStart(quiz2.quizId, author.token, requestBody)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('The quiz is in trash', () => {
      let quiz2 = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      requestQuizRemove(author.token, quiz2.quizId);
      const requestBody = { autoStartNum: 35 };
      expect(requestSessionStart(quiz2.quizId, author.token, requestBody)).toStrictEqual(makeCustomErrorForTest(400));

    });

    test('Invalid Token', () => {
      const invalidToken = 'invalid-token'
      const requestBody = { autoStartNum: 35 };
      expect(requestSessionStart(quiz.quizId, invalidToken, requestBody)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('User does not own quiz', () => {
      requestAuthLogout(author.token);

      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      const requestBody = { autoStartNum: 35 };
      expect(requestSessionStart(quiz.quizId, author2.token, requestBody)).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing Success Cases', () => {
    test('Session is Successfully Started', () => {
      const requestBody = { autoStartNum: 35 };
      expect(requestSessionStart(quiz.quizId, author.token, requestBody)).toStrictEqual(makeCustomErrorForTest(200));
    })
  })
});


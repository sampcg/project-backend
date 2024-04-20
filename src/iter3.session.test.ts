import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { IncomingHttpHeaders } from 'http';
// import { States } from './returnInterfaces';

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

const requestSessionStatus = (quizId: number, sessionid: number, token: string) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionid}`, {}, { token });
};

const requestSessionUpdate = (quizId: number, sessionId: number, token: string, action: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/session/${sessionId}`, { action }, { token });
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
    requestQuestionCreate(author.token, quiz.quizId, questionBody);
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
      const quiz2 = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
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

/// /////////////////////  Get quiz session status  ////////////////////////

describe('Testing GET /v1/admin/quiz/{quizid}/session/{sessionid}', () => {
  let author: {token: string}, quiz: {quizId: number}, answers: AnswerInput[], session: {sessionId: number};
  beforeEach(() => {
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
    requestQuestionCreate(author.token, quiz.quizId, questionBody);
    session = requestSessionStart(quiz.quizId, author.token, 35);
  });

  test('Testing: Error Case - Invalid Token', () => {
    const invalidToken = 'invalid-token';
    expect(requestSessionStatus(quiz.quizId, session.sessionId, invalidToken)).toStrictEqual(makeCustomErrorForTest(401));
  });

  test('Testing: Error Case - Session Id does not exist', () => {
    const quiz2 = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
    const incorrectSession = requestSessionStart(quiz2.quizId, author.token, 36);
    expect(requestSessionStatus(quiz.quizId, incorrectSession.sessionId, author.token)).toStrictEqual(makeCustomErrorForTest(400));
  });

  test('Testing: Error Case - User not owner of the quiz', () => {
    const unauthorizedUser = requestRegisterAuth('unauthorized@test.com', 'abcdefgh1234', 'Unauthorized', 'User');
    expect(requestSessionStatus(quiz.quizId, session.sessionId, unauthorizedUser.token)).toStrictEqual(makeCustomErrorForTest(403));
  });

  test('Testing: Successful Case', () => {
    const sessionStatus = requestSessionStatus(quiz.quizId, session.sessionId, author.token);
    const expectedData = {
      state: sessionStatus.state,
      atQuestion: sessionStatus.atQuestion,
      players: sessionStatus.players,
      metadata: {
        quizId: quiz.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        numQuestions: expect.any(Number),
        questions: expect.any(Array),
        duration: expect.any(Number),
        thumbnailUrl: expect.any(String)
      }
    };
    expect(sessionStatus).toStrictEqual(expectedData);
  });
});

/// /////////////////////  Testing for Updating Session  ////////////////////////
describe('Testing PUT /v1/admin/quiz/{quizid}/session/{sessionid}', () => {
  let author: {token: string}, quiz: {quizId: number}, session: {sessionId: number}, answers: AnswerInput[];
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
    session = requestSessionStart(quiz.quizId, author.token, 35);
    console.log('Session: ', session);
    console.log('SessionId before: ', session.sessionId);
    console.log(question1);
  });

  describe('Testing Error Cases', () => {
    test('Session Id does not refer to a valid session within this quiz', () => {
      console.log('SessionId test1: ', session.sessionId);
      const quiz2 = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      const incorrectSession = requestSessionStart(quiz2.quizId, author.token, 36);
      console.log('Incorrect Id: ', incorrectSession);
      expect(requestSessionUpdate(quiz.quizId, incorrectSession.sessionId, author.token, 'NEXT_QUESTION')).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Action provided is not a valid Action enum', () => {
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'BLUE')).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Action enum cannot be applied in the current state', () => {
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'GO_TO_ANSWER')).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Invalid Token', () => {
      const invalidToken = 'invalid-token';
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, invalidToken, 'NEXT_QUESTION')).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('User does not own quiz', () => {
      requestAuthLogout(author.token);
      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, author2.token, 'NEXT_QUESTION')).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing Success Cases', () => {
    test('Lobby -> QuestionCountdown', () => {
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'NEXT_QUESTION')).toStrictEqual({});
    });

    test('Lobby -> End', () => {
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'END')).toStrictEqual({});
    });

    test('QuestionCountdown -> QuestionOpen', () => {
      requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'NEXT_QUESTION');
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'SKIP_COUNTDOWN')).toStrictEqual({});
    });

    test('QuestionCountdown -> AnswerShow', () => {
      requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'NEXT_QUESTION');
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'END')).toStrictEqual({});
    });

    /*
    test('QuestionCountdown -> QuestionOpen', () => {
      requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'NEXT_QUESTION');
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, author.token, '')).toStrictEqual({});
    });
    */

    test('QuestionOpen -> End', () => {
      requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'NEXT_QUESTION');
      requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'SKIP_COUNTDOWN');
      expect(requestSessionUpdate(quiz.quizId, session.sessionId, author.token, 'GO_TO_ANSWER')).toStrictEqual({});
    });
  });
});

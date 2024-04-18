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

const requestQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v2/admin/quiz/${quizId}`, {}, { token });
};

const requestQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
};

const requestQuestionUpdate = (token: string, quizId: number, questionId: number, questionBody: QuestionBody) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}`, { questionBody }, { token });
};

const requestQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number) => {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}/move`, { newPosition }, { token });
};

const requestQuestionDelete = (token: string, quizId: number, questionId: number) => {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}/question/${questionId}`, {}, { token });
};

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

const requestQuestionSessionId = (quizId: number, token: string, body: object) => {
    return requestHelper('POST', `/v1/admin/quiz/${quizid}/session/start`, {quizId, token, body});
};

const requestGuestCreate = (sessionId: number, name: string) => {
    return requestHelper('POST', `/v1/player/join`, {sessionId, name});
};

const requestGuestStatus = (playerId: number) => {
  return requestHelper('GET', `/v1/player/${playerId}`, {playerId});
};

const requestUpdateSessionState = (quizId: number, sessionId: number, token: string, body: object) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizid}/session/${sessionId}`, {quizId, sessionId, token,
    body});
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  requestClear();
});

/// /////////////////      Testing for Creating Guest     ////////////////////
describe('Testing POST /v1/player/join', () => { 

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
    const questionBody: QuestionBody = { question: 'Question 1', duration: 5, points: 5, answers: answers, thumbnailUrl: 'http://google.com/some/image/path.jpg' };
    question1 = requestQuestionCreate(author.token, quiz.quizId, questionBody);
    });

    describe('Creating a Guest Player', () => {

        // Going to request a New Session from SessionStart Function
        test('Name of user entered is not unique (compared to other users who have already joined), expect 400', () => { 
          const sessionId = requestQuestionSessionId(quiz.quizId, author.token, questionBody);
          const validName = 'Hayden'
          expect(requestGuestCreate(sessionId, validName).toStrictEqual(makeCustomErrorForTest(200)));

          // Same Name is Implemented in the function and same Sessiond Id
          expect(requestGuestCreate(sessionId, validName).toStrictEqual(makeCustomErrorForTest(400)));
        });

        test('Session Id does not refer to a valid session, expect 400', () => { 
          const sessionId = requestQuestionSessionId(quiz.quizId, author.token, questionBody);
          const invalidSessionid = sessionId + 1;
          const validName = 'Hayden'
          expect(requestGuestCreate(invalidSessionid, validName).toStrictEqual(makeCustomErrorForTest(400)));
        });

        test('Session is not in LOBBY state, expect 400', () => { 
          const sessionId = requestQuestionSessionId(quiz.quizId, author.token, questionBody);
          const invalidSessionid = sessionId + 1;
          const validName = 'Hayden'
          requestUpdateSessionState(quiz.quizId, sessionId, author.token, {action: "NEXT_QUESTION"})
          expect(requestGuestCreate(invalidSessionid, validName).toStrictEqual(makeCustomErrorForTest(400)));
        });

        test('Creating A Valid Guest Player, Should return a Unique PlayerId, expect 200', () => { 
          const sessionId = requestQuestionSessionId(quiz.quizId, author.token, questionBody);
          // Should Generate a Unique Id
          const validName = ''
          expect(requestGuestCreate(sessionId, validName).toStrictEqual(makeCustomErrorForTest(200)));
        });


    });
});

describe('Testing GET /v1/player/${playerId}', () => { 

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
    const questionBody: QuestionBody = { question: 'Question 1', duration: 5, points: 5, answers: answers, thumbnailUrl: 'http://google.com/some/image/path.jpg' };
    question1 = requestQuestionCreate(author.token, quiz.quizId, questionBody);
    });
  
    describe ('Getting the Status of a Guest Player', () => {

      test('Going to Pass in invalid player ID, expect 400', () => { 
        const sessionId = requestQuestionSessionId(quiz.quizId, author.token, questionBody);
        const validName = 'Hayden'
        const playerId = expect(requestGuestCreate(sessionId, validName).toStrictEqual(makeCustomErrorForTest(200)));

        expect(requestGuestStatus(playerId + 5).toStrictEqual(makeCustomErrorForTest(400)));
      });

      test('Going to Pass in invalid player ID, expect 400', () => { 
        const sessionId = requestQuestionSessionId(quiz.quizId, author.token, questionBody);
        const validName = 'Hayden'
        const playerId = expect(requestGuestCreate(sessionId, validName).toStrictEqual(makeCustomErrorForTest(200)));

        expect(requestGuestStatus(playerId).toStrictEqual({
          "state": "LOBBY",
          "numQuestions": expect.any(Number),
          "atQuestion": expect.any(Number)
        }));
      });

    });

});

describe('Testing GET /v1/player/${playerId}', () => { 

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
    const questionBody: QuestionBody = { question: 'Question 1', duration: 5, points: 5, answers: answers, thumbnailUrl: 'http://google.com/some/image/path.jpg' };
    question1 = requestQuestionCreate(author.token, quiz.quizId, questionBody);
    });
  
    describe ('Getting the Status of a Guest Player', () => {

      test('Going to Pass in invalid player ID, expect 400', () => { 
        const sessionId = requestQuestionSessionId(quiz.quizId, author.token, questionBody);
        const validName = 'Hayden'
        const playerId = expect(requestGuestCreate(sessionId, validName).toStrictEqual(makeCustomErrorForTest(200)));

        expect(requestGuestStatus(playerId + 5).toStrictEqual(makeCustomErrorForTest(400)));
      });

      test('Going to Pass in invalid player ID, expect 400', () => { 
        const sessionId = requestQuestionSessionId(quiz.quizId, author.token, questionBody);
        const validName = 'Hayden'
        const playerId = expect(requestGuestCreate(sessionId, validName).toStrictEqual(makeCustomErrorForTest(200)));

        expect(requestGuestStatus(playerId).toStrictEqual({
          "state": "LOBBY",
          "numQuestions": expect.any(Number),
          "atQuestion": expect.any(Number)
        }));
      });

    });

});
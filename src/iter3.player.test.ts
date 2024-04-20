import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { IncomingHttpHeaders } from 'http';
import { Actions } from './returnInterfaces';

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

const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
};

const requestQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
};

const requestSessionStart = (quizId: number, token: string, autoStartNum: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });
};

const requestSessionUpdate = (quizId: number, sessionId: number, token: string, action: string) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/session/${sessionId}`, { action }, { token });
};

const requestSessionStatus = (quizId: number, sessionid: number, token: string) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionid}`, {}, { token });
};

const requestPlayerJoin = (sessionId: number, name: string) => {
  return requestHelper('POST', '/v1/player/join', { sessionId, name }, {});
};

// const requestPlayerStatus = (playerId: number) => {
//   return requestHelper('GET', `/v1/player/${playerId}`, {}, {});
// };

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  requestClear();
});

/**                            Testing Player Join                            */
describe('Testing POST /v1/player/join', () => {
  let author: {token: string}, quiz: {quizId: number}, question: {questionId: number}, session: {sessionId: number};
  // let author: {token: string}, quiz: {quizId: number}, session: {sessionId: number};
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz 1 Des');

    const questionBody: QuestionBody = {
      question: 'Question 1',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    };
    question = requestQuestionCreate(author.token, quiz.quizId, questionBody);
    session = requestSessionStart(quiz.quizId, author.token, 3);
  });

  describe('TESTING: Error cases', () => {
    test('Name of user is not unique (compared to users already in session)', () => {
      requestPlayerJoin(session.sessionId, 'Michael Hourn');
      expect(requestPlayerJoin(session.sessionId, 'Michael Hourn')).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Invalid SessionID', () => {
      expect(requestPlayerJoin(session.sessionId + 1, 'Michael Hourn'));
    });

    test('Session is not in LOBBY State', () => {
      requestSessionUpdate(quiz.quizId, session.sessionId, author.token, Actions.NextQuestion);
      expect(requestPlayerJoin(session.sessionId, 'Michael Hourn')).toStrictEqual(makeCustomErrorForTest(400));
    });
  });

  describe('TESTING: Success cases', () => {
    test('Correct return type', () => {
      expect(requestPlayerJoin(session.sessionId, 'Michael Hourn')).toStrictEqual({ playerId: expect.any(Number) });
    });

    test('Shows in quiz session status', () => {
      requestPlayerJoin(session.sessionId, 'Michael Hourn');
      expect(requestSessionStatus(quiz.quizId, session.sessionId, author.token)).toStrictEqual({
        state: 'LOBBY',
        atQuestion: 0,
        players: [
          'Michael Hourn'
        ],
        metadata: {
          quizId: quiz.quizId,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz 1 Des',
          numQuestions: 1,
          questions: [
            {
              questionId: question.questionId,
              question: 'Question 1',
              duration: 5,
              thumbnailUrl: 'http://google.com/some/image/path.jpg',
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 5,
          thumbnailUrl: expect.any(String),
        }
      });
    });
  });
});

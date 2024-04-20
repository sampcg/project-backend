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

const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
};

const requestQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody) => {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
};

const requestSessionStart = (token: string, quizId: number, autoStartNum: number) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });
};

const requestPlayerJoin = (sessionId: number, name: string) => {
  return requestHelper('POST', '/v1/player/join', { sessionId, name }, {});
};

const requestChatList = (playerId: number) => {
  return requestHelper('GET', `/v1/player/${playerId}/chat`, {}, {});
};

const requestSendChat = (playerId: number, message: { messageBody: string }) => {
  return requestHelper('POST', `/v1/player/${playerId}/chat`, { message }, {});
};

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

/**                          Clear before each test                           */
beforeEach(() => {
  requestClear();
});

/**                             Testing Chat List                             */
describe('Testing GET /v1/player/{playerid}/chat', () => {
  let author: {token: string}, quiz: {quizId: number}, player: {playerId: number}, session: {sessionId: number};
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz 1 Des');
    const answers: AnswerInput[] =
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
    session = requestSessionStart(author.token, quiz.quizId, 3);
    player = requestPlayerJoin(session.sessionId, 'Michael Hourn');
  });

  describe('TESTING: Error Cases', () => {
    test('playerID does not exist', () => {
      expect(requestChatList(player.playerId + 1)).toStrictEqual(makeCustomErrorForTest(400));
    });
  });

  describe('TESTING: Success Cases', () => {
    test('No messages', () => {
      expect(requestChatList(player.playerId)).toStrictEqual({ messages: [] });
    });

    test('One message', () => {
      requestSendChat(player.playerId, { messageBody: 'hello everyone' });
      expect(requestChatList(player.playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'hello everyone',
            playerId: player.playerId,
            playerName: 'Michael Hourn',
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('Multiple messages (correct order)', () => {
      requestSendChat(player.playerId, { messageBody: 'hello everyone' });
      requestSendChat(player.playerId, { messageBody: 'I am lonely :(' });
      expect(requestChatList(player.playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'hello everyone',
            playerId: player.playerId,
            playerName: 'Michael Hourn',
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'I am lonely :(',
            playerId: player.playerId,
            playerName: 'Michael Hourn',
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('Multiple players', () => {
      const player2: {playerId: number} = requestPlayerJoin(session.sessionId, 'John Doe');
      requestSendChat(player.playerId, { messageBody: 'hello everyone' });
      requestSendChat(player2.playerId, { messageBody: 'Hello!' });
      requestSendChat(player.playerId, { messageBody: 'I have friends!' });
      expect(requestChatList(player.playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'hello everyone',
            playerId: player.playerId,
            playerName: 'Michael Hourn',
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'Hello!',
            playerId: player2.playerId,
            playerName: 'John Doe',
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'I have friends!',
            playerId: player.playerId,
            playerName: 'Michael Hourn',
            timeSent: expect.any(Number)
          }
        ]
      });
      // Check that Chat List is the same for all players in a session
      expect(requestChatList(player.playerId)).toStrictEqual(requestChatList(player2.playerId));
    });

    test('In a second session', () => {
      requestSendChat(player.playerId, { messageBody: 'hello everyone' });
      const session2: {sessionId: number} = requestSessionStart(author.token, quiz.quizId, 3);
      const player2: {playerId: number} = requestPlayerJoin(session2.sessionId, 'John Doe');
      requestSendChat(player2.playerId, { messageBody: 'bruh' });
      expect(requestChatList(player2.playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'bruh',
            playerId: player2.playerId,
            playerName: 'John Doe',
            timeSent: expect.any(Number)
          }
        ]
      });
    });
  });
});

/**                             Testing Send Chat                             */
describe('Testing POST /v1/player/{playerid}/chat', () => {
  let author: {token: string}, quiz: {quizId: number}, player: {playerId: number}, session: {sessionId: number};
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz 1 Des');
    const answers: AnswerInput[] =
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
    session = requestSessionStart(author.token, quiz.quizId, 3);
    player = requestPlayerJoin(session.sessionId, 'Michael Hourn');
  });

  describe('TESTING: Error Cases', () => {
    test('playerID does not exist', () => {
      expect(requestSendChat(player.playerId + 1, { messageBody: 'hello' })).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('messageBody less than 1 character', () => {
      expect(requestSendChat(player.playerId, { messageBody: '' })).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('messageBody more than 100 characters', () => {
      const longMessage = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789';
      expect(requestSendChat(player.playerId, { messageBody: longMessage })).toStrictEqual(makeCustomErrorForTest(400));
    });
  });

  describe('TESTING: Success Cases', () => {
    test('Correct return type', () => {
      expect(requestSendChat(player.playerId, { messageBody: 'hello' })).toStrictEqual({});
    });

    test('Message appears', () => {
      requestSendChat(player.playerId, { messageBody: 'hello everyone' });
      expect(requestChatList(player.playerId)).toStrictEqual({
        messages: [
          {
            messageBody: 'hello everyone',
            playerId: player.playerId,
            playerName: 'Michael Hourn',
            timeSent: expect.any(Number)
          }
        ]
      });
    });
  });
});

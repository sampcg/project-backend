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

const requestClear = () => {
    return requestHelper('DELETE', '/v1/clear', {});
};

const requestSessionStatus = (token: string, quizId: number, sessionid: number) => {
    return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionid}`, {}, {token} )
}

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
    requestClear();
});
/// /////////////////       Testing for Listing Quizzes      //////////////////// 

describe('Testing GET /v1/admin/quiz/{quizid}/session/{sessionid}', () => {
    let author: {token: string};
    let quizId: number;
    let sessionId: number;
    
    beforeEach(() => {
      author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
      quizId = requestQuizCreate(author.token, 'Quiz 1', 'a').quizId;
      sessionId = startNewSession(author.token, quizId, { autoStartNum: 3 }).sessionId;
    });
  
    test('Testing: Error Case - Invalid Token', () => {
      const invalidToken = author.token + 'Math.random()';
      expect(requestSessionStatus(invalidToken, quizId, sessionId)).toStrictEqual(makeCustomErrorForTest(401));
    });
  
    test('Testing: Error Case - Session Id does not exist', () => {
      const nonExistingSessionId = sessionId + 100;
      expect(requestSessionStatus(author.token, quizId, nonExistingSessionId)).toStrictEqual(makeCustomErrorForTest(400));
    });
  
    test('Testing: Error Case - User not owner of the quiz', () => {
      const unauthorizedUser = requestRegisterAuth('unauthorized@test.com', 'abcdefgh1234', 'Unauthorized', 'User');
      expect(requestSessionStatus(unauthorizedUser.token, quizId, sessionId)).toStrictEqual(makeCustomErrorForTest(403));
    });
  
    test('Testing: Successful Case', () => {
      const sessionStatus = requestSessionStatus(author.token, quizId, sessionId);
      expect(sessionStatus).toHaveProperty('state', 'LOBBY');
    });
  });
  
  
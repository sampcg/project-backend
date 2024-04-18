import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };
const anyNumber = expect.any(Number);
const SUCCESS = 200;
const BADREQUEST = 400;
const UNAUTHORIZED = 401;

export const createRequest = (method: HttpVerb, path: string, payload: object) => {
  let qs = {};
  let json = {};
  json = payload;
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 10000 });
  const responseBody = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, body: responseBody };
};

/// ///////////////////////// Wrapper Functions /////////////////////////////////

const clear = () => {
  return createRequest('DELETE', '/v1/clear', {});
};

const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return createRequest('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

const adminUserDetails = (token: string) => {
  return createRequest('GET', '/v1/admin/user/details', { token });
};

const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
  return createRequest('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });
};

const adminUserDetailsUpdateV2 = (token: string, email: string, nameFirst: string, nameLast: string) => {
  return createRequest('PUT', '/v2/admin/user/details', { token, email, nameFirst, nameLast });
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  clear();
});

describe('adminUserDetailsUpdate function tests', () => {
  let user: { statusCode: number; body: {token: string}; };
  beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
  });
  test('correct cases', () => {
    const test1 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'Jake', 'Renzella');
    expect(test1.body).toStrictEqual({});
    expect(test1.statusCode).toBe(SUCCESS);
    const test2 = adminUserDetails(user.body.token);
    expect(test2.body).toStrictEqual({
      user: {
        userId: anyNumber,
        name: 'Jake Renzella',
        email: 'validemail@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
    const test3 = adminUserDetailsUpdate(user.body.token, 'hayden.smith@unsw.edu.au', 'Smith', 'Hayden');
    expect(test3.body).toStrictEqual({});
    expect(test3.statusCode).toBe(SUCCESS);
  });

  /** error cases */
  test('Token is invalid', () => {
    const test = adminUserDetailsUpdate('1531', 'validemail@gmail.com', 'Jake', 'Renzella');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(UNAUTHORIZED);
  });
  test.each([
    { token: '' },
    { token: undefined },
    { token: null },
  ])('Token is not a valid structure: $token', ({ token }) => {
    const test2 = adminUserDetailsUpdate(token, 'validemail@gmail.com', 'Jake', 'Renzella');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(UNAUTHORIZED);
  });
  test('email is used', () => {
    const test = adminUserDetailsUpdate(user.body.token, 'hayden.smith@unsw.edu.au', 'Hayden', 'Smith');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(BADREQUEST);
  });
  test.each([
    { email: 'hayden!unsw.edu.au' },
    { email: 'hayden.smith@unsw' },
    { email: 'hayden.smith@unsw.' },
    { email: '@unsw.com' },
    { email: '@unsw' },
    { email: '@' },
    { email: ' @ ' },
    { email: ' @ . ' },
  ])('error: $email', ({ email }) => {
    const test = adminUserDetailsUpdate(user.body.token, email, 'Hayden', 'Smith');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(BADREQUEST);
  });
  test('invalid characters in nameFirst', () => {
    const test1 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'Jake@', 'Renzella');
    expect(test1.body).toStrictEqual(ERROR);
    expect(test1.statusCode).toBe(BADREQUEST);
    const test2 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'Jake 1', 'Renzella');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(BADREQUEST);
  });
  test('Invalid First Name length', () => {
    const test1 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'J', 'Renzella');
    expect(test1.body).toStrictEqual(ERROR);
    expect(test1.statusCode).toBe(BADREQUEST);
    const test2 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', '', 'Renzella');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(BADREQUEST);
    const test3 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'JakeJakeJakeJakeJakeJake', 'Renzella');
    expect(test3.body).toStrictEqual(ERROR);
    expect(test3.statusCode).toBe(BADREQUEST);
  });
  test('invalid characters in nameLast', () => {
    const test1 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'Jake', 'Renzella@');
    expect(test1.body).toStrictEqual(ERROR);
    expect(test1.statusCode).toBe(BADREQUEST);
    const test2 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'Jake', 'Renzella 1');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(BADREQUEST);
  });
  test('Invalid Last Name length', () => {
    const test1 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'Jake', 'R');
    expect(test1.body).toStrictEqual(ERROR);
    expect(test1.statusCode).toBe(BADREQUEST);
    const test2 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'Jake', '');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(BADREQUEST);
    const test3 = adminUserDetailsUpdate(user.body.token, 'validemail@gmail.com', 'Jake', 'RenzellaRenzellaRenzellaRenzella');
    expect(test3.body).toStrictEqual(ERROR);
    expect(test3.statusCode).toBe(BADREQUEST);
  });
});

describe('adminUserDetailsUpdateV2 function tests', () => {
  let user: { statusCode: number; body: {token: string}; };
  beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
  });
  test('correct cases', () => {
    const test1 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'Jake', 'Renzella');
    expect(test1.body).toStrictEqual({});
    expect(test1.statusCode).toBe(SUCCESS);
    const test2 = adminUserDetails(user.body.token);
    expect(test2.body).toStrictEqual({
      user: {
        userId: anyNumber,
        name: 'Jake Renzella',
        email: 'validemail@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
    const test3 = adminUserDetailsUpdateV2(user.body.token, 'hayden.smith@unsw.edu.au', 'Smith', 'Hayden');
    expect(test3.body).toStrictEqual({});
    expect(test3.statusCode).toBe(SUCCESS);
  });

  /** error cases */
  test('Token is invalid', () => {
    const test = adminUserDetailsUpdateV2('1531', 'validemail@gmail.com', 'Jake', 'Renzella');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(UNAUTHORIZED);
  });
  test.each([
    { token: '' },
    { token: undefined },
    { token: null },
  ])('Token is not a valid structure: $token', ({ token }) => {
    const test2 = adminUserDetailsUpdateV2(token, 'validemail@gmail.com', 'Jake', 'Renzella');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(UNAUTHORIZED);
  });
  test('email is used', () => {
    const test = adminUserDetailsUpdateV2(user.body.token, 'hayden.smith@unsw.edu.au', 'Hayden', 'Smith');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(BADREQUEST);
  });
  test.each([
    { email: 'hayden!unsw.edu.au' },
    { email: 'hayden.smith@unsw' },
    { email: 'hayden.smith@unsw.' },
    { email: '@unsw.com' },
    { email: '@unsw' },
    { email: '@' },
    { email: ' @ ' },
    { email: ' @ . ' },
  ])('error: $email', ({ email }) => {
    const test = adminUserDetailsUpdateV2(user.body.token, email, 'Hayden', 'Smith');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(BADREQUEST);
  });
  test('invalid characters in nameFirst', () => {
    const test1 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'Jake@', 'Renzella');
    expect(test1.body).toStrictEqual(ERROR);
    expect(test1.statusCode).toBe(BADREQUEST);
    const test2 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'Jake 1', 'Renzella');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(BADREQUEST);
  });
  test('Invalid First Name length', () => {
    const test1 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'J', 'Renzella');
    expect(test1.body).toStrictEqual(ERROR);
    expect(test1.statusCode).toBe(BADREQUEST);
    const test2 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', '', 'Renzella');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(BADREQUEST);
    const test3 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'JakeJakeJakeJakeJakeJake', 'Renzella');
    expect(test3.body).toStrictEqual(ERROR);
    expect(test3.statusCode).toBe(BADREQUEST);
  });
  test('invalid characters in nameLast', () => {
    const test1 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'Jake', 'Renzella@');
    expect(test1.body).toStrictEqual(ERROR);
    expect(test1.statusCode).toBe(BADREQUEST);
    const test2 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'Jake', 'Renzella 1');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(BADREQUEST);
  });
  test('Invalid Last Name length', () => {
    const test1 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'Jake', 'R');
    expect(test1.body).toStrictEqual(ERROR);
    expect(test1.statusCode).toBe(BADREQUEST);
    const test2 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'Jake', '');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(BADREQUEST);
    const test3 = adminUserDetailsUpdateV2(user.body.token, 'validemail@gmail.com', 'Jake', 'RenzellaRenzellaRenzellaRenzella');
    expect(test3.body).toStrictEqual(ERROR);
    expect(test3.statusCode).toBe(BADREQUEST);
  });
});

import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };
// const anyNumber = expect.any(Number);
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

const adminAuthLogin = (email: string, password: string) => {
  return createRequest('POST', '/v1/admin/auth/login', { email, password });
};

export const adminUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string) => {
  return createRequest('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  clear();
});

describe('adminUserPasswordUpdate function tests', () => {
  let user: { statusCode: number; body: {token: string}; };
  beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
  });
  test('correct cases', () => {
    const test1 = adminUserPasswordUpdate(user.body.token, '123456ABC', 'Tw3lv3L3tt3r');
    expect(test1.body).toStrictEqual({});
    expect(test1.statusCode).toBe(SUCCESS);
    expect(adminAuthLogin('hayden.smith@unsw.edu.au', '123456ABC').statusCode).toStrictEqual(BADREQUEST);
    expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'Tw3lv3L3tt3r').statusCode).toStrictEqual(SUCCESS);
  });
  /** error cases */
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    const test = adminUserPasswordUpdate('1531', '123456ABC', 'Tw3lv3L3tt3r');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(UNAUTHORIZED);
  });
  test.each([
    { token: '' },
    { token: undefined },
    { token: null },
  ])('Token is not a valid structure: $token', ({ token }) => {
    const test = adminUserPasswordUpdate(token, '123456ABC', 'Tw3lv3L3tt3r');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(UNAUTHORIZED);
  });
  test('Old Password is not the correct old password', () => {
    const test = adminUserPasswordUpdate(user.body.token, '1234566ABC', 'Tw3lv3L3tt3r');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(BADREQUEST);
  });
  test('Old Password and New Password match exactly', () => {
    const test = adminUserPasswordUpdate(user.body.token, '123456ABC', '123456ABC');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(BADREQUEST);
  });
  test('New Password has already been used before by this user', () => {
    adminUserPasswordUpdate(user.body.token, '123456ABC', 'Tw3lv3L3tt3r');
    const test = adminUserPasswordUpdate(user.body.token, 'Tw3lv3L3tt3r', '123456ABC');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(BADREQUEST);
  });
  test('New Password is less than 8 characters', () => {
    const test = adminUserPasswordUpdate(user.body.token, '123456ABC', 'Tw3');
    expect(test.body).toStrictEqual(ERROR);
    expect(test.statusCode).toBe(BADREQUEST);
  });
  test('New Password does not contain at least one number and at least one letter', () => {
    const test1 = adminUserPasswordUpdate(user.body.token, '123456ABC', 'Ttttttttt');
    expect(test1.body).toStrictEqual(ERROR);
    expect(test1.statusCode).toBe(BADREQUEST);
    const test2 = adminUserPasswordUpdate(user.body.token, '123456ABC', '111111111');
    expect(test2.body).toStrictEqual(ERROR);
    expect(test2.statusCode).toBe(BADREQUEST);
  });
});

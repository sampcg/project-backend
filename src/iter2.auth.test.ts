import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
// import { ErrorObject } from './returnInterfaces';
// import { User } from './returnInterfaces';
// import { Quiz } from './returnInterfaces';
// import { Trash } from './returnInterfaces';

// Series of iter2 tests that need to be updated to iter3. Put updates in iter3.auth.test.ts

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

// const adminAuthLogin = (email: string, password: string) => {
//   return createRequest('POST', '/v1/admin/auth/login', { email, password });
// };

const adminUserDetails = (token: string) => {
  return createRequest('GET', '/v1/admin/user/details', { token });
};

const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
  return createRequest('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });
};

const adminUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string) => {
  return createRequest('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  clear();
});

// BEGINNING OF AUTH USER DETAILS
// Abrar

describe('Testing GET /v1/admin/user/details', () => {
  test('Checking if AuthUserId is valid', () => {
    const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'aaa@bbb.com',
        password: 'abcde12345',
        nameFirst: 'Michael',
        nameLast: 'Hourn'
      }
    });

    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
    const { token } = JSON.parse(AuthRegisterResponse.body.toString());

    // const isEmpty = Object.keys(AuthRegisterJSON).length === 0;
    // console.log(isEmpty)
    // First Test of Passing

    const AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details?token=${token}`);

    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    const AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect(AuthUserDetailsJSON).toEqual({ user: expect.any(Object) });

    // Now checking by passing incorrect authId
    const incorrectToken3 = '223434!';
    const encodedToken3 = encodeURIComponent(JSON.stringify(incorrectToken3));
    const AuthUserDetailsResponse3 = request('GET', `${SERVER_URL}/v1/admin/user/details?token=${encodedToken3}`);
    expect(AuthUserDetailsResponse3.statusCode).toStrictEqual(401);
    const AuthUserDetailsJSON3 = JSON.parse(AuthUserDetailsResponse3.body.toString());
    expect(AuthUserDetailsJSON3).toStrictEqual({ error: expect.any(String) });

    // Second request with authUserId as a query parameter
    const incorrectToken = 'Hello, World!';
    const encodedToken = encodeURIComponent(JSON.stringify(incorrectToken));
    const AuthUserDetailsResponse2 = request('GET', `${SERVER_URL}/v1/admin/user/details?token=${encodedToken}`);
    expect(AuthUserDetailsResponse2.statusCode).toStrictEqual(401);
    const AuthUserDetailsJSON2 = JSON.parse(AuthUserDetailsResponse2.body.toString());
    expect(AuthUserDetailsJSON2).toStrictEqual({ error: expect.any(String) });
  });

  test('Checking if AuthUserDetails giving correct number of successfull logins', () => {
    const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'blah@email.com',
        password: 'abcde12345',
        nameFirst: 'john',
        nameLast: 'smith'
      }
    });

    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
    const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());

    request('POST', `${SERVER_URL}/v1/admin/auth/login`,
      { json: { email: 'blah@email.com', password: 'abcde12345' } });

    let AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details?token=${encodeURIComponent(AuthRegisterJSON.token)}`);
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    let AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect(AuthUserDetailsJSON).toStrictEqual({
      user: {
        userId: 0,
        email: 'blah@email.com',
        name: 'john smith',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });

    request('POST', `${SERVER_URL}/v1/admin/auth/login`,
      { json: { email: 'blah@email.com', password: 'abcde12345' } });

    AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details?token=${encodeURIComponent(AuthRegisterJSON.token)}`);
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect(AuthUserDetailsJSON).toStrictEqual({
      user: {
        userId: 0,
        email: 'blah@email.com',
        name: 'john smith',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 0
      }
    });

    // request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    //   { json: { email: 'blah@email.com', password: 'WrongPassword1' } });

    // AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details?token=${encodeURIComponent(AuthRegisterJSON.token)}`);
    // expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    // AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    // expect(AuthUserDetailsJSON).toStrictEqual({
    //   user: {
    //     userId: 0,
    //     email: 'blah@email.com',
    //     name: 'john smith',
    //     numSuccessfulLogins: 3,
    //     numFailedPasswordsSinceLastLogin: 1
    //   }
    // });

    // request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    //   { json: { email: 'blah@email.com', password: 'WrongPassword2' } });

    // AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details?token=${encodeURIComponent(AuthRegisterJSON.token)}`);
    // expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    // AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    // expect(AuthUserDetailsJSON).toStrictEqual({
    //   user: {
    //     userId: 0,
    //     email: 'blah@email.com',
    //     name: 'john smith',
    //     numSuccessfulLogins: 3,
    //     numFailedPasswordsSinceLastLogin: 2
    //   }
    // });

    request('POST', `${SERVER_URL}/v1/admin/auth/login`,
      { json: { email: 'blah@email.com', password: 'abcde12345' } });

    AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details?token=${encodeURIComponent(AuthRegisterJSON.token)}`);
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect(AuthUserDetailsJSON).toStrictEqual({
      user: {
        userId: 0,
        email: 'blah@email.com',
        name: 'john smith',
        numSuccessfulLogins: 4,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});

// BEGINNING OF AUTH LOGOUT TESTING
// Abrar

describe('Testing POST /v1/admin/auth/logout', () => {
  test('Checking if token is valid, expect 200', () => {
    const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'aaa@bbb.com',
        password: 'abcde12345',
        nameFirst: 'Michael',
        nameLast: 'Hourn'
      }
    });

    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
    const { token } = JSON.parse(AuthRegisterResponse.body.toString());
    // Now Trying to logout with no valid token stored

    const AuthLogoutResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
      { json: { token: token } });
    expect(AuthLogoutResponse2.statusCode).toStrictEqual(200);
    const AuthLogoutJSON2 = JSON.parse(AuthLogoutResponse2.body.toString());
    expect(AuthLogoutJSON2).toStrictEqual({});

    const AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
      { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });
    expect(AuthLoginResponse.statusCode).toStrictEqual(200);
    const AuthLoginJSON = JSON.parse(AuthLoginResponse.body.toString());
    expect(AuthLoginJSON).toStrictEqual({ token: expect.any(String) });
    const { token: token2 } = AuthLoginJSON;

    const AuthLogoutResponse3 = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
      { json: { token: token2 } });
    expect(AuthLogoutResponse3.statusCode).toStrictEqual(200);
    const AuthLogoutJSON3 = JSON.parse(AuthLogoutResponse3.body.toString());
    expect(AuthLogoutJSON3).toStrictEqual({});
  });

  test('Checking when double logout is done, expect 401', () => {
    // Loginning the Admin
    const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'aaa@bbb.com',
        password: 'abcde12345',
        nameFirst: 'Michael',
        nameLast: 'Hourn'
      }
    });

    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
    const { token } = JSON.parse(AuthRegisterResponse.body.toString());

    const AuthLogoutResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
      { json: { token: token } });
    expect(AuthLogoutResponse2.statusCode).toStrictEqual(200);
    const AuthLogoutJSON2 = JSON.parse(AuthLogoutResponse2.body.toString());
    expect(AuthLogoutJSON2).toStrictEqual({});

    const AuthLogoutResponse3 = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
      { json: { token: token } });
    expect(AuthLogoutResponse3.statusCode).toStrictEqual(401);
    const AuthLogoutJSON3 = JSON.parse(AuthLogoutResponse3.body.toString());
    expect(AuthLogoutJSON3).toStrictEqual({ error: expect.any(String) });
  });
});

// END OF AUTH LOGOUT TESTING

// TESTING adminUserDetailsUpdate
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

// TESTING adminUserPasswordUpdate
describe('adminUserPasswordUpdate function tests', () => {
  let user: { statusCode: number; body: {token: string}; };
  beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
  });
  // test('correct cases', () => {
  //   const test1 = adminUserPasswordUpdate(user.body.token, '123456ABC', 'Tw3lv3L3tt3r');
  //   expect(test1.body).toStrictEqual({});
  //   expect(test1.statusCode).toBe(SUCCESS);
  //   expect(adminAuthLogin('hayden.smith@unsw.edu.au', '123456ABC').statusCode).toStrictEqual(BADREQUEST);
  //   expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'Tw3lv3L3tt3r').statusCode).toStrictEqual(SUCCESS);
  // });
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

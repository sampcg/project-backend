test('Remove this test and uncomment the sample tests further below', () => {
  expect(1 + 1).toEqual(2);
});

/*
import request from 'sync-request-curl';
import { port, url } from './config.json';
import { ErrorObject } from './returnInterfaces';
import { User } from './returnInterfaces';
import { Quiz } from './returnInterfaces';
import { Trash } from './returnInterfaces';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

//  BEGINNING OF TESTING ADMIN AUTH REGISTER  //
describe('Testing POST /v1/admin/auth/register', () => {
  // This is the correct output for AdminAuthRegister
  test('Correct status code and return value', () => {
    const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'aaa@bbb.com',
        password: 'abcde12345',
        nameFirst: 'Michael',
        nameLast: 'Hourn'
      }
    });

    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);

    const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
    expect(AuthRegisterJSON).toStrictEqual({ authUserId: expect.any(Number) });
  });

  // 2)Checking for valid email structure
  test.each([
    {
      // Already used email
      email: 'aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Abrar',
      nameLast: 'Gofur'
    },
    {
      email: '12342132',
      password: 'abcde12345',
      nameFirst: 'Abrar',
      nameLast: 'Gofur'
    },
    {
      email: '@.com',
      password: 'abcde12345',
      nameFirst: 'Abrar',
      nameLast: 'Gofur'
    },
    {
      email: 'Hello,World!',
      password: 'abcde12345',
      nameFirst: 'Abrar',
      nameLast: 'Gofur'
    },
    {
      email: '.com.@',
      password: 'abcde12345',
      nameFirst: 'Abrar',
      nameLast: 'Gofur'
    },
  ])(
    'Checking for valid emails and already used or not',
    ({ email, password, nameFirst, nameLast }) => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ error: expect.any(String) });
    });
  // 3) NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
  test.each([
    {
      email: '1aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Abrar!',
      nameLast: 'Hourn'
    },
    {
      email: '2aa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Abrar#',
      nameLast: 'Hourn'
    },
    {
      email: '3aa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Sam(parameters)',
      nameLast: 'Hourn'
    },
    {
      email: '4aa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael@',
      nameLast: 'Hourn'
    },
    {
      email: '5aa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Micha*l',
      nameLast: 'Hourn'
    },
    {
      email: '6aa@bbb.com',
      password: 'abcde12345',
      nameFirst: '9+10=21',
      nameLast: 'Hourn'
    }
  ])(
    'Checking for invalid characters firstName',
    ({ email, password, nameFirst, nameLast }) => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ error: expect.any(String) });
    });

  // 4)NameFirst is less than 2 characters or more than 20 characters (pt. 1/2)
  test.each([
    {
      email: 'aaa7@bbb.com',
      password: 'abcde12345',
      nameFirst: 'M',
      nameLast: 'Hourn'
    },
    {
      email: 'aaa8@bbb.com',
      password: 'abcde12345',
      nameFirst: 'aaaaaaaaaaaaaaaaaaaaa',
      nameLast: 'Hourn'
    },

  ])(
    'Checking length of firstName, errors expected return',
    ({ email, password, nameFirst, nameLast }) => {
      let AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
      AuthRegisterResponse = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterResponse).toStrictEqual({ error: expect.any(String) });
    });

  // 4)NameFirst is less than 2 characters or more than 20 characters (pt. 2/2)
  test.each([
    {
      email: 'aaa9@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Mi',
      nameLast: 'Hourn'
    },
    {
      email: 'aaa10@bbb.com',
      password: 'abcde12345',
      nameFirst: 'aaaaaaaaaaaaaaaaaaaa',
      nameLast: 'Hourn'
    },

  ])(
    'Checking length of firstName, pass expected return',
    ({ email, password, nameFirst, nameLast }) => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ authUserId: expect.any(Number) });
    });
  // 5)NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
  test.each([
    {
      email: '1aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: 'Abrar!'
    },
    {
      email: '2aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: 'Abrar#'
    },
    {
      email: '3aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: 'Sam(parameters)'
    },
    {
      email: '4aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: 'Miche@l'
    },
    {
      email: '5aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: 'Miche*l'
    },
    {
      email: '6aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: '9+10=21'
    },

  ])(
    'Checking for invalid character lastName',
    ({ email, password, nameFirst, nameLast }) => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ error: expect.any(String) });
    });

  // 6)NameLast is less than 2 characters or more than 20 characters. (pt. 1/2)
  test.each([
    {
      email: '7aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: 'M'
    },
    {
      email: '8aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: 'aaaaaaaaaaaaaaaaaaaaa'
    }
  ])(

    'Checking length of lastName, error expected return',
    ({ email, password, nameFirst, nameLast }) => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ error: expect.any(String) });
    });
  // 6)NameLast is less than 2 characters or more than 20 characters. (pt. 2/2)
  test.each([
    {
      email: '9aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: 'Mi'
    },
    {
      email: '10aaa@bbb.com',
      password: 'abcde12345',
      nameFirst: 'Michael',
      nameLast: 'aaaaaaaaaaaaaaaaaaaa'
    }
  ])(

    'Checking length of lastName, pass expected return',
    ({ email, password, nameFirst, nameLast }) => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ authUserId: expect.any(Number) });
    });

  // 7) Password is less than 8 characters.
  test.each([
    {
      email: '11aaa@bbb.com',
      password: 'a1',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    },
    {
      email: '12aaa@bbb.com',
      password: 'a12',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    },
    {
      email: '13aaa@bbb.com',
      password: 'a123',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    },
    {
      email: '14aaa@bbb.com',
      password: 'a1234',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    },
    {
      email: '15aaa@bbb.com',
      password: 'a12345',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    },
    {
      email: '16aaa@bbb.com',
      password: 'a123456',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    },
  ])(

    'Checking length of password, error return expected',
    ({ email, password, nameFirst, nameLast }) => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ error: expect.any(String) });
    });

  test('Checking length of password, error return expected', () => {
    const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: '17aaa@bbb.com',
        password: 'a1234567',
        nameFirst: 'Michael',
        nameLast: 'Hourn'
      }
    });

    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);

    const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
    expect(AuthRegisterJSON).toStrictEqual({ authUserId: expect.any(Number) });
  });

  // 8)Password does not contain at least one number and at least one letter (pt. 1/2)

  test.each([
    {
      email: '18aaa@bbb.com',
      password: 'aaaaaaaa',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    },
    {
      email: '19aaa@bbb.com',
      password: '11111111',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    }
  ])(
    'Checking length of password, error return expected',
    ({ email, password, nameFirst, nameLast }) => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ error: expect.any(String) });
    });

  test.each([
    {
      email: '20aaa@bbb.com',
      password: 'aaaaaaaa1',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    },
    {
      email: '21aaa@bbb.com',
      password: 'a11111111',
      nameFirst: 'Michael',
      nameLast: 'Hourn'
    }
  ])(
    'Checking length of password, error return expected',
    ({ email, password, nameFirst, nameLast }) => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ authUserId: expect.any(Number) });
    });
});

// END OF AUTH REGISTER TESTING

// BEGINNING OF AUTH LOGIN TESTING

describe('Testing POST /v1/admin/auth/login', () => {

  test('Checking for Emails that dont exist', () => {

    const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'aaa@bbb.com',
        password: 'abcde12345',
        nameFirst: 'Michael',
        nameLast: 'Hourn'
      }
    });

    const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);

    const AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'aaa@bbb.com', password: 'abcde12345'}});

    expect(AuthLoginResponse.statusCode).toStrictEqual(200);
    const AuthLoginJSON = JSON.parse(AuthLoginResponse.body.toString());
    expect (AuthLoginJSON).toStrictEqual({ authUserId: expect.any(Number)});

    const AuthLoginResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'fake@email.com', password: 'abcde12345'}});

    expect(AuthLoginResponse2.statusCode).toStrictEqual(400);
    const AuthLoginJSON2 = JSON.parse(AuthLoginResponse2.body.toString());
    expect (AuthLoginJSON).toStrictEqual({ error: expect.any(String)});
  });

  test('Checking for incorrect password', () => {

    const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'aaa1@bbb.com',
        password: 'abcde12345',
        nameFirst: 'Michael',
        nameLast: 'Hourn'
      }
    });

    const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);

    const AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'aaa1@bbb.com', password: 'abcde12345'}});

    expect(AuthLoginResponse.statusCode).toStrictEqual(200);
    const AuthLoginJSON = JSON.parse(AuthLoginResponse.body.toString());
    expect (AuthLoginJSON).toStrictEqual({ authUserId: expect.any(Number)});

    const AuthLoginResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'aaa1@bbb.com', password: 'IncorrectPassword1'}});

    expect(AuthLoginResponse2.statusCode).toStrictEqual(400);
    const AuthLoginJSON2 = JSON.parse(AuthLoginResponse2.body.toString());
    expect (AuthLoginJSON).toStrictEqual({ error: expect.any(String)});
  });
  
});
// END OF AUTH LOGIN TESTING

// BEGINNING OF AUTH USER DETAILS

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
    const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());

    //First Test of Passing
    const AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { userId: AuthRegisterJSON.userId }});
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    const AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect (AuthUserDetailsJSON).toStrictEqual({ user: expect.any(Object) });

    //Now checking by passing incorrect authId
    const AuthUserDetailsResponse2 = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { userId: 24234234 }});
    expect(AuthUserDetailsResponse2.statusCode).toStrictEqual(401);
    const AuthUserDetailsJSON2 = JSON.parse(AuthUserDetailsResponse2.body.toString());
    expect (AuthUserDetailsJSON2).toStrictEqual({ error: expect.any(String) });

    //Now checking by passing incorrect authId
    const AuthUserDetailsResponse3 = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { userId: 'Hello, World!' }});
    expect(AuthUserDetailsResponse3.statusCode).toStrictEqual(401);
    const AuthUserDetailsJSON3 = JSON.parse(AuthUserDetailsResponse3.body.toString());
    expect (AuthUserDetailsJSON3).toStrictEqual({ error: expect.any(String) });

  });

  test('Checking if AuthUserDetails giving correct number of successfull logins', () => {

    const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'aaa@bbb.com',
        password: 'abcde12345',
        nameFirst: 'Michael',
        nameLast: 'Hourn'
      }
    });

    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
    const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());

    let AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'aaa@bbb.com', password: 'abcde12345'}});

    let AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { userId: AuthRegisterJSON.userId }});
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    let AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect (AuthUserDetailsJSON).toStrictEqual({user: {
      userId: AuthRegisterJSON.userId,
      email: 'blah@email.com',
      name: 'john smith',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0
    }
    });

    AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'aaa@bbb.com', password: 'abcde12345'}});

    AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { userId: AuthRegisterJSON.userId }});
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect (AuthUserDetailsJSON).toStrictEqual({user: {
      userId: AuthRegisterJSON.userId,
      email: 'blah@email.com',
      name: 'john smith',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 0
    }
    });

    AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'aaa@bbb.com', password: 'WrongPassword1'}});

    AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { userId: AuthRegisterJSON.userId }});
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect (AuthUserDetailsJSON).toStrictEqual({user: {
      userId: AuthRegisterJSON.userId,
      email: 'blah@email.com',
      name: 'john smith',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 1
    }
    });

    AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'aaa@bbb.com', password: 'WrongPassword2'}});

    AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { userId: AuthRegisterJSON.userId }});
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect (AuthUserDetailsJSON).toStrictEqual({user: {
      userId: AuthRegisterJSON.userId,
      email: 'blah@email.com',
      name: 'john smith',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 2
    }
    });


    AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'aaa@bbb.com', password: 'abcde12345' }});

    AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { userId: AuthRegisterJSON.userId }});
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect (AuthUserDetailsJSON).toStrictEqual({user: {
      userId: AuthRegisterJSON.userId,
      email: 'blah@email.com',
      name: 'john smith',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 0
    }
    });
  });

});
*/
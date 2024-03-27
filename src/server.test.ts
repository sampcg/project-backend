import request from 'sync-request-curl';
import { port, url } from './config.json';
// import { ErrorObject } from './returnInterfaces';
// import { User } from './returnInterfaces';
// import { Quiz } from './returnInterfaces';
// import { Trash } from './returnInterfaces';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`);
});

//  BEGINNING OF TESTING ADMIN AUTH REGISTER  //
describe('Testing POST /v1/admin/auth/register', () => {
  // This is the correct output for AdminAuthRegister
  test('Correct status code/return value, and same email error', () => {
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
    expect(AuthRegisterJSON).toStrictEqual({ token: expect.any(String) });

    // Passing in same email to be created
    const AuthRegisterResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'aaa@bbb.com',
        password: 'abcde12345',
        nameFirst: 'Abrar',
        nameLast: 'Gofur'
      }
    });
    expect(AuthRegisterResponse2.statusCode).toStrictEqual(400);

    const AuthRegisterJSON2 = JSON.parse(AuthRegisterResponse2.body.toString());
    expect(AuthRegisterJSON2).toStrictEqual({ error: expect.any(String) });
  });

  // 2)Checking for valid email structure
  test.each([
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
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: { email, password, nameFirst, nameLast }
      });
      expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
      const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterJSON).toStrictEqual({ error: expect.any(String) });
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
      expect(AuthRegisterJSON).toStrictEqual({ token: expect.any(String) });
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
      expect(AuthRegisterJSON).toStrictEqual({ token: expect.any(String) });
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
    expect(AuthRegisterJSON).toStrictEqual({ token: expect.any(String) });
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
      expect(AuthRegisterJSON).toStrictEqual({ token: expect.any(String) });
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

    // const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);

    const AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
      { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });

    expect(AuthLoginResponse.statusCode).toStrictEqual(200);
    const AuthLoginJSON = JSON.parse(AuthLoginResponse.body.toString());
    expect(AuthLoginJSON).toStrictEqual({ token: expect.any(String) });

    const AuthLoginResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
      { json: { email: 'fake@email.com', password: 'abcde12345' } });

    expect(AuthLoginResponse2.statusCode).toStrictEqual(400);
    const AuthLoginJSON2 = JSON.parse(AuthLoginResponse2.body.toString());
    expect(AuthLoginJSON2).toStrictEqual({ error: expect.any(String) });
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
    // const AuthRegisterJSON = JSON.parse(AuthRegisterResponse.body.toString());
    expect(AuthRegisterResponse.statusCode).toStrictEqual(200);

    const AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
      { json: { email: 'aaa1@bbb.com', password: 'abcde12345' } });

    expect(AuthLoginResponse.statusCode).toStrictEqual(200);
    const AuthLoginJSON = JSON.parse(AuthLoginResponse.body.toString());
    expect(AuthLoginJSON).toStrictEqual({ token: expect.any(String) });

    const AuthLoginResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
      { json: { email: 'aaa1@bbb.com', password: 'IncorrectPassword1' } });

    expect(AuthLoginResponse2.statusCode).toStrictEqual(400);
    const AuthLoginJSON2 = JSON.parse(AuthLoginResponse2.body.toString());
    expect(AuthLoginJSON2).toStrictEqual({ error: expect.any(String) });
  });
});
// END OF AUTH LOGIN TESTING

// BEGINNING OF AUTH USER DETAILS
/*
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

    console.log(AuthRegisterJSON.token);
    //First Test of Passing
    const AuthUserDetailsResponse = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { authUserId: AuthRegisterJSON.token }});
    expect(AuthUserDetailsResponse.statusCode).toStrictEqual(200);
    const AuthUserDetailsJSON = JSON.parse(AuthUserDetailsResponse.body.toString());
    expect (AuthUserDetailsJSON).toStrictEqual({ user: expect.any(Object) });

    //Now checking by passing incorrect authId
    const AuthUserDetailsResponse2 = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { token: 24234234 }});
    expect(AuthUserDetailsResponse2.statusCode).toStrictEqual(401);
    const AuthUserDetailsJSON2 = JSON.parse(AuthUserDetailsResponse2.body.toString());
    expect (AuthUserDetailsJSON2).toStrictEqual({ error: expect.any(String) });

    //Now checking by passing incorrect authId
    const AuthUserDetailsResponse3 = request('GET', `${SERVER_URL}/v1/admin/user/details`,
    { json: { token: 'Hello, World!' }});
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
    { json: { token: AuthRegisterJSON.token }});
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
    { json: { token: AuthRegisterJSON.token }});
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
    { json: { token: AuthRegisterJSON.token }});
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
    { json: { token: AuthRegisterJSON.token }});
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
    { json: { token: AuthRegisterJSON.token }});
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

// BEGINNING OF AUTH LOGOUT TESTING
/*
describe('Testing POST /v1/admin/auth/logout', () => {

  test('Checking if token is valid', () => {

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

    // First Testing of Auth Logout
    const AuthLogoutResponse = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
    { json: { token: AuthRegisterJSON.token }});
    expect(AuthLogoutResponse.statusCode).toStrictEqual(200);
    const AuthLogoutJSON = JSON.parse(AuthLogoutResponse.body.toString());
    expect (AuthLogoutJSON).toStrictEqual({});

    //Now Trying to logout with no valid token stored

    const AuthLogoutResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
    { json: { token: AuthRegisterJSON.token }});
    expect(AuthLogoutResponse2.statusCode).toStrictEqual(401);
    const AuthLogoutJSON2 = JSON.parse(AuthLogoutResponse2.body.toString());
    expect (AuthLogoutJSON2).toStrictEqual({ error: expect.any(String) });

    let AuthLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
    { json: { email: 'aaa@bbb.com', password: 'abcde12345'}});

    const AuthLogoutResponse3 = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
    { json: { token: AuthRegisterJSON.token }});
    expect(AuthLogoutResponse3.statusCode).toStrictEqual(200);
    const AuthLogoutJSON3 = JSON.parse(AuthLogoutResponse3.body.toString());
    expect (AuthLogoutJSON3).toStrictEqual({});
  });
});

// END OF AUTH LOGOUT TESTING

// BEGINNING OF QUIZ QUESTION DUPLICATE
/*
describe('Testing POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {

  test('Checking for a valid quiz question duplication', () => {

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
    const AuthUserId = AuthRegisterJSON.token;
    //Now have to create a quiz using the UserId
    let AdminQuizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
    { json: { token: AuthRegisterJSON.token, name: 'Question 1',
    description: "A description of my quiz"}});
    expect(AdminQuizCreateResponse.statusCode).toStrictEqual(200);
    const AdminQuizCreateJSON = JSON.parse(AdminQuizCreateResponse.body.toString());
    const AdminQuizId = AdminQuizCreateJSON.quizId;

    let QuizObject = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "Prince Charles",
          correct: true
        }
      ]
    }

    let AdminQuizQuestionCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizId}/question`,
    { json: { token: AuthRegisterJSON.token, questionBody: QuizObject}});

    expect(AdminQuizQuestionCreateResponse.statusCode).toStrictEqual(200);
    const AdminQuizQuestionCreateJSON = JSON.parse(AdminQuizQuestionCreateResponse.body.toString());

    const QuestionId = AdminQuizQuestionCreateJSON.questionId;

    //Actual Testing bit (Rest above is setup for function call)
    let AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
    { json: { quizId: AdminQuizId, questionId: QuestionId, token: AuthUserId}});

    expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(200);
    let AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

    expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({newQuestionId: expect.any(Number)})

    //Going to pass invalid QuestionID

    AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
    { json: { quizId: AdminQuizId, questionId: -1, token: AuthUserId}});

    expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(400);
    AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

    expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)});

    //Going provide invalid Quizid

    AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
    { json: { quizId: -1, questionId: QuestionId, token: AuthUserId}});

    expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(403);
    AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

    expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)});

    //Going to give invalid Owner of Quiz's ID

    const AuthRegisterResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
      json: {
        email: 'aaa1@bbb.com',
        password: 'abcde12345',
        nameFirst: 'Michael',
        nameLast: 'Hourn'
      }
    });

    expect(AuthRegisterResponse2.statusCode).toStrictEqual(200);
    const AuthRegisterJSON2 = JSON.parse(AuthRegisterResponse2.body.toString());
    const AnotherOwnerId = AuthRegisterJSON2.token;

    AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
    { json: { quizId: AnotherOwnerId, questionId: QuestionId, token: AuthUserId}});

    expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(403);
    AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

    expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)})

    //Logging Out User
    const AuthLogoutResponse = request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
    { json: { token: AuthRegisterJSON.token }});
    expect(AuthLogoutResponse.statusCode).toStrictEqual(200);

    //Checking for If the user is logged out
    AdminQuizQuestionDuplicateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz/{quizid}/question/{questionid}/duplicate`,
    { json: { quizId: AdminQuizId, questionId: QuestionId, token: AuthUserId}});

    expect(AdminQuizQuestionDuplicateResponse.statusCode).toStrictEqual(401);
    AdminQuizQuestionDuplicateJSON = JSON.parse(AdminQuizQuestionDuplicateResponse.body.toString());

    expect(AdminQuizQuestionDuplicateJSON).toStrictEqual({error: expect.any(String)})
  });

});
*/

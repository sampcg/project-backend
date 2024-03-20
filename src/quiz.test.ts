import { adminAuthRegister } from './auth';
import { clear } from './other';
import {
  adminQuizCreate,
  adminQuizList,
  adminQuizRemove,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizNameUpdate
} from './quiz';

beforeEach(() => {
  clear();
});

/// ///////////// Testing for AdminQuizCreate ///////////////////

describe('adminQuizCreate', () => {
  let author: any;
  beforeEach(() => {
    const authEmail = 'aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';
    author = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
  });

  test('Invalid Author User ID', () => {
    const quizName = 'Quiz Name';
    const quizDescription = 'Quiz Description';
    expect(adminQuizCreate(author.authUserId + 1, quizName, quizDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('Name contains invalid characters', () => {
    const invalidQuizName = 'aB1 -';
    const quizDescription = 'Quiz Description';
    expect(adminQuizCreate(author.authUserId, invalidQuizName, quizDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('Name is less than 3 characters long', () => {
    const shortQuizName = 'a';
    const quizDescription = 'Quiz Description';
    expect(adminQuizCreate(author.authUserId, shortQuizName, quizDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('Name is more than 30 characters long', () => {
    const longName = '123456789 123456789 123456789 123456789';
    const quizDescription = 'Quiz Description';
    expect(adminQuizCreate(author.authUserId, longName, quizDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('Name is already used by another quiz', () => {
    const auth2Email = 'ccc@ddd.com';
    const auth2Password = '12345abcde';
    const auth2NameFirst = 'John';
    const auth2NameLast = 'Doe';
    const author2: any = adminAuthRegister(auth2Email, auth2Password, auth2NameFirst, auth2NameLast);

    const quizName = 'Quiz Name';
    const quizDescription = 'Quiz Description';

    adminQuizCreate(author.authUserId, quizName, quizDescription);

    expect(adminQuizCreate(author2.authUserId, quizName, quizDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('Description is more than 100 characters', () => {
    const quizName = 'Quiz Name';
    const longDescription = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789';
    expect(adminQuizCreate(author.authUserId, quizName, longDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('adminQuizCreate has correct return type', () => {
    const quizName = 'Quiz Name';
    const quizDescription = 'Quiz Description';
    expect(adminQuizCreate(author.authUserId, quizName, quizDescription)).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('adminQuizCreate works with empty description', () => {
    const quizName = 'Quiz Name';
    const quizDescription = '';
    expect(adminQuizCreate(author.authUserId, quizName, quizDescription)).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Second adminQuizCreate works', () => {
    const auth2Email = 'ccc@ddd.com';
    const auth2Password = '12345abcde';
    const auth2NameFirst = 'John';
    const auth2NameLast = 'Doe';
    const author2: any = adminAuthRegister(auth2Email, auth2Password, auth2NameFirst, auth2NameLast);

    const quiz1Name = 'Quiz 1';
    const quiz2Name = 'Quiz 2';
    const quiz1Description = 'Quiz 1 description';
    const quiz2Description = 'Quiz 2 description';

    const quiz1: any = adminQuizCreate(author.authUserId, quiz1Name, quiz1Description);
    const quiz2: any = adminQuizCreate(author2.authUserId, quiz2Name, quiz2Description);

    expect(quiz1).toStrictEqual({ quizId: expect.any(Number) });
    expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });
    expect(quiz1).not.toStrictEqual(quiz2);
  });
});

/// ///////////// Testing for AdminQuizList ///////////////////

describe('adminQuizList', () => {
  let author: any;
  beforeEach(() => {
    author = adminAuthRegister('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
  });

  test('Invalid user ID', () => {
    expect(adminQuizList(author.authUserId + 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('No quizzes logged', () => {
    expect(adminQuizList(author.authUserId)).toStrictEqual({ quizzes: [] });
  });

  test('Lists 1 quiz', () => {
    const quiz: any = adminQuizCreate(author.authUserId, 'Quiz Name', 'Quiz Description');
    expect(adminQuizList(author.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Quiz Name',
        }
      ]
    });
  });

  test('Lists 3 quizzes', () => {
    const quiz1: any = adminQuizCreate(author.authUserId, 'Quiz 1 Name', 'Quiz Description');
    const quiz2: any = adminQuizCreate(author.authUserId, 'Quiz 2 Name', 'Quiz Description');
    const quiz3: any = adminQuizCreate(author.authUserId, 'Quiz 3 Name', 'Quiz Description');

    expect(adminQuizList(author.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1.quizId,
          name: 'Quiz 1 Name',
        },
        {
          quizId: quiz2.quizId,
          name: 'Quiz 2 Name',
        },
        {
          quizId: quiz3.quizId,
          name: 'Quiz 3 Name',
        }
      ]
    });
  });

  test('Lists quizzes of a second user', () => {
    const author2: any = adminAuthRegister('ccc@ddd.com', '12345abcde', 'John', 'Doe');
    const quizAuth1: any = adminQuizCreate(author.authUserId, 'Quiz 1 Auth 1', '');
    const quiz1Auth2: any = adminQuizCreate(author2.authUserId, 'Quiz 1 Auth 2', '');
    const quiz2Auth2: any = adminQuizCreate(author2.authUserId, 'Quiz 2 Auth 2', '');

    expect(adminQuizList(author.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quizAuth1.quizId,
          name: 'Quiz 1 Auth 1',
        }
      ]
    });

    expect(adminQuizList(author2.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1Auth2.quizId,
          name: 'Quiz 1 Auth 2',
        },
        {
          quizId: quiz2Auth2.quizId,
          name: 'Quiz 2 Auth 2',
        }
      ]
    });
  });

  test('Lists no quizzes by second user', () => {
    const author2: any = adminAuthRegister('ccc@ddd.com', '12345abcde', 'John', 'Doe');
    const quiz: any = adminQuizCreate(author.authUserId, 'Quiz', '');

    expect(adminQuizList(author2.authUserId)).toStrictEqual({ quizzes: [] });
  });
});

/// ///////////// Testing for AdminQuizRemove ///////////////////

describe('adminQuizRemove', () => {
  let author: any, quiz: any;
  beforeEach(() => {
    author = adminAuthRegister('aaa@bbb.com', '12345abcde', 'Michael', 'Hourn');
    quiz = adminQuizCreate(author.authUserId, 'Quiz', '');
  });

  test('Invalid user ID', () => {
    expect(adminQuizRemove(author.authUserId + 1, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid quiz ID', () => {
    expect(adminQuizRemove(author.authUserId, quiz.quizId + 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz ID does not refer to owned quiz by given user', () => {
    const author2: any = adminAuthRegister('ccc@ddd.com', 'abcde12345', 'John', 'Doe');
    expect(adminQuizRemove(author2.authUserId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Deletes 1 quiz out of 1', () => {
    expect(adminQuizRemove(author.authUserId, quiz.quizId)).toStrictEqual({});

    expect(adminQuizList(author.authUserId)).toStrictEqual({ quizzes: [] });
  });

  test('Deletes first quiz of 2', () => {
    const quiz2: any = adminQuizCreate(author.authUserId, 'Quiz 2', '');

    adminQuizRemove(author.authUserId, quiz.quizId);

    expect(adminQuizList(author.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz2.quizId,
          name: 'Quiz 2',
        }
      ]
    });
  });

  test('Deletes second quiz of 2', () => {
    const quiz2: any = adminQuizCreate(author.authUserId, 'Quiz 2', '');

    adminQuizRemove(author.authUserId, quiz2.quizId);

    expect(adminQuizList(author.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Quiz',
        }
      ]
    });
  });

  test('Deletes 2 quizzes out of 2', () => {
    const quiz2: any = adminQuizCreate(author.authUserId, 'Quiz 2', '');
    adminQuizRemove(author.authUserId, quiz.quizId);
    adminQuizRemove(author.authUserId, quiz2.quizId);

    expect(adminQuizList(author.authUserId)).toStrictEqual({ quizzes: [] });
  });

  test('Deletes 2 quizzes out of 3', () => {
    const quiz2: any = adminQuizCreate(author.authUserId, 'Quiz 2', '');
    const quiz3: any = adminQuizCreate(author.authUserId, 'Quiz 3', '');

    adminQuizRemove(author.authUserId, quiz.quizId);
    adminQuizRemove(author.authUserId, quiz2.quizId);

    expect(adminQuizList(author.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz3.quizId,
          name: 'Quiz 3',
        }
      ]
    });
  });

  test('Delete quiz from another user', () => {
    const author2: any = adminAuthRegister('ccc@ddd.com', 'abcde1235', 'John', 'Doe');
    const quiz2: any = adminQuizCreate(author2.authUserId, 'Quiz 2', '');

    adminQuizRemove(author2.authUserId, quiz2.quizId);

    expect(adminQuizList(author2.authUserId)).toStrictEqual({ quizzes: [] });
  });
});

/// ///////////// Testing for AdminQuizDescription Update ///////////////////

describe('adminQuizDescriptionUpdate', () => {
  let user: any, authUserId: number, quizId: number;

  beforeEach(() => {
    const authEmail = 'aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Samuel';
    const authNameLast = 'Gray';
    user = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);

    const quizName = 'Quiz Name';
    const quizDescription = ' Quiz Description';
    const quiz: any = adminQuizCreate(user.authUserId, quizName, quizDescription);
    quizId = quiz.quizId;

    authUserId = user.authUserId;
  });

  test('Invalid user ID', () => {
    const newDescription = 'New quiz description';
    const invalidUserId: number = user.authUserId + 1;
    expect(adminQuizDescriptionUpdate(invalidUserId, user.authUserId, newDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('Invalid quiz ID', () => {
    const newDescription = 'New quiz description';
    const invalidQuizId = 999;
    expect(adminQuizDescriptionUpdate(user.authUserId, invalidQuizId, newDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('User does not own the quiz', () => {
    const newDescription = 'New quiz description';
    const anotherUser: any = adminAuthRegister('another@example.com', 'password', 'Michael', 'Hourn');
    const quizId = 123;
    expect(adminQuizDescriptionUpdate(anotherUser.authUserId, quizId, newDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('Description is more than 100 characters long', () => {
    const longDescription: string = 'A'.repeat(101);
    const quizId = 123;
    expect(adminQuizDescriptionUpdate(user.authUserId, quizId, longDescription)).toMatchObject({ error: expect.any(String) });
  });

  test('Updates quiz description with valid description', () => {
    const newDescription = 'New descriptionfor the quiz';
    const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);

    expect(result).toEqual({});
  });
});

/// ///////////// Testing for AdminQuizInfo ///////////////////////////////
describe('adminQuizInfo', () => {
  let authUserId: number, quizId: number;
  beforeEach(() => {
    const authEmail = 'aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Samuel';
    const authNameLast = 'Gray';
    const user: any = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
    authUserId = user.authUserId;

    const quizName = 'Test Quiz';
    const quizDescription = 'Quiz Description';
    const quiz: any = adminQuizCreate(authUserId, quizName, quizDescription);
    quizId = quiz.quizId;
  });

  test('Returns information about quiz when provided with valid authUserId', () => {
    const expectedInfo = {
      quizId: expect.any(Number),
      name: expect.any(String),
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: expect.any(String)
    };
    const result = adminQuizInfo(authUserId, quizId);
    expect(result).toEqual(expectedInfo);
  });

  test('Returns error message when authUserId is not a valid user', () => {
    const invalidUserId: number = authUserId + 1;
    const expectedError = { error: 'AuthUserId is not a valid user.' };
    const result = adminQuizInfo(invalidUserId, quizId);
    expect(result).toEqual(expectedError);
  });

  test('Returns error message when quizId does not refer to a valid quiz', () => {
    const invalidQuizId: number = quizId + 1;
    const expectedError = { error: 'Quiz ID does not refer to a valid quiz.' };
    const result = adminQuizInfo(authUserId, invalidQuizId);
    expect(result).toEqual(expectedError);
  });

  test('Returns error message when quizId does not refer to a quiz that this user owns', () => {
    const user2Email = 'abc@bbb.com';
    const user2Password = 'addcde12345';
    const user2NameFirst = 'Hayden';
    const user2NameLast = 'Smith';
    const user2: any = adminAuthRegister(user2Email, user2Password, user2NameFirst, user2NameLast);

    const quizName2 = 'Test Quiz2';
    const quizDescription2 = 'Quiz Description2';
    const quiz2: any = adminQuizCreate(user2.authUserId, quizName2, quizDescription2);

    const result: any = adminQuizInfo(authUserId, quiz2.quizId);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a quiz that this user owns.' });
  });

  test('Return type if no error', () => {
    const result: any = adminQuizInfo(1, 1); // Assuming valid authUserId and quizId
    if (result.error) {
      // If an error is returned
      expect(result).toEqual({ error: expect.any(String) });
    } else {
      // If quiz information is returned
      expect(result).toEqual({
        quizId: expect.any(Number),
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String)
      });
    }
  });
});

/// ///////////// Testing for AdminQuizNameUpdate ///////////////////

describe('adminQuizNameUpdate', () => {
  let user: any, authUserId: number, quizId: number;

  beforeEach(() => {
    // Mock user registration
    const authEmail = 'aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Samuel';
    const authNameLast = 'Gray';
    user = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);

    const quizName = 'Quiz Name';
    const quizDescription = ' Quiz Description';
    const quiz: any = adminQuizCreate(user.authUserId, quizName, quizDescription);
    quizId = quiz.quizId;

    authUserId = user.authUserId;
  });

  test('Invalid user ID', () => {
    const newName = 'New Quiz Name';
    const invalidUserId: number = user.authUserId + 1;
    expect(adminQuizNameUpdate(invalidUserId, user.authUserId, newName)).toMatchObject({ error: expect.any(String) });
  });

  test('Invalid quiz ID', () => {
    const newName = 'New Quiz Name';
    const invalidQuizId = 999;
    expect(adminQuizNameUpdate(user.authUserId, invalidQuizId, newName)).toMatchObject({ error: expect.any(String) });
  });

  test('User does not own the quiz', () => {
    const newName = 'New Quiz Name';
    const anotherUser: any = adminAuthRegister('another@example.com', 'password', 'Michael', 'Hourn');
    const quizId = 123;
    expect(adminQuizNameUpdate(anotherUser.authUserId, quizId, newName)).toMatchObject({ error: expect.any(String) });
  });

  test('Name contains invalid characters', () => {
    const invalidName = 'Invalid Quiz Name!@#';
    const quizId = 123;
    expect(adminQuizNameUpdate(user.authUserId, quizId, invalidName)).toMatchObject({ error: expect.any(String) });
  });

  test('Name is less than 3 characters long', () => {
    const shortName = 'Q';
    const quizId = 123;
    expect(adminQuizNameUpdate(user.authUserId, quizId, shortName)).toMatchObject({ error: expect.any(String) });
  });

  test('Name is more than 30 characters long', () => {
    const longName = 'aaabbbcccdddeeefffggghhhiiijjjkkklllmmmnnnooo';
    const quizId = 123;
    expect(adminQuizNameUpdate(user.authUserId, quizId, longName)).toMatchObject({ error: expect.any(String) });
  });

  test('Name is already used by another quiz', () => {
    const quizId = 456;
    adminQuizNameUpdate(user.authUserId, quizId, 'New Quiz Name');
    // Attempt to update the name of the current quiz to the same name
    expect(adminQuizNameUpdate(user.authUserId, quizId, 'New Quiz Name')).toMatchObject({ error: expect.any(String) });
  });

  test('Name is successfully updated', () => {
    const NewName2 = ' New name for the quiz';
    const result: any = adminQuizNameUpdate(authUserId, quizId, NewName2);

    expect(result).toEqual({});
  });
});

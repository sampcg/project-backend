import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';
import { adminQuizCreate } from './quiz.js';
import { adminQuizList } from './quiz.js';
import { adminQuizRemove } from './quiz.js';

beforeEach(() => {
    clear();
});

// adminQuizCreate Testing

describe('adminQuizCreate', () => {
    let author;
    beforeEach(() => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
        author = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
    })

    test('Invalid Author User ID', () => {
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.authUserId + 1, quizName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name contains invalid characters', () => {        
        const invalidQuizName = 'aB1 -';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.authUserId, invalidQuizName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name is less than 3 characters long', () => {
        const shortQuizName = 'a';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.authUserId, shortQuizName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name is more than 30 characters long', () => {
        const longName = '123456789 123456789 123456789 123456789';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.authUserId, longName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name is already used by another quiz', () => {
        const auth2Email = 'ccc@ddd.com';
        const auth2Password = '12345abcde';
        const auth2NameFirst = 'John';
        const auth2NameLast = 'Doe';
        let author2 = adminAuthRegister(auth2Email, auth2Password, auth2NameFirst, auth2NameLast);
        
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';

        adminQuizCreate(author.authUserId, quizName, quizDescription);

        expect(adminQuizCreate(author2.authUserId, quizName, quizDescription)).toMatchObject({error: expect.any(String)});        
    });

    test('Description is more than 100 characters', () => {
        const quizName = 'Quiz Name'
        const longDescription = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789';
        expect(adminQuizCreate(author.authUserId, quizName, longDescription)).toMatchObject({error: expect.any(String)});
    });

    test('adminQuizCreate has correct return type', () => {
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.authUserId, quizName, quizDescription)).toStrictEqual({quizId: expect.any(Number)});
    });

    test('adminQuizCreate works with empty description', () => {
        const quizName = 'Quiz Name';
        const quizDescription = '';
        expect(adminQuizCreate(author.authUserId, quizName, quizDescription)).toStrictEqual({quizId: expect.any(Number)});
    });

    test('Second adminQuizCreate works', () => {
        const auth2Email = 'ccc@ddd.com';
        const auth2Password = '12345abcde';
        const auth2NameFirst = 'John';
        const auth2NameLast = 'Doe';
        let author2 = adminAuthRegister(auth2Email, auth2Password, auth2NameFirst, auth2NameLast);

        const quiz1Name = 'Quiz 1';
        const quiz2Name = 'Quiz 2';
        const quiz1Description = 'Quiz 1 description';
        const quiz2Description = 'Quiz 2 description';

        const quiz1 = adminQuizCreate(author.authUserId, quiz1Name, quiz1Description);
        const quiz2 = adminQuizCreate(author2.authUserId, quiz2Name, quiz2Description);

        expect(quiz1).toStrictEqual({quizId: expect.any(Number)});
        expect(quiz2).toStrictEqual({quizId: expect.any(Number)});
        expect(quiz1).not.toStrictEqual(quiz2);
    });
});

// adminQuizList testing

describe('adminQuizList', () => {
    let author;
    beforeEach(() => {
        author = adminAuthRegister('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    });

    test('Invalid user ID', () => {
        expect(adminQuizList(author.authUserId + 1)).toStrictEqual({error: expect.any(String)});
    });

    test('No quizzes logged', () => {
        expect(adminQuizList(author.authUserId)).toStrictEqual({quizzes: []});
    });

    test('Lists 1 quiz', () => {
        const quiz = adminQuizCreate(author.authUserId, 'Quiz Name', 'Quiz Description');
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
        const quiz1 = adminQuizCreate(author.authUserId, 'Quiz 1 Name', 'Quiz Description');
        const quiz2 = adminQuizCreate(author.authUserId, 'Quiz 2 Name', 'Quiz Description');
        const quiz3 = adminQuizCreate(author.authUserId, 'Quiz 3 Name', 'Quiz Description');

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
        const author2 = adminAuthRegister('ccc@ddd.com', '12345abcde', 'John', 'Doe');
        const quizAuth1 = adminQuizCreate(author.authUserId, 'Quiz 1 Auth 1', '');
        const quiz1Auth2 = adminQuizCreate(author2.authUserId, 'Quiz 1 Auth 2', '');
        const quiz2Auth2 = adminQuizCreate(author2.authUserId, 'Quiz 2 Auth 2', '');

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
        const author2 = adminAuthRegister('ccc@ddd.com', '12345abcde', 'John', 'Doe');
        const quiz = adminQuizCreate(author.authUserId, 'Quiz', '');

        expect(adminQuizList(author2.authUserId)).toStrictEqual({quizzes: []});
    });
});

// Testing adminQuizRemove

describe('adminQuizRemove', () => {
    let author, quiz;
    beforeEach(() => {
        author = adminAuthRegister('aaa@bbb.com', '12345abcde', 'Michael', 'Hourn');
        quiz = adminQuizCreate(author.authUserId, 'Quiz', '');
    });
    
    test('Invalid user ID', () => {
        expect(adminQuizRemove(author.authUserId + 1, quiz.quizId)).toStrictEqual({error: expect.any(String)});
    });

    test('Invalid quiz ID', () => {
        expect(adminQuizRemove(author.authUserId, quiz.quizId + 1)).toStrictEqual({error: expect.any(String)});
    });

    test('Quiz ID does not refer to owned quiz by given user', () => {
        const author2 = adminAuthRegister('ccc@ddd.com', 'abcde12345', 'John', 'Doe');
        expect(adminQuizRemove(author2.authUserId, quiz.quizId)).toStrictEqual({error: expect.any(String)});
    });
    
    test('Deletes 1 quiz out of 1', () => {
        expect(adminQuizRemove(author.authUserId, quiz.quizId)).toStrictEqual({});

        expect(adminQuizList(author.authUserId)).toStrictEqual({quizzes: []});
    });
    
    test('Deletes first quiz of 2', () => {
        const quiz2 = adminQuizCreate(author.authUserId, 'Quiz 2', '');

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
        const quiz2 = adminQuizCreate(author.authUserId, 'Quiz 2', '');

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
        const quiz2 = adminQuizCreate(author.authUserId, 'Quiz 2', '');
        adminQuizRemove(author.authUserId, quiz.quizId);
        adminQuizRemove(author.authUserId, quiz2.quizId);

        expect(adminQuizList(author.authUserId)).toStrictEqual({quizzes: []});
    });
    
    test('Deletes 2 quizzes out of 3', () => {
        const quiz2 = adminQuizCreate(author.authUserId, 'Quiz 2', '');
        const quiz3 = adminQuizCreate(author.authUserId, 'Quiz 3', '');

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
        const author2 = adminAuthRegister('ccc@ddd.com', 'abcde1235', 'John', 'Doe');
        const quiz2 = adminQuizCreate(author2.authUserId, 'Quiz 2', '');

        adminQuizRemove(author2.authUserId, quiz2.quizId);

        expect(adminQuizList(author2.authUserId)).toStrictEqual({quizzes: []});
    });
});
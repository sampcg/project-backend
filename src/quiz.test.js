import { adminAuthRegister } from './auth.js';
import { adminQuizCreate } from './quiz.js';
import { data } from './dataStore.js';

// adminQuizCreate Testing

describe('adminQuizCreate', () => {

    test('Invalid Author User ID', () => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
        adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
        
        const invalidAuthId = 2;
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(invalidAuthId, quizName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name contains invalid characters', () => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
        adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
        
        const invalidQuizName = '-----';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(data.users[0].userId, invalidQuizName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name is less than 3 characters long', () => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
        adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);

        const shortQuizName = 'a';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(users[0].userId, 'a', 'Quiz Description')).toMatchObject({error: expect.any(String)});
    });

    test('Name is more than 30 characters long', () => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
        adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);

        const longName = '123456789 123456789 123456789 123456789';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(data.users[0].userId, longName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name is already used by another quiz', () => {
        const auth1Email = 'aaa@bbb.com';
        const auth1Password = 'abcde12345';
        const auth1NameFirst = 'Michael';
        const auth1NameLast = 'Hourn';
        adminAuthRegister(auth1Email, auth1Password, auth1NameFirst, auth1NameLast);

        const auth2Email = 'ccc@ddd.com';
        const auth2Password = '12345abcde';
        const auth2NameFirst = 'John';
        const auth2NameLast = 'Doe';
        adminAuthRegister(auth2Email, auth2Password, auth2NameFirst, auth2NameLast);
        
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';

        adminQuizCreate(users[0].userId, quizName, quizDescription);

        expect(adminQuizCreate(data.users[1].userId, quizName, quizDescription)).toMatchObject({error: expect.any(String)});        
    });

    test('Description is more than 100 characters', () => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
        adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);

        const quizName = 'Quiz Name'
        const longDescription = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789';
        expect(adminQuizCreate(data.users[0].userId, quizName, longDescription)).toMatchObject({error: expect.any(String)});
    });

    test('adminQuizCreate has correct return type', () => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
        adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);

        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(users[0].userId, quizName, quizDescription)).toStrictEqual({quizId: expect.any(Number)});
    });

    test('adminQuizCreate works with empty description', () => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
        adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);

        const quizName = 'Quiz Name';
        const quizDescription = '';
        expect(adminQuizCreate(data.users[0].userId, quizName, quizDescription)).toStrictEqual({quizId: expect.any(Number)});
    });

    test('If added to database', () => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
        adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);

        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';
        
        const quiz = adminQuizCreate(users[0].userId, quizName, quizDescription);
        expect(data()).toStrictEqual({
            quizzes: [{quizId: quiz.quizId, name: quizName, description: quizDescription}]
        });
    });

    test('Second adminQuizCreate works', () => {
        const auth1Email = 'aaa@bbb.com';
        const auth1Password = 'abcde12345';
        const auth1NameFirst = 'Michael';
        const auth1NameLast = 'Hourn';
        adminAuthRegister(auth1Email, auth1Password, auth1NameFirst, auth1NameLast);

        const auth2Email = 'ccc@ddd.com';
        const auth2Password = '12345abcde';
        const auth2NameFirst = 'John';
        const auth2NameLast = 'Doe';
        adminAuthRegister(auth2Email, auth2Password, auth2NameFirst, auth2NameLast);

        const quiz1Name = 'Quiz 1';
        const quiz2Name = 'Quiz 2';
        const quiz1Description = 'Quiz 1 description';
        const quiz2Description = 'Quiz 2 description';

        const quiz1 = adminQuizCreate(users[0].userId, quiz1Name, quiz1Description);
        const quiz2 = adminQuizCreate(users[0].userId, quiz2Name, quiz2Description);
    });
});
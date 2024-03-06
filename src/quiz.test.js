import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';
import { adminQuizCreate } from './quiz.js';

// adminQuizCreate Testing
beforeEach(() => {
    clear();
});


describe('adminQuizCreate', () => {
    let authEmail, authPassword, authNameFirst, authNameLast, author;
    beforeEach(() => {
        authEmail = 'aaa@bbb.com';
        authPassword = 'abcde12345';
        authNameFirst = 'Michael';
        authNameLast = 'Hourn';
        author = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
    })

    test('Invalid Author User ID', () => {
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.userId + 1, quizName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name contains invalid characters', () => {        
        const invalidQuizName = 'aB1 -';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.userId, invalidQuizName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name is less than 3 characters long', () => {
        const shortQuizName = 'a';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.userId, shortQuizName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name is more than 30 characters long', () => {
        const longName = '123456789 123456789 123456789 123456789';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.userId, longName, quizDescription)).toMatchObject({error: expect.any(String)});
    });

    test('Name is already used by another quiz', () => {
        const auth2Email = 'ccc@ddd.com';
        const auth2Password = '12345abcde';
        const auth2NameFirst = 'John';
        const auth2NameLast = 'Doe';
        let author2 = adminAuthRegister(auth2Email, auth2Password, auth2NameFirst, auth2NameLast);
        
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';

        adminQuizCreate(author.userId, quizName, quizDescription);

        expect(adminQuizCreate(author2.userId, quizName, quizDescription)).toMatchObject({error: expect.any(String)});        
    });

    test('Description is more than 100 characters', () => {
        const quizName = 'Quiz Name'
        const longDescription = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789';
        expect(adminQuizCreate(author.userId, quizName, longDescription)).toMatchObject({error: expect.any(String)});
    });

    test('adminQuizCreate has correct return type', () => {
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(author.userId, quizName, quizDescription)).toStrictEqual({quizId: expect.any(Number)});
    });

    test('adminQuizCreate works with empty description', () => {
        const quizName = 'Quiz Name';
        const quizDescription = '';
        expect(adminQuizCreate(author.userId, quizName, quizDescription)).toStrictEqual({quizId: expect.any(Number)});
    });

    test('If added to database', () => {
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';
        
        const quiz = adminQuizCreate(author.userId, quizName, quizDescription);
        expect(data()).toStrictEqual({
            quizzes: [{quizId: quiz.quizId, name: quizName, description: quizDescription}]
        });
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

        const quiz1 = adminQuizCreate(author.userId, quiz1Name, quiz1Description);
        const quiz2 = adminQuizCreate(author2.userId, quiz2Name, quiz2Description);

        expect(data().toStrictEqual({
            quizzes: [
                {
                    quizId: quiz1.quizId,
                    name: quiz1Name,
                    description: quiz1Description,

                },
                {
                    quizId: quiz2.quizId,
                    name: quiz2Name,
                    description: quiz2Description,
                }
            ]
        }))
    });
});
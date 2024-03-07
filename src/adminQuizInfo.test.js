
import { adminQuizInfo } from './quiz.js';
import { adminQuizCreate } from './quiz.js';
import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

beforeEach(() => {
    clear();
})

describe('adminQuizInfo', () =>  {
    let authUserId, quizId;

    beforeEach(() => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Samuel';
        const authNameLast = 'Gray';
        const user = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
        authUserId = user.authUserId;
        
        const quizName = 'Test Quiz';
        const quizDescription = 'Quiz Description';
        const quiz = adminQuizCreate(authUserId, quizName, quizDescription);
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
        const invalidUserId = authUserId + 1;
        const expectedError = { error: 'AuthUserId is not a valid user.' };
        const result = adminQuizInfo(invalidUserId, quizId);
        expect(result).toEqual(expectedError);
    });

    test('Returns error message when quizId does not refer to a valid quiz', () => {
        const invalidQuizId = quizId + 1;
        const expectedError = { error: 'Quiz ID does not refer to a valid quiz.' };
        const result = adminQuizInfo(authUserId, invalidQuizId);
        expect(result).toEqual(expectedError);
    });

    test('Returns error message when quizId does not refer to a quiz that this user owns', () => {
        const user2Email = 'abc@bbb.com';
        const user2Password = 'addcde12345';
        const user2NameFirst = 'Hayden';
        const user2NameLast = 'Smith';
        const user2 = adminAuthRegister(user2Email, user2Password, user2NameFirst, user2NameLast);
        
        const quizName2 = 'Test Quiz2';
        const quizDescription2 = 'Quiz Description2';
        const quiz2 = adminQuizCreate(user2.authUserId, quizName2, quizDescription2);

        const result = adminQuizInfo(authUserId, quiz2.quizId);
        expect(result).toMatchObject({ error: 'Quiz ID does not refer to a quiz that this user owns.' });
    });

    test('Return type if no error', () => {
        const result = adminQuizInfo(1, 1); // Assuming valid authUserId and quizId
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

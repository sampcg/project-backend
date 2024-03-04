import { adminQuizInfo } from './quiz.js';
import { adminQuizCreate } from './quiz.js';
import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

// adminQuizInfo Testing

// Needs to have the following tests AuthUserId is not a valid user.
// Quiz ID does not refer to a valid quiz.
// Quiz ID does not refer to a quiz that this user owns. 

// a

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
            quizId: quizId,
            name: 'Test Quiz',
            timeCreated: expect.any(Date), 
            timeLastEdited: expect.any(Date), 
            description: 'This is a test quiz.'
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
        const anotherUserId = authUserId + 1;
        const expectedError = { error: 'Quiz ID does not refer to a quiz that this user owns.' };
        const result = adminQuizInfo(anotherUserId, quizId);
        expect(result).toEqual(expectedError);
    });

    test('Return type if no error', () => {
        const result = adminQuizInfo(authUserId, quizId);
        expect(result).toEqual({
            quizId: expect.any(Number),
            name: expect.any(String),
            timeCreated: expect.any(Date),
            timeLastEdited: expect.any(Date),
            description: expect.any(String)
        });
    });
});



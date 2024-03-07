import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';
import { adminQuizCreate } from './quiz.js';
import { adminQuizDescriptionUpdate } from './quiz.js'

// adminQuizCreate Testing
beforeEach(() => {
    clear();
});

describe('adminQuizNameUpdate', () => {
    let authUserId, quizId;

    beforeEach(() => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Samuel';
        const authNameLast = 'Gray';
        const user = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
        authUserId = user.authUserId;

        // New quiz name that should be new one
        const quizName = 'Test Quiz';
        const quizDescription = 'This is a test quiz';
        const quiz = adminQuizCreate(authUserId, quizName);
        quizId = quiz.quizId;   
    });

    test('Updates quiz description correctly with valid parameters ', () => {
        const newDescription = 'Updated Quiz Description';
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
        expect(result).toEqual({ success: true });
    });
    test('Returns specific error message when quizId does not refer to a valid quiz', () => {
        const newDescription = 'Updated Quiz Description';
        const result = adminQuizDescriptionUpdate(authUserId, quizId + 1, newDescription);
        expect(result).toEqual({ error: 'Quiz ID does not refer to a valid quiz.' });
    });
    
    test('Returns specific error message when user does not own the quiz', () => {
        const newDescription = 'Updated Quiz Description';
        const newUser = adminAuthRegister('another@example.com', 'password456', 'Zechen', 'Chu');
        const result = adminQuizDescriptionUpdate(newUser.authUserId, quizId, newDescription);
        expect(result).toEqual({ error: 'Quiz ID does not refer to a quiz that this user owns.' });
    });
    
    test('Returns specific error message when description is more than 100 characters long', () => {
        const newDescription = 'A'.repeat(101);
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
        expect(result).toEqual({ error: 'Description is more than 100 characters in length.' });
    });   
    // test when description is empty string
    test('Updates quiz description with empty string', () => {
        const newDescription = '';
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
        expect(result).toEqual({ success: true });
    });

});

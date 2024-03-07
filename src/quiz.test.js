import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';
import { adminQuizCreate } from './quiz.js';
import { adminQuizDescriptionUpdate } from './quiz.js'
import { getData, setData } from './dataStore';

beforeEach(() => {
    clear();
});

describe('adminQuizDescriptionUpdate', () => {
    let user, authUserId, quizId;

    beforeEach(() => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Samuel';
        const authNameLast = 'Gray';
        user = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);

        const quizName = 'Quiz Name';
        const quizDescription = ' Quiz Description'
        const quiz = adminQuizCreate(user.authUserId, quizName, quizDescription)
  
    });

    test('Invalid user ID', () => {
        const newDescription = 'New quiz description';
        const invalidUserId = user.authUserId + 1;
        expect(adminQuizDescriptionUpdate(invalidUserId, user.authUserId, newDescription)).toMatchObject({ error: expect.any(String) });
    });

    test('Invalid quiz ID', () => {
        const newDescription = 'New quiz description';
        const invalidQuizId = 999; 
        expect(adminQuizDescriptionUpdate(user.authUserId, invalidQuizId, newDescription)).toMatchObject({ error: expect.any(String) });
    });

    test('User does not own the quiz', () => {
        const newDescription = 'New quiz description';
        const anotherUser = adminAuthRegister('another@example.com', 'password', 'Michael', 'Hourn');
        const quizId = 123; 
        expect(adminQuizDescriptionUpdate(anotherUser.authUserId, quizId, newDescription)).toMatchObject({ error: expect.any(String) });
    });

    test('Description is more than 100 characters long', () => {
        const longDescription = 'A'.repeat(101);
        const quizId = 123; 
        expect(adminQuizDescriptionUpdate(user.authUserId, quizId, longDescription)).toMatchObject({ error: expect.any(String) });
    });

    test('Updates quiz description with valid description', () => {
        const newDescription = 'New description for the quiz';
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
        
        // Assert that no error is returned
        expect(result).toEqual({});
    });
});
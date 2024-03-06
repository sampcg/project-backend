import { adminQuizNameUpdate } from './quiz.js';
import {clear } from './other.js';
import { adminAuthRegister } from './auth.js';
import { adminQuizCreate } from './quiz.js';

// Testing for adminQuizNameUpdate

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
        const quiz = adminQuizCreate(authUserId, name);
        quizId = quiz.quizId;   
    });

    test.each([
        ['Updates quiz name correctly with new quiz', 'Updated Quiz Name', { success: true }],
        ['AuthUserId is not a valid user', authUserId + 1, 'Updated Quiz Name', { error: 'AuthUserId is not a valid user.' }],
        ['QuizId does not refer to a valid quiz', authUserId, quizId + 1, 'Updated Quiz Name', { error: 'Quiz ID does not refer to a valid quiz.' }],
        ['User does not own the quiz', authUserId + 1, quizId, 'Updated Quiz Name', { error: 'Quiz ID does not refer to a quiz that this user owns.' }],
        ['Name contains invalid characters', 'Invalid*Name', { error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' }],
        ['Name is less than 3 characters long', 'A', { error: 'Name is either less than 3 characters long or more than 30 characters long.' }],
        ['Returns error message when name is more than 30 characters long', 'ThisIsANameThatIsMoreThanThirtyCharactersLong', { error: 'Name is either less than 3 characters long or more than 30 characters long.' }],
        ['Returns error message when name is already used by the current logged in user for another quiz', 'Existing Quiz', { error: 'Name is already used by the current logged in user for another quiz.' }],
    ])('%s', (description, authUserId, quizId, newName, expected) => {
        const result = adminQuizNameUpdate(authUserId, quizId, newName);
        expect(result).toEqual(expected);
    });
});
import { adminQuizNameUpdate } from './quiz.js';
import {clear } from './other.js';
import { adminAuthRegister } from './auth.js';

// Testing for adminQuizNameUpdate

beforeEach(() => {
    clear();
});

describe('adminQuizNameUpdate', () => {
    let user;

    beforeEach(() => {
        // Mock user registration
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Samuel';
        const authNameLast = 'Gray';
        user = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
    });

    test('Invalid user ID', () => {
        const newName = 'New Quiz Name';
        const invalidUserId = user.authUserId + 1;
        expect(adminQuizNameUpdate(invalidUserId, user.authUserId, newName)).toMatchObject({ error: expect.any(String) });
    });

    test('Invalid quiz ID', () => {
        const newName = 'New Quiz Name';
        const invalidQuizId = 999; 
        expect(adminQuizNameUpdate(user.authUserId, invalidQuizId, newName)).toMatchObject({ error: expect.any(String) });
    });

    test('User does not own the quiz', () => {
        const newName = 'New Quiz Name';
        const anotherUser = adminAuthRegister('another@example.com', 'password', 'Michael', 'Hourn');
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
});
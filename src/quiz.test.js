import { adminQuizInfo } from './quiz.js';
import { adminQuizCreate } from './quiz.js';
import { adminAuthRegister } from './auth.js';
import { clear } from './other.js'

// adminQuizInfo Testing

// Needs to have the following tests AuthUserId is not a valid user.
// Quiz ID does not refer to a valid quiz.
// Quiz ID does not refer to a quiz that this user owns. 

describe('adminQuizInfo', () =>  {

    beforeEach(() => {
        clear();
    })

    test('Invalid Author User ID', () => {
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Samuel';
        const authNameLast = 'Gray';
        adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
        
        const invalidAuthId = 2;
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';
        expect(adminQuizCreate(invalidAuthId, quizName, quizDescription)).toMatchObject({error: expect.any(String)});
    });
});

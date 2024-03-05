import { clear } from "./other.js";
import { getData } from "./dataStore.js";
import { adminAuthRegister } from "./auth.js";
import { adminQuizCreate } from "./quiz.js";

/*---------------------- Clear function tests -------------------*/
describe("clear function tests", () => {
    test('Test clearing data', () => {
        const data = getData();
        const testUserId = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
        const testQuizId = adminQuizCreate(testUserId.authUserId, 'My Quiz', 'This is my quiz');
        expect(clear()).toStrictEqual({});        
    });
});
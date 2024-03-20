import { clear } from "./other";
import { getData } from "./dataStore";
import { adminAuthRegister } from "./auth";
import { adminQuizCreate } from "./quiz";

/*---------------------- Clear function tests -------------------*/
describe("clear function tests", () => {
  test('Test clearing data', () => {
    const data = getData();
    const testUserId: any = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
    const testQuizId: any = adminQuizCreate(testUserId.authUserId, 'My Quiz', 'This is my quiz');
    expect(clear()).toStrictEqual({});
  });
});
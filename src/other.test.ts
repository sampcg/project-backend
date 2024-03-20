import { clear } from './other';
import { adminAuthRegister, adminUserDetails } from './auth';
import { adminQuizCreate, adminQuizList } from './quiz';

const ERROR = { error: expect.any(String) };

/* ---------------------- Clear function tests ------------------- */
describe('clear function tests', () => {
  test('Test clearing data', () => {
    expect(clear()).toStrictEqual({});
    const testUserId = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
    adminQuizCreate(testUserId.authUserId, 'My Quiz', 'This is my quiz');
    expect(adminUserDetails(testUserId.authUserId)).toStrictEqual(expect.any(Object));
    expect(adminQuizList(testUserId.authUserId)).toStrictEqual(expect.any(Object));
    clear();
    expect(adminUserDetails(testUserId.authUserId)).toStrictEqual(ERROR);
    expect(adminQuizList(testUserId.authUserId)).toStrictEqual(ERROR);
  });
});

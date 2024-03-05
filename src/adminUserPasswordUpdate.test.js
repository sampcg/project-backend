import { clear } from "./other.js";
import { adminAuthRegister, adminUserPasswordUpdate } from "./auth.js";

const ERROR = { error: expect.any(String) };

beforeEach(() => {
	clear();
});

/*======================== Testing adminUser Details Update ========================*/
describe('adminUserPasswordUpdate function tests', () => {
  let user;
	beforeEach(() => {
    user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
	});
  test("correct cases", () => {
		expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', 'Tw3lv3L3tt3r')).toStrictEqual({});
  });
	/** error cases */
	test("invalid user", () => {
		expect(adminUserPasswordUpdate(-999, '123456ABC', 'Tw3lv3L3tt3r')).toStrictEqual(ERROR);
	});
	test("Old Password is not correct", () => {
		expect(adminUserPasswordUpdate(user.authUserId, '1234566ABC', 'Tw3lv3L3tt3r')).toStrictEqual(ERROR);
	});
	test("Old Password and New Password match exactly", () => {
		expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', '12346ABC')).toStrictEqual(ERROR);
	});
	test("New Password has already been used before by this user", () => {
		adminUserPasswordUpdate(user.authUserId, '123456ABC', 'Tw3lv3L3tt3r');
		expect(adminUserPasswordUpdate(user.authUserId, 'Tw3lv3L3tt3r', '123456ABC')).toStrictEqual(ERROR);
	});
	test("New Password is less than 8 characters", () => {
		expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', 'Tw3')).toStrictEqual(ERROR);
	});
	test("New Password does not contain at least one number and at least one letter", () => {
		expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', 'Ttttttttt')).toStrictEqual(ERROR);
		expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', '111111111')).toStrictEqual(ERROR);
	});
});
import { clear } from "./other.js";
import { adminAuthRegister, adminUserDetailsUpdate } from "./auth.js";
import { adminQuizCreate } from "./quiz.js";

const ERROR = { error: expect.any(String) };

beforeEach(() => {
	clear();
});

/*======================== Testing adminUser Details Update ========================*/
descdescribe('adminUserDetailsUpdate function tests', () => {
  beforeEach(() => {
    let user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
	});
  test("correct cases", () => {
		let test1 = adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'Renzella');
		expect(test1).toStrictEqual({});
  });
	/** error cases */
	test("invalid user", () => {
		expect(adminUserDetailsUpdate(-999, 'validemail@gmail.com', 'Jake', 'Renzella')).toStrictEqual(ERROR);
	});
	test("email is used", () => {
		expect(adminUserDetailsUpdate(user.authUserId, 'hayden.smith@unsw.edu.au', 'Hayden', 'Smith')).toStrictEqual(ERROR);
	});
	test("valid email", () => {
		expect(adminUserDetailsUpdate(user.authUserId, 'hayden.smithunsw.edu.au', 'Hayden', 'Smith')).toStrictEqual(ERROR);
		expect(adminUserDetailsUpdate(user.authUserId, 'hayden.smith@unsw', 'Hayden', 'Smith')).toStrictEqual(ERROR);
	});
	test("invalid characters in nameFirst", () => {
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake@', 'Renzella')).toStrictEqual(ERROR);
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake 1', 'Renzella')).toStrictEqual(ERROR);
	});
	test("Invalid First Name length", () => {
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'J', 'Renzella')).toStrictEqual(ERROR);
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', '', 'Renzella')).toStrictEqual(ERROR);
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'JakeJakeJakeJakeJakeJake', 'Renzella')).toStrictEqual(ERROR);
	});
	test("invalid characters in nameFirst", () => {
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'Renzella@')).toStrictEqual(ERROR);
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'Renzella 1')).toStrictEqual(ERROR);
	});
	test("Invalid First Name length", () => {
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'R')).toStrictEqual(ERROR);
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', '')).toStrictEqual(ERROR);
		expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'RenzellaRenzellaRenzellaRenzella')).toStrictEqual(ERROR);
	});
});
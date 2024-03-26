import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  // adminUserDetailsUpdate,
  // adminUserPasswordUpdate
} from './auth';
import { clear } from './other';

// const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

// BEGINNING OF AUTH REGISTER TESTING

describe('adminAuthRegister', () => {
  // 1)Checking for a successful creation
  test('Checking if successful and already used email', () => {
    clear();
    const authEmail = 'aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    // Inserting a parameters and expect a successful number
    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });

    expect(adminAuthRegister(authEmail, authPassword, 'Abrar',
      'Gofur')).toStrictEqual({ error: expect.any(String) });
  });

  // 2)Checking for valid email structure
  test('Checking for valid emails', () => {
    clear();
    const authEmail = 'aaa1@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });

    clear();
    expect(adminAuthRegister('12342132', authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });

    clear();
    expect(adminAuthRegister('Hello,World!', authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister('@.com', authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister('.com.@', authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
  });

  // 3) NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
  test('Checking for invalid characters firstName', () => {
    clear();
    const authEmail = 'aaa2@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = 'aaa2@bbb.com';
    const authEmail2 = 'aaa2@bbb.com';
    const authEmail3 = 'aaa2@bbb.com';
    const authEmail4 = 'aaa2@bbb.com';
    const authEmail5 = 'aaa2@bbb.com';
    const authEmail6 = 'aaa2@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail1, authPassword, 'Abrar!',
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail2, authPassword, 'Abrar#',
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail3, authPassword, 'Sam(parameters)',
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail4, authPassword, 'Miche@l',
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail5, authPassword, 'Miche*l',
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail6, authPassword, '9+10=21',
      authNameLast)).toStrictEqual({ error: expect.any(String) });
  });

  // 4)NameFirst is less than 2 characters or more than 20 characters
  test('Checking length of firstName', () => {
    clear();

    const authEmail = 'aaa7@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = 'aaa8@bbb.com';
    const authEmail2 = 'aaa9@bbb.com';
    const authEmail3 = 'aaa10@bbb.com';
    const authEmail4 = 'aaa11@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });

    // For Too short
    clear();

    expect(adminAuthRegister(authEmail1, authPassword, 'M',
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail2, authPassword, 'Mi',
      authNameLast)).toStrictEqual({ token: expect.any(String) });

    // For Too Long
    clear();
    expect(adminAuthRegister(authEmail3, authPassword, 'aaaaaaaaaaaaaaaaaaaa',
      authNameLast)).toStrictEqual({ token: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail4, authPassword, 'aaaaaaaaaaaaaaaaaaaaa',
      authNameLast)).toStrictEqual({ error: expect.any(String) });
  });

  // 5)NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
  test('Checking for invalid character lastName', () => {
    clear();

    const authEmail = '1aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = '2aaa@bbb.com';
    const authEmail2 = '3aaa@bbb.com';
    const authEmail3 = '4aaa@bbb.com';
    const authEmail4 = '5aaa@bbb.com';
    const authEmail5 = '6aaa@bbb.com';
    const authEmail6 = '7aaa@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail1, authPassword, authNameFirst,
      'Abrar!')).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail2, authPassword, authNameFirst,
      'Abrar#')).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail3, authPassword, authNameFirst,
      'Sam(parameters)')).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail4, authPassword, authNameFirst,
      'Miche@l')).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail5, authPassword, authNameFirst,
      'Miche*l')).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail6, authPassword, authNameFirst,
      '9+10=21')).toStrictEqual({ error: expect.any(String) });
  });

  // 6)NameLast is less than 2 characters or more than 20 characters.
  test('Checking length of lastName', () => {
    clear();
    const authEmail = '8aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = '9aaa@bbb.com';
    const authEmail2 = '10aaa@bbb.com';
    const authEmail3 = '11aaa@bbb.com';
    const authEmail4 = '12aaa@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });

    // For Too short
    clear();
    expect(adminAuthRegister(authEmail1, authPassword, 'M',
      'M')).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail2, authPassword, 'Mi',
      'Mi')).toStrictEqual({ token: expect.any(String) });

    // For Too Long
    clear();
    expect(adminAuthRegister(authEmail3, authPassword, authNameFirst,
      'aaaaaaaaaaaaaaaaaaaa')).toStrictEqual({ token: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail4, authPassword, authNameFirst,
      'aaaaaaaaaaaaaaaaaaaaa')).toStrictEqual({ error: expect.any(String) });
  });

  // 8)Password is less than 8 characters.
  test('Checking Password length, if , < 8', () => {
    clear();
    const authEmail = '13aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = '14aaa@bbb.com';
    const authEmail2 = '15aaa@bbb.com';
    const authEmail3 = '16aaa@bbb.com';
    const authEmail4 = '17aaa@bbb.com';
    const authEmail5 = '18aaa@bbb.com';
    const authEmail6 = '19aaa@bbb.com';
    const authEmail7 = '20aaa@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });

    // Checking now
    clear();
    expect(adminAuthRegister(authEmail1, 'a1', authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail2, 'a12', authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail3, 'a123', authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail4, 'a1234', authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail5, 'a12345', authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail6, 'a123456', authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail7, 'a1234567', authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });
  });

  // 9)Password does not contain at least one number and at least one letter
  test('Checking Password 1 number and 1 letter, if , < 8', () => {
    clear();
    const authEmail = '21aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = '22aaa@bbb.com';
    const authEmail2 = '23aaa@bbb.com';
    const authEmail3 = '24aaa@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail1, 'aaaaaaaa', authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail2, 'aaaaaaa1', authNameFirst,
      authNameLast)).toStrictEqual({ token: expect.any(String) });
    clear();
    expect(adminAuthRegister(authEmail3, '11111111', authNameFirst,
      authNameLast)).toStrictEqual({ error: expect.any(String) });
  });
});

// END OF AUTH REGISTER TESTING

// BEGINNING OF AUTH LOGIN TESTING
describe('adminAuthLogin', () => {
  // 1)Email address does not exist.
  test('Checking for Emails that dont exist', () => {
    clear();

    const authEmail = 'aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast);

    expect(adminAuthLogin(authEmail, authPassword)).toStrictEqual({ token: expect.any(String) });

    expect(adminAuthLogin('fake@email.com', authPassword)).toStrictEqual({ error: expect.any(String) });
  });

  // 2)Password is not correct for the given email.
  test('Checking for incorrect password', () => {
    clear();
    const authEmail = 'aaa1@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    adminAuthRegister(authEmail, authPassword, authNameFirst,
      authNameLast);

    expect(adminAuthLogin(authEmail, authPassword)).toStrictEqual({ token: expect.any(String) });

    expect(adminAuthLogin(authEmail, 'IncorrectPassword1')).toStrictEqual({ error: expect.any(String) });
  });
});

// END OF AUTH LOGIN TESTING

// BEGINNING OF AUTH USER DETAILS
describe('adminUserDetails', () => {
  // 1)AuthUserId is not a valid user
  test('Checking if AuthUserId is valid', () => {
    clear();
    const authEmail = 'aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const result = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
    const authID = result.token;

    expect(adminUserDetails(authID)).toStrictEqual({ user: expect.any(Object) });

    expect(adminUserDetails(32323)).toStrictEqual({ error: expect.any(String) });

    expect(adminUserDetails('Hello, World!')).toStrictEqual({ error: expect.any(String) });
  });

  test('Checking if AuthUserDetails giving correct number of successfull logins', () => {
    clear();
    const authEmail = 'blah@email.com';
    const authPassword = 'password1YAY';
    const authNameFirst = 'john';
    const authNameLast = 'smith';

    const result = adminAuthRegister(authEmail, authPassword, authNameFirst, authNameLast);
    const authID = result.token;
    // Registration was successful, retrieve the authUserId

    adminAuthLogin(authEmail, authPassword);

    expect(adminUserDetails(authID)).toStrictEqual({
      user: {
        userId: 0,
        email: 'blah@email.com',
        name: 'john smith',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });

    adminAuthLogin(authEmail, authPassword);

    expect(adminUserDetails(authID)).toStrictEqual({
      user: {
        userId: 0,
        email: 'blah@email.com',
        name: 'john smith',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 0
      }
    });

    adminAuthLogin(authEmail, 'WrongPassword1');

    expect(adminUserDetails(authID)).toStrictEqual({
      user: {
        userId: 0,
        email: 'blah@email.com',
        name: 'john smith',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 1
      }
    });

    adminAuthLogin(authEmail, 'WrongPassword2');

    expect(adminUserDetails(authID)).toStrictEqual({
      user: {
        userId: 0,
        email: 'blah@email.com',
        name: 'john smith',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 2
      }
    });

    adminAuthLogin(authEmail, authPassword);

    expect(adminUserDetails(authID)).toStrictEqual({
      user: {
        userId: 0,
        email: 'blah@email.com',
        name: 'john smith',
        numSuccessfulLogins: 4,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});

// END OF AUTH USER DETAILS

// /* ======================== Testing adminUser Details Update ======================== */
// describe('adminUserDetailsUpdate function tests', () => {
//   let user: any;
//   beforeEach(() => {
//     user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
//   });
//   test('correct cases', () => {
//     const test1 = adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'Renzella');
//     expect(test1).toStrictEqual({});
//     const test2 = adminUserDetails(user.authUserId);
//     expect(test2).toStrictEqual({
//       user: {
//         userId: user.authUserId,
//         name: 'Jake Renzella',
//         email: 'validemail@gmail.com',
//         numSuccessfulLogins: expect.any(Number),
//         numFailedPasswordsSinceLastLogin: expect.any(Number),
//       }
//     });
//   });
//   /** error cases */
//   test('invalid user', () => {
//     expect(adminUserDetailsUpdate(user.authUserId + 1, 'validemail@gmail.com', 'Jake', 'Renzella')).toStrictEqual(ERROR);
//   });
//   test('email is used', () => {
//     expect(adminUserDetailsUpdate(user.authUserId, 'hayden.smith@unsw.edu.au', 'Hayden', 'Smith')).toStrictEqual(ERROR);
//   });
//   test('valid email', () => {
//     expect(adminUserDetailsUpdate(user.authUserId, 'hayden.smithunsw.edu.au', 'Hayden', 'Smith')).toStrictEqual(ERROR);
//     expect(adminUserDetailsUpdate(user.authUserId, 'hayden.smith@unsw', 'Hayden', 'Smith')).toStrictEqual(ERROR);
//   });
//   test('invalid characters in nameFirst', () => {
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake@', 'Renzella')).toStrictEqual(ERROR);
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake 1', 'Renzella')).toStrictEqual(ERROR);
//   });
//   test('Invalid First Name length', () => {
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'J', 'Renzella')).toStrictEqual(ERROR);
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', '', 'Renzella')).toStrictEqual(ERROR);
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'JakeJakeJakeJakeJakeJake', 'Renzella')).toStrictEqual(ERROR);
//   });
//   test('invalid characters in nameLast', () => {
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'Renzella@')).toStrictEqual(ERROR);
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'Renzella 1')).toStrictEqual(ERROR);
//   });
//   test('Invalid Last Name length', () => {
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'R')).toStrictEqual(ERROR);
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', '')).toStrictEqual(ERROR);
//     expect(adminUserDetailsUpdate(user.authUserId, 'validemail@gmail.com', 'Jake', 'RenzellaRenzellaRenzellaRenzella')).toStrictEqual(ERROR);
//   });
// });

// /* ======================== Testing adminUser Password Update ======================== */
// describe('adminUserPasswordUpdate function tests', () => {
//   let user: any;
//   beforeEach(() => {
//     user = adminAuthRegister('hayden.smith@unsw.edu.au', '123456ABC', 'Hayden', 'Smith');
//   });
//   test('correct cases', () => {
//     expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', 'Tw3lv3L3tt3r')).toStrictEqual({});
//     expect(adminAuthLogin('hayden.smith@unsw.edu.au', '123456ABC')).toStrictEqual(ERROR);
//     expect(adminAuthLogin('hayden.smith@unsw.edu.au', 'Tw3lv3L3tt3r')).toStrictEqual(expect.any(Object));
//   });
//   /** error cases */
//   test('invalid user', () => {
//     expect(adminUserPasswordUpdate(user.authUserId + 1, '123456ABC', 'Tw3lv3L3tt3r')).toStrictEqual(ERROR);
//   });
//   test('Old Password is not correct', () => {
//     expect(adminUserPasswordUpdate(user.authUserId, '1234566ABC', 'Tw3lv3L3tt3r')).toStrictEqual(ERROR);
//   });
//   test('Old Password and New Password match exactly', () => {
//     expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', '123456ABC')).toStrictEqual(ERROR);
//   });
//   test('New Password has already been used before by this user', () => {
//     adminUserPasswordUpdate(user.authUserId, '123456ABC', 'Tw3lv3L3tt3r');
//     expect(adminUserPasswordUpdate(user.authUserId, 'Tw3lv3L3tt3r', '123456ABC')).toStrictEqual(ERROR);
//   });
//   test('New Password is less than 8 characters', () => {
//     expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', 'Tw3')).toStrictEqual(ERROR);
//   });
//   test('New Password does not contain at least one number and at least one letter', () => {
//     expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', 'Ttttttttt')).toStrictEqual(ERROR);
//     expect(adminUserPasswordUpdate(user.authUserId, '123456ABC', '111111111')).toStrictEqual(ERROR);
//   });
// });

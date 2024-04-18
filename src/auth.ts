// This Imports the Database
import { getData, setData } from './dataStore';
import {
  decodeToken,
  validateTokenStructure,
  validateAdminInputsV2,
  validateTokenStructureV2
} from './helpers';
import {
  ErrorObject,
  EmptyObject,
  Token
} from './returnInterfaces';
import validator from 'validator';
import HTTPError from 'http-errors';

// First Function By Abrar
function adminAuthRegister(email: string, password: string,
  nameFirst: string, nameLast: string) {
  const data = getData();

  const validator = require('validator');
  // Next Line for special character checks
  const specialChars = /[`!@#$%^&*()_+=[\]{};:"\\|,.<>/?~]/;

  data.users = data.users || [];

  for (const users of data.users) {
    if (users.email === email) {
      return { error: 'Email is already used' };
    }
  }

  if (validator.isEmail(email) !== true) {
    return { error: 'Email Not Valid' };
  } else if (specialChars.test(nameFirst) === true) {
    return { error: 'Firstname contains invalid characters=' };
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'Firstname is less than 2 or larger than 20 characters' };
  } else if (specialChars.test(nameLast) === true) {
    return { error: 'Lastname contains invalid characters=' };
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'Lastname is less than 2 or larger than 20 characters' };
  } else if (password.length < 8) {
    return { error: 'Password length is less than 8 characters' };
  } else if (!/(?=.*\d)(?=.*[a-zA-Z])/.test(password)) {
    return { error: 'Password must contain at least 1 letter and number' };
  }

  // Bit of Code that pushes the data after the filter
  const newData = {
    userId: data.users.length,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    oldPassword: '',
    newPassword: password,
  };

  data.users.push(newData);

  const randomString = require('randomized-string');
  const randomSession = randomString.generate(8);

  const newToken: Token = {
    userId: newData.userId,
    sessionId: randomSession
  };

  if (!Array.isArray(data.token)) {
    data.token = []; // Initialize data.token as an empty array
  }

  data.token.push(newToken);

  const returnToken = encodeURIComponent(JSON.stringify(newToken));
  setData(data);
  return { token: returnToken };
}

// Second Function By Abrar
function adminAuthLogin(email: string, password: string) {
  const data = getData();
  let newUserId = null;

  let emailPresent = false;
  for (const users of data.users) {
    if (users.email === email) {
      emailPresent = true;
      break;
    }
  }

  let passwordCorrect = false;

  for (const users of data.users) {
    if (users.email === email && users.password === password) {
      passwordCorrect = true;
      newUserId = users.userId;
      users.numSuccessfulLogins++;
      users.numFailedPasswordsSinceLastLogin = 0;
      break;
    }
  }

  if (emailPresent === false) {
    return { error: 'Email address does not exist' };
  } else if (passwordCorrect === false) {
    for (const user of data.users) {
      if (email === user.email) {
        user.numFailedPasswordsSinceLastLogin++;
        break;
      }
    }
    return { error: 'Password is not correct for the given email' };
  }

  const randomString = require('randomized-string');
  const randomSession = randomString.generate(8);

  const newToken = {
    userId: newUserId,
    sessionId: randomSession
  };

  data.token.push(newToken);

  const returnToken = encodeURIComponent(JSON.stringify(newToken));
  setData(data);
  return { token: returnToken };
}

// Third Function By Abrar
function adminUserDetails(token: any) {
  const data = getData();
  let userDetails = null;
  let idPresent = false;

  // Must decode the Token first, then parse()
  // const originalToken: object = decodeURIComponent(authUserId);
  let originalToken;
  try {
    const decodedAuthUserId = decodeURIComponent(token);
    originalToken = JSON.parse(decodedAuthUserId);
  } catch (error) {
    console.error('Error parsing token:', error);
    return { error: 'Invalid token format' };
  }

  const actualUserId: number = originalToken.userId;
  for (const users of data.users) {
    if (users.userId === actualUserId) {
      idPresent = true;
      break;
    }
  }
  for (const users of data.users) {
    if (users.userId === actualUserId) {
      userDetails = {
        userId: users.userId,
        name: users.nameFirst + ' ' + users.nameLast,
        email: users.email,
        numSuccessfulLogins: users.numSuccessfulLogins,
        numFailedPasswordsSinceLastLogin: users.numFailedPasswordsSinceLastLogin
      };
      break;
    }
  }
  if (idPresent === false) {
    return { error: 'AuthUserId is not a valid user' };
  } else {
    return { user: userDetails };
  }
}

//  Fourth Function By Abrar
export function adminAuthLogout(token: string) {
  // Getting data from dataStore
  const data = getData();

  // Decoded Token
  const decodedToken = JSON.parse(decodeURIComponent(token));

  // Find the index of the token object with the matching sessionId
  const index = data.token.findIndex(tokenObject => tokenObject.sessionId === decodedToken.sessionId);

  if (index !== -1) {
    // Remove the token object from the array
    data.token.splice(index, 1);
    console.log(`Token array length after removing token: ${data.token.length}`);
    setData(data);
    return {};
  } else {
    // Return an error if token is not found
    return { error: 'Token is empty or invalid' };
  }
}

/**
 * Update the email and name of the admin user
 * @param {number} authUserId - unique identifier for admin user
 * @param {string} email - email of the user
 * @param {string} nameFirst - frist name of user
 * @param {string} nameLast - last name of user
 * @returns {} - empty object
 */
export const adminUserDetailsUpdate = (token: string, email : string,
  nameFirst: string, nameLast: string): EmptyObject | ErrorObject => {
  const data = getData();
  /** Token is empty or invalid (does not refer to valid logged in user session) */
  const originalToken = decodeToken(token);
  if (!originalToken) {
    return { error: 'Token is empty or invalid', code: 401 };
  }
  const user = data.users.find((user) => originalToken.userId === user.userId);
  if (!user) {
    return { error: 'User with the provided token does not exist', code: 401 };
  }
  const validatedToken = validateTokenStructure(token);
  if (validatedToken) {
    return validatedToken;
  }
  /** Check for duplicate email */
  if (data.users.some((user) => user.email === email && !originalToken.sessionId.includes(token))) {
    return { error: 'Email is already in use', code: 400 };
  }
  /** Check for valid email */
  if (!validator.isEmail(email)) {
    return { error: 'Email is not valid', code: 400 };
  }
  /** Check for invalid characters in nameFirst and if the first name length is valid */
  const namecharF = /(^[a-zA-Z]{1}[a-zA-Z\s'-]{0,18}[a-zA-Z]{1}$)/.test(nameFirst.trim());
  if (!namecharF) {
    return { error: 'Invalid first name', code: 400 };
  }
  /** Check for invalid characters in nameLast and if the last name length is valid */
  const namecharL = /(^[a-zA-Z]{1}[a-zA-Z\s'-]{0,18}[a-zA-Z]{1}$)/.test(nameLast.trim());
  if (!namecharL) {
    return { error: 'Invalid last name', code: 400 };
  }
  /** correct output */
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);
  return {};
};

/**
 * Updates the details of an admin user.
 *
 * @param {string} token - The authentication token of the user.
 * @param {string} email - The new email of the user.
 * @param {string} nameFirst - The new first name of the user.
 * @param {string} nameLast - The new last name of the user.
 *
 * @return {EmptyObject | ErrorObject} An empty object if the operation is successful, or an error object if there was an issue.
 */
export const adminUserDetailsUpdateV2 = (token: string, email: string, nameFirst: string, nameLast: string): EmptyObject | ErrorObject => {
  const data = getData();
  /** Token is empty or invalid (does not refer to valid logged in user session) */
  const originalToken = decodeToken(token);
  if (!originalToken) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  const user = data.users.find(u => originalToken.userId === u.userId);
  if (!user) {
    throw HTTPError(401, 'User with the provided token does not exist');
  }
  validateTokenStructureV2(token);
  /** Check for duplicate email */
  if (data.users.some((user) => user.email === email && !originalToken.sessionId.includes(token))) {
    throw HTTPError(400, 'Email is currently used by another user');
  }
  validateAdminInputsV2(email, nameFirst, nameLast);
  /** correct output */
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);
  return {};
};

/**
 * Updates the password of an admin user
 * @param {number} authUserId - unique identifier for admin user
 * @param {string} oldPassword - old password of user
 * @param {string} newPassword - new password of user
 * @returns {} - empty object
 */

export const adminUserPasswordUpdate = (token: string, oldPassword: string,
  newPassword: string): EmptyObject | ErrorObject => {
  /** Token is empty or invalid (does not refer to valid logged in user session) */
  const data = getData();
  const originalToken = decodeToken(token);
  if (!originalToken) {
    return { error: 'Token is empty or invalid', code: 401 };
  }
  const user = data.users.find((user) => originalToken.userId === user.userId);
  if (!user) {
    return { error: 'User with the provided token does not exist', code: 401 };
  }
  validateTokenStructure(token);
  /** Old Password is not the correct old password */
  if (oldPassword !== user.password) {
    return { error: 'Old Password is not the correct old password', code: 400 };
  }
  /** Old Password and New Password match exactly */
  if (oldPassword === newPassword) {
    return { error: 'Old Password and New Password match exactly', code: 400 };
  }
  /** New Password has already been used before by this user */
  if (user.oldPassword === newPassword) {
    return { error: 'New Password has already been used before by this user', code: 400 };
  }
  /** New Password is less than 8 characters */
  if (newPassword.length < 8) {
    return { error: 'New Password is less than 8 characters', code: 400 };
  }
  /** New Password does not contain at least one number and at least one letter */
  let hasNumber = false;
  let hasLower = false;
  let hasUpper = false;
  for (const character of newPassword) {
    if (!isNaN(Number(character))) {
      hasNumber = true;
    } else if (character >= 'a' && character <= 'z') {
      hasLower = true;
    } else if (character >= 'A' && character <= 'Z') {
      hasUpper = true;
    }
  }

  if (!(hasNumber && (hasLower || hasUpper))) {
    return { error: 'New Password does not contain at least one number and at least one letter', code: 400 };
  }
  /** correct output */
  user.oldPassword = user.password;
  user.password = newPassword;
  setData(data);
  return {};
};

/**
 * Updates the password of an admin user
 * @param {number} authUserId - unique identifier for admin user
 * @param {string} oldPassword - old password of user
 * @param {string} newPassword - new password of user
 * @returns {} - empty object
 */

export const adminUserPasswordUpdateV2 = (token: string, oldPassword: string,
  newPassword: string): EmptyObject | ErrorObject => {
  /** Token is empty or invalid (does not refer to valid logged in user session) */
  const data = getData();
  const originalToken = decodeToken(token);
  if (!originalToken) {
    throw HTTPError(401, 'Token is empty or invalid');
  }
  const user = data.users.find((user) => originalToken.userId === user.userId);
  if (!user) {
    throw HTTPError(401, 'User with the provided token does not exist');
  }
  validateTokenStructureV2(token);
  /** Old Password is not the correct old password */
  if (oldPassword !== user.password) {
    throw HTTPError(400, 'Old Password is not the correct old password');
  }
  /** Old Password and New Password match exactly */
  if (oldPassword === newPassword) {
    throw HTTPError(400, 'Old Password and New Password match exactly');
  }
  /** New Password has already been used before by this user */
  if (user.oldPassword === newPassword) {
    throw HTTPError(400, 'New Password has already been used before by this user');
  }
  /** New Password is less than 8 characters */
  if (newPassword.length < 8) {
    throw HTTPError(400, 'New Password is less than 8 characters');
  }
  /** New Password does not contain at least one number and at least one letter */
  let hasNumber = false;
  let hasLower = false;
  let hasUpper = false;
  for (const character of newPassword) {
    if (!isNaN(Number(character))) {
      hasNumber = true;
    } else if (character >= 'a' && character <= 'z') {
      hasLower = true;
    } else if (character >= 'A' && character <= 'Z') {
      hasUpper = true;
    }
  }

  if (!(hasNumber && (hasLower || hasUpper))) {
    throw HTTPError(400, 'New Password does not contain at least one number and at least one letter');
  }
  /** correct output */
  user.oldPassword = user.password;
  user.password = newPassword;
  setData(data);
  return {};
};

// This is exporting the data to auth.test.js
// Also to the dataStore.js
export { adminAuthRegister };
export { adminAuthLogin };
export { adminUserDetails };

// This Imports the Database
import { getData, setData } from './dataStore';
import { getUser } from './helpers';
import validator from 'validator';

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
    numSuccessfulLogins: 0,
    numFailedPasswordsSinceLastLogin: 0,
    oldPassword: '',
    newPassword: password,
  };

  data.users.push(newData);

  return { authUserId: (data.users.length - 1) };
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
      break;
    }
  }

  if (emailPresent === false) {
    return { error: 'Email address does not exist' };
  } else if (passwordCorrect === false) {
    for (const user of data.users) {
      if (email === user.email) {
        user.numFailedPasswordsSinceLastLogin++;
      }
    }
    return { error: 'Password is not correct for the given email' };
  }

  for (const user of data.users) {
    if (newUserId === user.userId) {
      user.numFailedPasswordsSinceLastLogin = 0;
    }
  }

  return { authUserId: newUserId };
}

// Third Function By Abrar
function adminUserDetails(authUserId: number | string) {
  const data = getData();
  let userDetails = null;
  let idPresent = false;

  for (const users of data.users) {
    if (users.userId === authUserId) {
      idPresent = true;
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

/**
 * Update the email and name of the admin user
 * @param {number} authUserId - unique identifier for admin user
 * @param {string} email - email of the user
 * @param {string} nameFirst - frist name of user
 * @param {string} nameLast - last name of user
 * @returns {} - empty object
 */
export function adminUserDetailsUpdate(authUserId: number, email : string,
  nameFirst: string, nameLast: string) {
  const data = getData();
  /** AuthUserId is not a valid user */
  if (!getUser(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }
  /** Check for duplicate email */
  if (data.users.some((user) => user.email === email)) {
    return { error: 'Email is already in use' };
  }
  /** Check for valid email */
  if (!validator.isEmail(email)) {
    return { error: 'Email is not valid' };
  }
  /** Check for invalid characters in nameFirst and if the first name length is valid */
  const namecharF = /(^[a-zA-Z]{1}[a-zA-Z\s'-]{0,18}[a-zA-Z]{1}$)/.test(nameFirst.trim());
  if (!namecharF) {
    return { error: 'Invalid first name' };
  }
  /** Check for invalid characters in nameLast and if the last name length is valid */
  const namecharL = /(^[a-zA-Z]{1}[a-zA-Z\s'-]{0,18}[a-zA-Z]{1}$)/.test(nameLast.trim());
  if (!namecharL) {
    return { error: 'Invalid last name' };
  }
  /** correct output */
  const user = getUser(authUserId);
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);
  return {};
}

/**
 * Updates the password of an admin user
 * @param {number} authUserId - unique identifier for admin user
 * @param {string} oldPassword - old password of user
 * @param {string} newPassword - new password of user
 * @returns {} - empty object
 */

export function adminUserPasswordUpdate(authUserId: number, oldPassword: string,
  newPassword: string) {
  const user = getUser(authUserId);
  /** AuthUserId is not a valid user */
  if (!getUser(authUserId)) {
    return { error: 'AuthUserId is not a valid user' };
  }
  /** Old Password is not the correct old password */
  if (oldPassword !== user.password) {
    return { error: 'Old Password is not the correct old password' };
  }
  /** Old Password and New Password match exactly */
  if (oldPassword === newPassword) {
    return { error: 'Old Password and New Password match exactly' };
  }
  /** New Password has already been used before by this user */
  if (user.oldPassword === newPassword) {
    return { error: 'New Password has already been used before by this user' };
  }
  /** New Password is less than 8 characters */
  if (newPassword.length < 8) {
    return { error: 'New Password is less than 8 characters' };
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
    return { error: 'New Password does not contain at least one number and at least one letter' };
  }
  /** correct output */
  user.oldPassword = user.password;
  user.password = newPassword;
  setData(getData());
  return {};
}

// This is exporting the data to auth.test.js
// Also to the dataStore.js
export { adminAuthRegister };
export { adminAuthLogin };
export { adminUserDetails };

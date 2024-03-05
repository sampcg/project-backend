import { getData } from "./dataStore";
import { isAuthUserValid } from "./helpers";
import validator from "validator";

//First Function By Abrar
function adminAuthLogin( email, password ) {
  
  return { authUserId: 1 }
}

//Second Function By Abrar
function adminUserDetails( authUserId ) {
  return { user: { userId: 1,
    name: 'Hayden Smith',
    email: 'hayden.smith@unsw.edu.au',
    numSuccessfulLogins: 3,
    numFailedPasswordsSinceLastLogin: 1, } }
}

/** 
 * Update the email and name of the admin user
 * @param {number} authUserId - unique identifier for admin user
 * @param {string} email - email of the user
 * @param {string} nameFirst - frist name of user
 * @param {string} nameLast - last name of user
 * @returns {} - empty object
 */

export function adminUserDetailsUpdate( authUserId, email, nameFirst, nameLast ) {
  let data = getData();
/** AuthUserId is not a valid user */
  if (!isAuthUserValid(authUserId)){
    return { error: "AuthUserId is not a valid user" };
  } 
/** Check for duplicate email */
  if (data.users.some((user) => user.email === email)) {
    return { error: "Email is already in use" };
  }
/** Check for valid email */
  if (!validator.isEmail(email)) {
    return { error: "Email is not valid" };
  }
/** Check for invalid characters in nameFirst and if the first name length is valid*/
  const namecharF = /(^[a-zA-Z]{1}[a-zA-Z\s'-]{0,18}[a-zA-Z]{1}$)/.test(nameFirst.trim());
  if (!namecharF) {
      return {error: "Invalid first name"};
  }
/** Check for invalid characters in nameLast and if the last name length is valid*/
  const namecharL = /(^[a-zA-Z]{1}[a-zA-Z\s'-]{0,18}[a-zA-Z]{1}$)/.test(nameLast.trim());
  if (!namecharL) {
      return {error: "Invalid last name"};
  }
/** correct output */
  return { };
}

function adminAuthRegister( email, password, nameFirst, nameLast ) {
  
  return { authUserId: 1 }
}

/** 
 * Updates the password of an admin user
 * @param {number} authUserId - unique identifier for admin user
 * @param {string} oldPassword - old password of user
 * @param {string} newPassword - new password of user
 * @returns {} - empty object
 */

function adminUserPasswordUpdate( authUserId, oldPassword, newPassword ) {
  return { };
}
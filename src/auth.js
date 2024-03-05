import { getData } from "./dataStore";
import { isAuthUserValid } from "./helpers";

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

function adminUserDetailsUpdate( authUserId, email, nameFirst, nameLast ) {
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

export function adminUserPasswordUpdate( authUserId, oldPassword, newPassword ) {
  const data = getData();
  const user = data.users.find((u) => u.userId === authUserId);
/** AuthUserId is not a valid user */
  if (!isAuthUserValid(authUserId)){
    return { error: "AuthUserId is not a valid user" };
  } 
/** Old Password is not the correct old password */
  if (oldPassword !== user.password) {
    return { error: "Old Password is not the correct old password" };
  }
/** Old Password and New Password match exactly */
  if (oldPassword === newPassword) {
    return { error: "Old Password and New Password match exactly" };
  }
/** New Password has already been used before by this user */
  if (user.oldPassword === newPassword) {
    return { error: "New Password has already been used before by this user" };
  }
/** New Password is less than 8 characters */
  if (newPassword.length < 8) {
    return { error: "New Password is less than 8 characters" };
  }
/** New Password does not contain at least one number and at least one letter */
  let hasNumber = false;
  let hasLower = false;
  let hasUpper = false;
  for (const character of newPassword) {
    if (!isNaN(character)) {
      hasNumber = true;
    } else if (character >= 'a' && character <= 'z') {
      hasLower = true;
    } else if (character >= 'A' && character <= 'Z') {
      hasUpper = true;
    }
  }

  if (!(hasNumber && (hasLower || hasUpper))){
    return { error: "New Password does not contain at least one number and at least one letter" };
  }
/** correct output */
  return { };
}
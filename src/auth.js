
/**
  * Updates the password of an admin user
  * @param {number} authUserId - unique identifier for an admin user
  * @param {string} oldPassword - old password of admin user
  * @param {string} newPassword - new password of admin user
  * @returns { } - empty object
*/
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

function adminUserDetailsUpdate( authUserId, email, nameFirst, nameLast ) {
  return { }
}

function adminAuthRegister( email, password, nameFirst, nameLast ) {
  
  return { authUserId: 1 }
}
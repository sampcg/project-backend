
/**
  * Updates the password of an admin user
  * @param {number} authUserId - unique identifier for an admin user
  * @param {string} oldPassword - old password of admin user
  * @param {string} newPassword - new password of admin user
  * @returns { } - empty object
*/
function adminUserDetails( authUserId ) {
  return { user: { userId: 1,
     name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
   numSuccessfulLogins: 3,
    numFailedPasswordsSinceLastLogin: 1, } }
}
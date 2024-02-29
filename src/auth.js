//This Imports the Database
import { getData, setData } from './dataStore.js';

//First Function By Abrar
function adminAuthRegister( email, password, nameFirst, nameLast ) {


  
  return { authUserId: data.user.length}
}

//Second Function By Abrar
function adminAuthLogin( email, password ) {
  
  return { authUserId: 1 }
}

//Third Function By Abrar
function adminUserDetails( authUserId ) {
  return { user: { userId: 1,
    name: 'Hayden Smith',
    email: 'hayden.smith@unsw.edu.au',
    numSuccessfulLogins: 3,
    numFailedPasswordsSinceLastLogin: 1, } }
}

//First Function By Zechen
function adminUserDetailsUpdate( authUserId, email, nameFirst, nameLast ) {
  return { };
}


//Seond Function By Zechen
function adminUserPasswordUpdate( authUserId, oldPassword, newPassword ) {
  return { };
}

//This is exporting the data to auth.test.js
//Also to the dataStore.js
export { adminAuthRegister }
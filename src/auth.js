//This Imports the Database
import { getData, setData } from './dataStore.js';

//First Function By Abrar
function adminAuthRegister( email, password, nameFirst, nameLast ) {

  let data = getData();

  var validator = require('validator');
  //Next Line for special character checks
  const specialChars = /[`!@#$%^&*()_+\=\[\]{};:"\\|,.<>\/?~]/;
  const queryLetterNumber = /^[A-Za-z0-9][`!@#$%^&*()_+\=\[\]{};:"\\|,.<>\/?~]/;


  if (validator.isEmail(email) !== true) {
   return { error: 'Email Not Valid'}
  }
  if (specialChars.test(nameFirst) === true){
    return { error: 'Firstname contains invalid characters='}
  }

  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'Firstname is less than 2 or larger than 20 characters'}
  }
  if (specialChars.test(nameLast) === true){
    return { error: 'Lastname contains invalid characters='}
  }

  if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'Lastname is less than 2 or larger than 20 characters'}
  }

  if (password.length < 8) {
    return { error: 'Password length is less than 8 characters'}
  }
  if (queryLetterNumber(password).test(password) === false) {
    return { error: 'Password must contain at least 1 letter and number'}
  }








  //Bit of Code that pushes the data after the filter
  data.users.push({

    email: email,
    password: password,
    name: '$(nameFirst) $(nameLast)' ,

  })

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
//This Imports the Database
import { getData, setData } from './dataStore.js';

//First Function By Abrar
function adminAuthRegister( email, password, nameFirst, nameLast ) {

  let data = getData();

  var validator = require('validator');
  //Next Line for special character checks
  const specialChars = /[`!@#$%^&*()_+\=\[\]{};:"\\|,.<>\/?~]/;
  
  console.log(data);
  data.user = data.user || [];

  for (let user of data.user) {
    if (user.email === email) {
        return { error: 'Email is already used' };
    }
  }

  if (validator.isEmail(email) !== true) {
    return { error: 'Email Not Valid'}
  } else if (specialChars.test(nameFirst) === true){
    return { error: 'Firstname contains invalid characters='}
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'Firstname is less than 2 or larger than 20 characters'}
  } else if (specialChars.test(nameLast) === true){
    return { error: 'Lastname contains invalid characters='}
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'Lastname is less than 2 or larger than 20 characters'}
  } else if (password.length < 8) {
    return { error: 'Password length is less than 8 characters'}

  } else if (!/(?=.*\d)(?=.*[a-zA-Z])/.test(password)) {
    return { error: 'Password must contain at least 1 letter and number'}
  }

  //Bit of Code that pushes the data after the filter
  let new_data = {

    email: email,
    password: password,
    name: `${nameFirst} ${nameLast}`

  };

  data.user.push(new_data);

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
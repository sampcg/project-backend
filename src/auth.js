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
    userId: data.user.length,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 0,
    numFailedPasswordsSinceLastLogin: 0,
    oldPassword: null,
    newPassword: password,
  };

  data.user.push(new_data);

  return { authUserId: data.user.length}
}

//Second Function By Abrar
function adminAuthLogin( email, password ) {
  
  let data = getData();
  let UserId = null;

  let email_present = false;
  for (let user of data.user) {
    if (user.email === email) {
      email_present = true;
      break;
    }
  }

  let password_correct = false;

  for (let user of data.user) {
    if (user.email === email && user.password === password) {
      password_correct = true;
      UserId = user.userId;
      break;
    }
  }

  if (email_present === false) {
    return { error: 'Email address does not exist'}
  } else if (password_correct === false) {
    return { error: 'Password is not correct for the given email'}
  }



  return { authUserId: UserId }
}

//Third Function By Abrar
function adminUserDetails( authUserId ) {

  let data = getData();
  let userDetails = null;

  for (let user of data.user) {
      if (user.userId === authUserId) {
          userDetails = {
              userId: user.userId,
              name: user.nameFirst+' '+user.nameLast,
              email: user.email,
              numSuccessfulLogins: user.numSuccessfulLogins,
              numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin
          };
          break;
      }
  }

  if (userDetails === null) {
    return { error: 'AuthUserId is not a valid user' };
  } else {

    return { user: userDetails };
  }
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
export { adminAuthLogin }
export { adminUserDetails }
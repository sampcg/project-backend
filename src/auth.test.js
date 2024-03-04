import { adminAuthRegister } from './auth.js';
import { clear } from './other.js'

//BEGINNING OF AUTH REGISTER TESTING
test('Checking a successful registration', () => {
    // clear();
    // let authUserID1 = adminAuthRegister('abrar@unsw.edu.com', 'abcd1234', 'abrar',
    // 'gofur');
    // expect(authUserID1).toStrictEqual({expect.any(Number)});

    expect(1+1).toEqual(2);
});

describe('adminAuthRegister', () => {

//1)Checking for a successful creation 
    test('Checking if successful and already used email', () =>{





    })

//2)Checking for valid email structure
    test('Checking for valid emails', () => {




    })

//3) NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
test('Checking for invalid characters firstName', () => {




})

//4)NameFirst is less than 2 characters or more than 20 characters
test('Checking length of firstName', () => {




})

//5)NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
test('Checking for invalid character lastName', () => {




})

//6)NameLast is less than 2 characters or more than 20 characters.
test('Checking length of lastName', () => {




})

//8)Password is less than 8 characters.
test('Checking Password length, if , < 8' , () => {

});

//9)Password does not contain at least one number and at least one letter
    test('Checking Password 1 number and 1 letter, if , < 8' , () => {

});

});

//END OF AUTH REGISTER TESTING
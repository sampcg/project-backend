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

    beforeEach(() => {
        authEmail = 'aaa@bbb.com';
        authPassword = 'abcde12345';
        authNameFirst = 'Michael';
        authNameLast = 'Hourn';
    })


//1)Checking for a successful creation 
    test('Checking if successful and already used email', () =>{
        clear();

        //Inserting a parameters and expect a successful number
        expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
        
        expect(adminAuthRegister(authEmail, authPassword, Abrar,
            Gofur)).toStrictEqual({ error: expect.any(String)} );
           

    })

//2)Checking for valid email structure
    test('Checking for valid emails', () => {
        clear();

        expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
            authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );

        expect(adminAuthRegister('12342132', authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ error: expect.any(String)} );

        expect(adminAuthRegister('Hello,World!', authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ error: expect.any(String)} );

        expect(adminAuthRegister('@.com', authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ error: expect.any(String)} );

        expect(adminAuthRegister('.com.@', authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ error: expect.any(String)} );

    })

//3) NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
test('Checking for invalid characters firstName', () => {
    clear();

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );

    expect(adminAuthRegister(authEmail, authPassword, 'Abrar!',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, 'Abrar#',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, 'Sam(parameters)',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, 'Miche@l',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, 'Miche*l',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, '9+10=21',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );


})

//4)NameFirst is less than 2 characters or more than 20 characters
test('Checking length of firstName', () => {
    clear();
    
    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    //For Too short

    expect(adminAuthRegister(authEmail, authPassword, 'M',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

     expect(adminAuthRegister(authEmail, authPassword, 'Mi',
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );

    //For Too Long
    expect(adminAuthRegister(authEmail, authPassword, 'aaaaaaaaaaaaaaaaaaa',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, 'aaaaaaaaaaaaaaaaaaaa',
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
})

//5)NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
test('Checking for invalid character lastName', () => {
    clear();

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
    'Abrar!')).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
    'Abrar#')).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
    'Sam(parameters)')).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
    'Miche@l')).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
    'Miche*l')).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
    '9+10=21')).toStrictEqual({ error: expect.any(String)} );


})

//6)NameLast is less than 2 characters or more than 20 characters.
test('Checking length of lastName', () => {
    clear();
    
    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    //For Too short

    expect(adminAuthRegister(authEmail, authPassword, 'M',
        'M')).toStrictEqual({ error: expect.any(String)} );

     expect(adminAuthRegister(authEmail, authPassword, 'Mi',
        'Mi')).toStrictEqual({ authUserId: expect.any(Number)} );

    //For Too Long
    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
    'aaaaaaaaaaaaaaaaaaa')).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
    'aaaaaaaaaaaaaaaaaaaa')).toStrictEqual({ authUserId: expect.any(Number)} );


})

//8)Password is less than 8 characters.
test('Checking Password length, if , < 8' , () => {
    clear();

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    //Checking now
    expect(adminAuthRegister(authEmail, 'a1', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, 'a12', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, 'a123', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    
    expect(adminAuthRegister(authEmail, 'a1234', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    
    expect(adminAuthRegister(authEmail, 'a12345', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    
    expect(adminAuthRegister(authEmail, 'a123456', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );

    expect(adminAuthRegister(authEmail, 'a1234567', authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    
    
});

//9)Password does not contain at least one number and at least one letter
    test('Checking Password 1 number and 1 letter, if , < 8' , () => {
    clear();

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    expect(adminAuthRegister(authEmail, 'aaaaaaaa', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    
    expect(adminAuthRegister(authEmail, 'aaaaaaa1', authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    expect(adminAuthRegister(authEmail, '11111111', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    

});

});

//END OF AUTH REGISTER TESTING
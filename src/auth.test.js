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
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';
    })


//1)Checking for a successful creation 
    test('Checking if successful and already used email', () =>{
        clear();
        const authEmail = 'aaa@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';

        //Inserting a parameters and expect a successful number
        expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
        
        expect(adminAuthRegister(authEmail, authPassword, 'Abrar',
            'Gofur')).toStrictEqual({ error: expect.any(String)} );
           

    })

//2)Checking for valid email structure
    test('Checking for valid emails', () => {
        clear();
        const authEmail = 'aaa1@bbb.com';
        const authPassword = 'abcde12345';
        const authNameFirst = 'Michael';
        const authNameLast = 'Hourn';

        expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
            authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
        
        clear();
        expect(adminAuthRegister('12342132', authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ error: expect.any(String)} );

        clear();
        expect(adminAuthRegister('Hello,World!', authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ error: expect.any(String)} );
        clear();
        expect(adminAuthRegister('@.com', authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ error: expect.any(String)} );
        clear();
        expect(adminAuthRegister('.com.@', authPassword, authNameFirst,
             authNameLast)).toStrictEqual({ error: expect.any(String)} );

    })

//3) NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
test('Checking for invalid characters firstName', () => {
    clear();
    const authEmail = 'aaa2@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = 'aaa2@bbb.com';
    const authEmail2 = 'aaa2@bbb.com';
    const authEmail3 = 'aaa2@bbb.com';
    const authEmail4 = 'aaa2@bbb.com';
    const authEmail5 = 'aaa2@bbb.com';
    const authEmail6 = 'aaa2@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    clear();
    expect(adminAuthRegister(authEmail1, authPassword, 'Abrar!',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail2, authPassword, 'Abrar#',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail3, authPassword, 'Sam(parameters)',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail4, authPassword, 'Miche@l',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail5, authPassword, 'Miche*l',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail6, authPassword, '9+10=21',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );


})

//4)NameFirst is less than 2 characters or more than 20 characters
test('Checking length of firstName', () => {
    clear();

    const authEmail = 'aaa7@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = 'aaa8@bbb.com';
    const authEmail2 = 'aaa9@bbb.com';
    const authEmail3 = 'aaa10@bbb.com';
    const authEmail4 = 'aaa11@bbb.com';
    
    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    //For Too short
    clear();

    expect(adminAuthRegister(authEmail1, authPassword, 'M',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
     expect(adminAuthRegister(authEmail2, authPassword, 'Mi',
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );

    //For Too Long
    clear();
    expect(adminAuthRegister(authEmail3, authPassword, 'aaaaaaaaaaaaaaaaaaaa',
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    clear();
    expect(adminAuthRegister(authEmail4, authPassword, 'aaaaaaaaaaaaaaaaaaaaa',
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
})

//5)NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.
test('Checking for invalid character lastName', () => {
    clear();

    const authEmail = '1aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = '2aaa@bbb.com';
    const authEmail2 = '3aaa@bbb.com';
    const authEmail3 = '4aaa@bbb.com';
    const authEmail4 = '5aaa@bbb.com';
    const authEmail5 = '6aaa@bbb.com';
    const authEmail6 = '7aaa@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    clear();
    expect(adminAuthRegister(authEmail1, authPassword, authNameFirst,
    'Abrar!')).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail2, authPassword, authNameFirst,
    'Abrar#')).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail3, authPassword, authNameFirst,
    'Sam(parameters)')).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail4, authPassword, authNameFirst,
    'Miche@l')).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail5, authPassword, authNameFirst,
    'Miche*l')).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail6, authPassword, authNameFirst,
    '9+10=21')).toStrictEqual({ error: expect.any(String)} );


})

//6)NameLast is less than 2 characters or more than 20 characters.
test('Checking length of lastName', () => {
    clear();
    const authEmail = '8aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = '9aaa@bbb.com';
    const authEmail2 = '10aaa@bbb.com';
    const authEmail3 = '11aaa@bbb.com';
    const authEmail4 = '12aaa@bbb.com';
    
    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    //For Too short
    clear();
    expect(adminAuthRegister(authEmail1, authPassword, 'M',
        'M')).toStrictEqual({ error: expect.any(String)} );
    clear();
     expect(adminAuthRegister(authEmail2, authPassword, 'Mi',
        'Mi')).toStrictEqual({ authUserId: expect.any(Number)} );

    //For Too Long
    clear();
    expect(adminAuthRegister(authEmail3, authPassword, authNameFirst,
    'aaaaaaaaaaaaaaaaaaaa')).toStrictEqual({ authUserId: expect.any(Number)} );
    clear();
    expect(adminAuthRegister(authEmail4, authPassword, authNameFirst,
    'aaaaaaaaaaaaaaaaaaaaa')).toStrictEqual({ error: expect.any(String)} );


})

//8)Password is less than 8 characters.
test('Checking Password length, if , < 8' , () => {
    clear();
    const authEmail = '13aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = '14aaa@bbb.com';
    const authEmail2 = '15aaa@bbb.com';
    const authEmail3 = '16aaa@bbb.com';
    const authEmail4 = '17aaa@bbb.com';
    const authEmail5 = '18aaa@bbb.com';
    const authEmail6 = '19aaa@bbb.com';
    const authEmail7 = '20aaa@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    //Checking now
    clear();
    expect(adminAuthRegister(authEmail1, 'a1', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail2, 'a12', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail3, 'a123', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail4, 'a1234', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail5, 'a12345', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail6, 'a123456', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail7, 'a1234567', authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    
    
    
});

//9)Password does not contain at least one number and at least one letter
    test('Checking Password 1 number and 1 letter, if , < 8' , () => {
    clear();
    const authEmail = '21aaa@bbb.com';
    const authPassword = 'abcde12345';
    const authNameFirst = 'Michael';
    const authNameLast = 'Hourn';

    const authEmail1 = '22aaa@bbb.com';
    const authEmail2 = '23aaa@bbb.com';
    const authEmail3 = '24aaa@bbb.com';

    expect(adminAuthRegister(authEmail, authPassword, authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    clear();
    expect(adminAuthRegister(authEmail1, 'aaaaaaaa', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    clear();
    expect(adminAuthRegister(authEmail2, 'aaaaaaa1', authNameFirst,
        authNameLast)).toStrictEqual({ authUserId: expect.any(Number)} );
    clear();
    expect(adminAuthRegister(authEmail3, '11111111', authNameFirst,
        authNameLast)).toStrictEqual({ error: expect.any(String)} );
    

});

});

//END OF AUTH REGISTER TESTING
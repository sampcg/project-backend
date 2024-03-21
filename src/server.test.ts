
import request from 'sync-request-curl';
import { port, url } from '/config.json';
import { ErrorObject } from '/returnInterfaces';
import { User } from '/returnInterfaces';
import { Quiz } from '/returnInterfaces';
import { Trash } from '/returnInterfaces';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', `${SERVER_URL}/v1/clear`);
  });
  
  //  BEGINNING OF TESTING ADMIN AUTH REGISTER  //
  describe('Testing POST /v1/admin/auth/register', () => {

    //This is the correct output for AdminAuthRegister
    test('Correct status code and return value', () => {
      const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: {
          email: 'aaa@bbb.com', 
          password: 'abcde12345',
          nameFirst: 'Michael',
          nameLast:'Hourn'
        }
      });

      expect(AuthRegisterResponse.statusCode).toStrictEqual(200);

      const AuthRegisterResponse = JSON.parse(AuthRegisterResponse.body.toString());
      expect(AuthRegisterResponse).toStrictEqual({ authUserId: expect.any(Number) });
    });

    // 2)Checking for valid email structure
    test.each([
      {
        //Already used email
        email: 'aaa@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'Abrar',
        nameLast:'Gofur'
      }, 
      {
        email: '12342132', 
        password: 'abcde12345',
        nameFirst: 'Abrar',
        nameLast:'Gofur'
      },
      {
        email: '@.com', 
        password: 'abcde12345',
        nameFirst: 'Abrar',
        nameLast:'Gofur'
      },
      {
        email: 'Hello,World!', 
        password: 'abcde12345',
        nameFirst: 'Abrar',
        nameLast:'Gofur'
      },
      {   
        email: '.com.@', 
        password: 'abcde12345',
        nameFirst: 'Abrar',
        nameLast:'Gofur'
      },
    ]) (
      'Checking for valid emails and already used or not',
      ({ email, password, nameFirst, nameLast }) => {
        const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
          json: {
            email, password, nameFirst, nameLast}
        });
        expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
        const AuthRegisterResponse = JSON.parse(AuthRegisterResponse.body.toString());
        expect(AuthRegisterResponse).toStrictEqual({ error: expect.any(String) });
  
      });
    // 3) NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
    test.each([
      {
        email: '1aaa@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'Abrar!',
        nameLast: 'Hourn'
      },
      {
        email: '2aa@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'Abrar#',
        nameLast: 'Hourn'
      },
      {
        email: '3aa@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'Sam(parameters)',
        nameLast: 'Hourn'
      },
      {
        email: '4aa@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'Michael@',
        nameLast: 'Hourn'
      },
      {
        email: '5aa@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'Micha*l',
        nameLast: 'Hourn'
      },
      {
        email: '6aa@bbb.com', 
        password: 'abcde12345',
        nameFirst: '9+10=21',
        nameLast: 'Hourn'
      }
    ]) (
      'Checking for invalid characters firstName',
      ({ email, password, nameFirst, nameLast }) => {
        const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
          json: {
            email, password, nameFirst, nameLast}
        });
        expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
        const AuthRegisterResponse = JSON.parse(AuthRegisterResponse.body.toString());
        expect(AuthRegisterResponse).toStrictEqual({ error: expect.any(String) });
  
    });
    
    // 4)NameFirst is less than 2 characters or more than 20 characters (pt. 1/2)
    test.each([
      {
        email: 'aaa7@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'M',
        nameLast: 'Hourn'
      },
      {
        email: 'aaa8@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'aaaaaaaaaaaaaaaaaaaaa',
        nameLast: 'Hourn'
      },
      
    ]) (
      'Checking length of firstName, errors expected return',
      ({ email, password, nameFirst, nameLast }) => {
        const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
          json: {
            email, password, nameFirst, nameLast}
        });
        expect(AuthRegisterResponse.statusCode).toStrictEqual(400);
        const AuthRegisterResponse = JSON.parse(AuthRegisterResponse.body.toString());
        expect(AuthRegisterResponse).toStrictEqual({ error: expect.any(String) });
  
    });

    // 4)NameFirst is less than 2 characters or more than 20 characters (pt. 2/2)
    test.each([
      {
        email: 'aaa9@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'Mi',
        nameLast: 'Hourn'
      },
      {
        email: 'aaa10@bbb.com', 
        password: 'abcde12345',
        nameFirst: 'aaaaaaaaaaaaaaaaaaaa',
        nameLast: 'Hourn'
      },
      
    ]) (
      'Checking length of firstName, errors expected return',
      ({ email, password, nameFirst, nameLast }) => {
        const AuthRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
          json: {
            email, password, nameFirst, nameLast}
        });
        expect(AuthRegisterResponse.statusCode).toStrictEqual(200);
        const AuthRegisterResponse = JSON.parse(AuthRegisterResponse.body.toString());
        expect(AuthRegisterResponse).toStrictEqual({ authUserId: expect.any(Number) });
  
    });

    

  });
  
  
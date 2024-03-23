import request from 'sync-request-curl';
import { port, url } from './config.json';
import  { ErrorObject, User, Quiz, Trash } from './returnInterfaces';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', `${SERVER_URL}/v1/clear`);
});

//////////////// Testing for AdminQuizCreate ///////////////////

describe('Testing POST /v1/admin/quiz', () => {
    
    // Testing errors
    test('Invalid Author User ID', () => {
        const authRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const authRegisterJSON = JSON.parse(authRegisterResponse.body.toString());
        const authLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });


        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';

        const quizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: authRegisterJSON.userId + 1, name: quizName, description: quizDescription } });

        expect(quizCreateResponse.statusCode).toStrictEqual(401);
    });

    test('Name contains invalid characters', () => {
        const authRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const authRegisterJSON = JSON.parse(authRegisterResponse.body.toString());
        const authLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });


        const quizName = 'aB1 -';
        const quizDescription = 'Quiz Description';

        const quizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: authRegisterJSON.userId, name: quizName, description: quizDescription } });

        expect(quizCreateResponse.statusCode).toStrictEqual(401);
    });

    test('Name is less than 3 characters long', () => {
        const authRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const authRegisterJSON = JSON.parse(authRegisterResponse.body.toString());
        const authLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });


        const quizName = 'a';
        const quizDescription = 'Quiz Description';

        const quizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: authRegisterJSON.userId, name: quizName, description: quizDescription } });
        
        expect(quizCreateResponse.statusCode).toStrictEqual(401);
      });
    
      test('Name is more than 30 characters long', () => {
        const authRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const authRegisterJSON = JSON.parse(authRegisterResponse.body.toString());
        const authLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });


        const quizName = '123456789 123456789 123456789 123456789';
        const quizDescription = 'Quiz Description';

        const quizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: authRegisterJSON.userId, name: quizName, description: quizDescription } });
        
        expect(quizCreateResponse.statusCode).toStrictEqual(401);
      });
    
      test('Name is already used by another quiz', () => {
        const authRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const authRegisterJSON = JSON.parse(authRegisterResponse.body.toString());
        const authLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });


        const quizName = '123456789 123456789 123456789 123456789';
        const quizDescription = 'Quiz Description';

        request('POST', `${SERVER_URL}/va/admin/quiz`, 
        { json: { userId: authRegisterJSON.userId, name: quizName, description: quizDescription }});

        const quiz2CreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: authRegisterJSON.userId, name: quizName, description: quizDescription } });
        
        expect(quiz2CreateResponse.statusCode).toStrictEqual(401);
      });

      test('Name is already used by another quiz by another author', () => {
        // Create 1st user
        const auth1RegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const auth1RegisterJSON = JSON.parse(auth1RegisterResponse.body.toString());
        // Login to 1st user
        request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });
        
        // Create quiz with 1st user
        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';

        request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: auth1RegisterJSON.userId, name: quizName, description: quizDescription } });

        // Logout from 1st user
        request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
        { json: { userId: auth1RegisterJSON.userId } });

        // Create and login 2nd user
        const auth2RegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'ccc@ddd.com',
                password: '12345abcde',
                nameFirst: 'John',
                nameLast: 'Doe'
            }
        });
        const auth2RegisterJSON = JSON.parse(auth2RegisterResponse.body.toString());

        request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'ccc@ddd.com', password: '12345abcde' } });

        // Create 2nd quiz with same name as 1st with 2nd user
        const quiz2CreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: auth2RegisterJSON.userId, name: quizName, description: quizDescription } });
        
        expect(quiz2CreateResponse.statusCode).toStrictEqual(401);
      });
    
      test('Description is more than 100 characters', () => {
        const authRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const authRegisterJSON = JSON.parse(authRegisterResponse.body.toString());
        request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });

        const quizName = 'Quiz Name';
        const quizDescription = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789';
        
        const quizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: authRegisterJSON.userId, name: quizName, description: quizDescription } });
        
        expect(quizCreateResponse.statusCode).toStrictEqual(401);
      });


    // Testing correct outputs
    test('adminQuizCreate has correct response', () => {
        const authRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const authRegisterJSON = JSON.parse(authRegisterResponse.body.toString());
        request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });

        const quizName = 'Quiz Name';
        const quizDescription = 'Quiz Description';

        const quizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: authRegisterJSON.userId, name: quizName, description: quizDescription } });
        
        expect(quizCreateResponse.statusCode).toStrictEqual(200);
      });
    
      test('adminQuizCreate works with empty description', () => {
        const authRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const authRegisterJSON = JSON.parse(authRegisterResponse.body.toString());
        request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });

        const quizName = 'Quiz Name';
        const quizDescription = '';

        const quizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: authRegisterJSON.userId, name: quizName, description: quizDescription } });

        const quizCreateJSON = JSON.parse(quizCreateResponse.body.toString());
        expect (quizCreateJSON).toStrictEqual(
            {
                quizId: quizCreateJSON.quizId,
                name: quizName,
                description: quizDescription,
                timeCreated: expect.any(Number),
                timeLastEdited: expect.any(Number),
                userId: authRegisterJSON.userId,
                questions: []
            }
        );
      });
    
      test('Second adminQuizCreate works', () => {
        const auth1RegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'aaa@bbb.com',
                password: 'abcde12345',
                nameFirst: 'Michael',
                nameLast: 'Hourn'
            }
        });
        const auth1RegisterJSON = JSON.parse(auth1RegisterResponse.body.toString());
        request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'aaa@bbb.com', password: 'abcde12345' } });

        const quiz1Name = 'Quiz Name';
        const quizDescription = 'Quiz Description';

        const quiz1CreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: auth1RegisterJSON.userId, name: quiz1Name, description: quizDescription } });

        const quiz1CreateJSON = JSON.parse(quiz1CreateResponse.body.toString());
        expect(quiz1CreateJSON).toStrictEqual(
            {
                quizId: quiz1CreateJSON.quizId,
                name: quiz1Name,
                description: quizDescription,
                timeCreated: expect.any(Number),
                timeLastEdited: expect.any(Number),
                userId: auth1RegisterJSON.userId,
                questions: []
            }
        );
        
        request('POST', `${SERVER_URL}/v1/admin/auth/logout`,
        { json: { userId: auth1RegisterJSON.userId } });


        const auth2RegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'ccc@ddd.com',
                password: '12345abcde',
                nameFirst: 'John',
                nameLast: 'Doe'
            }
        });
        const auth2RegisterJSON = JSON.parse(auth2RegisterResponse.body.toString());
        request('POST', `${SERVER_URL}/v1/admin/auth/login`,
        { json: { email: 'ccc@ddd.com', password: '12345abcde' } });

        const quiz2Name = 'Quiz Name';

        const quiz2CreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`,
        { json: { userId: auth2RegisterJSON.userId, name: quiz2Name, description: quizDescription } });

        const quiz2CreateJSON = JSON.parse(quiz2CreateResponse.body.toString());
        expect(quiz2CreateJSON).toStrictEqual(
            {
                quizId: quiz2CreateJSON.quizId,
                name: quiz2Name,
                description: quizDescription,
                timeCreated: expect.any(Number),
                timeLastEdited: expect.any(Number),
                userId: auth2RegisterJSON.userId,
                questions: []
            }
        );
      });
})
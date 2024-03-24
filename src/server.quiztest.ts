import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import  { ErrorObject, User, Quiz, Trash } from './returnInterfaces';

const SERVER_URL = `${url}:${port}`;

const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });

const requestHelper = (method: HttpVerb, path: string, payload: object) => {
    let qs = {};
    let json= {};
    if (['GET', 'DELETE'].includes(method)) {
        qs = payload;
    } else {
        json = payload;
    }
    const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
    const bodyString = res.body.toString();
    let bodyObject: any;
    try {
        bodyObject = JSON.parse(bodyString)
    } catch (error: any) {
        bodyObject = {
            error: `Server responded with ${res.statusCode}, but body is not JSON. Given: ${bodyString}. Reason: ${error.message}.`
        };
    }
    if ('error' in bodyObject) {
        return { status: res.statusCode, ...bodyObject };
    }
    return bodyObject;
};

//////////////////////////// Wrapper Functions /////////////////////////////////

const requestRegisterAuth = (email: string, password: string, nameFirst: string, nameLast: string) => {
    return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

const requestAuthLogin = (email: string, password: string) => {
    return requestHelper('POST', '/v1/admin/auth/login', { email, password });
};

const requestAuthLogout = (token: number) => {
    return requestHelper('POST', '/v1/admin/auth/logout', { token });
};

const requestQuizCreate = (token: number, name: string, description: string) => {
    return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
};

const requestQuizList = (token: number) => {
    return requestHelper('GET', '/v1/admin/quiz/list', { token });
};

const requestQuizRemove = (token: number, quizId: number) => {
    return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token, quizId })
};

const requestTrashList = (token: number) => {
    return requestHelper('GET', '/v1/admin/quiz/trash', { token });
};

const requestClear = () => {
    return requestHelper('DELETE', '/v1/clear', {});
}


////////////////////       Testing for Listing Quizzes      ////////////////////

////////////////////       Testing for Quiz Info     ///////////////////////////


describe('Testing GET /v1/admin/quiz/info', () => {
    const authRegisterResponse = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: {
            email: 'samuel.gray@gmail.com',
            password: 'canyoufeelthelovetonight',
            nameFirst: 'Samuel',
            nameLast: 'Gray',
        },
    });
    const authRegisterJSON = JSON.parse(authRegisterResponse.body.toString());

    const authLoginResponse = request('POST', `${SERVER_URL}/v1/admin/auth/login`, {
        json: {
            email: 'samuel.gray@gmail.com',
            password: 'canyoufeelthelovetonight',
        },
    });
    const authLoginJSON = JSON.parse(authLoginResponse.body.toString());

    // Create a quiz
    const quizCreateResponse = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
        json: {
            userId: authRegisterJSON.userId,
            name: 'Test Quiz',
            description: 'Quiz Description',
        },
        headers: {
            Authorization: `Bearer ${authLoginJSON.token}`,
        },
    });
    const quizCreateJSON = JSON.parse(quizCreateResponse.body.toString());

    test('Returns information about quiz when provided with valid authUserId', () => {
        const quizInfoResponse = request('GET', `${SERVER_URL}/v1/admin/quiz/info?quizId=${quizCreateJSON.quizId}`, {
            headers: {
                Authorization: `Bearer ${authLoginJSON.token}`,
            },
        });
        const quizInfoJSON = JSON.parse(quizInfoResponse.body.toString());
    
        expect(quizInfoJSON).toEqual({
            quizId: expect.any(Number),
            name: expect.any(String),
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: expect.any(String),
            numQuestions: expect.any(Number),
            questions: expect.arrayContaining([
                {
                    questionId: expect.any(Number),
                    question: expect.any(String),
                    duration: expect.any(Number),
                    points: expect.any(Number),
                    answers: expect.arrayContaining([
                        {
                            answerId: expect.any(Number),
                            answer: expect.any(String),
                            colour: expect.any(String),
                            correct: expect.any(Boolean),
                        }
                    ])
                }
            ]),
            duration: expect.any(Number),
        });
    });

    test('Returns error message when authUserId is not a valid user', () => {
        const invalidUserId = authRegisterJSON.userId + 1;
        const quizInfoResponse = request('GET', `${SERVER_URL}/v1/admin/quiz/info?quizId=${quizCreateJSON.quizId}`, {
            headers: {
                Authorization: `Bearer ${authLoginJSON.token}`,
            },
        });
        const quizInfoJSON = JSON.parse(quizInfoResponse.body.toString());
    
        expect(quizInfoJSON).toEqual({
            error: 'AuthUserId is not a valid user.',
        });
    });
    
    test('Returns error message when quizId does not refer to a valid quiz', () => {
        const invalidQuizId = quizCreateJSON.quizId + 1;
        const quizInfoResponse = request('GET', `${SERVER_URL}/v1/admin/quiz/info?quizId=${invalidQuizId}`, {
            headers: {
                Authorization: `Bearer ${authLoginJSON.token}`,
            },
        });
        const quizInfoJSON = JSON.parse(quizInfoResponse.body.toString());
    
        expect(quizInfoJSON).toEqual({
            error: 'Quiz ID does not refer to a valid quiz.',
        });
    });
    
    test('Returns error message when quizId does not refer to a quiz that this user owns', () => {
        // Register a second user and create a quiz with them
        const authRegisterResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
            json: {
                email: 'fettywap@gmail.com',
                password: '1738ayeaye',
                nameFirst: 'Fetty',
                nameLast: 'Wap',
            },
        });
        const authRegisterJSON2 = JSON.parse(authRegisterResponse2.body.toString());
    
        const authLoginResponse2 = request('POST', `${SERVER_URL}/v1/admin/auth/login`, {
            json: {
                email: 'fettywap@gmail.com',
                password: '1738ayeaye',
            },
        });
        const authLoginJSON2 = JSON.parse(authLoginResponse2.body.toString());
    
        const quizCreateResponse2 = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
            json: {
                userId: authRegisterJSON2.userId,
                name: 'Another Quiz',
                description: 'Another Quiz Description',
            },
            headers: {
                Authorization: `Bearer ${authLoginJSON2.token}`,
            },
        });
        const quizCreateJSON2 = JSON.parse(quizCreateResponse2.body.toString());
    
        // Try to access the second user's quiz with the first user's token
        const quizInfoResponse = request('GET', `${SERVER_URL}/v1/admin/quiz/info?quizId=${quizCreateJSON2.quizId}`, {
            headers: {
                Authorization: `Bearer ${authLoginJSON.token}`,
            },
        });
        const quizInfoJSON = JSON.parse(quizInfoResponse.body.toString());
    
        expect(quizInfoJSON).toEqual({
            error: 'Quiz ID does not refer to a quiz that this user owns.',
        });
    });
    
});

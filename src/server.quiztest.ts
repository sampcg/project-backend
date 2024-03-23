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

////////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
    requestClear();
});


////////////////////       Testing for Listing Quizzes      ////////////////////

describe('Testing GET /v1/admin/quiz/list', () => {
    let author: {token: number} ;
    beforeEach(() => {
        author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
        requestAuthLogin('aaa@bbb.com', 'abcde12345');
    });

    test('Testing: Error Case - Invalid token', () => {
        expect(requestQuizList(author.token + 1)).toStrictEqual(makeCustomErrorForTest(401));
    });

    describe('Testing: Successful cases', () => {
        test('Empty list', () => {
            expect(requestQuizList(author.token)).toStrictEqual({ quizzes: [] });
        });

        test.todo('1 quiz', () => {
            const quiz1: {quizId: number} = requestQuizCreate(author.token, 'Quiz 1', 'a'); 
            expect(requestQuizList(author.token)).toStrictEqual({
                quizzes: [
                    {
                        quizId: quiz1.quizId,
                        name: 'a'
                    }
                ]
            });
        });

        test.todo('3 quizzes', () => {
            const quiz1: {quizId: number} = requestQuizCreate(author.token, 'Quiz 1', 'a');
            const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 1', 'b');
            const quiz3: {quizId: number} = requestQuizCreate(author.token, 'Quiz 1', 'c');

            expect(requestQuizList(author.token)).toStrictEqual({
                quizzes: [
                    {
                        quizId: quiz1.quizId,
                        name: 'a'
                    },
                    {
                        quizId: quiz2.quizId,
                        name: 'b'
                    },
                    {
                        quizId: quiz3.quizId,
                        name: 'c'
                    }
                ]
            });
        });

        test.todo('Quizzes logged by another author', () => {
            const quiz1: {quizId: number} = requestQuizCreate(author.token, 'Quiz 1', 'a');
            requestAuthLogout(author.token);

            const author2: {token: number} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
            requestAuthLogin('ccc@ddd.com', '12345abcde');
            
            const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', 'b');
            const quiz3: {quizId: number} = requestQuizCreate(author.token, 'Quiz 3', 'c');
            const quiz4: {quizId: number} = requestQuizCreate(author.token, 'Quiz 4', 'd');

            expect(requestQuizList(author2.token)).toStrictEqual({
                quizzes: [
                    {
                        quizId: quiz2.quizId,
                        name: 'b'
                    },
                    {
                        quizId: quiz3.quizId,
                        name:'c'
                    },
                    {
                        quizId: quiz4.quizId,
                        name: 'd'
                    }
                ]
            });
        });
    });
});


////////////////////        Testing for Creating Quiz       ////////////////////

describe('Testing POST /v1/admin/quiz', () => {
    let author: {token: number} ;
    beforeEach(() => {
        author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
        requestAuthLogin('aaa@bbb.com', 'abcde12345');
    });

    const quizName = 'Quiz Name';
    const quizDescription = 'Quiz Description';

    describe('Testing: Error Cases', () => {
        const invalidQuizName = 'aB1 -';
        const shortQuizName = 'a';
        const longQuizName = '123456789 123456789 123456789 123456789';
        const longQuizDescription = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789';

        test('Invalid token', () => {
            expect(requestQuizCreate(author.token + 1, quizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(401))
        });

        test.each([
            { token: author.token, name: invalidQuizName, description: quizDescription }, // Invalid Characters
            { token: author.token, name: shortQuizName, description: quizDescription }, // Name less than 3 characters
            { token: author.token, name: longQuizName, description: quizDescription }, // Name greater than 30 characters
            { token: author.token, name: quizName, description: longQuizDescription }, // Description is greater than 100 characters
        ])('token=$token, name=$name, description=$description', ({ token, name, description }) => {
            expect(requestQuizCreate(token, name, description)).toStrictEqual(makeCustomErrorForTest(400));
        });

        test('Testing name already in use', () => {
            const quizName = 'Quiz Name';
            const quizDescription = 'Quiz Description';
            requestQuizCreate(author.token, quizName, quizDescription);
            requestAuthLogout(author.token);
            
            const author2 = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
            requestAuthLogin('ccc@ddd.com', '12345abcde');
    
            expect(requestQuizCreate(author2.token, quizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(400))
        });
    });

    describe('Testing: Successful cases', () => {
        test.each([
            {token: author.token, name: quizName, description: quizDescription}, // General Case
            {token: author.token, name: quizName, description: ''} // Empty description
        ])('token=$token, name=$name, description=$description', ({ token, name, description }) => {
            const quiz = requestQuizCreate(token, name, description);
            expect(quiz).toStrictEqual({quizId: quiz.quizId});
            expect(requestQuizList(author.token)).toStrictEqual({
                quizzes: [
                    {
                        quizId: quiz.quizId,
                        name: quizName
                    }
                ]
            });
        });

        test('Create multiple quizzes', () => {
            const quiz2Name = 'Quiz 2 Name';
            const quiz1 = requestQuizCreate(author.token, quizName, quizDescription);
            const quiz2 = requestQuizCreate(author.token, quiz2Name, quizDescription);
            expect(quiz1).toStrictEqual(quiz1.quizId);
            expect(quiz2).toStrictEqual(quiz2.quizId);
            expect(requestQuizList(author.token)).toStrictEqual({
                quizzes: [
                    {
                        quizId: quiz1.quizId,
                        name: quizName
                    },
                    {
                        quizId: quiz2.quizId,
                        name: quiz2Name
                    }
                ]
            });
        });

        test('Create quiz with another author', () => {
            const quiz1 = requestQuizCreate(author.token, quizName, quizDescription);

            requestAuthLogout(author.token);

            const author2 = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
            requestAuthLogin('ccc@ddd.com', '12345abcde');
            const quiz2Name = 'Quiz 2 Name';
            const quiz2 = requestQuizCreate(author2.token, quiz2Name, quizDescription);
            
            expect(quiz1).toStrictEqual(quiz1.quizId);
            expect(quiz2).toStrictEqual(quiz2.quizId);
            expect(quiz1).not.toStrictEqual(quiz2);
        });
    });
});


////////////////////        Testing for Removing Quiz       ////////////////////

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
    let author: {token: number}, quiz: {quizId: number};
    beforeEach(() => {
        author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
        requestAuthLogin('aaa@bbb.com', 'abcde12345');
        quiz = requestQuizCreate(author.token, 'Quiz Name', '');
    });

    describe('Testing: Error Cases', () => {
        test('Invalid token (does not exist)', () => {
            expect(requestQuizRemove(author.token + 1, quiz.quizId)).toStrictEqual(makeCustomErrorForTest(401))
        });

        test('Invalid quizId (does not exist)', () => {
            expect(requestQuizRemove(author.token, quiz.quizId + 1)).toStrictEqual(makeCustomErrorForTest(403));
        });

        test('Invalid token (does not correlate to given quiz)', () => {
            requestAuthLogout(author.token);
            const author2: {token: number} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
            requestAuthLogin('ccc@ddd.com', '12345abcde');
            const quiz2: {quizId: number} =  requestQuizCreate(author2.token, 'Quiz Name', '');
            expect(requestQuizRemove(author.token, quiz2.quizId)).toStrictEqual(makeCustomErrorForTest(403))
        });
    });

    describe('Testing: Successful Cases', () => {
        test('Deletes 1 of 1', () => {
            const QuizRemoveResponse: {} = requestQuizRemove(author.token, quiz.quizId)
            expect(QuizRemoveResponse).toStrictEqual({});
            expect(requestQuizList(author.token)).toStrictEqual({quizzes: []})
        });

        test('Deletes 1st of 2', () => {
            const quiz2: {quizId: number}= requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
            requestQuizRemove(author.token, quiz.quizId);
            expect(requestQuizList(author.token)).toStrictEqual({
                quizzes: [
                    {
                        quizId: quiz2.quizId,
                        name: 'Quiz 2 Des'
                    }
                ]
            });
            expect(requestTrashList(author.token)).toStrictEqual({
                trash: [
                    {
                        quizId: quiz.quizId,
                        name: ''
                    }
                ]
            });
        });

        test('Deletes 2nd of 2', () => {
            const quiz2: {quizId: number}= requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
            requestQuizRemove(author.token, quiz2.quizId);
            expect(requestQuizList(author.token)).toStrictEqual({
                quizzes: [
                    {
                        quizId: quiz.quizId,
                        name: ''
                    }
                ]
            });
            expect(requestTrashList(author.token)).toStrictEqual({
                trash: [
                    {
                        quizId: quiz2.quizId,
                        name: 'Quiz 2 Des'
                    }
                ]
            });
        });

        test('Deletes 2 of 2', () => {
            const quiz2: {quizId: number}= requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
            requestQuizRemove(author.token, quiz.quizId);
            expect(requestQuizList(author.token)).toStrictEqual({ quizzes: [] });
            expect(requestTrashList(author.token)).toStrictEqual({
                trash: [
                    {
                        quizId: quiz.quizId,
                        name: ''
                    },
                    {
                        quizId: quiz2.quizId,
                        name: 'Quiz 2 Des'
                    }
                ]
            });
        });
    });
});

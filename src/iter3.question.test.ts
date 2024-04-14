import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { IncomingHttpHeaders } from 'http';

const SERVER_URL = `${url}:${port}`;

interface AnswerInput {
  answer: string;
  correct: boolean;
}

interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerInput[];
  thumbnailUrl: string;
}
const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });

interface Payload {
  [key: string]: any;
}

const requestHelper = (method: HttpVerb, path: string, payload: Payload, headers: IncomingHttpHeaders = {}) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method.toUpperCase())) {
    qs = payload;
  } else {
    json = payload;
  }
  const url = SERVER_URL + path;
  const res = request(method, url, { qs, json, headers, timeout: 20000 });

  let bodyObject: any;
  try {
    bodyObject = JSON.parse(res.body.toString());
  } catch (error: any) {
    bodyObject = {
      error: `Server responded with ${res.statusCode}, but body is not JSON. Given: ${res.body.toString()}. Reason: ${error.message}.`
    };
  }
  if ('error' in bodyObject) {
    return { status: res.statusCode, ...bodyObject };
  }
  return bodyObject;
};

/// ///////////////////////// Wrapper Functions /////////////////////////////////

const requestRegisterAuth = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};

const requestAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
};

const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
};

const requestQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, {}, { token });
};

const requestQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`, { questionBody }, { token });
};

/*
const requestQuestionUpdate = (token: string, quizId: number, questionId: number, questionBody: QuestionBody) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token, quizId, questionId, questionBody });
};

const requestQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { token, quizId, questionId, newPosition });
};
*/

const requestQuestionDelete = (token: string, quizId: number, questionId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, {}, { token });
};

const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  requestClear();
});

/// /////////////////      Testing for Creating Question     ////////////////////
describe('Testing POST /v1/admin/quiz/{quizid}/question', () => {
    let author: {token: string}, quiz: {quizId: number};
    let question: string, duration: number, points: number, answers: AnswerInput[], thumbnailUrl: string;
    beforeEach(() => {
      author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
      quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz 1 Des');
      // Standard values
      question = 'Question';
      duration = 1;
      points = 1;
      answers =
            [{
              answer: 'Answer 1',
              correct: true
            },
            {
              answer: 'Answer 2',
              correct: false
            }];
      thumbnailUrl = 'http://google.com/some/image/path.jpg';
    });
  
    describe('Testing: Error cases', () => {
      test('Name less than 5 characters', () => {
        const shortQuestion = 'a';
        const questionBody: QuestionBody = { question: shortQuestion, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Name greater than 50 characters', () => {
        const longQuestion = '123456789 123456789 123456789 123456789 123456789 123456789';
        const questionBody: QuestionBody = { question: longQuestion, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Less than 2 answers', () => {
        const oneAnswer: AnswerInput[] =
            [{
              answer: 'Answer',
              correct: true
            }];
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: oneAnswer, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Greater than 6 answers', () => {
        const sevenAnswers: AnswerInput[] =
            [{
              answer: '1', correct: true
            }, {
              answer: '2', correct: false
            }, {
              answer: '3', correct: false
            }, {
              answer: '4', correct: false
            }, {
              answer: '5', correct: false
            }, {
              answer: '6', correct: false
            }, {
              answer: '7', correct: false
            }];
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: sevenAnswers, thumbnailUrl: thumbnailUrl };
  
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Duration is negative', () => {
        const negativeDuration = -1;
        const questionBody: QuestionBody = { question: question, duration: negativeDuration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Points less than 1', () => {
        const smallPoints = 0;
        const questionBody: QuestionBody = { question: question, duration: duration, points: smallPoints, answers: answers, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Points greater than 10', () => {
        const largePoints = 11;
        const questionBody: QuestionBody = { question: question, duration: duration, points: largePoints, answers: answers, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Answer less than 1 characters', () => {
        const shortAnswer: AnswerInput[] =
            [{
              answer: '',
              correct: true
            },
            {
              answer: 'Answer 2',
              correct: false
            }];
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: shortAnswer, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Answer greater than 30 characters', () => {
        const longAnswer: AnswerInput[] =
            [{
              answer: '123456789 123456789 123456789 123456789',
              correct: true
            },
            {
              answer: 'Answer 2',
              correct: false
            }];
  
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: longAnswer, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('No correct answers', () => {
        const noCorrectAnswers: AnswerInput[] =
            [{
              answer: 'Answer 1',
              correct: false
            },
            {
              answer: 'Answer 2',
              correct: false
            }];
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: noCorrectAnswers, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Duplicate answers', () => {
        const duplicateAnswers: AnswerInput[] =
            [{
              answer: 'Answer',
              correct: true
            },
            {
              answer: 'Answer',
              correct: false
            }];
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: duplicateAnswers, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Quiz duration is greater than 3 minutes', () => {
        const longDuration = 100;
        const questionBody: QuestionBody = { question: question, duration: longDuration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        requestQuestionCreate(author.token, quiz.quizId, questionBody);
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('thumbnailUrl is an empty string', () => {
        const emptyUrl = '';
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: emptyUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('thumbnailUrl does not end with jpg, jpeg, png', () => {
        const invalidUrl = 'https://some.test.file';
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: invalidUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('thumbnailUrl does not begin with http:// or https://', () => {
        const invalidUrl = 'bruh.jpg';
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: invalidUrl };
        expect(requestQuestionCreate(author.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Invalid token', () => {
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author.token + 1, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(401));
      });
  
      test('User does not own quiz', () => {
        requestAuthLogout(author.token);
  
        const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        expect(requestQuestionCreate(author2.token, quiz.quizId, questionBody)).toStrictEqual(makeCustomErrorForTest(403));
      });
    });
  
    describe('Testing: Successful Cases', () => {
      test('Successfully creates a question', () => {
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        const question1: { questionId: number } = requestQuestionCreate(author.token, quiz.quizId, questionBody);
  
        expect(question1.questionId).toStrictEqual(expect.any(Number));
  
        expect(requestQuizInfo(author.token, quiz.quizId)).toStrictEqual({
          quizId: quiz.quizId,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz 1 Des',
          numQuestions: 1,
          questions: [
            {
              questionId: question1.questionId,
              question: 'Question',
              duration: 1,
              thumbnailUrl: 'http://google.com/some/image/path.jpg',
              points: 1,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 1,
          thumbnailUrl: expect.any(String)
        });
      });
  
      test('Successfully creates multiple questions', () => {
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        const question1: {questionId: number} = requestQuestionCreate(author.token, quiz.quizId, questionBody);
  
        expect(question1.questionId).toStrictEqual(expect.any(Number));
  
        const question2Name = 'Question 2';
        const duration2 = 2;
        const points2 = 2;
        const questionBody2: QuestionBody = { question: question2Name, duration: duration2, points: points2, answers: answers, thumbnailUrl: thumbnailUrl };
        const question2: {questionId: number} = requestQuestionCreate(author.token, quiz.quizId, questionBody2);
  
        expect(question2.questionId).toStrictEqual(expect.any(Number));
        expect(question1.questionId).not.toStrictEqual(question2.questionId);
  
        expect(requestQuizInfo(author.token, quiz.quizId)).toStrictEqual({
          quizId: quiz.quizId,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz 1 Des',
          numQuestions: 2,
          questions: [
            {
              questionId: question1.questionId,
              question: 'Question',
              duration: 1,
              thumbnailUrl: 'http://google.com/some/image/path.jpg',
              points: 1,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: question2.questionId,
              question: 'Question 2',
              duration: 2,
              thumbnailUrl: 'http://google.com/some/image/path.jpg',
              points: 2,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 3,
          thumbnailUrl: expect.any(String)
        });
      });
  
      test('Works with jpg, jpeg, png', () => {
        const questionBody1: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        const question1 = requestQuestionCreate(author.token, quiz.quizId, questionBody1);
  
        const thumbnailUrl2 = 'http://google.com/some/image/path.jpeg';
        const questionBody2: QuestionBody = { question: 'Question 2', duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl2 };
        const question2 = requestQuestionCreate(author.token, quiz.quizId, questionBody2);
  
        const thumbnailUrl3 = 'http://google.com/some/image/path.png';
        const questionBody3: QuestionBody = { question: 'Question 3', duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl3 };
        const question3 = requestQuestionCreate(author.token, quiz.quizId, questionBody3);
  
        expect(requestQuizInfo(author.token, quiz.quizId)).toStrictEqual({
          quizId: quiz.quizId,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz 1 Des',
          numQuestions: 3,
          questions: [
            {
              questionId: question1.questionId,
              question: 'Question',
              duration: 1,
              thumbnailUrl: 'http://google.com/some/image/path.jpg',
              points: 1,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: question2.questionId,
              question: 'Question 2',
              duration: 1,
              thumbnailUrl: 'http://google.com/some/image/path.jpeg',
              points: 1,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: question3.questionId,
              question: 'Question 3',
              duration: 1,
              thumbnailUrl: 'http://google.com/some/image/path.png',
              points: 1,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 3,
          thumbnailUrl: expect.any(String)
        });
      });
  
      test('Successfully creates questions with another user', () => {
        requestAuthLogout(author.token);
  
        const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
  
        const quiz2: {quizId: number} = requestQuizCreate(author2.token, 'Quiz 2', 'Quiz 2 Des');
  
        const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers, thumbnailUrl: thumbnailUrl };
        const question1: {questionId: number} = requestQuestionCreate(author2.token, quiz2.quizId, questionBody);
        expect(question1.questionId).toStrictEqual(expect.any(Number));
  
        const question2Name = 'Question 2';
        const duration2 = 2;
        const points2 = 2;
  
        const questionBody2: QuestionBody = { question: question2Name, duration: duration2, points: points2, answers: answers, thumbnailUrl: thumbnailUrl };
  
        const question2: {questionId: number} = requestQuestionCreate(author2.token, quiz2.quizId, questionBody2);
        expect(question2.questionId).toStrictEqual(expect.any(Number));
  
        expect(question1.questionId).not.toStrictEqual(question2.questionId);
  
        expect(requestQuizInfo(author2.token, quiz2.quizId)).toStrictEqual({
          quizId: quiz2.quizId,
          name: 'Quiz 2',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz 2 Des',
          numQuestions: 2,
          questions: [
            {
              questionId: question1.questionId,
              question: 'Question',
              duration: 1,
              thumbnailUrl: 'http://google.com/some/image/path.jpg',
              points: 1,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            },
            {
              questionId: question2.questionId,
              question: 'Question 2',
              duration: 2,
              thumbnailUrl: 'http://google.com/some/image/path.jpg',
              points: 2,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 3,
          thumbnailUrl: expect.any(String)
        });
      });
    });
  });

/// /////////////////      Testing for Removing Question     ////////////////////
describe('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid}', () => {
    let author: {token: string}, quiz: {quizId: number}, question1: {questionId: number}, answers: AnswerInput[];
    beforeEach(() => {
      author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
      quiz = requestQuizCreate(author.token, 'Quiz 1', 'Quiz 1 Des');
      answers =
        [{
          answer: 'Answer 1',
          correct: true
        },
        {
          answer: 'Answer 2',
          correct: false
        }];
      const questionBody: QuestionBody = { question: 'Question 1', duration: 5, points: 5, answers: answers, thumbnailUrl: 'http://google.com/some/image/path.jpg' };
      question1 = requestQuestionCreate(author.token, quiz.quizId, questionBody);
    });
  
    describe('Testing: Error cases', () => {
      test('Question ID is not valid in this quiz', () => {
        const invalidQuestionId = question1.questionId + 1;
        expect(requestQuestionDelete(author.token, quiz.quizId, invalidQuestionId)).toStrictEqual(makeCustomErrorForTest(400));
      });
  
      test('Token is invalid', () => {
        expect(requestQuestionDelete(author.token + 1, quiz.quizId, question1.questionId)).toStrictEqual(makeCustomErrorForTest(401));
      });
  
      test('Valid token, but user does not own quiz', () => {
        requestAuthLogout(author.token);
        const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
        expect(requestQuestionDelete(author2.token, quiz.quizId, question1.questionId)).toStrictEqual(makeCustomErrorForTest(403));
      });
    });
  
    describe('Testing: Success cases', () => {
      test('Deletes one question', () => {
        expect(requestQuestionDelete(author.token, quiz.quizId, question1.questionId)).toStrictEqual({});
  
        expect(requestQuizInfo(author.token, quiz.quizId)).toStrictEqual({
          quizId: quiz.quizId,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz 1 Des',
          numQuestions: 0,
          questions: [],
          duration: 0,
          thumbnailUrl: expect.any(String)
        });
      });
  
      test('Deletes two questions', () => {
        const questionBody2: QuestionBody = { question: 'Question 2', duration: 5, points: 5, answers: answers, thumbnailUrl: 'http://google.com/some/image/path.jpg' };
        const question2: {questionId: number} = requestQuestionCreate(author.token, quiz.quizId, questionBody2);
        requestQuestionDelete(author.token, quiz.quizId, question1.questionId);
  
        expect(requestQuizInfo(author.token, quiz.quizId)).toStrictEqual({
          quizId: quiz.quizId,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz 1 Des',
          numQuestions: 1,
          questions: [
            {
              questionId: question2.questionId,
              question: 'Question 2',
              duration: 5,
              thumbnailUrl: 'http://google.com/some/image/path.jpg',
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 1',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Answer 2',
                  colour: expect.any(String),
                  correct: false
                }
              ]
            }
          ],
          duration: 5,
          thumbnailUrl: expect.any(String)
        });
  
        requestQuestionDelete(author.token, quiz.quizId, question2.questionId);
  
        expect(requestQuizInfo(author.token, quiz.quizId)).toStrictEqual({
          quizId: quiz.quizId,
          name: 'Quiz 1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz 1 Des',
          numQuestions: 0,
          questions: [],
          duration: 0,
          thumbnailUrl: expect.any(String)
        });
      });
    });
  });
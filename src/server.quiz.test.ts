import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });
/*
interface Answer {
    answer: string;
    correct: boolean;
}
*/

const requestHelper = (method: HttpVerb, path: string, payload: object) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  const bodyString = res.body.toString();
  let bodyObject: any;
  try {
    bodyObject = JSON.parse(bodyString);
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

/// ///////////////////////// Wrapper Functions /////////////////////////////////

const requestRegisterAuth = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
};
/*
const requestAuthLogin = (email: string, password: string) => {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
};
*/
const requestAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
};

const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
};

const requestQuizList = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
};

const requestQuizRemove = (token: string, quizId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token, quizId });
};
/*
const requestQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token, quizId });
};

const requestTrashList = (token: string) => {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
};

const requestQuestionCreate = (token: string, quizId: number, question: string, duration: number, points: number, answers: Answer[]) => {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question`, { token, quizId, question, duration, points, answers });
};

const requestQuestionDelete = (token: string, quizId: number, questionId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token, quizId, questionId });
};
*/
const requestClear = () => {
  return requestHelper('DELETE', '/v1/clear', {});
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  requestClear();
});

/// /////////////////       Testing for Listing Quizzes      ////////////////////

describe('Testing GET /v1/admin/quiz/list', () => {
  let author: {token: string};
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
  });

  test('Testing: Error Case - Invalid token', () => {
    const invalidToken = author.token + 'Math.random()';
    expect(requestQuizList(invalidToken)).toStrictEqual(makeCustomErrorForTest(401));
  });

  describe('Testing: Successful cases', () => {
    test('Empty list', () => {
      expect(requestQuizList(author.token)).toStrictEqual({ quizzes: [] });
    });

    test('1 quiz', () => {
      const quiz1: {quizId: number} = requestQuizCreate(author.token, 'Quiz 1', 'a');
      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz1.quizId,
            name: 'Quiz 1'
          }
        ]
      });
    });

    test('3 quizzes', () => {
      const quiz1: {quizId: number} = requestQuizCreate(author.token, 'Quiz 1', 'a');
      const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', 'b');
      const quiz3: {quizId: number} = requestQuizCreate(author.token, 'Quiz 3', 'c');

      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz1.quizId,
            name: 'Quiz 1'
          },
          {
            quizId: quiz2.quizId,
            name: 'Quiz 2'
          },
          {
            quizId: quiz3.quizId,
            name: 'Quiz 3'
          }
        ]
      });
    });

    test('Quizzes logged by another author', () => {
      requestQuizCreate(author.token, 'Quiz 1', 'a');
      requestAuthLogout(author.token);

      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');

      const quiz2: {quizId: number} = requestQuizCreate(author2.token, 'Quiz 2', 'b');
      const quiz3: {quizId: number} = requestQuizCreate(author2.token, 'Quiz 3', 'c');
      const quiz4: {quizId: number} = requestQuizCreate(author2.token, 'Quiz 4', 'd');

      expect(requestQuizList(author2.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz2.quizId,
            name: 'Quiz 2'
          },
          {
            quizId: quiz3.quizId,
            name: 'Quiz 3'
          },
          {
            quizId: quiz4.quizId,
            name: 'Quiz 4'
          }
        ]
      });
    });
  });
});

/// /////////////////        Testing for Creating Quiz       ////////////////////

describe('Testing POST /v1/admin/quiz', () => {
  let author: {token: string}, quizName: string, quizDescription: string;
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    // Standard values
    quizName = 'Quiz Name';
    quizDescription = 'Quiz Description';
  });

  describe('Testing: Error Cases', () => {
    test('Invalid token', () => {
      expect(requestQuizCreate(author.token + 1, quizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('Invalid Characters', () => {
      const invalidQuizName = 'aB1 -';
      expect(requestQuizCreate(author.token, invalidQuizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Name less than 3 characters', () => {
      const shortQuizName = 'a';
      expect(requestQuizCreate(author.token, shortQuizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Name greater than 30 characters', () => {
      const longQuizName = '123456789 123456789 123456789 123456789';
      expect(requestQuizCreate(author.token, longQuizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Description greater than 100 characters', () => {
      const longQuizDescription = '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789';
      expect(requestQuizCreate(author.token, quizName, longQuizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Testing name already in use', () => {
      const quizName = 'Quiz Name';
      const quizDescription = 'Quiz Description';
      requestQuizCreate(author.token, quizName, quizDescription);
      requestAuthLogout(author.token);

      const author2 = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');

      expect(requestQuizCreate(author2.token, quizName, quizDescription)).toStrictEqual(makeCustomErrorForTest(400));
    });
  });

  describe('Testing: Successful cases', () => {
    test('General case', () => {
      const quiz: {quizId: number} = requestQuizCreate(author.token, quizName, quizDescription);
      expect(quiz.quizId).toStrictEqual(expect.any(Number));

      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Quiz Name',
          }
        ]
      });
    });

    test('Empty Description', () => {
      const quiz: {quizId: number} = requestQuizCreate(author.token, quizName, '');
      expect(quiz.quizId).toStrictEqual(expect.any(Number));

      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Quiz Name',
          }
        ]
      });
    });

    test('Create multiple quizzes', () => {
      const quiz2Name = 'Quiz 2 Name';
      const quiz1 = requestQuizCreate(author.token, quizName, quizDescription);
      const quiz2 = requestQuizCreate(author.token, quiz2Name, quizDescription);
      expect(quiz1).toStrictEqual({ quizId: quiz1.quizId });
      expect(quiz2).toStrictEqual({ quizId: quiz2.quizId });

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

      const quiz2Name = 'Quiz 2 Name';
      const quiz2 = requestQuizCreate(author2.token, quiz2Name, quizDescription);

      expect(quiz1).toStrictEqual({ quizId: quiz1.quizId });
      expect(quiz2).toStrictEqual({ quizId: quiz2.quizId });
      expect(quiz1).not.toStrictEqual(quiz2);
    });
  });
});

/// /////////////////        Testing for Removing Quiz       ////////////////////

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  let author: {token: string}, quiz: {quizId: number};
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    quiz = requestQuizCreate(author.token, 'Quiz Name', '');
  });

  describe('Testing: Error Cases', () => {
    test('Invalid token (does not exist)', () => {
      expect(requestQuizRemove(author.token + 1, quiz.quizId)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('Invalid quizId (does not exist)', () => {
      expect(requestQuizRemove(author.token, quiz.quizId + 1)).toStrictEqual(makeCustomErrorForTest(403));
    });

    test('Invalid token (does not correlate to given quiz)', () => {
      requestAuthLogout(author.token);
      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      const quiz2: {quizId: number} = requestQuizCreate(author2.token, 'Quiz Name', '');
      expect(requestQuizRemove(author.token, quiz2.quizId)).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing: Successful Cases', () => {
    test('Deletes 1 of 1', () => {
      const quizRemoveResponse: Record<string, never> = requestQuizRemove(author.token, quiz.quizId);
      expect(quizRemoveResponse).toStrictEqual({});
      expect(requestQuizList(author.token)).toStrictEqual({ quizzes: [] });
    });

    test('Deletes 1st of 2', () => {
      const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      requestQuizRemove(author.token, quiz.quizId);
      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz2.quizId,
            name: 'Quiz 2'
          }
        ]
      });
      /*
      expect(requestTrashList(author.token)).toStrictEqual({
        trash: [
          {
            quizId: quiz.quizId,
            name: ''
          }
        ]
      });
      */
    });

    test('Deletes 2nd of 2', () => {
      const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      requestQuizRemove(author.token, quiz2.quizId);
      expect(requestQuizList(author.token)).toStrictEqual({
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Quiz Name'
          }
        ]
      });
      /*
      expect(requestTrashList(author.token)).toStrictEqual({
        trash: [
          {
            quizId: quiz2.quizId,
            name: 'Quiz 2 Des'
          }
        ]
      });
      */
    });

    test('Deletes 2 of 2', () => {
      const quiz2: {quizId: number} = requestQuizCreate(author.token, 'Quiz 2', 'Quiz 2 Des');
      requestQuizRemove(author.token, quiz.quizId);
      requestQuizRemove(author.token, quiz2.quizId);
      expect(requestQuizList(author.token)).toStrictEqual({ quizzes: [] });
      /*
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
      */
    });
  });
});
/*
/// /////////////////      Testing for Creating Question     ////////////////////

describe('Testing POST /v1/admin/quiz/{quizid}/question', () => {
  let author: {token: string}, quiz: {quizId: number};
  let question: string, duration: number, points: number, answers: Answer[];
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    requestAuthLogin('aaa@bbb.com', 'abcde12345');
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
  });

  describe('Testing: Error cases', () => {
    test('Name less than 5 characters', () => {
      const shortQuestion = 'a';
      expect(requestQuestionCreate(author.token, quiz.quizId, shortQuestion, duration, points, answers)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Name greater than 50 characters', () => {
      const longQuestion = '123456789 123456789 123456789 123456789 123456789 123456789';
      expect(requestQuestionCreate(author.token, quiz.quizId, longQuestion, duration, points, answers)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Less than 2 answers', () => {
      const oneAnswer: Answer[] =
        [{
          answer: 'Answer',
          correct: true
        }];
      expect(requestQuestionCreate(author.token, quiz.quizId, question, duration, points, oneAnswer)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Greater than 6 answers', () => {
      const sevenAnswers: Answer[] =
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
      expect(requestQuestionCreate(author.token, quiz.quizId, question, duration, points, sevenAnswers)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Duration is negative', () => {
      const negativeDuration = -1;
      expect(requestQuestionCreate(author.token, quiz.quizId, question, negativeDuration, points, answers)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Points less than 1', () => {
      const smallPoints = 0;
      expect(requestQuestionCreate(author.token, quiz.quizId, question, duration, smallPoints, answers)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Points greater than 10', () => {
      const largePoints = 11;
      expect(requestQuestionCreate(author.token, quiz.quizId, question, duration, largePoints, answers)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Answer less than 1 characters', () => {
      const shortAnswer: Answer[] =
        [{
          answer: '',
          correct: true
        },
        {
          answer: 'Answer 2',
          correct: false
        }];
      expect(requestQuestionCreate(author.token, quiz.quizId, question, duration, points, shortAnswer)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Answer greater than 30 characters', () => {
      const longAnswer: Answer[] =
        [{
          answer: '123456789 123456789 123456789 123456789',
          correct: true
        },
        {
          answer: 'Answer 2',
          correct: false
        }];
      expect(requestQuestionCreate(author.token, quiz.quizId, question, duration, points, longAnswer)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('No correct answers', () => {
      const noCorrectAnswers: Answer[] =
        [{
          answer: 'Answer 1',
          correct: false
        },
        {
          answer: 'Answer 2',
          correct: false
        }];
      expect(requestQuestionCreate(author.token, quiz.quizId, question, duration, points, noCorrectAnswers)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Duplicate answers', () => {
      const duplicateAnswers: Answer[] =
        [{
          answer: 'Answer',
          correct: true
        },
        {
          answer: 'Answer',
          correct: false
        }];
      expect(requestQuestionCreate(author.token, quiz.quizId, question, duration, points, duplicateAnswers)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Quiz duration is greater than 3 minutes', () => {
      const longDuration = 100;
      requestQuestionCreate(author.token, quiz.quizId, question, longDuration, points, answers);
      expect(requestQuestionCreate(author.token, quiz.quizId, question, longDuration, points, answers)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Invalid token', () => {
      expect(requestQuestionCreate(author.token + 1, quiz.quizId, question, duration, points, answers)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('User does not own quiz', () => {
      requestAuthLogout(author.token);

      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      requestAuthLogin('ccc@ddd.com', '12345abcde');
      expect(requestQuestionCreate(author2.token, quiz.quizId, question, duration, points, answers)).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing: Successful Cases', () => {
    test('Successfully creates a question', () => {
      const question1: { questionId: number } = requestQuestionCreate(author.token, quiz.quizId, question, duration, points, answers);
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
            points: 1,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer 1',
                colour: 'red',
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Answer 2',
                colour: 'red',
                correct: false
              }
            ]
          }
        ]
      });
    });

    test('Successfully creates multiple questions', () => {
      const question1: {questionId: number} = requestQuestionCreate(author.token, quiz.quizId, question, duration, points, answers);

      const question2Name = 'Question 2';
      const duration2 = 2;
      const points2 = 2;
      const question2: {questionId: number} = requestQuestionCreate(author.token, quiz.quizId, question2Name, duration2, points2, answers);

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
            points: 1,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer 1',
                colour: 'red',
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Answer 2',
                colour: 'red',
                correct: false
              }
            ]
          },
          {
            questionId: question2.questionId,
            question: 'Question 2',
            duration: 2,
            points: 2,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer 1',
                colour: 'red',
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Answer 2',
                colour: 'red',
                correct: false
              }
            ]
          }
        ]
      });
    });

    test('Successfully creates questions with another user', () => {
      requestAuthLogout(author.token);

      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      requestAuthLogin('ccc@ddd.com', '12345abcde');

      const quiz2: {quizId: number} = requestQuizCreate(author2.token, 'Quiz 2', 'Quiz 2 Des');

      const question1: {questionId: number} = requestQuestionCreate(author2.token, quiz2.quizId, question, duration, points, answers);

      const question2Name = 'Question 2';
      const duration2 = 2;
      const points2 = 2;
      const question2: {questionId: number} = requestQuestionCreate(author2.token, quiz2.quizId, question2Name, duration2, points2, answers);

      expect(requestQuizInfo(author2.token, quiz2.quizId)).toStrictEqual({
        quizId: quiz2.quizId,
        name: 'Quiz 2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz 1 Des',
        numQuestions: 2,
        questions: [
          {
            questionId: question1.questionId,
            question: 'Question',
            duration: 1,
            points: 1,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer 1',
                colour: 'red',
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Answer 2',
                colour: 'red',
                correct: false
              }
            ]
          },
          {
            questionId: question2.questionId,
            question: 'Question',
            duration: 2,
            points: 2,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer 1',
                colour: 'red',
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Answer 2',
                colour: 'red',
                correct: false
              }
            ]
          }
        ]
      });
    });
  });
});

/// /////////////////      Testing for Removing Question     ////////////////////

describe('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid}', () => {
  let author: {token: string}, quiz: {quizId: number}, question1: {questionId: number}, answers: Answer[];
  beforeEach(() => {
    author = requestRegisterAuth('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    requestAuthLogin('aaa@bbb.com', 'abcde12345');
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

    question1 = requestQuestionCreate(author.token, quiz.quizId, 'Question 1', 5, 5, answers);
  });

  describe('Testing: Error cases', () => {
    test('Question ID is not valid in this quiz', () => {
      expect(requestQuestionDelete(author.token, quiz.quizId, question1.questionId + 1)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Token is invalid', () => {
      expect(requestQuestionDelete(author.token + 1, quiz.quizId, question1.questionId)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('Valid token, but quizID is invalid', () => {
      expect(requestQuestionDelete(author.token, quiz.quizId + 1, question1.questionId)).toStrictEqual(makeCustomErrorForTest(403));
    });

    test('Valid token, but user does not own quiz', () => {
      requestAuthLogout(author.token);
      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      requestAuthLogin('ccc@ddd.com', '12345abcde');
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
        duration: 0
      });
    });

    test('Deletes two questions', () => {
      const question2: {questionId: number} = requestQuestionCreate(author.token, quiz.quizId, 'Question 2', 5, 5, answers);
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
            points: 5,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer 1',
                colour: 'red',
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Answer 2',
                colour: 'red',
                correct: false
              }
            ]
          }
        ],
        duration: 5
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
        duration: 0
      });
    });
  });
});
*/

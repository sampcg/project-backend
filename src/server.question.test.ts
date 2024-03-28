import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

const makeCustomErrorForTest = (status: number) => ({ status, error: expect.any(String) });

interface AnswerInput {
  answer: string;
  correct: boolean;
}

interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerInput[];
}

interface CreateQuestionBody {
  token: string;
  questionBody: QuestionBody;
}

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

const requestAuthLogout = (token: string) => {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
};

const requestQuizCreate = (token: string, name: string, description: string) => {
  return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
};

const requestQuizInfo = (token: string, quizId: number) => {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token, quizId });
};

const requestQuestionCreate = (quizId: number, body: CreateQuestionBody) => {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`, { quizId, body });
};

const requestQuestionDelete = (token: string, quizId: number, questionId: number) => {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token, quizId, questionId });
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
  let question: string, duration: number, points: number, answers: AnswerInput[];
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
  });

  describe('Testing: Error cases', () => {
    test('Name less than 5 characters', () => {
      const shortQuestion = 'a';
      const questionBody: QuestionBody = { question: shortQuestion, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Name greater than 50 characters', () => {
      const longQuestion = '123456789 123456789 123456789 123456789 123456789 123456789';
      const questionBody: QuestionBody = { question: longQuestion, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Less than 2 answers', () => {
      const oneAnswer: AnswerInput[] =
          [{
            answer: 'Answer',
            correct: true
          }];
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: oneAnswer };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
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
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: sevenAnswers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };

      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Duration is negative', () => {
      const negativeDuration = -1;
      const questionBody: QuestionBody = { question: question, duration: negativeDuration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Points less than 1', () => {
      const smallPoints = 0;
      const questionBody: QuestionBody = { question: question, duration: duration, points: smallPoints, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Points greater than 10', () => {
      const largePoints = 11;
      const questionBody: QuestionBody = { question: question, duration: duration, points: largePoints, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
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
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: shortAnswer };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
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

      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: longAnswer };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
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
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: noCorrectAnswers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
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
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: duplicateAnswers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Quiz duration is greater than 3 minutes', () => {
      const longDuration = 100;
      const questionBody: QuestionBody = { question: question, duration: longDuration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      requestQuestionCreate(quiz.quizId, testBody);
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(400));
    });

    test('Invalid token', () => {
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token + 1, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(401));
    });

    test('User does not own quiz', () => {
      requestAuthLogout(author.token);

      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author2.token, questionBody: questionBody };
      expect(requestQuestionCreate(quiz.quizId, testBody)).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing: Successful Cases', () => {
    test('Successfully creates a question', () => {
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      const question1: { questionId: number } = requestQuestionCreate(quiz.quizId, testBody);

      expect(question1.questionId).toStrictEqual(expect.any(Number));
      /*
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
          ]
        });
        */
    });

    test('Successfully creates multiple questions', () => {
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      const question1: {questionId: number} = requestQuestionCreate(quiz.quizId, testBody);

      expect(question1.questionId).toStrictEqual(expect.any(Number));

      const question2Name = 'Question 2';
      const duration2 = 2;
      const points2 = 2;
      const questionBody2: QuestionBody = { question: question2Name, duration: duration2, points: points2, answers: answers };
      const testBody2: CreateQuestionBody = { token: author.token, questionBody: questionBody2 };
      const question2: {questionId: number} = requestQuestionCreate(quiz.quizId, testBody2);

      expect(question2.questionId).toStrictEqual(expect.any(Number));
      expect(question1.questionId).not.toStrictEqual(question2.questionId);

      /*
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
          ]
        });
        */
    });

    test('Successfully creates questions with another user', () => {
      requestAuthLogout(author.token);

      const author2: {token: string} = requestRegisterAuth('ccc@ddd.com', '12345abcde', 'John', 'Doe');

      const quiz2: {quizId: number} = requestQuizCreate(author2.token, 'Quiz 2', 'Quiz 2 Des');

      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author2.token, questionBody: questionBody };
      const question1: {questionId: number} = requestQuestionCreate(quiz2.quizId, testBody);
      expect(question1.questionId).toStrictEqual(expect.any(Number));

      const question2Name = 'Question 2';
      const duration2 = 2;
      const points2 = 2;

      const questionBody2: QuestionBody = { question: question2Name, duration: duration2, points: points2, answers: answers };
      const testBody2: CreateQuestionBody = { token: author2.token, questionBody: questionBody2 };

      const question2: {questionId: number} = requestQuestionCreate(quiz2.quizId, testBody2);
      expect(question2.questionId).toStrictEqual(expect.any(Number));

      expect(question1.questionId).not.toStrictEqual(question2.questionId);

      /*
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
              question: 'Question',
              duration: 2,
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
          ]
        });
        */
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
    const questionBody: QuestionBody = {question: 'Question 1', duration: 5, points: 5, answers: answers};
    const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody }
    question1 = requestQuestionCreate(quiz.quizId, testBody);
  });

  describe('Testing: Error cases', () => {
    test('Question ID is not valid in this quiz', () => {
      console.log('question 1: ' + question1);
      const myQuestionId = question1.questionId + 1; 
      console.log('question1.questionId' + myQuestionId);
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
      expect(requestQuestionDelete(author2.token, quiz.quizId, question1.questionId)).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing: Success cases', () => {
    test('Deletes one question', () => {
      expect(requestQuestionDelete(author.token, quiz.quizId, question1.questionId)).toStrictEqual({});
      /*
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
      */
    });

    test('Deletes two questions', () => {
      const questionBody2: QuestionBody = {question: 'Question 2', duration: 5, points: 5, answers: answers};
      const testBody2: CreateQuestionBody = {token: author.token, questionBody: questionBody2}
      const question2: {questionId: number} = requestQuestionCreate(quiz.quizId, testBody2);
      requestQuestionDelete(author.token, quiz.quizId, question1.questionId);
      expect(requestQuestionDelete(author.token, quiz.quizId, question1.questionId)).toStrictEqual({});
      /*
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
        duration: 5
      });
      */

      requestQuestionDelete(author.token, quiz.quizId, question2.questionId);
      expect(requestQuestionDelete(author.token, quiz.quizId, question2.questionId)).toStrictEqual({});
      /*
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
      */
    });
  });
});


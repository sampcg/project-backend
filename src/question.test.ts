import { clear } from './other';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminAuthLogout,
  // adminUserDetailsUpdate,
  // adminUserPasswordUpdate
} from './auth';

import {
  adminQuizCreate,
  adminQuizList,
  adminQuizRemove,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizNameUpdate
} from './quiz';

import {
  adminQuestionCreate,
  adminQuestionUpdate
} from './question';

beforeEach(() => {
  clear();
});

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

const ERROR = { error: expect.any(String) }

/// //////////////////           Update a Question           /////////////////////
describe('PUT /v1/admin/quiz/{quizid}/question/{questionid}', () => {
  //Declare Variables
  let author: {token: string}, quiz: {quizId: number}, question1: {questionId: number}, quizUpdate: {quizId: number};
  let question: string, duration: number, points: number, answers: AnswerInput[];

  // Before each test, creates a test linked to a user
  beforeEach(() => {
    let author = adminAuthRegister('aaa@bbb.com', 'abcde12345', 'Michael', 'Hourn');
    let quiz = adminQuizCreate(author.token, 'Quiz 1', 'Quiz 1 Des');
    answers =
        [{
          answer: 'Answer 1',
          correct: true
        },
        {
          answer: 'Answer 2',
          correct: false
        }];
    
  const questionBody: QuestionBody = {
    question: 'Question 1',
    duration: 5,
    points: 5,
    answers: [
      { answer: 'Answer 1', correct: true },
      { answer: 'Answer 2', correct: false }
    ]
  };
    const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
    const question1 = adminQuestionCreate(quiz.quizId, testBody);
  });


  describe('Testing Error Cases', () => {
    test('QuestionId is invalid', () => {
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId + 1, testBody)).toStrictEqual(Error);
    });
    

    test('Name less than 5 characters', () => {
      const shortQuestion = 'a';
      const questionBody: QuestionBody = { question: shortQuestion, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      console.log(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody));
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(ERROR);
    });

    test('Name greater than 50 characters', () => {
      const longQuestion = '123456789 123456789 123456789 123456789 123456789 123456789';
      const questionBody: QuestionBody = { question: longQuestion, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(ERROR);
    });

    test('Less than 2 answers', () => {
      const oneAnswer: AnswerInput[] =
          [{
            answer: 'Answer',
            correct: true
          }];
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: oneAnswer };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(ERROR);
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

      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(ERROR);
    });

    test('Duration is negative', () => {
      const negativeDuration = -1;
      const questionBody: QuestionBody = { question: question, duration: negativeDuration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(Error);
    });

    test('Points less than 1', () => {
      const smallPoints = 0;
      const questionBody: QuestionBody = { question: question, duration: duration, points: smallPoints, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(Error);
    });

    test('Points greater than 10', () => {
      const largePoints = 11;
      const questionBody: QuestionBody = { question: question, duration: duration, points: largePoints, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(Error);
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
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(Error);
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
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(Error);
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
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(Error);
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
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(Error);
    });

    test('Quiz duration is greater than 3 minutes', () => {
      const longDuration = 100;
      const questionBody: QuestionBody = { question: question, duration: longDuration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      adminQuestionCreate(quiz.quizId, testBody);
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(Error);
    });

    test('Invalid token', () => {
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token + 1, questionBody: questionBody };
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(Error);
    });

  
    test('QuizID is invalid', () => {
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      expect(adminQuestionUpdate(quiz.quizId + 1, question1.questionId, testBody)).toStrictEqual(Error);
    });

    test('User does not own quiz', () => {
      adminAuthLogout(author.token);

      const author2: {token: string} = adminAuthRegister('ccc@ddd.com', '12345abcde', 'John', 'Doe');
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author2.token, questionBody: questionBody };
      expect(adminQuestionUpdate(quiz.quizId, question1.questionId, testBody)).toStrictEqual(makeCustomErrorForTest(403));
    });
  });

  describe('Testing Success Cases', () => {
    test('Successfully updates a question', () => {
      const questionBody: QuestionBody = { question: question, duration: duration, points: points, answers: answers };
      const testBody: CreateQuestionBody = { token: author.token, questionBody: questionBody };
      const question2: { questionId: number } = adminQuestionUpdate(quiz.quizId, question1.questionId, testBody);

      expect(question2.questionId).toStrictEqual(expect.any(Number));
    }); 
  });
});



import { getData, setData } from './dataStore';
import { getUser, decodeToken, getRandomColour } from './helpers';
import { ErrorObject, Question, Answer, EmptyObject } from './returnInterfaces';
import { DataStore } from './dataInterfaces';
import HTTPError from 'http-errors';

/// //////////////////           Create a Question           /////////////////////

interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerInput[];
  thumbnailUrl: string;
}

interface AnswerInput {
  answer: string;
  correct: boolean;
}

interface AdminQuestionCreateReturn {
    questionId: number;
}

export const adminQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody): AdminQuestionCreateReturn | ErrorObject => {
  const { question, duration, points, answers, thumbnailUrl } = questionBody;

  const data: DataStore = getData();
  // Check to see if token structure is valid and decode it
  const originalToken = decodeToken(token);
  if (!originalToken) {
    throw HTTPError(401, 'Invalid Token');
  }
  // Check to see if sessionId is valid
  const sessionExists = data.token.find((session) => originalToken.sessionId === session.sessionId);
  if (!sessionExists) {
    throw HTTPError(401, 'Invalid SesssionID');
  }
  // Check to see if userID is valid
  if (!getUser(originalToken.userId)) {
    throw HTTPError(401, 'Invalid UserID');
  }

  // Validate quizID and ownership
  // findIndex will return -1 if not found or userID doesn't match, quizIndex used to refer to quiz later
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === originalToken.userId);
  if (quizIndex === -1) {
    throw HTTPError(403, 'Invalid quizID');
  }

  // Check if question is < 5 or > 50 characters
  if (question.length < 5 || question.length > 50) {
    throw HTTPError(400, 'Question must be between 5 and 50 characters');
  }

  // Check if question has < 2 or > 6 answers
  if (answers.length < 2 || answers.length > 6) {
    throw HTTPError(400, 'There must be between 2 and 6 answers');
  }

  // Check if question duration is not a positive number
  if (duration < 1) {
    throw HTTPError(400, 'Duration must be 1 or greater');
  }

  // Check if sum of question duration > 3 minutes
  // Take sum of all question duration using reduce
  const totalExistingQuizDuration = data.quizzes[quizIndex].questions.reduce((total, question) => total + question.duration, 0);
  // Now add current question duration to total to see if it exceeds 180 seconds
  const totalQuizDuration: number = totalExistingQuizDuration + duration;
  if (totalQuizDuration > 180) {
    throw HTTPError(400, 'Duration of quiz cannot exceed 3 minutes');
  }

  // Check if points for question is < 1 or > 10
  if (points < 1 || points > 10) {
    throw HTTPError(400, 'Question must have between 1 or 10 points');
  }

  // Check if answer is < 1 or > 30 characters
  for (const answer of answers) {
    if (answer.answer.length < 1 || answer.answer.length > 30) {
      throw HTTPError(400, 'Answes must be between 1 and 30 characters');
    }
  }

  // Answer strings are duplicates of one another in same question
  // Map to another array we can work with
  const answerStrings = answers.map(answer => answer.answer);

  // Check to see if any answers match one another
  const isDuplicateAnswer = answerStrings.some((answer, index) => answerStrings.indexOf(answer) !== index);
  if (isDuplicateAnswer) {
    throw HTTPError(400, 'Answers must be unique');
  }

  // There are no correct answer
  const correctAnswers = answers.filter(answer => answer.correct);
  if (correctAnswers.length === 0) {
    throw HTTPError(400, 'There must be at least one correct answer');
  }

  // thumbnailUrl doesn't end with 'jpg', 'jpeg', 'png' (case insensitive)
  const thumbnailUrlCase = thumbnailUrl.toLowerCase();
  if (!thumbnailUrlCase.endsWith('jpg') && !thumbnailUrlCase.endsWith('jpeg') && !thumbnailUrlCase.endsWith('png')) {
    throw HTTPError(400, "thumbnailUrl must be 'jpg', 'jpeg' or 'png'");
  }

  // thumbnailUrl doesn't begin with 'http://' or 'https://'
  if (!thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
    throw HTTPError(400, "thumbnailUrl must begin with 'http://' or 'https://'");
  }

  // Create new answer array
  // Generate answerID by indexing in question
  const newAnswers: Answer[] = answers.map((answer, index) => ({
    answerId: index + 1,
    answer: answer.answer,
    correct: answer.correct,
    colour: getRandomColour()
  }));

  // Create a unique questionId
  const newQuestionId: number = data.quizzes[quizIndex].questions.length + 1;

  // Create and set data
  const newQuestion: Question = {
    questionId: newQuestionId,
    question: question,
    duration: duration,
    points: points,
    answers: newAnswers,
    thumbnailURL: thumbnailUrl,
    position: data.quizzes[quizIndex].questions.length
  };

  // Push question to quiz
  data.quizzes[quizIndex].questions.push(newQuestion);

  // Update total duration of quiz
  data.quizzes[quizIndex].duration = totalQuizDuration;

  // Update time last edited of quiz
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

  // set data to dataStore
  setData(data);

  // Return questionId
  return { questionId: newQuestion.questionId };
};

/// //////////////////           Update a Question           /////////////////////
export const adminQuestionUpdate = (token: string, quizId: number, questionId: number, questionBody: QuestionBody): EmptyObject | ErrorObject => {
  const { question, duration, points, answers } = questionBody;
  const data: DataStore = getData();

  // Check if token is valid
  const originalToken = decodeToken(token);
  if (!originalToken) {
    return { error: 'Invalid token', code: 401 };
  }
  if (!getUser(originalToken.userId)) {
    return { error: 'Invalid token', code: 401 };
  }

  // Validate quiz ID and ownership
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === originalToken.userId);
  if (quizIndex === -1) {
    return { error: 'Invalid quizID', code: 403 };
  }

  // Find the question within the quiz
  const quiz = data.quizzes[quizIndex];
  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === -1) {
    return { error: 'Invalid questionID', code: 400 };
  }

  const existingQuestion = quiz.questions[questionIndex];

  // Check if question string length is valid
  if (question.length < 5 || question.length > 50) {
    return { error: 'Question must be between 5 and 50 characters', code: 400 };
  }

  // Check if number of answers is valid
  if (answers.length < 2 || answers.length > 6) {
    return { error: 'There must be between 2 and 6 answers', code: 400 };
  }

  // Check if question duration is valid
  if (duration < 1) {
    return { error: 'Duration must be 1 or greater', code: 400 };
  }

  // Calculate total quiz duration after updating question
  const totalExistingQuizDuration = quiz.questions.reduce((total, q) => total + q.duration, 0);
  const totalQuizDuration = totalExistingQuizDuration - existingQuestion.duration + duration;

  // Check if total quiz duration exceeds 180 seconds
  if (totalQuizDuration > 180) {
    return { error: 'Duration of quiz cannot exceed 3 minutes', code: 400 };
  }

  // Check if points for question is valid
  if (points < 1 || points > 10) {
    return { error: 'Question must have between 1 or 10 points', code: 400 };
  }

  // Check if answers are valid
  for (const answer of answers) {
    if (answer.answer.length < 1 || answer.answer.length > 30) {
      return { error: 'Answers must be between 1 and 30 characters', code: 400 };
    }
  }

  // Check for duplicate answers
  const answerStrings = answers.map(answer => answer.answer);
  const isDuplicateAnswer = answerStrings.some((answer, index) => answerStrings.indexOf(answer) !== index);
  if (isDuplicateAnswer) {
    return { error: 'Answers must be unique', code: 400 };
  }

  // Check if there is at least one correct answer
  const correctAnswers = answers.filter(answer => answer.correct);
  if (correctAnswers.length === 0) {
    return { error: 'There must be at least one correct answer', code: 400 };
  }

  // Update answerID
  /*
  const newAnswers: Answer[] = answers.map((answer, index) => ({
    answerId: index,
    answer: answer.answer,
    correct: answer.correct,
    colour: getRandomColour()
  }));
  */

  // Update existing question
  existingQuestion.question = question;
  existingQuestion.duration = duration;
  existingQuestion.points = points;
  existingQuestion.answers = answers.map((answer, index) => ({
    answerId: index + 1,
    answer: answer.answer,
    correct: answer.correct,
    colour: getRandomColour()
  }));

  // Update total duration of quiz
  quiz.duration = totalQuizDuration;

  // Update time last edited of quiz
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  // Set data to dataStore
  setData(data);

  // Return success
  return {};
};

/// //////////////////           Delete a Question           /////////////////////
export const adminQuestionRemove = (token: string, quizId: number, questionId: number): EmptyObject | ErrorObject => {
  const data = getData();
  // Check to see if token structure is valid and decode it
  const originalToken = decodeToken(token);
  if (!originalToken) {
    throw HTTPError(401, 'Invalid Token');
  }
  // Check to see if sessionId is valid
  const sessionExists = data.token.find((session) => originalToken.sessionId === session.sessionId);
  if (!sessionExists) {
    throw HTTPError(401, 'Invalid SesssionID');
  }
  // Check to see if userID is valid
  if (!getUser(originalToken.userId)) {
    throw HTTPError(401, 'Invalid UserID');
  }

  // Validate quiz ID and ownership
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw HTTPError(403, 'Invalid QuizID');
  }
  if (quiz.userId !== originalToken.userId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  // Find the questionIndex within the quiz

  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === -1) {
    throw HTTPError(400, 'Invalid QuestionID');
  }

  // Update timeLastEdited, no. of questions and duration of the quiz
  quiz.timeLastEdited = Math.round(Date.now());
  quiz.numQuestions--;
  quiz.duration -= quiz.questions[questionIndex].duration;

  // Remove the question from the quiz
  quiz.questions.splice(questionIndex, 1);

  // Update the dataStore
  setData(data);
  return {};
};

/// //////////////////           Move a Question           /////////////////////
export const adminQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number): EmptyObject | ErrorObject => {
  const data: DataStore = getData();

  // Check if token is valid
  const originalToken = decodeToken(token);
  if (!originalToken) {
    return { error: 'Invalid token', code: 401 };
  }

  // Validate quiz ID and ownership
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === originalToken.userId);
  if (quizIndex === -1) {
    return { error: 'Invalid quizID', code: 403 };
  }

  // Find the question within the quiz
  const quiz = data.quizzes[quizIndex];
  const questionIndex = quiz.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex === -1) {
    return { error: 'Invalid questionID', code: 400 };
  }

  // Check if newPosition < 0 or >= numberOfQuestions
  const numQuestions = quiz.questions.length;
  if (newPosition < 0 || newPosition >= numQuestions) {
    return { error: 'Invalid newPosition: Number was too high or too low', code: 400 };
  }

  // Check if newPosition is the position of the current question
  if (newPosition === quiz.questions[questionIndex].position) {
    return { error: 'Invalid newPosition: newPosition is the position of the current question', code: 400 };
  }

  // Move the question to the new position
  const movedQuestion = quiz.questions.splice(questionIndex, 1)[0];
  movedQuestion.position = newPosition;
  quiz.questions.splice(newPosition, 0, movedQuestion);

  return {};
};

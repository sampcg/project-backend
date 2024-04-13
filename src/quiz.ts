
import { getData, setData } from './dataStore';
import { DataStore } from './dataInterfaces';
import { getUser, getQuiz, getTrash, decodeToken, validateTokenStructure, getUserByEmail } from './helpers';
import { ErrorObject, EmptyObject, Quiz, QuizInfo, Question } from './returnInterfaces';
import HTTPError from 'http-errors';

// Error return type

/// //////////////////           List all Quizzes           /////////////////////

/**
 * Provides a list of all quizzed owned by the currently logged in user
 * @returns {quizzes: {quizId: number, name: string}} - information on quizzes
 */

// AdminQuizList return type
interface BriefQuizDetails {
    quizId: number;
    name: string;
}

interface AdminQuizListReturn {
    quizzes: BriefQuizDetails[];
}

// Feature
export const adminQuizList = (token: string): AdminQuizListReturn | ErrorObject => {
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

  // Creates array of quizzes to return
  const quizzes = [];

  // Pushes all quizzes with given user ID in data to array quizzes
  for (const quiz of data.quizzes) {
    if (quiz.userId === originalToken.userId) {
      quizzes.push({ quizId: quiz.quizId, name: quiz.name });
    }
  }

  // Returns object containing array of all quizzes owned by user
  return { quizzes: quizzes };
};

/// //////////////////            Create a Quiz             /////////////////////

/**
 * Creates a quiz for the logged in user given basic details
 * @param {number} token - unique identifier for session
 * @param {string} name - name for the quiz
 * @param {string} description - description of the quiz
 * @returns {{quizId: number}} - quizId
 */

// AdminQuizCreate return type
interface AdminQuizCreateReturn {
    quizId: number;
}

// Feature
export const adminQuizCreate = (token: string, name: string, description: string): AdminQuizCreateReturn | ErrorObject => {
  const data: DataStore = getData();

  // Check to see if token structure is valid and decode it
  const originalToken = decodeToken(token);
  if (!originalToken) {
    throw HTTPError(401, 'Invalid Token');
  }
  // Check to see if sessionId is valid
  const sessionExists = data.token.find((session) => originalToken.sessionId === session.sessionId);
  if (!sessionExists) {
    throw HTTPError(401, 'Invalid SessionID');
  }
  // Check to see if userID is valid
  if (!getUser(originalToken.userId)) {
    throw HTTPError(401, 'Invalid UserID');
  }

  // Check if name contains invalid characters
  const validName: boolean = /^[a-zA-Z0-9\s]*$/.test(name);
  if (!validName) {
    throw HTTPError(400, 'Name contains invalid characters');
  }

  // Check if name is less than 3 characters or greater than 30
  if (name.length < 3 || name.length > 30) {
    throw HTTPError(400, 'Name must be between 3 and 30 characters');
  }

  // Check if name there is already a quiz by that name
  // makes sure case doesn't impact check
  const nameExists: boolean = data.quizzes.some(quiz => quiz.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    throw HTTPError(400, 'Name already exists');
  }

  // Check the length of the description
  if (description.length > 100) {
    throw HTTPError(400, 'Description must be 100 characters or less');
  }

  // Generate a unique random quiz ID
  let newQuizId: number = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (getQuiz(newQuizId) || getTrash(newQuizId)) {
    newQuizId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  // Create an empty array for questions
  const questions: Question[] = [];

  // Grab the time
  const time: number = Math.round(Date.now() / 1000);

  // Create parameters for new quiz
  const newQuiz: Quiz = {
    quizId: newQuizId,
    userId: originalToken.userId,
    name: name,
    timeCreated: time,
    timeLastEdited: time,
    description: description,
    numQuestions: 0,
    questions: questions,
    duration: 0,
    thumbnailUrl: ''
  };

  // Add quiz to data
  data.quizzes.push(newQuiz);
  setData(data);

  setData(data);

  // Return quizId
  return {
    quizId: newQuizId
  };
};

/// //////////////////            Remove a Quiz             /////////////////////

/**
 * Removes a quiz given author and quiz IDs
 * @param {number} authUserId - unique identifer for the user
 * @param {number} quizId - unique identifier for quiz
 * @returns { } - empty object
 */

// Feature
export const adminQuizRemove = (token: string, quizId: number): EmptyObject | ErrorObject => {
  const data: DataStore = getData();

  // Check to see if token structure is valid and decode it
  const originalToken = decodeToken(token);
  if (!originalToken) {
    throw HTTPError(401, 'Invalid Token');
  }
  // Check to see if sessionId is valid
  const sessionExists = data.token.find((session) => originalToken.sessionId === session.sessionId);
  if (!sessionExists) {
    throw HTTPError(401, 'Invalid SessionID');
  }
  // Check to see if userID is valid
  if (!getUser(originalToken.userId)) {
    throw HTTPError(401, 'Invalid UserID');
  }

  // Check if quizId is valid
  const quizExists = data.quizzes.some(quiz => quiz.quizId === quizId);
  if (!quizExists) {
    throw HTTPError(403, 'Invalid QuizID');
  }

  // Check if owner owns quiz
  const findQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (findQuiz.userId !== originalToken.userId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  // This will need to also have an error check for active session

  // Create object trashQuiz that contains all data in quiz + updates time last edited
  const trashQuiz: Quiz = {
    userId: findQuiz.userId,
    quizId: findQuiz.quizId,
    name: findQuiz.name,
    timeCreated: findQuiz.timeCreated,
    timeLastEdited: Math.round(Date.now() / 1000),
    description: findQuiz.description,
    numQuestions: findQuiz.numQuestions,
    questions: findQuiz.questions,
    duration: findQuiz.duration,
    thumbnailUrl: findQuiz.thumbnailUrl
  };

  // Add quiz to trash object
  data.trash.push(trashQuiz);
  setData(data);

  // Remove quiz that has given quizId from quizzes
  data.quizzes = data.quizzes.filter(quiz => quiz.quizId !== findQuiz.quizId);

  // Set data
  setData(data);

  // Return empty object
  return {};
};

/// //////////////////        Update name of a Quiz         /////////////////////

/**
 * Updates the name of the relevant quiz
 * @param {string} token - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz
 * @param {string} name - updated name for relevant quiz
 * @returns {} an empty object
 */

export const adminQuizNameUpdate = (token: string, quizId: number, name: string): EmptyObject | ErrorObject => {
  const data: DataStore = getData();
  const originalToken = decodeToken(token);

  // Check to see if token is valid
  if (!originalToken) {
    return { error: 'Invalid token', code: 401 };
  }
  if (!getUser(originalToken.userId)) {
    return { error: 'Invalid token', code: 401 };
  }

  // Find the quiz by quizId
  // const quiz = getQuiz(quizId); // Use getQuiz function to retrieve the quiz object
  const quiz = data.quizzes.find((q) => quizId === q.quizId);
  if (!quiz) {
    return { error: 'Quiz ID does not refer to a valid quiz.', code: 403 };
  }

  // Check if the user owns the quiz
  if (quiz.userId !== originalToken.userId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.', code: 403 };
  }

  // Validate the name
  const validName = /^[a-zA-Z0-9\s]*$/.test(name);
  if (!validName) {
    return { error: 'Name contains invalid characters', code: 400 };
  }

  if (name.length < 3 || name.length > 30) {
    return { error: 'Name is either less than 3 characters long or more than 30 characters long.', code: 400 };
  }

  // Check if the name is already used by the current user for another quiz
  const quizWithSameName = data.quizzes.find(q => q.userId === originalToken.userId && q.quizId !== quizId && q.name === name);

  if (quizWithSameName) {
    return { error: 'Name is already used by the current logged in user for another quiz.', code: 400 };
  }

  quiz.timeLastEdited = Math.round(Date.now() / 1000);
  quiz.name = name;
  setData(data);
  return {};
};

// /// //////////////////     Update description of a Quiz     /////////////////////

/**
 * Updates the description of the relevant quiz
 * @param {string} token - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz
 * @param {string} description - updated name for relevant quiz
 * @returns {} an empty object
 */

export const adminQuizDescriptionUpdate = (token: string, quizId: number, description: string): EmptyObject | ErrorObject => {
  const data = getData();
  const originalToken = decodeToken(token);

  // Check if token is valid
  if (!originalToken) {
    return { error: 'Invalid token', code: 401 };
  }

  // Check if the token corresponds to a valid user
  const user = getUser(originalToken.userId);
  if (!user) {
    return { error: 'Invalid token', code: 401 };
  }

  // Check if quizId is valid
  // const quiz = getQuiz(quizId);
  const quiz = data.quizzes.find((q) => quizId === q.quizId);
  if (!quiz) {
    return { error: 'Quiz ID does not refer to a valid quiz.', code: 403 };
  }

  // Check if user owns the quiz
  if (quiz.userId !== originalToken.userId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.', code: 403 };
  }

  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length.', code: 400 };
  }

  // Update the description of the quiz
  quiz.description = description;

  // Update the last edited time
  quiz.timeLastEdited = Math.round(Date.now() / 1000);

  // Save the updated data
  setData(data);

  // Return empty object
  return {};
};

// /// //////////////////       Show all info of a Quiz        /////////////////////
/**
 * Program to get all of the relevant information about the current quiz
 * @param {string} token - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz
 * @returns {quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}
 */

// Feature
export const adminQuizInfo = (token: string, quizId: number): QuizInfo | ErrorObject => {
  const originalToken = decodeToken(token);

  // Check to see if token is valid
  if (!originalToken) {
    return { error: 'Invalid token', code: 401 };
  }
  if (!getUser(originalToken.userId)) {
    return { error: 'Invalid token', code: 401 };
  }

  // Find the quiz by quizId
  const quiz = getQuiz(quizId); // Use getQuiz function to retrieve the quiz object
  if (!quiz) {
    return { error: 'Quiz ID does not refer to a valid quiz.', code: 403 };
  }

  // Check if the user owns the quiz
  if (quiz.userId !== originalToken.userId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.', code: 403 };
  }

  const questionsInfo = quiz.questions.map(({ position, ...rest }) => rest);

  const adminQuizInfoReturn: QuizInfo = {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: Math.round(Date.now() / 1000),
    description: quiz.description,
    numQuestions: quiz.questions.length,
    questions: questionsInfo,
    duration: quiz.duration
  };

  return adminQuizInfoReturn;
};

export interface AdminQuizTransfer {
  token: string;
  userEmail: string;
}

/**
* <Transfers a quiz to another user>
*
* @param {string} token
* @param {number} quizId
* @param {string} userEmail
* @returns {token: string, userEmail: string,}
**/
export const adminQuizTransfer = (quizId: number, token: string, userEmail: string): EmptyObject | ErrorObject => {
  const data = getData();
  const originalToken = decodeToken(token);
  validateTokenStructure(token);
  if (!originalToken) {
    return { error: 'Token is empty or invalid', code: 401 };
  }
  if (!getUser(originalToken.userId)) {
    return { error: 'User with the provided token does not exist', code: 401 };
  }
  const user = data.users.find((user) => originalToken.userId === user.userId);
  const quiz = data.quizzes.find((q) => quizId === q.quizId);
  // Check for valid quiz
  if (!quiz) {
    return { error: 'Quiz ID does not refer to a valid quiz!', code: 400 };
  }
  // quiz does not refers to the user
  if (quiz.userId !== originalToken.userId) {
    return { error: 'You do not own this quiz!', code: 403 };
  }
  // Check if userEmail is a real user
  if (!getUserByEmail(userEmail)) {
    return { error: 'User is not a real user!', code: 400 };
  }
  // userEmail is the current logged in user
  if (user.email === userEmail) {
    return { error: 'User email cannot be the current logged in user!', code: 400 };
  }
  // Quiz ID refers to a quiz that has a name that is already used by the target user
  const targetUserId = getUserByEmail(userEmail).userId;
  const targetQuiz = data.quizzes.some((quiz) => targetUserId === quiz.userId);
  if (targetQuiz) {
    return { error: 'Quiz ID refers to a quiz that has a name that is already used by the target user', code: 400 };
  }
  quiz.timeLastEdited = Date.now();

  setData(data);

  return {};
};

import { getData } from './dataStore';
import { DataStore } from './dataInterfaces';
import { getQuiz, getTrash } from './helpers';
import { ErrorObject, Question } from './returnInterfaces';

// Error return type

/// //////////////////           List all Quizzes           /////////////////////

// /**
//  * Provides a list of all quizzed owned by the currently logged in user
//  * @returns {quizzes: {quizId: number, name: string}} - information on quizzes
//  */

// // AdminQuizList return type
// interface BriefQuizDetails {
//     quizId: number;
//     name: string;
// }

// interface AdminQuizListReturn {
//     quizzes: BriefQuizDetails[];
// }

// // Feature
// export const adminQuizList = (authUserId: number): AdminQuizListReturn | ErrorObject => {
//   const data = getData();

//   // Check if userId is valid
//   if (!getUser(authUserId)) {
//     return { error: 'AuthUserId is not a valid user' };
//   }

//   // Creates array of quizzes to return
//   const quizzes = [];

//   // Pushes all quizzes with given user ID in data to array quizzes
//   for (const quiz of data.quizzes) {
//     if (quiz.userId === authUserId) {
//       quizzes.push({ quizId: quiz.quizId, name: quiz.name });
//     }
//   }

//   // Returns object containing array of all quizzes owned by user
//   return { quizzes: quizzes };
// };

// /// //////////////////            Create a Quiz             /////////////////////

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
  const user = data.users.find((user) => token === user.token);

  if (!user) {
    return { error: 'Invalid token', code: 401 };
  }

  const authUserId: number = user.userId;

  // Check if name contains invalid characters
  const validName: boolean = /^[a-zA-Z0-9\s]*$/.test(name);
  if (!validName) {
    return { error: 'Name contains invalid characters', code: 400 };
  }

  // Check if name is less than 3 characters or greater than 30
  if (name.length < 3 || name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters', code: 400 };
  }

  // Check if name there is already a quiz by that name
  // makes sure case doesn't impact check
  const nameExists: boolean = data.quizzes.some(quiz => quiz.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    return { error: 'invalid input', code: 400 };
  }

  // Check the length of the description
  if (description.length > 100) {
    return { error: 'Description must be 100 characters or less', code: 400 };
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
  const newQuiz = {
    quizId: newQuizId,
    userId: authUserId,
    name: name,
    description: description,
    timeCreated: time,
    timeLastEdited: time,
    numQuestions: 0,
    questions: questions,
    duration: 0
  };

  // Add quiz to data
  data.quizzes.push(newQuiz);

  // Return quizId
  return {
    quizId: newQuizId
  };
};

// /// //////////////////            Remove a Quiz             /////////////////////

// /**
//  * Removes a quiz given author and quiz IDs
//  * @param {number} authUserId - unique identifer for the user
//  * @param {number} quizId - unique identifier for quiz
//  * @returns { } - empty object
//  */

// // Feature
// export const adminQuizRemove = (authUserId: number, quizId: number): EmptyObject | ErrorObject => {
//   const data = getData();

//   // Check if user is valid
//   if (!getUser(authUserId)) {
//     return { error: 'AuthUserId is not a valid user' };
//   }

//   // Check if quizId is valid
//   const quizExists = data.quizzes.some(quiz => quiz.quizId === quizId);
//   if (!quizExists) {
//     return { error: 'Invalid quiz ID' };
//   }

//   // Check if owner owns quiz
//   const findQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
//   if (findQuiz.userId !== authUserId) {
//     return { error: 'User does not own this quiz' };
//   }

//   // Remove quiz that has given quizId
//   data.quizzes = data.quizzes.filter(quiz => quiz.quizId !== quizId);

//   // Return empty object
//   return {};
// };

// /// //////////////////        Update name of a Quiz         /////////////////////

// /**
//  * Updates the name of the relevant quiz
//  * @param {number} authUserId - unique identifier for an authorated user
//  * @param {number} quizId - unique identifier for quiz
//  * @param {string} name - updated name for relevant quiz
//  * @returns {} an empty object
//  */

// // Feature
// export const adminQuizNameUpdate = (authUserId: number, quizId: number, name: string): EmptyObject | ErrorObject => {
//   const data = getData();

//   // Find the user by authUserId
//   const user = data.users.find(user => user.userId === authUserId);
//   if (!user) {
//     return { error: 'AuthUserId is not a valid user.' };
//   }

//   // Find the quiz by quizId
//   const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
//   if (!quiz) {
//     return { error: 'Quiz ID does not refer to a valid quiz.' };
//   }

//   // Check if the user owns the quiz
//   if (quiz.userId !== authUserId) {
//     return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
//   }

//   // Validate the name
//   const validName = /^[a-zA-Z0-9\s]*$/.test(name);
//   if (!validName) {
//     return { error: 'Name contains invalid characters' };
//   }

//   if (name.length < 3 || name.length > 30) {
//     return { error: 'Name is either less than 3 characters long or more than 30 characters long.' };
//   }

//   // Check if the name is already used by the current user for another quiz
//   const quizWithSameName = data.quizzes.find(q => q.userId === authUserId && q.quizId !== quizId && q.name === name);

//   if (quizWithSameName) {
//     return { error: 'Name is already used by the current logged in user for another quiz.' };
//   }
//   quiz.timeLastEdited = Math.round(Date.now() / 1000);
//   quiz.name = name;
//   return {};
// };

// /// //////////////////     Update description of a Quiz     /////////////////////

// /**
//  * Updates the description of the relevant quiz
//  * @param {number} authUserId - unique identifier for an authorated user
//  * @param {number} quizId - unique identifier for quiz
//  * @param {string} description - updated name for relevant quiz
//  * @returns {} an empty object
//  */

// // Feature
// export const adminQuizDescriptionUpdate = (authUserId: number, quizId: number, description: string): EmptyObject | ErrorObject => {
//   const data = getData();

//   // Check if user is valid
//   const user = data.users.find(user => user.userId === authUserId);
//   if (!user) {
//     return { error: 'AuthUserId is not a valid user.' };
//   }

//   // Check if quizId is valid
//   const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
//   if (!quiz) {
//     return { error: 'Quiz ID does not refer to a valid quiz.' };
//   }

//   // Check if user owns the quiz
//   if (quiz.userId !== authUserId) {
//     return { error: 'User does not own this quiz' };
//   }

//   if (description.length > 100) {
//     return { error: 'Description is more than 100 characters in length.' };
//   }
//   // Update the description of the quiz
//   quiz.description = description;

//   // Update the last edited time
//   quiz.timeLastEdited = Math.round(Date.now() / 1000);

//   // Save the updated data
//   setData(data);
//   // Return empty object
//   return {};
// };

// /// //////////////////       Show all info of a Quiz        /////////////////////

// /**
//  * Program to get all of the relevant information about the current quiz
//  * @param {number} authUserId - unique identifier for an authorated user
//  * @param {number} quizId - unique identifier for quiz
//  * @returns {quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}
//  */

// // AdminQuizInfo return type
// interface AdminQuizInfoReturn {
//     quizId: number;
//     name: string;
//     description: string;
//     timeCreated: number;
//     timeLastEdited: number;
// }

// // Feature
// export const adminQuizInfo = (authUserId: number, quizId: number): AdminQuizInfoReturn | ErrorObject => {
//   const data = getData();

//   const user = data.users.find(user => user.userId === authUserId);

//   if (!user) {
//     return { error: 'AuthUserId is not a valid user.' };
//   }

//   const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
//   if (!quiz) {
//     return { error: 'Quiz ID does not refer to a valid quiz.' };
//   }

//   if (quiz.userId !== authUserId) {
//     return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
//   }

//   return {
//     quizId: quiz.quizId,
//     name: quiz.name,
//     timeCreated: quiz.timeCreated,
//     timeLastEdited: Math.round(Date.now() / 1000),
//     description: quiz.description
//   };
// };

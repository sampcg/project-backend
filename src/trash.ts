import { getData, setData } from './dataStore';
import { DataStore } from './dataInterfaces';
import { getUser, getTrash, decodeToken, isSessionValid } from './helpers';
import { ErrorObject, Quiz, EmptyObject } from './returnInterfaces';
import HTTPError from 'http-errors';

/// //////////////////           List all Quizzes in Trash          /////////////////////
/**
 * Provides a list of all quizzed owned by the currently logged in user
 * @returns {quizzes: {quizId: number, name: string}} - information on quizzes
 */

// AdminTrashList return type
interface BriefQuizDetails {
    quizId: number;
    name: string;
}

interface AdminTrashListReturn {
    quizzes: BriefQuizDetails[];
}

export const adminTrashList = (token: string): AdminTrashListReturn | ErrorObject => {
  const data = getData();

  // Check to see if token is valid
  const originalToken = decodeToken(token);
  if (!originalToken) {
    throw HTTPError(401, 'Invalid Token');
  }

  isSessionValid(data, originalToken);

  if (!getUser(originalToken.userId)) {
    throw HTTPError(401, 'Invalid UserID');
  }
  
  const trashedQuizzes = [];

  // Filter trashed quizzes owned by the user and push them to the array
  for (const quiz of data.trash) {
    if (quiz.userId === originalToken.userId) {
      trashedQuizzes.push({ quizId: quiz.quizId, name: quiz.name });
    }
  }

  // Returns object containing array of trashed quizzes owned by the user
  return { quizzes: trashedQuizzes };
};

/// //////////////////           Restores a quiz in the trash         /////////////////////
/**
 * Restores a quiz in trash owned by the currently logged in user
 * @returns {quizzes: {quizId: number, name: string}} - information on quizzes
 */


export const adminTrashRestore = (token: string, quizId: number): EmptyObject | ErrorObject => {
  const data: DataStore = getData();

  // Check to see if token is valid
  const originalToken = decodeToken(token);
  if (!originalToken) {
    throw HTTPError(401, 'Invalid Token');
  }

  // Check to see if userID is valid
  if (!getUser(originalToken.userId)) {
    throw HTTPError(401, 'Invalid UserID');
  }

  isSessionValid(data, originalToken);


  const trashQuiz = getTrash(quizId);
  if (!trashQuiz) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz in the trash');
  }

  // Check if the user owns the quiz in the trash
  if (trashQuiz.userId !== originalToken.userId) {
    throw HTTPError( 403, 'User does not own this quiz in the trash' );
  }

  // Add trashed quiz to quiz object
  data.quizzes.push(trashQuiz);
  setData(data);

  // Restore the quiz by removing it from the trash
  data.trash = data.trash.filter((quiz: Quiz) => quiz.quizId !== quizId);

  // Save the updated data
  setData(data);

  // Return an empty object to indicate success
  return {};
};

import { getData, setData } from './dataStore';
import { getUser, getQuiz, decodeToken, getRandomColour } from './helpers';
import { EmptyObject, ErrorObject, Quiz, Question, Answer } from './returnInterfaces';
import { DataStore } from './dataInterfaces';
import { Session } from 'inspector';
import HTTPError from 'http-errors';

interface SessionStartRequestBody {
  autoStartNum: number;
};

interface adminSessionViewReturn {
  activeSessions: string[];
  inactiveSessions: string[];
};

interface adminSessionStartReturn {
  sessionId: number;
};

/////////////////////   View Active and Inactive Sessions   ////////////////////
export const adminSessionView = (quizId: number, token: string): adminSessionViewReturn | ErrorObject => {
  const data: DataStore = getData();
  console.log(token);
  // Checking for invalid or empty token
  const originalToken = decodeToken(token);
  if (!originalToken) {
    return { error: 'Token is empty or invalid (does not refer to valid logged in user session)', code: 401 };
  }
  if (getUser(originalToken.userId) == undefined) {
    return { error: 'Token is empty or invalid (does not refer to valid logged in user session)', code: 401 };
  }

  // Validate quizID and ownership
  // findIndex will return -1 if not found or userID doesn't match, quizIndex used to refer to quiz later
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === originalToken.userId);
  if (quizIndex === -1) {
    return { error: 'Valid token is provided, but user is not an owner of this quiz', code: 403 };
  }

  const quiz = data.quizzes[quizIndex];
  const activeSessions: string[] = [];
  const inactiveSessions: string[] = [];

  // Check if data.session is defined before iterating over it
  if (data.session) {
    // Iterate over sessions to determine active/inactive
    data.session.forEach(session => {
      if (session.quizId === quizId && session.State !== 'active') {
        activeSessions.push(session.sessionId);
      } else if (session.quizId === quizId && session.State === 'inactive') {
        inactiveSessions.push(session.sessionId);
      }
    });
  }

  // Sort the session IDs in ascending order
  activeSessions.sort((a, b) => a.localeCompare(b));
  inactiveSessions.sort((a, b) => a.localeCompare(b));

  return { activeSessions, inactiveSessions };
};

//////////////////////////////   Start a Session   /////////////////////////////
export const adminSessionStart = (quizId: number, token: string, body: SessionStartRequestBody): adminSessionStartReturn | ErrorObject => {
  const data: DataStore = getData();
  const originalToken = decodeToken(token);

   // Check if token is valid
   if (!originalToken) {
     throw HTTPError(401, 'Invalid Token');
   }
   if (!getUser(originalToken.userId)) {
     throw HTTPError(401, 'Invalid UserID');
   }

   // Validate quiz ID and ownership
   const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === originalToken.userId);
   if (quizIndex === -1) {
    throw HTTPError(403, 'Invalid quizID');
   }

   if(body.autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum is greater than 50');
   }

  const activeSessionsCount = data.session.filter(session => session.quizId === quizId && session.State !== 'active').length;
  if (activeSessionsCount >= 10) {
    throw HTTPError(400, 'A maximum of 10 sessions that are not in END state currently exist for this quiz');
  }
   
  const quiz = data.quizzes[quizIndex];
  if (quiz.questions.length === 0) {
    throw HTTPError(400, 'The quiz does not have any questions in it');
  }

  const trash = data.trash.findIndex(quiz => quiz.quizId === quizId);
  if (trash !== -1) {
    throw HTTPError(400, 'The quiz is in trash');
  }

  const randomString = require('randomized-string');
  const newSessionId = randomString.generate({ charset: 'number', length: 4 });
  const copiedQuiz = { ...quiz, quizId: newSessionId, questions: [...quiz.questions] };
  data.quizzes.push(copiedQuiz);

  return { sessionId: newSessionId }
}

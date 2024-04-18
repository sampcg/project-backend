import { getData /* setData */ } from './dataStore';
import { getUser, /* getQuiz */ decodeToken /* getRandomColour */ } from './helpers';
import { /* EmptyObject */ ErrorObject, /* Quiz, Question, Answer */ States, Session, SessionStatus, Player } from './returnInterfaces';
import { DataStore } from './dataInterfaces';
import HTTPError from 'http-errors';

/*
interface SessionStartRequestBody {
  autoStartNum: number;
}

interface adminSessionViewReturn {
  activeSessions: string[];
  inactiveSessions: string[];
}
*/

interface adminSessionStartReturn {
  sessionId: number;
}

/*
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
      if (session.quiz === quizId && session.State !== 'active') {
        activeSessions.push(session.sessionId);
      } else if (session.quiz === quizId && session.State === 'inactive') {
        inactiveSessions.push(session.sessionId);
      }
    });
  }

  // Sort the session IDs in ascending order
  activeSessions.sort((a, b) => a.localeCompare(b));
  inactiveSessions.sort((a, b) => a.localeCompare(b));

  return { activeSessions, inactiveSessions };
};
*/

/// ///////////////////////////   Start a Session   /////////////////////////////
export const adminSessionStart = (quizId: number, token: string, autoStartNum: number): adminSessionStartReturn | ErrorObject => {
  const data: DataStore = getData();
  const originalToken = decodeToken(token);

  // Check if token is valid
  if (!originalToken) {
    throw HTTPError(401, 'Invalid Token');
  }
  // Find what I need
  if (!getUser(originalToken.userId)) {
    throw HTTPError(401, 'Invalid UserID');
  }

  // Validate quiz ID and ownership
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === originalToken.userId);
  if (quizIndex === -1) {
    throw HTTPError(403, 'Invalid quizID');
  }

  if (autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum is greater than 50');
  }

  /*
  const activeSessionsCount = data.session.filter(session => session.quizId === quizId && session.State !== 'active').length;
  if (activeSessionsCount >= 10) {
    throw HTTPError(400, 'A maximum of 10 sessions that are not in END state currently exist for this quiz');
  }
  */

  const quiz = data.quizzes[quizIndex];
  if (quiz.questions.length === 0) {
    throw HTTPError(400, 'The quiz does not have any questions in it');
  }

  const trash = data.trash.findIndex(quiz => quiz.quizId === quizId);
  if (trash !== -1) {
    throw HTTPError(400, 'The quiz is in trash');
  }

  // const randomString = require('randomized-string');
  // const newSessionId = parseInt(randomString.generate({ charset: 'number', length: 4 }));
  // const newSessionId = Math.random();
  let newSessionId: number = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  while (data.session.find(session => session.quizSessionId === newSessionId)) {
    newSessionId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }
  /**
   * Edits sam made below 
   */

    // Initialize players array as empty
    const players: Player[] = [];

    // Initialize atQuestion to 0
    const atQuestion = 0;
  
  const copiedQuiz = { ...quiz };
  const newSession:Session = { 
    quizSessionId: newSessionId,
    quiz: copiedQuiz, 
    state: States.LOBBY, 
    autoStartNum: autoStartNum,
    players: players,
    atQuestion: atQuestion
 };
  data.session.push(newSession);

  return { sessionId: newSessionId };
};


/// ///////////////////////////   Get a Session Status   /////////////////////////////


export const getSessionStatus = (quizSessionId: number, token: string): SessionStatus | ErrorObject => {
    const data: DataStore = getData();
    const originalToken = decodeToken(token);
  
    // Check if token is valid
    if (!originalToken) {
      throw HTTPError(401, 'Invalid Token');
    }
  
    // Find what I need
    if (!getUser(originalToken.userId)) {
      throw HTTPError(401, 'Invalid UserID');
    }
  
    // Find the session by ID
    const session = data.session.find(session => session.quizSessionId === quizSessionId);
  
    // If session not found
    if (!session) {
      throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
    }
  
    // If user is not the owner of this session's quiz
    if (session.quiz.userId !== originalToken.userId) {
      throw HTTPError(403, 'User is not an owner of this quiz');
    }
  
    // Prepare the session status response
    const sessionStatus: SessionStatus = {
      state: session.state,
      atQuestion: session.atQuestion,
      players: session.players,
      metadata: session.quiz,

    };
  
    return sessionStatus;
  };
  
import {
  getData, /* setData */
  setData
} from './dataStore';
import { getUser, /* getQuiz */ decodeToken, isValidAction, timer /* getRandomColour */ } from './helpers';
import { EmptyObject, ErrorObject, /* Quiz, Question, Answer */ States, Session, Player, SessionStatus, PlayerAnswer, QuestionInfo } from './returnInterfaces';
import { DataStore } from './dataInterfaces';
import HTTPError from 'http-errors';
/*
interface SessionStartRequestBody {
  autoStartNum: number;
}
*/

interface adminSessionViewReturn {
  activeSessions: string[];
  inactiveSessions: string[];
}

interface adminSessionStartReturn {
  sessionId: number;
}

/// //////////////////   View Active and Inactive Sessions   ////////////////////
export const adminSessionView = (token: string, quizId: number): adminSessionViewReturn | ErrorObject => {
  const data: DataStore = getData();
  console.log(token);
  // Checking for invalid or empty token
  const originalToken = decodeToken(token);
  if (!originalToken) {
    throw HTTPError(401, 'Invalid Token');
  }
  if (getUser(originalToken.userId) === undefined) {
    throw HTTPError(401, 'Invalid Token');
  }

  // Validate quizID and ownership
  // findIndex will return -1 if not found or userID doesn't match, quizIndex used to refer to quiz later
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === originalToken.userId);
  if (quizIndex === -1) {
    throw HTTPError(403, 'Invalid quizID');
  }

  // const quiz = data.quizzes[quizIndex];
  const activeSessions: string[] = [];
  const inactiveSessions: string[] = [];

  // Check if data.session is defined before iterating over it
  if (data.session) {
    // Iterate over sessions to determine active/inactive
    data.session.forEach(session => {
      if (session.quiz.quizId === quizId && session.state !== States.END) {
        activeSessions.push(session.quizSessionId.toString());
      } else if (session.quiz.quizId === quizId && session.state === States.END) {
        inactiveSessions.push(session.quizSessionId.toString());
      }
    });
  }

  // Sort the session IDs in ascending order
  activeSessions.sort((a, b) => a.localeCompare(b));
  inactiveSessions.sort((a, b) => a.localeCompare(b));

  return { activeSessions, inactiveSessions };
};

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
    playerAnswers: [] as PlayerAnswer[],
    atQuestion: atQuestion,
    messages: []
  };
  data.session.push(newSession);
  setData(data);
  return { sessionId: newSessionId };
};

/// //////////////////////  Update a Quiz Session State  ///////////////////////
export const adminSessionUpdate = (quizId: number, sessionId: number, token: string, action: string): EmptyObject | ErrorObject => {
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

  // Validate session ID
  const session = data.session.find(session => session.quizSessionId === sessionId && session.quiz.quizId === quizId);
  console.log(session);
  console.log('Input: ', sessionId);
  console.log('Comparison:', data.quizzes);
  console.log('Comparison:', data.session);
  console.log('Output: ', session);
  if (!session) {
    throw HTTPError(400, 'Session ID does not refer to a valid session within this quiz');
  }

  if (!isValidAction(action)) {
    throw HTTPError(400, 'Action provided is not a valid Action enum');
  }

  let timerFinished1 = false;
  timer(3000, () => {
    timerFinished1 = true;
  });

  let timerFinished2 = false;
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz) {
    const question = quiz.questions.find(question => question.questionId);
    if (question) {
      timer(question.duration, () => {
        timerFinished2 = true;
      });
    }
  }

  if (session.state === States.LOBBY) {
    if (action !== 'NEXT_QUESTION' && action !== 'END') {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    } else if (action === 'NEXT_QUESTION') {
      session.state = States.QUESTION_COUNTDOWN;
      console.log('Comparison1:', data.session);
    } else if (action === 'END') {
      session.state = States.END;
      console.log('Comparison2:', data.session);
    }
  } else if (session.state === States.QUESTION_COUNTDOWN) {
    if (action !== 'SKIP_COUNTDOWN' && action !== 'END') {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    } else if (action === 'SKIP_COUNTDOWN') {
      session.state = States.QUESTION_OPEN;
    } else if (timerFinished1) {
      session.state = States.QUESTION_OPEN;
    } else if (action === 'END') {
      session.state = States.END;
    }
  } else if (session.state === States.QUESTION_OPEN) {
    if (action !== 'GO_TO_ANSWER' && action !== 'END') {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    } else if (action === 'GO_TO_ANSWER') {
      session.state = States.ANSWER_SHOW;
    } else if (timerFinished2) {
      session.state = States.QUESTION_CLOSE;
    } else if (action === 'END') {
      session.state = States.END;
    }
  } else if (session.state === States.QUESTION_CLOSE) {
    if (action !== 'GO_TO_ANSWER' && action !== 'GO_TO_FINAL_RESULTS' && action !== 'END') {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    } else if (action === 'GO_TO_ANSWER') {
      session.state = States.ANSWER_SHOW;
    } else if (action === 'GO_TO_FINAL_RESULTS') {
      session.state = States.FINAL_RESULTS;
    } else if (action === 'END') {
      session.state = States.END;
    }
  } else if (session.state === States.ANSWER_SHOW) {
    if (action !== 'NEXT_QUESTION' && action !== 'GO_TO_FINAL_RESULTS' && action !== 'END') {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    } else if (action === 'GO_TO_FINAL_RESULTS') {
      session.state = States.FINAL_RESULTS;
    } else if (action === 'END') {
      session.state = States.END;
    }
  } else if (session.state === States.FINAL_RESULTS) {
    if (action !== 'END') {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    } else if (action === 'END') {
      session.state = States.END;
    }
  }

  setData(data);

  return {};
};

/// ///////////////////////////   Get a Session Status   /////////////////////////////

export const getSessionStatus = (quizId: number, sessionId: number, token: string): SessionStatus | ErrorObject => {
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

  // Validate user ownership of quiz
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === originalToken.userId);
  if (quizIndex === -1) {
    throw HTTPError(403, 'User is not the owner of the quiz');
  }

  // Validate session ID
  const session = data.session.find(session => session.quizSessionId === sessionId && session.quiz.quizId === quizId);

  // If session not found
  if (!session) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  // If user is not the owner of this session's quiz
  if (session.quiz.userId !== originalToken.userId) {
    throw HTTPError(403, 'User is not an owner of this quiz');
  }

  // Construct and return the SessionStatus object
  const players: string[] = session.players.map(name => name.name);
  const questions: QuestionInfo[] = session.quiz.questions.map(({
    questionId,
    question,
    duration,
    points,
    answers,
    thumbnailUrl
  }) => ({
    questionId: questionId,
    question: question,
    duration: duration,
    points: points,
    answers: answers,
    thumbnailUrl: thumbnailUrl
  }));

  // Construct and return the SessionStatus object
  const sessionStatus: SessionStatus = {
    state: session.state,
    atQuestion: session.atQuestion,
    players: players,
    metadata: {
      quizId: session.quiz.quizId,
      name: session.quiz.name,
      timeCreated: session.quiz.timeCreated,
      timeLastEdited: session.quiz.timeLastEdited,
      description: session.quiz.description,
      numQuestions: session.quiz.questions.length,
      questions: questions,
      duration: session.quiz.duration,
      thumbnailUrl: session.quiz.thumbnailUrl
    }
  };

  return sessionStatus;
};

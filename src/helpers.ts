import { getData } from './dataStore';
import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { User, Token, States } from './returnInterfaces';
import HTTPError from 'http-errors';
import { DataStore } from './dataInterfaces';
import { Actions } from './returnInterfaces';

const SERVER_URL = `${url}:${port}`;

/**
 * ============== helper functions============
 *
 * Given Id of a user, check if this id is valid
 * @param {number} authUserId - user ID assigned to the user
 * @returns {array} - returns the first element in the provided array if authUserId exists
 *                  - returns undefined if authUserId doesn't exist
 *
 */

export function getUser(authUserId: number) {
  const user = getData().users.find((user: { userId: number; }) => authUserId === user.userId);
  // if (!user) {
  //    throw HTTPError(404, 'Invalid UserID');
  // }
  return user;
}

export function getQuiz(quizId: number) {
  const quiz = getData().quizzes.find((quiz) => quizId === quiz.quizId);
  // if (!quiz) {
  //   throw HTTPError(403, 'Invalid QuizID' )
  // }
  return quiz;
}

export function getTrash(quizId: number) {
  return getData().trash.find((trash) => quizId === trash.quizId);
}

export function decodeToken(encodedToken: string): Token | null {
  try {
    const decodedToken = decodeURIComponent(encodedToken);
    const tokenObject = JSON.parse(decodedToken);
    // Check if the tokenObject has sessionId and userId properties
    if ('sessionId' in tokenObject && 'userId' in tokenObject) {
      return tokenObject as Token;
    } else {
      throw new Error('Invalid token');
    }
  } catch (error) {
    console.error('Invalid token');
    return null;
  }
}

export function isValidAction(action: string): boolean {
  return Object.values(Actions).includes(action as Actions);
}


// ========================================================================= //
/**
 * HELPER FUNCTIONS WITH THROW ERRORS
 */

export function isSessionValid(data: DataStore, originalToken: Token) {
  const sessionExists = data.token.find(session => originalToken.sessionId === session.sessionId);
  if (!sessionExists) {
    throw HTTPError(401, 'Invalid SessionID');
  }
}

// ========================================================================= //

/**
 *
 * Validates a token and returns an error object if the token is invalid.
 * @param {string | null} token - the created token
 * @returns {{ error: string, code: number } | null} - returns an error object if the token is invalid, otherwise null.
 *
 */

export const validateTokenStructure = (token: string | null): { error: string; code: number } | null => {
  if (token === null || token === '') {
    return { error: 'Invalid token', code: 401 };
  }

  if (typeof token !== 'string') {
    return { error: 'Invalid token structure', code: 401 };
  }

  return null;
};

/**
 * Given a email, check if this email is valid
 * @param {string} email - email given
 * @returns {array} - returns the first element in the provided array if authUserId exists
 *                  - returns undefined if authUserId doesn't exist
 */

export function getUserByEmail(email: string): User | null {
  return getData().users.find((user) => user.email === email) || null;
}

// Function to generate a random colour using a random index
export function getRandomColour(): string {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Creates a request with the specified HTTP method, path, and payload.
 *
 * @param {HttpVerb} method - The HTTP method to use for the request.
 * @param {string} path - The path for the request.
 * @param {object} payload - The payload to send with the request.
 *
 * @return {object} An object containing the status code and response body of the request.
 */

export const createRequest = (method: HttpVerb, path: string, payload: object) => {
  let qs = {};
  let json = {};
  json = payload;
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, timeout: 10000 });
  const responseBody = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, body: responseBody };
};

export const clear = () => {
  return createRequest('DELETE', '/v1/clear', {});
};

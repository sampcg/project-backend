import { getData } from './dataStore';
import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
import { User } from './returnInterfaces';

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

export function getUser(authUserId: number): User {
  return getData().users.find((user: { userId: number; }) => authUserId === user.userId);
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
export function getQuiz(quizId: number) {
  return getData().quizzes.find((quiz) => quizId === quiz.quizId);
}

export function getTrash(quizId: number) {
  return getData().trash.find((trash) => quizId === trash.quizId);
}

// Function to generate a random colour using a random index
export function getRandomColour(): string {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
  return colors[Math.floor(Math.random() * colors.length)];
}
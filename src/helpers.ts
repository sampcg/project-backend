import { getData } from './dataStore';

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
  return getData().users.find((user) => authUserId === user.userId);
}

export function getQuiz(quizId: number) {
  return getData().quizzes.find((quiz) => quizId === quiz.quizId);
}

export function getTrash(quizId: number) {
  return getData().trash.find((trash) => quizId === trash.quizId);
}
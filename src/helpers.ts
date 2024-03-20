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

export function getUser(authUserId) {
  return getData().users.find((user) => authUserId === user.userId);
}

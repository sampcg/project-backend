import { getData } from "./dataStore";

/**
 * ============== helper functions============
 * 
 * Given Id of a user, check if this id is valid
 * @param {number} authUserId - user ID assigned to the user
 * @returns {boolean} - returns true if authUserId exists
 *                    - returns false if authUserId doesn't exist
 * 
 */
export function isAuthUserValid(authUserId) {
	const data = getData();
	return data.users.some((user) => authUserId === user.userId);
}
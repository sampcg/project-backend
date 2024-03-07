
import {getData, setData } from './dataStore.js';
/**
 * Program to get all of the relevant information about the current quiz
 * @param {number} authUserId - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz 
 * @returns {quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}
 */

function adminQuizInfo(authUserId, quizId ) {

    const data = getData();

    const userValid = data.users.find(user => user.userId === authUserId);
    
    if (!userValid) {
        return { error: 'AuthUserId is not a valid user.'};
    }

    const quizValid = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quizValid) {
        return { error: 'Quiz ID does not refer to a valid quiz.' }
    }

    if (quiz.userId !== authUserId) {
        return { error: 'Quiz ID does not refer to a quiz that this user owns.'}
    }
    
    return {
        quizId: quiz.quizId,
        name: quiz.name,
        timeCreated: quiz.timeCreated,
        timeLastEdited: Date.now()/1000,
        description: quiz.description
    }
    
}
   

export { adminQuizInfo };

/**
 * Updates the name of the relevant quiz.
 * @param {number} authUserId - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz 
 * @param {string} name - updated name for relevant quiz
 */


function adminQuizNameUpdate( authUserId, quizId, name ) {
	return {};
}


import {getData, setData } from './dataStore.js';

/** 
 * Provides a list of all quizzed owned by the currently logged in user
 * @param {number} authUserId - unique identifier for the user
 * @returns {quizzes: {quizId: number, name: string}} - information on quizzes
 */

function adminQuizList(authUserId) {
    return {
        quizzes: [ {
            quizId: 1,
            name: 'My Quiz',
        } ]
    }
}

/** 
 * Creates a quiz for the logged in user given basic details
 * @param {number} authUserId - unique identifier for admin user
 * @param {string} name - name for the quiz
 * @param {string} description - description of the quiz
 * @returns {{quizId: number}} - quizId
 */

function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2
    };
}

/**
 * Removes a quiz given author and quiz IDs
 * @param {number} authUserId - unique identifer for the user
 * @param {number} quizId - unique identifier for quiz
 * @returns { } - empty object
 */

function adminQuizRemove(authUserId, quizId) {
    return {};
}

/**
 * Updates the description of the relevant quiz
 * @param {number} authUserId - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz 
 * @param {string} description - updated description for relevant quiz
 * @returns {} an empty object
 */

// Update the description of the relevant quiz.
function adminQuizDescriptionUpdate( authUserId, quizId, description ) {
    return {};
}

/**
 * Program to get all of the relevant information about the current quiz
 * @param {number} authUserId - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz 
 * @returns {quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}
 */

function adminQuizInfo(authUserId, quizId ) {

    const data = getData();

    const user = data.users.find(user => user.userId === authUserId);
    
    if (!user) {
        return { error: 'AuthUserId is not a valid user'};
    }

    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz) {
        return { error: 'QuizID does not refer to a valid quiz' }
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



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
 * @returns {{academic: {name: string, hobby: string}}}
 * @returns {quizId: number, name: string, timeCreated: number, timeLastEdited: number, description: string}
 */

function adminQuizInfo(authUserId, quizId ) {
   return { 
        quizId: 1, 
        name: 'My Quiz', 
        timeCreated: 1683125870,
        timeLastEdited: 1683125871, 
        description: 'This is my quiz', 
    };
}

/**
 * Updates the name of the relevant quiz.
 * @param {number} authUserId - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz 
 * @param {string} name - updated name for relevant quiz
 */


import { getData } from './dataStore.js';

function adminQuizNameUpdate(authUserId, quizId, name) {
    const data = getData();

    // Find the user by authUserId
    const user = data.users.find(user => user.userId === authUserId);
    if (!user) {
        return { error: 'AuthUserId is not a valid user.' };
    }

    // Find the quiz by quizId
    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz) {
        return { error: 'Quiz ID does not refer to a valid quiz.' };
    }

    // Check if the user owns the quiz
    if (quiz.userId !== authUserId) {
        return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
    }

    // Validate the name
    if (!isValidName(name)) {
        return { error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' };
    }

    if (name.length < 3 || name.length > 30) {
        return { error: 'Name is either less than 3 characters long or more than 30 characters long.' };
    }

    // Check if the name is already used by the current user for another quiz
    const quizWithSameName = data.quizzes.find(q => q.userId === authUserId && q.quizId !== quizId && q.name === name);
    if (quizWithSameName) {
        return { error: 'Name is already used by the current logged in user for another quiz.' };
    }

    // Update the name of the quiz
    quiz.name = name;

    // Return empty object indicating success
    return {};
}

// Function to validate name
function isValidName(name) {
    for (let char of name) {
        const charCode = char.charCodeAt(0);
        if (!(charCode >= 48 && charCode <= 57) && // Numeric characters
            !(charCode >= 65 && charCode <= 90) && // Uppercase alphabetical characters
            !(charCode >= 97 && charCode <= 122) && // Lowercase alphabetical characters
            char !== ' ') { // Space character
            return false;
        }
    }
    return true;
    }
export default adminQuizNameUpdate;



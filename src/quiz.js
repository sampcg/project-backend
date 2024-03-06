import { getData, setData } from './dataStore.js'

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

export function adminQuizCreate(authUserId, name, description) {
    let data = getData();

    // Check if user is valid
    let userExists = false;
    for (let users of data.users) {
        if (authUserId === users.userId) {
            userExists = true;
        }
    }
    if (!userExists) {
        return { error: 'Invalid user ID' };
    } 
    
    // Check if name contains invalid characters
    const validName = /^[a-zA-Z0-9\s]*$/.test(name);
    if (!validName) {
        return { error: 'Name contains invalid characters' }
    }

    // Check if name is less than 3 characters or greater than 30
    if (name.length < 3 || name.length > 30) {
        return { error: 'Name must be between 3 and 30 characters' };
    }

    // Check if name there is already a quiz by that name 
    // makes sure case doesn't impact check
    const nameExists = data.quizzes.some(quiz => quiz.name.toLowerCase() === name.toLowerCase());
    if (nameExists) {
        return { error: 'invalid input' };
    }

    // Check the length of the description
    if (description.length > 100) {
        return { error: 'Description must be 100 characters or less' };
    }

    // Generate new quiz ID
    const newQuizId = data.quizzes.length + 1;

    // Create parameters for new quiz
    const newQuiz = {
        quizId: newQuizId,
        name: name,
        description: description,
        timeCreated: Date.now()/1000,
        timeLastEdited: Date.now()/1000,
        userId: authUserId
    };

    // Add quiz to data
    data.quizzes.push(newQuiz);

    // Return quizId
    return {
        quizId: newQuizId
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


function adminQuizNameUpdate( authUserId, quizId, name ) {
	return {};
}


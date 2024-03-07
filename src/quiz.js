import { getData, setData } from './dataStore.js'

/** 
 * Provides a list of all quizzed owned by the currently logged in user
 * @param {number} authUserId - unique identifier for the user
 * @returns {quizzes: {quizId: number, name: string}} - information on quizzes
 */

export function adminQuizList(authUserId) {
    let data = getData();

    // Checks if userId is valid
    const userExists = data.users.some(user => user.userId === authUserId);
    if (!userExists) {
        return { error: 'Invalid user ID' }
    }

    // Creates array of quizzes to return
    const quizzes = [];

    // Pushes all quizzes with given user ID in data to array quizzes 
    for (let quiz of data.quizzes) {
        if (quiz.userId === authUserId) {
            quizzes.push({quizId: quiz.quizId, name: quiz.name});
        }
    }

    // Returns object containing array of all quizzes owned by user
    return {quizzes: quizzes };
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
    const userExists = data.users.some(user => user.userId === authUserId);
    if (!userExists) {
        return { error: 'Invalid user ID' }
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

export function adminQuizRemove(authUserId, quizId) {
    let data = getData();

    // Check if user is valid
    const userExists = data.users.some(user => user.userId === authUserId);
    if (!userExists) {
        return { error: 'Invalid user ID' }
    }

    // Check if quizId is valid
    const quizExists = data.quizzes.some(quiz => quiz.quizId === quizId);
    if (!quizExists) {
        return { error: 'Invalid quiz ID' };
    }

    // Check if owner owns quiz
    const findQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (findQuiz.userId !== authUserId) {
        return { error: 'User does not own this quiz' };
    }

    // Remove quiz that has given quizId
    data.quizzes = data.quizzes.filter(quiz => quiz.quizId !== quizId);

    // Return empty object
    return {};
}



export function adminQuizNameUpdate(authUserId, quizId, name) {
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
        return { error: 'Name contains invalid characters.' };
    }

    if (name.length < 3 || name.length > 30) {
        return { error: 'Name is either less than 3 characters long or more than 30 characters long.' };
    }

    // Check if the name is already used by the current user for another quiz
    const quizWithSameName = data.quizzes.find(q => q.userId === authUserId && q.quizId !== quizId && q.name === name);
    if (quizWithSameName) {
        return { error: 'Name is already used by the current logged in user for another quiz.' };
    }

    quiz.name = name;



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





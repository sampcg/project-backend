import { getData, setData } from './dataStore.js'

/**
 * Updates the description of the relevant quiz
 * @param {number} authUserId - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz 
 * @param {string} description - updated description for relevant quiz
 * @returns {} an empty object
 */

// Update the description of the relevant quiz.
function adminQuizDescriptionUpdate( authUserId, quizId, description ) {
    let data = getData();

    // Check if user is valid
    const userExists = data.users.some(user => user.userId === authUserId);
    if (!userExists) {
        return { error: 'AuthUserId is not a valid user.' };
    }

    // Check if quizId is valid
    const quizExists = data.quizzes.some(quiz => quiz.quizId === quizId);
    if (!quizExists) {
        return { error: 'Quiz ID does not refer to a valid quiz.' };
    }

    // Check if owner owns quiz
    const findQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (findQuiz.userId !== authUserId) {
        return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
    }

    // Check if description is more than 100 characters
    if (description.length > 100) {
        return { error: 'Description is more than 100 characters in length.' };
    }

    // Update the description of the quiz
    const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
    data.quizzes[quizIndex].description = description;

    // Save the updated data
    setData(data);

    // Return empty object
    return {};
}

export { adminQuizDescriptionUpdate };
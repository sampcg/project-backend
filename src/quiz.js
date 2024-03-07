import { getData } from './dataStore.js';
import { setData } from './dataStore.js';

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
    data.quizzes[quizId].timeLastEdited = Date.now()/1000


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

export { adminQuizNameUpdate };



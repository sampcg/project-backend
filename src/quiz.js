// 
/**
 * @param {number} authUserId - unique identifier for an authorated user
 * @param {number} quizId - unique identifier for quiz 
 * @returns {{academic: {name: string, hobby: string}}}
 * @returns {Object} - An object containing quiz details.
 *                    - Returns null if quiz is not found or user is not authorized.
 *                    - Example return object:
 *                      {
 *                          quizId: 1,
 *                          name: 'My Quiz',
 *                          timeCreated: 1683125870,
 *                          timeLastEdited: 1683125871,
 *                          description: 'This is my quiz',
 *                      }
 * 
 */
function adminQuizInfo(authUserId, quizId ) {
    // Program to get all of the relevant information about the current quiz.
   return { 
        quizId: 1, 
        name: 'My Quiz', 
        timeCreated: 1683125870,
        timeLastEdited: 1683125871, 
        description: 'This is my quiz', 
    };
}
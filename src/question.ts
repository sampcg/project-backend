import { getData, setData } from './dataStore';
import { getRandomColour } from './helpers';
import { Question, ErrorObject, Answer, Quiz } from './returnInterfaces';
import { DataStore } from './dataInterfaces'

/////////////////////           Create a Question           /////////////////////

interface AdminQuestionCreateRequestBody {
    token: string;
    questionBody: {
        question: string;
        duration: number;
        points: number;
        answers: Answer[];
    };
}

interface AdminQuestionCreateReturn {
    questionId: number;
}

export const adminQuestionCreate = (quizId: number, body: AdminQuestionCreateRequestBody): AdminQuestionCreateReturn | ErrorObject => {
    const { token, questionBody } = body;
    const { question, duration, points, answers } = questionBody;
    const data: DataStore = getData();
    
    // Check if token is valid
    const user = data.users.find((user) => token === user.token);
    if (!user) {
        return { error: 'Invalid token', code: 401 };
    }
    
    // Validate quizID and ownership
    // findIndex will return -1 if not found or userID doesn't match
    const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === user.userId);
    if (quizIndex === -1) {
        return { error: 'Invalid quizID', code: 403};
    }

    // Check if question is < 5 or > 50 characters
    if (question.length < 5 || question.length > 50) {
        return { error: 'Question must be between 5 and 50 characters', code: 400 };
    }

    // Check if question has < 2 or > 6 answers
    if (answers.length < 2 || answers.length > 6) {
        return { error: 'There must be between 2 and 6 answers', code: 400 };
    }

    // Check if question duration is not a positive number
    if (duration < 1) {
        return { error: 'Duration must be 1 or greater', code: 400 };
    }

    // Check if sum of question duration > 3 minutes
    // Take sum of all question duration using reduce
    const totalExistingQuizDuration = data.quizzes[quizIndex].questions.reduce((total, question) => total + question.duration, 0);
    // Now add current question duration to total to see if it exceeds 180 seconds
    const totalQuizDuration: number = totalExistingQuizDuration + duration 
    if (totalQuizDuration > 180) {
        return { error: 'Duration of quiz cannot exceed 3 minutes', code: 400 };
    }

    // Check if points for question is < 1 or > 10
    if (points < 1 || points > 10) {
        return { error: 'Question must have between 1 or 10 points', code: 400};
    }
    
    // Check if answer is < 1 or > 30 characters
    for (const answer of answers) {
        if (answer.answer.length < 1 || answer.answer.length > 30) {
            return { error: 'Answers must be between 1 and 30 characters', code: 400};
        }
    }

    // Answer strings are duplicates of one another in same question
    // Map to another array we can work with
    const answerStrings = answers.map(answer => answer.answer);

    // Check to see if any answers match one another
    const isDuplicateAnswer = answerStrings.some((answer, index) => answerStrings.indexOf(answer) !== index);
    if (isDuplicateAnswer) {
        return { error: 'Answers must be unique', code: 400 };
    }

    // There are no correct answer
    const correctAnswers = answers.filter(answer => answer.correct);
    if (correctAnswers.length === 0) {
        return { error: 'There must be at least one correct answer', code: 400};
    }

    // Create new answer array
    // Generate answerID by indexing in question
    const newAnswers: Answer[] = answers.map((answer, index) => ({
        answerId: index + 1,
        answer: answer.answer,
        correct: answer.correct,
        colour: getRandomColour()
    }));
    
    // Create a unique questionId
    const newQuestionId: number = data.quizzes[quizIndex].questions.length + 1;

    // Create and set data
    const newQuestion: Question = {
        questionId: newQuestionId,
        question: question,
        duration: duration,
        points: points,
        answers: newAnswers
    };

    // Push question to quiz
    data.quizzes[quizIndex].questions.push(newQuestion);

    // Update total duration of quiz
    data.quizzes[quizIndex].duration = totalQuizDuration;

    // Update time last edited of quiz
    data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

    // Update the dataStore
    setData(data);

    // Return questionId
    return { questionId: newQuestionId };
};

/////////////////////           Delete a Question           /////////////////////

interface AdminQuestionRemoveReturn {} 

export const adminQuestionRemove = (token: string, quizId: number, questionId: number): AdminQuestionRemoveReturn | ErrorObject => {
    const data = getData();

    // Find the user by token
    // Check if token is valid
    const user = data.users.find((user) => token === user.token);
    if (!user) {
        return { error: 'Invalid token', code: 401 };
    }

    // Validate quizID and ownership
    // findIndex will return -1 if not found or userID doesn't match
    const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId && quiz.userId === user.userId);
    if (quizIndex === -1) {
        return { error: 'Invalid quizID', code: 403};
    }

    // Get the quiz using quizIndex
    const quiz: Quiz = data.quizzes[quizIndex];

    // Find the question index by questionId
    const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
    if (questionIndex === -1) {
        return { error: 'Invalid questionID', code: 400 };
    }

    // Remove the question from the quiz
    quiz.questions.splice(questionIndex, 1);

    // Update the timeLastEdited property of the quiz
    quiz.timeLastEdited = Date.now();

    // Update the dataStore
    setData(data);
    return {};
}
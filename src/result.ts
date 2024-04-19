import { getData, setData } from './dataStore';
import { DataStore } from './dataInterfaces';
import { getUser, getQuiz, getTrash, decodeToken, validateTokenStructure, getUserByEmail, isSessionValid } from './helpers';
import { ErrorObject, EmptyObject, Quiz, QuizInfo, Question } from './returnInterfaces';
import HTTPError from 'http-errors';

function getFinalResults(quizId: number, sessionId: number, token: string): FinalResults | ErrorObject {
    // Validate parameters
    if (!validateParameters(quizId, sessionId, token)) {
        return { error: 'Invalid parameters', code: 400 };
    }

    // Check session state
    const sessionState = getSessionState(sessionId);
    if (sessionState !== SessionState.FINAL_RESULTS) {
        return { error: 'Session is not in FINAL_RESULTS state', code: 400 };
    }

    // Retrieve results
    const usersRankedByScore = getUsersRankedByScore(sessionId);
    const questionResults = getQuestionResults(sessionId);

    // Return results
    return { usersRankedByScore, questionResults };
}
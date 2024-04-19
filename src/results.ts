import { getData, setData } from './dataStore';
import { getPlayerFromPlayerId, decodeToken } from './helpers';
import { ErrorObject, EmptyObject, PlayerAnswer } from './returnInterfaces';
import HTTPError from 'http-errors';

/**
 * player submission of answers
 * @param {number[]} answerIds
 * @param {number} playerId
 * @param {number} questionPosition
 * @returns {} - empty object
 */

export const submitAnswers = (answerIds: number[], playerId: number, questionPosition: number): ErrorObject | EmptyObject => {
  const data = getData();
  const session = data.session.find((session) =>
    session.players.some((player) => player.playerId === playerId && session.atQuestion === questionPosition)
  );

  if (!session) {
    throw HTTPError(400, 'Player ID does not exist');
  }
  if (session.atQuestion !== questionPosition) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }
  if (session.state !== 'QUESTION_OPEN') {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  // Find the corresponding quiz
  const quiz = data.quizzes.find((quiz) => quiz.quizId === session.quiz.quizId);
  if (!quiz) {
    return { code: 400, error: 'Quiz not found' };
  }

  // Find the active question
  const question = quiz.questions[questionPosition]; // Array is zero-indexed

  const validAnswerIds = question.answers.map(answer => answer.answerId);
  const areAllAnswerIdsValid = answerIds.every(answerId => validAnswerIds.includes(answerId));

  if (!areAllAnswerIdsValid) {
    throw HTTPError(400, 'Answer IDs are not valid for this particular question');
  }

  // Check for duplicate answer IDs
  const uniqueAnswerIds = new Set(answerIds);
  if (uniqueAnswerIds.size !== answerIds.length) {
    throw HTTPError(400, 'There are duplicate answer IDs provided');
  }

  let isCorrect = false;
  const answers = quiz.questions[questionPosition].answers;
  const correctAnswer = answers.filter((a) => a.correct);
  if (correctAnswer.length !== answerIds.length) {
    isCorrect = false; // Arrays have different lengths, so they can't match
  } else {
    isCorrect = answers.every(answer => answerIds.includes(answer.answerId));
  }
  const playerAnswer: PlayerAnswer = {
    playerId: playerId,
    answersId: answerIds,
    questionPosition: questionPosition,
    timeAnswered: Math.floor(Date.now() / 1000),
    isCorrect: isCorrect
  };
  session.playerAnswers.push(playerAnswer);

  setData(data);
  return {};
};

interface QuestionCorrectnessBreakdown {
  answerId: number;
  playersCorrect: string[];
}

/**
 * results for a question
 * @param {number} playerId
 * @param {number} questionPosition
 * @returns {} - empty object
 */

export function getQuestionResults(playerId: number, questionPosition: number) {
  const data = getData();
  const session = data.session.find((session) =>
    session.players.some((player) => player.playerId === playerId && session.atQuestion === questionPosition)
  );

  if (!session) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  if (session.atQuestion !== questionPosition) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }

  if (session.state !== 'ANSWER_CLOSE') {
    throw HTTPError(400, 'Session is not in ANSWER_SHOW state');
  }

  // Find the corresponding quiz
  const quiz = data.quizzes.find((q) => q.quizId === session.quiz.quizId);

  // Find the active question

  const questionAnswerResult = session.playerAnswers.filter((q) => q.questionPosition === questionPosition);
  const questionCorrectBreakdown = [] as QuestionCorrectnessBreakdown[];
  const answers = quiz.questions[questionPosition].answers;
  const numCorrectAnswers = session.playerAnswers.filter((q) => q.isCorrect);
  let playerNames: string[];
  for (const answer of answers) {
    const correctUsers = questionAnswerResult.filter((q) => q.answersId.includes(answer.answerId));
    playerNames = correctUsers.map((u) => session.players.find((p) => u.playerId === p.playerId).name);
    questionCorrectBreakdown.push({
      answerId: answer.answerId,
      playersCorrect: playerNames,
    });
  }
  const correctPercentage = numCorrectAnswers.length / questionAnswerResult.length * 100;
  const averageAnswerTime = 45;

  return {
    questionId: quiz.questions[questionPosition].questionId,
    playersCorrectList: questionCorrectBreakdown,
    averageAnswerTime: averageAnswerTime,
    correctPercentage: correctPercentage
  };
}

export interface QuestionResult {
  questionId: number,
  questionCorrectBreakdown: {
    answerId: number,
    playersCorrect: string[],
  }[],
  averageAnswerTime: number,
  percentCorrect: number,
}

export interface UserRankedByScore {
  name: string;
  score: number;
}

interface QuizSessionFinalResult {
  usersRankedByScore: UserRankedByScore[];
  questionResults: QuestionResult[];
}

/**
 *  final result for a session.
 *
 * @param {number} playerId - The ID of the player.
 * @throws {HTTPError} Throws an error if the player with the given playerId does not exist
 * @throws {HTTPError} If the session is not in the final result state.
 * @return {QuizSessionFinalResult} The final result of the player's session, including the ranking of players by score and the results of each question.
 */
export function playerSessionFinalResult(playerId: number) {
  const data = getData();
  const playerIdValue = getPlayerFromPlayerId(playerId)?.playerId;

  if (!playerIdValue) {
    throw HTTPError(400, 'Player with given playerId does not exist');
  }
  const session = data.session.find((s) => s.players.some((player) => player.playerId === playerId));

  if (session.state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Session is not in the final result state');
  }

  const quiz = data.quizzes.find((q) => q.quizId === session.quiz.quizId);
  const usersRankedByScore = session.players
    .map((player) => ({ name: player.name, score: player.score }))
    .sort((a, b) => b.score - a.score);

  const questionResults: QuestionResult[] = [];

  quiz.questions.forEach((question) => {
    const playerAnswers = session.playerAnswers.filter(
      (playerAnswer) => playerAnswer.questionPosition + 1 === question.questionId
    );

    const questionCorrectBreakdown = question.answers.map((answer) => {
      const playersCorrect = playerAnswers
        .filter((playerAnswer) => playerAnswer.answersId.includes(answer.answerId))
        .map((playerAnswer) => session.players.find((player) => player.playerId === playerAnswer.playerId).name);

      return {
        answerId: answer.answerId,
        playersCorrect: playersCorrect,
      };
    });

    const totalPlayers = session.players.length;
    const totalCorrectPlayers = playerAnswers.filter((playerAnswer) => playerAnswer.answersId.length === question.answers.length).length;
    const percentageCorrect = Math.round((totalCorrectPlayers / totalPlayers) * 100);

    questionResults.push({
      questionId: question.questionId,
      questionCorrectBreakdown: questionCorrectBreakdown,
      averageAnswerTime: 45,
      percentCorrect: percentageCorrect,
    });
  });

  const quizSessionFinalResult: QuizSessionFinalResult = {
    usersRankedByScore: usersRankedByScore,
    questionResults: questionResults,
  };

  return quizSessionFinalResult;
}

/// //////////////////           Get Final results for completed quiz session        /////////////////////
/**
 * Retrieves the final results for a completed quiz session.
 * @param {number} quizid - The ID of the quiz.
 * @param {number} sessionid - The ID of the quiz session.
 * @param {string} token - The authentication token.
 * @returns {FinalResults | ErrorObject} - The final results for all players and question results for the completed quiz session, or an error object if the operation fails.
 * @typedef {Object} FinalResults
 * @property {UserRankedByScore[]} usersRankedByScore - List of users ranked by score.
 * @property {QuestionResult[]} questionResults - List of question results.
 * @typedef {Object} ErrorObject
 * @property {string} error - Error message.
 * @property {number} code - HTTP status code.
 * @typedef {Object} UserRankedByScore
 * @property {string} name - The name of the user.
 * @property {number} score - The score achieved by the user.
 * @typedef {Object} QuestionResult
 * @property {number} questionId - The ID of the question.
 * @property {string[]} playersCorrectList - List of players who answered the question correctly.
 * @property {number} averageAnswerTime - The average time taken to answer the question.
 * @property {number} percentCorrect - The percentage of players who answered the question correctly.
 */

export function getFinalResults(quizId: number, sessionId: number, token: string): QuizSessionFinalResult | ErrorObject {
  const data = getData();
  const originalToken = decodeToken(token);

  // Check if token is valid
  if (!originalToken) {
    throw HTTPError(401, 'Invalid Token');
  }
  // Check to see if sessionId is valid
  const sessionExists = data.token.find((session) => originalToken.sessionId === session.sessionId);
  if (!sessionExists) {
    throw HTTPError(401, 'Invalid SesssionID');
  }
  // Check if owner owns quiz
  const findQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (findQuiz.userId !== originalToken.userId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const session = data.session.find(session => session.quizSessionId === sessionId && session.quiz.quizId === quizId);
  if (!session) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }
  if (session.state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Session is not in the final result state');
  }

  const quiz = data.quizzes.find((q) => q.quizId === session.quiz.quizId);
  const usersRankedByScore = session.players
    .map((player) => ({ name: player.name, score: player.score }))
    .sort((a, b) => b.score - a.score);

  const questionResults: QuestionResult[] = [];

  quiz.questions.forEach((question) => {
    const playerAnswers = session.playerAnswers.filter(
      (playerAnswer) => playerAnswer.questionPosition + 1 === question.questionId
    );

    const questionCorrectBreakdown = question.answers.map((answer) => {
      const playersCorrect = playerAnswers
        .filter((playerAnswer) => playerAnswer.answersId.includes(answer.answerId))
        .map((playerAnswer) => session.players.find((player) => player.playerId === playerAnswer.playerId).name);

      return {
        answerId: answer.answerId,
        playersCorrect: playersCorrect,
      };
    });

    const totalPlayers = session.players.length;
    const totalCorrectPlayers = playerAnswers.filter((playerAnswer) => playerAnswer.answersId.length === question.answers.length).length;
    const percentageCorrect = Math.round((totalCorrectPlayers / totalPlayers) * 100);

    questionResults.push({
      questionId: question.questionId,
      questionCorrectBreakdown: questionCorrectBreakdown,
      averageAnswerTime: 45,
      percentCorrect: percentageCorrect,
    });
  });

  const quizSessionFinalResult: QuizSessionFinalResult = {
    usersRankedByScore: usersRankedByScore,
    questionResults: questionResults,
  };

  return quizSessionFinalResult;
}

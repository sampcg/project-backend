import { getData, setData } from './dataStore';
import {

} from './helpers';
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

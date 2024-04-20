import { getData, setData } from './dataStore';
import { generateRandomName, generatePlayerId } from './helpers';
import {
  ErrorObject,
  Player,
  States,
  Session
} from './returnInterfaces';
import HTTPError from 'http-errors';

export function createGuestPlayer(sessionId: number, name: string): { playerId: number} | ErrorObject {
  const data = getData(); // Get session data from somewhere

  // Find the session by sessionId
  const session = data.session.find((session: Session) => session.quizSessionId === sessionId);

  // Check if session exists
  if (!session) {
    throw HTTPError(400, 'Session ID does not refer to a valid session');
  }

  // Check if session is in LOBBY state
  if (session.state !== States.LOBBY) {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }

  // Check if the name is empty, generate a random name if so
  if (name.trim() === '') {
    name = generateRandomName();
  }

  // Check if the name is unique within the session
  if (session.players.find((guest: Player) => guest.name === name)) {
    throw HTTPError(400, 'Name is not unique within the session');
  }

  // Generate a playerId for the guest
  const playerId = generatePlayerId();

  // Add the guest to the session
  const guest: Player = {
    name: name,
    playerId: playerId,
    score: 0
  };
  session.players.push(guest);

  // Update session data
  setData(data);

  return { playerId: guest.playerId };
}

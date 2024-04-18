import { getData } from './dataStore';
import { DataStore } from './dataInterfaces';
import { ErrorObject, Message } from './returnInterfaces';
import HTTPError from 'http-errors';

/**                              Show Chat List                               */
// showChatList return type
interface showChatListReturn {
    messages: Message[];
}

export const showChatList = (playerId: number): showChatListReturn | ErrorObject => {
  const data: DataStore = getData();

  // Find the sessionId associated with the playerId
  let sessionId: number;
  for (const session of data.session) {
    for (const player of session.players) {
      if (player.playerId === playerId) {
        sessionId = session.quizSessionId;
        break;
      }
    }
  }
  const session = data.session.find(session => session.quizSessionId === sessionId);
  if (!session) {
    throw HTTPError(400, 'Invalid playerID');
  }
  // Creates array of chat messages to return;
  const chat = [...session.messages];
  // Return array
  return { messages: chat };
};

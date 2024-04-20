import { getData, setData } from './dataStore';
import { DataStore } from './dataInterfaces';
import { EmptyObject, ErrorObject, Message } from './returnInterfaces';
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

/**                             Send Chat Message                             */
export const sendChatMessage = (playerId: number, message: { messageBody: string }): EmptyObject | ErrorObject => {
  const { messageBody } = message;

  const data: DataStore = getData();

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
    throw HTTPError(400, 'Invalid playerId');
  }
  // Check length of message
  if (messageBody.length < 1 || messageBody.length > 100) {
    throw HTTPError(400, 'Message must be between 1 and 100 characters');
  }

  // Navigate to player to find name
  const player = session.players.find(player => player.playerId === playerId);

  const newMessage: Message = {
    messageBody: messageBody,
    playerId: playerId,
    playerName: player.name,
    timeSent: Math.round(Date.now() / 1000)
  };

  // Add message to data
  session.messages.push(newMessage);
  setData(data);

  // Return empty object
  return {};
};

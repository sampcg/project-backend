import { setData } from './dataStore';
import { EmptyObject } from './returnInterfaces';
/**
  * Reset the state of the application back to the start.
  *
  * @param { } - no parameters
  * @returns { } -  empty object
*/

export const clear = (): EmptyObject => {
  setData({
    users: [],
    quizzes: [],
    trash: [],
    token: [],
    session: [],
    guest: []
  });
  return {};
};

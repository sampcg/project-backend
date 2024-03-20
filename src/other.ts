
/**
  * Reset the state of the application back to the start.
  *
  * @param { } - no parameters
  * @returns { } -  empty object
*/
import { setData } from './dataStore';

function clear(): object {
  setData({
    users: [],
    quizzes: [],
    trash: []
  });
  return {};
}

export { clear };


/**
  * Reset the state of the application back to the start.
  * 
  * @param { } - no parameters
  * @returns { } -  empty object
*/
import { getData, setData } from "./dataStore";

function clear(): object {
  setData({
    users: [],
    quizzes: [],
  });
  return {};
}

export { clear };
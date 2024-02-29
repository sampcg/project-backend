
/**
  * Reset the state of the application back to the start.
  * 
  * @param { } - no parameters
  * @returns { } -  empty object
*/
import { getData, setData } from "./dataStore";

function clear() {
  setData({
    user:[],
    quizzes:[],
  });
    return { };
}

export{ clear };
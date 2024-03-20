// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
export interface Answer {
  answer: string;
  correct: boolean;
}

export interface Question {
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}

export interface User {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  oldPassword: string;
  newPassword: string;
}

export interface Quiz {
  quizId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  userId: number;
  questions: Question[];
}

interface Data {
  users: User[]; 
  quizzes: Quiz[];
  trash: Quiz[]; 
}

let data: { users: User[], quizzes: Quiz[], trash: Quiz[] } = {
  users: [],
  quizzes: [],
  trash: [],
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): Data {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data): void {
  data = newData;
}

export { getData, setData };

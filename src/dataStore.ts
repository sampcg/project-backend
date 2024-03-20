import { DataStore } from './dataInterfaces';
// import fs from 'fs';
// const DATABASE_FILE_PATH = './database.json';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
let data: DataStore = {
  users: [],
  quizzes: [],
  trash: [],
};

/** Use get() to access the data
export const getData = (): DataStore => {
  if (fs.existsSync(DATABASE_FILE_PATH)) {
    const dataStr = fs.readFileSync(DATABASE_FILE_PATH, 'utf8');
    data = JSON.parse(dataStr);
  }

  return data;
};

// Use set(newData) to pass in the entire data object, with modifications made
export const setData = (newData: DataStore): void => {
  const dataStr = JSON.stringify(newData, null, 2);

  fs.writeFileSync(DATABASE_FILE_PATH, dataStr);
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
function getData(): DataStore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore): void {
  data = newData;
}

export { getData, setData };

import { DataStore } from './dataInterfaces';
import fs from 'fs';

const DATABASE_FILE_PATH = './database.json';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
let data: DataStore = {
  users: [],
  quizzes: [],
};

// Use get() to access the data
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



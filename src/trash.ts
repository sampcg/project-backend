import { getData, setData } from './dataStore';
import { DataStore } from './dataInterfaces';
import { getUser, getQuiz, getTrash, decodeToken } from './helpers';
import { ErrorObject, EmptyObject, Quiz, Question, User  } from './returnInterfaces';


// AdminTrashList return type
interface BriefQuizDetails {
    quizId: number;
    name: string;
}

interface AdminTrashListReturn {
    quizzes: BriefQuizDetails[];
}


export const adminTrashList = (token: string): AdminTrashListReturn | ErrorObject => {
    const data = getData();
  
    // Check to see if token is valid
    const originalToken = decodeToken(token);
    if (!originalToken) {
      return { error: 'Invalid token', code: 401 };
    }
  
    if (!getUser(originalToken.userId)) {
      return { error: 'Invalid token', code: 401 };
    }

  const trashedQuizzes = [];

  // Filter trashed quizzes owned by the user and push them to the array
  for (const quiz of data.trash) {
    if (quiz.userId === originalToken.userId) {
      trashedQuizzes.push({ quizId: quiz.quizId, name: quiz.name });
    }
  }

  // Returns object containing array of trashed quizzes owned by the user
  return { quizzes: trashedQuizzes };
};


export const adminTrashRestore = (token: string, quizId: number): {} | ErrorObject => {
  const data: DataStore = getData();

  // Check to see if token is valid
  const originalToken = decodeToken(token);
  if (!originalToken) {
    return { error: 'Invalid token 1', code: 401 };
  }

  if (!getUser(originalToken.userId)) {
    return { error: 'Invalid token 2', code: 401 };
  }

  // Find the quiz in the trash
  const trashQuiz: Quiz | undefined = data.trash.find((quiz: Quiz) => quiz.quizId === quizId);
  if (!trashQuiz) {
    return { error: 'Quiz ID does not refer to a quiz in the trash', code: 400 };
  }

  // Check if the user owns the quiz in the trash
  const user: User | undefined = data.users.find((user: User) => user.userId === originalToken.userId);
  if (!user) {
    return { error: 'User does not exist', code: 403 };
  }
  if (trashQuiz.userId !== originalToken.userId) {
    return { error: 'User does not own this quiz in the trash', code: 403 };
  }

  // Add trashed quiz to quiz object  
  data.quizzes.push(trashQuiz);
  setData(data);

  // Restore the quiz by removing it from the trash
  data.trash = data.trash.filter((quiz: Quiz) => quiz.quizId !== quizId);

  // Save the updated data
  setData(data);

  // Return an empty object to indicate success
  return {};
};

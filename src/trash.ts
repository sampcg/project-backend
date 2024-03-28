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
  
    // Filter quizzes in the trash owned by the user
    const trashQuizzes: Quiz[] = data.trash.filter((quiz: Quiz) => quiz.userId === originalToken.userId);

    // Map the filtered quizzes to the required format
    const formattedQuizzes: { quizId: number; name: string }[] = trashQuizzes.map((quiz: Quiz) => {
     return { quizId: quiz.quizId, name: quiz.name };
    });

    // Return the formatted list of quizzes in the trash
    return { quizzes: formattedQuizzes };
};

export const adminTrashRestore = (token: string, quizId: number): {} | ErrorObject => {
  const data: DataStore = getData();

  // Check to see if token is valid
  const originalToken = decodeToken(token);
  if (!originalToken) {
    return { error: 'Invalid token', code: 401 };
  }

  if (!getUser(originalToken.userId)) {
    return { error: 'Invalid token', code: 401 };
  }

  // Find the quiz in the trash
  const trashQuiz: Quiz | undefined = data.trash.find((quiz: Quiz) => quiz.quizId === quizId);
  if (!trashQuiz) {
    return { error: 'Quiz ID does not refer to a quiz in the trash', code: 404 };
  }

  // Check if the user owns the quiz in the trash
  const user: User | undefined = data.users.find((user: User) => user.userId === originalToken.userId);
  if (!user) {
    return { error: 'User does not exist', code: 404 };
  }
  if (trashQuiz.userId !== originalToken.userId) {
    return { error: 'User does not own this quiz in the trash', code: 403 };
  }

  // Restore the quiz by removing it from the trash
  data.trash = data.trash.filter((quiz: Quiz) => quiz.quizId !== quizId);

  // Save the updated data
  setData(data);

  // Return an empty object to indicate success
  return {};
};


import express, { json, NextFunction, Request, Response } from 'express';
// import { getData, setData } from './dataStore';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

import { clear } from './other';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminAuthLogout,
  adminUserDetailsUpdate,
  adminUserDetailsUpdateV2,
  adminUserPasswordUpdate,
  adminUserPasswordUpdateV2,
} from './auth';

import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizNameUpdate,
  adminQuizTransfer,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminUpdateQuizThumbnail
} from './quiz';

import {
  adminQuestionCreate,
  adminQuestionUpdate,
  adminQuestionRemove,
  adminQuestionMove
} from './question';

import {
  // adminSessionView,
  adminSessionStart,
  adminSessionUpdate,
  adminSessionView,
  getSessionStatus
} from './session';

import { adminTrashList, adminTrashRestore } from './trash';

import { sendChatMessage } from './chat';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
// const load = () => {
//   if (fs.existsSync('./database.json')) {
//     const file = fs.readFileSync('./database.json', { encoding: 'utf8' });
//     setData(JSON.parse(file));
//   }
// };
// load();

// const save = () => {
//   fs.writeFileSync('./database.json', JSON.stringify(getData()));
// };

/**                               Auth Register                               */
// First Function By Abrar
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  // const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(req.body.email, req.body.password, req.body.nameFirst, req.body.nameLast);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

/**                                Auth Login                                 */
// Second Function By Abrar
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = adminAuthLogin(email, password);

  // Checking if the result contains an error
  if ('error' in result) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**                               User Details                                */
// Third Function By Abrar
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token: string = req.query.token as string; // Assuming token is passed in the request body

  const result = adminUserDetails(token);
  // Checking if the result contains an error
  if ('error' in result) {
    return res.status(401).json(result);
  }

  res.json(result);
});

/**                              Update Details                               */
// update details of an admin user
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  if ('error' in response) {
    return res.status(response.code).json({ error: response.error });
  }
  res.json(response);
});

// update details of an admin user
app.put('/v2/admin/user/details', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, email, nameFirst, nameLast } = req.body;
    res.json(adminUserDetailsUpdateV2(token, email, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

/**                              Update Password                              */
// update the password of an admin user
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in response) {
    return res.status(response.code).json({ error: response.error });
  }
  res.json(response);
});

// update the password of an admin user
app.put('/v2/admin/user/password', (req: Request, res: Response, next: NextFunction) => {
  try {
    // const token = req.header('token') as string;
    const { token, oldPassword, newPassword } = req.body;
    res.json(adminUserPasswordUpdateV2(token, oldPassword, newPassword));
  } catch (err) {
    next(err);
  }
});

/**                                Auth Logout                                */
// Fourth Function By Abrar
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  // const token: string = req.body.token as string;
  const token = req.body.token;
  const result = adminAuthLogout(token); // Corrected: Pass 'token' instead of 'authUserId'
  // Checking if the result contains an error
  if ('error' in result) {
    return res.status(401).json(result);
  }

  res.json(result);
});
// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  // save();
  return res.json(echo(data));
});

/**                                List Trash                                 */
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  res.json(adminTrashList(token));
});

/**                               List Quizzes                                */
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  res.json(adminQuizList(token));
});

/**                               Create Quiz                                 */
// v2
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, description } = req.body;
  res.json(adminQuizCreate(token, name, description));
});

/**                               Trash Restore                               */
app.post('/v2/admin/quiz/:quizId/restore', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = req.params.quizId;
  res.json(adminTrashRestore(token, parseInt(quizId)));
});

/**                             Update Quiz Name                              */
app.put('/v2/admin/quiz/:quizId/name', (req: Request, res: Response) => {
  const { name } = req.body;
  const token = req.header('token');
  const quizId = req.params.quizId;
  res.json(adminQuizNameUpdate(token, parseInt(quizId), name));
});

/**                          Update Quiz Description                          */
// Update Quiz description
app.put('/v2/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const { description } = req.body;
  const token = req.header('token');
  const quizId = req.params.quizId;
  res.json(adminQuizDescriptionUpdate(token, parseInt(quizId), description));
});

/**                                Quiz Info                                  */
// Get info about quiz
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizid: number = parseInt(req.params.quizid as string);
  res.json(adminQuizInfo(token, quizid));
});

/**                               Trash Quiz                                  */
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizid: number = parseInt(req.params.quizid as string);
  res.json(adminQuizRemove(token, quizid));
});

/**                             Transfer Quiz                                 */
// Transfer ownership of a quiz to a different user based on their email
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { quizid } = req.params;
  const { token, userEmail } = req.body;
  const quizId = parseInt(quizid);
  const response = adminQuizTransfer(quizId, token, userEmail);
  if ('error' in response) {
    return res.status(response.code).json({ error: response.error });
  }
  res.json(response);
});

/**                             Create Question                               */
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { quizid } = req.params;
  const { questionBody } = req.body;
  res.json(adminQuestionCreate(token, parseInt(quizid), questionBody));
});

/**                            Update Question                                */
app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { quizid, questionid } = req.params;
  const { questionBody } = req.body;
  res.json(adminQuestionUpdate(token, parseInt(quizid), parseInt(questionid), questionBody));
});

/**                            Delete Question                                */
app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.header('token');
  const { quizid, questionid } = req.params;
  res.json(adminQuestionRemove(token, parseInt(quizid), parseInt(questionid)));
});

/**                             Move Question                                 */
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { quizid, questionid } = req.params;
  const { newPosition } = req.body;
  res.json(adminQuestionMove(token, parseInt(quizid), parseInt(questionid), parseInt(newPosition)));
});

/**                             View Session                                  */
app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { quizid } = req.params;
  const result = adminSessionView(token, parseInt(quizid));
  res.json(result);
});

/**                              Start a Session                              */
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { quizid } = req.params;
  const { autoStartNum } = req.body;
  console.log(quizid);
  const result = adminSessionStart(parseInt(quizid), token, parseInt(autoStartNum));
  res.json(result);
});

/**                         Get quiz Session Status                           */
app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { quizid, sessionid } = req.params;
  res.json(getSessionStatus(parseInt(quizid), parseInt(sessionid), token));
});

/**                       Update a Quiz Session State                         */
app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { quizid, sessionid } = req.params;
  const { action } = req.body;
  console.log(quizid);
  const result = adminSessionUpdate(parseInt(quizid), parseInt(sessionid), token, action);
  res.json(result);
});

/**                         Update Quiz Thumbnail                             */
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const token = req.header('token');
  const { quizid } = req.params;
  const { imgUrl } = req.body;
  res.json(adminUpdateQuizThumbnail(token, parseInt(quizid), imgUrl));
});

/**                            Send Chat Message                              */
app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const { playerid } = req.params;
  const { message } = req.body;
  res.json(sendChatMessage(parseInt(playerid), message));
});

/**                                 Clear                                     */
// Reset the state of the application back to the start
app.delete('/v1/clear', (req: Request, res: Response) => {
  res.json(clear());
});

/**
// Route handler for GET /v1/admin/quiz/:quizid
app.get('/v1/admin/quiz/{quizid}', (req: Request, res: Response) => {
  const token: string = req.query.token as string;
  const quizid: number = req.params.quizid; // Convert quizid to a number

    // Handle any errors returned by the adminQuizInfo function
    if ('error' in response) {
      return res.status(403).json({ error: response.error });
    }

    // Return success response with quiz information
    res.json(200);
  });
*/
// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

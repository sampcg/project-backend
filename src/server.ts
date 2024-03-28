import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
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
  adminAuthLogout
  // adminUserDetailsUpdate,
  // adminUserPasswordUpdate
} from './auth';

import { 
  adminQuizCreate, 
  adminQuizList, 
  adminQuizRemove 
} from './quiz';

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

// First Function By Abrar
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  // const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(req.body.email, req.body.password, req.body.nameFirst, req.body.nameLast);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

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

// Third Function By Abrar
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token: string = req.query.token as string;

  const result = adminUserDetails(token);
  // Checking if the result contains an error
  if ('error' in result) {
    return res.status(401).json(result);
  }

  res.json(result);
});

// Fourth Function By Abrar
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { authUserId } = req.body;

  const result = adminAuthLogout(authUserId);
  // Checking if the result contains an error
  if ('error' in result) {
    return res.status(401).json(result);
  }

  res.json(result);
});

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizList(token);
  if ('error' in result) {
    return res.status(result.code).json({ error: result.error });
  }
  res.json(result);
});


// Create a quiz
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const result = adminQuizCreate(token, name, description);
  if ('error' in result) {
    return res.status(result.code).json({ error: result.error });
  }
  res.json(result);
});


// Send quiz to trash
app.delete(`/v1/quiz/:quizid`, (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizid: number = parseInt(req.params.quizid as string);
  const result = adminQuizRemove(token, quizid);
  if ('error' in result) {
    return res.status(result.code).json({ error: result.error });
  }
  res.json(result);
});


// Reset the state of the application back to the start
app.delete('/v1/clear', (req: Request, res: Response) => {
  res.json(clear());
});
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

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

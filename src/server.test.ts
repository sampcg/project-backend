
import request from 'sync-request-curl';
import { port, url } from '/config.json';
import { ErrorObject } from '/returnInterfaces';
import { User } from '/returnInterfaces';
import { Quiz } from '/returnInterfaces';
import { Trash } from '/returnInterfaces';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', `${SERVER_URL}/clear`);
  });
  

  
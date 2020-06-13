import * as dotenv from 'dotenv';

import { createClient } from './service/db';
import mainWorker from './service/mainWorker';

dotenv.config();

//set up db
// TODO: Pass db into worker

const db = createClient();
mainWorker(db);

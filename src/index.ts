import * as dotenv from 'dotenv';

import mainWorker from './service/mainWorker';

dotenv.config();

//set up db
// TODO: Pass db into worker
mainWorker();

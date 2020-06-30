import * as dotenv from 'dotenv';

import { createClient } from './service/db';
import mainWorker from './service/mainWorker';

dotenv.config();
// 0 for HK island, 1 for Kowloon, 2 for New territories
const REGION = 0;
const db = createClient();
mainWorker(db, REGION);

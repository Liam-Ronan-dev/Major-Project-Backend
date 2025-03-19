import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import fsPromises from 'fs/promises';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logEvents = async (message, logFileName) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\thh:mm:ss')}`;
  const logItem = `${dateTime}\t${uuidv4()}\t${message}\n`;

  try {
    const logDir = path.join(__dirname, '..', '..', 'logs');
    const logFilePath = path.join(logDir, logFileName);

    if (!fs.existsSync(logDir)) {
      await fsPromises.mkdir(logDir, { recursive: true });
    }

    await fsPromises.appendFile(logFilePath, logItem);
  } catch (error) {
    console.error('Logging Error:', error);
  }
};

export const logger = (req, res, next) => {
  const origin = req.headers.origin || req.ip || 'unknown';
  const userAgent = req.get('User-Agent') || 'No-User-Agent';

  logEvents(`${req.method}\t${req.url}\t${origin}\t${userAgent}`, 'reqlog.log');

  console.log(`Request Logged: ${req.method} ${req.path} from ${origin} - ${userAgent}`);
  next();
};

export default logEvents;

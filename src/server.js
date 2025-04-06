import * as dotenv from 'dotenv';
import { server } from './index.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Run the Server
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

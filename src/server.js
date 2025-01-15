import * as dotenv from 'dotenv';
import app from './index.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Run Server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

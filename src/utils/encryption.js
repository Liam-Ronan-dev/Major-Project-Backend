import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const algorithm = 'aes-256-gcm';
const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ivLength = 16; // AES Block Size

// Encrypt Data
export const encryptData = (data) => {
  if (!data) return null;

  try {
    // Generate a unique IV for each encryption
    const iv = crypto.randomBytes(ivLength);

    // Create cipher instance
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);

    // Encrypt Data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Generate auth tag
    const authTag = cipher.getAuthTag().toString('hex');

    return JSON.stringify({
      iv: iv.toString('hex'),
      authTag,
      encryptData: encrypted,
    });
  } catch (error) {
    console.error('Encryption error:', error.message);
    return null;
  }
};

// Decrypt Data
export const decryptData = (encryptedString) => {
  if (!encryptedString) return null;

  try {
    const { iv, authTag, encryptData } = JSON.parse(encryptedString);

    const decipher = crypto.createDecipheriv(
      algorithm,
      encryptionKey,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encryptData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null; // Prevent crash
  }
};

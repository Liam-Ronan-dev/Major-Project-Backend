import { encryptData, decryptData } from '../src/utils/encryption'; // adjust path as needed
import dotenv from 'dotenv';

dotenv.config();

describe('Encryption and Decryption Utilities', () => {
  const sampleText = 'This is a secret message.';

  it('should encrypt data and return a valid encrypted string', () => {
    const encrypted = encryptData(sampleText);

    expect(typeof encrypted).toBe('string');
    const parsed = JSON.parse(encrypted);

    expect(parsed).toHaveProperty('iv');
    expect(parsed).toHaveProperty('authTag');
    expect(parsed).toHaveProperty('encryptData');

    expect(typeof parsed.iv).toBe('string');
    expect(typeof parsed.authTag).toBe('string');
    expect(typeof parsed.encryptData).toBe('string');
  });

  it('should decrypt the encrypted data back to the original', () => {
    const encrypted = encryptData(sampleText);
    const decrypted = decryptData(encrypted);

    expect(decrypted).toBe(sampleText);
  });

  it('should return null when encrypting null or empty data', () => {
    expect(encryptData(null)).toBeNull();
    expect(encryptData(undefined)).toBeNull();
    expect(encryptData('')).toBeNull();
  });

  it('should return null when decrypting null or invalid data', () => {
    expect(decryptData(null)).toBeNull();
    expect(decryptData(undefined)).toBeNull();
    expect(decryptData('')).toBeNull();
    expect(decryptData('invalid-json')).toBeNull();
  });

  it('should return null if decryption fails due to tampered data', () => {
    const encrypted = encryptData(sampleText);
    const parsed = JSON.parse(encrypted);

    // tamper with encrypted data
    parsed.encryptData = 'invalid-data';

    const tampered = JSON.stringify(parsed);
    const result = decryptData(tampered);

    expect(result).toBeNull();
  });
});

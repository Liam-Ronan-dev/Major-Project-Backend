import { User } from '../models/User.js';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

// Generate MFA Secret & QR Code for User
export const generateMFASecret = async (req, res) => {
  try {
    //Retrieve User from Database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new secret
    const secret = authenticator.generateSecret();

    // Create URI for Google Authenticator / Authy
    const uri = authenticator.keyuri(
      user.email,
      'Health-service.click',
      secret
    );

    // Update user MFA secret in database
    await User.updateOne({ _id: req.user.id }, { $set: { mfaSecret: secret } });

    // Generate QR Code Buffer
    const qrCode = await qrcode.toBuffer(uri);

    // Send QR Code as image file
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="mfa-qrcode.png"'
    );
    res.setHeader('Content-Type', 'image/png');

    return res.status(200).type('image/png').send(qrCode);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Error generating MFA secret', error: error.message });
  }
};

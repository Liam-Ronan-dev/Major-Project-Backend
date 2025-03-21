import { User } from '../models/User.js';

export const verifyUser = async (req, res) => {
  try {
    const { userId, token } = req.params;

    console.log(`Incoming verification request for UserID: ${userId}, Token: ${token}`);

    // Find the user by ID and token
    const user = await User.findOne({
      _id: userId,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).send('<h2>Verification link is invalid or expired.</h2>');
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.send(
      `<h1>Thank you!</h1><p>User successfully verified. They can now set up MFA.</p>`
    );
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

import { faker } from '@faker-js/faker';
import { User } from '../../models/User.js';
import { hashField } from '../../modules/auth.js';

export const seedUsers = async () => {
  try {
    await User.deleteMany();

    const users = [];
    for (let i = 0; i < 5; i++) {
      const password = await hashField('Test@1234');

      users.push({
        email: faker.internet.email(),
        password: password,
        licenseNumber: faker.string.numeric(6),
        role: faker.helpers.arrayElement(['doctor', 'pharmacist']),
        isVerified: true,
      });
    }

    await User.insertMany(users);
    console.log('✅ Users seeded successfully.');
  } catch (error) {
    console.error(`❌ Error seeding users: ${error.message}`);
  }
};

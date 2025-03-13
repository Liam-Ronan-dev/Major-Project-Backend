import { faker } from '@faker-js/faker';
import { Medication } from '../../models/Medication.js';
import { User } from '../../models/User.js';

export const seedMedications = async () => {
  try {
    await Medication.deleteMany();

    const pharmacists = await User.find({ role: 'pharmacist' });

    if (pharmacists.length === 0) {
      console.error('No pharmacists found! Seed users first.');
      return;
    }

    const medications = [];
    for (let i = 0; i < 10; i++) {
      medications.push({
        name: faker.science.chemicalElement().name,
        form: faker.helpers.arrayElement(['Tablet', 'Capsule', 'Liquid', 'Injection']),
        stock: faker.number.int({ min: 10, max: 200 }),
        supplier: faker.company.name(),
        price: faker.commerce.price(),
        pharmacistId: faker.helpers.arrayElement(pharmacists)._id,
      });
    }

    await Medication.insertMany(medications);
    console.log('Medications seeded successfully.');
  } catch (error) {
    console.error(`Error seeding medications: ${error.message}`);
  }
};

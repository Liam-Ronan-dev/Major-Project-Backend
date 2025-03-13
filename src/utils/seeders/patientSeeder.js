import { faker } from '@faker-js/faker';
import { Patient } from '../../models/Patient.js';
import { User } from '../../models/User.js';

export const seedPatients = async () => {
  try {
    await Patient.deleteMany();

    const doctors = await User.find({ role: 'doctor' });

    if (doctors.length === 0) {
      console.error('No doctors found! Seed users first.');
      return;
    }

    const patients = [];
    for (let i = 0; i < 10; i++) {
      patients.push({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        dateOfBirth: faker.date.past({ years: 30 }).toISOString().split('T')[0],
        gender: faker.helpers.arrayElement(['Male', 'Female']),
        phoneNumber: faker.phone.number(),
        email: faker.internet.email(),
        address: {
          street: faker.location.street(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        medicalHistory: [
          {
            condition: faker.lorem.word(),
            diagnosedAt: faker.date.past(),
            notes: faker.lorem.sentence(),
          },
        ],
        doctorId: faker.helpers.arrayElement(doctors)._id,
      });
    }

    await Patient.insertMany(patients);
    console.log('Patients seeded successfully.');
  } catch (error) {
    console.error(`Error seeding patients: ${error.message}`);
  }
};

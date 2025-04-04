import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { Prescription } from '../models/Prescription.js';
import { Item } from '../models/Item.js';
import { Medication } from '../models/Medication.js';
import { Patient } from '../models/Patient.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const doctorId = '67e4534d80767582ecb2322b';
const pharmacistId = '67eee90b26a405d5aa064ff3';

const seedPrescriptions = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    await Prescription.deleteMany({});
    await Item.deleteMany({});

    const medications = await Medication.find();
    const patients = await Patient.find({ doctorId });

    const realisticInstructions = [
      'Take one tablet twice daily with meals.',
      'Apply the cream to affected area twice a day.',
      'Use inhaler every 4 hours as needed.',
      'Take on an empty stomach.',
      'Inject subcutaneously once a week.',
      'Take with a full glass of water.',
      'Do not consume alcohol while taking this medication.',
      'Swallow whole, do not crush or chew.',
      'Rinse mouth after use.',
      'Store in a cool, dry place.',
    ];

    const getRandomInstruction = () => faker.helpers.arrayElement(realisticInstructions);

    if (!medications.length || !patients.length) {
      console.error('No medications or patients found.');
      process.exit(1);
    }

    const prescriptions = [];

    for (let i = 0; i < 40; i++) {
      const randomPatient = faker.helpers.arrayElement(patients);

      // Create the prescription first so we have its _id
      const prescription = await Prescription.create({
        doctorId,
        pharmacistId,
        patientId: randomPatient._id,
        notes: faker.lorem.sentences(2),
        status: 'Assigned',
        items: [],
      });

      const numItems = faker.number.int({ min: 1, max: 4 });
      const itemIds = [];

      for (let j = 0; j < numItems; j++) {
        const medication = faker.helpers.arrayElement(medications);

        const item = await Item.create({
          prescriptionId: prescription._id,
          medicationId: medication._id,
          dosage: `${faker.number.int({ min: 1, max: 2 })} ${faker.helpers.arrayElement(['mg', 'ml', 'tabs'])}`,
          amount: `${faker.number.int({ min: 7, max: 30 })} units`,
          specificInstructions: getRandomInstruction(),
          pharmacistNote: '',
          repeats: faker.number.int({ min: 0, max: 3 }),
        });

        itemIds.push(item._id);
      }

      prescription.items = itemIds;
      await prescription.save();

      prescriptions.push(prescription);
    }

    console.log(`Seeded ${prescriptions.length} prescriptions across ${patients.length} patients`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding prescriptions:', error);
    process.exit(1);
  }
};

seedPrescriptions();

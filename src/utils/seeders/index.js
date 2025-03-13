import { seedUsers } from './userSeeder.js';
import { seedPatients } from './patientSeeder.js';
import { seedMedications } from './medicationSeeder.js';
import { seedPrescriptions } from './prescriptionSeeder.js';
import { seedAppointments } from './appointmentSeeder.js';
import { connectDB, disconnectDB } from '../../config/db.js';
import * as dotenv from 'dotenv';

dotenv.config();

const runSeeders = async () => {
  const seederArg = process.argv[2]; // Example: "node seed.js patients"

  await connectDB();

  try {
    switch (seederArg) {
      case 'users':
        await seedUsers();
        break;
      case 'patients':
        await seedPatients();
        break;
      case 'medications':
        await seedMedications();
        break;
      case 'prescriptions':
        await seedPrescriptions();
        break;
      case 'appointments':
        await seedAppointments();
        break;
      case 'all':
        await seedUsers();
        await seedPatients();
        await seedMedications();
        await seedPrescriptions();
        await seedAppointments();
        break;
      default:
        console.log(
          'Invalid argument. Use: users, patients, medications, prescriptions, appointments, all'
        );
    }

    console.log('Seeding successfully completed.');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

runSeeders().then(() => {
  disconnectDB();
});

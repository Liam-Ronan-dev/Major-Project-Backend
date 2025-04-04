import fs from 'fs/promises';
import xml2js from 'xml2js';
import { Medication } from '../models/Medication.js';
import { connectDB } from '../config/db.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importMedications = async () => {
  try {
    await connectDB();
    const xml = await fs.readFile(
      path.resolve(__dirname, '../medicationData/latestHumanlist.xml'),
      'utf-8'
    );
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xml);

    let records = result?.Products?.Product;

    if (!records) {
      console.log('No Product data found in XML.');
      return;
    }

    if (!Array.isArray(records)) {
      records = [records];
    }

    const medications = records
      .filter((med) => med.ProductName && med.DrugIDPK)
      .map((med) => ({
        name: med.ProductName,
        activeSubstance: Array.isArray(med.ActiveSubstances?.ActiveSubstance)
          ? med.ActiveSubstances.ActiveSubstance.join(', ')
          : med.ActiveSubstances?.ActiveSubstance || null,
        authorisationNumber: med.LicenceNumber,
        atcCode: Array.isArray(med.ATCs?.ATC) ? med.ATCs.ATC.join(', ') : med.ATCs?.ATC || null,
        routeOfAdministration: Array.isArray(med.RoutesOfAdministration?.RoutesOfAdministration)
          ? med.RoutesOfAdministration.RoutesOfAdministration.join(', ')
          : med.RoutesOfAdministration?.RoutesOfAdministration || null,
        productId: med.DrugIDPK,
      }));

    await Medication.insertMany(medications);
    console.log(`Imported ${medications.length} medications`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to import medications:', error);
    process.exit(1);
  }
};

importMedications();

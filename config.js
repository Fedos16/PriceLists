const dotenv = require('dotenv');
const path = require('path');

const root = path.join.bind(this, __dirname);
dotenv.config({ path: root('.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  DESTINATION: 'images',
  GOOGLE_LOGISTIC_ID: process.env.GOOGLE_LOGISTIC_ID,
  GOOGLE_EXTRADITIONS_ID: process.env.GOOGLE_EXTRADITIONS_ID,
  GOOGLE_DOWNLOAD_SHEET_ID: process.env.GOOGLE_DOWNLOAD_SHEET_ID,
  GOOGLE_SPECM_DEBTS: process.env.GOOGLE_SPECM_DEBTS
};
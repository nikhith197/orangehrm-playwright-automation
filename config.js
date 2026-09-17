const path = require('path');
const dotenv = require('dotenv');

const environment = process.env.TEST_ENV || 'demo';
const environmentFile = path.resolve(process.cwd(), `.env.${environment}`);
dotenv.config({ path: environmentFile });
dotenv.config();

const environments = {
  demo: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    apiTimeout: 15000,
  },
  qa: {
    baseURL: process.env.QA_BASE_URL || '',
    apiTimeout: Number(process.env.QA_API_TIMEOUT_MS || 15000),
  },
  staging: {
    baseURL: process.env.STAGING_BASE_URL || '',
    apiTimeout: Number(process.env.STAGING_API_TIMEOUT_MS || 15000),
  },
};

const selected = environments[environment];
if (!selected) {
  throw new Error(`Unsupported TEST_ENV '${environment}'. Supported values: demo, qa, staging.`);
}

const baseURL = process.env.BASE_URL || selected.baseURL;
if (!baseURL) {
  throw new Error(`BASE_URL is required for TEST_ENV='${environment}'.`);
}

const apiTimeout = Number(process.env.API_TIMEOUT_MS || selected.apiTimeout);

module.exports = {
  environment,
  baseURL,
  apiTimeout,
  credentials: {
    username: process.env.APP_USERNAME,
    password: process.env.APP_PASSWORD,
  },
  essCredentials: {
    username: process.env.ESS_USERNAME,
    password: process.env.ESS_PASSWORD,
  },
};

if (!module.exports.credentials.username || !module.exports.credentials.password) {
  throw new Error('APP_USERNAME and APP_PASSWORD must be provided through the environment.');
}

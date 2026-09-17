export const baseUrl = __ENV.BASE_URL;

if (!baseUrl) {
  throw new Error(
    'BASE_URL must be provided to k6, for example: k6 run -e BASE_URL=https://... k6/login-api.js'
  );
}

export const credentials = {
  username: __ENV.APP_USERNAME,
  password: __ENV.APP_PASSWORD,
};

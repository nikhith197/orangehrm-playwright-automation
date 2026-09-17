import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseUrl, credentials } from './config.js';

export const options = {
  vus: 3,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const payload = JSON.stringify({
    firstName: `Perf${__VU}_${__ITER}`,
    middleName: 'Test',
    lastName: `${Date.now()}`,
  });

  const response = http.post(`${baseUrl}/web/index.php/api/v2/pim/employees`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(credentials.username && credentials.password
        ? { 'X-Test-User': credentials.username }
        : {}),
    },
  });

  check(response, {
    'employee create endpoint returns a successful response': (r) =>
      r.status >= 200 && r.status < 300,
  });
  sleep(1);
}

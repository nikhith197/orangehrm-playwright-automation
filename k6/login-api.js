import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseUrl, credentials } from './config.js';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const payload = JSON.stringify(credentials);
  const response = http.post(`${baseUrl}/web/index.php/auth/validate`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'login endpoint returns a successful response': (r) => r.status >= 200 && r.status < 300,
  });
  sleep(1);
}

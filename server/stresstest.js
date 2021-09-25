import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 1 },
    { duration: '30s', target: 10 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 1000 },
  ],
};

export default function () {

  var url = 'http://localhost:4444/reviews';
  var payload = JSON.stringify({});

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let res = http.get(url, payload, params);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
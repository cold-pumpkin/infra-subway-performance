import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
    stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 21 },
        { duration: '8m', target: 58 },
        { duration: '8m', target: 69 },
        { duration: '5m', target: 21 },
        { duration: '2m', target: 10 }
    ],

    thresholds: {
        http_req_duration: ['p(99)<1500'],
    },
};

const BASE_URL = 'https://subway.mond.page';
const USERNAME = 'mond@mond.com';
const PASSWORD = 'mond';

export default function ()  {

    main();

    let jwt = login(USERNAME, PASSWORD);

    findPath(jwt, 1, 2);

};

function main() {
    let response = http.get(`${BASE_URL}`)
    check(response, {'access successfully': (res) => res.status === 200})
}

function login(email, password) {
    let payload = JSON.stringify({
        email: email,
        password: password,
    });
    let params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let response = http.post(`${BASE_URL}/login/token`, payload, params);
    check(response, {'logged in successfully': (res) => res.json('accessToken') !== ''});

    return response.json('accessToken');
}

function findPath(jwt, sourceId, targetId) {
    let authHeaders = {
        headers: {
            Authorization: `Bearer ${jwt}`,
        }
    };
    let response = http.get(`${BASE_URL}/paths?source=${sourceId}&target=${targetId}`, authHeaders);
    check(response, {'find path successfully': (res) => res.status === 200});
}
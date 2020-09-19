import fetch from 'node-fetch';

import requests from "../oasa-requests";
import queries from '../queries';

const api = requests();

const b = queries();

(async () => {
    const line = await b.findLine('790');
    if (line) {
        console.log(await api.getDailySchedule(line.LineCode));
    }
})();
import { APIRequests } from "../oasa-requests";
import { APIHelpers } from '../queries';

const api = new APIRequests();

const b = new APIHelpers();

(async () => {
    const line = await b.findLine('790');
    if (line) {
        console.log(await api.getDailySchedule(line.LineCode));
    }
})();
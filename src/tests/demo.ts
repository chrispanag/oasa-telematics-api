import { APIRequests, APIHelpers } from '..';

const api = new APIRequests();
const b = new APIHelpers();

(async () => {
    // You can fetch all the lines:
    console.log("You can fetch all the lines...");
    console.log(await api.webGetLines());

    // You can fetch a single line:
    console.log("You can fetch a single line...");
    console.log(await b.findLine('140'));

    // You can fetch a stop of a line:
    console.log("You can fetch a stop of a line...");
    const line = await b.findLine('140');
    if (line) {
        const { directions } = await b.getDirectionsOfLine(line.LineCode)
        const [come, go] = directions;
        console.log(await b.findStop('LAMIAS', come.RouteCodes));

        // Or in greek
        console.log("Or by searching in Greek...");
        console.log(await b.findStop('ΛΑΜΙΑΣ', come.RouteCodes));

        // Or by searching with a typo
        console.log("Or by searching with a typo...");
        console.log(await b.findStop('ΛΑΜΙΑ', come.RouteCodes));

        // And then you can check which buses are passing through that stop:
        console.log("And then you can check which buses are passing through that stop...");
        const stops = await b.findStop('ΛΑΜΙΑ', come.RouteCodes);
        if (stops.length > 0) {
            console.log(await api.getStopArrivals(stops[0].StopCode));
        }

    }
})();
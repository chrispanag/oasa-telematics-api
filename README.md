# OASA Telematics API

The (unofficial) Telematics API of Athens' public buses, complete with types and helper methods 🚌🚌🚌

This is the package that powers the popular greek messenger bot "[Πότε έρχεται το λεωφορείο μου 🚌](https://m.me/athensbus)". 

## Getting Started

Install the package: `$ npm i oasa-telematics-api`

```typescript
import { APIRequests, APIHelpers } from 'oasa-telematics-api';

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
        const [come, go ] = directions;
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
```

You can explore more by visiting the (mostly auto-generated) docs here: 

https://chrispanag.github.io/oasa-telematics-api/

Also, feel free to open an issue if you want to ask or suggest anything :)

### Can I use my own request method? 

Yes. The constructors APIRequests and APIHelpers can get a request function as an argument. 

The request function will need to have the form: 

```typescript
export type RequestFunction = <T>(url: string, query: string, ...params: any[]) => Promise<T>;
```

You can see a reference request function [here](src/requestFunction.ts). 

### Why would I want to use my own request method?

Caching. 

Also, see below...

### Can I use this for frontend development?

Yes. But you'll need to create a custom request function using the browser `fetch` method instead of the default one installed (`node-fetch`). You can see the above question for more details.

## Next Steps

* Add tests
* Add some more helper methods for schedule management
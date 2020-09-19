import requests, { RequestFunction } from './oasa-requests';
import { flatten, groupBy, isEqual, map, uniqWith } from 'lodash';
import { IDirection, ILine, ILineWithMLInfo, IStop } from './interfaces';

import Fuse from 'fuse.js';

const fuseOptions: Fuse.IFuseOptions<IStop> = {
    keys: ['StopDescr', 'StopDescrEng'],
    shouldSort: true,
    includeScore: true,
    threshold: 0.7
};

export default function queries(requestFunction?: RequestFunction) {

    const api = requests(requestFunction);

    async function findLine(lineID: string, withML?: false): Promise<ILine | undefined>;
    async function findLine(lineID: string, withML: true): Promise<ILineWithMLInfo | undefined>;
    async function findLine(lineID: string, withML: boolean = false) {
        if (withML) {
            const lines = await api.webGetLinesWithMLInfo();
            return lines.find(l => l.line_id === lineID);
        }

        const lines = await api.webGetLines();
        return lines.find(l => l.LineID === lineID);
    }

    async function getLinesOfStop(stopCode: string) {
        const routes = await api.webRoutesForStop(stopCode);
        const lines = groupBy(routes, 'LineCode');

        return map(lines, l => {
            const [first] = l;
            const { RouteCode, ...otherKeys } = first;

            return {
                ...otherKeys,
                RouteCodes: l.map(r => r.RouteCode)
            }
        });
    }

    async function getDirectionsOfLine(lineCode: string) {
        const routes = await api.webGetRoutes(lineCode);
        if (!routes) {
            throw new Error(`DataError: Line: with LineCode ${lineCode}, has no routes!`);
        }

        const filteredRoutes = routes.filter(r => r.RouteType);

        const directions = groupBy(filteredRoutes, 'RouteType');
        const dirs = map(directions, (dir, key) => {
            const RouteCodes = dir.map(alt => alt.RouteCode);

            const [first] = dir;

            const descrs = titleSanitize(first.RouteDescr).split('-');

            return {
                from: titleSanitize(descrs[0]).replace(/ /g, ''),
                to: titleSanitize(descrs[descrs.length - 1]).replace(/ /g, ''),
                direction: key,
                RouteCodes
            };
        });

        return cycleProcessing(dirs);
    }

    async function findStop(stopName: string, routeCodes: string[]) {
        const promises = routeCodes.map(r => api.webGetStops(r));
        const stops = (await Promise.all(promises)).filter(s => s);

        const foundStops = stops.map(routeStops => {
            if (!routeStops) {
                return [];
            }
            const stop = routeStops.find(s => s.StopDescr === stopName);
            if (stop) {
                return [stop];
            }

            const fuse = new Fuse(routeStops, fuseOptions);
            const suggested = fuse.search(stopName);

            if (suggested.length < 1) {
                return [];
            }

            return suggestions(suggested).map(s => ({
                ...s.item,
                score: s.score
            }));
        });

        if (foundStops.length === 1) {
            return flatten(foundStops).map((s, i) => ({
                ...s,
                routes: routeCodes
            }));
        }

        const stopsWithRoute = flatten(foundStops.map((stops, i) => stops.map(s => ({
            ...s,
            route: routeCodes[i]
        }))));

        const filteredStops = stopsWithRoute.map(stop => {
            const same = stopsWithRoute.filter(s => s.StopCode === stop.StopCode);
            const sameRoutes = same.map(s => s.route);
            const { route, ...rest } = stop;
            return {
                ...rest,
                routes: sameRoutes
            };
        });

        return uniqWith(filteredStops, isEqual);
    }

    return {
        findLine,
        getLinesOfStop,
        getDirectionsOfLine,
        findStop
    }
}

const THRESHOLD = 0.25;

function suggestions(stops: Fuse.FuseResult<IStop>[]) {
    let resultStops = stops;
    const [first] = resultStops;
    if (stops.length > 1 && first?.score !== undefined) {
        if (first.score < 0.4) {
            resultStops = stops.filter(s => s.score ? s.score < 0.4 : false);
        }
    }

    const suggested = [resultStops[0]];
    if (resultStops[0].score === 0) {
        return suggested;
    }

    for (const s of resultStops.slice(1, resultStops.length)) {
        if (s.score !== undefined && resultStops[0].score !== undefined) {
            if (s.score - resultStops[0].score > THRESHOLD) {
                break;
            } else {
                suggested.push(s);
            }
        }
    }

    return suggested;
}

function titleSanitize(title: string) {
    const string = title.replace(/\[(.*?)\]/g, '');
    return string.replace(/\((.*?)\)/g, '');
}

function cycleProcessing(directions: IDirection[]) {
    if (directions.length === 1) {
        const [dir] = directions
        return {
            isCycle: true,
            directions: [
                dir,
                {
                    to: dir.from,
                    from: dir.to,
                    RouteCodes: dir.RouteCodes,
                    direction: directions
                }
            ]
        }
    }

    return { isCycle: false, directions };
}


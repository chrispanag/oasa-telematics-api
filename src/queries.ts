import { APIRequests, RequestFunction } from './oasa-requests';
import { flatten, groupBy, isEqual, map, uniqWith } from 'lodash';
import { IDirection, ILine, ILineOfStop, ILineWithMLInfo, IStop } from './interfaces';

import Fuse from 'fuse.js';

const fuseOptions: Fuse.IFuseOptions<IStop> = {
    keys: ['StopDescr', 'StopDescrEng'],
    shouldSort: true,
    includeScore: true,
    threshold: 0.7
};

export class APIHelpers {
    private api: APIRequests;

    constructor(requestFunction?: RequestFunction) {
        this.api = new APIRequests(requestFunction);
    }

    /**
     * Searches a specific line according to its name (LineID)
     * @param lineID - The name of the line (eg: '140', 'A3' etc.)
     * @param withML - Change the fetch function to {@link webGetLinesWithMLInfo} to fetch lines with Masterline data.
     * @param params - Params to pass at the underlying requestFunction
     */
    async findLine(lineID: string, withML?: false, ...params: any[]): Promise<ILine | undefined>;
    async findLine(lineID: string, withML: true, ...params: any[]): Promise<ILineWithMLInfo | undefined>;
    async findLine(lineID: string, withML: boolean = false, ...params: any[]) {
        if (withML) {
            const lines = await this.api.webGetLinesWithMLInfo(...params);
            return lines.find(l => l.line_id === lineID);
        }

        const lines = await this.api.webGetLines(...params);
        return lines.find(l => l.LineID === lineID);
    }

    /**
     * Fetches the different lines passing through a stop
     * @param stopCode 
     * @param params - Params to pass at the underlying requestFunction 
     */
    async getLinesOfStop(stopCode: string, ...params: any[]): Promise<ILineOfStop[] | null> {
        const routes = await this.api.webRoutesForStop(stopCode, ...params);

        if (!routes) {
            return null;
        }

        const lines = groupBy(routes, 'LineCode');

        const mappedLines = map(lines, l => {
            const [first] = l;
            const { hidden, RouteCode, RouteDescr, RouteDescrEng, RouteDistance, RouteType, ...otherKeys } = first;
            if (hidden !== "0") {
                return null;
            }

            return {
                ...otherKeys,
                RouteCodes: l.map(r => r.RouteCode)
            }
        });

        // This could be expressed as: return mappedLines.filter(l => l);
        // but typescript types don't behave well on this statement. So we have to do it ourselves...
        const filteredMappedLines: ILineOfStop[] = [];

        for (const l of mappedLines) {
            if (l) {
                filteredMappedLines.push(l)
            }
        }

        return filteredMappedLines;
    }

    /**
     * Fetches the directions of a line ({@link IDirection})
     * Uses the {@link webGetRoutes} API call.
     * @param lineCode 
     * @param params - Params to pass at the underlying requestFunction 
     */
    async getDirectionsOfLine(lineCode: string, ...params: any[]) {
        const routes = await this.api.webGetRoutes(lineCode, ...params);
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

    /**
     * Performs a fuzzy search to find the closest stop names (StopDescr) on multiple routes.
     * @param stopName - The name of the stop
     * @param routeCodes - The various routeCodes to search for a specific stop
     * @param params - Params to pass at the underlying requestFunction 
     */
    async findStop(stopName: string, routeCodes: string[], ...params: any[]) {
        const promises = routeCodes.map(r => this.api.webGetStops(r, ...params));
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
                    direction: '2'
                }
            ]
        }
    }

    return { isCycle: false, directions };
}


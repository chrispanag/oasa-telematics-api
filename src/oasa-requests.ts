import { ILine, IRoute, IStop, IRouteDetail, IRouteOfStop, IRouteDetailsAndStops, IArrival, IBusLocation, IScheduleDay, ISchedule, ILineWithMLInfo } from './interfaces';
import defaultRequest from './requestFunction';

const API_URL = 'http://telematics.oasa.gr/api/?act=';

export type RequestFunction = <T>(url: string, query: string, ...params: any[]) => Promise<T>;

export class APIRequests {
    constructor(private requestFunction: RequestFunction = defaultRequest) {}

    /**
     * Fetch all lines
     * @param params - Params to pass at the underlying requestFunction
     */
    public webGetLines(...params: any[]) {
        return this.requestFunction<ILine[]>(API_URL, 'webGetLines', ...params);
    }
    
    /**
     * Fetch routes of a single line
     * @param lineCode
     * @param params - Params to pass at the underlying requestFunction
     */
    public webGetRoutes(lineCode: string, ...params: any[]) {
        return this.requestFunction<IRoute[] | null>(API_URL, `webGetRoutes&p1=${lineCode}`, ...params);
    }

    /**
     * Fetch the stops of a route
     * @param routeCode 
     * @param params - Params to pass at the underlying requestFunction
     */
    public webGetStops(routeCode: string, ...params: any[]) {
        return this.requestFunction<IStop[] | null>(API_URL, `webGetStops&p1=${routeCode}`, ...params);
    }

    /**
     * Fetch the path of a route (geo-points)
     * @param routeCode 
     * @param params - Params to pass at the underlying requestFunction
     */
    public webRouteDetails(routeCode: string, ...params: any[]) {
        return this.requestFunction<IRouteDetail[] | null>(API_URL, `webRouteDetails&p1=${routeCode}`, ...params);
    }

    /**
     * Fetch the routes passing through a stop
     * @param stopCode
     * @param params - Params to pass at the underlying requestFunction
     */
    public webRoutesForStop(stopCode: string, ...params: any[]) {
        return this.requestFunction<IRouteOfStop[] | null>(API_URL, `webRoutesForStop&p1=${stopCode}`, ...params);
    }

    /**
     * Fetch the path of a route (geo-points) along with its stops
     * (It's a combination of {@link webRouteDetails} and {@link @webGetStops})
     * @param routeCode
     * @param params - Params to pass at the underlying requestFunction
     */
    public webGetRoutesDetailsAndStops(routeCode: string, ...params: any[]) {
        return this.requestFunction<IRouteDetailsAndStops | null>(API_URL, `webGetRoutesDetailsAndStops&p1=${routeCode}`, ...params);
    }

    /**
     * Fetch all the lines along with their Masterline information
     * It is mostly equivalent to {@link webGetLines}, but fetches some information useful for fetching schedules afterwards.
     * @param params - Params to pass at the underlying requestFunction
     */
    public webGetLinesWithMLInfo(...params: any[]) {
        return this.requestFunction<ILineWithMLInfo[]>(API_URL, `webGetLinesWithMLInfo`, ...params);
    }

    /**
     * Fetch all the bus arrivals at a specific stop
     * @param stopCode 
     * @param params - Params to pass at the underlying requestFunction
     */
    public getStopArrivals(stopCode: string, ...params: any[]) {
        return this.requestFunction<IArrival[] | null>(API_URL, `getStopArrivals&p1=${stopCode}`, ...params);
    }

    /**
     * Fetch the locations of all the buses on a route
     * @param routeCode 
     * @param params - Params to pass at the underlying requestFunction
     */
    public getBusLocation(routeCode: string, ...params: any[]) {
        return this.requestFunction<IBusLocation[] | null>(API_URL, `getBusLocation&p1=${routeCode}`, ...params);
    }

    /**
     * Fetch the different types of schedules for a line
     * @param lineCode 
     * @param params - Params to pass at the underlying requestFunction
     */
    public getScheduleDaysMasterline(lineCode: string, ...params: any[]) {
        return this.requestFunction<IScheduleDay[] | null>(API_URL, `getScheduleDaysMasterline&p1=${lineCode}`, ...params);
    }

    /**
     * Fetch a specific schedule for a line
     * @param mlCode - Masterline Code, you can fetch it through {@link webGetLinesWithMLInfo}
     * @param sdcCode - Schedule Code, you can fetch it through {@link getScheduleDaysMasterline}
     * @param lineCode 
     * @param params - Params to pass at the underlying requestFunction
     */
    public getSchedLines(mlCode: string, sdcCode: string, lineCode: string, ...params: any[]) {
        return this.requestFunction<ISchedule | null>(API_URL, `getSchedLines&p1=${mlCode}&p2=${sdcCode}&p3=${lineCode}`, ...params);
    }

    /**
     * Fetch the daily schedule for a line
     * When this schedule exists, it overrides the schedule fetched by {@link getSchedLines}
     * @param lineCode 
     * @param params - Params to pass at the underlying requestFunction
     */
    public getDailySchedule(lineCode: string, ...params: any[]) {
        return this.requestFunction<ISchedule | null>(API_URL, `getDailySchedule&p1=${lineCode}`, ...params);
    }

    /**
     * Fetch the nearest stops around a specific geo-point
     * @param x - latitude
     * @param y - longitude
     * @param params - Params to pass at the underlying requestFunction
     */
    public getClosestStops(x: string, y: string, ...params: any[]) {
        return this.requestFunction<ISchedule | null>(API_URL, `getClosestStops&p1=${x}&p2=${y}`, ...params);
    }
}
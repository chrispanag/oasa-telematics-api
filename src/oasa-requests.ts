import { ILine, IRoute, IStop, IRouteDetail, IRouteOfStop, IRouteDetailsAndStops, IArrival, IBusLocation, IScheduleDay, ISchedule, ILineWithMLInfo } from './interfaces';
import defaultRequest from './requestFunction';

const API_URL = 'http://telematics.oasa.gr/api/?act=';

export type RequestFunction = <T>(url: string, query: string, ...params: any[]) => Promise<T>;

export default function requests(requestFunction: RequestFunction = defaultRequest) {

    function webGetLines(...params: any[]) {
        return requestFunction<ILine[]>(API_URL, 'webGetLines', ...params);
    }

    function webGetRoutes(lineCode: string, ...params: any[]) {
        return requestFunction<IRoute[] | null>(API_URL, `webGetRoutes&p1=${lineCode}`, ...params);
    }

    function webGetStops(routeCode: string, ...params: any[]) {
        return requestFunction<IStop[] | null>(API_URL, `webGetStops&p1=${routeCode}`, ...params);
    }

    function webRouteDetails(routeCode: string, ...params: any[]) {
        return requestFunction<IRouteDetail[] | null>(API_URL, `webRouteDetails&p1=${routeCode}`, ...params);
    }

    function webRoutesForStop(stopCode: string, ...params: any[]) {
        return requestFunction<IRouteOfStop[] | null>(API_URL, `webRoutesForStop&p1=${stopCode}`, ...params);
    }

    function webGetRoutesDetailsAndStops(routeCode: string, ...params: any[]) {
        return requestFunction<IRouteDetailsAndStops | null>(API_URL, `webGetRoutesDetailsAndStops&p1=${routeCode}`, ...params);
    }

    function webGetLinesWithMLInfo(...params: any[]) {
        return requestFunction<ILineWithMLInfo[]>(API_URL, `webGetLinesWithMLInfo`, ...params);
    }

    function getStopArrivals(stopCode: string, ...params: any[]) {
        return requestFunction<IArrival[] | null>(API_URL, `getStopArrivals&p1=${stopCode}`, ...params);
    }

    function getBusLocation(routeCode: string, ...params: any[]) {
        return requestFunction<IBusLocation[] | null>(API_URL, `getBusLocation&p1=${routeCode}`, ...params);
    }

    function getScheduleDaysMasterline(lineCode: string, ...params: any[]) {
        return requestFunction<IScheduleDay[] | null>(API_URL, `getScheduleDaysMasterline&p1=${lineCode}`, ...params);
    }

    function getSchedLines(mlCode: string, sdcCode: string, lineCode: string, ...params: any[]) {
        return requestFunction<ISchedule | null>(API_URL, `getSchedLines&p1=${mlCode}&p2=${sdcCode}&p3=${lineCode}`, ...params);
    }

    function getDailySchedule(lineCode: string, ...params: any[]) {
        return requestFunction<ISchedule | null>(API_URL, `getDailySchedule&p1=${lineCode}`, ...params);
    }

    function getClosestStops(x: string, y: string, ...params: any[]) {
        return requestFunction<ISchedule | null>(API_URL, `getClosestStops&p1=${x}&p2=${y}`, ...params);
    }

    return {
        webGetLines,
        webGetRoutes,
        webGetStops,
        webRouteDetails,
        webRoutesForStop,
        webGetRoutesDetailsAndStops,
        webGetLinesWithMLInfo,
        getStopArrivals,
        getBusLocation,
        getScheduleDaysMasterline,
        getSchedLines,
        getDailySchedule,
        getClosestStops
    }
}
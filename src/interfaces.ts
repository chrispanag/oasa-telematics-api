export interface ILine {
    LineCode: string;
    LineID: string;
    LineDescr: string;
    LineDescrEng: string;
}

export interface IRoute {
    RouteCode: string;
    LineCode: string;
    RouteDescr: string;
    RouteDescrEng: string;
    RouteType: string;
    RouteDistance: string;
}

export interface IStop {
    StopCode: string;
    StopID: string;
    StopDescr: string;
    StopDescrEng: string;
    StopStreet: string | null;
    StopStreetEng: string | null;
    StopHeading: string;
    StopLat: string;
    StopLng: string;
    RouteStopOrder: string;
    StopType: string;
    StopAmea: string;
}

export interface IRouteDetail {
    routed_x: string;
    routed_y: string;
    routed_order: string;
}

export interface IRouteOfStop {
    RouteCode: string;
    LineCode: string;
    hidden: string;
    RouteDescr: string;
    RouteDescrEng: string;
    RouteType: string;
    RouteDistance: string;
    LineID: string;
    LineDescr: string;
    LineDescrEng: string;
    MasterLineCode: string;
}

export interface IRouteDetailsAndStops {
    details: IRouteDetail[];
    stops: IStop[];
}

export interface IArrival {
    route_code: string;
    veh_code: string;
    btime2: string;
}

export interface IBusLocation {
    VEH_NO: string;
    CS_DATE: string;
    CS_LAT: string;
    CS_LNG: string;
    ROUTE_CODE: string;
}

export interface IScheduleDay {
    sdc_descr: string;
    sdc_descr_eng: string;
    sdc_code: string;
    "": string;
}

export interface IScheduleEntry {
    line_id: string;
    sde_code: string;
    sdc_code: string;
    sds_code: string;
    sde_aa: string;
    sde_line1: string;
    sde_kp1: string;
    sde_start1: string;
    sde_end1: string;
    sde_line2: string;
    sde_kp2: string;
    sde_start2: string;
    sde_end2: string;
    sde_sort: string;
    sde_descr2: string | null;
    line_circle: string;
    line_descr: string;
    line_descr_eng: string;
}

export interface ISchedule {
    come: IScheduleEntry[];
    go: IScheduleEntry[];
}

export interface IDirection {
    from: string;
    to: string;
    direction: string;
    RouteCodes: string[];
}

export interface ILineWithMLInfo {
    ml_code: string;
    sdc_code: string;
    line_code: string;
    line_id: string;
    line_descr: string;
    line_descr_eng: string;
    mld_master: string;
}

import { RequestFunction } from "./oasa-requests";

const defaultRequest: RequestFunction = async <T>(url: string, query: string) => {
    try {
        const res = await fetch(url + query);
        const data = await res.json();

        return data as T;
    } catch (err) {
        throw err;
    }
}

export default defaultRequest;
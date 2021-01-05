import { RequestFunction } from './oasa-requests';
import fetch from 'node-fetch';

const defaultRequest: RequestFunction = async <T>(url: string, query: string) => {
    try {
        const res = await fetch(url + query);
        const data = await res.json();

        return data as T;
    } catch (err) {
        throw err;
    }
};

export default defaultRequest;

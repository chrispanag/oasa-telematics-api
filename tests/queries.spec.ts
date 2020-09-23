import { expect } from 'chai';
import { APIHelpers, RequestFunction } from '../src';

import webGetLinesDummy from './dummyData/webGetLines';
import webGetLinesWithMLInfoDummy from './dummyData/webGetLinesWithMLInfo';

const requestFunction: RequestFunction = <T>(url: string, query: string) => {
    switch (query) {
        case 'webGetLines':
            // @ts-ignore
            return Promise.resolve(webGetLinesDummy as T);
        case 'webGetLinesWithMLInfo':
            // @ts-ignore
            return Promise.resolve(webGetLinesWithMLInfoDummy as T);
        default:
            throw new Error(`Unexpected query: ${query}`);
    }
}

describe('APIHelpers', () => {
    const apiHelpers = new APIHelpers(requestFunction);

    describe('findLine', () => {
        describe('withML', () => {
            it('Returns a single line', async () => {
                const line = await apiHelpers.findLine('140', true);
                expect(line).to.not.be.an.instanceOf(Array);
            })
            it('Returns the line with ML Info', async () => {
                const line = await apiHelpers.findLine('790', true);
                expect(line).to.haveOwnProperty('ml_code');
            })
            it('Returns the line with the specified LineID', async () => {
                const line = await apiHelpers.findLine('790', true);
                expect(line.line_id).to.be.equal('790');
            })
        })
        describe('withoutML', () => {
            it('Returns a single line', async () => {
                const line = await apiHelpers.findLine('140');
                expect(line).to.not.be.an.instanceOf(Array);
            })
            it('Returns the line with the specified LineID', async () => {
                const line = await apiHelpers.findLine('790');
                expect(line.LineID).to.be.equal('790');
            })
        })
    });

    describe('getLinesOfStop', () => {
        it('If the stop doesn\' exist then it returns "null"', () => {});
        it('If the line has multiple routes that pass through that stop, then all those routes are added to the "RouteCodes" key of the line', () => {});
    });
});
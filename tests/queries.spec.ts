import { expect } from 'chai';
import { APIHelpers, RequestFunction } from '../src';

import webGetLinesDummy from './dummyData/webGetLines';
import webGetLinesWithMLInfoDummy from './dummyData/webGetLinesWithMLInfo';
import webRoutesForStopDummy from './dummyData/webRoutesForStop';

const requestFunction: RequestFunction = <T>(url: string, query: string) => {
    switch (query) {
        case 'webGetLines':
            // @ts-ignore
            return Promise.resolve(webGetLinesDummy as T);
        case 'webGetLinesWithMLInfo':
            // @ts-ignore
            return Promise.resolve(webGetLinesWithMLInfoDummy as T);
        case 'webRoutesForStop&p1=60030':
            // @ts-ignore
            return Promise.resolve(webRoutesForStopDummy as T);
        default:
            return Promise.resolve(null);
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
        it('If the stop doesn\' exist then it returns "null"', async () => {
            const lines = await apiHelpers.getLinesOfStop('111');
            expect(lines).to.be.null;
        });
        describe('If the line has multiple routes that pass through that stop', () => {
            it('Merges those routes into one line.', async () => {
                const lines = await apiHelpers.getLinesOfStop('60030');
                expect(lines).to.be.of.length(2);
            });
            it('The merged line, has an array of RouteCodes with length equal to the length of the merged lines.', async () => {
                const lines = await apiHelpers.getLinesOfStop('60030');
                const line = lines.find(l => l.LineCode === '799');
                expect(line.RouteCodes).to.be.of.length(2);
            });
        })
    });
});
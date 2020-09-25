import { expect } from 'chai';
import { APIHelpers, RequestFunction } from '../src';

import webGetLinesDummy from './dummyData/webGetLines';
import webGetLinesWithMLInfoDummy from './dummyData/webGetLinesWithMLInfo';
import { webGetRoutesDummyCircle, webGetRoutesDummyMultiple, webGetRoutesDummyNormal } from './dummyData/webGetRoutes';
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
        case 'webGetRoutes&p1=938':
            // @ts-ignore
            return Promise.resolve(webGetRoutesDummyMultiple as T);
        case 'webGetRoutes&p1=993':
            // @ts-ignore
            return Promise.resolve(webGetRoutesDummyNormal as T);
        case 'webGetRoutes&p1=1151':
            // @ts-ignore
            return Promise.resolve(webGetRoutesDummyCircle as T);
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

    describe('getDirectionsOfLine', () => {
        describe('Line is a circle', () => {
            it('Returns two directions', async () => {
                const directions = await apiHelpers.getDirectionsOfLine('1151');
                expect(directions.directions).to.be.of.length(2)
            })
            it('Returns isCycle true', async () => {
                const directions = await apiHelpers.getDirectionsOfLine('1151');
                expect(directions.isCycle).to.be.true;
            })
            it('Includes one RouteCode in each direction', async () => {
                const directions = await apiHelpers.getDirectionsOfLine('1151');
                for (const d of directions.directions) {
                    expect(d.RouteCodes).to.be.of.length(1);
                }
            });
        });
        describe('Line has two routes', () => {
            it('Returns two directions', async () => {
                const directions = await apiHelpers.getDirectionsOfLine('993');
                expect(directions.directions).to.be.of.length(2)
            });
            it('Returns isCycle false', async () => {
                const directions = await apiHelpers.getDirectionsOfLine('993');
                expect(directions.isCycle).to.be.false;
            });
            it('Includes one RouteCode in each direction', async () => {
                const directions = await apiHelpers.getDirectionsOfLine('1151');
                for (const d of directions.directions) {
                    expect(d.RouteCodes).to.be.of.length(1);
                }
            });
        });
        describe('Line has more than two routes', () => {
            it('Returns two directions', async () => {
                const directions = await apiHelpers.getDirectionsOfLine('938');
                expect(directions.directions).to.be.of.length(2)
            });
            it('Returns isCycle false', async () => {
                const directions = await apiHelpers.getDirectionsOfLine('938');
                expect(directions.isCycle).to.be.false;
            });
            it('Has two RouteCodes on the direction that corresponds to the RouteType that has more than one entry.', async () => {
                const directions = await apiHelpers.getDirectionsOfLine('938');
                const ds = directions.directions;
                const d1 = ds.find(d => d.direction === '1');
                expect(d1.RouteCodes).to.be.of.length(2);
                const d2 = ds.find(d => d.direction === '2');
                expect(d2.RouteCodes).to.be.of.length(1);
            });
        });
    })
});
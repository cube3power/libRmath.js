'use strict'
//http://stat.ethz.ch/R-manual/R-patched/library/stats/html/Normal.html
//https://en.wikipedia.org/wiki/Normal_distribution

import { Normal } from '../../src/lib/normal';
import { checkPrec6, createComment } from '../test-helpers';
import { each, map, c, Rcycle } from '../../src/lib/r-func';
import fixture from './fixture';

describe(`Normal distribution test`, () => {
    const { dnorm, qnorm, pnorm } = Normal()

    const dnormFixture = fixture.dnorm;
    describe('dnorm', () => {
        each(dnormFixture)((testCase, testCaseName) => {
            if (testCase['skip']) { return }
            const { input, expected: _expected } = testCase;
            let cnt = 0;
            Rcycle(({ x, mu, sd, l }, expcted) => {
                cnt++
                const comment = createComment({ x, mu, sd, l });
                it(`test:${cnt}\t→${comment}`,
                    function (this: any, { x, mu, sd, l }, expected) {
                        const result = dnorm(x, mu, sd, l);
                        checkPrec6(expected, result);
                    }.bind(null, { x, mu, sd, l }, expcted))
            })(input, _expected)
        });
    })
    const qnormFixture = fixture.qnorm;
    describe('qnorm', () => {
        each(qnormFixture)((testCase, testCaseName) => {
            const { input, expected: _expected } = testCase;
            let cnt = 0;
            Rcycle(({ p, mu, sd, lt, l }, expcted) => {
                cnt++;
                const comment = createComment({ p, mu, sd, lt, l });
                it(`test:${cnt}\t→${comment}`,
                 function (this: any, { x, mu, sd, l }, expected) {
                    const result = qnorm(p, mu, sd, lt, l);
                    checkPrec6(expected, result);
                }.bind(null, { p, mu, sd, lt, l }, expcted))
            })(input, _expected)
        });
    })
    const pnormFixture = fixture.pnorm;
    describe('pnorm', () => {
        each(pnormFixture)((testCase, testCaseName) => {
            const { input, expected } = testCase;
            let cnt = 0;
            Rcycle(({ q, mu, sd, lt, l,}, _expected ) => {
                cnt++;
                const comment = createComment({ q, mu, sd, lt, l });
                it(`test:${cnt}\t→${comment}`, 
                function(this:any,{q, mu, sd, lt, l}, expected) {
                    const result = pnorm(q, mu, sd, lt, l);
                    checkPrec6(expected, result);
                }.bind(null, {q,mu,sd, lt,l}, _expected))
            })(input, expected)
        });
    })
})


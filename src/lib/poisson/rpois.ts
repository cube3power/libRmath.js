'use strict'
/* This is a conversion from libRmath.so to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as debug from 'debug';

import {
  imax2,
  imin2,
  M_1_SQRT_2PI,
  ML_ERR_return_NAN
} from '../common/_general';

import { exp_rand } from '../exp/sexp';
import { randomGenHelper } from '../r-func';
import { IRNGNormal } from '../rng/normal';
import { fsign } from '../signrank/fsign';

const { trunc, log, abs: fabs, pow, exp, floor, sqrt } = Math;
const { isFinite: R_FINITE } = Number;


const a0 = -0.5;
const a1 = 0.3333333;
const a2 = -0.2500068;
const a3 = 0.2000118;
const a4 = -0.1661269;
const a5 = 0.1421878;
const a6 = -0.1384794;
const a7 = 0.125006;

const one_7 = 0.1428571428571428571;
const one_12 = 0.0833333333333333333;
const one_24 = 0.0416666666666666667;

const printer_rpois = debug('rpois');

export function rpois(
  n: number,
  mu: number,
  rng: IRNGNormal
): number[] {
  return randomGenHelper(n, rpoisOne, mu, rng);
}


export function rpoisOne(mu: number, rng: IRNGNormal): number {
  /* Factorial Table (0:9)! */
  const fact = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880];

  /* These are static --- persistent between calls for same mu : */
  let l = 0;
  let m = 0;
  let pp = new Array(36);
  let b1 = 0;
  let b2 = 0;
  let c = 0;
  let c0 = 0;
  let c1 = 0;
  let c2 = 0;
  let c3 = 0;
  let p0 = 0;
  let p = 0;
  let q = 0;
  let s = 0;
  let d = 0;
  let omega = 0;
  let big_l = 0; /* integer "w/o overflow" */
  let muprev = 0;
  let muprev2 = 0; /*, muold	 = 0.*/

  /* Local Vars  [initialize some for -Wall]: */
  let del;
  let difmuk = 0;
  let E = 0;
  let fk = 0;
  let fx;
  let fy;
  let g;
  let px;
  let py;
  let t = 0;
  let u = 0;
  let v;
  let x;
  let pois = -1;
  let k;
  let kflag = 0;
  let big_mu;
  let new_big_mu = false;

  if (!R_FINITE(mu) || mu < 0) {
    return ML_ERR_return_NAN(printer_rpois);
  }
  if (mu <= 0) return 0;

  big_mu = mu >= 10;
  if (big_mu) {
    new_big_mu = false;
  }

  if (!(big_mu && mu === muprev)) {
    /* maybe compute new persistent par.s */

    if (big_mu) {
      new_big_mu = true;
      /* Case A. (recalculation of s,d,l	because mu has changed):
             * The poisson probabilities pk exceed the discrete normal
             * probabilities fk whenever k >= m(mu).
             */
      muprev = mu;
      s = sqrt(mu);
      d = 6 * mu * mu;
      big_l = floor(mu - 1.1484);
      /* = an upper bound to m(mu) for all mu >= 10.*/
    } else {
      /* Small mu ( < 10) -- not using normal approx. */

      /* Case B. (start new table and calculate p0 if necessary) */

      /*muprev = 0.;-* such that next time, mu != muprev ..*/
      if (mu !== muprev) {
        muprev = mu;
        m = imax2(1, trunc(mu));
        l = 0; /* pp[] is already ok up to pp[l] */
        q = p0 = p = exp(-mu);
      }

      while (true) {
        /* Step U. uniform sample for inversion method */
        u = rng.internal_unif_rand();
        if (u <= p0) return 0;

        /* Step T. table comparison until the end pp[l] of the
                   pp-table of cumulative poisson probabilities
                   (0.458 > ~= pp[9](= 0.45792971447) for mu=10 ) */
        if (l !== 0) {
          for (k = u <= 0.458 ? 1 : imin2(l, m); k <= l; k++)
            if (u <= pp[k]) return k;
          if (l === 35)
            /* u > pp[35] */
            continue;
        }
        /* Step C. creation of new poisson
                   probabilities p[l..] and their cumulatives q =: pp[k] */
        l++;
        for (k = l; k <= 35; k++) {
          p *= mu / k;
          q += p;
          pp[k] = q;
          if (u <= q) {
            l = k;
            return k;
          }
        }
        l = 35;
      } /* end(repeat) */
    } /* mu < 10 */
  } /* end {initialize persistent vars} */

  /* Only if mu >= 10 : ----------------------- */

  /* Step N. normal sample */
  g =
    mu + s * (rng.norm_randOne() as number); /* norm_rand() ~ N(0,1), standard normal */

  if (g >= 0) {
    pois = floor(g);
    /* Step I. immediate acceptance if pois is large enough */
    if (pois >= big_l) return pois;
    /* Step S. squeeze acceptance */
    fk = pois;
    difmuk = mu - fk;
    u = rng.internal_unif_rand(); /* ~ U(0,1) - sample */
    if (d * u >= difmuk * difmuk * difmuk) return pois;
  }

  /* Step P. preparations for steps Q and H.
       (recalculations of parameters if necessary) */

  if (new_big_mu || mu !== muprev2) {
    /* Careful! muprev2 is not always == muprev
           because one might have exited in step I or S
           */
    muprev2 = mu;
    omega = M_1_SQRT_2PI / s;
    /* The quantities b1, b2, c3, c2, c1, c0 are for the Hermite
         * approximations to the discrete normal probabilities fk. */

    b1 = one_24 / mu;
    b2 = 0.3 * b1 * b1;
    c3 = one_7 * b1 * b2;
    c2 = b2 - 15 * c3;
    c1 = b1 - 6 * b2 + 45 * c3;
    c0 = 1 - b1 + 3 * b2 - 15 * c3;
    c = 0.1069 / mu; /* guarantees majorization by the 'hat'-function. */
  }

  let gotoStepF = false;
  let once = true;
  while (true) {
    if (once) {
      once = false;
      if (g >= 0) {
        /* 'Subroutine' F is called (kflag=0 for correct return) */
        kflag = 0;
        //goto Step_F;
        gotoStepF = true;
      }
    }
    if (!gotoStepF) {
      /* Step E. Exponential Sample */

      E = exp_rand(rng.internal_unif_rand); /* ~ Exp(1) (standard exponential) */

      /*  sample t from the laplace 'hat'
                (if t <= -0.6744 then pk < fk for all mu >= 10.) */
      u = 2 * (rng.internal_unif_rand()) - 1;
      t = 1.8 + fsign(E, u >= 0);
    }
    if (t > -0.6744 || gotoStepF) {
      if (!gotoStepF) {
        pois = floor(mu + s * t);
        fk = pois;
        difmuk = mu - fk;

        /* 'subroutine' F is called (kflag=1 for correct return) */
        kflag = 1;
      }
      gotoStepF = false;
      //Step_F: /* 'subroutine' F : calculation of px,py,fx,fy. */

      if (pois < 10) {
        /* use factorials from table fact[] */
        px = -mu;
        py = pow(mu, pois) / fact[trunc(pois)];
      } else {
        /* Case pois >= 10 uses polynomial approximation
                   a0-a7 for accuracy when advisable */
        del = one_12 / fk;
        del = del * (1 - 4.8 * del * del);
        v = difmuk / fk;
        if (fabs(v) <= 0.25)
          px =
            fk *
              v *
              v *
              (((((((a7 * v + a6) * v + a5) * v + a4) * v + a3) * v + a2) * v +
                a1) *
                v +
                a0) -
            del; /* |v| > 1/4 */
        else px = fk * log(1 + v) - difmuk - del;
        py = M_1_SQRT_2PI / sqrt(fk);
      }
      x = (0.5 - difmuk) / s;
      x *= x; /* x^2 */
      fx = -0.5 * x;
      fy = omega * (((c3 * x + c2) * x + c1) * x + c0);
      if (kflag > 0) {
        /* Step H. Hat acceptance (E is repeated on rejection) */
        if (c * fabs(u) <= py * exp(px + E) - fy * exp(fx + E)) {
          break;
        }
      } else if (fy - u * fy <= py * exp(px - fx)) {
        /* Step Q. Quotient acceptance (rare case) */
        break;
      }
    } /* t > -.67.. */
  }
  return pois;
}

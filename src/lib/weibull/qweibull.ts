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

import { ML_ERR_return_NAN, R_Q_P01_boundaries } from '../common/_general';

import { R_DT_Clog } from '../exp/expm1';

const { pow } = Math;
const { isNaN: ISNAN, POSITIVE_INFINITY: ML_POSINF } = Number;
const printer = debug('qweibull');

export function qweibull(
  p: number,
  shape: number,
  scale: number = 1,
  lowerTail: boolean = true,
  logP: boolean = false
): number {
  if (ISNAN(p) || ISNAN(shape) || ISNAN(scale)) return p + shape + scale;

  if (shape <= 0 || scale <= 0) return ML_ERR_return_NAN(printer);

  let rc = R_Q_P01_boundaries(lowerTail, logP, p, 0, ML_POSINF);
  if (rc !== undefined) {
    return rc;
  }
  return scale * pow(-R_DT_Clog(lowerTail, logP, p), 1 / shape);
}

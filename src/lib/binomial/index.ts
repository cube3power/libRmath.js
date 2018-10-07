/* This is a conversion from LIB-R-MATH to Typescript/Javascript
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
import { IRNG } from '../rng/irng';
import { MersenneTwister } from '../rng/mersenne-twister';
import { dbinom } from './dbinom';
import { pbinom } from './pbinom';
import { qbinom } from './qbinom';
import { rbinom } from './rbinom';

export function Binomial(rng: IRNG = new MersenneTwister()) {
  return {
    dbinom,
    pbinom,
    qbinom,
    rbinom: (N: number, nin: number, pp: number) => rbinom(N, nin, pp, rng)
  };
}

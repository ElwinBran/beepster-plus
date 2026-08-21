export const BASE_FREQUENCY = 440;
export const BASE_KEY_INDEX = 69;

/*
The MIT License (MIT)

Copyright (c) 2014 Jamison Dance (https://jamison.dance)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
// Substantial code copied from git repo to generate note frequencies

export function allMidiFrequenciesIndexed(): Array<number> {
    let result: number[] = [];
    for (let octave = 0; octave < 10; octave++) {
        for (let step = 0; step < 12; step++) {
            let keyNumber = step + (octave * 12);
            let floatFreq = BASE_FREQUENCY * Math.pow(2, (keyNumber - BASE_KEY_INDEX) / 12);
            result.push(parseFloat(floatFreq.toFixed(2)));
        }
    }
    return result;
}

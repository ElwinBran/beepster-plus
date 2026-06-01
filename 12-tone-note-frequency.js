let frequencyMapping = {};

// 
const DIATONIC_NOTE_SYMBOLS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const CHROMATIC_WHOLE_TONE_INDICES = [0, 2, 4, 5, 7, 9, 11];

function frequencyFromNote(note) {
    return frequencyMapping[note];
}


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

function initializeFrequenies() {
    for (let octave = 0; octave < 10; octave++) {
        for (let step = 0; step < 12; step++) {
            let keyNumber = step + (octave * 12);
            let floatFreq = parseFloat((440 * Math.pow(2, (keyNumber - 57) / 12)), 10);
            let resultFrequency = parseFloat(floatFreq.toFixed(2), 10);
            if (CHROMATIC_WHOLE_TONE_INDICES.includes(step)) {
                let diatonicNoteIndex = CHROMATIC_WHOLE_TONE_INDICES.indexOf(step);
                let noteLetter = DIATONIC_NOTE_SYMBOLS[diatonicNoteIndex];
                frequencyMapping[noteLetter + octave] = resultFrequency;
            } else {
                let lowerLetterIndex = CHROMATIC_WHOLE_TONE_INDICES.indexOf(step + 1);
                let upperLetterIndex = CHROMATIC_WHOLE_TONE_INDICES.indexOf(step - 1);
                let lowerLetter = DIATONIC_NOTE_SYMBOLS[lowerLetterIndex];
                let upperLetter = DIATONIC_NOTE_SYMBOLS[upperLetterIndex];
                let esNote = lowerLetter + 'b' + octave;
                let isNote = upperLetter + '#' + octave;
                frequencyMapping[esNote] = resultFrequency;
                frequencyMapping[isNote] = resultFrequency;
            }
        }
    }
}

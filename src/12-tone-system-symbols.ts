const DEFAULT_ROOT = 'C';
const DIATONIC_NOTE_SYMBOLS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const CHROMATIC_WHOLE_TONE_INDICES = [0, 2, 4, 5, 7, 9, 11];
const LOWERED_SEMITONE_SYMBOL = 'b';
const SHARPENED_SEMITONE_SYMBOL = '#';

let chromaticNoteLetters;
let chromaticFlatSymbolsMem = null;

function isWholeTone(noteIndex) {
    return CHROMATIC_WHOLE_TONE_INDICES.includes(noteIndex);
}

function symbolToNoteIndex(symbol) {
    let result = 0;
    let diatonic = DIATONIC_NOTE_SYMBOLS.indexOf(symbol)
    if (diatonic >= 0) {
        result = CHROMATIC_WHOLE_TONE_INDICES[diatonic];
    } else {
        result = CHROMATIC_WHOLE_TONE_INDICES[DIATONIC_NOTE_SYMBOLS.indexOf(symbol.charAt(0))];
        if (symbol.charAt(1) == SHARPENED_SEMITONE_SYMBOL) {
            result++;
        } else {
            result--;
        }
    }
    return result;
}

function chromaticScale() {
    let result = [];
    let baseSymbolIndex = 0;
    for (let note = 0; note < 12; note++) {
        if (note == CHROMATIC_WHOLE_TONE_INDICES[baseSymbolIndex]) {
            result.push(DIATONIC_NOTE_SYMBOLS[baseSymbolIndex]);
        } else {
            baseSymbolIndex++;
            if (note == CHROMATIC_WHOLE_TONE_INDICES[baseSymbolIndex]) {
                result.push(DIATONIC_NOTE_SYMBOLS[baseSymbolIndex]);
            } else {
                result.push((
                    DIATONIC_NOTE_SYMBOLS[baseSymbolIndex] + LOWERED_SEMITONE_SYMBOL
                ));
            }
        }
    }
    return result;
}

function noteAlwaysSharp(noteIndex, rootIndex) {

}

function noteAlwaysFlat(noteIndex, rootIndex) {
    if (chromaticFlatSymbolsMem == null) {
        chromaticFlatSymbolsMem = chromaticScale();
    }
    let fixedNoteId = (noteIndex + rootIndex) % 12;
    return chromaticFlatSymbolsMem[fixedNoteId];
}

function noteBoth(noteIndex) {
    let result = [];
    let diatonicNoteIndex = CHROMATIC_WHOLE_TONE_INDICES.indexOf(noteIndex);
    if (diatonicNoteIndex >= 0) {
        result.push(DIATONIC_NOTE_SYMBOLS[diatonicNoteIndex]);
    } else {
        let lowerLetterIndex = CHROMATIC_WHOLE_TONE_INDICES.indexOf(noteIndex + 1);
        let upperLetterIndex = CHROMATIC_WHOLE_TONE_INDICES.indexOf(noteIndex - 1);
        let lowerLetter = DIATONIC_NOTE_SYMBOLS[lowerLetterIndex];
        let upperLetter = DIATONIC_NOTE_SYMBOLS[upperLetterIndex];
        result.push(lowerLetter + LOWERED_SEMITONE_SYMBOL);
        result.push(upperLetter + SHARPENED_SEMITONE_SYMBOL);
    }
    return result;
}

/*
function noteBothRootOverride(noteIndex, root) {
    let result = [];
    let shift = symbolToNoteIndex(root);
    let diatonicNoteIndex = CHROMATIC_WHOLE_TONE_INDICES.indexOf(step);
    let noteLetter = DIATONIC_NOTE_SYMBOLS[diatonicNoteIndex];
} else {
    let lowerLetterIndex = CHROMATIC_WHOLE_TONE_INDICES.indexOf(step + 1);
    let upperLetterIndex = CHROMATIC_WHOLE_TONE_INDICES.indexOf(step - 1);
    let lowerLetter = DIATONIC_NOTE_SYMBOLS[lowerLetterIndex];
    let upperLetter = DIATONIC_NOTE_SYMBOLS[upperLetterIndex];
    let esNote = lowerLetter + 'b' + octave;
    let isNote = upperLetter + '#' + octave;
    return result;
}
*/
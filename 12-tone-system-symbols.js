const DIATONIC_NOTE_SYMBOLS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const CHROMATIC_WHOLE_TONE_INDICES = [0, 2, 4, 5, 7, 9, 11];
const LOWERED_SEMITONE_SYMBOL = 'b';
const SHARPENED_SEMITONE_SYMBOL = '#';

let chromaticFlatSymbolsMem = null;
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

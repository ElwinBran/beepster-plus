const DIATONIC_NOTE_SYMBOLS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const CHROMATIC_WHOLE_TONE_INDICES = [0, 2, 4, 5, 7, 9, 11];
const LOWERED_SEMITONE_SYMBOL = 'b';
const SHARPENED_SEMITONE_SYMBOL = '#';

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

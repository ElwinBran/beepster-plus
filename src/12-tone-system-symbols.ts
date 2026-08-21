export const DEFAULT_ROOT: string = 'C';
export const DIATONIC_NOTE_SYMBOLS: ReadonlyArray<string> = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const WHOLE_TONE_CHROMATIC_INDICES: ReadonlyArray<number> = [0, 2, 4, 5, 7, 9, 11];
export const LOWERED_SEMITONE_SYMBOL: string = 'b';
export const SHARPENED_SEMITONE_SYMBOL: string = '#';


export function mapMidiNotes(indexedFrequencies: Map<number, number>): Map<string, number> {
    const start: number = 21; // A0
    let currentNote = WHOLE_TONE_CHROMATIC_INDICES[DIATONIC_NOTE_SYMBOLS.indexOf('A')] - 1;
    let currentOctave = 0;
    const max: number = 160; // arbitrary and also not official midi
    let result = new Map<string, number>();
    for (let index = start; index < max; index++) {
        currentNote++;
        if (currentNote == 12) {
            currentNote = 0;
            currentOctave++;
        }
        if (indexedFrequencies.has(index)) {
            let diatonicNoteIndex = WHOLE_TONE_CHROMATIC_INDICES.indexOf(currentNote);
            let frequency = indexedFrequencies.get(index)!;
            if (diatonicNoteIndex >= 0) {
            if (WHOLE_TONE_CHROMATIC_INDICES.indexOf(currentNote) >= 0) {
                result.set(DIATONIC_NOTE_SYMBOLS[diatonicNoteIndex] + currentOctave, frequency);
            } else {
                let lowerLetterIndex = WHOLE_TONE_CHROMATIC_INDICES.indexOf(currentNote + 1);
                let upperLetterIndex = WHOLE_TONE_CHROMATIC_INDICES.indexOf(currentNote - 1);
                let lowerLabel = DIATONIC_NOTE_SYMBOLS[lowerLetterIndex] + LOWERED_SEMITONE_SYMBOL;
                let upperLabel = DIATONIC_NOTE_SYMBOLS[upperLetterIndex] + SHARPENED_SEMITONE_SYMBOL;
                result.set(lowerLabel, frequency);
                result.set(upperLabel, frequency);
            }
        }
    }}
    return result;
}


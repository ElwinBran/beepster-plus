

export function makeAbsoluteNote(getTuningDivision: () => number) {
    return (noteIndex: number, octave: number) => {
        return noteIndex + getTuningDivision() * octave;
    };
}

export function degreeOctaveFrequencyLookup(
    scale: number[], octaveMin: number, octaveMax: number,
    absoluteNote: (degree: number, octave: number) => number,
    absoluteFrequenceTable: number[]
) {
    let result: number[][] = [];
    const degrees = (scale[0] == 0)? scale: [0].concat(scale);
    // notice that degree 1 is not the root, that is zero instead
    degrees.forEach((noteIndex: number, degree: number) => {
        result.push([]);
        for (let octave = octaveMin; octave <= octaveMax; octave++){
            const note = absoluteNote(noteIndex, octave);
            const frequency = absoluteFrequenceTable[note];
            result[degree].push(frequency);
        }
    });
    return result;
}

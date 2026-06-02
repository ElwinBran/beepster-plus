
// root not included, always 0
const HEPTATONIC_SCALE = [
    {
        name: "Minor pentatonic",
        steps: [],
        indices: [3, 5, 7, 10]
    },
    {
        name: "Major pentatonic",
        steps: [],
        indices: [2, 4, 7, 9]
    },
    {
        name: "Suspended",
        steps: [],
        indices: [2, 5, 7, 10]
    },
    {
        name: "Blues minor",
        steps: [],
        indices: [3, 5, 8, 10]
    },
    {
        name: "Blues major",
        steps: [],
        indices: [2, 5, 7, 9]
    },
    {
        name: "Kumoijoshi",
        steps: [],
        indices: [2, 3, 7, 8] //4
    }
];

function fitNoteToScale(noteIndex, scaleIndex) {
    let scaleSize = 5;
    let inScaleNote = 0
    if (noteIndex > 0) { 
        inScaleNote = noteIndex % scaleSize;
    }
    else if (noteIndex < 0) {
        inScaleNote = noteIndex % scaleSize;
        inScaleNote += (inScaleNote < 0)? scaleSize: 0;
    }
    return (inScaleNote === 0)? 0: 
        HEPTATONIC_SCALE[scaleIndex].indices[inScaleNote - 1];
}

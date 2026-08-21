import { ADSREnvelope, VoiceState, MelodyTrack } from "./model";
import { OCTAVES, BEATS, VOLUMES, PATTERN_LENGTH } from "./configuration";

// Default functions to create app states.


export function makeUniformRandomDegreeMelodyFactory(
    scaleSize: () => number,
    octaves: () => number
): () => Array<number> {
    return () => {
        return Array.from(
            { length: PATTERN_LENGTH[PATTERN_LENGTH.length - 1] },
            () => Math.floor(Math.random() * scaleSize() * octaves())
        );
    };
}

export function randomEnvelope() {
    let attack, decay;
    if (Math.random() >= 0.5) {
        attack = Math.random();
        decay = Math.min(1 - attack, Math.random());
    } else {
        decay = Math.random();
        attack = Math.min(1 - decay, Math.random());
    }
    let sustain = Math.random();
    let release = Math.random() * 2;
    return new ADSREnvelope(attack, decay, sustain, release);
}

export function randomMelodyTrack(timbre: number, length: number, 
        randomness: number, randomMelody: () => Array<number>) {
    let envelope = randomEnvelope();
    let octave = OCTAVES[Math.floor(Math.random() * OCTAVES.length)];
    let beatDivision = BEATS[Math.floor(Math.random() * BEATS.length)];
    let volume = VOLUMES[Math.floor(Math.random() * VOLUMES.length)];
    let melody = randomMelody();
    let state = new VoiceState(false, timbre, volume, false);
    return new MelodyTrack(state, envelope, octave, 
        beatDivision, length, melody, randomness);
}
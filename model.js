const MELODY_TIMBRES = 4;
const OCTAVES = [1, 2, 3, 4, 5, 6];
const VOLUMES = [0.1, 0.2, 0.4, 0.6, 0.8, 1];
const BEATS = [16, 8, 4, 2, 1];
const RANDOM_START = 0;
const RANDOM_END = 1;

class ADSREnvelope {
    constructor(attack, decay, sustain, release) {
        this.attack = attack;
        this.decay = decay;
        this.sustain = sustain;
        this.release = release;
    }
}

class VoiceState {
    constructor(playing, timbre, volume, freezeState) {
        this.playing = playing;
        this.timbre = timbre;
        this.volume = volume;
        this.freezeState = freezeState;
    }
}

class MelodyTrack {

    constructor(state, envelope, octave, beatDivision, melodyLength, melody, randomness) {
        this.state = state;
        this.envelope = envelope;
        this.octave = octave;
        this.division = beatDivision;
        this.melodyLength = melodyLength;
        this.melody = melody;
        this.randomness = randomness;
    }
}

// WIP!
class PercussionTrack {

    constructor(state, envelope, pattern, randomness) {
        this.state = state;
        this.envelope = envelope;
        this.division = beatDivision;
        this.pattern = pattern;
        this.randomness = randomness;
    }
}

function randomEnvelope() {
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

function randomMelodyTrack(randomMelody) {
    let envelope = randomEnvelope();
    let timbre = Math.floor(Math.random() * MELODY_TIMBRES);
    let octave = OCTAVES[Math.floor(Math.random() * OCTAVES.length)];
    let beatDivision = BEATS[Math.floor(Math.random() * BEATS.length)];
    let volume = VOLUMES[Math.floor(Math.random() * VOLUMES.length)];
    let melody = randomMelody();
    let state = new VoiceState(true, timbre, volume, false);
    return new MelodyTrack(state, envelope, octave, 
        beatDivision, 8, melody, 1);
}

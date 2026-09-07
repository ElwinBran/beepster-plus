import { UserTimbreMode } from "./configuration";
import { ADSREnvelope, MelodyTrack, Track } from "./model";

// audio context
export type PlayNoteOscillator = (
    frequency: number, 
    timbreIndex: number, 
    envelope: ADSREnvelope, 
    noteLength: number,
    volume: number
) => any;

export function makePlayNoteOscillator(
    audioContext: AudioContext,
    timbreTable: Array<UserTimbreMode>
): PlayNoteOscillator {
    return (frequency: number, timbreIndex: number, 
            envelope: ADSREnvelope, noteLength: number, volume: number) => {
        let t = audioContext.currentTime;
        let osc = timbreTable[timbreIndex].oscillator(audioContext);
        osc.frequency.value = frequency;
        let env = audioContext.createGain();
        env.connect(audioContext.destination);
        env.gain.cancelScheduledValues(t);
        env.gain.setValueAtTime(0, t);
        let attack = noteLength * envelope.attack;
        env.gain.linearRampToValueAtTime(volume, t + attack)
        let decay = noteLength * envelope.decay;
        env.gain.linearRampToValueAtTime(envelope.sustain * volume, t + attack + decay)
        env.gain.linearRampToValueAtTime(0, t + noteLength)
        osc.connect(env)
        osc.start()
        osc.stop(t + noteLength + envelope.release)
    };
}

export type TrackAdvanceAction<T extends Track> = (
        track: T, 
        position: number, 
        duration: number,
        setPosition: (newValue: number) => any) => any

export function makeMelodyTrackAdvancer(
    correspondingFrequency: (note: number, octave: number) => number,
    playNote: PlayNoteOscillator,
    randomLoop: () => Array<number>,
    randomThreshold: number
): TrackAdvanceAction<MelodyTrack> {
    return (track: MelodyTrack, currentPosition: number, duration:number, 
                      setPosition: (newValue: number) => any) => {
        if (currentPosition % track.beatDivision === 0) {
            let loopId = Math.floor(currentPosition / track.beatDivision)
            if (loopId >= track.melodyLength) {
                loopId = 0
                setPosition(0);
                if (!track.state.freezeState && 
                        (Math.random() < randomThreshold * track.randomness)) {
                    track.melody = randomLoop()
                }
            }
            if (track.state.playing) {
                let note = track.melody[loopId]
                let freq = correspondingFrequency(note, track.octave);
                let volume = track.state.volume / track.octave
                playNote(freq, track.state.timbre, track.envelope, track.beatDivision * (duration / 1000), volume)
            }
        }
        setPosition(currentPosition + 1);
    };
}

export function startTracks<T extends Track>(tracks: Array<T>, getCurrentBPM: () => number,
                            advance: TrackAdvanceAction<T>) {
    let trackPosition = tracks.map(() => 0)
    let play = () => {
        const interval = (60 / getCurrentBPM()) * 1000; // MilliSeconds
        tracks.forEach((track, index) => {
            advance(track, trackPosition[index], interval,
                (newValue: number) => {trackPosition[index] = newValue;}
            )
        });
        setTimeout(play, interval);
    }
    play();
}

//playAction: (data: T) => any, 


/* 
requires randomloop
function advanceTrack(track: Track, currentPosition: number, 
                      setPosition: (newValue: number) => any) {
if (noteIds[i] % track.division === 0) {
                let loopId = Math.floor(noteIds[i] / track.division)
                if (loopId >= track.melodyLength) {
                    loopId = 0
                    noteIds[i] = 0
                    if (!track.state.freezeState && 
                            (Math.random() < chanceForNewLoop * track.randomness)) {
                        track.melody = randomLoop()
                    }
                }
                if (track.state.playing) {
                    let note = track.melody[loopId]
                    let freq = frequencyFromNote(note + track.octave)
                    let volume = track.state.volume / track.octave
                    playNote(freq, track.state.timbre, track.envelope, track.division * 0.125, volume)
                }
            }
            noteIds[i]++
}
*/
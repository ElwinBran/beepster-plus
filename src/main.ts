import { mapMidiNotes } from './12-tone-system-symbols';
import { HEPTATONIC_SCALE } from './12-tone-scales';
import { MelodyTrack, Track, } from './model';
import { allMidiFrequenciesIndexed } from './midi-frequencies';
import { degreeOctaveFrequencyLookup, makeAbsoluteNote } from './scale-degree-conversion';
import { BEATS, OCTAVES, PATTERN_LENGTH, RANDOM_END, RANDOM_START, UserTimbreMode, VOLUMES } from './configuration';
import { makeUniformRandomDegreeMelodyFactory, randomMelodyTrack } from './model-instance';
import { BeepsterContext, MELODY_TRACK_TEMPLATE, RenderData, trackCollectionElement } from './layout';
import { makeMelodyTrackAdvancer, makePlayNoteOscillator, startTracks } from './looper-engine';
import { PeriodicWaveModule } from './periodic-waves';



/*
let updateScale = (newScale) => {
    if (typeof newScale !== 'string') {
        if (currentScale === 'minor-pentatonic') currentScale = 'major-pentatonic'
        else if (currentScale === 'major-pentatonic') currentScale = 'suspended'
        else if (currentScale === 'suspended') currentScale = 'blues-minor'
        else if (currentScale === 'blues-minor') currentScale = 'blues-major'
        else if (currentScale === 'blues-major') currentScale = 'minor-pentatonic'
    }
    notes = scales[currentScale]
    tracks.forEach(track => {
        track.melody = randomLoop()
    })

    document.getElementById('scale-button').innerText = currentScale.replace('-', ' ') + ' scale'
    updateShareUrl()
}

function makeScaleHandler(scales, scaleDisplayUpdate) {
    return () => {
        currentScaleIndex = (currentScaleIndex + 1) % scales.length;

        scaleDisplayUpdate(scales[currentScaleIndex].name);
    };
}
*/

/**
 * HTML hooks and driver code:
 * 
 * 
 */

window.onload = () => {
    // App variables:
    let tracks: Array<MelodyTrack>
    


    let startButton = document.getElementById('start-button')!;
    startButton.addEventListener('click', () => {
        AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        const allowedFrequencies = allMidiFrequenciesIndexed();
        const noteFrequencyLookup: ReadonlyMap<string, number> = mapMidiNotes(
            new Map<number, number>(
                allowedFrequencies.map(
                    (num, index) => [index, num])
        ));
        const getBPM = () => 480;
        const frequencyLookupMap = new Map(
            HEPTATONIC_SCALE.map((scale) => [scale, 
                degreeOctaveFrequencyLookup(
                    scale.indices, 0, 10,
                    makeAbsoluteNote(()=>12),
                    allowedFrequencies
                )]
            ));
        const currentScale = () => {return HEPTATONIC_SCALE[0]};
        const scaleDegreeNoteFrequency = (degree: number, octave: number) => {
            return frequencyLookupMap.get(currentScale())![degree][octave];
        }
        const periodicOscs = new PeriodicWaveModule(audioCtx);
        const SINE_TIMBRE = new UserTimbreMode("Sine", 's', periodicOscs.sineOscillator);
        const TRIANGLE_TIMBRE = new UserTimbreMode("Triangle", '^', periodicOscs.triangleOscillator);
        const SAWTOOTH_TIMBRE = new UserTimbreMode("Sawtooth", 'z', periodicOscs.sawtoothOscillator);
        const SQUARE_TIMBRE = new UserTimbreMode("Square-50", '[', periodicOscs.square50Oscillator);
        const PULSE_TIMBRE = new UserTimbreMode("Square-25", 'H', periodicOscs.square25Oscillator);
        const HALFPULSE_TIMBRE = new UserTimbreMode("Square-12.5", '|', periodicOscs.square12Oscillator);
        const CAPPED_SINE_TIMBRE = new UserTimbreMode("Sine", 'b', periodicOscs.cappedSineOscillator);
        const FOLDED_SINE_TIMBRE = new UserTimbreMode("Folded sine", '{', periodicOscs.foldedSineOscillator);
        const MELODY_TRACK_TIMBRES = [
            SINE_TIMBRE,
            TRIANGLE_TIMBRE,
            SAWTOOTH_TIMBRE,
            SQUARE_TIMBRE,
            PULSE_TIMBRE ,
            HALFPULSE_TIMBRE ,
            CAPPED_SINE_TIMBRE,
            FOLDED_SINE_TIMBRE
        ];
        let config = new BeepsterContext(
        MELODY_TRACK_TIMBRES, PATTERN_LENGTH, BEATS,
        VOLUMES, OCTAVES, {start: RANDOM_START, end: RANDOM_END}
    );
        const randomTimbre = () => Math.floor(Math.random() * MELODY_TRACK_TIMBRES.length);
        const randomLoop = makeUniformRandomDegreeMelodyFactory(
            () => 5, () => 1
        );
        const newMelodyTrack = () => {
            return randomMelodyTrack(
                randomTimbre(), 8, 0.5, randomLoop
            );
        };


        let melodyInput:HTMLInputElement = document.getElementById('melody-counter') as HTMLInputElement;
        let numberOfTracks = parseInt(melodyInput.value);
        tracks = Array(numberOfTracks).fill(0).map(() => newMelodyTrack());

        // TODO
        /*
        let scaleButton = document.getElementById('scale-button') as HTMLButtonElement;
        scaleButton.innerText = 'minor pentatonic scale' 
        scaleButton.addEventListener('click', makeScaleHandler(
            HEPTATONIC_SCALE, (text: string) => {
                scaleButton.innerText = text
            }
        ))
        */
        let trackList = document.getElementById('tracks');
        
        trackList!.replaceWith(trackCollectionElement<MelodyTrack>(
            tracks, 'track', MELODY_TRACK_TEMPLATE,
            (track: Track, index: number, template) => {
                return template.render( config, () => {return tracks[index]},
                    new RenderData<MelodyTrack>(newMelodyTrack, index)
                );
            }
        ));
        trackList!.id = 'tracks';
        startTracks(tracks, getBPM, 
            makeMelodyTrackAdvancer(
                scaleDegreeNoteFrequency,
                makePlayNoteOscillator(audioCtx, MELODY_TRACK_TIMBRES),
                randomLoop,
                0.5
            )
        );
        document.getElementById('start-screen')!.className = 'hidden'
        document.getElementById('play-screen')!.className = ''
    })
}

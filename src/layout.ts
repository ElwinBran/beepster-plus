import { PATTERN_LENGTH, UserTimbreMode } from "./configuration";
import { MelodyTrack, Track } from "./model";
import { renderButton, renderCheckbox, renderEnvelopeElement, renderModifier, renderModifierValueDisplay, renderSlider, renderTimbreElement } from "./ui-elements";

export class BeepsterContext {
    constructor(
        public readonly melodyTimbreData: Array<UserTimbreMode>,
        public readonly allowedLoopSteps: Array<number>,
        public readonly allowedBeatValue: Array<number>,
        public readonly allowedVolume: Array<number>,
        public readonly allowedOctaves: Array<number>,
        public readonly randomRange: {start: number, end: number}
    ) {}
}

export class RenderData<T extends Track> {
    constructor(
        public readonly newTrack: () => T,
        public readonly trackIndex: number
    ){}
}

export class TrackTemplate<T extends Track> {
    constructor(
        public readonly id: string,
        public readonly render: (appState: BeepsterContext, 
                                 trackGetter: () => T, 
                                 additionalArguments?: RenderData<T>) => HTMLElement
    ){}
}

export type TrackControlRenderFormat<T extends Track> = (
    track: Track, 
    index: number, 
    template: TrackTemplate<T>
) => HTMLElement;

export function trackCollectionElement<T extends Track>(tracks: Array<T>, trackClass: string, 
                                       renderTemplate: Array<TrackTemplate<T>>,
                                       delegateRender: TrackControlRenderFormat<T>):HTMLElement {
    let result = document.createElement('div');
    tracks.forEach((track, trackId) => {
        let trackElement = document.createElement('div');
        trackElement.className = trackClass;
        renderTemplate.forEach((elementTemplate) => {
            trackElement.appendChild(
                delegateRender(track, trackId, elementTemplate)
            );
        });
        result.appendChild(trackElement);
    })
    return result;
}

export const MELODY_TRACK_TEMPLATE: Array<TrackTemplate<MelodyTrack>> = [
    new TrackTemplate("playing", 
        (appState, trackGetter) => 
            renderCheckbox(trackGetter().state.playing, "", 
                (e:Event) => trackGetter().state.playing = (<HTMLInputElement>e.target!).checked)
    ),
    new TrackTemplate("wave", 
        (appState, trackGetter) => 
            renderTimbreElement(trackGetter, trackGetter().state.timbre, 
                appState.melodyTimbreData, 
                () => trackGetter().state.timbre = 
                    (trackGetter().state.timbre + 1) % appState.melodyTimbreData.length)
    ),
    new TrackTemplate("envelope", 
        (appState, trackGetter, additionalArguments?: RenderData<MelodyTrack>) => 
            renderEnvelopeElement(trackGetter().envelope, additionalArguments!.trackIndex, 
                trackGetter,
                () => trackGetter().envelope = additionalArguments!.newTrack().envelope)
    ),
    new TrackTemplate("speed", 
        (appState, trackGetter) => 
            renderModifier("Speed", trackGetter().beatDivision, appState.allowedBeatValue,
                value => trackGetter().beatDivision = value)
    ),
    new TrackTemplate("volume", 
        (appState, trackGetter) => 
            renderModifier("Volume", trackGetter().state.volume, appState.allowedVolume,
                (value: number) => trackGetter().state.volume = value)
    ),
    new TrackTemplate("octave", 
        (appState, trackGetter) => 
            renderModifier("Octave", trackGetter().octave, appState.allowedOctaves,
                (value: number) => trackGetter().octave = value)
    ),
    new TrackTemplate("loop_length", 
        (appState, trackGetter) => 
            renderModifierValueDisplay(
                "Notes", 
                trackGetter().melodyLength, 
                appState.allowedLoopSteps,
                (value: number) => PATTERN_LENGTH[value].toString(),
                (value: number) => trackGetter().melodyLength = value)
    ),
    new TrackTemplate("randomness", 
        (appState, trackGetter) => 
            renderSlider(trackGetter().randomness, "Randomness",
                {min: appState.randomRange.start, max: appState.randomRange.end, step: 0.01},
                (newValue) => trackGetter().randomness = parseFloat(newValue))
    ),
    new TrackTemplate("freeze_loop", 
        (appState, trackGetter) => 
            renderCheckbox(trackGetter().state.playing, "", 
                (e: Event) => trackGetter().state.freezeState = (<HTMLInputElement>e.target!).checked)
    ),
    new TrackTemplate("new_loop", 
        () => 
            renderButton("%", () => {})
    ),
    new TrackTemplate("randomize", 
        (appState, trackGetter, 
         additionalArguments?: RenderData<MelodyTrack>) => renderButton(
            "⟳", () => {
                let currentTrack = trackGetter();
                let newTrack = additionalArguments!.newTrack();
                currentTrack.state.timbre = newTrack.state.timbre;
                currentTrack.state.volume = newTrack.state.volume;
                currentTrack.envelope = newTrack.envelope;
                currentTrack.octave = newTrack.octave;
                currentTrack.beatDivision = newTrack.beatDivision;
                currentTrack.melodyLength = newTrack.melodyLength;
                currentTrack.melody = newTrack.melody;
                currentTrack.randomness = newTrack.randomness;
            })
    )
];
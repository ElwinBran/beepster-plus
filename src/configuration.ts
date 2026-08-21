
export const OCTAVES = [1, 2, 3, 4, 5, 6];
export const VOLUMES = [0.1, 0.2, 0.4, 0.6, 0.8, 1];
export const BEATS = [16, 8, 4, 2, 1];
export const RANDOM_START = 0;
export const RANDOM_END = 1;
export const PATTERN_LENGTH = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export class UserTimbreMode {
    readonly name: string;
    readonly icon: string;
    readonly oscillator: (context: AudioContext) => OscillatorNode;

    constructor(name: string, icon: string, oscillator: (context: AudioContext) => OscillatorNode) {
        this.name = name;
        this.icon = icon;
        this.oscillator = oscillator;
    }
}
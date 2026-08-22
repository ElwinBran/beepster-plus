
export class PeriodicWaveModule {

    squareWave12: PeriodicWave;
    squareWave25: PeriodicWave;
    cappedSineWave: PeriodicWave;
    foldedSineWave: PeriodicWave;

    constructor(audioContext: AudioContext) {
        this.squareWave12 = periodicSquareDutyWave(audioContext, 12.5 / 100);
        this.squareWave25 = periodicSquareDutyWave(audioContext, 25 / 100);
        this.cappedSineWave = wavetableToPeriodicWave(audioContext, asymmetricCappedSineWavetable());
        this.foldedSineWave = wavetableToPeriodicWave(audioContext, sineFoldWavetable(30));
    }

    sineOscillator(audioContext: AudioContext) {
        return new OscillatorNode(audioContext, {type: "sine"});
    }

    triangleOscillator(audioContext: AudioContext) {
        return new OscillatorNode(audioContext, {type: "triangle"});
    }

    sawtoothOscillator(audioContext: AudioContext) {
        return new OscillatorNode(audioContext, {type: "sawtooth"});
    }

    square50Oscillator(audioContext: AudioContext) {
        return new OscillatorNode(audioContext, {type: "square"});
    }

    square25Oscillator = (audioContext: AudioContext) => {
        let target = this.squareWave25;
        return new OscillatorNode(audioContext, {
            type: "custom", periodicWave: target
        });
    }

    square12Oscillator = (audioContext: AudioContext) => {
        let target = this.squareWave12;
        return new OscillatorNode(audioContext, {
            type: "custom", periodicWave: target
        });
    }

    cappedSineOscillator = (audioContext: AudioContext) => {
        let target = this.cappedSineWave;
        return new OscillatorNode(audioContext, {
            type: "custom", periodicWave: target
        });
    }

    foldedSineOscillator = (audioContext: AudioContext) => {
        let target = this.foldedSineWave
        return new OscillatorNode(audioContext, {
            type: "custom", periodicWave: target
        });
    }
}



function periodicSquareDutyWave(audioContext: AudioContext, duty: number) {
    const numHarmonics = 100;
    let real = new Float32Array(numHarmonics);
    let imaginary = new Float32Array(numHarmonics);
    real[0] = 2 * duty - 1; // DC offset
    imaginary[0] = 0;
    for (let n = 1; n < numHarmonics; n++) {
        real[n] = Math.sin(2 * Math.PI * n * duty) / (Math.PI * n);
        imaginary[n] = (1 - Math.cos(2 * Math.PI * n * duty)) / (Math.PI * n);
    }
    return audioContext.createPeriodicWave(real, imaginary);
}

/**
 * Converts a wavetable to an Web Audio PeriodicWave
 * @param {AudioContext} audioContext
 * @param {Float32Array|number[]} wavetable - Array of (audio) samples
 * @param {boolean} disableNormalization - Whether to disable normalization (default: false)
 * @returns {PeriodicWave} - The created PeriodicWave
 */
function wavetableToPeriodicWave(audioContext: AudioContext, wavetable: Float32Array, disableNormalization = false) {    
    const samples = wavetable instanceof Float32Array ? 
        wavetable : new Float32Array(wavetable);
    let numSamples = samples.length;
    
    // Discrete Fourier Transform
    const numHarmonics = Math.floor(numSamples / 2);
    const real = new Float32Array(numHarmonics);
    const imag = new Float32Array(numHarmonics);
    for (let k = 0; k < numHarmonics; k++) {
        let sumReal = 0;
        let sumImag = 0;
        
        for (let n = 0; n < numSamples; n++) {
            const angle = (2 * Math.PI * k * n) / numSamples;
            sumReal += samples[n] * Math.cos(angle);
            sumImag += samples[n] * Math.sin(angle);
        }
        
        // Normalize by number of samples
        real[k] = sumReal / numSamples;
        imag[k] = -sumImag / numSamples; // Negative because Web Audio uses sin/cos convention
    }
    
    // Create the PeriodicWave
    return audioContext.createPeriodicWave(real, imag, { 
        disableNormalization 
    });
}

function asymmetricCappedSineWavetable(length = 2048) {
    const phaseCorrection = Math.PI / 6;
    const table = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        let phaseCorrectedSine = Math.sin((2 * Math.PI * i) / length - phaseCorrection);
        let clippedSine = Math.min(1, phaseCorrectedSine * 0.5 + 1);
        table[i] = clippedSine * 4 - 3; //rescale and center on zero
    }
    return table;
}

function sineFoldWavetable(foldFactor: number, length = 2048) {
    const table = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        let sineSample = Math.sin((2 * Math.PI * i) / length);
        table[i] = 1 - Math.abs((sineSample * foldFactor + 3) % 4)
    }
    return table;
}

let squareWave12, squareWave25, cappedSineWave, foldedSineWave;

function initializeOscillatorPatterns(audioContext) {
    squareWave12 = periodicSquareDutyWave(audioContext, 12.5 / 100);
    squareWave25 = periodicSquareDutyWave(audioContext, 25 / 100);
    cappedSineWave = wavetableToPeriodicWave(audioContext, asymmetricCappedSineWavetable());
    foldedSineWave = wavetableToPeriodicWave(audioContext, sineFoldWavetable(30));
}

function sineOscillator(audioContext) {
    return new OscillatorNode(audioContext, {type: "sine"});
}

function triangleOscillator(audioContext) {
    return new OscillatorNode(audioContext, {type: "triangle"});
}

function sawtoothOscillator(audioContext) {
    return new OscillatorNode(audioContext, {type: "sawtooth"});
}

function square50Oscillator(audioContext) {
    return new OscillatorNode(audioContext, {type: "square"});
}

function square25Oscillator(audioContext) {
    return new OscillatorNode(audioContext, {
        type: "custom", periodicWave: squareWave25
    });
}

function square12Oscillator(audioContext) {
    return new OscillatorNode(audioContext, {
        type: "custom", periodicWave: squareWave12
    });
}

function cappedSineOscillator(audioContext) {
    return new OscillatorNode(audioContext, {
        type: "custom", periodicWave: cappedSineWave
    });
}

function foldedSineOscillator(audioContext) {
    return new OscillatorNode(audioContext, {
        type: "custom", periodicWave: foldedSineWave
    });
}

function periodicSquareDutyWave(audioContext, duty) {
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
function wavetableToPeriodicWave(audioContext, wavetable, disableNormalization = false) {    
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

function sineFoldWavetable(foldFactor, length = 2048) {
    const table = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        let sineSample = Math.sin((2 * Math.PI * i) / length);
        table[i] = 1 - Math.abs((sineSample * foldFactor + 3) % 4)
    }
    return table;
}

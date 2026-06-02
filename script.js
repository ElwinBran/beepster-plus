let AudioContext, audioCtx
 
let scales = {
    'minor-pentatonic': ['C', 'Eb', 'F', 'G', 'Bb'],
    'major-pentatonic': ['C', 'D', 'E', 'G', 'A'],
    'suspended': ['C', 'D', 'F', 'G', 'Bb'],
    'blues-minor': ['C', 'Eb', 'F', 'Ab', 'Bb'],
    'blues-major': ['C', 'D', 'F', 'G', 'A']
}

let currentScaleIndex = 0
let currentNotesLength = 5
let currentRootNoteIndex = 0
let currentScale = 'minor-pentatonic'
let notes = scales[currentScale]
let octaves = [1, 2, 3, 4, 5, 6]
let beats = [16, 8, 4, 2, 1]
let volumes = [0.1, 0.2, 0.4, 0.6, 0.8, 1]

let loopLength = 8
let noteVariation = 2
let chanceForNewLoop = 0.1

let tracks = []

let randomInstrument = () => {
    let waves = ['triangle', 'sawtooth', 'square', 'sine']
    let waveId = Math.floor(Math.random() * waves.length)
    let wave = waves[waveId]

    let attack, decay
    if (Math.random() >= 0.5) {
        attack = Math.random()
        decay = Math.min(1 - attack, Math.random())
    } else {
        decay = Math.random()
        attack = Math.min(1 - decay, Math.random())
    }

    let sustain = Math.random()
    let release = Math.random() * 2

    return { wave, attack, decay, sustain, release }
}

let randomLoop = () => {
    let loop = []
    let noteId = Math.floor(Math.random() * currentNotesLength)
    for (i = 0; i < loopLength; i++) {
        noteId += Math.floor(Math.random() * noteVariation * 2 - noteVariation)
        let noteIndex = fitNoteToScale(noteId, currentScaleIndex)
        loop.push(noteAlwaysFlat(noteIndex, currentRootNoteIndex))
    }
    return loop
}

let randomTrack = () => {
    let playing = true
    let instrument = randomInstrument()
    let octave = octaves[Math.floor(Math.random() * octaves.length)]
    let beat = beats[Math.floor(Math.random() * beats.length)]
    let volume = volumes[Math.floor(Math.random() * volumes.length)]
    let loop = randomLoop()
    return { playing, instrument, octave, beat, volume, loop }
}

let playNote = (freq, instrument, noteLength, volume) => {
    let t = audioCtx.currentTime

    let osc = audioCtx.createOscillator()
    osc.type = instrument.wave
    osc.frequency.value = freq

    let env = audioCtx.createGain()
    env.connect(audioCtx.destination)
    env.gain.cancelScheduledValues(t)
    env.gain.setValueAtTime(0, t)

    // attack
    let attack = noteLength * instrument.attack
    env.gain.linearRampToValueAtTime(volume, t + attack)

    // decay
    let decay = noteLength * instrument.decay
    env.gain.linearRampToValueAtTime(instrument.sustain * volume, t + attack + decay)

    // release
    let release = instrument.release
    env.gain.linearRampToValueAtTime(0, t + noteLength)

    osc.connect(env)
    osc.start()
    osc.stop(t + noteLength + release)
}

let playTracks = () => {
    let noteIds = tracks.map(() => 0)

    let playNextNote = () => {
        tracks.forEach((track, i) => {
            if (noteIds[i] % track.beat === 0) {
                let loopId = Math.floor(noteIds[i] / track.beat)
                if (loopId >= loopLength) {
                    loopId = 0
                    noteIds[i] = 0
                    if (Math.random() < chanceForNewLoop) {
                        track.loop = randomLoop()
                    }
                }
                if (track.playing) {
                    let note = track.loop[loopId]
                    let freq = frequencyFromNote(note + track.octave)
                    let volume = track.volume / track.octave
                    playNote(freq, track.instrument, track.beat * 0.125, volume)
                }
            }
            noteIds[i]++
        })
       
        setTimeout(playNextNote, 1000 / 8)
    }

    playNextNote()
}

let renderInstrumentSVG = (instrument) => {
    let attackX = instrument.attack * 100
    let attackPt = `${attackX},0`

    let decayX = attackX + instrument.decay * 100
    let sustainY = 100 - instrument.sustain * 100
    let decayPt = `${decayX},${sustainY}`

    let sustainPt = `100,${sustainY}`

    let releaseX = 100 + instrument.release * 100
    let releasePt = `${releaseX},100`

    let color = ''
    if (instrument.wave === 'triangle') color = '#ff7f50'
    if (instrument.wave === 'square') color = '#ffd700'
    if (instrument.wave === 'sawtooth') color = '#00fa9a'
    if (instrument.wave === 'sine') color = '#40e0d0'

    return `
    <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
        <polyline points="0,100 ${attackPt} ${decayPt} ${sustainPt} ${releasePt}" stroke="none" fill="${color}" />
    </svg>
    `
}

let renderDropdown = (selected, values, labels) => {
    let select = document.createElement('select')
    values.forEach((value, i) => {
        let option = document.createElement('option')
        option.innerText = labels ? labels[i] : value
        option.value = value
        if (value === selected) option.selected = 'selected'
        select.appendChild(option)
    })
    return select
}

let renderModifier = (label, value, valueList, onChange) => {
    let container = document.createElement('div')
    container.className = 'modifier'

    let index = valueList.findIndex(x => x === value)

    let labelEl = document.createElement('div')
    labelEl.innerText = label
    container.appendChild(labelEl)

    let valueContainer = document.createElement('div')
    container.appendChild(valueContainer)
    
    let prevButton = document.createElement('button')
    prevButton.innerText = '↙'
    prevButton.addEventListener('click', () => {
        index--
        if (index < 0) index = 0
        onChange(valueList[index])
        valueEl.innerText = index + 1
        updateShareUrl()
    })
    valueContainer.appendChild(prevButton)

    let valueEl = document.createElement('div')
    valueEl.innerHTML = index + 1
    valueContainer.appendChild(valueEl)

    let nextButton = document.createElement('button')
    nextButton.innerText = '↗'
    nextButton.addEventListener('click', () => {
        index++
        if (index >= valueList.length) index = valueList.length - 1
        onChange(valueList[index])
        valueEl.innerText = index + 1
        updateShareUrl()
    })
    valueContainer.appendChild(nextButton)

    return container
}

let renderTrack = (track, trackId) => {
    let container = document.createElement('div')
    container.className = 'track'

    let playCheckbox = document.createElement('input')
    playCheckbox.type = 'checkbox'
    playCheckbox.checked = track.playing
    playCheckbox.addEventListener('change', e => {
        track.playing = e.target.checked
        updateShareUrl()
    })
    container.appendChild(playCheckbox)

    let instrumentButton = document.createElement('button')
    instrumentButton.className = 'instrument-button'
    instrumentButton.innerHTML = renderInstrumentSVG(track.instrument)
    instrumentButton.addEventListener('click', () => {
        track.instrument = randomInstrument()
        instrumentButton.innerHTML = renderInstrumentSVG(track.instrument)
        updateShareUrl()
    })
    container.appendChild(instrumentButton)

    let speedModifier = renderModifier('speed', track.beat, beats, x => track.beat = x)
    container.appendChild(speedModifier)

    let volumeModifier = renderModifier('volume', track.volume, volumes, x => track.volume = x)
    container.appendChild(volumeModifier)

    let octaveModifier = renderModifier('pitch', track.octave, octaves, x => track.octave = x)
    container.appendChild(octaveModifier)

    let randomButton = document.createElement('button')
    randomButton.className = 'random-button'
    randomButton.innerText = '⟳'
    randomButton.addEventListener('click', () => {
        tracks[trackId] = randomTrack()
        renderTrackList()
        updateShareUrl()
    })
    container.appendChild(randomButton)

    return container
}

let renderTrackList = () => {
    let trackList = document.getElementById('tracks')
    trackList.innerHTML = ''
    tracks.forEach((track, trackId) => {
        let trackEl = renderTrack(track, trackId)
        trackList.appendChild(trackEl)
    })
}

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
        track.loop = randomLoop()
    })

    document.getElementById('scale-button').innerText = currentScale.replace('-', ' ') + ' scale'
    updateShareUrl()
}

let updateShareUrl = () => {
    let shareLink = document.getElementById('share')
    shareLink.href = getUrlData()
}

let getUrlData = () => {
    // let baseUrlEnd = window.location.href.indexOf('?')
    // let url = window.location.href.slice(0, baseUrlEnd)
    url = 'https://zenzoa.github.io/beepster/?beeps='

    url += 'S' + Object.keys(scales).indexOf(currentScale) + '-'

    url += tracks.map(track => {
        let data = 'T'
        data += 'p' + (track.playing ? 1 : 0) + ','
        data += 'o' + track.octave + ','
        data += 'b' + track.beat + ','
        data += 'v' + Math.floor(track.volume * 10) + ','

        data += 'w' + track.instrument.wave.slice(0, 2) + ','
        data += 'a' + Math.floor(track.instrument.attack * 10000) + ','
        data += 'd' + Math.floor(track.instrument.decay * 10000) + ','
        data += 's' + Math.floor(track.instrument.sustain * 10000) + ','
        data += 'r' + Math.floor(track.instrument.release * 10000)
        
        return data
    }).join('-')

    return url
}

let loadUrlData = (url) => {
    dataStarts = url.indexOf('?beeps=')
    if (dataStarts < 0) return

    url = url.slice(dataStarts + 7)
    let urlParts = url.split('-')
    tracks = []
    urlParts.forEach(data => {
        if (data[0] === 'S') {
            let scaleList = Object.keys(scales)
            let scaleIndex = parseInt(data.slice(1))
            if (scaleIndex >= 0 && scaleIndex < scaleList.length) {
                currentScale = scaleList[scaleIndex]
                updateScale(currentScale)
            }
            return
        }
        let track = randomTrack()

        data = data.slice(1)
        let parts = data.split(',')
        parts.forEach(part => {
            let partType = part[0]
            part = part.slice(1)
            if (partType === 'p') {
                track.playing = part !== '0'
            }
            else if (partType === 'o') {
                let octave = parseInt(part)
                if (!isNaN(octave) && octaves.includes(octave)) {
                    track.octave = octave
                }
            }
            else if (partType === 'b') {
                let beat = parseInt(part)
                if (!isNaN(beat) && beats.includes(beat)) {
                    track.beat = beat
                }
            }
            else if (partType === 'v') {
                let volume = parseInt(part) / 10
                if (!isNaN(volume) && volumes.includes(volume)) {
                    track.volume = volume
                }
            }
            else if (partType === 'w') {
                if (part === 'tr') track.instrument.wave = 'triangle'
                else if (part === 'sa') track.instrument.wave = 'sawtooth'
                else if (part === 'si') track.instrument.wave = 'sine'
                else if (part === 'sq') track.instrument.wave = 'square'
            }
            else if (partType === 'a') {
                let attack = parseInt(part) / 10000
                if (!isNaN(attack) && attack >= 0 && attack < 1) {
                    track.instrument.attack = attack
                }
            }
            else if (partType === 'd') {
                let decay = parseInt(part) / 10000
                if (!isNaN(decay) && decay >= 0 && decay < 1) {
                    track.instrument.decay = decay
                }
            }
            else if (partType === 's') {
                let sustain = parseInt(part) / 10000
                if (!isNaN(sustain) && sustain >= 0 && sustain < 1) {
                    track.instrument.sustain = sustain
                }
            }
            else if (partType === 'r') {
                let release = parseInt(part) / 10000
                if (!isNaN(release) && release >= 0 && release < 2) {
                    track.instrument.release = release
                }
            }
        })

        tracks.push(track)
    })
}

let initialize = () => {
    AudioContext = window.AudioContext || window.webkitAudioContext
    audioCtx = new AudioContext()
    initializeFrequenies()

    tracks = Array(4).fill(0).map(() => randomTrack())

    let scaleButton = document.getElementById('scale-button')
    scaleButton.innerText = 'minor pentatonic scale'
    scaleButton.addEventListener('click', updateScale)

    loadUrlData(window.location.href)
    updateShareUrl()

    renderTrackList()
    playTracks()
}

window.onload = () => {
    let startButton = document.getElementById('start-button')
    startButton.addEventListener('click', () => {
        initialize()
        document.getElementById('start-button').className = 'hidden'
        document.getElementById('tracks').className = ''
        document.getElementById('scale-button').className = ''
    })
}

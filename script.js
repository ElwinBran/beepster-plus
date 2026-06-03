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
let defaultTimbres = ['triangle', 'sawtooth', 'square', 'sine']

let loopLength = 8
let noteVariation = 2
let chanceForNewLoop = 0.1

let tracks = []

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

let playNote = (freq, timbre, envelope, noteLength, volume) => {
    let t = audioCtx.currentTime

    let osc = audioCtx.createOscillator()
    osc.type = defaultTimbres[timbre]
    osc.frequency.value = freq

    let env = audioCtx.createGain()
    env.connect(audioCtx.destination)
    env.gain.cancelScheduledValues(t)
    env.gain.setValueAtTime(0, t)

    // attack
    let attack = noteLength * envelope.attack
    env.gain.linearRampToValueAtTime(volume, t + attack)

    // decay
    let decay = noteLength * envelope.decay
    env.gain.linearRampToValueAtTime(envelope.sustain * volume, t + attack + decay)

    // release
    let release = envelope.release
    env.gain.linearRampToValueAtTime(0, t + noteLength)

    osc.connect(env)
    osc.start()
    osc.stop(t + noteLength + release)
}

let playTracks = () => {
    let noteIds = tracks.map(() => 0)

    let playNextNote = () => {
        tracks.forEach((track, i) => {
            if (noteIds[i] % track.division === 0) {
                let loopId = Math.floor(noteIds[i] / track.division)
                if (loopId >= loopLength) {
                    loopId = 0
                    noteIds[i] = 0
                    if (Math.random() < chanceForNewLoop * track.randomness) {
                        track.melody = randomLoop()
                    }
                }
                if (track.playing) {
                    let note = track.melody[loopId]
                    let freq = frequencyFromNote(note + track.octave)
                    let volume = track.volume / track.octave
                    playNote(freq, track.timbre, track.envelope, track.division * 0.125, volume)
                }
            }
            noteIds[i]++
        })
       
        setTimeout(playNextNote, 1000 / 8)
    }

    playNextNote()
}

let renderInstrumentSVG = (envelope, colorIndex) => {
    let attackX = envelope.attack * 100
    let attackPt = `${attackX},0`

    let decayX = attackX + envelope.decay * 100
    let sustainY = 100 - envelope.sustain * 100
    let decayPt = `${decayX},${sustainY}`

    let sustainPt = `100,${sustainY}`

    let releaseX = 100 + envelope.release * 100
    let releasePt = `${releaseX},100`

    let color = ''
    if (colorIndex === 0) color = '#ff7f50'
    if (colorIndex === 1) color = '#ffd700'
    if (colorIndex === 2) color = '#00fa9a'
    if (colorIndex === 3) color = '#40e0d0'

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
    instrumentButton.innerHTML = renderInstrumentSVG(track.envelope, track.timbre)
    instrumentButton.addEventListener('click', () => {
        track.envelope = randomEnvelope()
        instrumentButton.innerHTML = renderInstrumentSVG(track.envelope, track.timbre)
        updateShareUrl()
    })
    container.appendChild(instrumentButton)

    let speedModifier = renderModifier('speed', track.division, BEATS, x => track.division = x)
    container.appendChild(speedModifier)

    let volumeModifier = renderModifier('volume', track.volume, VOLUMES, x => track.volume = x)
    container.appendChild(volumeModifier)

    let octaveModifier = renderModifier('pitch', track.octave, OCTAVES, x => track.octave = x)
    container.appendChild(octaveModifier)

    let randomButton = document.createElement('button')
    randomButton.className = 'random-button'
    randomButton.innerText = '⟳'
    randomButton.addEventListener('click', () => {
        tracks[trackId] = randomMelodyTrack(randomLoop)
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

        data += 'w' + track.timbre + ','
        data += 'a' + Math.floor(track.envelope.attack * 10000) + ','
        data += 'd' + Math.floor(track.envelope.decay * 10000) + ','
        data += 's' + Math.floor(track.envelope.sustain * 10000) + ','
        data += 'r' + Math.floor(track.envelope.release * 10000)
        
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
        let track = randomMelodyTrack(randomLoop)

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
                if (!isNaN(octave) && OCTAVES.includes(octave)) {
                    track.octave = octave
                }
            }
            else if (partType === 'b') {
                let beat = parseInt(part)
                if (!isNaN(beat) && BEATS.includes(beat)) {
                    track.division = beat
                }
            }
            else if (partType === 'v') {
                let volume = parseInt(part) / 10
                if (!isNaN(volume) && VOLUMES.includes(volume)) {
                    track.volume = volume
                }
            }
            else if (partType === 'w') {
                if (part === '0') track.timbre = 0
                else if (part === '1') track.timbre = 1
                else if (part === '2') track.timbre = 2
                else if (part === '3') track.timbre = 3
            }
            else if (partType === 'a') {
                let attack = parseInt(part) / 10000
                if (!isNaN(attack) && attack >= 0 && attack < 1) {
                    track.envelope.attack = attack
                }
            }
            else if (partType === 'd') {
                let decay = parseInt(part) / 10000
                if (!isNaN(decay) && decay >= 0 && decay < 1) {
                    track.envelope.decay = decay
                }
            }
            else if (partType === 's') {
                let sustain = parseInt(part) / 10000
                if (!isNaN(sustain) && sustain >= 0 && sustain < 1) {
                    track.envelope.sustain = sustain
                }
            }
            else if (partType === 'r') {
                let release = parseInt(part) / 10000
                if (!isNaN(release) && release >= 0 && release < 2) {
                    track.envelope.release = release
                }
            }
        })

        tracks.push(track)
    })
}

window.onload = () => {
    let startButton = document.getElementById('start-button')
    startButton.addEventListener('click', () => {
        AudioContext = window.AudioContext || window.webkitAudioContext
        audioCtx = new AudioContext()
        initializeFrequenies()
        tracks = Array(4).fill(0).map(() => randomMelodyTrack(randomLoop))

        let scaleButton = document.getElementById('scale-button')
        scaleButton.innerText = 'minor pentatonic scale'
        scaleButton.addEventListener('click', updateScale)

        loadUrlData(window.location.href)
        updateShareUrl()

        renderTrackList()
        document.getElementById('start-button').className = 'hidden'
        document.getElementById('tracks').className = ''
        document.getElementById('scale-button').className = ''
    })
}

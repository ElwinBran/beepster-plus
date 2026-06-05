let AudioContext, audioCtx
 
let scales = {
    'minor-pentatonic': ['C', 'Eb', 'F', 'G', 'Bb'],
    'major-pentatonic': ['C', 'D', 'E', 'G', 'A'],
    'suspended': ['C', 'D', 'F', 'G', 'Bb'],
    'blues-minor': ['C', 'Eb', 'F', 'Ab', 'Bb'],
    'blues-major': ['C', 'D', 'F', 'G', 'A']
}
const PATTERN_LENGTH = [2,3,4,5,6,7,8,9,10,11,12]

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
        })
       
        setTimeout(playNextNote, 1000 / 8)
    }

    playNextNote()
}

let renderInstrumentSVG = (envelope, color) => {
    let attackX = envelope.attack * 100
    let attackPt = `${attackX},0`

    let decayX = attackX + envelope.decay * 100
    let sustainY = 100 - envelope.sustain * 100
    let decayPt = `${decayX},${sustainY}`

    let sustainPt = `100,${sustainY}`

    let releaseX = 100 + envelope.release * 100
    let releasePt = `${releaseX},100`

    return `
    <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
        <polyline points="0,100 ${attackPt} ${decayPt} ${sustainPt} ${releasePt}" stroke="none" fill="${color}" />
    </svg>
    `
}

let melodyTimbreData = [
    {
        name: "Triangle",
        icon: '^'
    },
    {
        name: "Sawtooth",
        icon: 'N'
    },
    {
        name: "Square-50",
        icon: '['
    },
    {
        name: "Sine",
        icon: 's'
    },
]

let renderEnvelopeElement = (data, trackId, onAction) => {
    let result = document.createElement('button')
    result.className = 'envelope-button'
    let color
    let colorIndex = trackId % 4
    if (colorIndex === 0) color = '#ff7f50'
    if (colorIndex === 1) color = '#ffd700'
    if (colorIndex === 2) color = '#00fa9a'
    if (colorIndex === 3) color = '#40e0d0'
    result.innerHTML = renderInstrumentSVG(data, color)
    result.addEventListener('click', () => {
        onAction()
        result.innerHTML = renderInstrumentSVG(tracks[trackId].envelope, color)
    })
    return result
}

let renderTimbreElement = (trackReference, timbreIndex, timbres, onAction) => {
    let result = document.createElement('button')
    result.addEventListener('click', () => {
        onAction()
    })
    return result
}

let renderSlider = (value, start, end, label, onChange) => {
    let result = document.createElement('div')
    let labelEl = document.createElement('div')
    labelEl.innerText = label
    result.appendChild(labelEl)
    let slider = document.createElement('input')
    slider.type = 'range'
    slider.min = start
    slider.max = end
    slider.value = value
    slider.addEventListener('change', e => 
        onChange(e.target.value))
    result.appendChild(slider)
    return result
}
let renderCheckbox = (state, label, onChange) => {
    let container = document.createElement('div')
    let labelEl = document.createElement('div')
    labelEl.innerText = label
    container.appendChild(labelEl)
    let checkBox = document.createElement('input')
    checkBox.type = 'checkbox'
    checkBox.checked = state
    checkBox.addEventListener('change', onChange)
    container.appendChild(checkBox)
    return container
}

let renderButton = (text, onAction) => {
    let button = document.createElement('button')
    button.innerHTML = text
    button.addEventListener('click', () => onAction())
    return button
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
    })
    valueContainer.appendChild(nextButton)

    return container
}

let renderModifierValueDisplay = (label, value, valueList, onChange) => {
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
        valueEl.innerText = valueList[index]
    })
    valueContainer.appendChild(prevButton)

    let valueEl = document.createElement('div')
    valueEl.innerHTML = valueList[index]
    valueContainer.appendChild(valueEl)

    let nextButton = document.createElement('button')
    nextButton.innerText = '↗'
    nextButton.addEventListener('click', () => {
        index++
        if (index >= valueList.length) index = valueList.length - 1
        onChange(valueList[index])
        valueEl.innerText = valueList[index]
    })
    valueContainer.appendChild(nextButton)

    return container
}

const MELODY_TRACK_TEMPLATE = [
    {
        id: "playing", render: (track) => 
            renderCheckbox(track.state.playing, "", 
                e => track.state.playing = e.target.checked)
    },
    {
        id: "wave", render: (track) => 
            renderTimbreElement(track, track.state.timbre, melodyTimbreData, 
                () => track.state.timbre = (track.state.timbre + 1) % melodyTimbreData.length)
    },
    {
        id: "envelope", render: (track, trackId) => 
            renderEnvelopeElement(track.envelope, trackId, 
                () => track.envelope = randomEnvelope())
    },
    {
        id: "speed", render: (track) => 
            renderModifier("Speed", track.division, BEATS,
                value => track.division = value)
    },
    {
        id: "volume", render: (track) => 
            renderModifier("Volume", track.state.volume, VOLUMES,
                value => track.state.volume = value)
    },
    {
        id: "octave", render: (track) => 
            renderModifier("Octave", track.octave, OCTAVES,
                value => track.octave = value)
    },
    {
        id: "loop_length", render: (track) => 
            renderModifierValueDisplay("Notes", track.melodyLength, PATTERN_LENGTH,
                {} )
    },
    {
        id: "randomness", render: (track) => 
            renderSlider(track.randomness, RANDOM_START,RANDOM_END, "Randomness", 
                () => {})
    },
    {
        id: "freeze_loop", render: (track) => 
            renderCheckbox(track.state.playing, "", 
            e => track.state.freezeState = e.target.checked)
    },
    {
        id: "new_loop", render: (track) => 
            renderButton("%", {})
    },
    {
        id: "randomize", render: (track) => 
            renderButton("⟳", () => {
                let newTrack = randomMelodyTrack(randomLoop)
                track.state.timbre = newTrack.state.timbre
                track.state.volume = newTrack.state.volume

            })
    }
];


function renderMelodyTrack(data, index) {
    let result = document.createElement('div')
    result.className = 'track'
    MELODY_TRACK_TEMPLATE.forEach((elementTemplate) => {
        result.appendChild(
            elementTemplate.render(data, index)
        )
    })
    return result
}

function renderTracks(melodyTracks) {
    let trackList = document.getElementById('tracks')
    trackList.innerHTML = ''
    melodyTracks.forEach((track, trackId) => {
        let trackEl = renderMelodyTrack(track, trackId)
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
        track.melody = randomLoop()
    })

    document.getElementById('scale-button').innerText = currentScale.replace('-', ' ') + ' scale'
    updateShareUrl()
}

let updateShareUrl = () => {
    let shareLink = document.getElementById('share')
    shareLink.href = getUrlData()
}

window.onload = () => {
    let startButton = document.getElementById('start-button')
    startButton.addEventListener('click', () => {
        AudioContext = window.AudioContext || window.webkitAudioContext
        audioCtx = new AudioContext()
        initializeFrequenies()
        let numberOfTracks = parseInt(document.getElementById('melody-counter').value)
        tracks = Array(numberOfTracks).fill(0).map(() => randomMelodyTrack(randomLoop))

        let scaleButton = document.getElementById('scale-button')
        scaleButton.innerText = 'minor pentatonic scale'
        scaleButton.addEventListener('click', updateScale)


        renderTracks(tracks)
        playTracks()
        document.getElementById('start-screen').className = 'hidden'
        document.getElementById('play-screen').className = ''
    })
}

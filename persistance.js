/*
==============================
        Persistance
==============================

Manages exporting beepster state as url data or importing from url code.
*/

let getUrlData = () => {
    // let baseUrlEnd = window.location.href.indexOf('?')
    // let url = window.location.href.slice(0, baseUrlEnd)
    // TODO: change url!
    url = 'https://zenzoa.github.io/beepster/?beeps='

    url += 'S' + Object.keys(scales).indexOf(currentScale) + '-'

    url += tracks.map(track => {
        let data = 'T'
        data += 'p' + (track.state.playing ? 1 : 0) + ','
        data += 'o' + track.octave + ','
        data += 'b' + track.beat + ','
        data += 'v' + Math.floor(track.state.volume * 10) + ','

        data += 'w' + track.state.timbre + ','
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
                track.state.playing = part !== '0'
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
                    track.state.volume = volume
                }
            }
            else if (partType === 'w') {
                if (part === '0') track.state.timbre = 0
                else if (part === '1') track.state.timbre = 1
                else if (part === '2') track.state.timbre = 2
                else if (part === '3') track.state.timbre = 3
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
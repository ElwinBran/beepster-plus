/*
  Various elements for the user interaction including controller(-ish) behaviour
*/

import { UserTimbreMode } from "./configuration"
import { ADSREnvelope, Track, VoiceState } from "./model"

export function renderInstrumentSVG (envelope: ADSREnvelope, color: string): string {
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

export function renderEnvelopeElement(data: ADSREnvelope, trackId: number, 
                                trackReference: () => (Track & {envelope: ADSREnvelope}),
                                onAction: () => any) {
    let result = document.createElement('button');
    result.className = 'envelope-button'
    let color:string = '';
    let colorIndex = trackId % 4
    if (colorIndex === 0) color = '#ff7f50'
    if (colorIndex === 1) color = '#ffd700'
    if (colorIndex === 2) color = '#00fa9a'
    if (colorIndex === 3) color = '#40e0d0'
    result.innerHTML = renderInstrumentSVG(data, color)
    result.addEventListener('click', () => {
        onAction();
        result.innerHTML = renderInstrumentSVG(trackReference().envelope, color)
    })
    return result
}

export function renderTimbreElement(trackReference: () => (Track & {state: VoiceState}), 
                        timbreIndex: number, timbres: Array<UserTimbreMode>,
                         onAction: () => any) {
    let result = document.createElement('button');
    result.textContent = timbres[timbreIndex].icon;
    result.addEventListener('click', () => {
        onAction();
        result.textContent = timbres[trackReference().state.timbre].icon;
    })
    return result
}

export function renderSlider(value: number, label: string,
        sliderSettings: {min: number, max: number, step: number}, 
        onChange: (value: string) => any) {
    let result = document.createElement('div')
    let labelEl = document.createElement('div')
    labelEl.innerText = label
    result.appendChild(labelEl)
    let slider = document.createElement('input')
    slider.type = 'range'
    slider.min = sliderSettings.min.toString();
    slider.max = sliderSettings.max.toString();
    slider.step = sliderSettings.step.toString();
    slider.value = value.toString();
    slider.addEventListener('change', e => {
        if ((<HTMLInputElement> e.target).value) {
            onChange((<HTMLInputElement> e.target).value);
        }
        });
    result.appendChild(slider)
    return result
}

export function renderCheckbox(state: boolean, label: string, 
                               onChange: any) {
    let container = document.createElement('div');
    let labelEl = document.createElement('div');
    labelEl.innerText = label;
    container.appendChild(labelEl);
    let checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.checked = state;
    checkBox.addEventListener('change', onChange);
    container.appendChild(checkBox);
    return container;
}

export function renderButton(text: string, onAction: () => any) {
    let button = document.createElement('button');
    button.innerHTML = text;
    button.addEventListener('click', onAction);
    return button;
}
/*
export function renderDropdown(selected, values, labels) {
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
*/

export function renderModifier<V>(label: string, value: V, 
                                  valueList: Array<V>, 
                                  onChange: (value: V) => any) {
    let container = document.createElement('div')
    container.className = 'modifier'

    let index = valueList.findIndex(x => x === value)

    let labelEl = document.createElement('div')
    labelEl.innerText = label
    container.appendChild(labelEl)

    let valueContainer = document.createElement('div')
    container.appendChild(valueContainer)
    let valueEl = document.createElement('div')
    let prevButton = document.createElement('button')
    prevButton.innerText = '↙'
    prevButton.addEventListener('click', () => {
        index--
        if (index < 0) index = 0
        onChange(valueList[index])
        valueEl.innerText = (index + 1).toString();
    })
    valueContainer.appendChild(prevButton)
    valueEl.innerHTML = (index + 1).toString();
    valueContainer.appendChild(valueEl)

    let nextButton = document.createElement('button')
    nextButton.innerText = '↗'
    nextButton.addEventListener('click', () => {
        index++
        if (index >= valueList.length) index = valueList.length - 1
        onChange(valueList[index])
        valueEl.innerText = (index + 1).toString();
    })
    valueContainer.appendChild(nextButton)

    return container
}

export function renderModifierValueDisplay<V>(
                    label: string, 
                    value: V, 
                    valueList: Array<V>, 
                    textDisplay: (value: V) => string,
                    onChange: (value: V) => any) {
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
        valueEl.innerText = textDisplay(valueList[index]);
    })
    valueContainer.appendChild(prevButton)

    let valueEl = document.createElement('div')
    valueEl.innerHTML = textDisplay(valueList[index]);
    valueContainer.appendChild(valueEl)

    let nextButton = document.createElement('button')
    nextButton.innerText = '↗'
    nextButton.addEventListener('click', () => {
        index++
        if (index >= valueList.length) index = valueList.length - 1
        onChange(valueList[index])
        valueEl.innerText = textDisplay(valueList[index])
    })
    valueContainer.appendChild(nextButton)

    return container
}

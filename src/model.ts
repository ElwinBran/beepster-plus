/*
 * App domain, the music is made with 'tracks', that use common synthesis and 
 * looper techniques.
 */


export class ADSREnvelope {
    constructor(   
        public attack:number, 
        public decay:number, 
        public sustain:number, 
        public release:number) {}
}

export class VoiceState {
    constructor(
        public playing:boolean, 
        public timbre:number, 
        public volume:number, 
        public freezeState:boolean) {}
}

export class Track {

}

export class MelodyTrack extends Track {

    constructor(
        public state:VoiceState, 
        public envelope:ADSREnvelope, 
        public octave:number, 
        public beatDivision:number, 
        public melodyLength:number, 
        public melody:Array<number>, 
        public randomness:number) {
        super();
    }
}

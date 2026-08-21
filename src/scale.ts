export class Scale {
    constructor(
        public readonly name: string,
        public readonly indices: ReadonlyArray<number>,
        public readonly steps: number,
        public readonly tuningDivision: number
    ) {}
}

export function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export class SeededRNG {
    constructor(seed) {
        this.seed = seed;
        this.random = mulberry32(seed);
    }

    // 0 to 1
    next() {
        return this.random();
    }

    // min to max (inclusive min, exclusive max typically, but let's do float)
    range(min, max) {
        return min + this.next() * (max - min);
    }

    // Integer range [min, max]
    rangeInt(min, max) {
        return Math.floor(this.range(min, max + 1));
    }

    pick(array) {
        return array[Math.floor(this.next() * array.length)];
    }
}

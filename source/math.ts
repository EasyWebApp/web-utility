export function sum(...data: number[]) {
    return data.reduce((sum, item) => sum + item, 0);
}

export function averageOf(...data: number[]) {
    return sum(...data) / data.length;
}

export function varianceOf(data: number[], sample = false) {
    const average = averageOf(...data);
    const summary = sum(...data.map(item => (item - average) ** 2));

    return summary / (data.length - (sample ? 1 : 0));
}

export function standardDeviationOf(data: number[], sample = false) {
    return Math.sqrt(varianceOf(data, sample));
}

export function hypotenuseOf(...data: number[]) {
    return Math.sqrt(sum(...data.map(item => item ** 2)));
}

const isDebugEnabled = false;

export function debug(...params: any[]) {
    if (isDebugEnabled) console.debug(...params);
}

export function info(...params: any[]) {
    console.log(...params);
}
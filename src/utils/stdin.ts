console.log("Is TTY:", process.stdin.isTTY);
console.log("Has setRawMode:", typeof process.stdin.setRawMode);
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}


export const keypress = (callback: (key: any) => void) => {
    process.stdin.on('keypress', async (_str, key) => {
        return callback(key);
    })
};
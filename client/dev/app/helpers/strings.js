export const pad = (char, pad, int) => {
    return Array(pad).fill(char).map((e, idx) => (idx < (int + '').length) ? (int + '').split('').reverse()[idx] : e).reverse().join('')
}
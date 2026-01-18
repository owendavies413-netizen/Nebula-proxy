/* Scramjet Codecs - Essential for URL scrambling */
const xor = {
    encode(str) {
        if (!str) return str;
        return encodeURIComponent(
            str.split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join('')
        );
    },
    decode(str) {
        if (!str) return str;
        let [beforeQuery, afterQuery] = str.split('?');
        return (
            decodeURIComponent(beforeQuery).split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join('') +
            (afterQuery ? '?' + afterQuery : '')
        );
    },
};

// This must be global so search.js can see it
self.__scramjet$codecs = { xor };
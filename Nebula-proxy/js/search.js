/* js/search.js */
const form = document.querySelector('#proxy-form');
const input = document.querySelector('#proxy-search');

form.addEventListener('submit', async event => {
    event.preventDefault();
    
    if (typeof __scramjet$codecs === 'undefined') {
        alert("The engine is still warming up. Please wait 5 seconds and try again.");
        return;
    }

    let url = input.value.trim();

    if (!isUrl(url)) {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
    } else if (!(url.startsWith('https://') || url.startsWith('http://'))) {
        url = 'http://' + url;
    }

    // Explicitly build the URL path
    // Most Scramjet codecs just return the encoded string (e.g., "hvtrs...")
    // So we manually add the prefix and the encoded part.
    const encoded = __scramjet$codecs.xor.encode(url);
    window.location.href = '/service/' + encoded;
});

function isUrl(val = '') {
    if (/^http(s?):\/\//.test(val)) return true;
    if (val.includes('.') && val.split(' ')[0].length > 0) return true;
    return false;
}
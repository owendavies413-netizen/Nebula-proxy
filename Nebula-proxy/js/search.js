document.getElementById('proxy-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('proxy-search').value;
    
    // Simple URL check
    let url = input.trim();
    if (!url.includes('.') || url.includes(' ')) {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
    } else if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    // Use the global config for encoding
    const encoded = __scramjet_config.codec.encode(url);
    window.location.href = __scramjet_config.prefix + encoded;
});
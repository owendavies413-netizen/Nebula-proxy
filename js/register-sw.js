/* register-sw.js */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js?v=' + Date.now());
            
            // If there's a new worker waiting, tell it to take over
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }

            // Listen for the controllerchange event (This is the key!)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log("SW: New Controller took over. Reloading to sync.");
                window.location.reload();
            });

            console.log('Nebula SW: Registered successfully');
        } catch (err) {
            console.error('Nebula SW: Registration Failed:', err);
        }
    });
}
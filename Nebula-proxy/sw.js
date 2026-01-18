/* sw.js - Version 15 */

// 1. Register the message listener IMMEDIATELY.
// This MUST be the first thing the browser sees to stop the "Initial Evaluation" error.
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "NEBULA_PING") {
        event.source.postMessage({ type: "NEBULA_PONG" });
    }
});

// 2. Global variable for the engine
let scramjet;

// 3. Database physical setup
async function setupDatabase() {
    return new Promise((resolve, reject) => {
        // We use Version 15 to force the browser to run onupgradeneeded
        const request = indexedDB.open('__scramjet_db', 15);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Create every store the library is crying about
            const stores = ['config', 'cache', 'entries', 'settings'];
            stores.forEach(store => {
                if (!db.objectStoreNames.contains(store)) {
                    db.createObjectStore(store);
                }
            });
            console.log("SW: Database stores created.");
        };

        request.onsuccess = (e) => {
            e.target.result.close();
            resolve();
        };

        request.onerror = (e) => reject(e);
    });
}

// 4. Installation Lifecycle
self.addEventListener("install", (event) => {
    event.waitUntil(
        setupDatabase()
            .then(() => {
                // ONLY import the scripts AFTER the database is ready
                importScripts("/scram/scramjet.codecs.js");
                importScripts("/scram/scramjet.config.js");
                importScripts("/scram/scramjet.all.js");

                const { ScramjetServiceWorker } = $scramjetLoadWorker();
                scramjet = new ScramjetServiceWorker();
                return scramjet.loadConfig();
            })
            .then(() => {
                console.log("SW: Engine Fully Active.");
                return self.skipWaiting();
            })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    const url = event.request.url;
    if (url.startsWith(self.location.origin + '/service/')) {
        // If the engine isn't ready yet, we can't handle the fetch
        if (!scramjet) return; 
        event.respondWith(scramjet.fetch(event));
    }
});
/* sw.js */
importScripts("/scram/scramjet.codecs.js");
importScripts("/scram/scramjet.config.js");
importScripts("/scram/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// 1. MUST register this immediately for the handshake
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "NEBULA_PING") {
        event.source.postMessage({ type: "NEBULA_PONG" });
    }
});

self.addEventListener("install", (event) => {
    event.waitUntil(
        // This force-creates the database stores before Scramjet touches them
        new Promise((resolve) => {
            const request = indexedDB.open('__scramjet_db', 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('config')) db.createObjectStore('config');
                if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache');
            };
            request.onsuccess = (e) => {
                e.target.result.close();
                resolve();
            };
        })
        .then(() => scramjet.loadConfig())
        .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    if (event.request.url.startsWith(self.location.origin + '/service/')) {
        event.respondWith(scramjet.fetch(event));
    }
});
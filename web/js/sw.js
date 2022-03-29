"use strict";

const version = 3;
var isOnline = true;
var isLoggedIn = false;
var cacheName = `ramblings-${version}`

var urlsToCache = {
    loggedOut:[
        "/",
        "/about",
        "/contact",
        "/login",
        "/404",
        "/offline",
        "/css/styles.css",
        "/js/blog.js",
        "/js/home.js",
        "/js/login.js",
        "/js/add-post.js",
        "/images/logo.gif",
        "/images/offline.png"
    ]
}

self.addEventListener("install",onInstall)
self.addEventListener("activate",onActivate)
self.addEventListener("message",onMessage)

main().catch(console.error);

// *********************************

async function main(){
    await sendMessage({ requestStatusUpdate:true})
    await cacheLoggedOutFiles()
}


async function onInstall(evt){
    console.log(`Service worker ${version} is intalled`)
    self.skipWaiting()
}

function onMessage({data}){
    console.log(data)
    if (data.statusUpdate){
        ({isOnline,isLoggedIn} = data.statusUpdate)
        console.log(`Service worker (${version}), isOnline: ${isOnline}, isLoggedIn: ${isLoggedIn} `)
    }
}

function onActivate(evt){    
    evt.waitUntil(handleActivation())
    
}

async function handleActivation(){
    await clearCaches()
    await cacheLoggedOutFiles(/* forceReload= */true)
    await clients.claim()
    console.log(`Service worker ${version} is activated.`)
}
async function sendMessage(msg){
    var allClients = await clients.matchAll({includeControoled:true})
    return Promise.all(
        allClients.map(()=>{
            var chan = new MessageChannel();
            chan.port1.onmessage = onMessage
            return client.postMessage(msg,[chan.port2])
        })
    )
}

async function cacheLoggedOutFiles(forceReload = false) {
	var cache = await caches.open(cacheName);

	return Promise.all(
		urlsToCache.loggedOut.map(async function requestFile(url){
			try {
				let res;

				if (!forceReload) {
					res = await cache.match(url);
					if (res) {
						return;
					}
				}

				let fetchOptions = {
					method: "GET",
					cache: "no-store",
					credentials: "omit"
				};
				res = await fetch(url,fetchOptions);
				if (res.ok) {
					return cache.put(url,res);
				}
			}
			catch (err) {}
		})
	);
}

async function clearCaches(){
    var cacheNames = await caches.keys();
    var oldCacheNames = cacheNames.filter((cacheName)=>{
        if (/ramblings-\/d+$/.test(cacheName)){
            let [,cacheVersion] = cacheName.match(/ramblings-(\d+)$/)
            cacheVersion = cacheVersion != null ? Number(cacheVersion)  : cacheVersion
            if (
                cacheVersion > 0 &&
                cacheVersion != version
                )
                {
                    
                }
        }
    })
}
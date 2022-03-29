(function Blog(){
	"use strict";

	var offlineIcon;
	
	var isOnline = ("onLine" in navigator) ? navigator.onLine : true;

	var isLoggedIn = /isLoggedIn=1/.test(document.cookie.toString() || "");


	var usingSW = ("serviceWorker" in navigator);
	var swRegistration;
	var svcWorker;

	initServiceWorker().catch(console.err)

	document.addEventListener("DOMContentLoaded",ready,false);


	// **********************************

	function ready() {
		offlineIcon = document.getElementById("connectivity-status");

		if (!isOnline){
			offlineIcon.classList.remove('hidden')
		}
		window.addEventListener("online", ()=>{
			console.log('online')
			offlineIcon.classList.add('hidden')
			isOnline=true
			sendStatusUpdate()
		})
		window.addEventListener('offline',()=>{
			console.log('offline')
			offlineIcon.classList.remove("hidden")
			isOnline = false
			sendStatusUpdate()
		})
	}

	async function initServiceWorker(){
		swRegistration = await navigator.serviceWorker.register("/sw.js",{
				updateViaCache:"none"
			})
		svcWorker = swRegistration.waiting || swRegistration.active;

		navigator.serviceWorker.addEventListener("controllerchange",function  onController(){
			svcWorker = navigator.serviceWorker.controller;
			sendStatusUpdate(svcWorker)
		})
		navigator.serviceWorker.addEventListener('message',onSWMessage)
	}

	function onSWMessage(evt){
		const {data} = evt;
		
		if(data.statusUpdateRequest){
			console.log("Received status update request from service working")
			sendStatusUpdate(evt.ports && evt.ports[0])
		}
	}

	function sendStatusUpdate(target){
		sendSWMessage({statusUpdate:{isOnline,isLoggedIn}},target)
	}

	function sendSWMessage(msg,target){
		if(target){
			target.postMessage(msg)
		}
		else if(svcWorker){
			svcWorker.postMessage(msg)
		}
		else{
			navigator.serviceWorker.controller.postMessage(msg)
		}
	}
})();

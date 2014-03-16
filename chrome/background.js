/* Copyright 2014 John Lewin lewin76@gmail.com */

var tab,
	currentUrlInfo,
	importedCount = 0,
	urlsToCollect,
    allUrls,
	id,
    source = 'http://localhost:8000/url-list',
    postToUrl = 'http://localhost:8000/';
    
    
function init() {
    // On load, connect to a currently hard-coded url to retrieve the list
    // of urls we need collect
    var xhr = new XMLHttpRequest();
    xhr.open("GET", source, true);
    xhr.onload = function () {

        allUrls = JSON.parse(xhr.responseText);

    }
    xhr.send();
}

init();

// Hook browserAction click event
chrome.browserAction.onClicked.addListener(function (activeTab) {
	
	console.time("tjs import");
	id = JSON.stringify(new Date()).replace(/:/g, '-').replace(/\"/g, '').substring(0, 19);

    urlsToCollect = allUrls.slice(0);

	// Load the examples page
	chrome.tabs.create({ url: 'about:blank' }, function (loaded) {

		tab = loaded;
		processNextItem();

    });

});

// Register to receive message from getTabContent.js
chrome.runtime.onMessage.addListener(function (request) {

    // Once the page has loaded, perform the CaptureScreenShot behavior and resume the collection process
    if (request.loaded /* && importedCount++ < 5 */) {

    	setTimeout(CaptureScreenShot, 1000, false);

    }
});

function processNextItem() {

	currentUrlInfo = urlsToCollect.pop();

	if (!currentUrlInfo) {

		console.timeEnd("tjs import");
		return;

	}

	// Navigate to the next url in the list
	chrome.tabs.update(tab.id, { url: currentUrlInfo[1] }, function (loaded) {

		tab = loaded;

		// Callback when loaded
		chrome.tabs.executeScript(tab.id, { file: 'notifyLoaded.js' });

	});

}

function CaptureScreenShot() {

	// Capture active tab
	chrome.tabs.captureVisibleTab(tab.windowId, function (img) {

		var xhr = new XMLHttpRequest(), formData = new FormData();
		formData.append("screenShot", img);
		xhr.open("POST", postToUrl, true);

		//xhr.setRequestHeader('tjs-batch', id);
        // Pass the name through to the node.js code so it knows how to name the posted data
		xhr.setRequestHeader('tjs-name', currentUrlInfo[0]);

		// Finally hook up a handler to the response which displays the results in a new tab
		xhr.addEventListener("load", function () {
			
			// Load next item
			setTimeout(processNextItem, 200, false);

			
		}, false);

		// Execute the xhr, posting the image to the node.js receiver
		xhr.send(formData)
		
	});

}
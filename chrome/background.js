/* Copyright 2014 John Lewin lewin76@gmail.com */

var tab,
	currentUrlInfo,
	importedCount = 0,
	urlsToCollect,
	id,
    source = 'http://localhost:8000/url-list',
    postToUrl = 'http://localhost:8000/';
    
    
function init() {
    // Collect url list
    var xhr = new XMLHttpRequest();
    var resp;
    xhr.open("GET", source, true);
    xhr.onload = function () {

        urlsToCollect = JSON.parse(xhr.responseText);

    }
    xhr.send();
}

init();

// Hook browserAction click event
chrome.browserAction.onClicked.addListener(function (activeTab) {
	
	console.time("tjs import");
	id = JSON.stringify(new Date()).replace(/:/g, '-').replace(/\"/g, '').substring(0, 19);

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

	// We're currently using hard-coded logic that intimately knows the relationship between the example files and the target urls. In
    // the future this should be adapted so we call a url supplied by the user, view config or similar that returns a list of urls 
    // to process
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
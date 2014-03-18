/* Copyright 2014 John Lewin lewin76@gmail.com */

var tab,
	currentPageInfo,
	loadedConfig = null;

	/** Expected Config Format **
	var config = {
		pages = ['x', 'y'],
		postTo: 'http://localhost:8000/'
	};
	**/

// Register to receive client messages
chrome.runtime.onMessage.addListener(function (request) {

	// Once the page has loaded, perform the CaptureScreenShot behavior and resume the collection process
	if (request.loaded) {

			setTimeout(CaptureScreenShot, 1000, false);

	} else if (request.import) {

		beginImport(request.config);

	}
});

function beginImport(config) {

		loadedConfig = config;

		// Begin the import process by opening a new tab and calling processNextItem()
		chrome.tabs.create({ url: 'about:blank' }, function (loaded) {

			tab = loaded;
			processNextItem();

		});

}

function processNextItem() {

	// Pop the next page from the queue
	currentPageInfo = loadedConfig.pages.pop();

	if (!currentPageInfo) {

		console.timeEnd("tjs import");
		return;

	}

	// Navigate to the new page
	chrome.tabs.update(tab.id, { url: currentPageInfo[1] }, function (loaded) {

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
		xhr.open("POST", loadedConfig.postTo, true);

		// Pass the object name through to the server
		xhr.setRequestHeader('tjs-name', currentPageInfo[0]);

		// Finally hook up a handler to the response which displays the results in a new tab
		xhr.addEventListener("load", function () {
			
			// Load next item
			setTimeout(processNextItem, 200, false);
			
		}, false);

		// Execute the xhr, posting the image to the node.js receiver
		xhr.send(formData)
		
	});

}
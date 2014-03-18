var url = null,
    activeConfig = null,
    $ = function(id) { return document.getElementById(id); }

document.addEventListener('DOMContentLoaded', function () {

  url = $('url');
  
  $('history').addEventListener('change', function(e) { 
    url.value = e.srcElement.value;
  });
  $('something').addEventListener('click', clicked);
  
  $('import').addEventListener('click', function() {
  
    chrome.runtime.sendMessage({ import: true, config: activeConfig });
  
  });

});



function clicked(e) {

    // Connect to the specified url to retrieve the required config
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url.value, true);
    xhr.onload = function () {
      var text = xhr.response || xhr.responseText;
      activeConfig = JSON.parse(text);
      
      $('postTo').innerText = activeConfig.postTo;
      $('location').innerText = url.value;

      var pages = $('pages');

      // Empty element
      pages.innerHTML = '';

      for(var i = 0; i < activeConfig.pages.length; i++) {
      
        var li = document.createElement('li');
        pages.appendChild(li);
        li.textContent = activeConfig.pages[i][0];

        var span = document.createElement('span');
        span.textContent = activeConfig.pages[i][1];
        
        li.appendChild(span);
     
      }
      
     $('results').style.display = 'block';
     $('load').style.display = 'none';

    }
    xhr.send();

}


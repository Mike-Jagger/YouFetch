chrome.action.onClicked.addListener(tab => {  
    chrome.tabs.update({url: 'background.html'});
  });
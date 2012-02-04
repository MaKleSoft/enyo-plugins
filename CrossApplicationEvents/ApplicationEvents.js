enyo.kind({
    name: "maklesoft.cross.ApplicationEvents",
    kind: enyo.ApplicationEvents,
    events: {
        onSearch: ""
    },
    create: function() {
        this.inherited(arguments);
        
        this.chromeWindowFocusChangedHandler = enyo.bind(this, this.chromeWindowFocusChangedHandler);
        this.windowActivatedHandler = enyo.bind(this, this.doWindowActivated);
        this.windowDeactivatedHandler = enyo.bind(this, this.doWindowDeactivated);
        this.backHandler = enyo.bind(this, this.doBack);
        this.openAppMenuHandler = enyo.bind(this, this.doOpenAppMenu);
        this.searchHandler = enyo.bind(this, this.doSearch);
        
        if (typeof chrome != 'undefined' && chrome.windows) {
            if (this.onWindowActivated || this.onWindowDeactivated) {
	            chrome.windows.getCurrent(enyo.bind(this, function(window) {
                    this.chromeWindowId = window.id;
                    chrome.windows.onFocusChanged.addListener(this.chromeWindowFocusChangedHandler);  
	            }))
	        }
	    } else if (typeof PhoneGap != 'undefined') {
	        if (this.onWindowActivated) {
	            document.addEventListener("pause", this.windowActivatedHandler, false);
            }
            if (this.onWindowDeactivated) {
	            document.addEventListener("resume", this.windowDeactivatedHandler, false);
            }
            
            if (this.onBack) {
                document.addEventListener("backbutton", this.backHandler, false);
            }
            
            if (this.onOpenAppMenu) {
                document.addEventListener("menubutton", this.openAppMenuHandler, false);
            }
            
            if (this.onSearch) {
                document.addEventListener("searchbutton", this.searchHandler, false);
            }
	    }
    },
    chromeWindowFocusChangedHandler: function(windowId) {
        if (this.chromeWindowId == windowId) {
            this.doWindowActivated();
        } else {
            this.doWindowDeactivated();
        }
    },
    destroy: function() {
        this.inherited(arguments);
        if (typeof chrome != 'undefined' && chrome.windows) {
            chrome.windows.onFocusChanged.removeListener(this.chromeWindowFocusChangedHandler);
	    } else if (typeof PhoneGap != 'undefined') {
            document.removeEventListener("pause", this.windowActivatedHandler);
            document.removeEventListener("resume", this.windowDeactivatedHandler);
            document.removeEventListener("backbutton", this.backHandler);
            document.removeEventListener("menubutton", this.openAppMenuHandler);
            document.removeEventListener("searchbutton", this.searchHandler);
        }
    }
});
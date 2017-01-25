/* Magic Mirror
 * Module: MMM-JCD-Bikes
 *
 * By leobaillard
 * Based upon: https://github.com/yo-less/MMM-nextbike
 * MIT Licensed.
 */

Module.register("MMM-JCD-Bikes", {

    defaults: {
        apiKey: '',
        apiBase: 'https://api.jcdecaux.com/vls/v1/',
        contract: 'Paris',
        stations: [],
        showBikes: true,
        reload: 1 * 60 * 1000       // every minute
    },

    /*getTranslations: function () {
        return {
            en: "translations/en.json",
            fr: "translations/fr.json",
            de: "translations/de.json"
        };
    },*/

    getStyles: function () {
        return ["MMM-JCD-Bikes.css", "font-awesome.css"];
    },

    start: function () {
        var self = this;
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification("CONFIG", this.config);
        setInterval(
            function()
            {self.sendSocketNotification("CONFIG", self.config);},
            this.config.reload
        );
    },

        
    socketNotificationReceived: function (notification, payload) {
        if (notification === "JCD BIKES") {
            this.stationsData = payload;
            this.updateDom();           
        }
    },

    getDom: function () {
        // Auto-create MagicMirror header

        var wrapper = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = this.config.title;
        wrapper.appendChild(header);
    
        // Loading data notification
        
        if (!this.stationsData) {
            var text = document.createElement("div");
            text.innerHTML = this.translate("LOADING");
            text.className = "small dimmed";
            wrapper.appendChild(text);
        } else {
            // Create bike table once data is received
            var table = document.createElement("table");
            table.classList.add("small", "table");
            table.border='0';
            table.appendChild(this.createSpacerRow());

            // List available bikes via a stations array
            Object.keys(this.stationsData).forEach(function (key)
            {
                table.appendChild(this.createStationNameRow(this.stationsData[key].name));
                table.appendChild(this.createAmountRow(this.stationsData[key]));
            });
            table.appendChild(this.createSpacerRow());
                        
            wrapper.appendChild(table);
                
        }
        
        return wrapper; 
    },
    
    createSpacerRow: function () {
        var spacerRow = document.createElement("tr");
        
        var spacerHeader = document.createElement("td");
        spacerHeader.className = "spacerRow";
        spacerHeader.setAttribute("colSpan", "2");
        spacerHeader.innerHTML = "";
        spacerRow.appendChild(spacerHeader); 
        
        return spacerRow;
    },

    createStationNameRow: function(name) {
        var nameRow = document.createElement("tr");
        var cell = document.createElement("td");
        cell.className = "stationName";
        cell.setAttribute("colSpan", 2);

        nameRow.appendChild(cell);

        return nameRow;
    },

    createAmountRow: function (station) {
        var amountRow = document.createElement("tr");
        
        var freeBikes = document.createElement("td");
        freeBikes.className = "amountRow";
        freeBikes.innerHTML = '<i class="fa fa-bicycle"></i> ' + station.available_bikes;
        amountRow.appendChild(freeBikes);

        var freeStands = document.createElement("td");
        freeStands.className = "amountRow";
        freeStands.innerHTML = '<i class="fa fa-dot-circle-o"></i> ' + station.available_bike_stands;
        amountRow.appendChild(freeStands);
        
        return amountRow;
    },

    createDataRow: function (data) {
        var row = document.createElement("tr");
        
        var symbol =  document.createElement("td");
        symbol.setAttribute("width","8px");
        symbol.className = "fa fa-bicycle";
        row.appendChild(symbol);
                
        var bikeNo = document.createElement("td");
        bikeNo.className = "bikeNo";
        bikeNo.innerHTML = data;
        
        row.appendChild(bikeNo);
        
        return row;
    }

});

var map;
var geocoder;
var searchMarker = null; 

var markers = [];
var cameras = [];

$(function() {
    
    map = L.map('map')
            .setView([1.3521, 103.8198], 12);
            
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);    
    
    geocoder = new google.maps.Geocoder();
    
    /*
    document.getElementById('search').onkeydown = function(){
        if (event.keyCode == 13) { searchAddress(); }
    }
    */
    

	map.addControl(new L.Control.Search({
			sourceData: googleGeocoding,
			formatData: formatJSON,
			markerLocation: true,
			autoType: false,
			autoCollapse: true,
			minLength: 5
		}) );

    
    getTrafficImages();

});

// Update every minute
window.setInterval(function(){
  getTrafficImages();
}, 60000);

function getTrafficImages() {
    console.log("Get Traffic Images");
    
    markers = [];
    cameras = [];
    
    var trafficMarker = L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'car',
        markerColor: 'red'
    });
    
    $.ajax({
        beforeSend: function(request) {
            request.setRequestHeader('api-key', '<YOUR_APP_ID>');
        },
        dataType: "json",
        url: 'https://api.data.gov.sg/v1/transport/traffic-images',
        success: function(data) {
            cameras = data.items[0].cameras;
            //console.log(cameras);
            
            console.log(cameras[0].timestamp);
            $('#last-update').text(cameras[0].timestamp);
            
            cameras.forEach(function(cam) {
               var marker = L.marker(
                   [parseFloat(cam.location.latitude), 
                    parseFloat(cam.location.longitude)],
                    {icon: trafficMarker})
                   .addTo(map)
                   .bindPopup('<p><img src="' + cam.image + '" width="250" height="250""/></p>');

            }); //for each
            
        }, // success
        error: function() {
            alert("Sorry, error getting data");
        }
    });
}

// Google Geocoding
function googleGeocoding(text, callResponse)
{
    geocoder.geocode(
        {'address': text, 
        componentRestrictions: {
            country: 'SG'
            }
        }, 
        callResponse);
}

function formatJSON(rawjson) {
    console.log(rawjson);
	var json = {},
		key, loc, disp = [];

	for(var i in rawjson)
	{
		key = rawjson[i].formatted_address;
		loc = L.latLng(rawjson[i].geometry.location.lat(), rawjson[i].geometry.location.lng());
		json[key]= loc;	
	}
	return json;
}

function searchAddress() {
    console.log("Search");
    var searchVal = $('#search').val();
    
    var geocoder = new google.maps.Geocoder();
    
    geocoder.geocode(
        {'address': searchVal, 
        componentRestrictions: {
            country: 'SG'
            }
        }, 
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log(results);
                
                var jsonResults = {}; var key, loc;
                for (var i in results) {
                    key = results[i].formatted_address;
                    loc = L.latLng(results[i].geometry.location.lat(), results[i].geometry.location.lng());
                    jsonResults[key] = loc;
                }
                
                var lat = results[0].geometry.location.lat();
                var lng = results[0].geometry.location.lng();
                //console.log(lat + " " + lng);
                createMarker(lat, lng);
                
                map.panTo([lat, lng]);
                map.setZoom(13);
            } else {
                alert("Error getting Geocode from Google!");
            }
    });
}

function createMarker(lat, lng) {
    var searchMarkerIcon = L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'search',
        markerColor: 'green'
    });
    
    if (searchMarker != undefined && searchMarker != '') {
        searchMarker.setLatLng([lat, lng]);
    } else {
        searchMarker = L.marker([lat, lng], {icon: searchMarkerIcon}).addTo(map);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener( 'maploaded', checkGeoPermissions );
	document.addEventListener( 'userlocationchanged', event => {
		if ( spacefinder.personInfo ) {
			spacefinder.personInfo.close();
		}
		if ( spacefinder.personMarker ) {
			spacefinder.personMarker.setPosition( spacefinder.personLoc );
            spacefinder.personMarker.title = getInfoWindowContent( spacefinder.personLoc )
		}
        geoReport( 'Your new location: lat: '+spacefinder.personLoc.lat+', lng: '+spacefinder.personLoc.lng );
		spacefinder.map.setCenter( spacefinder.personLoc );
	});
});
/**
 * First check permissions to see if geolocation services
 * are permitted on the site. If they have been denied,
 * disable the geolocation button and enable if permissions
 * are updated.
 */
function checkGeoPermissions() {
    google.maps.event.removeListener( spacefinder.mapLoaded );
    if ( 'permissions' in navigator && navigator.permissions.query ) {
        navigator.permissions.query( {
            name: 'geolocation'
        } ).then( result => {
            spacefinder.permission = result.state;
            geoReport( 'Geolocation permission: <strong>' + result.state + '</strong>' );
            if ( 'denied' == result.state ) {
                document.getElementById('use-geolocation').disabled = true;
            } else {
                document.getElementById('use-geolocation').disabled = false;
            }
            result.onchange = function() {
                spacefinder.permission = result.state;
                geoReport( 'Geolocation permission updated: ' + result.state );
                if ( 'denied' == result.state ) {
                    document.getElementById('use-geolocation').disabled = true;
                } else {
                    document.getElementById('use-geolocation').disabled = false;
                }
            }
        }).catch(error => {
            geoReport( 'Geolocation permission could not be queried: ' + error );
            document.getElementById('use-geolocation').disabled = true;
        });
    }
    /**
     * Tests for availability of geolocation on client, then
     * if granted: hides button, gets position and updates map
     * if prompt: shows button and adds click listener
     * if denied: hides button
     */
    if ( 'geolocation' in navigator ) {
        document.getElementById('use-geolocation').addEventListener('click', function () {
            if ( document.getElementById('use-geolocation').disabled ) {
                return;
            }
            if ( document.getElementById('use-geolocation').classList.contains('active') ) {
                /* make use my location button inactive */
                document.getElementById('use-geolocation').classList.remove('active');
                /* remove personmarker from map */
                spacefinder.personMarker.setMap(null);
                /* stop watching user position */
                navigator.geolocation.clearWatch( spacefinder.watchID );
                /* re-centre map */
                spacefinder.map.setCenter( spacefinder.currentLoc );
            } else {
                // get the current position
                getUserPosition();
            }
        });
    } else {
        document.getElementById('use-geolocation').classList.add('hidden');
    }
}
/**
 * gets the current position of the user device
 */
function getUserPosition() {
	navigator.geolocation.getCurrentPosition( position => {
        document.getElementById('use-geolocation').classList.add('active');
		spacefinder.personLoc.lat = position.coords.latitude;
		spacefinder.personLoc.lng = position.coords.longitude;
		geoReport( 'Your location: lat: '+spacefinder.personLoc.lat+', lng: '+spacefinder.personLoc.lng );
		spacefinder.map.setCenter( spacefinder.personLoc );
		spacefinder.personMarker = new google.maps.Marker({
			position: spacefinder.personLoc,
			map: spacefinder.map,
			title: getInfoWindowContent( spacefinder.personLoc ),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillOpacity: 1,
                strokeWeight: 2,
                fillColor: '#5384ED',
                strokeColor: '#ffffff',
            },
		});
		google.maps.event.addListener( spacefinder.personMarker, 'click', function (e) {
			spacefinder.personInfo = new google.maps.InfoWindow();
			spacefinder.personInfo.setContent( spacefinder.personMarker.title );
			spacefinder.personInfo.open( spacefinder.map, spacefinder.personMarker );
		});

		spacefinder.watchID = navigator.geolocation.watchPosition( position => {
            if ( ! ( spacefinder.personLoc.lat == position.coords.latitude && spacefinder.personLoc.lng == position.coords.longitude ) ) {
                geoReport( 'User position updated' );
                spacefinder.personLoc.lat = position.coords.latitude;
                spacefinder.personLoc.lng = position.coords.longitude;
                document.dispatchEvent( new Event( 'userlocationchanged' ) );
            }
        }, error => {
			navigator.geolocation.clearWatch( spacefinder.watchID );
		});
	}, (error) => {
		switch (error.code) {
			case 1:
				// Permission denied - The acquisition of the geolocation information failed because the page didn't have the permission to do it.
				break;
			case 2:
				// Position unavailable - The acquisition of the geolocation failed because at least one internal source of position returned an internal error.
				break;
			case 3:
				// Timeout - The time allowed to acquire the geolocation was reached before the information was obtained.
		}
		geoReport( 'Failed to get your location - ' + error.message + ' - button disabled' );
		document.getElementById('use-geolocation').disabled = true;
	});
}
/**
 * Displays user position on map (in infoWindow)
 */
function getInfoWindowContent( location ) {
    return '<div style="height:60px;width:200px"><b>Your location:</b><br />Latitude: ' + location.lat + '<br />Longitude: ' + location.lng + '</div>';
}
/**
 * Reporting function
 * assumes element with ID geo-report is present
 * @param {String} message HTML message to beappended to report
 */
function geoReport( message ) {
    return;
    let msg = document.createElement( 'p' );
    msg.innerHTML = message;
    document.getElementById('geo-report').append( msg );
}
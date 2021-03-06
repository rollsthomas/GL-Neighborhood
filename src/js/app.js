
// Scope to be used in all files
var self = this;

// Load main app
var MapMarker = function(marker, name, category, position, isActive) {
	this.marker = marker;
	this.name = name;
	this.category = category;
	this.position = position;
	this.isActive = isActive;
};

var PlaceItem = function(data) {
	this.web_url = ko.observable(data.web_url);
	this.snippet = ko.observable(data.snippet);
	this.name = ko.observable(data.name);
	this.category = ko.observable(data.category);
	this.optional = ko.observable(data.optional);
	this.image = ko.observable(data.image);
	this.address = ko.observable(data.address);
};

var PlaceViewModel = function(data) {
	self.neighborhood = ko.observable("");
	self.locationLat = ko.observable("");
	self.locationLng = ko.observable("");
	self.placeHeader = ko.observable("");

	// Toggle the address content visibility
	self.hasAddress = ko.observable(true);

	// Toggle the visibility of the image in the list view
	self.hasImage = ko.observable(true);

	// Toggle the visibility of the input box
	// This input box should only be visible for Foursquare
	self.isFilterVisible = ko.observable(true);

	// Foursquare search filter by text
	self.filter = ko.observable("");
	self.recommendedPlaces = ko.observableArray([]);
	self.placeList = ko.observableArray( self.recommendedPlaces() );

	self.mouseoutItemMarker = function(venue) {
		markers.forEach(function(pin) {
			if ( !pin.marker.isActive ) {
				pin.marker.setIcon( foursquareIcon1 );
			}
		});
	};

	self.mouseoverItemMarker = function(venue) {
		markers.forEach(function(pin) {
			if (pin.name === venue.name()) {
				pin.marker.setIcon( foursquareIcon2 );
			}
		});
	};

	self.clickMarker = function(venue) {
		var winHeight = $(window).height();
		if (winHeight < 875) {
			// Toggle the hamburger top MENU
			$("#menu").toggle("slide");
			map.panTo( marker.getPosition() );
		}

		markers.forEach(function(pin) {
			// Reset all animations
	        pin.marker.setAnimation(null);

			// Set marker icon to default
			pin.marker.setIcon( foursquareIcon1 );
			pin.marker.isActive = false;

			if (pin.name === venue.name()) {
				// Set marker and item to active
				pin.marker.setIcon( foursquareIcon2 );
				pin.marker.isActive = true;

				google.maps.event.trigger( pin.marker, 'click' );
				map.panTo( pin.position );
			}
		});
	};

	// Update observableArray based on the filter
	self.filteredList = ko.computed(function() {
		var place;
		var list = [];
		var filter = self.filter().toLowerCase();

		self.recommendedPlaces().forEach(function(place_item) {
			place = place_item;
			if ( place.name().toLowerCase().indexOf(filter) !== -1 ||
				 place.category().toLowerCase().indexOf(filter) !== -1 ) {
				list.push( place_item );
			}
		});

		self.placeList( list );
	});

	self.displayedMarkers = ko.computed(function() {
		var keyword = self.filter().toLowerCase();
		markers.forEach(function(item) {
			if (item.marker.map === null) {
				item.marker.setMap(map);
			}

			if (item.name.toLowerCase().indexOf(keyword) === -1 &&
				item.category.toLowerCase().indexOf(keyword) === -1) {
				item.marker.setMap(null);
			}
		});
	});
};

ko.applyBindings(new PlaceViewModel());

// Setting dynamic max-height property
var setMaxHeight = function() {
	var winHeight = $(window).height();

	var $menuPlaceList = $(".menu-places-list");

	var $searchBarHeight = $('#search-bar').outerHeight();
	var $menuPlacesHeader = $('.menu-places-header').outerHeight();

	var newMaxHeight = winHeight -
					$searchBarHeight -
					$menuPlacesHeader;

	console.log("New max height: " + newMaxHeight);

	$menuPlaceList.css({
		'max-height': newMaxHeight + "px"
	});
};

// Set the background color for the ICON and the LIST
var updateBackgroundColor = function(elem, color) {

	var fourSquareBackgroundColor = { "background-color" : color };

	// Set Icon Background Color, and remove others
	$(".menu-search-icon").css("background", "");
	elem.css(fourSquareBackgroundColor);

	// Menu Places
	$(".menu-places").css(fourSquareBackgroundColor);
};

// General string filter
var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};

// Page ready load function
$(function() {
	setMaxHeight();

	$(window).resize(function() {
		setMaxHeight();

		// after the center of the map has changed,
  		// pan back to the marker
		window.setTimeout(function() {
	      map.panTo(marker.getPosition());
	    });

	    window.addEventListener('resize', function() {
	    	map.fitBounds(mapBounds);
	    	$('#map').height( $(window).height() );
	    });
	});

	// Toggle the hamburger top MENU
	$("#hamburger-top-menu").click(function() {
		$("#menu").toggle("slide");
	});
});
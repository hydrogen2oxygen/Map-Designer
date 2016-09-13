/**
 * Copyright by Pietro Lusso 2016 - MIT LICENSE (see github: https://github.com/hydrogen2oxygen/Map-Designer/blob/master/LICENSE)
 */
var mapDesigner = {};

mapDesigner.mapDivId = 'map';

/**
 * Override this method for your own event handling
 */
mapDesigner.initCustomEvents = function() {};

mapDesigner.initEvents = function() {

};

mapDesigner.initToolbar = function() {

	mapDesigner.addButtonToToolbar('loadMapsButton', 'Load Maps', 'primary','import', function() {
		$.getJSON("testdata/data.json", function(data) {

			$.each( data.data, function( key, territory ) {
				mapDesigner.addTerritory(territory);
			});
		});
	});
};

mapDesigner.addButtonToToolbar = function(id,title,buttonClass,glyphicon,clickEvent) {

	var button = '<button id="ID" title="TITLE" class="btn btn-lg btn-toolbar btn-BUTTONCLASS"><span class="glyphicon glyphicon-GLYPHICON" aria-hidden="true"></span></button>';
	button = button.replace('ID',id).replace('TITLE',title).replace('BUTTONCLASS',buttonClass).replace('GLYPHICON',glyphicon);
	$('#toolbar').append( button );
	$('#toolbar').click(clickEvent);
};

/**
 * Configuration: you can override this uppercase variables for your website
 */
mapDesigner.FULLSCREEN_ID = '#fullscreen';
mapDesigner.DYNAMIC_SIDEPANEL_ID = '#mapDynamicSidePanel';
mapDesigner.DYNAMIC_SIDEPANEL_FULLSCREEN_HTML = 'mapSidePanelFullscreenMode.html';
mapDesigner.DYNAMIC_SIDEPANEL_COMPACT_HTML = 'mapSidePanelCompactMode.html';

/**
 * Init the openlayer map ... and note how easy openlayers can be if you write it well!
 */
mapDesigner.initMap = function() {

	mapDesigner.view = new ol.View({
		center : ol.proj.transform([ 9.41, 48.82 ], 'EPSG:4326','EPSG:3857'),
		zoom : 12
	});

	mapDesigner.fullScreenControl = new ol.control.FullScreen({	source : 'fullscreen' });

	// Territory Layer
	mapDesigner.sourceTerritory = new ol.source.Vector({});
	mapDesigner.layerTerritory = new ol.layer.Vector({ source: mapDesigner.sourceTerritory });
	mapDesigner.formatWKT = new ol.format.WKT();

	// OpenStreetMaps Layer
	mapDesigner.sourceOSM = new ol.source.OSM();
	mapDesigner.layerOSM = new ol.layer.Tile({ source : mapDesigner.sourceOSM });

	mapDesigner.map = new ol.Map({
		controls : ol.control.defaults().extend([ mapDesigner.fullScreenControl ]),
		layers : [
		           mapDesigner.layerOSM,
		           mapDesigner.layerTerritory
		         ],
		target : mapDesigner.mapDivId,
		view : mapDesigner.view
	});

	mapDesigner.switchFullScreenSidePanel(false);
};

mapDesigner.addTerritory = function(territory) {

	if (territory.polygon == null) {
		console.log(territory.number + ' has no polygon');
		return;
	}
	// no projection transformation is needed here, because the we store it in
	// the same as openlayers provides
	var feature = mapDesigner.formatWKT.readFeature(territory.polygon);
	mapDesigner.sourceTerritory.addFeature( feature );
};

mapDesigner.init = function() {
	console.log('init openlayers map');

	mapDesigner.initWindowsResize();
	mapDesigner.initEvents();
	mapDesigner.initCustomEvents();
};

mapDesigner.initWindowsResize = function() {
	mapDesigner.compactWidth = $( mapDesigner.FULLSCREEN_ID ).width();

	$( window ).resize(function() {
		  if ($( mapDesigner.FULLSCREEN_ID ).width() > mapDesigner.compactWidth) {
			  mapDesigner.prepareForFullScreen(true);
		  } else {
			  mapDesigner.prepareForFullScreen(false);
		  }
	});
};

/**
 * The sidePanel is dynamically loaded for both modes
 */
mapDesigner.switchFullScreenSidePanel = function(fullscreen) {

	if (fullscreen) {
		$.get( mapDesigner.DYNAMIC_SIDEPANEL_FULLSCREEN_HTML, function( data ) {
			$(mapDesigner.DYNAMIC_SIDEPANEL_ID).html(data);
			mapDesigner.initToolbar();
		});
	} else {
		$.get( mapDesigner.DYNAMIC_SIDEPANEL_COMPACT_HTML, function( data ) {
			$(mapDesigner.DYNAMIC_SIDEPANEL_ID).html(data);
		});
	}
};

/**
 * Simulating a "time delay relay" here with setTimeout, because depending on
 * implementation, resize events can be sent continuously as the resizing is in
 * progress (as https://api.jquery.com/resize/ describes it well), and therefore
 * code in a resize handler should never rely on the number of times the handler
 * is called.
 */
mapDesigner.prepareForFullScreen = function(fullscreen) {

	if (fullscreen && (mapDesigner.fullScreenModeSet == false || mapDesigner.fullScreenModeSet == null)) {
		mapDesigner.fullScreenModeSet = true;

		setTimeout(function() {
			mapDesigner.switchFullScreenSidePanel(true);
		}, 100);
	}

	if (fullscreen == false && mapDesigner.fullScreenModeSet) {

		mapDesigner.fullScreenModeSet = false;

		setTimeout(function() {
			mapDesigner.switchFullScreenSidePanel(false);
		}, 100);
	}
};

$(document).ready(function() {
	mapDesigner.init();
});
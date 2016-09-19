/**
 * Copyright by Pietro Lusso 2016 - MIT LICENSE (see github: https://github.com/hydrogen2oxygen/Map-Designer/blob/master/LICENSE)
 */
var mapDesigner = {};
var mapStyle = {};
var mapGeoUtils = {};

mapDesigner.mapDivId = 'map';

/**
 * Override this method for your own event handling
 */
mapDesigner.initCustomEvents = function() {};

mapDesigner.initEvents = function() {

};

mapDesigner.initToolbar = function() {
    
    mapDesigner.addButtonToToolbar('setHomeButton', 'Set home of the map', 'primary','home', function() {

        console.log('Home: ' + mapDesigner.map.getView().getCenter());
        console.log('Home: ' + mapDesigner.map.getView().getZoom());
    });

	mapDesigner.addButtonToToolbar('drawTerritoryButton', 'Draw territory', 'primary','pencil', function() {

	    var activateInteractions = mapDesigner.toggleButton('drawTerritoryButton');
		mapDesigner.modifyInteraction.setActive(activateInteractions);
		mapDesigner.drawInteraction.setActive(activateInteractions);
	});
};

/**
 * Toggles a button. It returns it's state as boolean
 */
mapDesigner.toggleButton = function(id) {

	if ($('#' + id).attr('class').indexOf('btn-primary') > -1) {

		$('#' + id).removeClass('btn-primary');
	    $('#' + id).addClass('btn-success');
	    return true;
	}

	$('#' + id).removeClass('btn-success');
	$('#' + id).addClass('btn-primary');
	return false;
};

/**
 * Add a button in a bootstrap style with custom click event function
 */
mapDesigner.addButtonToToolbar = function(id,title,buttonClass,glyphicon,clickEvent) {

	var button = '<button id="ID" title="TITLE" class="btn btn-lg btn-toolbar btn-BUTTONCLASS"><span class="glyphicon glyphicon-GLYPHICON" aria-hidden="true"></span></button>';
	button = button.replace('ID',id).replace('TITLE',title).replace('BUTTONCLASS',buttonClass).replace('GLYPHICON',glyphicon);
	$('#toolbar').append( button );
	$('#' + id).click(clickEvent);
};

/**
 * Configuration: you can override this uppercase variables for your website
 */
mapConfig = {
    FULLSCREEN_ID : '#fullscreen',
    DYNAMIC_SIDEPANEL_ID : '#mapDynamicSidePanel',
    DYNAMIC_SIDEPANEL_FULLSCREEN_HTML : 'mapSidePanelFullscreenMode.html',
    DYNAMIC_SIDEPANEL_COMPACT_HTML : 'mapSidePanelCompactMode.html'
};

/**
 * Load all territories
 */
mapDesigner.loadAllTerritories = function() {
	$.getJSON("testdata/data.json", function(data) {

		$.each( data.data, function( key, territory ) {
			mapDesigner.addTerritory(territory);
		});
	});
};

mapDesigner.initModifyInteraction = function() {

	mapDesigner.modifyInteraction = new ol.interaction.Modify({
        features: mapDesigner.features,
        // the SHIFT key must be pressed to delete vertices, so
        // that new vertices can be drawn at the same position
        // of existing vertices
        deleteCondition: function(event) {
          return ol.events.condition.shiftKeyOnly(event) &&
              ol.events.condition.singleClick(event);
        }
      });

      mapDesigner.map.addInteraction(mapDesigner.modifyInteraction);
      mapDesigner.modifyInteraction.setActive(false);
};

mapDesigner.initDrawInteraction = function() {

    mapDesigner.drawInteraction = new ol.interaction.Draw({
        features: mapDesigner.features,
        type: 'Polygon'
      });

      mapDesigner.map.addInteraction(mapDesigner.drawInteraction);
      mapDesigner.drawInteraction.setActive(false);
};

/**
 * Init the openlayer map ... and note how easy openlayers can be if you write it well!
 */
mapDesigner.initMap = function() {

	mapDesigner.view = new ol.View({
		center : [1023331.1189745606,6221767.552882004],
		zoom : 14
	});

	mapDesigner.fullScreenControl = new ol.control.FullScreen({	source : 'fullscreen' });

	// Territory Layer
	mapDesigner.features = new ol.Collection();
	mapDesigner.sourceTerritory = new ol.source.Vector({ features: mapDesigner.features });
	mapDesigner.layerTerritory = new ol.layer.Vector({ 
	    source: mapDesigner.sourceTerritory,
	    style : mapDesigner.createPolygonStyleFunction()
	});
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

	// add additional information
	feature.number = territory.number;
	feature.city = territory.city;
	feature.name = feature.number + " " + feature.city;
	feature.contacts = territory.contacts;

	mapDesigner.sourceTerritory.addFeature( feature );
};

mapDesigner.init = function() {
	console.log('init openlayers map');

	mapDesigner.initWindowsResize();
	mapDesigner.initEvents();
	mapDesigner.initCustomEvents();
	mapDesigner.loadAllTerritories();
	mapDesigner.initModifyInteraction();
	mapDesigner.initDrawInteraction();
};

mapDesigner.initWindowsResize = function() {
	mapDesigner.compactWidth = $( mapConfig.FULLSCREEN_ID ).width();

	$( window ).resize(function() {
		  if ($( mapConfig.FULLSCREEN_ID ).width() > mapDesigner.compactWidth) {
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
		$.get( mapConfig.DYNAMIC_SIDEPANEL_FULLSCREEN_HTML, function( data ) {
			$(mapConfig.DYNAMIC_SIDEPANEL_ID).html(data);
			mapDesigner.initToolbar();
		});
	} else {
		$.get( mapConfig.DYNAMIC_SIDEPANEL_COMPACT_HTML, function( data ) {
			$(mapConfig.DYNAMIC_SIDEPANEL_ID).html(data);
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

/**
 * Text
 */
mapStyle.textProperties = {
    polygons : {
        text : 'normal',
        align : 'center',
        baseline : 'middle',
        rotation : 0,
        font : 'Verdana',
        weight : 'bold',
        size : '11px',
        offsetX : 0,
        offsetY : 0,
        color : 'black',
        outline : 'yellow',
        outlineWidth : 3,
        maxreso : 17
    }
};

/**
 * Callback function retrieves the text attribute of the feature
 */
mapStyle.getText = function(feature, resolution, dom) {
    var type = dom.text.value;
    var maxResolution = dom.maxreso;

    var text = feature.name;

    if (resolution > maxResolution) {
        text = '';
    }

    else if (type == 'hide') {
        text = '';
    } else if (type == 'shorten') {
        text = text.trunc(12);
    } else if (type == 'wrap') {
        text = stringDivider(text, 16, '\n');
    }

    return text;
};

/**
 * Create the text style according to the "dom" properties
 */
mapStyle.createTextStyle = function(feature, resolution, dom) {
    var align = dom.align;
    var baseline = dom.baseline;
    var size = dom.size;
    var offsetX = parseInt(dom.offsetX, 10);
    var offsetY = parseInt(dom.offsetY, 10);
    var weight = dom.weight;
    var rotation = parseFloat(dom.rotation);
    var font = weight + ' ' + size + ' ' + dom.font;
    var fillColor = dom.color;
    var outlineColor = dom.outline;
    var outlineWidth = parseInt(dom.outlineWidth, 10);

    return new ol.style.Text({
        textAlign : align,
        textBaseline : baseline,
        font : font,
        text : mapStyle.getText(feature, resolution, dom),
        fill : new ol.style.Fill({
            color : fillColor
        }),
        stroke : new ol.style.Stroke({
            color : outlineColor,
            width : outlineWidth
        }),
        offsetX : offsetX,
        offsetY : offsetY,
        rotation : rotation
    });
};

mapStyle.fillColor = 'rgba(105, 155, 105, 0.1)';
mapStyle.strokeColor = 'rgba(155, 0, 0, 0.8)';

mapDesigner.createPolygonStyleFunction = function() {
    return function(feature, resolution) {
        var style = new ol.style.Style({
            stroke : new ol.style.Stroke({
                color : mapStyle.strokeColor,
                width : 2
            }),
            fill : new ol.style.Fill({
                color : mapStyle.fillColor
            }),
            text : mapStyle.createTextStyle(feature, resolution, mapStyle.textProperties.polygons)
        });
        return [ style ];
    };
};

mapGeoUtils.transformCoordinatePoint = function(wtkPoint, projectionSource, projectionTarget) {
    
    return ol.proj.transform(mapGeoUtils.getCoordinatesFromString(wtkPoint)[0], projectionSource, projectionTarget);
};

/**
 * Returns a float array from a coordinateString
 */
mapGeoUtils.getCoordinatesFromString = function(coordinatesString) {
    var coords = coordinatesString.split(",")
    var temp = coords.slice();
    var arr = [];

    while (temp.length) {
        var innerArray = [ parseFloat(temp[0]) , parseFloat(temp[1]) ];
        arr.push(innerArray);
        temp.splice(0,2);
    }

    return arr;
};

$(document).ready(function() {
    //console.log(mapGeoUtils.transformCoordinatePoint('9.41, 48.82','EPSG:4326','EPSG:3857'));
	mapDesigner.init();
});
/**
 * Copyright by Pietro Lusso 2016 - MIT LICENSE (see github: https://github.com/hydrogen2oxygen/Map-Designer/blob/master/LICENSE)
 */
var mapDesigner = {};

mapDesigner.mapDivId = 'map';

mapDesigner.initEvents = function() {

	$('#mapDesignerButton').click(function(){
		mapDesigner.toggleFullScreen();
	});
};

mapDesigner.initMap = function() {

	mapDesigner.view = new ol.View({
		center : ol.proj.transform([ 9.41, 48.82 ], 'EPSG:4326','EPSG:3857'),
		zoom : 12
	});

	mapDesigner.map = new ol.Map({
		controls : ol.control.defaults().extend(
				[ new ol.control.FullScreen({
					source : 'fullscreen'
				}) ]),
		layers : [ new ol.layer.Tile({
			source : new ol.source.OSM()
		}) ],
		target : mapDesigner.mapDivId,
		view : mapDesigner.view
	});
};

mapDesigner.init = function() {
	console.log('init openlayers map');
	mapDesigner.initEvents();
};

mapDesigner.toggleFullScreen = function() {

	if ($('#fullscreen').attr('class') == 'fullscreen') {
		$('#fullscreen').removeClass('fullscreen');
		$('#fullscreen').addClass('fullscreen-hidden');
	} else {
		$('#fullscreen').removeClass('fullscreen-hidden');
		$('#fullscreen').addClass('fullscreen');

		if (!mapDesigner.map) {
			mapDesigner.initMap();
		}
	}
};

$(document).ready(function() {
	mapDesigner.init();
});
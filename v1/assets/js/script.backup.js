$(function(){
var topologyUrl = "./topology-nyko.json";
var topologyName = "Nyko2_WGS84";

//var topologyUrl = "./us.json";
//var topologyName = "land";
var width = $(document).width() - 20,
    height = $(document).height() -20;

//var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
//var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

function getProjection(features) {
    var center = d3.geo.centroid(features);
    var scale  = 18000;
    var offset = [width/2, height/2];

    return d3.geo.mercator()
        //.center([16.45, 62.63]).scale(14000)
        .scale(scale).center(center).translate(offset);
}

d3.json(topologyUrl, function(error, topology) {
    var features = topojson.feature(topology, topology.objects[topologyName]);
    var projection = getProjection(features);
    var path = d3.geo.path()
        .projection(projection);

    var tile = d3.geo.tile()
        .scale(projection.scale() * 2 * Math.PI)
        .translate(projection([0, 0]))
        .zoomDelta((window.devicePixelRatio || 1) - .5);
    var tiles = tile();
    var defs = svg.append("defs");

    defs.append("filter")
        .attr("id", "blur")
        .append("feGaussianBlur")
        .attr("stdDeviation", 5);

    defs.append("path")
        .attr("id", "land")
        .datum(features)
        .attr("d", path);


    defs.append("clipPath")
        .attr("id", "clip")
        .append("use")
        .attr("xlink:href", "#land");


    svg.append("use")
        .attr("xlink:href", "#land")
        .attr("class", "land-glow");

/*

    svg.append("use")
        .attr("xlink:href", "#land")
        .attr("class", "land-fill");
*/



    svg.append("g")
        .attr("clip-path", "url(#clip)")
        .selectAll("image")
        .data(tiles)
        .enter().append("image")
        .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v4/mapbox.outdoors/" + d[2] + "/" + d[0] + "/" + d[1] + ".png?access_token=pk.eyJ1IjoiZG9ub3RidWdtZSIsImEiOiJaNHFLQzlFIn0.dBH6ENwvC1aoLPnsXsHPZA"; })
        .attr("width", Math.round(tiles.scale))
        .attr("height", Math.round(tiles.scale))
        .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
        .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); });

    svg.selectAll("path")
        .data(topojson.feature(topology, topology.objects[topologyName]).features)
        .enter().append("path")
        .attr("d", path);

    svg.append("use")
        .attr("xlink:href", "path")
        .attr("class", "stroke");

});
    d3.select(self.frameElement).style("height", height + "px");
});
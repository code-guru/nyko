var sundsvallRegions = (function(){

    var setting = {
        width: 510,
        height: 600,
        scale: 20000,
        tooltipHtml: function(n, d){	/* function to create html content string in tooltip div. */
            return "<h4>"+n+"</h4><table>"+
                "<tr><td>Low</td><td>"+(d.low)+"</td></tr>"+
                "<tr><td>Average</td><td>"+(d.avg)+"</td></tr>"+
                "<tr><td>High</td><td>"+(d.high)+"</td></tr>"+
                "</table>";
        },
        init: function() {
            this.offset = [this.width/2  ,this.height/2];
            return this;
        }
    }.init();

    function getFeatures(topology, topologyName) {
        return topojson.feature(topology, topology.objects[topologyName]);
    }
    function getProjection(topology, topologyName) {
        var width = setting.width;
        var height = setting.height;

        var features = getFeatures(topology, topologyName);
        var center = d3.geo.centroid(features);

        var projection =  d3.geo.mercator()
            .scale(scale)
            .center(center)
            .translate(setting.offset);

        var path = d3.geo.path().projection(projection);

        // using the path determine the bounds of the current map and use
        // these to determine better values for the scale and translation
        var bounds  = path.bounds(features);
        var hscale  = setting.scale*width  / (bounds[1][0] - bounds[0][0]);
        var vscale  = setting.scale*height / (bounds[1][1] - bounds[0][1]);
        var scale   = (hscale < vscale) ? hscale : vscale;
        var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
            height - (bounds[0][1] + bounds[1][1])/2];

        // new projection
        return d3.geo.mercator().center(center)
            .scale(scale).translate(offset);

    }

    function getPath(topology, topologyName) {
        return d3.geo.path().projection(getProjection(topology, topologyName));
    }

    function getTiles(topology, topologyName) {
        var projection = getProjection(topology, topologyName);
        var tile = d3.geo.tile()
            .scale(projection.scale() * 2 * Math.PI)
            .translate(projection([0, 0]))
            .size([setting.width, setting.height])
            .zoomDelta((window.devicePixelRatio || 1) - .5);

       return tile();
    }

    function getTileUrl(d) {
        return "//" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v4/mapbox.emerald/" + d[2] + "/" + d[0] + "/" + d[1] + ".png?access_token=pk.eyJ1IjoiZG9ub3RidWdtZSIsImEiOiJaNHFLQzlFIn0.dBH6ENwvC1aoLPnsXsHPZA";
    }

    function mouseOver(d){
        d3.select("#tooltip").transition().duration(200).style("opacity", .9);

        d3.select("#tooltip").html(setting.tooltipHtml(d.n, data[d.id]))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    function mouseOut(){
        d3.select("#tooltip").transition().duration(500).style("opacity", 0);
    }

    function init(topology) {
        return {
            draw: function(container){ // add data parameter
                var topologyName = "Nyko2_WGS84";
                var tiles = getTiles(topology, topologyName);
                var features = getFeatures(topology, topologyName);
                var path = getPath(topology, topologyName);

                var svg = d3.select(container).append("svg")
                    .attr("width", setting.width)
                    .attr("height", setting.height);

                svg.append("g")
                    .attr("clip-path", "url(#clip)")
                    .selectAll("image")
                    .data(tiles)
                    .enter().append("image")
                    .attr("xlink:href",getTileUrl)
                    .attr("width", Math.round(tiles.scale))
                    .attr("height", Math.round(tiles.scale))
                    .attr("x", function (d) {
                        return Math.round((d[0] + tiles.translate[0]) * tiles.scale);
                    })
                    .attr("y", function (d) {
                        return Math.round((d[1] + tiles.translate[1]) * tiles.scale);
                    });




                svg.selectAll("path")
                    .data(features.features)
                    .attr('class', 'region')
                    .enter().append("path")
                    .attr("d", path)
                    .text(function (d) {
                        return d.properties.Namn;
                    })
                    .attr("data-namn", function (d) {
                        return d.properties.Namn;
                    });


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

                d3.select(self.frameElement).style("height", setting.height + "px");


               /* svg.selectAll(".state")
                    .data(uStatePaths).enter().append("path").attr("class","state").attr("d",function(d){ return d.d;})
                    .style("fill",function(d){ return data[d.id].color; })
                    .on("mouseover", mouseOver).on("mouseout", mouseOut);*/
            }
        }

    }
    return {
        init : init
    };
})();


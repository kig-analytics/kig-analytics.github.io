var width = Math.min(960, window.innerWidth),
    	height = Math.min(500, window.innerHeight);

	var tile = d3.geo.tile()
	    .size([width, height]);

	var projection = d3.geo.mercator()
	    .center([-87.6298, 41.8781]) // sf : center([-122.4400, 37.7524]), chicago: center([-87.6298, 41.8781])
	    .scale((1 << 21) / 2 / Math.PI) // change scale here, 21 is about z13
	    .translate([width / 2, height / 2]);

	var tileProjection = d3.geo.mercator(); //not sure if we need this

	var tilePath = d3.geo.path()
	    .projection(projection);

	var map = d3.select("body").append("svg")
	    .attr("class", "map")
	    .attr("width", width)
	    .attr("height", height);
	
	map.append("rect")
	    	.attr("width", "100%")
	    	.attr("height", "100%")
	    	.attr("fill","#ffcc66");

	var layer = map.append("svg")
	    .attr("class", "layer");

  	var layers = ['water', 'earth', 'roads'];

	map.selectAll("g")
	    .data(tile
	      .scale(projection.scale() * 2 * Math.PI)
	      .translate(projection([0, 0])))
	  .enter().append("g")
	    .each(function(d) {
	      var g = d3.select(this);
	      d3.json("https://tile.mapzen.com/mapzen/vector/v1/all/" + d[2] + "/" + d[0] + "/" + d[1] + ".json?api_key=mapzen-KAAL6W1", function(error, json) {
	        if (error) throw error;

		      // build up a single concatenated array of all tile features from all tile layers
		      var features = [];
		      layers.forEach(function(layer){
		        if(json[layer])
		        {	
		            for(var i in json[layer].features)
		            {
		                // Don't include any label placement points
		                if(json[layer].features[i].properties.label_placement) { continue }

		                // Don't show large buildings at z13 or below.
		                if(layer == 'buildings') { continue }

		                // Don't show small buildings at z14 or below.
		                if(layer == 'buildings' && json[layer].features[i].properties.area < 2000) { continue }
		      
		                json[layer].features[i].layer_name = layer;
		                features.push(json[layer].features[i]);
		            }
		        }
		      });

	        g.selectAll("path")
	          .data(features.sort(function(a, b) { return a.properties.sort_rank ? a.properties.sort_rank - b.properties.sort_rank : 0 }))
	        .enter().append("path")
	          .attr("class", function(d) { var kind = d.properties.kind || ''; if(d.properties.boundary){kind += '_boundary';} return d.layer_name + '-layer ' + kind; })
	          .attr("d", tilePath);
	      });
	    });
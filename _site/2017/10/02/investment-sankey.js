d3.sankey = function() {
    var sankey = {},
        nodeWidth = 30,
        nodePadding = 8,
        size = [1, 1],
        nodes = [],
        links = [];

    sankey.nodeWidth = function(_) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = +_;
        return sankey;
    };

    sankey.nodePadding = function(_) {
        if (!arguments.length) return nodePadding;
        nodePadding = +_;
        return sankey;
    };

    sankey.nodes = function(_) {
        if (!arguments.length) return nodes;
        nodes = _;
        return sankey;
    };

    sankey.links = function(_) {
        if (!arguments.length) return links;
        links = _;
        return sankey;
    };

    sankey.size = function(_) {
        if (!arguments.length) return size;
        size = _;
        return sankey;
    };

    sankey.layout = function(iterations) {
        computeNodeLinks();
        computeNodeValues();
        computeNodeBreadths();
        computeNodeDepths(iterations);
        computeLinkDepths();
        return sankey;
    };

    sankey.relayout = function() {
        computeLinkDepths();
        return sankey;
    };

    sankey.link = function() {
        var curvature = .5;

        function link(d) {
            var x0 = d.source.x + d.source.dx,
                x1 = d.target.x,
                xi = d3.interpolateNumber(x0, x1),
                x2 = xi(curvature),
                x3 = xi(1 - curvature),
                y0 = d.source.y + d.sy + d.dy / 2,
                y1 = d.target.y + d.ty + d.dy / 2;
            return "M" + x0 + "," + y0
                + "C" + x2 + "," + y0
                + " " + x3 + "," + y1
                + " " + x1 + "," + y1;
        }

        link.curvature = function(_) {
            if (!arguments.length) return curvature;
            curvature = +_;
            return link;
        };

        return link;
    };

    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
        nodes.forEach(function(node) {
            node.sourceLinks = [];
            node.targetLinks = [];
        });
        links.forEach(function(link) {
            var source = link.source,
                target = link.target;
            if (typeof source === "number") source = link.source = nodes[link.source];
            if (typeof target === "number") target = link.target = nodes[link.target];
            source.sourceLinks.push(link);
            target.targetLinks.push(link);
        });
    }

    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
        nodes.forEach(function(node) {
            node.value = Math.max(
                d3.sum(node.sourceLinks, value),
                d3.sum(node.targetLinks, value)
            );
        });
    }

    // Iteratively assign the breadth (x-position) for each node.
    // Nodes are assigned the maximum breadth of incoming neighbors plus one;
    // nodes with no incoming links are assigned breadth zero, while
    // nodes with no outgoing links are assigned the maximum breadth.
    function computeNodeBreadths() {
        var remainingNodes = nodes,
            nextNodes,
            x = 0;

        while (remainingNodes.length) {
            nextNodes = [];
            remainingNodes.forEach(function(node) {
                node.x = x;
                node.dx = nodeWidth;
                node.sourceLinks.forEach(function(link) {
                    nextNodes.push(link.target);
                });
            });
            remainingNodes = nextNodes;
            ++x;
        }

        //
        moveSinksRight(x);
        scaleNodeBreadths((width - nodeWidth) / (x - 1));
    }

    function moveSourcesRight() {
        nodes.forEach(function(node) {
            if (!node.targetLinks.length) {
                node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
            }
        });
    }

    function moveSinksRight(x) {
        nodes.forEach(function(node) {
            if (!node.sourceLinks.length) {
                node.x = x - 1;
            }
        });
    }

    function scaleNodeBreadths(kx) {
        nodes.forEach(function(node) {
            node.x *= kx;
        });
    }

    function computeNodeDepths(iterations) {
        var nodesByBreadth = d3.nest()
            .key(function(d) { return d.x; })
            .sortKeys(d3.ascending)
            .entries(nodes)
            .map(function(d) { return d.values; });

        //
        initializeNodeDepth();
        resolveCollisions();
        for (var alpha = 1; iterations > 0; --iterations) {
            relaxRightToLeft(alpha *= .99);
            resolveCollisions();
            relaxLeftToRight(alpha);
            resolveCollisions();
        }

        function initializeNodeDepth() {
            var ky = d3.min(nodesByBreadth, function(nodes) {
                return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
            });

            nodesByBreadth.forEach(function(nodes) {
                nodes.forEach(function(node, i) {
                    node.y = i;
                    node.dy = node.value * ky;
                });
            });

            links.forEach(function(link) {
                link.dy = link.value * ky;
            });
        }

        function relaxLeftToRight(alpha) {
            nodesByBreadth.forEach(function(nodes, breadth) {
                nodes.forEach(function(node) {
                    if (node.targetLinks.length) {
                        var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
                        // added Math.abs()
                        node.y += (y - center(node)) * alpha;
                    }
                });
            });

            function weightedSource(link) {
                return center(link.source) * link.value;
            }
        }

        function relaxRightToLeft(alpha) {
            nodesByBreadth.slice().reverse().forEach(function(nodes) {
                nodes.forEach(function(node) {
                    if (node.sourceLinks.length) {
                        var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
                        // added Math.abs()
                        node.y += (y - center(node)) * alpha;
                    }
                });
            });

            function weightedTarget(link) {
                return center(link.target) * link.value;
            }
        }

        function resolveCollisions() {
            nodesByBreadth.forEach(function(nodes) {
                var node,
                    dy,
                    y0 = 0,
                    n = nodes.length,
                    i;

                // Push any overlapping nodes down.
                /*nodes.sort(ascendingDepth);*/
                for (i = 0; i < n; ++i) {
                    node = nodes[i];
                    dy = y0 - node.y;
                    if (dy > 0) node.y += dy;
                    y0 = node.y + node.dy + nodePadding;
                }

                // If the bottommost node goes outside the bounds, push it back up.
                dy = y0 - nodePadding - size[1];
                if (dy > 0) {
                    y0 = node.y -= dy;

                    // Push any overlapping nodes back up.
                    for (i = n - 2; i >= 0; --i) {
                        node = nodes[i];
                        dy = node.y + node.dy + nodePadding - y0;
                        if (dy > 0) node.y -= dy;
                        y0 = node.y;
                    }
                }
            });
        }

        /*function ascendingDepth(a, b) {
         return a.y - b.y;
         }*/
    }

    function computeLinkDepths() {
        nodes.forEach(function(node) {
            node.sourceLinks.sort(ascendingTargetDepth);
            node.targetLinks.sort(ascendingSourceDepth);
        });
        nodes.forEach(function(node) {
            var sy = 0, ty = 0;
            node.sourceLinks.forEach(function(link) {
                link.sy = sy;
                sy += link.dy;
            });
            node.targetLinks.forEach(function(link) {
                link.ty = ty;
                ty += link.dy;
            });
        });

        function ascendingSourceDepth(a, b) {
            return a.source.y - b.source.y;
        }

        function ascendingTargetDepth(a, b) {
            return a.target.y - b.target.y;
        }
    }

    function center(node) {
        return node.y + node.dy / 2;
    }

    function value(link) {
        return link.value;
    }

    return sankey;
};

var margin = {top: 0, right: 0, bottom: 10, left: 0},
    width = 1108 - margin.left - margin.right,
    height = 1208 - margin.top - margin.bottom;

var formatNumber = d3.format("$,.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d); };

var color = [{"name":"Loop","color":"#143e64"}
            ,{"name":"River North","color":"#2869a4"}
            ,{"name":"Streeterville","color":"#0086c8"}
            ,{"name":"Lincoln Park","color":"#29e0ff"}
            ,{"name":"West Loop","color":"#00b5db"}
            ,{"name":"Rush & Division","color":"#aae1f4"}
            ,{"name":"Hyde Park","color":"#143e64"}
            ,{"name":"Uptown","color":"#2869a4"}
            ,{"name":"Rogers Park","color":"#0086c8"}
            ,{"name":"West Town","color":"#29e0ff"}
            ,{"name":"Old Town","color":"#00b5db"}
            ,{"name":"Edgewater","color":"#aae1f4"}
            ,{"name":"Lake View","color":"#143e64"}
            ,{"name":"Near South Side","color":"#2869a4"}
            ,{"name":"Wicker Park","color":"#0086c8"}
            ,{"name":"Boystown","color":"#29e0ff"}
            ,{"name":"Lincoln Square","color":"#461e45"}
            ,{"name":"Mount Greenwood","color":"#783877"}
            ,{"name":"Roseland","color":"#b56db4"}
            ,{"name":"Riverdale","color":"#e0b1df"}
            ,{"name":"West Ridge","color":"#f8dbf8"}
            ,{"name":"North Center","color":"#783877"}
            ,{"name":"Logan Square","color":"#783877"}
            ,{"name":"Kenwood","color":"#b56db4"}
            ,{"name":"Irving Park","color":"#e0b1df"}
            ,{"name":"Avondale","color":"#f8dbf8"}
            ,{"name":"Sheffield & DePaul","color":"#461e45"}
            ,{"name":"Albany Park","color":"#f8dbf8"}
            ,{"name":"Bucktown","color":"#461e45"}
            ,{"name":"Humboldt Park","color":"#29e0ff"}
            ,{"name":"Crescent Heights","color":"#143e64"}
            ,{"name":"Heitman","color":"#2869a4"}
            ,{"name":"PGIM Real Estate","color":"#0086c8"}
            ,{"name":"The Laramar Group, LLC","color":"#29e0ff"}
            ,{"name":"Golub & Company","color":"#00b5db"}
            ,{"name":"Invesco","color":"#aae1f4"}
            ,{"name":"Hartz Mountain Industries, Inc.","color":"#143e64"}
            ,{"name":"MetLife, Inc.","color":"#2869a4"}
            ,{"name":"LaSalle Investment Management Inc.","color":"#0086c8"}
            ,{"name":"Morguard North American Residential REIT","color":"#29e0ff"}
            ,{"name":"AXA Investment Managers","color":"#00b5db"}
            ,{"name":"L&B Realty Advisors, LLP","color":"#aae1f4"}
            ,{"name":"JPMorgan Chase & Co. Investment Management","color":"#143e64"}
            ,{"name":"Pioneer Acquisitions, LLC","color":"#2869a4"}
            ,{"name":"Magellan Development Group, Ltd.","color":"#0086c8"}
            ,{"name":"Canyon Capital Realty Advisors, LLC","color":"#29e0ff"}
            ,{"name":"RREEF Management LLC","color":"#461e45"}
            ,{"name":"CLK Properties","color":"#783877"}
            ,{"name":"The Scion Group LLC","color":"#b56db4"}
            ,{"name":"Angelo, Gordon & Co.","color":"#e0b1df"}
            ,{"name":"Waterton Associates LLC","color":"#f8dbf8"}
            ,{"name":"Berkshire Group","color":"#783877"}
            ,{"name":"Gerding Edlen","color":"#783877"}
            ,{"name":"The Related Companies","color":"#b56db4"}
            ,{"name":"Harrison Street Capital","color":"#e0b1df"}
            ,{"name":"American Realty Advisors","color":"#f8dbf8"}
            ,{"name":"Monogram Residential Trust","color":"#461e45"}
            ,{"name":"Strategic Properties of North America","color":"#f8dbf8"}
            ,{"name":"GID Investment Advisers, LLC","color":"#461e45"}
            ,{"name":"The Habitat Company","color":"#29e0ff"}
            ,{"name":"Emmes Asset Management Company LLC / Vanbarton Group","color":"#00b5db"}
            ,{"name":"Clarion Partners","color":"#aae1f4"}
            ,{"name":"Village Green","color":"#143e64"}
            ,{"name":"Canada Pension Plan Investment Board","color":"#2869a4"}
            ,{"name":"CIM Group LP","color":"#0086c8"}
            ,{"name":"Barings Real Estate Advisers LLC","color":"#29e0ff"}
            ,{"name":"Onni Group","color":"#00b5db"}
            ,{"name":"FPA Multifamily, LLC","color":"#aae1f4"}
            ,{"name":"JMG Realty, Inc.","color":"#143e64"}
            ,{"name":"The Bascom Group","color":"#2869a4"}
            ,{"name":"Alcion Ventures","color":"#0086c8"}
            ,{"name":"The Carlyle Group","color":"#29e0ff"}
            ,{"name":"Fifield Capital Partners","color":"#461e45"}
            ,{"name":"CA Ventures, LLC","color":"#783877"}
            ,{"name":"Castle Lanterra Properties","color":"#b56db4"}
            ,{"name":"EquiShares Real Estate Company","color":"#e0b1df"}
            ,{"name":"Bixby Bridge Capital","color":"#f8dbf8"}
            ,{"name":"Capital Realty Group, Inc","color":"#783877"}
            ,{"name":"PNC Financial Services Group, Inc.","color":"#783877"}
            ,{"name":"Vestian Group Inc.","color":"#b56db4"}
            ,{"name":"UBS Group","color":"#e0b1df"}
            ,{"name":"Focus Development, Inc.","color":"#f8dbf8"}
            ,{"name":"Loyola University Chicago","color":"#461e45"}
            ,{"name":"Time Equities, Inc.","color":"#f8dbf8"}
            ];

// append the svg canvas to the page
var svg = d3.select("#viz_container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(25)
    .nodePadding(8)
    .size([width, height]);

var path = sankey.link();

// load the data (using the timelyportfolio csv method)
d3.csv("i_sankey_v13.csv",function(error, data){
 d3.csv("i_sankey_panel.csv",function(error, s_panel){
  d3.csv("i_sankey_titles.csv",function(error, s_title){
   d3.csv("i_description.csv", function(error, descriptions) {
        console.log("data: ",data);
        console.log("s_panel: ",s_panel);
        console.log("s_title: ",s_title);

        var legend = d3.select("#sankey-panel")

        //set up graph in same style as original example but empty
        graph = {"nodes" : [], "links" : []};

        data.forEach(function (d) {
            graph.nodes.push({ "name": d.source });
            graph.nodes.push({ "name": d.target });
            graph.links.push({ "source": d.source,
                "target": d.target,
                "value": +d.value });
        });

        // return only the distinct / unique nodes
        graph.nodes = d3.keys(d3.nest()
            .key(function (d) { return d.name; })
            .map(graph.nodes));
        graph.nodes.sort(function(x, y){
            return d3.ascending(x.value, y.value);
        })
        //console.log(graph.nodes);
        // loop through each link replacing the text with its index from node
        graph.links.forEach(function (d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });
        //console.log(graph.links);
        //now loop through each nodes to make nodes an array of objects
        // rather than an array of strings
        graph.nodes.forEach(function (d, i) {
            graph.nodes[i] = { "name": d };
        });

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(200);

        // add in the links
        var link = svg.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .attr("id", function(d,i){
                d.id = i;
                return "link-"+i;
            })
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; });
        //.on("mouseover",highlight_link)
        //.on("mouseout",unhighlight_link);

        link.append("title")
            .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

        var node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .on("mouseover",highlight_node_links)
            .on("mouseout",remove_highlight)
            .call(d3.behavior.drag()
                .origin(function(d) { return d; })
                // interfering with click .on("dragstart", function() { this.parentNode.appendChild(this); })
                .on("drag", dragmove));

        node.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) {
                for(i=0; i<color.length; i++){
                    if(d.name===color[i].name){
                        return color[i].color;
                    }
                }
            });

        node.append("text")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 3; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("font-size", "0.65em")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        function dragmove(d) {
            d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
            sankey.relayout();
            link.attr("d", path);
        }

        function highlight_node_links(node,i){

            var remainingNodes=[],
                nextNodes=[];

            //console.log("NODE: ",node);
            //console.log("LINK: ",link);

            for(var j=0; j < s_title.length; j++){
              if(s_title[j].name===node.name){
                legend.append("div")
                    .attr("id","tab")
                    .attr("height",200)
                    .attr("width",500)
                    .html("<h1 class='panel_title'>"+s_title[j].name+"</h1>"+
                        "<h3 class='panel_desc'>"+formatNumber(s_title[j].value)+
                        "<br />"+"</h3>");
                }
            }
            for(var j=0; j < descriptions.length; j++){
                if(descriptions[j].name===node.name){
                    legend.append("div")
                        .attr("id","description")
                        .attr("height",200)
                        .attr("width",500)
                        .html("<p class='body_text'>"+descriptions[j].desc+"</p>");
                }
            }

            var stroke_opacity = 0;
            if( d3.select(this).attr("data-clicked") == "1" ){
                d3.select(this).attr("data-clicked","0");
                stroke_opacity = 0.1;
            }else{
                d3.select(this).attr("data-clicked","1");
                stroke_opacity = 0.3;
            }

            for(var k=0; k < s_panel.length; k++){
                //console.log(data[k]);
                //console.log(node.name);
                if(s_panel[k].target===node.name){
                    legend.append("div")
                        .attr("id","tab_2")
                        //.attr("height",50)
                        //.attr("width",500)
                        .style("margin-bottom","2px")
                        .html("<table class ='icon'>"
                            +"<tr>"+"<td class='val' >"+formatNumber(s_panel[k].value)+"</td>"+"<td>"+"  "+"</td>"+
                            "<td class='name'>"+s_panel[k].source+"</td>"+"</tr>"+
                            "</table>");
                }
            }

            for(var i=0; i < s_panel.length;i++){
                //console.log(data[i]);
                //console.log(node.name);
                if(s_panel[i].source===node.name){
                    legend.append("div")
                        .attr("id","tab_2")
                        //.attr("height",50)
                        //.attr("width",500)
                        .style("margin-bottom","2px")
                        .html("<table class ='icon'>"
                            +"<tr>"+"<td class='val'>"+formatNumber(s_panel[i].value)+"</td>"+"<td>"+"  "+"</td>"+
                            "<td class='name'>"+s_panel[i].target+"</td>"+"</tr>"+
                            "</table>");
                }
            }

            legend.append("div")
                .attr("id","tab_3")
                .style("margin-top","10px")
                .html("<table class ='icon'>"+"<tr>"+"<td>"+"Negative values are not included in the visualization."+"</td>"+"</tr>"+"</table>");

            var traverse = [{
                linkType : "sourceLinks",
                nodeType : "target"
            },{
                linkType : "targetLinks",
                nodeType : "source"
            }];

            traverse.forEach(function(step){
                //console.log(step);
                node[step.linkType].forEach(function(link) {
                    remainingNodes.push(link[step.nodeType]);
                    highlight_link(link.id, stroke_opacity);
                    //console.log()
                });

                while (remainingNodes.length) {
                    nextNodes = [];
                    remainingNodes.forEach(function(node) {
                        node[step.linkType].forEach(function(link) {
                            nextNodes.push(link[step.nodeType]);
                            highlight_link(link.id, stroke_opacity);
                        });
                    });
                    remainingNodes = nextNodes;
                }
            });

        }

        function remove_highlight(node,i){

            var remainingNodes=[],
                nextNodes=[];

            var stroke_opacity = 0;
            if( d3.select(this).attr("data-clicked") == "1" ){
                d3.select(this).attr("data-clicked","0");
                stroke_opacity = 0.1;
            }else{
                d3.select(this).attr("data-clicked","1");
                stroke_opacity = 0.3;
            }

            var traverse = [{
                linkType : "sourceLinks",
                nodeType : "target"
            },{
                linkType : "targetLinks",
                nodeType : "source"
            }];

            traverse.forEach(function(step){
                node[step.linkType].forEach(function(link) {
                    remainingNodes.push(link[step.nodeType]);
                    unhighlight_link(link.id, stroke_opacity);
                });

                while (remainingNodes.length) {
                    nextNodes = [];
                    remainingNodes.forEach(function(node) {
                        node[step.linkType].forEach(function(link) {
                            nextNodes.push(link[step.nodeType]);
                            unhighlight_link(link.id, stroke_opacity);
                        });
                    });
                    remainingNodes = nextNodes;
                }
            });
            //legend.transition().duration(700).style("opacity","0");
            //  d3.selectAll(".icon").remove();
            //d3.selectAll(".panel_title").remove();
            //d3.selectAll(".panel_desc").remove();
            d3.selectAll("#tab").remove();
            d3.selectAll("#tab_2").remove();
            d3.selectAll("#tab_3").remove();
            d3.selectAll("#description").remove();
        }

        function highlight_link(id,opacity){
            d3.select("#link-"+id).style("stroke-opacity", .3);
        }

        function unhighlight_link(id,opacity){
            d3.select("#link-"+id).style("stroke-opacity", .1);
        }

      });
    });
  });
});
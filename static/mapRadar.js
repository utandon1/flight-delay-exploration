(function () {

    d3.mapRadar = function () {

      // Map visualization modified from https://bl.ocks.org/sjengle/2e58e83685f6d854aa40c7bc546aeb24

      const urls = {
        // source: https://observablehq.com/@mbostock/u-s-airports-voronoi
        // source: https://github.com/topojson/us-atlas
        map: "https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json",

        // source: https://gist.github.com/mbostock/7608400
        airports:
          "https://gist.githubusercontent.com/utandon1/739481f8561aef91504b7834214d856b/raw/67b3f77de71f840addb898684aeb0beaa1041f9f/airport.csv",

        // source: https://gist.github.com/mbostock/7608400
        flights:
          "https://gist.githubusercontent.com/utandon1/05e2d20b3bbbcb4997cd488960c20e93/raw/f030ce835052003f2fbcb08f86544ee3ea6461bc/weather2.csv"
      };

      const svg  = d3.select("#svg2");

      var hashed_reasons = {}

      const width  = parseInt(svg.attr("width"));
      const height = parseInt(svg.attr("height"));
      const hypotenuse = Math.sqrt(width * width + height * height);

      // must be hard-coded to match our topojson projection
      // source: https://github.com/topojson/us-atlas
      const projection = d3.geoAlbers().scale(1280).translate([480, 300]);

      const scales = {
        // used to scale airport bubbles
        airports: d3.scaleSqrt()
          .range([4, 18]),

        // used to scale number of segments per line
        segments: d3.scaleLinear()
          .domain([0, hypotenuse])
          .range([1, 10])
      };

      // have these already created for easier drawing
      const g = {
        basemap:  svg.select("g#basemap2"),
        flights:  svg.select("g#flights2"),
        airports: svg.select("g#airports2"),
        voronoi:  svg.select("g#voronoi2")
      };

      console.assert(g.basemap.size()  === 1);
      console.assert(g.flights.size()  === 1);
      console.assert(g.airports.size() === 1);
      console.assert(g.voronoi.size()  === 1);

      const tooltip = d3.select("text#tooltip2");
      console.assert(tooltip.size() === 1);

      // load and draw base map
      d3.json(urls.map).then(drawMap);

      // load the airport and flight data together
      const promises = [
        d3.csv(urls.airports, typeAirport),
        d3.csv(urls.flights,  typeFlight)
      ];

      Promise.all(promises).then(processData);

      var savedAirports = [];

      var savedFlights = [];

      var links;

      // process airport and flight data
      function processData(values) {
        console.assert(values.length === 2);

        let airports = values[0];
        let flights  = values[1];

        console.log("airports: " + airports.length);
        console.log(" flights: " + flights.length);

        // convert airports array (pre filter) into map for fast lookup
        let iata = new Map(airports.map(node => [node.iata, node]));

        console.log(iata);

        // calculate incoming and outgoing degree based on flights
        // flights are given by airport iata code (not index)
        flights.forEach(function(link) {
          link.source = iata.get(link.origin);
          link.target = iata.get(link.destination);

          link.source.outgoing += link.count;
          link.target.incoming += link.count;
        });

        // remove airports out of bounds
        let old = airports.length;
        airports = airports.filter(airport => airport.x >= 0 && airport.y >= 0);
        console.log(" removed: " + (old - airports.length) + " airports out of bounds");

        // remove airports with NA state
        old = airports.length;
        airports = airports.filter(airport => airport.state !== "NA");
        console.log(" removed: " + (old - airports.length) + " airports with NA state");

        // remove airports without any flights
        old = airports.length;
        airports = airports.filter(airport => airport.outgoing > 0 && airport.incoming > 0);
        console.log(" removed: " + (old - airports.length) + " airports without flights");

        // sort airports by outgoing degree
        airports.sort((a, b) => d3.descending(a.outgoing, b.outgoing));

        // keep only the top airports
        old = airports.length;
        airports = airports.slice(0, 50);
        console.log(" removed: " + (old - airports.length) + " airports with low outgoing degree");

        console.log(airports)

        codes = airports.map(node => node.iata);

        console.log(codes);

        savedAirports = airports;

        
        // done filtering airports can draw
        drawAirports(airports);
        drawPolygons(airports);

        // reset map to only include airports post-filter
        iata = new Map(airports.map(node => [node.iata, node]));

        // filter out flights that are not between airports we have leftover
        old = flights.length;
        flights = flights.filter(link => iata.has(link.source.iata) && iata.has(link.target.iata));
        console.log(" removed: " + (old - flights.length) + " flights");

        savedFlights = flights;

        console.log(flights);

        // done filtering flights can draw
        drawFlights(airports, flights);

        console.log({airports: airports});
        console.log({flights: flights});


        g.basemap.append('text')
            .text('Flight paths are colored by most common cancellation reason during the selected month.')
            .attr('x', 375)
            .attr('y', 35)
            .attr('font-size', "11px")
            .attr('font-weight', 500)
            .attr('fill', 'grey')
      }

      // draws the underlying map
      function drawMap(map) {
        // remove non-continental states
        map.objects.states.geometries = map.objects.states.geometries.filter(isContinental);

        // run topojson on remaining states and adjust projection
        let land = topojson.merge(map, map.objects.states.geometries);

        // use null projection; data is already projected
        let path = d3.geoPath();

        // draw base map
        g.basemap.append("path")
          .datum(land)
          .attr("class", "land")
          .attr("d", path);

        // draw interior borders
        g.basemap.append("path")
          .datum(topojson.mesh(map, map.objects.states, (a, b) => a !== b))
          .attr("class", "border interior")
          .attr("d", path);

        // draw exterior borders
        g.basemap.append("path")
          .datum(topojson.mesh(map, map.objects.states, (a, b) => a === b))
          .attr("class", "border exterior")
          .attr("d", path);
      }

      function drawAirports(airports) {
        // adjust scale
        const extent = d3.extent(airports, d => d.outgoing);
        scales.airports.domain(extent);

        // draw airport bubbles
        g.airports.selectAll("circle.airport")
          .data(airports, d => d.iata)
          .enter()
          .append("circle")
          .attr("r",  "5px")
          .attr("class", "airport")
          .attr("cx", d => d.x) // calculated on load
          .attr("cy", d => d.y) // calculated on load
          .each(function(d) {
            // adds the circle object to our airport
            // makes it fast to select airports on hover
            d.bubble = this;
          })
          .on("mouseover", function(d) {
            console.log(d.flights);

            links
              .classed("hide", true)

            d3.selectAll(d.flights)
              .classed("highlight", true)
              .classed("hide", false)
              .raise();


            // make tooltip take up space but keep it invisible
            tooltip.style("display", null);
            tooltip.style("visibility", "hidden");

            // set default tooltip positioning
            tooltip.attr("text-anchor", "middle");
            tooltip.attr("dy", -scales.airports(d.outgoing) - 4);
            tooltip.attr("x", d.x);
            tooltip.attr("y", d.y);

            // set the tooltip text
            tooltip.text(d.name + " in " + d.city + ", " + d.state);

            // double check if the anchor needs to be changed
            let bbox = tooltip.node().getBBox();

            if (bbox.x <= 0) {
              tooltip.attr("text-anchor", "start");
            }
            else if (bbox.x + bbox.width >= width) {
              tooltip.attr("text-anchor", "end");
            }

            tooltip.style("visibility", "visible");



          })
          .on("mouseout", function(d) {

            links
              .classed("hide", false)

            d3.selectAll(d.flights)
              .classed("highlight", false);

            d3.select("text#tooltip2").style("visibility", "hidden");
          });
      }

      function drawPolygons(airports) {
        // convert array of airports into geojson format
        const geojson = airports.map(function(airport) {
          return {
            type: "Feature",
            properties: airport,
            geometry: {
              type: "Point",
              coordinates: [airport.longitude, airport.latitude]
            }
          };
        });

        // calculate voronoi polygons
        const polygons = d3.geoVoronoi().polygons(geojson);
        console.log(polygons);

        g.voronoi.selectAll("path")
          .data(polygons.features)
          .enter()
          .append("path")
          .attr("d", d3.geoPath(projection))
          .attr("class", "voronoi")
          .on("mouseover", function(d) {
            let airport = d.properties.site.properties;

            mapOn(airport.iata);

            d3.select(airport.bubble)
              .classed("highlight", true);

            d3.selectAll(airport.flights)
              .classed("highlight", true)
              .raise();

            // make tooltip take up space but keep it invisible
            tooltip.style("display", null);
            tooltip.style("visibility", "hidden");

            // set default tooltip positioning
            tooltip.attr("text-anchor", "middle");
            tooltip.attr("dy", -scales.airports(airport.outgoing) - 4);
            tooltip.attr("x", airport.x);
            tooltip.attr("y", airport.y);

            // set the tooltip text
            tooltip.text(airport.name + " in " + airport.city + ", " + airport.state);

            // double check if the anchor needs to be changed
            let bbox = tooltip.node().getBBox();

            if (bbox.x <= 0) {
              tooltip.attr("text-anchor", "start");
            }
            else if (bbox.x + bbox.width >= width) {
              tooltip.attr("text-anchor", "end");
            }

            tooltip.style("visibility", "visible");
          })
          .on("mouseout", function(d) {
            let airport = d.properties.site.properties;

            mapOff(airport.iata);

            d3.select(airport.bubble)
              .classed("highlight", false);

            d3.selectAll(airport.flights)
              .classed("highlight", false);

            d3.select("text#tooltip2").style("visibility", "hidden");
          })
          .on("dblclick", function(d) {
            // toggle voronoi outline
            let toggle = d3.select(this).classed("highlight");
            d3.select(this).classed("highlight", !toggle);
          });
      }


      

      function drawFlights(airports, flights) {
        // break each flight between airports into multiple segments
        let bundle = generateSegments(airports, flights);

        // https://github.com/d3/d3-shape#curveBundle
        let line = d3.line()
          .curve(d3.curveBundle)
          .x(airport => airport.x)
          .y(airport => airport.y);

        links = g.flights.selectAll("path.flight")
          .data(bundle.paths)
          .enter()
          .append("path")
          .attr("d", line)
          .attr("class", "flight")
          .classed("lred", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let month = 0;
                  let reason = reasons[month];
                  return reason == 0;
                })
          .classed("lblue", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let month = 0;
                  let reason = reasons[month];
                  return reason == 1;
                })
          .classed("lgreen", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let month = 0;
                  let reason = reasons[month];
                  return reason == 2;
                })
           .classed("linv", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let month = 0;
                  let reason = reasons[month];
                  return reason == 3;
                })
           .classed("linv", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let month = 0;
                  let reason = reasons[month];
                  return reason == 4;
                })
           .classed("linv", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let month = 0;
                  let reason = reasons[month];
                  return reason == 10;
                })
          .each(function(d) {
            // adds the path object to our source airport
            // makes it fast to select outgoing paths
            d[0].flights.push(this);
          });

        // https://github.com/d3/d3-force
        let layout = d3.forceSimulation()
          // settle at a layout faster
          .alphaDecay(0.1)
          // nearby nodes attract each other
          .force("charge", d3.forceManyBody()
            .strength(10)
            .distanceMax(scales.airports.range()[1] * 2)
          )
          // edges want to be as short as possible
          // prevents too much stretching
          .force("link", d3.forceLink()
            .strength(0.7)
            .distance(0)
          )
          .on("tick", function(d) {
            links.attr("d", line);
          })
          .on("end", function(d) {
            console.log("layout complete");
          });

        layout.nodes(bundle.nodes).force("link").links(bundle.links);
      }

      // Turns a single edge into several segments that can
      // be used for simple edge bundling.
      function generateSegments(nodes, links) {
        // generate separate graph for edge bundling
        // nodes: all nodes including control nodes
        // links: all individual segments (source to target)
        // paths: all segments combined into single path for drawing
        let bundle = {nodes: [], links: [], paths: []};

        // make existing nodes fixed
        bundle.nodes = nodes.map(function(d, i) {
          d.fx = d.x;
          d.fy = d.y;
          return d;
        });

        links.forEach(function(d, i) {
          // calculate the distance between the source and target
          let length = distance(d.source, d.target);

          // calculate total number of inner nodes for this link
          let total = Math.round(scales.segments(length));

          // create scales from source to target
          let xscale = d3.scaleLinear()
            .domain([0, total + 1]) // source, inner nodes, target
            .range([d.source.x, d.target.x]);

          let yscale = d3.scaleLinear()
            .domain([0, total + 1])
            .range([d.source.y, d.target.y]);

          // initialize source node
          let source = d.source;
          let target = null;

          // add all points to local path
          let local = [source];

          for (let j = 1; j <= total; j++) {
            // calculate target node
            target = {
              x: xscale(j),
              y: yscale(j)
            };

            local.push(target);
            bundle.nodes.push(target);

            bundle.links.push({
              source: source,
              target: target
            });

            source = target;
          }

          local.push(d.target);

          // add last link to target node
          bundle.links.push({
            source: target,
            target: d.target
          });

          bundle.paths.push(local);
        });

        return bundle;
      }

      // determines which states belong to the continental united states
      // https://gist.github.com/mbostock/4090846#file-us-state-names-tsv
      function isContinental(state) {
        const id = parseInt(state.id);
        return id < 60 && id !== 2 && id !== 15;
      }

      // see airports.csv
      // convert gps coordinates to number and init degree
      function typeAirport(airport) {
        airport.longitude = parseFloat(airport.longitude);
        airport.latitude  = parseFloat(airport.latitude);

        // use projection hard-coded to match topojson data
        const coords = projection([airport.longitude, airport.latitude]);
        airport.x = coords[0];
        airport.y = coords[1];

        airport.outgoing = 0;  // eventually tracks number of outgoing flights
        airport.incoming = 0;  // eventually tracks number of incoming flights

        airport.flights = [];  // eventually tracks outgoing flights

        return airport;
      }

      // see flights.csv
      // convert count to number
      function typeFlight(flight) {
        flight.count = parseInt(flight.count);
        flight.reasons = [flight["1"], flight["2"], flight["3"], flight["4"], flight["5"], flight["6"], flight["7"], flight["8"], flight["9"], flight["10"], flight["11"], flight["12"]];

        let key = flight.origin + " " + flight.destination;
        hashed_reasons[key] = [flight["1"], flight["2"], flight["3"], flight["4"], flight["5"], flight["6"], flight["7"], flight["8"], flight["9"], flight["10"], flight["11"], flight["12"]];
        return flight;
      }

      // calculates the distance between two nodes
      // sqrt( (x2 - x1)^2 + (y2 - y1)^2 )
      function distance(source, target) {
        const dx2 = Math.pow(target.x - source.x, 2);
        const dy2 = Math.pow(target.y - source.y, 2);

        return Math.sqrt(dx2 + dy2);
      }

      function mapOn(name) {

      }

      function mapOff(name) {

      }


      


      var margin = {top: 80, right: 80, bottom: 80, left: 80},
       rwidth = Math.min(600, window.innerWidth - 10) - margin.left - margin.right,
        rheight = Math.min(rwidth, window.innerHeight - margin.top - margin.bottom - 20);
          
      ////////////////////////////////////////////////////////////// 
      ////////////////////////// Data ////////////////////////////// 
      ////////////////////////////////////////////////////////////// 

      var data = [
        { name: 'Current Month',
          axes: [
            {axis: 'Weather', value: 42},
            {axis: 'Airline', value: 60},
            {axis: 'Security', value: 10},
            {axis: 'Air System', value: 26},
            {axis: 'Aircraft', value: 52}
          ],
         color: '#762712'
        }
      ];
      ////////////////////////////////////////////////////////////// 
      //////////////////// Draw the Chart ////////////////////////// 
      ////////////////////////////////////////////////////////////// 

      var radarChartOptions = {
        w: rwidth,
        h: rheight,
        margin: margin,
        levels: 5,
        roundStrokes: true,
        color: d3.scaleOrdinal().range(["#26AF32", "#2a2fd4", "#762712"]),
        format: '.0f'
      };

      // Draw the chart, get a reference the created svg element :
      let svg_radar1 = RadarChart(".radarChart", data, radarChartOptions);

      var savedData;


       d3.json('https://gist.githubusercontent.com/utandon1/06b176506c394137b922d5070a25b695/raw/3f7b5669de2d4e2876ace6941aad6cc987f7e384/radar.json')
        .then(function(data){
          saveData = data;

          svg_radar1 = RadarChart(".radarChart", data[0], radarChartOptions);

        })


      function RadarChart(parent_selector, data, options) {
        //Wraps SVG text - Taken from http://bl.ocks.org/mbostock/7555321

        const max = Math.max;
        const sin = Math.sin;
        const cos = Math.cos;
        const HALF_PI = Math.PI / 2;

        const wrap = (text, width) => {
          text.each(function() {
            var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.4, // ems
              y = text.attr("y"),
              x = text.attr("x"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
            }
          });
        }//wrap

        const dotcolors = ["red", "blue", "green"]

        const cfg = {
         w: 600,        //Width of the circle
         h: 600,        //Height of the circle
         margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
         levels: 3,        //How many levels or inner circles should there be drawn
         maxValue: 0,       //What is the value that the biggest circle will represent
         labelFactor: 1.15,   //How much farther than the radius of the outer circle should the labels be placed
         wrapWidth: 80,     //The number of pixels after which a label needs to be given a new line
         opacityArea: 0.35,   //The opacity of the area of the blob
         dotRadius: 6,       //The size of the colored circles of each blog
         opacityCircles: 0.1,   //The opacity of the circles of each blob
         strokeWidth: 2,     //The width of the stroke around each blob
         roundStrokes: false,  //If true the area and stroke will follow a round path (cardinal-closed)
         color: ["#00d5ff", "green", "orange", "red", "pink"],//d3.scaleOrdinal(d3.schemeCategory10),  //Color function,
         format: '.2%',
         unit: '',
         legend: false
        };

        //Put all of the options into a variable called cfg
        if('undefined' !== typeof options){
          for(var i in options){
          if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
          }//for i
        }//if

        //If the supplied maxValue is smaller than the actual one, replace by the max in the data
        // var maxValue = max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
        let maxValue = 0;
        for (let j=0; j < data.length; j++) {
          for (let i = 0; i < data[j].axes.length; i++) {
            data[j].axes[i]['id'] = data[j].name;
            if (data[j].axes[i]['value'] > maxValue) {
              maxValue = data[j].axes[i]['value'];
            }
          }
        }
        maxValue = max(cfg.maxValue, maxValue);

        const allAxis = data[0].axes.map((i, j) => i.axis),  //Names of each axis
          total = allAxis.length,          //The number of different axes
          radius = Math.min(cfg.w/2, cfg.h/2),   //Radius of the outermost circle
          Format = d3.format(cfg.format),         //Formatting
          angleSlice = Math.PI * 2 / total;    //The width in radians of each "slice"

        //Scale for the radius
        const rScale = d3.scaleLinear()
          .range([0, radius])
          .domain([0, maxValue]);

        /////////////////////////////////////////////////////////
        //////////// Create the container SVG and g /////////////
        /////////////////////////////////////////////////////////
        const parent = d3.select(parent_selector);

        //Remove whatever chart with the same id/class was present before
        parent.select("svg").remove();

        //Initiate the radar chart SVG
        let svg = parent.append("svg")
            .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .attr("class", "radar");

        //Append a g element
        let g = svg.append("g")
            .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

        /////////////////////////////////////////////////////////
        ////////// Glow filter for some extra pizzazz ///////////
        /////////////////////////////////////////////////////////

        //Filter for the outside glow
        let filter = g.append('defs').append('filter').attr('id','glow'),
          feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
          feMerge = filter.append('feMerge'),
          feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
          feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

        /////////////////////////////////////////////////////////
        /////////////// Draw the Circular grid //////////////////
        /////////////////////////////////////////////////////////

        //Wrapper for the grid & axes
        let axisGrid = g.append("g").attr("class", "axisWrapper");

        //Draw the background circles
        axisGrid.selectAll(".levels")
           .data(d3.range(1,(cfg.levels+1)).reverse())
           .enter()
          .append("circle")
          .attr("class", "gridCircle")
          .attr("r", d => radius / cfg.levels * d)
          .style("fill", "#CDCDCD")
          .style("stroke", "#CDCDCD")
          .style("fill-opacity", cfg.opacityCircles)
          .style("filter" , "url(#glow)");

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
           .data(d3.range(1,(cfg.levels+1)).reverse())
           .enter().append("text")
           .attr("class", "axisLabel")
           .attr("x", 4)
           .attr("y", d => -d * radius / cfg.levels)
           .attr("dy", "0.4em")
           .style("font-size", "10px")
           .attr("fill", "#737373")
           .text(d => Format(maxValue * d / cfg.levels) + cfg.unit);

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        var axis = axisGrid.selectAll(".axis")
          .data(allAxis)
          .enter()
          .append("g")
          .attr("class", "axis");
        //Append the lines
        axis.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", (d, i) => rScale(maxValue *1.1) * cos(angleSlice * i - HALF_PI))
          .attr("y2", (d, i) => rScale(maxValue* 1.1) * sin(angleSlice * i - HALF_PI))
          .attr("class", "line")
          .style("stroke", "white")
          .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
          .attr("class", "legend")
          .style("font-size", "12px")
          .attr("text-anchor", "middle")
          .attr("fill", (d,i) => dotcolors[i])
          .attr("font-weight", "bold")
          .attr("dy", "0.35em")
          .attr("x", (d,i) => rScale(maxValue * cfg.labelFactor) * cos(angleSlice * i - HALF_PI))
          .attr("y", (d,i) => rScale(maxValue * cfg.labelFactor) * sin(angleSlice * i - HALF_PI))
          .text(d => d)
          .call(wrap, cfg.wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        //The radial line function
        const radarLine = d3.radialLine()
          .curve(d3.curveLinearClosed)
          .radius(d => rScale(d.value))
          .angle((d,i) => i * angleSlice);

        if(cfg.roundStrokes) {
          radarLine.curve(d3.curveCardinalClosed)
        }

        //Create a wrapper for the blobs
        const blobWrapper = g.selectAll(".radarWrapper")
          .data(data)
          .enter().append("g")
          .attr("class", "radarWrapper");

        //Append the backgrounds
        blobWrapper
          .append("path")
          .attr("class", "radarArea")
          .attr("d", d => radarLine(d.axes))
          .style("fill", (d,i) => cfg.color(i))
          .style("fill-opacity", cfg.opacityArea)
          .on('mouseover', function(d, i) {
            //Dim all blobs
            parent.selectAll(".radarArea")
              .transition().duration(200)
              .style("fill-opacity", 0.1);
            //Bring back the hovered over blob
            d3.select(this)
              .transition().duration(200)
              .style("fill-opacity", 0.7);
          })
          .on('mouseout', () => {
            //Bring back all blobs
            parent.selectAll(".radarArea")
              .transition().duration(200)
              .style("fill-opacity", cfg.opacityArea);
          });

        //Create the outlines
        blobWrapper.append("path")
          .attr("class", "radarStroke")
          .attr("d", function(d,i) { return radarLine(d.axes); })
          .style("stroke-width", cfg.strokeWidth + "px")
          .style("stroke", (d,i) => cfg.color(i))
          .style("fill", "none")
          .style("filter" , "url(#glow)");

        //Append the circles
        blobWrapper.selectAll(".radarCircle")
          .data(d => d.axes)
          .enter()
          .append("circle")
          .attr("class", "radarCircle")
          .attr("r", cfg.dotRadius)
          .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice * i - HALF_PI))
          .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice * i - HALF_PI))
          .style("fill", (d,i) => dotcolors[i])
          .style("fill-opacity", 1);

        /////////////////////////////////////////////////////////
        //////// Append invisible circles for tooltip ///////////
        /////////////////////////////////////////////////////////

        //Wrapper for the invisible circles on top
        const blobCircleWrapper = g.selectAll(".radarCircleWrapper")
          .data(data)
          .enter().append("g")
          .attr("class", "radarCircleWrapper");

        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper.selectAll(".radarInvisibleCircle")
          .data(d => d.axes)
          .enter().append("circle")
          .attr("class", "radarInvisibleCircle")
          .attr("r", cfg.dotRadius * 1.5)
          .attr("cx", (d,i) => rScale(d.value) * cos(angleSlice*i - HALF_PI))
          .attr("cy", (d,i) => rScale(d.value) * sin(angleSlice*i - HALF_PI))
          .style("fill", "none")
          .style("pointer-events", "all")
          .on("mouseover", function(d,i) {
            selectMap(i);
            console.log(i);
            tooltip
              .attr('x', this.cx.baseVal.value - 15)
              .attr('y', this.cy.baseVal.value - 15)
              .transition()
              .style('display', 'block')
              .text(Format(d.value) + cfg.unit);
          })
          .on("mouseout", function(){
            deselectMap();
            tooltip.transition()
              .style('display', 'none').text('');
          });

        const tooltip = g.append("text")
          .attr("class", "tooltip")
          .attr('x', 0)
          .attr('y', 0)
          .style("font-size", "12px")
          .style('display', 'none')
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em");

        if (cfg.legend !== false && typeof cfg.legend === "object") {
          let legendZone = svg.append('g');
          let names = data.map(el => el.name);
          if (cfg.legend.title) {
            let title = legendZone.append("text")
              .attr("class", "title")
              .attr('transform', `translate(${cfg.legend.translateX},${cfg.legend.translateY})`)
              .attr("x", cfg.w - 70)
              .attr("y", 10)
              .attr("font-size", "12px")
              .attr("fill", "#404040")
              .text(cfg.legend.title);
          }
          let legend = legendZone.append("g")
            .attr("class", "legend")
            .attr("height", 100)
            .attr("width", 200)
            .attr('transform', `translate(${cfg.legend.translateX},${cfg.legend.translateY + 20})`);
          // Create rectangles markers
          legend.selectAll('rect')
            .data(names)
            .enter()
            .append("rect")
            .attr("x", cfg.w - 65)
            .attr("y", (d,i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", (d,i) => cfg.color(i));
          // Create labels
          legend.selectAll('text')
            .data(names)
            .enter()
            .append("text")
            .attr("x", cfg.w - 52)
            .attr("y", (d,i) => i * 20 + 9)
            .attr("font-size", "11px")
            .attr("fill", "#737373")
            .text(d => d);
        }
        return svg;
      }

      function updateMonth(month) {
        links
          .classed("lred", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let reason = reasons[month];
                  return reason == 0;
                })
          .classed("lblue", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let reason = reasons[month];
                  return reason == 1;
                })
          .classed("lgreen", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let reason = reasons[month];
                  return reason == 2;
                })
           .classed("linv", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let reason = reasons[month];
                  return reason == 3;
                })
           .classed("linv", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let reason = reasons[month];
                  return reason == 4;
                })
           .classed("linv", function(d) {
                  let reasons = hashed_reasons[d[0].iata + " " + d[d.length - 1].iata];
                  let reason = reasons[month];
                  return reason == 10;
                })

         svg_radar1 = RadarChart(".radarChart", saveData[month], radarChartOptions);
      }

      d3.selectAll(".slider")
      .on("change", function(d){

        if (parseInt(this.value) > 8) {
          updateMonth((parseInt(this.value) + 1).toString());
        } else {
          updateMonth(this.value);
        }
        
      })

      function selectMap(index){

        links
            .classed("hide", true)

        links
          .classed("highlight", true)
          .classed("hide", function(d) {
            if (this.classList.contains("lred")) {
              if (index == 0) {
                return false;
              }
            }
            if (this.classList.contains("lblue")) {
              if (index == 1) {
                return false;
              }
            }
            if (this.classList.contains("lgreen")) {
              if (index == 2) {
                return false;
              }
            }
            return true;
          })
      }

      function deselectMap(){
        links
            .classed("hide", false)
      }



    }


})();











(function () {

    d3.overlayBar = function () {


   	var months = {0: "Jan", 1: "Feb", 2: "March", 3: "April", 4: "May", 5: "Jun", 6: "Jul", 7: "Aug", 8: "Sep", 10: "Nov", 11: "Dec"}


        // set the dimensions and margins of the graph
    var margin = {top: 10, right: 20, bottom: 45, left: 52},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(".overlayBar")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("https://gist.githubusercontent.com/utandon1/3ea5d14abf0f24e0a2207f074a7ce58f/raw/9067b43e1de6e1cd60806e1ba9054b5570447f26/weather_comp.csv")
    .then(function(data){

      console.log(data);

      /*
      svg.selectAll(".bar1")
	    .data(data)
	    .enter().append("rect")
	      .attr("class", "bar1")
	      .attr("x", 0)
	      .attr("y", function(d) { return y(d.month) + 10; })
	      .attr("width", function(d) { return x(d.wcancel); })
	      .attr("height", y.bandwidth() - 20);

	 svg.selectAll(".bar2")
	    .data(data)
	    .enter().append("rect")
	      .attr("class", "bar2")
	      .attr("x", 0)
	      .attr("y", function(d) { return y(d.month); })
	      .attr("width", function(d) { return x(d.wdelay); })
	      .attr("height", y.bandwidth());*/


	  // X axis
		var x = d3.scaleBand()
		  .range([ 0, width ])
		  .domain(data.map(function(d) { return months[d.month]; }))
		  .padding(0.2);
		svg.append("g")
		  .attr("transform", "translate(0," + height + ")")
		  .call(d3.axisBottom(x))
		  .selectAll("text")
		    //.attr("transform", "translate(-10,8)rotate(-90)")
		    //.style("text-anchor", "end");

		// Add Y axis
		var y = d3.scaleLinear()
		  .domain([0, 1])
		  .range([ height, 0]);
		svg.append("g")
		  .call(d3.axisLeft(y));


		svg.append("text")
	        .attr("class", "x label")
	        .attr("text-anchor", "end")
	        .attr("x", width/2)
	        .attr("y", height + 32)
	        .attr("font-size", "12px")
	        .text("Month");

	      svg.append("text")
	        .attr("class", "y label")
	        .attr("text-anchor", "end")
	        .attr("y", -48)
	        .attr("x", -height/2 + 65)
	        .attr("dy", ".75em")
	        .attr("transform", "rotate(-90)")
	        .attr("font-size", "12px")
	        .text("Weather Reason Frequency");

		// Bars
		svg.selectAll("mybar")
		  .data(data)
		  .enter()
		  .append("rect")
		    .attr("x", function(d) { return x(months[d.month]); })
		    .attr("y", function(d) { return y(d.wcancel); })
		    .attr("width", x.bandwidth())
		    .attr("height", function(d) { return height - y(d.wcancel); })
		    .attr("fill", "#69b3a2")


		// Bars
		svg.selectAll("mybar2")
		  .data(data)
		  .enter()
		  .append("rect")
		    .attr("x", function(d) { return x(months[d.month]) + 2.5;})
		    .attr("y", function(d) { return y(d.wdelay); })
		    .attr("width", x.bandwidth() - 5)
		    .attr("height", function(d) { return height - y(d.wdelay); })
		    .attr("fill", "steelblue")


		var colors = [ ["Cancelled", "#69b3a2"],
               			["Delayed", "steelblue"] ];

        // create a list of keys
		var keys = ["Cancelled", "Delayed"]

		// Usually you have a color scale in your chart already
		var color = d3.scaleOrdinal()
		  .domain(keys)
		  .range(['#69b3a2', "steelblue"]);

		// Add one dot in the legend for each name.
		var size = 20
		svg.selectAll("mydots")
		  .data(keys)
		  .enter()
		  .append("rect")
		    .attr("x", 450)
		    .attr("y", function(d,i){ return 25 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
		    .attr("width", size)
		    .attr("height", size)
		    .style("fill", function(d){ return color(d)})

		// Add one dot in the legend for each name.
		svg.selectAll("mylabels")
		  .data(keys)
		  .enter()
		  .append("text")
		    .attr("x", 450 + size*1.2)
		    .attr("y", function(d,i){ return 25 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
		    .style("fill", function(d){ return color(d)})
		    .text(function(d){ return d})
		    .attr("text-anchor", "left")
		    .attr("font-size", "12px")
		    .style("alignment-baseline", "middle")







    	})

	}






})();
(function () {

    d3.bubble = function () {


    var airlines = {"UA": "United Airlines", "AA":"American Airlines", "US" : "US Airways", "F9": "Frontier Airlines", "B6" :"JetBlue Airlines", "OO":"Skywest Airlines", "AS":"Alaska Airlines", "NK": "Spirit Airlines", "WN": "Southwest Airlines", "DL" :"Delta Airlines", "EV": "Atlantic Southeast", "HA" : "Hawaiian Airlines","MQ" :"American Eagle", "VX": "Virgin America"};

        // set the dimensions and margins of the graph
    var margin = {top: 10, right: 20, bottom: 45, left: 52},
        width = 1100 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(".bubbleChart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("https://gist.githubusercontent.com/utandon1/7ddf6322b987a5fd12cf20c431acc36e/raw/2b4fe39b95560bc24a04719a8a8260de3c26a45a/airline.csv")
    .then(function(data){

      console.log(data);


      data.sort(function(b, a) {
          return b.delay_freq - a.delay_freq;
      });
      // Add X axis
      var x = d3.scaleBand()
          .range([ 0, width])
          .domain(data.map(function(d) { return d.airline; }))
          .padding(1);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("transform", "translate(-12,8)rotate(-90)")
            .style("text-anchor", "end");

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0.15, 0.45])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));


      svg.append('line')
        .style("stroke", "gray")
        .style("stroke-width", 1)
        .attr("x1", x('DL'))
        .attr("y1", y(0.2173787))
        .attr("x2", x('DL'))
        .attr("y2", y(0.38));


        /*
      const delta = d3.select(".bubbleChart")
          .append('div')
          .attr('class', 'delta')
          .style("left", x('DL') + "px")
          .style("top", y(0.385) + "px")
           .html("<strong> Delta Airlines wins </strong> </br> Lowest delay frequency while serving many flights"); */


      svg.append('rect')
            .attr('width', 287)
            .attr('height', 50)
            .attr('x', x('DL') - 10)
            .attr('y', y(0.42))
            .style('fill', '#fcefe1')
            //.attr('stroke', 'grey')
            .attr('rx', 3)
            .attr('ry', 3)

      svg.append('text')
                .text('1. Delta Airlines')
                .attr('x', x('DL'))
                .attr('y', y(0.402))
                .attr('font-size', "13px")
                .attr('font-weight', 500)
                .attr('fill', 'black')

      svg.append('text')
                .text('Lowest delay frequency while still serving many flights')
                .attr('x', x('DL'))
                .attr('y', y(0.388))
                .attr('font-size', "11px")
                .attr('font-weight', 300)
                .attr('fill', 'grey')

        

      // Add a scale for bubble size
      var z = d3.scaleLinear()
        .domain([10000, 2000000])
        .range([ 6, 80]);

      // Add a scale for bubble color
      var myColor = d3.scaleOrdinal()
        .domain(["DL","HA" , "WN", "F9", "B6", "OO", "AS", "NK", "US" , "EV", "UA","MQ", "VX", "AA"])
        .range(d3.schemeTableau10);


      const div = d3.select(".bubbleChart")
          .append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);


      svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width/2 + 5)
        .attr("y", height + 40)
        .attr("font-size", "12px")
        .text("Airline Code");

      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -51)
        .attr("x", -height/2 + 50)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "12px")
        .text("Delay Frequency");

    

      // Add dots
        
      svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("class", "bubbles")
          .attr("cx", function (d) { return x(d.airline); } )
          .attr("cy", function (d) { return y(d.delay_freq); } )
          .attr("r", function (d) { return z(d.count); } )
          .style("fill", function (d) { return myColor(d.airline); } )
        // -3- Trigger the functions
        .on("mouseover", function(d) {

              div
                .transition()
                .duration(200)
                .style('opacity', 0.9);
              div
                .html("<strong>" + airlines[d.airline] + "</strong>" + '<br/>' + "Total Flights: " + d.count)
                .style('left', d3.event.pageX - 65 + 'px')
                .style('top', d3.event.pageY - 75 + 'px');
        } )
        
        .on("mousemove", function(d, e) {

              div
                .style('left', d3.event.pageX - 65 + 'px')
                .style('top', d3.event.pageY - 75 + 'px');

        }  )
        .on("mouseout", function(d) {
            div
                .transition()
                .duration(500)
                .style('opacity', 0);
        } )

      })






    }






})();
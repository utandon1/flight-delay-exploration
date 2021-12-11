(function () {

    d3.lollipop = function () {



    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

          // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 40, left: 70},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#lollipop1")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    var saveLines;
    var saveCircles;

    var saveData;

    var saveX;
    var saveY;

    var doneCount = 0;

    var top5 = ['ATL']

    // Parse the Data
    d3.csv("https://gist.githubusercontent.com/utandon1/6537b108ac4d6db67472f038257dfc0a/raw/a165c0f01873bf678287d26b165aa3e0a79d4392/lollipop_month.csv")
      .then(function(data){

      // Add X axis
      var x = d3.scaleLinear()
        .domain([0.2, 0.72])
        .range([ 0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");


      svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width/2 - 110)
        .attr("y", height + 40)
        .attr("font-size", "12px")
        .text("Delay Frequency");

      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -58)
        .attr("x", -height/2 + 20)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "12px")
        .text("Month");



      saveX = x;

      // Y axis
      var y = d3.scaleBand()
        .range([ 0, height ])
        .domain(data.map(function(d) { return months[parseInt(d.month)] }))
        .padding(1);
      svg.append("g")
        .call(d3.axisLeft(y))



      svg.append('rect')
            .attr('width', 150)
            .attr('height', 99)
            .attr('x', 280)
            .attr('y', 250)
            .style('fill', '#fcefe1')
            //.attr('stroke', 'grey')
            .attr('rx', 3)
            .attr('ry', 3)

      svg.append('line')
        .style("stroke", "gray")
        .style("stroke-width", 1)
        .attr("x1", 308.69)
        .attr("y1", 250)
        .attr("x2", 308.69)
        .attr("y2", 200 );


      svg.append('text')
            .text('Peak Month')
            .attr('x', 290)
            .attr('y', 270)
            .attr('font-size', "13px")
            .attr('font-weight', 500)
            .attr('fill', 'black')

      svg.append('text')
            .text('Likely caused by summer')
            .attr('x', 290)
            .attr('y', 285)
            .attr('font-size', "11px")
            .attr('font-weight', 300)
            .attr('fill', 'grey')

      svg.append('text')
            .text('travel. Other months follow')
            .attr('x', 290)
            .attr('y', 298)
            .attr('font-size', "11px")
            .attr('font-weight', 300)
            .attr('fill', 'grey')


      svg.append('text')
            .text('a seasonal wave pattern.')
            .attr('x', 290)
            .attr('y', 311)
            .attr('font-size', "11px")
            .attr('font-weight', 300)
            .attr('fill', 'grey')

      svg.append('text')
            .text('Likely weather and holiday')
            .attr('x', 290)
            .attr('y', 324)
            .attr('font-size', "11px")
            .attr('font-weight', 300)
            .attr('fill', 'grey')

      svg.append('text')
            .text('related.')
            .attr('x', 290)
            .attr('y', 337)
            .attr('font-size', "11px")
            .attr('font-weight', 300)
            .attr('fill', 'grey')

      saveY = y;

      saveData = data;


      // Lines
      svg.selectAll("myline")
        .data(data)
        .enter()
        .append("line")
          .attr("x1", function(d) { return x(d.delay_freq); })
          .attr("x2", x(0.2))
          .attr("y1", function(d) { return y(months[parseInt(d.month)]); })
          .attr("y2", function(d) { return y(months[parseInt(d.month)]); })
          .attr("stroke", "grey")

      // Circles
      svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
          .classed("lolli_c", true)
          .attr("cx", function(d) { return x(d.delay_freq); })
          .attr("cy", function(d) { return y(months[parseInt(d.month)]); })
          .attr("r", "6")
          .style("fill", "orange")
          .attr("stroke", "black")
          .on("click", function(d) {
            /*
            if(toRemove){
                d3.select(toRemove).attr("r", 6);
            }
            toRemove = this;
            d3.select(this).attr("r",7);*/
            updateLollipop(parseInt(d.month));
          });

       incrementCount();

      })

    margin = {top: 10, right: 30, bottom: 90, left: 46}
    width = 800 - margin.left - margin.right
    height = 500 - margin.top - margin.bottom

     // append the svg object to the body of the page
    var svg2 = d3.select("#lollipop2")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    var circles;
    var lines;
    var x;

    var returned_data;


    d3.json('https://gist.githubusercontent.com/utandon1/db6f4e42417a88160365ca5975c6b73e/raw/13fed514b912fff02e66fb1c5db7d86f23b6b902/lollipop_airport.json')
    .then(function(data){

        returned_data = data;


        data = data["0"];

        // sort data
        data.sort(function(b, a) {
          return a.delayperc - b.delayperc;
        });

        // X axis
        var x = d3.scaleBand()
          .range([ 0, width])
          .domain(data.map(function(d) { return d.airport; }))
          .padding(1);
        svg2.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("transform", "translate(-12,8)rotate(-90)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
          .domain([0, 0.75])
          .range([ height, 0]);
        svg2.append("g")
          .call(d3.axisLeft(y));


        svg2.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "end")
          .attr("x", width/2)
          .attr("y", height + 40)
          .attr("font-size", "12px")
          .text("Airport");

        svg2.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "end")
          .attr("y", -58)
          .attr("x", -height/2 + 20)
          .attr("dy", ".75em")
          .attr("transform", "rotate(-90)")
          .attr("font-size", "12px")
          .text("Delay Frequency");

        // Lines
        var lines = svg2.selectAll("myline")
          .data(data)
          .enter()
          .append("line")
            .attr("x1", function(d) { return x(d.airport); })
            .attr("x2", function(d) { return x(d.airport); })
            .attr("y1", function(d) { return y(d.delayperc); })
            .attr("y2", y(0))
            .attr("stroke", "grey")

        // Circles
        var circles = svg2.selectAll("mycircle")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.airport); })
            .attr("cy", function(d) { return y(d.delayperc); })
            .attr("r", "5")
            .style("fill", "#69b3a2")
            .attr("stroke", "black")

        incrementCount()
       
      })


      function updateLollipop(month) {

        svg2.selectAll("*").remove();

        data = returned_data[month];



        // Lines


        svg.selectAll(".lolli").remove();
        svg.selectAll(".lolli_c").remove();



        // Lines
        svg.selectAll("myline")
          .data(saveData)
          .enter()
          .append("line")
            .classed("lolli", true)
            .attr("x1", function(d) { return saveX(d.delay_freq); })
            .attr("x2", saveX(0.2))
            .attr("y1", function(d) { return saveY(months[parseInt(d.month)]); })
            .attr("y2", function(d) { return saveY(months[parseInt(d.month)]); })
            .attr("stroke", function (d) {
                if (parseInt(d.month) == month) {
                  return "#7c6eff";
                } else {
                  return "grey";
                }
            })
            .attr("stroke-width", function (d) {
                if (parseInt(d.month) == month) {
                  return "3";
                } else {
                  return "1";
                }
            })

        // Circles
        svg.selectAll("mycircle")
          .data(saveData)
          .enter()
          .append("circle")
            .classed("lolli_c", true)
            .attr("cx", function(d) { return saveX(d.delay_freq); })
            .attr("cy", function(d) { return saveY(months[parseInt(d.month)]); })
            .attr("r", function (d) {
                if (parseInt(d.month) == month) {
                  return "9";
                } else {
                  return "6";
                }
            })
            .style("fill", function (d) {
                if (parseInt(d.month) == month) {
                  return "#7c6eff";
                } else {
                  return "orange";
                }
            })
            .attr("stroke", function (d) {
                if (parseInt(d.month) == month) {
                  return "black";
                } else {
                  return "black";
                }
            })
            .attr("stroke-width", function (d) {
                if (parseInt(d.month) == month) {
                  return "1";
                } else {
                  return "1";
                }
            })
            .on("click", function(d) {
              /*
              if(toRemove){
                  d3.select(toRemove).attr("r", 6);
              }
              toRemove = this;
              d3.select(this).attr("r",7);*/
              updateLollipop(parseInt(d.month));
            });



        // sort data
        data.sort(function(b, a) {
          return a.delayperc - b.delayperc;
        });

        var x = d3.scaleBand()
          .range([ 0, width])
          .domain(data.map(function(d) { return d.airport; }))
          .padding(1);
        svg2.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
            .attr("transform", "translate(-12,8)rotate(-90)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
          .domain([0, 0.75])
          .range([ height, 0]);
        svg2.append("g")
          .call(d3.axisLeft(y));

        svg2.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "end")
          .attr("x", width/2)
          .attr("y", height + 45)
          .attr("font-size", "12px")
          .text("Airport");

        svg2.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "end")
          .attr("y", -46)
          .attr("x", -height/2 + 40)
          .attr("dy", ".75em")
          .attr("transform", "rotate(-90)")
          .attr("font-size", "12px")
          .text("Delay Frequency");

        svg2.append('rect')
            .attr('width', 375)
            .attr('height', 70)
            .attr('x', 345)
            .attr('y', y(0.73))
            .style('fill', '#fcefe1')
            //.attr('stroke', 'grey')
            .attr('rx', 3)
            .attr('ry', 3)

        svg2.append('line')
          .style("stroke", "gray")
          .style("stroke-width", 1)
          .attr("x1", 345)
          .attr("y1", y(0.73)+70)
          .attr("x2", x('DAL'))
          .attr("y2", y(data.find(a => a.airport === "DAL").delayperc));

        svg2.append('line')
          .style("stroke", "gray")
          .style("stroke-width", 1)
          .attr("x1", 345)
          .attr("y1", y(0.73)+70)
          .attr("x2", x('ATL'))
          .attr("y2", y(data.find(a => a.airport === "ATL").delayperc));



        svg2.append('text')
              .text('DAL and ATL')
              .attr('x', 355)
              .attr('y', y(0.73) + 20)
              .attr('font-size', "13px")
              .attr('font-weight', 500)
              .attr('fill', 'black')

        svg2.append('text')
              .text('Dallas Love Field Airport (RED) is consistently in the top two most')
              .attr('x', 355)
              .attr('y', y(0.73) + 35)
              .attr('font-size', "11px")
              .attr('font-weight', 300)
              .attr('fill', 'grey')

         svg2.append('text')
              .text('frequently delayed airports for 6 months of the year. Atlanta International')
              .attr('x', 355)
              .attr('y', y(0.73) + 48)
              .attr('font-size', "11px")
              .attr('font-weight', 300)
              .attr('fill', 'grey')

         svg2.append('text')
              .text('(BLUE) is one of the busiest airports yet consistently has few delays.')
              .attr('x', 355)
              .attr('y', y(0.73) + 61)
              .attr('font-size', "11px")
              .attr('font-weight', 300)
              .attr('fill', 'grey')



        /*
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
                  .attr('fill', 'grey')*/

        // Lines
        var lines = svg2.selectAll("myline")
          .data(data)
          .enter()
          .append("line")
            .attr("x1", function(d) { return x(d.airport); })
            .attr("x2", function(d) { return x(d.airport); })
            .attr("y1", function(d) { return y(d.delayperc); })
            .attr("y2", y(0))
            .attr("stroke", function(d) {
              if (d.airport === "DAL") {
                return "red";
              } else if (top5.includes(d.airport)) {
                return "#008cff";
              } else {
                return "grey"
              }

            })
            .attr("stroke-width", function(d) {
              if (d.airport === "DAL") {
                return "3px";
              } else if (top5.includes(d.airport)) {
                return "3px";
              } else {
                return "1px"
              }

            });

        // Circles
        var circles = svg2.selectAll("mycircle")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.airport); })
            .attr("cy", function(d) { return y(d.delayperc); })
            .attr("r", "5")
            .style("fill", "#69b3a2")
            .attr("stroke", "black")

      }

      function incrementCount(){
        doneCount += 1
        if (doneCount == 2) {
          updateLollipop(5);
        }
      }


    }

    


})();










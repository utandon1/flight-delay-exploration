var url1 = "https://gist.githubusercontent.com/utandon1/ac15ad30921fbbbd5e87364a7e44d549/raw/4650b9836161e9e65487ef1f36b5d4370aa27012/chord.json";
var url2 = "https://gist.githubusercontent.com/utandon1/4561efa231005098a20f2fb25480bea0/raw/10692bb8d559ff8473f86013fc719be22d2b33cb/chord_new.json";
d3.json(url1)
  .then(function(data){
    var matrix = data.matrix;
    console.log(matrix);

    tag = "#chordDiv"
    
    var margin = {left:0, top:0, right:0, bottom:0},
      width =  600 - margin.left - margin.right, // more flexibility: Math.min(window.innerWidth, 1000)
      height =  600 - margin.top - margin.bottom, // same: Math.min(window.innerWidth, 1000)
      innerRadius = Math.min(width, height) * .43,
      outerRadius = innerRadius * 1.15;

      var names = ['ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'PHX', 'IAH', 'LAS', 'DTW', 'SFO', 'SLC', 'EWR', 'MCO', 'MSP', 'CLT', 'LGA', 'JFK', 'BOS', 'SEA', 'BWI', 'PHL', 'SAN', 'CVG', 'MDW', 'DCA', 'MEM', 'TPA', 'IAD', 'FLL', 'CLE', 'STL', 'MIA', 'OAK', 'RDU', 'MCI', 'PDX', 'BNA', 'SJC', 'HOU', 'DAL', 'SMF', 'AUS', 'SNA', 'SAT', 'IND', 'MKE', 'PIT', 'ABQ', 'MSY', 'ONT']

      colors = ["red", "#083E77", "#342350", "#567235", "#8B161C", "#DF7C00"]

      opacityDefault = 0.8;
    
    ////////////////////////////////////////////////////////////
    /////////// Create scale and layout functions //////////////
    ////////////////////////////////////////////////////////////

    var colors = d3.scaleOrdinal()
          .domain(d3.range(names.length))
        .range(colors);

      var chord = d3.chord()
        .padAngle(.01)
        .sortChords(d3.descending)

        var arc = d3.arc()
        .innerRadius(innerRadius*1.01)
        .outerRadius(outerRadius);

      var path = d3.ribbon()
      .radius(innerRadius);

    ////////////////////////////////////////////////////////////
    ////////////////////// Create SVG //////////////////////////
    ////////////////////////////////////////////////////////////


    var svg = d3.select(tag);

    svg.selectAll("*").remove();
    
    svg = d3.select(tag).append("svg")
      .attr("width", width) //+ margin.left + margin.right)
      .attr("height", height) //+ margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
      .datum(chord(matrix));

    ////////////////////////////////////////////////////////////
    ////////////////// Draw outer Arcs /////////////////////////
    ////////////////////////////////////////////////////////////

    var outerArcs = svg.selectAll("g.group")
      .data(function(chords) { return chords.groups; })
      .enter().append("g")
      .attr("class", "group")
      .on("mouseover", fade(.1))
      .on("mouseout", fade(opacityDefault))

      // text popups
      .on("click", mouseoverChord)
      .on("mouseout", mouseoutChord);


    ////////////////////////////////////////////////////////////
    ////////////////////// Append names ////////////////////////
    ////////////////////////////////////////////////////////////

    //Append the label names INSIDE outside
    outerArcs.append("path")
      .style("fill", function(d) { return colors(d.index); })
      .attr("id", function(d, i) { return "group" + d.index; })
      .attr("d", arc);
      /*
     outerArcs.append("text")
            .style("font-size", "7px")
            .attr("href", function(d) { return "#group" + d.index;})
            .text(function(chords, i){return names[i];})
            .style("fill", "white");*/

     outerArcs.append("svg:text")
      .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
        + "translate(" + (innerRadius + 12) + ")"
        + (d.angle > Math.PI ? "rotate(180)" : "");
      })
      .text(function(d,i) { return names[i]; })
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "white");


    ////////////////////////////////////////////////////////////
    ////////////////// Draw inner chords ///////////////////////
    ////////////////////////////////////////////////////////////

    svg.selectAll("path.chord")
      .data(function(chords) { return chords; })
      .enter().append("path")
      .attr("class", "chord")
      .style("fill", function(d) { return colors(d.source.index); })
      .style("opacity", opacityDefault)
      .attr("d", path);


    ////////////////////////////////////////////////////////////
    ////////////////// Extra Functions /////////////////////////
    ////////////////////////////////////////////////////////////

    function popup() {
      return function(d,i) {
        console.log("love");
      };
    }//popup

    //Returns an event handler for fading a given chord group.
    function fade(opacity) {
      return function(d,i) {
        svg.selectAll("path.chord")
            .filter(function(d) { if (d.source.index != i && d.target.index != i) {
                                     return true;
                                  } else {
                                    testfunc(names[i]);
                                    return false;
                                  }
                                })
        .transition()
            .style("opacity", opacity);
      };
    }//fade

      //Highlight hovered over chord
    function mouseoverChord(d,i) {

      //Decrease opacity to all
      svg.selectAll("path.chord")
        .transition()
        .style("opacity", 0.1);
      //Show hovered over chord with full opacity
      d3.select(this)
        .transition()
            .style("opacity", 1);

      /*
      //Define and show the tooltip over the mouse location
      $(this).popover({
        //placement: 'auto top',
        title: 'test',
        placement: 'right',
        container: 'body',
        animation: false,
        offset: "20px -100px",
        followMouse: true,
        trigger: 'click',
        html : true,
        content: function() {
          return "<p style='font-size: 11px; text-align: center;'><span style='font-weight:900'>"  +
               "</span> text <span style='font-weight:900'>"  +
               "</span> folgt hier <span style='font-weight:900'>" + "</span> movies </p>"; }
      });
      $(this).popover('show');*/
    }
    //Bring all chords back to default opacity
    function mouseoutChord(d) {
      //Hide the tooltip
      /*
      $('.popover').each(function() {
        $(this).remove();
      })*/
      //Set opacity back to default for all
      svg.selectAll("path.chord")
        .transition()
        .style("opacity", opacityDefault);
      }      //function mouseoutChord
  });

var curSelect = ""
function testfunc(name) {
  if (curSelect !== name) {
    curSelect = name;
    console.log(curSelect);
  }

}



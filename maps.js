
var year=0;

map(year);

function map(year){
var width = 962,
rotated = 90,
height = 502;
console.log(year)
var initX;

//track scale only rotate when s === 1
var s = 1;
var mouseClicked = false;
var rotated = 90;
//need to store this because on zoom end, using mousewheel, mouse position is NAN
var mouse;
var projection =d3.geoMercator();
var path = d3.geoPath()
.projection(projection);

var zoom = d3.zoom()
 .scaleExtent([1, 20])
 .on("zoom", zoomed)
 .on("end", zoomended);

var svg = d3.select(".mapbody").append("svg")
.attr("width", width)
.attr("height", height)
.attr("id","mapsvg")
  //track where user clicked down
  .on("wheel", function() {
  //zoomend needs mouse coords
  initX = d3.mouse(this)[0];
  })
  .on("mousedown", function() {
  //only if scale === 1
  if(s !== 1) return;
  initX = d3.mouse(this)[0];
  mouseClicked = true;
  });

//need this for correct panning
var g = svg.append("g");

//for tooltip 
var offsetL = document.getElementById('map').offsetLeft+10;
console.log(offsetL)
var offsetT = document.getElementById('map').offsetTop+10;
console.log(offsetT)



var tooltip = d3.select("#map")
 .append("div")
 .attr("class", "tooltip hidden");

//load and display the world 
d3.json("https://enjalot.github.io/wwsd/data/world/world-110m.geojson",function(error,world){
  if(error) return console.error(error);
  g.append("g")
    .attr("class","area")
    .selectAll("g.boundary")
    .data(world.features)
    .enter()
    .append("path")
    .attr("name", function(d) {return d.properties.name;console.log(d.properties.name);})
    .attr("id", function(d) { return d.id;})
    .on('click', selected)
    .on("mousemove", showTooltip)
    .on("mouseout",  function(d,i) {
      tooltip.classed("hidden", true);
   })
  .attr("d", path);
});



function showTooltip(d) {
label = d.properties.name;
console.log(label);
var mouse = d3.mouse(svg.node())
.map( function(d) { return parseInt(d); } );
tooltip.classed("hidden", false)
.attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
.html(label);
}

function selected(d) {
console.log(d.properties.name);
var countryName=d.properties.name;
d3.select('.selected').classed('selected', false);
d3.select(this).classed('selected', true);
d3.select("#linesvg").remove();
d3.select("#linechartemp").remove();
createLinechart(countryName);
createLinechartEmp(countryName);
avgcount(countryName);
}
function avgcount(countryName){
  d3.csv("averageCount.csv",function(error,data){
    var countryNametoString=JSON.stringify(countryName);
    var modifiedCountryName=countryNametoString.slice(1,-1); 
    var data=data.filter(function(d){return(d.country == modifiedCountryName) & (d !="averagewomenPerChildren")
     &(d !="indicatoroffirstMarriage");});

     var country=data.map(function(d){
      return d.country;
    });
      
     var babyPerWomen =data.map(function(d){
       return d.averagewomenPerChildren;
     });
     var indicatorOfFirstMarriage =data.map(function(d){
      return d.indicatoroffirstMarriage;
    });
    console.log(country);
    console.log(babyPerWomen);
    console.log(indicatorOfFirstMarriage);
    document.getElementById("stage").innerHTML =country+" (1995-2015)" ;
    document.getElementById("womenperchildren").innerHTML =babyPerWomen ;
    document.getElementById("firstMarriage").innerHTML =indicatorOfFirstMarriage ;	
  })
  d3.csv("avgsexcount.csv",function(error,data){
    var countryNametoString=JSON.stringify(countryName);
    var modifiedCountryName=countryNametoString.slice(1,-1); 
    var data=data.filter(function(d){return(d.country == modifiedCountryName) & (d !="male")
     &(d !="female");});

     var male=data.map(function(d){
      return d.male;
    });
      
     var female =data.map(function(d){
       return d.female;
     });

    console.log(male);
    console.log(female);
  
    document.getElementById("male_count").innerHTML =male ;
    document.getElementById("female_count").innerHTML =female ;	
  })
  d3.csv("averageEducation.csv",function(error,data){
    var countryNametoString=JSON.stringify(countryName);
    var modifiedCountryName=countryNametoString.slice(1,-1); 
    var data=data.filter(function(d){return(d.country == modifiedCountryName) & (d !="average")});

     var average=data.map(function(d){
      return d.average;
    });
      

    console.log(average);
  
    document.getElementById("average").innerHTML =average+"%" ;
  })
}
function zoomended(){
  if(s !== 1) return;
  //rotated = rotated + ((d3.mouse(this)[0] - initX) * 360 / (s * width));
  rotated = rotated + ((mouse[0] - initX) * 360 / (s * width));
  mouseClicked = false;
}  


function zoomed() {
var t = [d3.event.transform.x,d3.event.transform.y];
s = d3.event.transform.k;
var h = 0;

t[0] = Math.min(
(width/height)  * (s - 1), 
Math.max( width * (1 - s), t[0] )
);

t[1] = Math.min(
h * (s - 1) + h * s, 
Math.max(height  * (1 - s) - h * s, t[1])
);

 svg.append("g").attr("transform", "translate(2,2)");

//adjust the stroke width based on zoom level
d3.selectAll(".boundary")
.style("stroke-width", 1 / s);
mouse = d3.mouse(this); 
  
  if(s === 1 && mouseClicked) {
    //rotateMap(d3.mouse(this)[0]);
    rotateMap(mouse[0]);
    return;
  }
}
// // Adding labels to map
// d3.json("sample.json", function(error, places) {
// svg.selectAll("circle")
//   	.data(places.features)
//   .enter().append("circle")
//   	.attr('r',5)
//     .attr('cx',function(d) { return projection(d.geometry.coordinates)[0]})
//     .attr('cy',function(d) { return projection(d.geometry.coordinates)[1]})
//     .on("mouseover",function(d) {
//     	console.log("just had a mouseover", d3.select(d));
//     	d3.select(this)
//       	.classed("active",true)
//   	})
//   	.on("mouseout",function(d){
//     	d3.select(this)
//       	.classed("active",false)
//     })
//   })

d3.tsv("test.tsv", function(error, data) {
    var city = svg.selectAll(".city")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "city")
    .attr("transform", function(d) { return "translate(" + projection([d.lon, d.lat]) + ")"; });
    city.append("circle")
    .attr("r", 3)
    .style("color","red")
    .style("opacity", 0.75);
  });

}
    
function createLinechart(countryName)
{
  var countryNametoString=JSON.stringify(countryName);
  var modifiedCountryName=countryNametoString.slice(1,-1);

  var currentCountry = data.filter(obj => { return obj.name == modifiedCountryName})[0]
 
  console.log(currentCountry.Data);

  var width = 600;
  var height = 200;
  var margin = 20;
  var duration = 250;
  
  var lineOpacity = "0.25";
  var lineOpacityHover = "0.85";
  var otherLinesOpacityHover = "0.1";
  var lineStroke = "1.5px";
  var lineStrokeHover = "2.5px";
  
  var circleOpacity = '0.85';
  var circleOpacityOnLineHover = "0.25"
  var circleRadius = 3;
  var circleRadiusHover = 6;

  var parseDate = d3.timeParse("%Y");
  currentCountry.Data.forEach(function(d) { 
    d.Data.forEach(function(d) {
      d.year = parseDate(d.year);
      console.log(d.year)
      d.percent = +d.percent; 
      console.log(d.percent) 

    });
  });

    /* Scale */
    var xScale = d3.scaleTime()
    .domain(d3.extent(currentCountry.Data[0].Data, d => d.year))
    .range([0, width-margin]);
  
  var yScale = d3.scaleLinear()
    .domain([0,47])
    .range([height-margin, 0]);
  
  var color = d3.scaleOrdinal(d3.schemeCategory10);

    /* Add SVG */
    var svg = d3.select("#linechart").append("svg")
    .attr("id","linesvg")
    .attr("width", (width+margin)+"px")
    .attr("height", (height+margin)+"px")
    .append('g')
    .attr("transform", `translate(${margin}, ${margin})`);

      /* Add line into SVG */
  var lineGen = d3.line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.percent));



  let lines = svg.append('g')
    .attr('class', 'lines');
  
  lines.selectAll('.line-group')
    .data(currentCountry.Data).enter()
    .append('g')
    .attr('class', 'line-group')  
    .on("mouseover", function(d, i) {
        svg.append("text")
          .attr("class", "title-text")
          .style("fill", color(i))        
          .text(d.gender)
          .attr("text-anchor", "middle")
          .attr("x", (width-margin)/2)
          .attr("y", 5);
      })
    .on("mouseout", function(d) {
        svg.select(".title-text").remove();
      })
    .append('path')
    .attr('class', 'line')  
    .attr('d', d => lineGen(d.Data))
    .style('stroke', (d, i) => color(i))
    .style('opacity', lineOpacity)
    .on("mouseover", function(d) {
        d3.selectAll('.line')
                      .style('opacity', otherLinesOpacityHover);
        d3.selectAll('.circle')
                      .style('opacity', circleOpacityOnLineHover);
        d3.select(this)
          .style('opacity', lineOpacityHover)
          .style("stroke-width", lineStrokeHover)
          .style("cursor", "pointer");
      })
    .on("mouseout", function(d) {
        d3.selectAll(".line")
                      .style('opacity', lineOpacity);
        d3.selectAll('.circle')
                      .style('opacity', circleOpacity);
        d3.select(this)
          .style("stroke-width", lineStroke)
          .style("cursor", "none");
      });

  /* Add circles in the line */
  lines.selectAll("circle-group")
  .data(currentCountry.Data).enter()
  .append("g")
  .style("fill", (d, i) => color(i))
  .selectAll("circle")
  .data(d => d.Data).enter()
  .append("g")
  .attr("class", "circle")  
  .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(`${d.percent}`)
        .attr("x", d => xScale(d.year) + 5)
        .attr("y", d => yScale(d.percent) - 10);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .transition()
        .duration(duration)
        .selectAll(".text").remove();
    })
  .append("circle")
  .attr("cx", d => xScale(d.year))
  .attr("cy", d => yScale(d.percent))
  .attr("r", circleRadius)
  .style('opacity', circleOpacity)
  .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadiusHover);
      })
    .on("mouseout", function(d) {
        d3.select(this) 
          .transition()
          .duration(duration)
          .attr("r", circleRadius);  
      });
        /* Add Axis into SVG */
  var xAxis = d3.axisBottom(xScale).ticks(5);
  var yAxis = d3.axisLeft(yScale).ticks(5);
  
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height-margin})`)
    .call(xAxis);
  
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append('text')
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")
    .text("Total values");

}

function createLinechartEmp(countryName)
{
  var countryNametoString=JSON.stringify(countryName);
  var modifiedCountryName=countryNametoString.slice(1,-1);

  var currentCountry = datavariable.filter(obj => { return obj.name == modifiedCountryName})[0]
 
  console.log(currentCountry.Data);
  var width = 600;
  var height = 200;
  var margin = 50;
  var duration = 250;
  
  var lineOpacity = "0.25";
  var lineOpacityHover = "0.85";
  var otherLinesOpacityHover = "0.1";
  var lineStroke = "1.5px";
  var lineStrokeHover = "2.5px";
  
  var circleOpacity = '0.85';
  var circleOpacityOnLineHover = "0.25"
  var circleRadius = 3;
  var circleRadiusHover = 6;

  var parseDate = d3.timeParse("%Y");
  currentCountry.Data.forEach(function(d) { 
    d.Data.forEach(function(d) {
      d.year = parseDate(d.year);
      console.log(d.year)
      d.percent = +d.percent; 
      console.log(d.percent) 

    });
  });

    /* Scale */
    var xScale = d3.scaleTime()
    .domain(d3.extent(currentCountry.Data[0].Data, d => d.year))
    .range([0, width-margin]);
  
  var yScale = d3.scaleLinear()
    .domain([0, d3.max(currentCountry.Data[0].Data, d => d.percent)])
    .range([height-margin, 0]);
  
  var color = d3.scaleOrdinal(d3.schemeCategory10);

    /* Add SVG */
    var svg = d3.select("#chart").append("svg")
    .attr("id","linechartemp")
    .attr("width", (width+margin)+"px")
    .attr("height", (height+margin)+"px")
    .append('g')
    .attr("transform", `translate(${margin}, ${margin})`);

      /* Add line into SVG */
  var lineGen = d3.line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.percent));



  let lines = svg.append('g')
    .attr('class', 'lines');
  
  lines.selectAll('.line-group')
    .data(currentCountry.Data).enter()
    .append('g')
    .attr('class', 'line-group')  
    .on("mouseover", function(d, i) {
        svg.append("text")
          .attr("class", "title-text")
          .style("fill", color(i))        
          .text(d.gender)
          .attr("text-anchor", "middle")
          .attr("x", (width-margin)/2)
          .attr("y", 5);
      })
    .on("mouseout", function(d) {
        svg.select(".title-text").remove();
      })
    .append('path')
    .attr('class', 'line')  
    .attr('d', d => lineGen(d.Data))
    .style('stroke', (d, i) => color(i))
    .style('opacity', lineOpacity)
    .on("mouseover", function(d) {
        d3.selectAll('.line')
                      .style('opacity', otherLinesOpacityHover);
        d3.selectAll('.circle')
                      .style('opacity', circleOpacityOnLineHover);
        d3.select(this)
          .style('opacity', lineOpacityHover)
          .style("stroke-width", lineStrokeHover)
          .style("cursor", "pointer");
      })
    .on("mouseout", function(d) {
        d3.selectAll(".line")
                      .style('opacity', lineOpacity);
        d3.selectAll('.circle')
                      .style('opacity', circleOpacity);
        d3.select(this)
          .style("stroke-width", lineStroke)
          .style("cursor", "none");
      });

  /* Add circles in the line */
  lines.selectAll("circle-group")
  .data(currentCountry.Data).enter()
  .append("g")
  .style("fill", (d, i) => color(i))
  .selectAll("circle")
  .data(d => d.Data).enter()
  .append("g")
  .attr("class", "circle")  
  .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(`${d.percent}`)
        .attr("x", d => xScale(d.year) + 5)
        .attr("y", d => yScale(d.percent) - 10);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .transition()
        .duration(duration)
        .selectAll(".text").remove();
    })
  .append("circle")
  .attr("cx", d => xScale(d.year))
  .attr("cy", d => yScale(d.percent))
  .attr("r", circleRadius)
  .style('opacity', circleOpacity)
  .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadiusHover);
      })
    .on("mouseout", function(d) {
        d3.select(this) 
          .transition()
          .duration(duration)
          .attr("r", circleRadius);  
      });
        /* Add Axis into SVG */
  var xAxis = d3.axisBottom(xScale).ticks(5);
  var yAxis = d3.axisLeft(yScale).ticks(5);
  
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height-margin})`)
    .call(xAxis);

  
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append('text')
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")
    .text("Total values");


}





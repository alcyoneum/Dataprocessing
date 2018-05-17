/* linkv.js
*
*  Dataprocessing, week 5
*  Shan Shan Huang (10768793)
*
*  D3 Linked views
*  Shows a map of Europe with countries and its life satisfaction score or
*  life expectancy in years. When clicked on a country, it updates the bar chart
*  with indicators such as employment rate, educational attainment,
*  and self reported health.
*/

window.onload = function() {
    getData();
}

/** Retrieve data through API. */
function getData() {

    let lifeSat = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.SW_LIFS.L.TOT/all?&dimensionAtObservation=allDimensions";
    let empRate = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.JE_EMPL.L.TOT/all?&dimensionAtObservation=allDimensions";
    let eduAtt = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.ES_EDUA.L.TOT/all?&dimensionAtObservation=allDimensions";
    let selfHealth = "http://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.HS_SFRH.L.TOT/all?&dimensionAtObservation=allDimensions";
    let lifeExp = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.HS_LEB.L.TOT/all?&dimensionAtObservation=allDimensions";

    // parse data when GET request fulfilled
    d3.queue()
      .defer(d3.request, lifeSat)
      .defer(d3.request, empRate)
      .defer(d3.request, eduAtt)
      .defer(d3.request, selfHealth)
      .defer(d3.request, lifeExp)
      .awaitAll(parseData);
}

var countries = [];
var indicatorData = {};


/** Parses data. */
function parseData(error, response) {

    if (error) throw error;

    var lifeSatData = JSON.parse(response[0].responseText);
    var empRateData = JSON.parse(response[1].responseText);
    var eduAttData = JSON.parse(response[2].responseText);
    var selfHealthData = JSON.parse(response[3].responseText);
    var lifeExpData = JSON.parse(response[4].responseText);

    var nData = Object.keys(lifeSatData.dataSets[0].observations).length;

    // iterate over every country in dataset
    for (let i = 0; i < nData; i++) {

        indicator = [];
        country = [];

        // country: name, code, life satisfaction
        let countryName = lifeSatData.structure.dimensions.observation[0].values[i].name;
        let countryCode = lifeSatData.structure.dimensions.observation[0].values[i].id;
        let countryLS = lifeSatData.dataSets[0].observations[i + ":0:0:0"][0];
        let countryLE = lifeExpData.dataSets[0].observations[i + ":0:0:0"][0];

        country.push(countryName);
        country.push(countryCode);
        country.push(countryLS);
        country.push(countryLE);

        // LS indicators: employment rate, educational attainment, safety
        let ER = empRateData.dataSets[0].observations[i + ":0:0:0"][0];
        let EA = eduAttData.dataSets[0].observations[i + ":0:0:0"][0];
        let SF = selfHealthData.dataSets[0].observations[i + ":0:0:0"][0];

        indicator.push(ER);
        indicator.push(EA);
        indicator.push(SF);

        countries.push(country);
        indicatorData[countryName] = indicator

    }

    makeBarChart(indicatorData.Netherlands);
}


/** Draws bar chart with life satisfaction indicators. */
function makeBarChart(dataset) {

    let countryName = d3.select("#barchart")
                        .append("h3")
                        .attr("id", "countryName")
                        .text("Netherlands")
    
    // define size and margins
    const margin = 50;
    const w = 450 - 2 * margin;
    const h = 380 - 2 * margin;
    const padding = 10;
    const n = dataset.length;

    // formulas to scale data
    let yScale = d3.scale.linear()
                   .domain([0, 100])
                   .range([h, 0]);

    let xScale = d3.scale.linear()
                   .domain([0, n])
                   .range([0, w]);

    // create SVG element
    let svg = d3.select("#barchart")
                .append("svg")
                .attr("width", w + 2 * margin)
                .attr("height", h + 2 * margin)
                .append("g")
                .attr("transform", "translate(" + margin + "," + margin +")");

    // add title for barchart
    svg.append("text")
       .text("Indicators for life satisfaction")
       .attr("x", 2 * padding)
       .attr("y", 0)
       .style("font-size", "25px")

    // get tool tip
    var tool_tip = d3.tip()
                     .attr('class', 'd3-tip')
                     .offset([-10, 0])
                     .html(function(d) { return d + "%" });
    svg.call(tool_tip);

    // draw x axis
    let xdata = ["employment rate", "educ. atainment", "self rep. health"];

    let xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(n)
                      .tickFormat(function (d) {return xdata[d]});

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + h + ")")
       .call(xAxis)
       .selectAll("text")
       .style("text-anchor", "start")
       .attr("dx", "1em");

    // draw y axis
    let yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left");

    svg.append("g")
       .attr("class", "axis")
       .call(yAxis)

       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin)
       .attr("x", 0 - (h / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Percentage of population (%)");

    // draw rectangles
    let rects = svg.selectAll("rect")
               .data(dataset)
               .enter()
               .append("rect")
               .attr("class", "bar");

    rects.attr("height", function(d, i) {return h - yScale(d)})
         .attr("width", w / 3 - padding)
         .attr("x", function(d, i) {return ((i * w) / n) + padding})
         .attr("y", function(d) {return h - (h - yScale(d))})
         .on('mouseover', tool_tip.show)
         .on('mouseout', tool_tip.hide);

    getMap();
}


/** loads a map zoomed in on Europe. */
function getMap() {

    // formula for assigning class(low, middle, high) to life satisfaction score
    let cScaleLS = function(LS) {
        if (LS < 6) {
            return "low"
        }
        else if (LS < 7) {
            return "middle"
        }
        else {
            return "high"
        }
    }

    let cScaleLE = function(LE) {
        if (LE < 80) {
            return "low"
        }
        else if (LE < 82) {
            return "middle"
        }
        else {
            return "high"
        }
    }

    // converts data into correct format for the map
    let n = countries.length;
    let mapDataLS = {};
    let mapDataLE = {};

    for (let i = 0; i < n; i ++) {
        mapDataLS[countries[i][1]] = {"country" : countries[i][0],
                                    "life" : countries[i][2],
                                    "fillKey" : cScaleLS(countries[i][2])}
    }

    for (let i = 0; i < n; i ++) {
        mapDataLE[countries[i][1]] = {"country" : countries[i][0],
                                    "life" : countries[i][3],
                                    "fillKey" : cScaleLE(countries[i][3])}
    }

    // draws map according data
    var map = new Datamap({
        element: document.getElementById("worldmap"),

        // when clicked on map: update bar chart
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                if ((indicatorData[geography.properties.name]) == null) {
                    console.log("no data")}
                else {
                updateCountry(indicatorData[geography.properties.name]);
                let newName = d3.selectAll("#countryName")
                                .text(geography.properties.name)
                }
            });
        },

        // zoom in on Europe
        setProjection: function(element) {
        var projection = d3.geo.equirectangular()
            .center([13, 52])
            .rotate([4.4, 0])
            .scale(650)
            .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
        var path = d3.geo.path()
                         .projection(projection);
        return {path: path, projection: projection};
        },

        // geography configuration 
        geographyConfig: {
            borderColor: 'black',
            popupOnHover: true,
            highlightOnHover: true,
            highlightFillColor: "#1ab2ff",
            highlightBorderColor: "darkgreen",
            highlightBorderWidth: 1.5,
            highlightBorderOpacity: 1,

            // shows pop-up when hovered over country
            popupTemplate: function(geography, data) {
                    return "<div class=hoverinfo> \
                        <strong>" + data.country + "</strong><br/> \
                        Life Indicator:<br/>" + data.life + "</div>"
            }
        },

        // colors country according to life satisfaction (dark = more satisfied)
        fills: {
            low: '#f7fcb9',
            middle: '#addd8e',
            high: '#31a354',
            defaultFill: "lightgrey"
        },

        // mapData: country, life satisfaction, fill key
        data: {},
        

    });

    map.updateChoropleth(mapDataLS);

    // button fourth variable
    var button = d3.selectAll(".btn")
                   .on("click", function () {
                        let life = this.getAttribute("value");
                        if (life == "lifeexp") {
                            map.updateChoropleth(mapDataLE);
                        }
                        else {
                            map.updateChoropleth(mapDataLS);
                        }
                    })

    // add legend for worldmap
    var legend = {
        legendTitle: "legend",
        defaultFillName: "No data",
    }
    map.legend(legend)
    
}


/** 
* Updates bar chart according to country clicked on.
*/
function updateCountry(dataset) {

// define size and margins
const margin = 50;
const w = 450 - 2 * margin;
const h = 380 - 2 * margin;
const padding = 10;
const n = dataset.length;

// formulas to scale data
let yScale = d3.scale.linear()
               .domain([0, 100])
               .range([h, 0]);

let xScale = d3.scale.linear()
               .domain([0, n])
               .range([0, w]);

    let t = d3.transition()
              .duration(750);

    svg = d3.selectAll("#barchart")


    // select rectangles of bar chart
    var rects = svg.selectAll("rect")
                   .data(dataset);

    // enter
    rects.enter().append("rect");

    // update
    rects.transition(t)
         .attr("height", function(d, i) {return h - yScale(d)})
         .attr("width", w / 3 - padding)
         .attr("x", function(d, i) {return ((i * w) / n) + padding})
         .attr("y", function(d) {return h - (h - yScale(d))})
         .attr("class", "bar");
    
    // exit
    rects.exit().remove();
}

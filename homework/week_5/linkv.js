/* linkv.js
*
*  Dataprocessing, week 5
*  Shan Shan Huang (10768793)
*
*  D3 Linked views
*  Shows a map of Europe with countries and its life satisfaction score or
*  life expectancy in years. When clicked on a country, it updates the bar chart
*  with three indicators: employment rate, educational attainment,
*  and self reported health.
*/

window.onload = function() {
    getData();
}


/** Retrieve data through API. */
function getData() {

    const lifeSat = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.SW_LIFS.L.TOT/all?&dimensionAtObservation=allDimensions";
    const empRate = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.JE_EMPL.L.TOT/all?&dimensionAtObservation=allDimensions";
    const eduAtt = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.ES_EDUA.L.TOT/all?&dimensionAtObservation=allDimensions";
    const selfHealth = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.HS_SFRH.L.TOT/all?&dimensionAtObservation=allDimensions";
    const lifeExp = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.HS_LEB.L.TOT/all?&dimensionAtObservation=allDimensions";

    // parse data when GET request fulfilled
    d3.queue()
      .defer(d3.request, lifeSat)
      .defer(d3.request, empRate)
      .defer(d3.request, eduAtt)
      .defer(d3.request, selfHealth)
      .defer(d3.request, lifeExp)
      .awaitAll(parseData);
}

// list: [country, country code, life satisfaction, life expectancy]
var mapData = [];

// object: {Country: [employment rate, educ. attainment, self-rep health]}
var indicatorData = {};


/** Parses data. */
function parseData(error, response) {

    if (error) throw error;

    const lifeSatData = JSON.parse(response[0].responseText);
    const empRateData = JSON.parse(response[1].responseText);
    const eduAttData = JSON.parse(response[2].responseText);
    const selfHealthData = JSON.parse(response[3].responseText);
    const lifeExpData = JSON.parse(response[4].responseText);

    let nData = Object.keys(lifeSatData.dataSets[0].observations).length;

    // iterate over every country in dataset
    for (let i = 0; i < nData; i++) {

        indicator = [];
        country = [];

        const indexData = i + ":0:0:0";

        // country: name, code, life satisfaction, life expectancy
        let countryName = lifeSatData.structure.dimensions.observation[0]
                          .values[i].name;
        let countryCode = lifeSatData.structure.dimensions.observation[0]
                          .values[i].id;
        let countryLS = lifeSatData.dataSets[0].observations[indexData][0];
        let countryLE = lifeExpData.dataSets[0].observations[indexData][0];

        country.push(countryName);
        country.push(countryCode);
        country.push(countryLS);
        country.push(countryLE);

        // indicators: employment rate, educational attainment, rep. health
        let empRate = empRateData.dataSets[0].observations[indexData][0];
        let eduAtt = eduAttData.dataSets[0].observations[indexData][0];
        let selfHealth = selfHealthData.dataSets[0].observations[indexData][0];

        indicator.push(empRate);
        indicator.push(eduAtt);
        indicator.push(selfHealth);

        mapData.push(country);
        indicatorData[countryName] = indicator;

    }
    makeBarChart(indicatorData.Netherlands);
}


/** Draws bar chart with well-being indicators. */
function makeBarChart(indicatorData) {

    // name of the country shown in bar chart
    let countryName = d3.select("#countryName")
                        .append("text")
                        .attr("id", "newName")
                        .text("Netherlands");

    // define sizes and margins
    const margin = 50;
    const w = 550 - 2 * margin;
    const h = 450 - 2 * margin;
    const padding = 10;
    const n = indicatorData.length;

    // formulas to scale data: yScale from 0% to 100% of population
    let yScale = d3.scale.linear()
                   .domain([0, 100])
                   .range([h, 0]);

    // formulas to scale data: xScale from 0 to n indicators
    let xScale = d3.scale.linear()
                   .domain([0, n])
                   .range([0, w]);

    // create SVG element for bar chart
    let svg = d3.select("#barchart")
                .append("svg")
                .attr("width", w + 2 * margin)
                .attr("height", h + 2 * margin)
                .append("g")
                .attr("transform", "translate(" + margin + "," + margin +")");

    // title for bar chart
    svg.append("text")
       .text("Well-being indicators of population")
       .attr("x", 2 * padding)
       .attr("y", 0)
       .style("font-size", "25px");

    // get tool tip
    var tool_tip = d3.tip()
                     .attr("class", "d3-tip")
                     .offset([-10, 0])
                     .html(function(d) { return d + "%" });
    svg.call(tool_tip);

    // draw x axis
    let xdata = ["employment rate", "educ. attainment", "self rep. health"];

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
       .text("part of population (%)");

    // draw rectangles bar chart
    let rects = svg.selectAll("rect")
               .data(indicatorData)
               .enter()
               .append("rect")
               .attr("class", "bar");

    rects.attr("height", function(d, i) {return h - yScale(d)})
         .attr("width", w / 3 - padding)
         .attr("x", function(d, i) {return ((i * w) / n) + padding})
         .attr("y", function(d) {return h - (h - yScale(d))})
         .on("mouseover", tool_tip.show)
         .on("mouseout", tool_tip.hide);

    formatMapData();
}

// countrycode: {country, well-being score, fillkey}
var mapDataLS = {};
var mapDataLE = {};


/** Formats data such that it is usable for datamaps */
function formatMapData() {

    // scale to assign class to life satisfaction
    let cScaleLS = function(LS) {
        if (LS < 6) {
            return "Low";
        } else if (LS < 7) {
            return "Middle";
        } else {
            return "High";
        }
    }

    // scale to assign class to life expectancy
    let cScaleLE = function(LE) {
        if (LE < 80) {
            return "Low";
        } else if (LE < 82) {
            return "Middle";
        } else {
            return "High";
        }
    }

    let n = mapData.length;

    // converts data into correct format for the map
    for (let i = 0; i < n; i ++) {
        mapDataLS[mapData[i][1]] = {"country" : mapData[i][0],
                                    "lifeValue" : mapData[i][2],
                                    "fillKey" : cScaleLS(mapData[i][2])};
    }

    for (let i = 0; i < n; i ++) {
        mapDataLE[mapData[i][1]] = {"country" : mapData[i][0],
                                    "lifeValue" : mapData[i][3],
                                    "fillKey" : cScaleLE(mapData[i][3])};
    }

    getMap();
}

var map;

/** Loads a map zoomed in on Europe. */
function getMap() {

    // get new map
    map = new Datamap({
        element: document.getElementById("worldmap"),

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
            borderColor: "black",
            popupOnHover: true,
            highlightOnHover: true,
            highlightFillColor: "#1ab2ff",
            highlightBorderColor: "white",
            highlightBorderWidth: 1.5,
            highlightBorderOpacity: 1,

            // pop-up: life satisfaction/ expectancy when hovered over country
            popupTemplate: function(geography, data) {

                // the score for life satisfaction goes from 0 to 10
                let maxLifeSat = 10;

                if (data.lifeValue <= maxLifeSat) {
                    return "<div class=hoverinfo> \
                            <strong>" + data.country + "</strong><br/> \
                            Life satisfaction: <br/>" + data.lifeValue +
                            "</div>";
                } else {
                    return "<div class=hoverinfo> \
                            <strong>" + data.country + "</strong><br/> \
                            Life expectancy: <br/>" + data.lifeValue + "years \
                            </div>";
                }
            }
        },

        // update bar chart when country is clicked
        done: function(datamap) {

            datamap.svg.selectAll('.datamaps-subunit')
                       .on('click', function(geography) {
                if ((indicatorData[geography.properties.name]) == null) {
                    console.log("no data");
                } else {
                updateCountry(indicatorData[geography.properties.name]);
                let newCountryName = d3.selectAll("#newName")
                                       .text(geography.properties.name);
                }
            });
        },

        // colors country according to well-being
        fills: {
            Low: '#f7fcb9',
            Middle: '#addd8e',
            High: '#31a354',
            defaultFill: "lightgrey"
        },

        // mapData: country, well-being value, fill key
        data: {},
    });

    addLegend();
    updateMap();
}


/** Adds legend for worldmap. */
function addLegend() {

    let legend = {
        legendTitle: "Legend",
        defaultFillName: "No data"
    }
    map.legend(legend);
}

/** Updates map based on button clicked: life satisfaction or expectancy. */
function updateMap() {

    // initialize map with life satisfaction data
    map.updateChoropleth(mapDataLS);

    // update map based on button clicked
    let button = d3.selectAll(".btn")
                   .on("click", function () {
                        let life = this.getAttribute("value");
                        if (life == "lifeexp") {
                            map.updateChoropleth(mapDataLE);
                        } else {
                            map.updateChoropleth(mapDataLS);
                        }
                    });
}


/** Updates bar chart according to country clicked on. */
function updateCountry(dataset) {

    // define size and margins
    const margin = 50;
    const w = 550 - 2 * margin;
    const h = 450 - 2 * margin;
    const padding = 10;
    const n = dataset.length;

    // formulas to scale data
    let yScale = d3.scale.linear()
                   .domain([0, 100])
                   .range([h, 0]);

    // transition
    let t = d3.transition()
              .duration(750);

    // select rectangles of bar chart
    let svg = d3.selectAll("#barchart")
    let rects = svg.selectAll("rect")
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

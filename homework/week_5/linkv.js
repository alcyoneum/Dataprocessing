/* linkv.js
*
*  Dataprocessing, week 5
*  Shan Shan Huang (10768793)
*
*  D3 Linked views
*  Shows a map of Europe with countries and its life satisfaction score.
*  When clicked on a country, it updates the bar chart with life satisfaction
*  indicators such as employment rate, educational attainment, and safety
*  feeling when walking home.
*/

window.onload = function() {
    getData();
}


/** Retrieve data through API. */
function getData() {

    // life satisfaction, employment rate, educational atainment, safety feeling
    var LifeS = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LVA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.SW_LIFS.L.TOT/all?&dimensionAtObservation=allDimensions";
    var EmpR = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LVA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.JE_EMPL.L.TOT/all?&dimensionAtObservation=allDimensions";
    var EduA = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LVA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.ES_EDUA.L.TOT/all?&dimensionAtObservation=allDimensions";
    var SaF = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LVA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.PS_FSAFEN.L.TOT/all?&dimensionAtObservation=allDimensions";

    // parse data when GET request fulfilled
    d3.queue()
      .defer(d3.request, LifeS)
      .defer(d3.request, EmpR)
      .defer(d3.request, EduA)
      .defer(d3.request, SaF)
      .awaitAll(parseData);
}

var countries = [];
var indicatorData = {};


/** Parses JSON data. */
function parseData(error, response) {

    if (error) throw error;

    // life satisfaction, employment rate, educational atainment, safety feeling
    var LSData = JSON.parse(response[0].responseText);
    var ERData = JSON.parse(response[1].responseText);
    var EAData = JSON.parse(response[2].responseText);
    var SFData = JSON.parse(response[3].responseText);
    var nData = Object.keys(LSData.dataSets[0].observations).length;

    // iterate over every country in dataset
    for (let i = 0; i < nData; i++) {

        indicator = [];
        country = [];

        // country: name, code, life satisfaction
        let countryName = LSData.structure.dimensions.observation[0].values[i].name;
        let countryCode = LSData.structure.dimensions.observation[0].values[i].id;
        let countryLS = LSData.dataSets[0].observations[i + ":0:0:0"][0];

        country.push(countryName);
        country.push(countryCode);
        country.push(countryLS);

        // LS indicators: employment rate, educational attainment, safety
        let ER = ERData.dataSets[0].observations[i + ":0:0:0"][0];
        let EA = EAData.dataSets[0].observations[i + ":0:0:0"][0];
        let SF = SFData.dataSets[0].observations[i + ":0:0:0"][0];

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
    
    // define size and margins
    const margin = 50;
    const w = 400 - 2 * margin;
    const h = 300 - 2 * margin;
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
    let svg = d3.select("body")
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
       .style("font-size", "20px")

    // get tool tip
    var tool_tip = d3.tip()
                     .attr('class', 'd3-tip')
                     .offset([-10, 0])
                     .html(function(d) { return d + "%" });
    svg.call(tool_tip);

    // draw x axis
    let xdata = ["employment rate", "educ. atainment", "safety feeling"];

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
       .attr("dx", "1.5em");

    // draw y axis
    let yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left");

    svg.append("g")
       .attr("class", "axis")
       .call(yAxis);

    svg.append("text")
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

    /** loads a map zoomed in on Europe. */
    function getMap() {

        // formula for assigning class(low, middle, high) to life satisfaction score
        let cScale = function(LS) {
            if (LS < 6) {
                return "lowLS"
            }
            else if (LS >= 6 && LS < 7) {
                return "middleLS"
            }
            else {
                return "highLS"
            }
        }

        // converts data into correct format for the map
        var mapData = {};
        let n = countries.length;

        for (let i = 0; i < n; i ++) {
            mapData[countries[i][1]] = {"country" : countries[i][0],
                                        "lifeSatisfaction" : countries[i][2],
                                        "fillKey" : cScale(countries[i][2])}
        }

        // draws map according data
        var map = new Datamap({
            element: document.getElementById("container"),
            fills: {defaultFill: "black"},

            // when clicked on map: update bar chart
            done: function(datamap) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                    update(indicatorData[geography.properties.name])
                });
            },

            // zoom in on Europe
            setProjection: function(element) {
            var projection = d3.geo.equirectangular()
                .center([13, 52])
                .rotate([4.4, 0])
                .scale(500)
                .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
            var path = d3.geo.path()
                             .projection(projection);
            return {path: path, projection: projection};
            },

            // geography configuration 
            geographyConfig: {
                borderColor: 'white',
                popupOnHover: true,
                highlightOnHover: true,
                highlightFillColor: "orange",
                highlightBorderColor: "white",
                highlightBorderWidth: 1.5,
                highlightBorderOpacity: 1,

                // shows pop-up when hovered over country
                popupTemplate: function(geography, data) {
                    return "<div class=hoverinfo> \
                            <strong>" + data.country + "</strong><br/> \
                            Life Satisfaction:<br/>" + data.lifeSatisfaction + "</div>"
                }
            },

            // colors country according to life satisfaction (dark = more satisfied)
            fills: {
                lowLS: '#fee8c8',
                middleLS: '#fdbb84',
                highLS: '#e34a33'
            },

            // mapData: country, life satisfaction, fill key
            data: mapData
        })
    }

    /** Updates bar chart according to country clicked on.
    *   Not finished yet! Error handling when clicked on country without data?
    * */
    function update(dataset) {

        // select rectangles of bar chart
        var rects = svg.selectAll("rect")
                       .data(dataset);

        // enter
        rects.enter().append("rect");

        // update
        rects.attr("height", function(d, i) {return h - yScale(d)})
             .attr("width", w / 3 - padding)
             .attr("x", function(d, i) {return ((i * w) / n) + padding})
             .attr("y", function(d) {return h - (h - yScale(d))})
             .attr("class", "bar");
        
        // exit
        rects.exit().remove();
    }
}
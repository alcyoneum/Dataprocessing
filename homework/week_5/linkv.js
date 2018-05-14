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

var global2015;
var global2016;


/** Retrieve data through API. */
function getData() {

    // life satisfaction, employment rate, educational atainment, safety feeling
    var lifeS16 = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.SW_LIFS.L.TOT/all?&dimensionAtObservation=allDimensions";
    var empR16 = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.JE_EMPL.L.TOT/all?&dimensionAtObservation=allDimensions";
    var eduA16 = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.ES_EDUA.L.TOT/all?&dimensionAtObservation=allDimensions";
    var health16 = "http://stats.oecd.org/SDMX-JSON/data/BLI2016/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.HS_SFRH.L.TOT/all?&dimensionAtObservation=allDimensions";


    var lifeS15 = "https://stats.oecd.org/SDMX-JSON/data/BLI2015/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.SW_LIFS.L.TOT/all?&dimensionAtObservation=allDimensions";
    var empR15 = "https://stats.oecd.org/SDMX-JSON/data/BLI2015/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.JE_EMPL.L.TOT/all?&dimensionAtObservation=allDimensions";
    var eduA15 = "https://stats.oecd.org/SDMX-JSON/data/BLI2015/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.ES_EDUA.L.TOT/all?&dimensionAtObservation=allDimensions";
    var health15 = "https://stats.oecd.org/SDMX-JSON/data/BLI2015/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ITA+LUX+NLD+NOR+POL+PRT+SVN+ESP+SWE+CHE+GBR.HS_SFRH.L.TOT/all?&dimensionAtObservation=allDimensions";

    // parse data when GET request fulfilled
    d3.queue()
      .defer(d3.request, lifeS16)
      .defer(d3.request, empR16)
      .defer(d3.request, eduA16)
      .defer(d3.request, health16)
      .defer(d3.request, lifeS15)
      .defer(d3.request, empR15)
      .defer(d3.request, eduA15)
      .defer(d3.request, health15)
      .awaitAll(parseJSON);
}

var countries = [];


/** Parses JSON data. */
function parseJSON(error, response) {

 
    if (error) throw error;

    // life satisfaction, employment rate, educational atainment, safety feeling
    var LSData16 = JSON.parse(response[0].responseText);
    var ERData16 = JSON.parse(response[1].responseText);
    var EAData16 = JSON.parse(response[2].responseText);
    var SFData16 = JSON.parse(response[3].responseText);

    var LSData15 = JSON.parse(response[4].responseText);
    var ERData15 = JSON.parse(response[5].responseText);
    var EAData15 = JSON.parse(response[6].responseText);
    var SFData15 = JSON.parse(response[7].responseText);

    var nData = Object.keys(LSData16.dataSets[0].observations).length;

    global2016 = parseData(LSData16, ERData16, EAData16, SFData16);
    global2015 = parseData(LSData15, ERData15, EAData15, SFData15);

    function parseData(LSData, ERData, EAData, SFData) {
        var indicatorData = {};
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

        return indicatorData;
    }
    console.log(global2015)
    console.log(global2016)
    makeBarChart(global2015.Netherlands);
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

    /** loads a map zoomed in on Europe. */
    function getMap() {

        // formula for assigning class(low, middle, high) to life satisfaction score
        let cScale = function(LS) {
            if (LS < 6) {
                return "lowLS"
            }
            else if (LS < 7) {
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

            // when clicked on map: update bar chart
            done: function(datamap) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                    if ((global2015[geography.properties.name]) == null) {
                        console.log("no data")}
                    else {
                    updateCountry(global2015[geography.properties.name]);
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
                .scale(500)
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
                            Life Satisfaction:<br/>" + data.lifeSatisfaction + "</div>"
                }
            },

            // colors country according to life satisfaction (dark = more satisfied)
            fills: {
                lowLS: '#f7fcb9',
                middleLS: '#addd8e',
                highLS: '#31a354',
                defaultFill: "lightgrey"
            },

            // mapData: country, life satisfaction, fill key
            data: mapData
        })
    }

    /** 
    * Updates bar chart according to country clicked on.
    */
    function updateCountry(dataset) {

        console.log(dataset)

        let t = d3.transition()
                  .duration(750);

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
}
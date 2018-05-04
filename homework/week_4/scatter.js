/* scatter.js
*
*  Dataprocessing, week 4
*  Shan Shan Huang (10768793)
*
*  Makes a scatterplot showing the relationship between life satisfaction,
*  personal earnings, and gender in 2015 and 2016.
*/

window.onload = function() {
    getData();
};

var global2016;
var global2015;


/** Retrieve data through API. */
function getData() {

    // data: life satisfaction score, personal earnings, gender, country, year
    const lifeSatisfaction2016 = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA.SW_LIFS.L.MN+WMN/all?&dimensionAtObservation=allDimensions";
    const personalEarnings2016 = "https://stats.oecd.org/SDMX-JSON/data/BLI2016/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA.JE_PEARN.L.MN+WMN/all?&dimensionAtObservation=allDimensions";
  
    const lifeSatisfaction2015 = "https://stats.oecd.org/SDMX-JSON/data/BLI2015/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA.SW+SW_LIFS.L.MN+WMN/all?&dimensionAtObservation=allDimensions";
    const personalEarnings2015 = "https://stats.oecd.org/SDMX-JSON/data/BLI2015/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA.JE_PEARN.L.MN+WMN/all?&dimensionAtObservation=allDimensions";

    // parse data when GET request fulfilled
    d3.queue()
    .defer(d3.request, lifeSatisfaction2016)
    .defer(d3.request, personalEarnings2016)
    .defer(d3.request, lifeSatisfaction2015)
    .defer(d3.request, personalEarnings2015)
    .awaitAll(parseJSON);


    /** Parses JSON data. */
    function parseJSON(error, response) {
    if (error) throw error;

        let LS_data2016 = JSON.parse(response[0].responseText);
        let PE_data2016 = JSON.parse(response[1].responseText);

        let LS_data2015 = JSON.parse(response[2].responseText);
        let PE_data2015 = JSON.parse(response[3].responseText);

        global2016 = parseData(LS_data2016, PE_data2016);
        global2015 = parseData(LS_data2015, PE_data2015);


        /** Parses Javascript data for 2016 and 2015. */
        function parseData(LS_data, PE_data) {

            let dataset = [];

            // number of datapoints and genders in dataset
            let nDatapoints = (Object.keys(LS_data.dataSets[0].observations)
                               .length) / 2;
            let nGender = LS_data.structure.dimensions.observation[3]
                          .values.length;

            // iterate over every datapoint
            for (let i = 0; i < nDatapoints ; i++) {

                // iterate over every gender
                for (let j = 0; j < nGender; j++) {

                    let datapoint = [];

                    // life satisfaction
                    let LS = (LS_data.dataSets[0].observations[i + ":0:0:" + j][0]);
                    datapoint.push(LS);

                    // personal earnings
                    let PE = (PE_data.dataSets[0].observations[i + ":0:0:" + j][0]);
                    datapoint.push(PE);

                    // gender
                    if (j == 0) {
                        datapoint.push("male");
                    }
                    else {
                        datapoint.push("female");
                    }

                    // country
                    let country = LS_data.structure.dimensions.observation[0]
                                  .values[i].name;
                    datapoint.push(country);
                  
                    dataset.push(datapoint);
                }
            }

            return dataset;
        }

        makeScatter(global2016);
   }
}


/** Make scatterplot using data from 2016. */
function makeScatter(dataset) {

    // define size and margins
    const margin = 50;
    const w = 750 - 2 * margin;
    const h = 400 - 2 * margin;
    const padding = 10;

    // minimum and maximum life satisfaction and personal earnings
    const minLS = d3.min(dataset, function(d) {return d[0]});
    const maxLS = d3.max(dataset, function(d) {return d[0]});
    const minPE = d3.min(dataset, function(d) {return d[1]});
    const maxPE = d3.max(dataset, function(d) {return d[1]});

    // formulas to scale data
    let xScale = d3.scaleLinear()
                  .domain([minLS, maxLS])
                  .range([padding * 2, w - padding * 10]);

    let yScale = d3.scaleLinear()
                   .domain([minPE, maxPE])
                   .range([h - padding, 0]);

    // create SVG element
    let svg = d3.select("body")
                .append("svg")
                .attr("width", w + 2 * margin)
                .attr("height", h + 2 * margin)
                .append("g")
                .attr("transform", "translate(" + margin + "," + margin +")");

    // add title for scatterplot
    svg.append("text")
       .text("Life satisfaction VS personal earnings")
       .attr("x", 12 * padding)
       .attr("y", 0)
       .style("font-size", "20px")

    // draw x axis
    let xAxis = svg.append("g")
                   .attr("transform", "translate(0," + h + ")")
                   .call(d3.axisBottom(xScale));

    // draw x axis label
    svg.append("text")
       .attr("transform", "translate(" + 30 * padding + "," + (h + 4 * padding) + ")" )
       .style("text-anchor", "middle")
       .text("Average life satisfaction score (0-10)");

    // draw y axis
    let yAxis = svg.append("g")
                   .attr("transform", "translate( " + padding + ", 0)")
                   .call(d3.axisLeft(yScale));

    // draw y axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin)
       .attr("x", 0 - (h / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Personal earnings ($)");

    // make circle for each data point in scatter plot
    let circles = svg.selectAll("circle")
                     .data(dataset)
                     .enter()
                     .append("circle");

    // get tool tip to show the country of each data point
    var tool_tip = d3.tip()
                     .attr('class', 'd3-tip')
                     .offset([-10, 0])
                     .html(function(d) { return "Country: " + d[3];});
    svg.call(tool_tip);

    // store colors for gender: blue for male, pink for female
    let colors = ["deepSkyBlue", "hotpink"];

    // draw circles
    circles.attr("cx", function(d) {return xScale(d[0])})
           .attr("cy", function(d) {return yScale(d[1])})
           .attr("r", 3)
           .attr("class", "dot")
           .attr("fill", function(d) {
                if (d[2] == "male") {
                    return colors[0];
                }
                else {
                    return colors[1];
                }
             })
           .on('mouseover', tool_tip.show)
           .on('mouseout', tool_tip.hide);

    addLegend(dataset);


    /** Adds a legend for the dataset. */
    function addLegend(dataset){

        var legend = svg.selectAll(".legend")
                        .data(colors)
                        .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i) {
                            return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
              .attr("x", w - 18)
              .attr("width", 18)
              .attr("height", 18)
              .style("fill", function(d) {return d;});

        legend.append("text")
              .attr("x", w - 24)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .text(function(d) {
                if (d == "deepSkyBlue") {
                  return "male";
                }
                else {
                  return "female";
                }
                });
    }

    // update data with corresponding year when button clicked
    var button = d3.selectAll(".yearButton")
                   .on("click", function() {
                        var year = this.getAttribute("value");
                        if (year =="global2015") {
                            updateData(global2015);
                        }
                        else {
                            updateData(global2016);
                        }
                   });


    /** Make scatterplot with updated data from 2015. */
    function updateData(dataset) {

        // join new data with old elements and update old when needed
        let circles = svg.selectAll("circle")
                         .data(dataset, function(d) {return d})
                         .attr("class", "update");

        // minimum and maximum life satisfaction and personal earnings for 2015
        const minLS = d3.min(dataset, function(d) {return d[0]});
        const maxLS = d3.max(dataset, function(d) {return d[0]});
        const minPE = d3.min(dataset, function(d) {return d[1]});
        const maxPE = d3.max(dataset, function(d) {return d[1]});

        // formulas for scaling for 2015
        let xScale = d3.scaleLinear()
                        .domain([minLS, maxLS])
                        .range([padding * 2, w - padding * 10]);

        let yScale = d3.scaleLinear()
                       .domain([minPE, maxPE])
                       .range([h - padding, 0]);

        // enter, update, and merge datapoints
        circles.enter()
               .append("circle")
               .attr("class", "enter")
               .attr("cx", function(d) {return xScale(d[0])})
               .attr("cy", function(d) {return yScale(d[1])})
               .attr("r", 3)
               .attr("class", "dot")
               .attr("fill", function(d) {
                    if (d[2] == "male") {
                        return colors[0];
                    }
                    else {
                        return colors[1];
                    }
               })
               .on('mouseover', tool_tip.show)
               .on('mouseout', tool_tip.hide)
               .merge(circles);

        // remove old elements as needed
        circles.exit().remove();
    }
}
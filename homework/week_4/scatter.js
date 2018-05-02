/* Scatter.js
*
* Dataprocessing, week 3
* Shan Shan Huang (10768793)
*
* Scatterplot
*/

window.onload = function() {
	getData();
};

var global2016;
var global2015;
var svg;
var circles;

function getData() {

	var lifeSatisfaction2016 = "http://stats.oecd.org/SDMX-JSON/data/BLI2016/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA.SW_LIFS.L.MN+WMN/all?&dimensionAtObservation=allDimensions"
	var	personalEarnings2016 = "http://stats.oecd.org/SDMX-JSON/data/BLI2016/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA.JE_PEARN.L.MN+WMN/all?&dimensionAtObservation=allDimensions"
	var lifeSatisfaction2015 = "http://stats.oecd.org/SDMX-JSON/data/BLI2015/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA.SW+SW_LIFS.L.MN+WMN/all?&dimensionAtObservation=allDimensions"
	var personalEarnings2015 = "http://stats.oecd.org/SDMX-JSON/data/BLI2015/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA.JE_PEARN.L.MN+WMN/all?&dimensionAtObservation=allDimensions"

	d3.queue()
	  .defer(d3.request, lifeSatisfaction2016)
	  .defer(d3.request, personalEarnings2016)
	  .defer(d3.request, lifeSatisfaction2015)
	  .defer(d3.request, personalEarnings2015)
	  .awaitAll(parseData);

	function parseData(error, response) {
		if (error) throw error;

		// get data in JSON format: life satisfaction, personal earnings, country
	  	var LS_data2016 = JSON.parse(response[0].responseText)
	  	var PE_data2016 = JSON.parse(response[1].responseText)

	  	var LS_data2015 = JSON.parse(response[2].responseText)
	  	var PE_data2015 = JSON.parse(response[3].responseText)

	  	global2016 = superParseData(LS_data2016, PE_data2016);
	  	global2015 = superParseData(LS_data2015, PE_data2015);

	  	function superParseData(LS_data, PE_data)
	  	{
			var dataset = []

			n = (Object.keys(LS_data.dataSets[0].observations).length) / 2
		
	 		for (let i = 0; i < n ; i++) {

	 			for (let j = 0; j < 2; j++)
	 			{
	 				datapoint = []
	 				// life satisfaction
			  		let LS = (LS_data.dataSets[0].observations[i + ":0:0:" + j][0])
			  		datapoint.push(LS);

			  		// personal earnings
			  		let PE = (PE_data.dataSets[0].observations[i + ":0:0:" + j][0])
			  		datapoint.push(PE);

			  		if (j == 0)
			  		{
			  			datapoint.push("male");
			  		}
			  		else
			  		{
			  			datapoint.push("female")
			  		}
			  		
			  		dataset.push(datapoint)
	 			}

	  		}

	  		return dataset
	  	}

	  	console.log(global2016)
	  	console.log(global2015)

	  	makeScatter(global2016)
	 }
}

function makeScatter(dataset) {

	var margin = 50
	var w = 750 - 2 * margin
	var h = 400 - 2 * margin
	var padding = 10

	const minLS = d3.min(dataset, function(d) {return d[0]});
	const maxLS = d3.max(dataset, function(d) {return d[0]});
	const minPE = d3.min(dataset, function(d) {return d[1]})
	const maxPE = d3.max(dataset, function(d) {return d[1]})

	var xScale = d3.scaleLinear()
                  .domain([minLS, maxLS])
                  .range([padding * 2, w - padding * 10]);

	var yScale = d3.scaleLinear()
                   .domain([minPE, maxPE])
                   .range([h - padding, 0]);

	// create SVG element
	svg = d3.select("body")
            .append("svg")
	        .attr("width", w + 2 * margin)
	        .attr("height", h + 2 * margin)
	        .append("g")
	        .attr("transform", "translate(" + margin + "," + margin +")")

	// draw x axis
	var xAxis = svg.append("g")
				   .attr("transform", "translate(0," + h + ")")
				   .call(d3.axisBottom(xScale))

	// draw x axis label
	svg.append("text")
       .attr("transform", "translate(" + w/2 + "," + (h + 4 * padding) + ")" )
       .style("text-anchor", "middle")
	   .text("life satisfaction score")

	// draw y axis
	var yAxis = svg.append("g")
				   .attr("transform", "translate( " + padding + ", 0)")
				   .call(d3.axisLeft(yScale))

	// draw y axis label
	svg.append("text")
	   .attr("transform", "rotate(-90)")
	   .attr("y", 0 - margin)
	   .attr("x", 0 - (h / 2))
	   .attr("dy", "1em")
	   .style("text-anchor", "middle")
	   .text("Personal earnings ($)")

	// make circle for each data point
	circles = svg.selectAll("circle")
	                 .data(dataset)
	                 .enter()
	                 .append("circle")

	var colors = ["lightblue", "hotpink"]

	circles.attr("cx", function(d) {return xScale(d[0])})
		   .attr("cy", function(d) {return yScale(d[1])})
		   .attr("r", 3)
		   .attr("class", "dot")
		   .attr("fill", function(d) {
		   	if (d[2] == "male") return colors[0];
		   	else return colors[1]
		   })

	addLegend(dataset);

	function addLegend(dataset){

		var legend = svg.selectAll(".legend")
		      .data(colors)
		      .enter().append("g")
		      .attr("class", "legend")
		   	  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
		      .attr("x", w - 18)
		      .attr("width", 18)
		      .attr("height", 18)
		      .style("fill", function(d) {
		      	  return d
		      	});

		legend.append("text")
		      .attr("x", w - 24)
		      .attr("y", 9)
		      .attr("dy", ".35em")
		      .style("text-anchor", "end")
		      .text(function(d) {
		      	if (d == "lightblue")
		      		return "male"
		      	else
		      		return "female"
		      	});
	}

	button = d3.selectAll(".yearButton")
		       .on("click", function() {
		       	var year = this.getAttribute("value")

		       	if (year == "global2016") {
		       		updateData(global2016)
		       	}
		       	else
		       	{
		       		updateData(global2015)
		       	}
		       	
		       })

	function updateData(dataset) {

		var circles = svg.selectAll("circle")
				         .data(dataset, function(d) {return d})

		circles.attr("class", "update")

		circles.enter().append("circle")
		       .attr("class", "enter")
		       .attr("cx", function(d) {return xScale(d[0])})
			   .attr("cy", function(d) {return yScale(d[1])})
			   .attr("r", 3)
			   .attr("class", "dot")
		       .attr("fill", function(d) {
				   	if (d[2] == "male") return colors[0];
				   	else return colors[1]
				   })

			   .merge(circles)

		circles.exit().remove();
	}
}
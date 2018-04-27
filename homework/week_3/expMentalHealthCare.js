/**
* expMentalHealthCare.js
*
* Dataprocessing week 3
* Shan Shan Huang (10768793)
*
* Draws a bar chart with the expenses (in billion euros) for
* mental health care in the Netherlands from 2001-2016.
*/

// load data from json file
d3.json("expenses_mentalcare.json", function(error, data) {
	if (error) {
		return console.warn(error);
	}
	drawBarChart(data);
})

// add text elements with info for bar chart using D3
d3.select("head").append("title")
				 .text("Mental health care expenses");

d3.select("body").append("h2")
				 .text("Mental health care expenses (2001-2016)");

d3.select("body").append("p")
			     .style("font-size", "16px")
			     .text("Shan Shan Huang (10768793)")

				 .append("p")
				 .style("color","grey")
				 .text("This bar chart shows the expenses (in billion euros) for \
				 	   mental health care from 2001-2016 in the Netherlands.")

				 .append("p")
				 .text("In the last 15 years the amount of money for mental \
				 	health care has doubled.")

				 .append("p")
				 .text("Source: Centraal Bureau voor de Statistiek \
				 	   (Gezondheid, leefstijl, zorggebruik)");


/**
* Draws a bar chart from json data.
*/
function drawBarChart(dataset) {

// define borders and padding
const w = 600;
const h = 400;
const margin = 50;
const barPadding = 10;
const n = dataset.data.length;

// get svg element
let svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

// get tooltip
tip = d3.tip().attr('class', 'd3-tip')
 			  .html(function(d) {
 			  	return "€ " + d.expenses + " billion"; });
svg.call(tip);

// minimum and maximum datapoints
const min_year = d3.min(dataset.data, function(d) {return d.year});
const max_year = d3.max(dataset.data, function(d) {return d.year});
const max_expenses = d3.max(dataset.data, function(d) {return d.expenses});

// formulas to scale data
let xScale = d3.scale.linear()
					 .domain([min_year, max_year])
					 .range([0, w - 2 * margin - 3 * barPadding]);

let yScale = d3.scale.linear()
			   		 .domain([max_expenses, 0])
			   		 .range([0, h -  2 * margin]);

// get x axis
let xAxis = d3.svg.axis()
				   .scale(xScale)
				   .orient("bottom")
				   .ticks(n)
				   .tickFormat(d3.format(""));

// get y axis
let yAxis = d3.svg.axis()
				  .scale(yScale)
				  .orient("left")
				  .ticks(n);

// get rectangles
let rects = svg.selectAll("rect")
			   .data(dataset.data)
			   .enter()
			   .append("rect")
			   .attr("class", "bar")
			   .on('mouseover', tip.show)
			   .on('mouseout', tip.hide);

// draw rectangles using the data
rects.attr("height", function(d, i) {return h - yScale(d.expenses) - 2 * margin})
	 .attr("width", w / n - barPadding)
	 .attr("x", function(d, i) {return (i * ((w - 2 * margin) / n) + margin)})
	 .attr("y", function(d) {return h - (h - yScale(d.expenses)) + margin});

// draw x axis
let drawX = svg.append("g")
			   .attr("class", "axis")
			   .attr("transform", "translate(" + margin + "," + (h - margin+ ")"))
			   .call(xAxis);

// draw tick labels of x axis (source: bl.ocks.org/phoebebright/3061203)
drawX.selectAll("text")
     .style("text-anchor", "middle")
     .attr("dx", "2em")
     .attr("dy", "2em")
     .attr("transform", function(d) { return "translate(" + 
   									this.getBBox().height * -2 + "," +
   									this.getBBox().height + ")rotate(-45)"});

// draw label for x axis
drawX.append("text")
     .attr("y", - margin)
     .attr("dy", "6em")
     .attr("dx", "12em")
     .style("text-anchor", "middle")
     .style("font-size", "16px")
     .text("Year");

// draw y axis
let drawY = svg.append("g")
			   .attr("class", "axis")
			   .attr("transform", "translate (" + margin + ", " + margin + ")")
			   .call(yAxis);

// draw label of y axis
drawY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", - margin)
    .attr("dy", "1em")
    .style("text-anchor", "end")
    .style("font-size", "16px")
    .text("Mental Health Care Expenses (billion euros)");
}
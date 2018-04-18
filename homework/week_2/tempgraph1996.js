/*
* tempgraph1996.js
*
* Dataprocessing week 2
* Shan Shan Huang
*
* Creates a line graph of the average temperature in 1996
* at the De Bilt weather station.
*/

// get rawdata of average temperature in 1996
var data = document.getElementById('rawdata').value;

// creates array with dates and temperatures
var dateTemp = data.split('\n', 366);

var dateList = [];
var tempList = [];

// iterate over every date and temperature
// !!!!! laatste enter niet meenemen.. -1 = magic number....
for (i = 0; i < dateTemp.length; i++) {

	// split date and temperature
	var dateTempList = dateTemp[i].split(',')

	// store date into array
	var dateString = dateTempList[0];

	var year = dateString.substring(0,4);
	var month = dateString.substring(4,6);
	var day = dateString.substring(6,8);

	var date = new Date(year + '-' + month + '-' + day);
	dateList.push(date);

	// store temperature into array
	tempList.push(Number(dateTempList[1]));
}

function createTransform(domain, range){
	// domain is a two-element array of the data bounds [domain_min, domain_max]
	// range is a two-element array of the screen bounds [range_min, range_max]
	// this gives you two equations to solve:
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta
 		// a solution would be:

    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // formulas to calculate the alpha and the beta
    // alpha is scaling factor
    // beta means start at uppermost screen coordinate
   	var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
}

// get the min and max temperatures
var minTemp = Math.min(...tempList)
var maxTemp = Math.max(...tempList)

// min and max screen width and heights
var minWidth = 30;
var maxWidth = 570;
var minHeight = 30;
var maxHeight = 270;

var temperatures = [];
// transform temperature data into screen coordinates
var tempTransform = createTransform([maxTemp, minTemp],[minHeight,maxHeight]);
for (i = 0; i < tempList.length; i++) {
	var temperature = tempTransform(tempList[i]);
	temperatures.push(temperature)
}

// get the min and max dates in milisec
var minDate = Math.min(...dateList);
var maxDate = Math.max(...dateList);

var dates = [];
// transform dates into screen
var dateTransform = createTransform([minDate, maxDate],[minWidth,maxWidth]);
for (i = 0; i < dateList.length; i++) {
	var dateSec = dateList[i].getTime();
	var date = dateTransform(dateSec);
	dates.push(date)
}

// get canvas to draw line graph
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

// draw y axis
ctx.beginPath();
ctx.moveTo(30,5);
ctx.lineTo(30,280);
ctx.stroke();
// draw x axis
ctx.moveTo(30,280);
ctx.lineTo(570,280);
ctx.stroke();

// draw labels
ctx.font = "10pt Verdana";
ctx.fillText("Temperatures", 5, 10);
ctx.fillText("Months", 25, 290)

ctx.beginPath();
ctx.lineWidth = 1;
ctx.strokeStyle = "black";

// draw ticks and labels on y axis
for(i = -100; i <= 300; i +=50)
{
	var ticksTemp = tempTransform(i)
	console.log(ticksTemp)

	// draw tick mark of 10px
	ctx.moveTo(30, ticksTemp)
	ctx.lineTo(30 - 10, ticksTemp)

	// draw text value at that point
	ctx.font = "10pt Arial";
	ctx.fillText(i, 2, ticksTemp)
}


// draw graph
ctx.moveTo(dates[0],temperatures[0])
for(i = 0; i < dates.length; i++)
{
	ctx.lineTo(dates[i],temperatures[i]);
}
ctx.stroke();
/**
* tempgraph1996.js
*
* Dataprocessing week 2
* Shan Shan Huang
*
* Creates a line graph of the average temperature in 1996
* at the De Bilt weather station.
*/

function reqListener ()
{

// get rawdata of average temperatures in 1996
var data = this.responseText;

// create array with dates and temperatures; limit set on 366 days
var dateTemp = data.split('\n', 366);

// make empty lists to store dates and temperatures seperately
var dateList = [];
var tempList = [];

// iterate over dates and temperatures
for (var i = 0; i < dateTemp.length; i++) {

	// split date and temperature
	var dateTempList = dateTemp[i].split(',');

	// format datestring (yyyymmdd) into ISO Date (yyyy-mm-dd)
	var dateString = dateTempList[0];
	var year = dateString.substring(0,4);
	var month = dateString.substring(4,6);
	var day = dateString.substring(6,8);

	// store Javascript date into date list
	var date = new Date(year + '-' + month + '-' + day);
	dateList.push(date);

	// store temperature (Javascript numbers) into temperature list
	tempList.push(Number(dateTempList[1]));
}

/**
* Transforms data to screen coordinates.
*/
function createTransform(domain, range){

	// domain: two-element array of the data bounds [domain_min, domain_max]
    var domain_min = domain[0];
    var domain_max = domain[1];

    // range: two-element array of the screen bounds [range_min, range_max]
    var range_min = range[0];
    var range_max = range[1];

    // formulas to calculate alpha and beta
   	var alpha = (range_max - range_min) / (domain_max - domain_min);
    var beta = range_max - alpha * domain_max;

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
}

// get the lowest and highest temperatures in 1996
var minTemp = Math.min(...tempList);
var maxTemp = Math.max(...tempList);

// get the min and max dates in milisec
var minDate = Math.min(...dateList);
var maxDate = Math.max(...dateList);

// min and max screen width and heights
var minWidth = 50;
var maxWidth = 550;
var minHeight = 50;
var maxHeight = 250;

// transform temperature data into screen coordinates
var temperatures = [];
var tempTransform = createTransform([maxTemp, minTemp],[minHeight,maxHeight]);
for (var i = 0; i < tempList.length; i++) {
	var temperature = tempTransform(tempList[i]);

	// store temperature coordinates in new list
	temperatures.push(temperature)
}

// transform dates into screen coordinates
var dates = [];
var dateTransform = createTransform([minDate, maxDate],[minWidth,maxWidth]);
for (var i = 0; i < dateList.length; i++) {
	var dateSec = dateList[i].getTime();
	var date = dateTransform(dateSec);

	// store date coordinates in new list
	dates.push(date)
}

// get canvas to draw line graph
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

// draw graph
ctx.beginPath();
ctx.lineWidth = 1;
ctx.strokeStyle='red';

// iterate over every date and temperature coordinate
for(var i = 0; i < dates.length; i++)
{
	ctx.lineTo(dates[i],temperatures[i]);
}
ctx.stroke();

// draw graph title at the top of canvas
ctx.font = '18pt Verdana';
ctx.fillText('Average temperatures in 1996 (De Bilt)', 55 , 20);

// draw x axis
ctx.beginPath();
ctx.strokeStyle='black'
ctx.moveTo(minWidth, maxHeight);
ctx.lineTo(maxWidth, maxHeight);
ctx.stroke();

// draw y axis
ctx.beginPath();
ctx.moveTo(minWidth,0);
ctx.lineTo(minWidth,maxHeight);
ctx.stroke();

// draw x-axis label: Dates in 1996 (months)
ctx.font = '12pt Verdana'
ctx.fillText('Dates in 1996 (months)', 200, 290)

// draw rotated y-axis label: Temperature (°C)
ctx.save();
ctx.font = '12pt Verdana';
ctx.translate(15, 200)
ctx.rotate(-Math.PI / 2);
ctx.fillText('Temperature (C)', 0, 0);
ctx.restore();

// set temperature values for ticks on the y-axis
var minTempTick = -100;
var maxTempTick = 300;
var nextTempTick = 50;

// draw ticks and labels on y axis
ctx.beginPath();
ctx.lineWidth = 2;

// iterate over every temperature tick on y-axis
for(var i = minTempTick; i <= maxTempTick; i += nextTempTick) {
	var ticksTemp = tempTransform(i)

	// draw tick mark of length of 10px on y-axis
	ctx.moveTo(50, ticksTemp)
	ctx.lineTo(50 - 10, ticksTemp)

	// convert temperatures from 0.1 celcius to celcius for labels
	celcius = i/10

	// draw text value at that point
	ctx.font = "8pt Arial";
	ctx.fillText(celcius, 20, ticksTemp + 3)
}
ctx.stroke();

// create list of month names
var months = ["jan", "feb", "mar", "apr", "may", "jun",
			  "jul", "aug", "sept", "oct", "nov", "dec" ]
var monthTicks = []

// draw ticks and labels on x-axis
ctx.beginPath();
ctx.lineWidth = 2;

// iterate over days in 1996, increasing with 31days(1 month)
for (var i = 0; i <= 366; i+=31) {
	var monthsec = dateList[i].getTime();
	var monthTick = dateTransform(monthsec)

	// store Tick coordinate of every month in a list
	monthTicks.push(monthTick)

	// draw tick mark of length 10px for every month on x-axis
	ctx.moveTo(monthTick, 250)
	ctx.lineTo(monthTick, 250 + 10)
}

// draw month labels on x axis
for (var i = 0; i < months.length; i++) {
	ctx.font = "8pt Arial";
	ctx.fillText(months[i], monthTicks[i] - 5,270)
}
ctx.stroke();

}

// var oReq = new XMLHttpRequest();
// oReq.addEventListener("load", reqListener);
// oReq.open("GET", "http://www.example.org/example.txt");
// oReq.send();
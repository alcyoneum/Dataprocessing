/**
* tempgraph1996.js
*
* Dataprocessing week 2
* Shan Shan Huang (10768793)
*
* Creates a line graph of the average temperatures in 1996
* at the De Bilt weather station.
*/

// this function gets called when http request is completed
function requestListener () {

	// get rawdata of average temperatures in 1996
	let data = this.responseText;

	// create array with dates and temperatures; limit set on 366 days (in 1996)
	let dateTemp = data.split('\n', 366);

	let dateList = [];
	let tempList = [];

	// store Javascript dates and temperatures into seperate lists
	for (let i = 0; i < dateTemp.length; i++) {

		let dateTempList = dateTemp[i].split(',');

		let dateString = dateTempList[0];

		// format datestring (yyyymmdd) into ISO date (yyyy-mm-dd)
		let year = dateString.substring(0,4);
		let month = dateString.substring(4,6);
		let day = dateString.substring(6,8);
		let date = new Date(year + '-' + month + '-' + day);

		dateList.push(date);
		tempList.push(Number(dateTempList[1]));
	}

	/**
	* Transforms data to screen coordinates.
	*/
	function createTransform(domain, range){

		// domain: two-element array of the data bounds [domain_min, domain_max]
	    let domain_min = domain[0];
	    let domain_max = domain[1];

	    // range: two-element array of the screen bounds [range_min, range_max]
	    let range_min = range[0];
	    let range_max = range[1];

	    // formulas to calculate alpha and beta
	   	let alpha = (range_max - range_min) / (domain_max - domain_min);
	    let beta = range_max - alpha * domain_max;

	    // returns the function for the linear transformation (y= a * x + b)
	    return function(x) {
	      return alpha * x + beta;
	    }
	}

	// get lowest and highest temperatures in 1996
	let minTemp = Math.min(...tempList);
	let maxTemp = Math.max(...tempList);

	// get min and max dates in milisec
	let minDate = Math.min(...dateList);
	let maxDate = Math.max(...dateList);

	// min and max screen width and height
	let minWidth = 50;
	let maxWidth = 550;
	let minHeight = 50;
	let maxHeight = 250;

	// transform temperatures into screen coordinates and store in new list
	let temperatures = [];
	let tempTransform = createTransform([maxTemp, minTemp],[minHeight,maxHeight]);
	for (let i = 0; i < tempList.length; i++) {
		let temperature = tempTransform(tempList[i]);

		temperatures.push(temperature);
	}

	// transform dates into screen coordinates and store in new list
	let dates = [];
	let dateTransform = createTransform([minDate, maxDate],[minWidth,maxWidth]);
	for (let i = 0; i < dateList.length; i++) {
		let dateSec = dateList[i].getTime();
		let date = dateTransform(dateSec);

		dates.push(date);
	}

	let canvas = document.getElementById('myCanvas');
	let ctx = canvas.getContext('2d');

	// draw graph
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle='red';

	for(let i = 0; i < dates.length; i++) {
		ctx.lineTo(dates[i],temperatures[i]);
	}
	ctx.stroke();

	// draw graph title at the top of canvas
	ctx.font = '18pt Verdana';
	ctx.fillText('Average temperatures in 1996 (De Bilt)', 55 , 20);

	// draw x axis
	ctx.beginPath();
	ctx.strokeStyle='black';
	ctx.moveTo(minWidth, maxHeight);
	ctx.lineTo(maxWidth, maxHeight);
	ctx.stroke();

	// draw y axis
	ctx.beginPath();
	ctx.moveTo(minWidth,0);
	ctx.lineTo(minWidth,maxHeight);
	ctx.stroke();

	// draw dashed line that shows freezing point (0 °C)
	ctx.beginPath();
	ctx.strokeStyle='grey';
	ctx.setLineDash([5,10]);
	ctx.moveTo(minWidth, tempTransform(0));
	ctx.lineTo(maxWidth, tempTransform(0));
	ctx.stroke();

	// draw x-axis label: Dates in 1996 (months)
	ctx.font = '12pt Verdana';
	ctx.fillText('Dates in 1996 (months)', 200, 290);

	// draw rotated y-axis label: Temperature (°C)
	ctx.save();
	ctx.font = '12pt Verdana';
	ctx.translate(15, 200)
	ctx.rotate(-Math.PI / 2);
	ctx.fillText('Temperature (C)', 0, 0);
	ctx.restore();

	// set temperature values for ticks on the y-axis
	let minTempTick = -100;
	let maxTempTick = 300;
	let nextTempTick = 50;

	// draw ticks and labels on y-axis
	ctx.beginPath();
	ctx.lineWidth = 2;

	for(let i = minTempTick; i <= maxTempTick; i += nextTempTick) {
		let ticksTemp = tempTransform(i)

		// draw tick mark of length of 10px on y-axis
		ctx.moveTo(50, ticksTemp);
		ctx.lineTo(50 - 10, ticksTemp);

		// convert temperatures from 0.1 celcius to celcius for tick labels
		celcius = i/10;

		// draw text value at that point
		ctx.font = '8pt Arial';
		ctx.fillText(celcius, 20, ticksTemp + 3);
	}
	ctx.stroke();

	// draw ticks and labels on x-axis
	ctx.beginPath();
	ctx.lineWidth = 2;

	let monthTicks = [];

	// iterate over days in 1996, increasing with 31days(1 month)
	for (let i = 0; i <= 366; i+=31) {
		let monthsec = dateList[i].getTime();
		let monthTick = dateTransform(monthsec);

		// store Tick coordinate of every month in a list
		monthTicks.push(monthTick);

		// draw tick mark of length 10px for every month on x-axis
		ctx.moveTo(monthTick, 250);
		ctx.lineTo(monthTick, 250 + 10);
	}

	let months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
				  'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

	// draw month labels on x-axis
	for (let i = 0; i < months.length; i++) {
		ctx.font = '8pt Arial';
		ctx.fillText(months[i], monthTicks[i] - 5,270);
	}
	ctx.stroke();

}

// send HTTP request
let request = new XMLHttpRequest();
request.addEventListener('load', requestListener);
let URL = 'https://raw.githubusercontent.com/alcyoneum/Dataprocessing/master/homework/week_2/tempdata1996.csv';
request.open('GET', URL);
request.send();


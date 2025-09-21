const http = require('http');
const url = require('url');
const availableTimes = {
    Monday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Tuesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Wednesday: ["1:00", "1:30", "2:00", "2:30", "3:00", "4:00", "4:30"],
    Thursday: ["1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
    Friday: ["1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"],
};
const appointments = [
    {name: "James", day: "Wednesday", time: "3:30" },
    {name: "Lillie", day: "Friday", time: "1:00" }];


//create server object 
const myserver = http.createServer(function (req, res) {
	console.log(req.url);
	let urlObj = url.parse(req.url,true);
	switch (urlObj.pathname) {
		case "/schedule":
			schedule(urlObj.query, res);
			break;
		case "/cancel":
			cancel(urlObj.query, res);
			break;
		case "/check":
			checkAvailability(urlObj.query, res)
			break;
		default:
			error(res,404,"pathname unknown");
	}
});

//Schedule function

function schedule(qObj, res) {
	if (!qObj.name || !qObj.day || !qObj.time) {
		return error(res, 400, "Missing name, day, or time");
	
} 

if (availableTimes[qObj.day] && availableTimes[qObj.day].includes(qObj.time)) {
//remove time
	availableTimes[qObj.day] = availableTimes[qObj.day].filter(time => time !== qObj.time);
//add apointments
	appointments.push({ name: qObj.name, day: qObj.day, time: qObj.time});
	
	res.writeHead(200, { 'content-type': 'text/plain' });
	res.write("reserved");
	res.end();
} else {
	error(res, 400, "Can't schedule");
	}
} 

//Cancel function
function cancel(qObj, res) {
	if (!qObj.name || !qObj.day || !qObj.time) { 
		return error(res, 400, "Missing name, day, or time");
    }

    const index = appointments.findIndex(app =>
        app.name === qObj.name && app.day === qObj.day && app.time === qObj.time
    );

if (index !== -1) {
        // Remove from appointments
        appointments.splice(index, 1);

        // Add time back to availableTimes
        if (!availableTimes[qObj.day]) {
            availableTimes[qObj.day] = [];
        }
        availableTimes[qObj.day].push(qObj.time);
        availableTimes[qObj.day].sort();

        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Appointment has been canceled");
        res.end();
    } else {
        error(res, 404, "Appointment not found");
    }
}

//Check Availability function
function checkAvailability(qObj, res) {
    if (!qObj.day || !qObj.time) {
        return error(res, 400, "Missing day or time");
    }

    if (availableTimes[qObj.day] && availableTimes[qObj.day].includes(qObj.time)) {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Time is available");
        res.end();
    } else {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write("Time is not available");
        res.end();
    }
}

//Error function
function error(response, status, message) {
    response.writeHead(status, { 'content-type': 'text/plain' });
    response.write(message);
    response.end();
}

myserver.listen(80,function(){console.log("listening on port 80")});

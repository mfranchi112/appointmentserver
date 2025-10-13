const http = require('http');
const fs = require('fs');
const url = require('url');
const pathModule = require('path');
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

function sendResponse(res, statusCode, contentType, data) {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    // If data is a Buffer or string, send it, if not, JSON stringify
    if (Buffer.isBuffer(data) || typeof data === 'string') {
        res.end(data);
    } else {
        res.end(JSON.stringify(data));
    }
} 

function getContentType(ext) {
    // cover common types used by the interface
    switch (ext.toLowerCase()) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.js': return 'text/javascript';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpeg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        case '.txt': return 'text/plain';
        default: return 'application/octet-stream';
    }
}

function sendFile(filePath, res) {
    const normalized = pathModule.normalize(filePath);

    // determine extension and content type
    const ext = pathModule.extname(normalized) || '.html';
    const contentType = getContentType(ext);

    fs.readFile(normalized, function (err, data) {
        if (err) {
            // If file not found, return 404 
            sendResponse(res, 404, 'text/plain', 'File not found: ' + filePath);
        } else {
            sendResponse(res, 200, contentType, data);
        }
    });
}

// Schedule function
function schedule(qObj, res) {
    if (!qObj.name || !qObj.day || !qObj.time) {
        return sendResponse(res, 400, 'text/plain', 'Missing name, day, or time');
    }

    if (availableTimes[qObj.day] && availableTimes[qObj.day].includes(qObj.time)) {
        // remove time slot
        availableTimes[qObj.day] = availableTimes[qObj.day].filter(time => time !== qObj.time);

        // add appointment
        appointments.push({ name: qObj.name, day: qObj.day, time: qObj.time });

        return sendResponse(res, 200, 'text/plain', 'reserved');
    } else {
        return sendResponse(res, 400, 'text/plain', "Can't schedule");
    }
}

//Cancel function
function cancel(qObj, res) {
	if (!qObj.name || !qObj.day || !qObj.time) { 
		return sendResponse(res, 400, 'text/plain', "Missing name, day, or time");
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

        return sendResponse(res, 200, 'text/plain', 'Appointment has been canceled');
    } else {
        return sendResponse(res, 404, 'text/plain', 'Appointment not found');
    }
}

//Check Availability function
function checkAvailability(qObj, res) {
    if (!qObj.day || !qObj.time) {
        return sendResponse(res, 400, 'text/plain', "Missing day or time");
    }

    if (availableTimes[qObj.day] && availableTimes[qObj.day].includes(qObj.time)) {
        return sendResponse(res, 200, 'text/plain', 'Time is available');
    } else {
        return sendResponse(res, 200, 'text/plain', 'Time is not available');
    }
}

//Create server
const myserver = http.createServer(function (req, res) {
    console.log(req.url);
    const urlObj = url.parse(req.url, true);
    const pathname = urlObj.pathname;

    switch (pathname) {
        case '/schedule':
            schedule(urlObj.query, res);
            break;
        case '/cancel':
            cancel(urlObj.query, res);
            break;
        case '/check':
            checkAvailability(urlObj.query, res);
            break;
        default:
            let filePath = '.' + pathname; 
            if (pathname === '/' || pathname === '') {
                filePath = './public_html/index.html';
            } else {
                filePath = './public_html' + pathname;
            }
            sendFile(filePath, res);
            break;
    }
});
const PORT = 80;
myserver.listen(PORT, function () {
    console.log('listening on port', PORT);
});

alert("Javascript is running!");

function getFormValues() {
    const name = document.getElementById('name').value;
    const day = document.getElementById('day').value;
    const time = document.getElementById('time').value;
    return { name, day, time };
}

// Display results
function showResult(text) {
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        resultsDiv.innerText = text;
    } else {
        alert(text);
    }
}

// Schedule button handler
const scheduleBtn = document.getElementById('scheduleBtn');
if (scheduleBtn) {
    scheduleBtn.addEventListener('click', function () {
        const { name, day, time } = getFormValues();
        // Basic client-side validation
        if (!name || !day || !time) {
            showResult('Please enter name, day, and time.');
            return;
        }
        const url = `/schedule?name=${encodeURIComponent(name)}&day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`;
        fetch(url)
            .then(resp => resp.text())
            .then(text => showResult(text))
            .catch(err => showResult('Error: ' + err));
    });
}

// Cancel button handler
const cancelBtn = document.getElementById('cancelBtn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
        const { name, day, time } = getFormValues();
        if (!name || !day || !time) {
            showResult('Please enter name, day, and time.');
            return;
        }
        const url = `/cancel?name=${encodeURIComponent(name)}&day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`;
        fetch(url)
            .then(resp => resp.text())
            .then(text => showResult(text))
            .catch(err => showResult('Error: ' + err));
    });
}

// Check availability button handler
const checkBtn = document.getElementById('checkBtn');
if (checkBtn) {
    checkBtn.addEventListener('click', function () {
        const day = document.getElementById('day').value;
        const time = document.getElementById('time').value;
        if (!day || !time) {
            showResult('Please enter day and time to check.');
            return;
        }
        const url = `/check?day=${encodeURIComponent(day)}&time=${encodeURIComponent(time)}`;
        fetch(url)
            .then(resp => resp.text())
            .then(text => showResult(text))
            .catch(err => showResult('Error: ' + err));
    });
}

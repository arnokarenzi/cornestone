let totalAmount = 0;
let totalLetters = 0;
const API_URL = 'http://localhost:3000/records'; // Adjust if your server is hosted elsewhere

document.addEventListener("DOMContentLoaded", function() {
    populateDaysLeft();
    loadRecords();
});

function populateDaysLeft() {
    const today = new Date();
    const currentDay = today.getDate();
    let daysLeft;

    if (currentDay <= 15) {
        daysLeft = 15 - currentDay;
    } else {
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        daysLeft = lastDayOfMonth - currentDay;
    }

    document.getElementById('numberOfDays').value = daysLeft;
    calculateLettersPerDay();
}

function calculateLettersPerDay() {
    const daysLeft = parseInt(document.getElementById('numberOfDays').value);
    const targetLetters = parseInt(document.getElementById('targetLetters').value);
    const lettersPerDay = Math.floor((targetLetters - totalLetters) / daysLeft);
    
    document.getElementById('lettersPerDayLabel').innerText = `Letters to do per day: ${lettersPerDay}`;
}

function loadRecords() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            data.forEach(record => {
                // Add record row before the total row
                addRecordRow(record.record_time, record.number_of_letters, record.amount, record.comments);
                totalLetters += record.number_of_letters;
                totalAmount += record.amount;
            });
            updateTotalRow();
            updateProgressBar();
        })
        .catch(error => console.error('Error loading records:', error));
}

function submitRecord() {
    const numberOfLetters = parseInt(document.getElementById('numberOfLetters').value);
    if (isNaN(numberOfLetters)) {
        alert("Please enter a valid number.");
        return;
    }
    const comments = document.getElementById('comments').value;
    const amount = numberOfLetters * 245;
    const recordTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const newRecord = { record_time: recordTime, number_of_letters: numberOfLetters, amount: amount, comments: comments };

    // Post the new record to the backend
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
    })
    .then(response => response.json())
    .then(data => {
        // Add record row to the table
        addRecordRow(recordTime, numberOfLetters, amount, comments);
        totalLetters += numberOfLetters;
        totalAmount += amount;
        updateTotalRow();
        updateProgressBar();
        calculateLettersPerDay();

        // Clear input fields
        document.getElementById('numberOfLetters').value = '';
        document.getElementById('comments').value = '';
        enableSubmitButton();
    })
    .catch(error => console.error('Error submitting record:', error));
}

function addRecordRow(recordTime, numberOfLetters, amount, comments) {
    const tableBody = document.getElementById('tableBody');
    const totalRow = document.getElementById('totalRow');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `<td>${recordTime}</td><td>${numberOfLetters}</td><td>${amount}</td><td>${comments}</td>`;
    tableBody.insertBefore(newRow, totalRow);
}

function updateTotalRow() {
    document.getElementById('totalLetters').innerText = totalLetters;
    document.getElementById('totalAmount').innerText = totalAmount;
}

function updateProgressBar() {
    const targetLetters = parseInt(document.getElementById('targetLetters').value);
    const progress = (totalLetters / targetLetters) * 100;
    
    const progressBar = document.getElementById('progress');
    progressBar.style.width = `${progress}%`;
    progressBar.innerText = `${Math.round(progress)}%`;
}

function resetTable() {
    const password = prompt("Enter Password to Reset Table:");
    const correctPassword = "Kimironko@1992";

    if (password === correctPassword) {
        // Call the backend to delete all records
        fetch(API_URL, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                totalAmount = 0;
                totalLetters = 0;
                document.getElementById('tableBody').innerHTML = `
                    <tr id="totalRow">
                        <td>Total</td>
                        <td id="totalLetters">0</td>
                        <td id="totalAmount">0</td>
                        <td></td>
                    </tr>`;
                updateProgressBar();
                calculateLettersPerDay();
                alert("Table reset successfully.");
            })
            .catch(error => console.error('Error resetting table:', error));
    } else {
        alert("Incorrect password. Table was not reset.");
    }
}

function enableSubmitButton() {
    const numberOfLetters = document.getElementById('numberOfLetters').value;
    document.getElementById('submitButton').disabled = numberOfLetters.trim() === '';
}

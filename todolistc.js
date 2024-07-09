const input = document.getElementsByClassName('input')[0]; // Get the first element with the class 'input'
const listContainer = document.getElementsByClassName('list-container')[0];

function addTask() {
    let noSpaceInput = input.value.trim();//make sureis there in nothing but space that it is counted as empty
    if (input.value === '' || noSpaceInput.length === 0) {
        alert("Please add a task.");
    } else {
        let li = document.createElement('li');
        li.innerText = input.value;
        listContainer.prepend(li);

        let span = document.createElement('span');
        span.innerHTML = "\u00D7"; // Use innerHTML to set HTML content correctly
        li.appendChild(span);

        span.addEventListener('click', function() {
            li.remove(); // Remove the parent li when span (delete button) is clicked
            saveData(); // Save data after removing
        });

        li.addEventListener('click', function() {
            li.classList.toggle('checked');
            saveData(); // Save data after toggling the checked class
        });
    }
    input.value = ''; // Clear input after adding task
    saveData(); // Save data after adding a new task
}

// Add task on Enter key press
document.getElementsByClassName('input')[0].addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        addTask();
    }
});
function setCookie(key, value, time) {
    let d = new Date();
    d.setTime(d.getTime() + (time * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();//toUTCstring turns date into string
    document.cookie = key + '=' + encodeURIComponent(value) + ';' + expires + ';path=/';
}

// Function to get the value of a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());//makes it correctly formatted
}


// Function to save data in a cookie
function saveData() {
    const value = listContainer.innerHTML;//get the html data
    setCookie("listData", value, 7); // Save the data for 7 days
}

// Function to load data from a cookie
function loadData() {
    const data = getCookie("listData") || ""; // Using logical OR to handle undefined or null case
    listContainer.innerHTML = data;


    let spans = listContainer.getElementsByTagName('span');

    // Loop through each <span> element
    for (let span of spans) {
        // Add a click event listener to each <span>
        span.addEventListener('click', function() {
            // Remove the parent <li> element when the <span> is clicked
            span.parentElement.remove();
            // Save the updated list to local storage
            saveData();
        });
    }
    
    
    
    // Get all the <li> elements inside the list container
    let lis = listContainer.getElementsByTagName('li');
    
    // Loop through each <li> element
    for (let li of lis) {
        // Add a click event listener to each <li>
        li.addEventListener('click', function() {
            // Toggle the 'checked' class on the <li> when it is clicked
            li.classList.toggle('checked');
            // Save the updated list to local storage
            saveData();
        });
    }
            };

window.onload = loadData;
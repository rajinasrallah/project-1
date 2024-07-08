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

// Save data in local storage
function saveData() {
    localStorage.setItem("data", listContainer.innerHTML);
}

// Show tasks from local storage
function showTasks() {
    listContainer.innerHTML = localStorage.getItem("data");
    // Add event listeners to the existing tasks
    // Get all the <span> elements inside the list container
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
    


showTasks();

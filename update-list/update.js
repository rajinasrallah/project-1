const input = document.getElementsByClassName('input')[0];
const listContainer = document.getElementsByClassName('list-container')[0];
var html5rocks = {};

function Addupdate() {
    // Create and append the modal
    let modal = document.createElement('div');
    modal.id = 'myModal';
    modal.className = 'modal';

    let modalContent = `
        <div class="modal-content">
            <p>Please enter a number from 1 to 3:</p>
            <div class="inputContainer">
                <input type="number" id="numberInput" min="1" max="3">
                <button id="popupAdd" onclick="submitNumber()">Submit</button>
            </div>
        </div>
    `;

    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Add styles for the modal
    let styles = `
        .modal {
            display: none; /* Hidden by default */
            position: fixed; /* Stay in place */
            z-index: 1; /* Sit on top */
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto; /* Enable scrolling if needed */
            background-color: rgba(0,0,0,0.4); /* Black with opacity */
        }

        .modal-content {
            background-color: #ffa8cb; /* Light pink background */
            margin: 10% auto; /* 10% from the top and centered */
            padding: 20px;
            width: 30%; /* Could be more or less, depending on screen size */
            border-radius: 10px; /* Rounded corners */
            color: #fff;
        }

        .inputContainer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 30px;
            background-color: rgb(248, 150, 167);
            width: 93%; /* Ensure the input container spans full width */
            padding: 10px;
            margin-bottom: 20px; /* Space between input and list */
        }

        #numberInput {
            flex: 1;
            border: none;
            border-radius: 30px;
            outline: none;
            padding: 12px;
            background-color: transparent;
            color: #fff;
            font-size: 16px;
        }

        #popupAdd {
            padding: 12px 20px;
            background-color: #ffb3b3;
            color: white;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            transition: background-color 0.3s ease; /* Smooth hover effect */
        }
    `;

    // Create a style element and append the styles
    let styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Function to open the modal
    function openModal() {
        modal.style.display = "block";
    }

    // Function to handle number submission and add task
    function submitNumber() {
        let numberInput = document.getElementById("numberInput").value;
        addTask(numberInput); // Call addTask with the number input
        modal.style.display = "none"; // Hide modal after submission
    }

    // Render a todo item in the DOM
    function renderTodo(row) {
        let li = document.createElement('li');
        li.innerText = row.text;

        if (row.color === '1') {
            li.style.color = 'green';
        } else if (row.color === '2') {
            li.style.color = 'yellow';
        } else {
            li.style.color = 'red';
        }

        if (row.checked) {
            li.classList.add('checked');
        }
        listContainer.prepend(li);

        let span = document.createElement('span');
        span.innerHTML = "\u00D7"; // Use innerHTML to set HTML content correctly
        li.appendChild(span);

        span.addEventListener('click', function() {
            html5rocks.indexedDB.deleteTodo(row.timeStamp); // Delete from IndexedDB
            li.remove(); // Remove the parent li when span (delete button) is clicked
        });

        li.addEventListener('click', function() {
            li.classList.toggle('checked');
            html5rocks.indexedDB.updateTodo(row.timeStamp, li.classList.contains('checked')); // Update checked state in IndexedDB
        });
    }

    // Add a new task to the list and IndexedDB
    function addTask(numberInput) {
        let noSpaceInput = input.value.trim();
        if (input.value === '' || noSpaceInput.length === 0) {
            alert("Please add a task.");
        } else {
            html5rocks.indexedDB.addTodo(input.value, numberInput); // Add to IndexedDB
        }
        input.value = ''; // Clear input after adding task
    }

    // Add task on Enter key press
    document.getElementsByClassName('input')[0].addEventListener('keydown', function(event) {
        if (event.keyCode === 13) {
            openModal();
        }
    });
}

// Set up IndexedDB based on browser compatibility
window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;

// Polyfill for webkitIndexedDB
if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
}

// Define html5rocks.indexedDB namespace and initialize database to null
html5rocks.indexedDB = {};
html5rocks.indexedDB.db = null;

// Error handler for IndexedDB operations
html5rocks.indexedDB.onerror = function(e) {
    console.log(e);
};

// Open the IndexedDB database
html5rocks.indexedDB.open = function() {
    var request = indexedDB.open("myDatabase", 2); // Change version as needed

    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        var transaction = event.target.transaction;
        var oldVersion = event.oldVersion;
        var newVersion = event.newVersion;

        // Perform migration steps based on the old version
        if (oldVersion < 1) {
            // Initial setup
            if (db.objectStoreNames.contains("todo")) {
                db.deleteObjectStore("todo");
            }
            db.createObjectStore("todo", { keyPath: "timeStamp" });
        }

        if (oldVersion < 1) {
            // Example migration for version 2
            var store = transaction.objectStore("todo");

            // Add a new index for better querying (if needed)
            store.createIndex("priority", "priority", { unique: false });

            // Migrate existing data (if needed)
            var dataToMigrate = [];

            store.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    var data = cursor.value;
                    // Modify data as needed for the new schema
                    data.newField = "defaultValue";
                    dataToMigrate.push(data);
                    cursor.continue();   
                } else {
                    // All data has been collected, now clear the store and re-add the modified data
                    store.clear().onsuccess = function() {
                        dataToMigrate.forEach(function(item) {
                            store.put(item);
                        });
                        Addupdate(); // Call Addupdate after migration
                    };
                }
            };
        }
        transaction.onerror = function(event) {
            console.error("Transaction error:", event.target.error);
        };
    };

    request.onerror = function(event) {
        console.error("Database error:", event.target.error);
    };

    request.onsuccess = function(event) {
        html5rocks.indexedDB.db = event.target.result;
        html5rocks.indexedDB.getAllTodoItems();
    };
};

// Add a new todo item to the IndexedDB
html5rocks.indexedDB.addTodo = function(todoText, isChecked = false) {
    var db = html5rocks.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    // Data to be stored
    var data = {
        "text": todoText,
        "timeStamp": new Date().getTime(),
        "checked": isChecked,
    };

    // Add the data to the object store
    var request = store.put(data);

    // Handle the success case
    request.onsuccess = function(e) {
        html5rocks.indexedDB.getAllTodoItems();
    };

    // Handle the error case
    request.onerror = function(e) {
        console.log("Error Adding: ", e);
    };
};

// Delete a todo item from the IndexedDB
html5rocks.indexedDB.deleteTodo = function(id) {
    var db = html5rocks.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    // Delete the item with the given id
    var request = store.delete(id);

    // Handle the success case
    request.onsuccess = function(e) {
        html5rocks.indexedDB.getAllTodoItems();
    };

    // Handle the error case
    request.onerror = function(e) {
        console.log("Error Deleting: ", e);
    };
};

// Get all todo items from the IndexedDB and render them
html5rocks.indexedDB.getAllTodoItems = function() {
    listContainer.innerHTML = "";

    var db = html5rocks.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    // Open cursor without a key range to get all records
    var cursorRequest = store.openCursor();

    // Handle the success case
    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if (!result) return; // if there are no results exit the function

        renderTodo(result.value);
        result.continue();
    };

    // Handle the error case
    cursorRequest.onerror = html5rocks.indexedDB.onerror;
};

// Render a todo item in the DOM
function renderTodo(row) {
    let li = document.createElement('li');
    li.innerText = row.text;

    if (row.checked) {
        li.classList.add('checked');
    }
    listContainer.prepend(li);

    let span = document.createElement('span');
    span.innerHTML = "\u00D7"; // Use innerHTML to set HTML content correctly
    li.appendChild(span);

    span.addEventListener('click', function() {
        html5rocks.indexedDB.deleteTodo(row.timeStamp); // Delete from IndexedDB
        li.remove(); // Remove the parent li when span (delete button) is clicked
    });

    li.addEventListener('click', function() {
        li.classList.toggle('checked');
        html5rocks.indexedDB.updateTodo(row.timeStamp, li.classList.contains('checked')); // Update checked state in IndexedDB
    });
}

// Update a todo item's checked state in the IndexedDB
html5rocks.indexedDB.updateTodo = function(id, isChecked) {
    var db = html5rocks.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    var request = store.get(id);
    request.onsuccess = function(e) {
        var data = e.target.result;
        data.checked = isChecked;

        var updateRequest = store.put(data);

        updateRequest.onsuccess = function() {
            html5rocks.indexedDB.getAllTodoItems();
        };

        updateRequest.onerror = function(e) {
            console.log("Error Updating: ", e);
        };
    };

    request.onerror = function(e) {
        console.log("Error Getting: ", e);
    };
};

// Add a new task to the list and IndexedDB
function addTask() {
    let noSpaceInput = input.value.trim();
    if (input.value === '' || noSpaceInput.length === 0) {
        alert("Please add a task.");
    } else {
        html5rocks.indexedDB.addTodo(input.value); // Add to IndexedDB
    }
    input.value = ''; // Clear input after adding task
}

// Add task on Enter key press
document.getElementsByClassName('input')[0].addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        addTask();
    }
});

// Initialize the application
function init() {
    html5rocks.indexedDB.open();
}

// Add an event listener to initialize the application when the DOM is loaded
window.addEventListener("DOMContentLoaded", init, false);

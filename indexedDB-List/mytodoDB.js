const input = document.getElementsByClassName('input')[0];
const listContainer = document.getElementsByClassName('list-container')[0];

var html5rocks = {};

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
    var version = 1;
    var request = indexedDB.open("todos", version);

    // Handle the case where the database needs to be upgraded
    request.onupgradeneeded = function(e) {
        var db = e.target.result;

        // Handle any errors in the version change transaction
        e.target.transaction.onerror = html5rocks.indexedDB.onerror;

        // Delete existing object store if it exists
        if (db.objectStoreNames.contains("todo")) {
            db.deleteObjectStore("todo");
        }

        // Create a new object store
        var store = db.createObjectStore("todo", { keyPath: "timeStamp" });
    };

    // Handle the success case when the database is opened
    request.onsuccess = function(e) {
        html5rocks.indexedDB.db = e.target.result;
        html5rocks.indexedDB.getAllTodoItems();
    };

    // Handle the error case when opening the database
    request.onerror = html5rocks.indexedDB.onerror;
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
        "checked": isChecked
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
    var cursorRequest = store.openCursor();//study this line

    // Handle the success case
    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if (!result) return;//if there are no results exit the function

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
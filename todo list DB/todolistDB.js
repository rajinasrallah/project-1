const input = document.getElementsByClassName('input')[0];
const listContainer = document.getElementsByClassName('list-container')[0];

function addTask() {
    let noSpaceInput = input.value.trim(); // Ensure input is not just spaces
    if (noSpaceInput === '') {
        alert("Please add a task.");
    } else {
        let li = document.createElement('li');
        li.innerText = noSpaceInput;
        listContainer.prepend(li);

        let span = document.createElement('span');
        span.innerHTML = "\u00D7"; // Use innerHTML to set HTML content correctly
        li.appendChild(span);

        span.addEventListener('click', function () {
            li.remove(); // Remove the parent li when span (delete button) is clicked
            saveData(); // Save data after removing
        });

        li.addEventListener('click', function () {
            li.classList.toggle('checked');
            saveData(); // Save data after toggling the checked class
        });

        input.value = ''; // Clear input after adding task
        saveData(); // Save data after adding a new task
    }
}

// Add task on Enter key press
input.addEventListener('keydown', function (event) {
    if (event.keyCode === 13) {
        addTask();
    }
});

// Create and open the IndexedDB database

const IDB = (function init() {
    let db = null;
    let DBOpenReq = indexedDB.open('listDB', 1);

    DBOpenReq.addEventListener('error', (err) => {
        console.warn('Error opening database:', err);
    });

    DBOpenReq.addEventListener('success', (ev) => {
        db = ev.target.result;
        console.log('Database opened successfully');
        loadData(); // Load data when database is opened successfully
    });

    DBOpenReq.addEventListener('upgradeneeded', (ev) => {
        db = ev.target.result;
        console.log('Database upgrade needed');
        let objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
    });

    function addItem(item) {
        if (!db) {
            console.log('Database is not opened yet');
            return;
        }
        let tx = db.transaction('tasks', 'readwrite');
        tx.oncomplete = (ev) => {
            console.log('Transaction completed', ev);
        };
        tx.onerror = (err) => {
            console.warn('Transaction error', err);
        };
        let store = tx.objectStore('tasks');
        let request = store.add(item);

        request.onsuccess = (ev) => {
            console.log('Data added successfully');
        };
        request.onerror = (err) => {
            console.log('Error adding data', err);
        };
    }

    function saveData() {
        if (!db) {
            console.log('Database is not opened yet');
            return;
        }
        let tx = db.transaction('tasks', 'readwrite');
        tx.oncomplete = (ev) => {
            console.log('Transaction completed', ev);
        };
        tx.onerror = (err) => {
            console.warn('Transaction error', err);
        };
        let store = tx.objectStore('tasks');
        store.clear(); // Clear the store before saving new data

        let tasks = Array.from(listContainer.getElementsByTagName('li')).map((task, index) => ({
            id: index + 1,
            text: task.innerText.replace('\u00D7', '').trim(),
            checked: task.classList.contains('checked')
        }));

        tasks.forEach(task => {
            let request = store.add(task);
            request.onsuccess = () => {
                console.log('Task saved:', task);
            };
            request.onerror = (err) => {
                console.warn('Error saving task:', err);
            };
        });
    }

    function loadData() {
        if (!db) {
            console.log('Database is not opened yet');
            return;
        }
        let tx = db.transaction('tasks', 'readonly');
        let store = tx.objectStore('tasks');
        let request = store.getAll();

        request.onsuccess = (ev) => {
            let tasks = ev.target.result;
            tasks.forEach(task => {
                let li = document.createElement('li');
                li.innerText = task.text;
                if (task.checked) {
                    li.classList.add('checked');
                }
                listContainer.appendChild(li);

                let span = document.createElement('span');
                span.innerHTML = "\u00D7";
                li.appendChild(span);

                span.addEventListener('click', function () {
                    li.remove();
                    saveData();
                });

                li.addEventListener('click', function () {
                    li.classList.toggle('checked');
                    saveData();
                });
            });
        };

        request.onerror = (err) => {
            console.warn('Error loading tasks:', err);
        };
    }

    return {
        addItem: addItem,
        saveData: saveData,
        loadData: loadData
    };
})();

// Example usage:
// Assuming 'listContainer' is an object you want to save
let list = {
    id: Date.now(), // Unique ID
    text: input.value
};

// Add listContainer to the database when a button is clicked
document.getElementById('addButton').addEventListener('click', () => {
    let list = {
        id: Date.now(),
        text: input.value
    };
    IDB.addItem(list);
    addTask();
});

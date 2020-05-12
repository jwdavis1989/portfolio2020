"use strict";

const id = _id => document.getElementById(_id);
let default_items = '';
let local_items = [];

document.querySelector("body").onload = main;


function main() {
    default_items = id('addKeywords-list').innerHTML;
    // get the items from the server as soon as the page loads
    getKeywordsItems();

    document.getElementById('addKeywords-form').onsubmit = (event) => {
        // preventDefault() stops the browser's default behavior of
        // sending the form data and refreshing the page
        event.preventDefault();

        processFormSubmit(event);

        return false;
    }

    
    document.getElementById('filter-form').onsubmit = (event) => {
        // preventDefault() stops the browser's default behavior of
        // sending the form data and refreshing the page
        event.preventDefault();

        processFilterSubmit(event);

        return false;
    }
}

async function processFormSubmit(event) {
    const text = id('addKeywords-item-text').value;
    id('addKeywords-item-text').value = '';
    if (text !== '' && text !== 'clear') {
        let type = id('addKeywords-item-type').value;
        console.log(`New item: ${text} ${type}`);
        const data = {
            text: text,
            type: type
        };
        
        // Send the new data to the server and processing the response
        try {
            const res = await fetch('http://40.122.146.213/keywords', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {"Content-Type": "application/json"}
            });
            
            console.log("POST /add_keyword: response");
            console.log(res);
            if (res.redirected) {
                return window.location = res.url;
            }

            if (res.status === 403) {
                alert("You can't do that");
            } else if (res.status === 200) {
                local_items.push(data);
                render();
            }
        } catch (err) {
            console.log(err);
        }
     
        
    }
}

function render() {
    const template = id('addKeywords-item-template');
    let list_elt = id('addKeywords-list');
    list_elt.innerHTML = '';
    for (let i = 0; i < local_items.length; ++i) {
        let new_li = document.importNode(template.content, true);
        new_li.querySelector('.addKeywords-item-text').textContent = local_items[i].text;
        new_li.querySelector('.addKeywords-item-type').textContent = local_items[i].type;
        list_elt.appendChild(new_li);
    }
}

function getKeywordsItems () {
    fetch('http://40.122.146.213/keywords', {
        method: 'GET'
    }).then( res => {
        console.log(res)
        return res.json();
    }).then( data => {
        // log the data
        console.log(data);
        // overwrite local keywords with the array of keywords
        // recieved from the server
        local_items = data.keywords;
        // render the list of items received from the server
        render();
    }).catch( err => {
        console.log(err);
    });
}

async function processFilterSubmit (event) {
    const type = id('addKeywords-filter-type').value;
    if (type === 'All') {
        getKeywordsItems();
    } else {
        filterAddKeywordsItems(type);
    }
}

async function filterAddKeywordsItems (type) {
    const res = await fetch(`http://40.122.146.213/keywords/${type}`, {
        method: 'GET'
    });
    console.log(res)
    if (res.status === 200) {
        const data = await res.json();
        // log the data
        console.log(data);
        // overwrite local_items with the array of keyword items
        // recieved from the server
        local_items = data.keywords;
        // render the list of items received from the server
        render();
    } else {
        alert(`${res.status}: ${res.statusText}`);
    }
    
}

async function generateSentence (event) {
    fetch('http://40.122.146.213/random', {
        method: 'GET'
    }).then( res => {
        console.log(res)
        return res.json();
    }).then( data => {
        // log the data
        console.log(data);
        // recieved from the server
        id('sentenceLocation').innerHTML = data.sentence;
        // render the list of items received from the server
        //Format InnerHTML

    }).catch( err => {
        console.log(err);
    });
}
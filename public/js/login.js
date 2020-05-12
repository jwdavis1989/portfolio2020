'use strict';

document.querySelector('body').onload = main;

function main () {
    document.getElementById('login-form').onsubmit = (event) => {
        event.preventDefault();
        sendPass();
        return false;
    }
}

async function sendPass () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const res = await fetch('http://40.122.146.213/login', {
        method: 'post',
        body: JSON.stringify({username, password}),
        headers: {'Content-Type': 'application/json'}
    });
    if (res.status === 200) {
        window.location = '/menu';
    } else if (res.status === 401) {
        alert('Incorrect username/password');
    } else {
        window.location = '/error';
    }
}
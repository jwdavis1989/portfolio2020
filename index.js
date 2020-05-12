const express        = require('express');
const app            = express();
const path           = require('path');
const createDAO      = require('./Models/dao');
const KeywordsModel  = require('./Models/KeywordsModel');
const UserModel      = require('./Models/UserModel');
const ImageModel     = require('./Models/ImageModel');
const AuthController = require('./Controllers/AuthController');
const winston        = require('winston');
const redis          = require('redis');
const session        = require('express-session');
const RedisStore     = require('connect-redis')(session);
const UserController = require('./Controllers/UserController');

const redisClient = redis.createClient();

const sess = session({
    store: new RedisStore({ 
        client: redisClient, // our redis client
        host: 'localhost',   // redis is running locally on our VM (we don't want anyone accessing it)
        port: 6379,          // 6379 is the default redis port (you don't have to set this unless you change port)
        ttl: 12 * 60 * 60,   // Time-To-Live (in seconds) this will expire the session in 12 hours
    }),
    secret: 'astate web-dev', // Use a random string for this in production
    resave: false, 
    cookie: {
        httpOnly: true,
    },
    saveUninitialized: false, // set this to false so we can control when the cookie is set (i.e. when the user succesfully logs in)
});

// This parses the cookie from client's request
// it parse the cookie before any routes are handled or 
// application middleware kicks in
app.use(sess);

/*
        Initialize logger
*/
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json(),
    ),
    transports: [
      new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: './logs/info.log' })
    ]
});

const dbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'Keywords.db');
let Keywords = undefined;
let Auth   = undefined;

// Gives direct access to GET files from the
// "public" directory (you can name the directory anything)
app.use(express.static('public'));

// We add this to the middleware so it logs every request
// don't do this in production since it will log EVERYTHING (including passwords)
app.use((req, res, next) => {
    logger.info(`${req.ip}|${req.method}|${req.body || ""}|${req.originalUrl}`);
    next();
});

// We need this line so express can parse the POST data the browser
// automatically sends
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const badIPS = {};

app.get('/', (req, res, next) => {
    if (!req.session.name) {
        req.session.name  = req.query.name;
    }
    req.session.views = req.session.views ? req.session.views+1 : 1;

    console.log(`current views:`);
    console.log(req.session);
    next();
});

app.use('*', (req, res, next) => {
    if (badIPS[req.ip] >= 10) {
        return res.sendStatus(403);
    }
    next();
});

app.all('/account/:userID/*', (req, res, next) => {
    console.log(req.params)
    if (req.session.isVerified && req.params.userID === req.session.userID) {
        next();
    } else {
        // Rate limiting
        badIPS[req.ip] = badIPS[req.ip] ? badIPS[req.ip]+1 : 1;
        console.log(badIPS);
        res.sendStatus(403); // HTTP 403 Forbidden
    }
});

// All information associated with a user account
app.get('/account/:userID/info', (req, res) => {
    // TODO: retrieve account information and send back to client
    res.send('info')
});

app.post('/account/:userID/passwordReset', (req, res) => {
    // TODO: update password
    res.send('reset password')
});

app.post('/account/:userID/username', (req, res) => {
    // TODO: update username
    res.send('update username')
});

app.delete('/account/:userID/user', (req, res) => {
    // TODO: delete user from db
    res.send('delete user')
});

// Default route
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get("/keywords_list", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/addKeywords.html'));
});

//Serve up Gallery Page
app.get("/view_gallery/:userID", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/gallery.html'));
});

app.get("/view_gallery", (req, res) => {
    res.redirect(`/view_gallery/${req.session.userID}`);
});


/*
        Getting keyword list
        all and filtering
*/
app.get("/keywords", errorHandler(async (req, res) => {
    const rows = await Keywords.getAll();
    res.send(JSON.stringify({keywords: rows}));
}));

//Populate gallery images when viewing someone's gallery
app.get("/gallery/:userID", errorHandler(async (req, res) => {
    const userID = req.params.userID;
    const rows = await Images.getAllWithUUID(userID);
    res.send(JSON.stringify({images: rows}));
}));


app.get("/keywords/:type", errorHandler(async (req, res) => {
    const type = req.params.type;
    const validPriorities = ['Subject', 'Verb', 'Adjective', 'Location'];
    if (!validPriorities.includes(type)) {
        return res.sendStatus(400);
    }
    const rows = await Keywords.getAllWithType(type);
    res.send(JSON.stringify({keywords: rows}));
}));

//Randomly constructs a sentence, then returns it
app.get("/random", errorHandler(async (req, res) => {
    const adjective1    = await Keywords.getRandomWithType('Adjective');
    const subject1       = await Keywords.getRandomWithType('Subject');
    const subject2       = await Keywords.getRandomWithType('Subject');
    const verb1         = await Keywords.getRandomWithType('Verb');
    const verb2         = await Keywords.getRandomWithType('Verb');
    const adjective2    = await Keywords.getRandomWithType('Adjective');
    const location      = await Keywords.getRandomWithType('Location');

    //Create the sentence <adj1><subject><verb><adj2><location>
    var sentence = '';
    const structure = Math.floor(Math.random() * 3);
    switch(structure){
        case 0: 
            sentence = `${adjective1[0].text} ${subject1[0].text} ${verb1[0].text} in ${adjective2[0].text} ${location[0].text}.`;
            break;
        case 1: 
            sentence = `${adjective1[0].text} ${subject1[0].text}s who ${verb1[0].text} near ${adjective2[0].text} ${location[0].text} also ${verb2[0].text}.`;
            break;
        case 2: 
            sentence = `${subject1[0].text} ${verb1[0].text} and ${verb2[0].text} ${adjective2[0].text} ${subject2[0].text}.`;
            break;
    };

    res.send(JSON.stringify({sentence: sentence}));
}));

/*
        Adding keywords
*/
app.post("/keywords", errorHandler( async (req, res) => {
    // This prevents adding new items unless you are authenticated
    // essentially it provides read-only access to the keywords
    // for unauthenticated users
    if (!req.session.isVerified) {
        return res.sendStatus(403);
    }
    const data = req.body;
    console.log(data);
    await Keywords.add(data.text, data.type);
    res.sendStatus(200);
}));

app.post("/logout", (req, res) => {
    req.session.isVerified = false;
    res.sendStatus(200);
});

//Upload new image to your gallery
app.post("/gallery", errorHandler( async (req, res) => {
    // This prevents adding new items unless you are authenticated
    // essentially it provides read-only access to the keywords
    // for unauthenticated users
    if (!req.session.isVerified) {
        return res.sendStatus(403);
    }
    const data = req.body;
    console.log(data);
    await Images.add(req.session.userID, data.title, data.image);
    res.sendStatus(200);
}));


/*
        Account Registration
*/
app.get("/register", errorHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "register.html"));
}));

app.post("/register", errorHandler(async (req, res) => {
    const body = req.body;
    if (body === undefined || (!body.username || !body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = body;
    try {
        await Auth.register(username, password);
        res.sendStatus(200);
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            console.error(err);
            logger.error(err);
            res.sendStatus(409); // 409 Conflict
        } else {
            throw err;
        }
    }
}));

/*
        User Login
*/
app.get("/login", errorHandler(async (req, res) => {
    if (req.session.isVerified) {
        res.redirect("/keywords_list");
    } else {
        res.sendFile(path.join(__dirname, "public", "html", "login.html"));
    }
}));

app.post("/login", errorHandler( async (req, res) => {
    if (req.body === undefined || (!req.body.username || !req.body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = req.body;
    const isVerified = await Auth.login(username, password);
    const status = isVerified ? 200 : 401;
    req.session.isVerified = isVerified;
    // TODO: Set the user's ID on their session object
    if (isVerified) {
        req.session.username = username;
        req.session.uuid = await UserController.getUserID(username);
    }
    res.sendStatus(status);
}));

/*
        Error Pages
*/
// This sends back the error page
app.get('/error', (req, res) => res.sendFile(path.join(__dirname, 'public', 'html', 'error.html')));
// which hits this route to get a random error gif
app.get('/error_background', (req, res) => {
    const gifNum = Math.floor(Math.random() * 10) + 1;
    res.sendFile(path.join(__dirname, 'public', 'error_gifs', `error${gifNum}.gif`));
});



// Listen on port 80 (Default HTTP port)
app.listen(80, async () => {
    // wait until the db is initialized and all models are initialized
    await initDB();
    // Then log that the we're listening on port 80
    console.log("Listening on port 80.");
});

async function initDB () {
    const dao = await createDAO(dbFilePath);
    Keywords = new KeywordsModel(dao);
    await Keywords.createTable();
    Users = new UserModel(dao);
    await Users.createTable();
    Auth = new AuthController(dao);
    Images = new ImageModel(dao);
    await Images.createTable();
}

// This is our default error handler (the error handler must be last)
// it just logs the call stack and send back status 500
app.use(function (err, req, res, next) {
    console.error(err.stack)
    logger.error(err);
    res.redirect('/error');
});

// We just use this to catch any error in our routes so they hit our default
// error handler. We only need to wrap async functions being used in routes
function errorHandler (fn) {
    return function(req, res, next) {
      return fn(req, res, next).catch(next);
    };
};
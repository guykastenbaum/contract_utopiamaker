const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();
const winston = require('winston');

const { main, getInitStatus, createProject, getProjectCount } = require('../dist/app.js');

const app = express();
const port = 4000;

app.use(cors());

const logger = winston.createLogger({
  level: 'error', // Minimum log level to capture (e.g., error and above)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'error.log', level: 'error' }) // Log to file
  ]
});

//CREATE THE MAIN CONTRACT
var contract;

async function getContract(){
  let error = null;
  contract = await main().catch((err) => error = err);
  if(contract && !error) app.locals.contract = contract;
}

console.log("getContract");
getContract();

//REQUIRE THE HANDLERS FOR ROUTES

const loginApi = require('./routes/login.js');
const projectsApi = require('./routes/projects.js');
const transactionsApi = require('./routes/transactions.js');
const usersApi = require('./routes/users.js');
const contributorsApi = require('./routes/contributors.js');
const validatorsApi = require('./routes/validators.js');

//ROUTES
app.use('/login', loginApi);
app.use('/projects', projectsApi);
app.use('/transactions', transactionsApi);
app.use('/users', usersApi);
app.use('/contributors', contributorsApi);
app.use('/validators',validatorsApi);

app.use((err, req, res, next) => {
  logger.error(err.stack); // Log the error stack trace
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

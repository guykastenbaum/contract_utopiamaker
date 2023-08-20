const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { main, getInitStatus, createProject, getProjectCount } = require('../dist/app.js');

const app = express();
const port = 4000;

app.use(cors());

//CREATE THE MAIN CONTRACT
var contract;

async function getContract(){
  let error = null;
  contract = await main().catch((err) => error = err);
  if(contract && !error) app.locals.contract = contract;
}

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

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
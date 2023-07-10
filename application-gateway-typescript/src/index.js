const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { connect, Contract, Identity, Signer, signers } = require('@hyperledger/fabric-gateway');
const { main, getUserCount, getInitStatus, createUser, getUser, createProject, getProjectCount, getProject } = require('../dist/app.js');

const app = express();
const port = 4000;

app.use(cors());

var contract;

async function getContract(){
  contract = await main();
}

getContract();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/signup', jsonParser, async (req, res) =>{
  const {name, email, password} = req.body;
  if(await getInitStatus(contract)){
    // var count = await getUserCount(contract);
    var user = {name: name, email: email, password: password};
    var userId = await createUser(contract, user);
    // await getUser(contract, userId);
    res.status(200).send({userId: userId}); 
  }else{
    res.status(400).send('Error'); 
  }
})

app.post('/assets', async (req, res)=> {
  let result = await getProject(contract);
  res.send(result);
});

app.post('/projects/create', jsonParser, async (req, res) =>{
  const {userId, userPass} = req.body;
  if(await getInitStatus(contract)){
    // await createProject(contract);
    let projectCount = await getProjectCount(contract);
    let newProject ={
      projectId: 'project'+projectCount,
      creationTimestamp: (Date.now()+120000)+'',
      startTimestamp: Date.now()+'',
      description: 'Example description',
      ownerId: userId,
      members: userId,
      validators: userId,
      ownerPass: userPass,
      finishTimestamp: (Date.now()+60000)+'',
    };
    await createProject(contract, newProject);
    res.send({data: 'ok'});
  }else{
    res.status(400).send('Error');
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
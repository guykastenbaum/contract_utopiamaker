const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { main, getUserCount, getInitStatus, createUser, getUser, createProject, getProjectCount, getProject } = require('../../dist/app.js');

router.post('/create', jsonParser, async (req, res) =>{
    var contract = req.app.locals.contract;
    const {name, creation, startDate, description, ownerId, ownerPass, endDate} = req.body;
    if(await getInitStatus(contract)){
      // await createProject(contract);
      let projectCount = await getProjectCount(contract);
      let newProject = {
        name : name,
        creation: creation,
        startDate: startDate,
        description: description,
        ownerId: ownerId,
        ownerPass: ownerPass,
        endDate: endDate
      };
      let projectId = await createProject(contract, newProject);
      res.status(200).send({projectId: projectId});
    }else{
      res.status(400).send('Error');
    }
  });

router.get('/:projectId', async (req, res) => {
    let projectId = req.params.projectId;
    var contract = req.app.locals.contract;
    if(await getInitStatus(contract)){
        let project = await getProject(contract, projectId);
        res.status(200).send(project);
    }else{
        res.status(400).send('Error');
    }
});

module.exports = router;
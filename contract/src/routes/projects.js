const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { getInitStatus, getUser, createProject, getProjectCount, getProject } = require('../../dist/app.js');

router.post('/create', jsonParser, async (req, res) =>{
    var contract = req.app.locals.contract;
    const {name, creation, startDate, description, ownerId, ownerPass, endDate} = req.body;
    if(await getInitStatus(contract)){
      let newProject = {
        name : name,
        creation: creation,
        startDate: startDate,
        description: description,
        ownerId: ownerId,
        ownerPass: ownerPass,
        endDate: endDate
      };
      let error = null;
      let projectId = await createProject(contract, newProject).catch((err) => {
        error = err;
      });
      if(projectId && !error){
        res.status(200).send({projectId: projectId});
      }else{
        res.status(400).send({error})
      }
    }else{
      res.status(400).send('Error');
    }
  });

router.get('/:projectId', async (req, res) => {
    let projectId = req.params.projectId;
    var contract = req.app.locals.contract;
    if(await getInitStatus(contract)){
        let error = null;
        let project = await getProject(contract, projectId).catch(err => error = err);
        if(project && !error){
          res.status(200).send(project);
        }else{
          res.status(404).send(error);
        }
    }else{
        res.status(400).send('Error');
    }
});

router.get('/user/:userId', async (req, res) => {
    var contract = req.app.locals.contract;
    const userId = req.params.userId;
    var projects = {
        projectsCreator: [],
        projectsContributor: [],
        projectsValidator: [],
    }
    if(await getInitStatus(contract)){
        let userError = null;
        let user = await getUser(contract, userId).catch(err => userError = err);
        const projectContributorPromises = user.projectsContributor.map(async (element) => {
            let prjError = null;
            let prj = await getProject(contract, element).catch(err => prjError = err);
            if(prj && !prjError){
              return prj;
            }else{
              return null;
            }
        });

        const projectValidatorPromises = user.projectsValidator.map(async (element) => {
          let prjError = null;
          let prj = await getProject(contract, element).catch(err => prjError = err);
          if(prj && !prjError){
            return prj;
          }else{
            return null;
          }
        });
        console.log("===================");
        
        const projectCreatorPromises = user.projectsCreator.map(async (element) => {
          let prjError = null;
          let prj = await getProject(contract, element).catch(err => prjError = err);
          if(prj && !prjError){
            return prj;
          }else{
            return null;
          }
        });

        projects.projectsContributor = await Promise.all(projectContributorPromises);
        projects.projectsValidator = await Promise.all(projectValidatorPromises);
        projects.projectsCreator = await Promise.all(projectCreatorPromises);
        res.status(200).send(projects);
    }else{
        res.status(400).send('Error');
    }
})

module.exports = router;
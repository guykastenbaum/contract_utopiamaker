const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { main, getInitStatus, getUserByEmail, getUser, getProject, sha256Hash} = require('../../dist/app.js');

router.get('/contributor/names/:userId', async (req, res) => {
  var contract = req.app.locals.contract;
  const userId = req.params.userId;
  var projectsNames = [];
  if(await getInitStatus(contract)){
    let user = await getUser(contract, userId).catch((error) => {
      res.status(204).send({message: error.message});
    });
    if(user){
      try {
        const projectPromises = user.projectsContributor.map(async (element) => {
          let prj = await getProject(contract, element);
          return prj.name;
        });

        projectsNames = await Promise.all(projectPromises);
        res.status(200).send(projectsNames);
      } catch (error) {
        res.status(500).send({ message: "Error fetching project names" });
      }
    }else{
      res.status(404).send({message: "This user doesn't exist"})
    }
  }else{
    res.status(500).send('Error'); 
  }
})

router.get('/:userId', async (req, res) => {
    var contract = req.app.locals.contract;
    const userId = req.params.userId;
    if(await getInitStatus(contract)){
      let error = null;
      let user = await getUser(contract, userId).catch((err) => {error = err});
      if(user && !error){
       res.status(200).send(user);
      }else{
        res.status(204).send({message: error.message});
      }
    }else{
      res.status(500).send('Error'); 
    }
})

router.post('/get', jsonParser, async (req, res) =>{
    var contract = req.app.locals.contract;
    const {email} = req.body;
    if(await getInitStatus(contract)){
      let userId = await getUserByEmail(contract, email).catch((error) => {
        res.status(204).send({message: error.message});
      });
      if(userId) res.status(200).send({userId: userId});
    }else{
      res.status(500).send('Error'); 
    }
})

module.exports = router
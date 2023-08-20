const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { main, getInitStatus, addContributor, sha256Hash, getUserByEmail, getUser} = require('../../dist/app.js');


router.post('/add', jsonParser, async (req, res) =>{
    var contract = req.app.locals.contract;
    const {userId, userPass, contributorEmail, projectId} = req.body;
    if(await getInitStatus(contract)){
      let error = null;
      let contributorId = await getUserByEmail(contract, contributorEmail).catch(err => error = err);
      if(contributorId && !error){
        let contributorUser = await getUser(contract, contributorId).catch(err => error = err);
        if(contributorUser && !error){
          const checkProjectId = element => element === projectId;
          if(contributorUser.projectsContributor.some(checkProjectId)){
            res.status(202).send({message: "The user already is Contributor"});
          }else{
            await addContributor(contract, projectId, userId, userPass, contributorId).then( (response) => {
                res.status(200).send({message: 'User added as Contributor successfully', contributorId: contributorId})
              }).catch((error) => {res.status(400).send(error.message)}); 
          }
        }
      }else{
        res.status(202).send({message: "The user doesn't exist"});
      }
    }else{
      res.status(500).send('Error'); 
    }
})

module.exports = router
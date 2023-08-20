const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { main, getInitStatus, addContributor, sha256Hash, getUserByEmail, getUser, addValidator, validateTransaction} = require('../../dist/app.js');


router.post('/add', jsonParser, async (req, res) =>{
    var contract = req.app.locals.contract;
    const {userId, userPass, validatorEmail, projectId} = req.body;
    if(await getInitStatus(contract)){
      let error = null;
      let validatorId = await getUserByEmail(contract, validatorEmail).catch(err => error = err);
      if(validatorId && !error){
        let validatorUser = await getUser(contract, validatorId).catch(err => error = err);
        if(validatorUser && !error){
          const checkProjectId = element => element === projectId;
          if(validatorUser.projectsValidator.some(checkProjectId)){
            res.status(202).send({message: "The user already is Validator"});
          }else{
            await addValidator(contract, projectId, userId, userPass, validatorId).then( (response) => {
                res.status(200).send({message: 'User added as Validator successfully', validatorId: validatorId})
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

router.post('/validate', jsonParser, async (req, res) => {
  var contract = req.app.locals.contract;
  const {transactionId, validatorId, validatorPass, timestamp} = req.body;
  if(await getInitStatus(contract)){
    await validateTransaction(contract, {transactionId,validatorId,validatorPass,timestamp}).then((response) => {
      res.status(200).send({response})
    }).catch((error) => {
      res.status(400).send({error})
    });
  }else{
    res.status(500).send('Error'); 
  }
})

module.exports = router
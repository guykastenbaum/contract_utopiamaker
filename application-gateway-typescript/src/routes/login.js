const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { main, getInitStatus, createUser, getUserByEmail, getUser, sha256Hash} = require('../../dist/app.js');


router.post('/signup', jsonParser, async (req, res) =>{
    var contract = req.app.locals.contract;
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

router.post('/signin', jsonParser, async (req, res) =>{
    var contract = req.app.locals.contract;
    const {email, password} = req.body;
    if(await getInitStatus(contract)){
      // var count = await getUserCount(contract);
      let error = null;
      let userId = await getUserByEmail(contract, email).catch(err => error = err);
      // console.log(userId);
      if(userId && !error){
        let userData = await getUser(contract, userId);
        if(sha256Hash(password) == userData.password){
          res.status(200).send({userId: userId, name: userData.name, projectsCreator: userData.projectsCreator, projectsContributor: userData.projectsContributor, projectsValidator: userData.projectsValidator, message: "Login successfully!"}); 
        }else{
          res.status(400).send({message: "Wrong password!"});
        }
      }else{
        res.status(400).send({message: "The user does't exist"});
      }
    }else{
      res.status(400).send('Error'); 
    }
})

module.exports = router
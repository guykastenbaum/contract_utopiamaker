const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { main, getInitStatus, getUserByEmail, getUser, sha256Hash} = require('../../dist/app.js');

router.get('/:userId', async (req, res) => {
    var contract = req.app.locals.contract;
    const userId = req.params.userId;
    if(await getInitStatus(contract)){
      // var count = await getUserCount(contract);
      let user = await getUser(contract, userId).catch((error) => {
        res.status(204).send({message: error.message});
      });
      if(user) res.status(200).send(user);
    }else{
      res.status(500).send('Error'); 
    }
})

router.post('/get', jsonParser, async (req, res) =>{
    var contract = req.app.locals.contract;
    const {email} = req.body;
    if(await getInitStatus(contract)){
      // var count = await getUserCount(contract);
      let userId = await getUserByEmail(contract, email).catch((error) => {
        res.status(204).send({message: error.message});
      });
      if(userId) res.status(200).send({userId: userId});
    }else{
      res.status(500).send('Error'); 
    }
})

module.exports = router
const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { getInitStatus, getTransactionCount, getTransaction } = require('../../dist/app.js');

router.post('/', async (req, res) =>{
    var contract = req.app.locals.contract;
    if(await getInitStatus(contract)){
        await getTransactionCount(contract);
        res.status(200).send({message: 'ok'});
    }else{
        res.status(400).send('Error');
    }
})

router.post('/get', )

module.exports = router;

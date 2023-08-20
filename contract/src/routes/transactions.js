const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

const { getInitStatus, createTransaction, getTransaction, getProject, getUser } = require('../../dist/app.js');

router.post('/create', jsonParser, async (req, res) =>{
    var contract = req.app.locals.contract;
    let error = null;
    const {projectId, userId, userPass, assets, timestamp} = req.body;
    if(await getInitStatus(contract)){
        let transactionId = await createTransaction(contract, {projectId: projectId, userId: userId, userPass: userPass, assets: JSON.stringify(assets), timestamp: timestamp+""}).catch(err => error = err)
        console.log(error);
        if(transactionId && !error){
            res.status(200).send({message: 'success', id: transactionId});
        }else{
            res.status(202).send({error});
        }
    }else{
        res.status(400).send('Error');
    }
})

router.get('/user/:userId', async (req, res) => {
    var contract = req.app.locals.contract;
    let error = null;
    const userId = req.params.userId;
    if(await getInitStatus(contract)){
        let user = await getUser(contract, userId);
        let projects = [];
        let transactions = [];
        try {
            const projectPromises = user.projectsContributor.map(async (element) => {
                let prj = await getProject(contract, element);
                return prj;
            });
    
            projects = await Promise.all(projectPromises);

            const transactionsPromises = projects.map( async (project) => {
                const transactionsIdsPromises = project.transactions.map( async (transactionId) =>{
                    let transaction = await getTransaction(contract, transactionId).catch(err => error = err);
                    return transaction;
                })
                const aux = await Promise.all(transactionsIdsPromises);
                transactions.push(aux);
            })

            await Promise.all(transactionsPromises);

            console.log(transactions);
            res.status(200).send({message: "success", data: transactions});
        } catch (error) {
            console.log(error)
            res.status(500).send({ message: "Error fetching project names" });
        }
    }else{
        res.status(400).send('Error');
    }
})

router.get("/:transactionId", async (req, res) => {
    var contract = req.app.locals.contract;
    let error = null;
    const transactionId = req.params.transactionId;
    if(await getInitStatus(contract)){
        let transaction = await getTransaction(contract, transactionId).catch(err => error = err);
        if(transaction && !error){
            res.status(200).send({transaction});
        }else{
            res.status(400).send({error})
        }
    }else{
        res.status(400).send('Error');
    }
})

module.exports = router;

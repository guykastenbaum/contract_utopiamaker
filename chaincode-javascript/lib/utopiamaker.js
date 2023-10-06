/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';



const stringify  = require('json-stringify-deterministic');
//const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');
//const shim = require('fabric-shim'); //notused


async function readState(ctx, id) {
	const assetBuffer = await ctx.stub.getState(id);
	if (!assetBuffer || assetBuffer.length === 0) {
		throw new Error(`The asset ${id} does not exist`);
	}
	const assetString = assetBuffer.toString();
	const asset = JSON.parse(assetString);
	  if (
	    asset !== null            &&
	    typeof asset === 'object' &&
	    'type' in asset           &&
	    asset.type === 'Buffer'   &&
	    'data' in asset           &&
	    Array.isArray(asset.data)) {
	    return new Buffer(asset.data);
	  }
	return asset;
}


function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}


class Utopiamaker extends Contract {
    
    async Init(ctx){
        const initialized = await ctx.stub.getState('initialized');
        if (!initialized || initialized.length === 0) {
		await ctx.stub.putState('initialized', Buffer.from(stringify({status:true})));
           await ctx.stub.putState('initialized',Buffer.from(JSON.stringify({status:'true'})));
           await ctx.stub.putState('userCount',Buffer.from(JSON.stringify({count:0})));
           await ctx.stub.putState('projectCount',Buffer.from(JSON.stringify({count:0})));
           await ctx.stub.putState('transactionCount',Buffer.from(JSON.stringify({count:0})));
           await ctx.stub.putState('mapEmailToUser',Buffer.from(JSON.stringify({})));
	//shim.success(Buffer.from('Initialized Successfully!'));
//            throw new Error('the contract was initialized'+initialized);
        } else {
            throw new Error(`Yet the contract was initialized`);
        }

    }

    async CreateUser(ctx, name, email, password) {
        
        if(name == ""){
            throw new Error('Name cannot be empty');
        }
        const validRegexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!validRegexEmail.test(email)) {
            throw new Error('Email is invalid');
        }
        const validRegexPassword = /^[a-f0-9]{64}$/gi;
        if(!validRegexPassword.test(password)){
            throw new Error('Password is invalid');
        }
        var mapEmailToUser = await readState(ctx, 'mapEmailToUser');//
        if(mapEmailToUser[email] !== undefined){
            throw new Error('Yet the email is registered');
        };
        var currentCount = await readState(ctx, 'userCount');
        const newCount = parseInt(currentCount.count)+1;
        const id = 'user'.concat(currentCount.count);
        const userData = {
            id: id,
            name: name,
            email: email,
            password: password,
            projectsCreator: [],
            projectsContributor: [],
            projectsValidator: []
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(userData)));
        await ctx.stub.putState('userCount', JSON.stringify({count:newCount}));
        mapEmailToUser[email] = id;
        await ctx.stub.putState('mapEmailToUser', JSON.stringify(mapEmailToUser));
        return id;
    }

    async CreateProject(ctx, name, startDate, endDate, description, creatorId, password, timestamp) {
        if(name == "" || description == ""){
            throw new Error('Name and description cannot be empty');
        }
        if(timestamp < startDate || startDate < endDate || endDate < 1924992000){
            throw new Error('Dates are not valid');
        }
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        var creatorData = await readState(ctx, creatorId);
        if(creatorId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(creatorId.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(creatorId.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(creatorData.password != password){
            throw new Error('Wrong password');
        }

        const currentCount = await readState(ctx, 'projectCount');
        const newCount = parseInt(currentCount.count)+1;
        const id = 'project'.concat(currentCount.count);
        const project = {
            id: id,
            name: name,
            description: description,
            timestamp: timestamp,
            startDate: startDate,
            endDate: endDate,
            creator: creatorId,
            contributors: [creatorId],
            validators: [creatorId],
            assets:[],
            transactions: [],
            requestUsers: []
        };
        creatorData.projectsCreator.push(id);
        creatorData.projectsContributor.push(id);
        creatorData.projectsValidator.push(id);
        await ctx.stub.putState(creatorId, JSON.stringify(creatorData));


        await ctx.stub.putState(id, JSON.stringify(project));
        await ctx.stub.putState('projectCount', JSON.stringify({count:newCount}));
        return id;
    }

    async CreateTransaction(ctx, projectId, userId, password, assets, timestamp) {
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        if(userId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(userId.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(userId.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(userData.password != password){
            throw new Error('Wrong password');
        }
        const queryProjectCount = await ctx.stub.getState('projectCount');
        const projectCountInt = parseInt(queryProjectCount.count);
        const projectData = await readState(ctx, projectId);
        if(projectId.substring(0,7) != "project"){
            throw new Error('Wrong syntaxis of project');
        }
        if(isNaN(parseInt(projectId.substring(7))) ){
            throw new Error('Wrong syntaxis of project');
        }
        if(projectCountInt < parseInt(projectId.substring(7))){
            throw new Error('Project doesnt exist');
        }
        if(timestamp < projectData.endDate || timestamp > projectData.startDate){
            throw new Error('Out of time for project');
        }
        let checkContributor = false;
        
        projectData.contributors.every(element => {
            if(element == userId){
                checkContributor = true;
                return false;
            }
        });
        if(!checkContributor){
            throw new Error('You are not a contributor');
        }
        var currentCount = await readState(ctx, 'transactionCount');
        const newCount = parseInt(currentCount.count)+1;
        const id = 'transaction'.concat(currentCount.count);
        const transaction = {
            id: id,
            projectId: projectId,
            user: userId,
            timestamp: timestamp,
            assets: JSON.parse(assets),
            statusValidate: false,
            timestampValidation: null,
            validatedBy: null
        };
        await ctx.stub.putState(id, JSON.stringify(transaction));
        await ctx.stub.putState('transactionCount', JSON.stringify({count:newCount}));
        projectData.transactions.push(id);
        await ctx.stub.putState(projectData.id, JSON.stringify(projectData));
        return id;
    }

    async UpdateEmail(ctx, userId, password, newEmail) {
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        if(userId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(userId.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(userId.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(userData.password != password){
            throw new Error('Wrong password');
        }
        const validRegexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!validRegexEmail.test(newEmail)) {
            throw new Error('Email is invalid');
        }
        let oldEmail = userData.email;
        userData.email = newEmail;
        await ctx.stub.putState(userId, JSON.stringify(userData));
        var mapEmailToUser = await readState(ctx, 'mapEmailToUser');
        delete mapEmailToUser[oldEmail];
        mapEmailToUser[newEmail] = userId;
        await ctx.stub.putState('mapEmailToUser', JSON.stringify(mapEmailToUser));
    }

    async UpdatePassword(ctx, userId, oldPassword, newPassword) {
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        if(userId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(userId.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(userId.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(userData.password != oldPassword){
            throw new Error('Wrong password');
        }
        const validRegexPassword = /^[a-f0-9]{64}$/gi;
        if(!validRegexPassword.test(newPassword)){
            throw new Error('Password is invalid');
        }
        userData.password = newPassword;
        await ctx.stub.putState(userId, JSON.stringify(userData));
    }


    async ValidateTransaction(ctx, transactionId, userId, password, timestamp) {
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        if(userId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(userId.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(userId.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(userData.password != password){
            throw new Error('Wrong password');
        }
        const queryTransactionCount = await ctx.stub.getState('transactionCount');
        const transactionCountInt = parseInt(queryTransactionCount.count);
        const transactionData = await readState(ctx, transactionId);
        if(transactionData.statusValidate == true){
            throw new Error('Yet the transaction was validated');
        }
        if(transactionId.substring(0,11) != "transaction"){
            throw new Error('Wrong syntaxis of transaction');
        }
        if(isNaN(parseInt(transactionId.substring(11))) ){
            throw new Error('Wrong syntaxis of transaction');
        }
        if(transactionCountInt < parseInt(transactionId.substring(11))){
            throw new Error('transaction doesnt exist');
        }
        var projectData = await readState(ctx, transactionData.projectId);
        var checkValidator = false;
        projectData.validators.every(element => {
            if(element == userId){
                checkValidator = true;
                return false;
            }
        });
        if(!checkValidator){
            throw new Error('You are not a validator');
        }
        projectData.assets.push(transactionData.assets);
        await ctx.stub.putState(projectData.id, JSON.stringify(projectData));
        transactionData.statusValidate = true;
        transactionData.timestampValidation = timestamp;
        transactionData.validatedBy = userId;
        await ctx.stub.putState(transactionData.id, JSON.stringify(transactionData));

    }

    async AddContributor(ctx, projectId, userId, password, contributorId) {
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        if(userId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(userId.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(userId.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(userData.password != password){
            throw new Error('Wrong password');
        }
        if(contributorId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of contributor');
        }
        if(isNaN(parseInt(contributorId.substring(4))) ){
            throw new Error('Wrong syntaxis of contributor');
        }
        if(userCountInt < parseInt(contributorId.substring(4))){
            throw new Error('Contributor doesnt exist');
        }
        const queryProjectCount = await ctx.stub.getState('projectCount');
        const projectCountInt = parseInt(queryProjectCount.count);
        var projectData = await readState(ctx, projectId);
        if(projectId.substring(0,7) != "project"){
            throw new Error('Wrong syntaxis of project');
        }
        if(isNaN(parseInt(projectId.substring(7))) ){
            throw new Error('Wrong syntaxis of project');
        }
        if(projectCountInt < parseInt(projectId.substring(7))){
            throw new Error('Project doesnt exist');
        }
        let checkValidator = false;
        projectData.validators.every(element => {
            if(element == userId){
                checkValidator = true;
                return false;
            }
        });
        if(!checkValidator){
            throw new Error('You are not a validator');
        }
        projectData.contributors.forEach(element => {
            if(element == contributorId){
                throw new Error('The contributor yet exists');
            }
        });
        projectData.contributors.push(contributorId);
        projectData.contributors = projectData.contributors.filter(onlyUnique);
        await ctx.stub.putState(projectData.id, JSON.stringify(projectData));
        var contributorData = await readState(ctx, contributorId);
        contributorData.projectsContributor.push(projectId);
        await ctx.stub.putState(contributorId, JSON.stringify(contributorData));

    }

    async AddValidator(ctx, projectId, userId, password, validatorId) {
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        if(userId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(userId.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(userId.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(userData.password != password){
            throw new Error('Wrong password');
        }
        if(validatorId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of validator');
        }
        if(isNaN(parseInt(validatorId.substring(4))) ){
            throw new Error('Wrong syntaxis of validator');
        }
        if(userCountInt < parseInt(validatorId.substring(4))){
            throw new Error('Validator doesnt exist');
        }
        const queryProjectCount = await ctx.stub.getState('projectCount');
        const projectCountInt = parseInt(queryProjectCount.count);
        var projectData = await readState(ctx, projectId);
        if(projectId.substring(0,7) != "project"){
            throw new Error('Wrong syntaxis of project');
        }
        if(isNaN(parseInt(projectId.substring(7))) ){
            throw new Error('Wrong syntaxis of project');
        }
        if(projectCountInt < parseInt(projectId.substring(7))){
            throw new Error('Project doesnt exist');
        }
        let checkValidator = false;  
        projectData.validators.every(element => {
            if(element == userId){
                checkValidator = true;
                return false;
            }
        });
        if(!checkValidator){
            throw new Error('You are not a validator');
        }
        projectData.validators.every(element => {
            if(element == validatorId){
                throw new Error('The validator yet exists');
            }
        });
        projectData.validators.push(validatorId);
        projectData.validators = projectData.validators.filter(onlyUnique);
        await ctx.stub.putState(projectData.id, JSON.stringify(projectData));
        var validatorData = await readState(ctx, validatorId);
        validatorData.projectsValidator.push(projectId);
        await ctx.stub.putState(validatorId, JSON.stringify(validatorData));
    }


    async sendRequest(ctx, projectId, userId, password, timestamp){
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        if(userId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(userId.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(userId.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(userData.password != password){
            throw new Error('Wrong password');
        }
        const queryProjectCount = await ctx.stub.getState('projectCount');
        const projectCountInt = parseInt(queryProjectCount.count);
        var projectData = await readState(ctx, projectId);
        if(projectId.substring(0,7) != "project"){
            throw new Error('Wrong syntaxis of project');
        }
        if(isNaN(parseInt(projectId.substring(7))) ){
            throw new Error('Wrong syntaxis of project');
        }
        if(projectCountInt < parseInt(projectId.substring(7))){
            throw new Error('Project doesnt exist');
        }
        if(timestamp < projectData.endDate || timestamp > projectData.startDate){
            throw new Error('Out of time for project');
        }

        if(projectData.requestUsers.find(e=> e.user==userId)!==undefined){
            throw new Error('Alredy the user has sent one request');
        }
        const request = {
            user: userId,
            value: false
        };
        projectData.requestUsers.push(request);
    }

    async approveRequest(ctx, projectId, userId, contributorId ,password, timestamp){
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        if(userId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(userId.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(userId.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(userData.password != password){
            throw new Error('Wrong password');
        }
        if(contributorId.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of contributor');
        }
        if(isNaN(parseInt(contributorId.substring(4))) ){
            throw new Error('Wrong syntaxis of contributor');
        }
        if(userCountInt < parseInt(contributorId.substring(4))){
            throw new Error('Contributor doesnt exist');
        }
        const queryProjectCount = await ctx.stub.getState('projectCount');
        const projectCountInt = parseInt(queryProjectCount.count);
        var projectData = await readState(ctx, projectId);
        if(projectId.substring(0,7) != "project"){
            throw new Error('Wrong syntaxis of project');
        }
        if(isNaN(parseInt(projectId.substring(7))) ){
            throw new Error('Wrong syntaxis of project');
        }
        if(projectCountInt < parseInt(projectId.substring(7))){
            throw new Error('Project doesnt exist');
        }
        let checkValidator = false;
        projectData.validators.every(element => {
            if(element == userId){
                checkValidator = true;
                return false;
            }
        });
        if(!checkValidator){
            throw new Error('You are not a validator');
        }
        projectData.contributors.forEach(element => {
            if(element == contributorId){
                throw new Error('The contributor yet exists');
            }
        });

        if(projectData.requestUsers.find(e=> e.user==userId)===undefined){
            throw new Error('The request doesnt exist');
        }
        projectData.contributors.push(contributorId);
        projectData.contributors = projectData.contributors.filter(onlyUnique);
        projectData.requestUsers.find(e=> e.user==userId).value = true;
        await ctx.stub.putState(projectData.id, JSON.stringify(projectData));
        var contributorData = await readState(ctx, contributorId);
        contributorData.projectsContributor.push(projectId);
        await ctx.stub.putState(contributorId, JSON.stringify(contributorData));


    }

    async checkPassword(ctx, id, password){
        if(id.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        var query = await ctx.stub.getState(id);
        if (query.password == password){
            return true;
        } else {
            return false;
        };       
    }

    async GetInitStatus(ctx) {
        const query = await ctx.stub.getState('initialized');
        return query.toString();
    }

    async GetUserCount(ctx) {
        const query = await ctx.stub.getState('userCount');
        return query.toString();
    }

    async GetProjectCount(ctx) {
        const query = await ctx.stub.getState('projectCount');
        return query.toString();
    }

    async GetTransactionCount(ctx) {
        const query = await ctx.stub.getState('transactionCount');
        return query.toString();
    }

    async GetUser(ctx, id) {
        if(id.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        var query = await ctx.stub.getState(id);
        //var query = await readState(ctx, id);
        /*var output = {
            id: id,
            name: query.name,
            email: query.email,
            projectsCreator: query.projectsCreator,
            projectsContributor: query.contributors,
            projectsValidator: query.projectsValidator
        };*/
        query.password = "";
        return query.toString();
    }  

    async GetProject(ctx, id) {
        if(id.substring(0,7) != "project"){
            throw new Error('Wrong syntaxis of user');
        }
        var query = await ctx.stub.getState(id); 
        if (!query || query.length === 0) {
            throw new Error(`The project ${id} does not exist`);
        }
        return query.toString();
        
    }

    async GetTransaction(ctx, id) {
        if(id.substring(0,11) != "transaction"){
            throw new Error('Wrong syntaxis of user');
        }
        var query = await ctx.stub.getState(id);
        if (!query || query.length === 0) {
            throw new Error(`The transaction ${id} does not exist`);
        }
        return query.toString();
    }

    async GetUserByEmail(ctx, email) {
        const validRegexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!validRegexEmail.test(email)) {
            throw new Error('Email is invalid');
        }
        const mapEmailToUser = await readState(ctx, 'mapEmailToUser');//
        const query = mapEmailToUser[email];
        if(query === undefined){
            throw new Error('Email is not registered');
        }
        return query;
    }
    async Debug(ctx) {
	//datas={users:{},projects:{},transactions:{}}
	let datas={}
        datas.initialized = await readState(ctx, 'initialized');
        for(let obj of ['user','transaction','project'])
        {
          datas[obj+'Count'] = await readState(ctx, obj+'Count')
          for(let id=0;id<datas[obj+'Count'].count;id++) {
		//const objid = '' + obj + id
		//const objbuf = await ctx.stub.getState(objid);
		//if (objbuf['type'] && objbuf['type'] === 'Buffer')
		//  datas[objid] = new Buffer(objbuf)
		//else
		//	  datas[objid] = objbuf
		datas[obj+id] = await readState(ctx, obj+id)
	  }
	}
        datas.mapEmailToUser = await readState(ctx, 'mapEmailToUser');
	return datas;
    }

    
}

module.exports = Utopiamaker;

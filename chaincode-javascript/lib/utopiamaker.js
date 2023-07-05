/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';



const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');



async function readState(ctx, id) {
	const assetBuffer = await ctx.stub.getState(id);
	if (!assetBuffer || assetBuffer.length === 0) {
		throw new Error(`The asset ${id} does not exist`);
	}
	const assetString = assetBuffer.toString();
	const asset = JSON.parse(assetString);
	return asset;
}


class Utopiamaker extends Contract {
    
    async Init(ctx){
        const initialized = await ctx.stub.getState('initialized');
        if (!initialized || initialized.length === 0) {
           await ctx.stub.putState('initialized',JSON.stringify({status:'true'}));
           await ctx.stub.putState('userCount', JSON.stringify({count:0}));
           await ctx.stub.putState('projectCount', JSON.stringify({count:0}));
           await ctx.stub.putState('transactionCount', JSON.stringify({count:0}));
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

        var currentCount = await readState(ctx, 'userCount');
        const newCount = parseInt(currentCount.count)+1;
        const id = 'user'.concat(currentCount.count);
        const userData = {
            id: id,
            name: name,
            email: email,
            password: password,
            projects: []
        };
        await ctx.stub.putState(id, JSON.stringify(userData));
        await ctx.stub.putState('userCount', JSON.stringify({count:newCount}));
        return id;
    }

    async CreateProject(ctx, name, startDate, endDate, description, creator, contributors, validators, password, timestamp) {
        if(name == "" || description == ""){
            throw new Error('Name and description cannot be empty');
        }
        if(timestamp < startDate || timestamp > endDate || endDate > 1924992000){
            throw new Error('Dates are not valid');
        }
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const creatorData = await readState(ctx, creator);
        if(creator.substring(0,4) != "user"){
            throw new Error('Wrong syntaxis of user');
        }
        if(isNaN(parseInt(creator.substring(4))) ){
            throw new Error('Wrong syntaxis of user');
        }
        if(userCountInt < parseInt(creator.substring(4))){
            throw new Error('User doesnt exist');
        }
        if(creatorData.password != password){
            throw new Error('Wrong password');
        }
        const contributorsList = contributors.split(',');
        const validatorsList = validators.split(',');
        contributorsList.forEach(e => {
            if(e.substring(0,4) != "user"){
                throw new Error('Wrong syntaxis of user');
            }
            if(isNaN(parseInt(e.substring(4))) ){
                throw new Error('Wrong syntaxis of user');
            }
            if(userCountInt < parseInt(e.substring(0,4))){
                throw new Error('User doesnt exist');
            }
        });
        validatorsList.forEach(e => {
            if(e.substring(0,4) != "user"){
                throw new Error('Wrong syntaxis of user');
            }
            if(isNaN(parseInt(e.substring(4))) ){
                throw new Error('Wrong syntaxis of user');
            }
            if(parseInt(userCountInt) < parseInt(e.substring(0,4))){
                throw new Error('User doesnt exist');
            }
        });

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
            creator: creator,
            contributors: contributorsList,
            validators:validatorsList,
            assets:[],
            transactions: []
        };
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
        if(timestamp > projectData.endDate || timestamp < projectData.startDate){
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
            timestamp: timestamp,
            assets: JSON.parse(assets),
            statusValidate: false,
            timestampValidation: null
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
        userData.email = newEmail;
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
            throw new Error('yet the transaction was validated');
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
        await ctx.stub.putState(transactionData.id, JSON.stringify(transactionData));

    }

    async AddContributor(ctx, projectId, userId, password, contributorId) {
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        const contributorData = await readState(ctx, contributorId);
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
        projectData.contributors.push(contributorId);
        await ctx.stub.putState(projectData.id, JSON.stringify(projectData));
    }

    async AddValidator(ctx, projectId, userId, password, validatorId) {
        const queryUserCount = await ctx.stub.getState('userCount');
        const userCountInt = parseInt(queryUserCount.count);
        const userData = await readState(ctx, userId);
        const validatorData = await readState(ctx, validatorId);
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
        projectData.validators.push(validatorId);
        await ctx.stub.putState(projectData.id, JSON.stringify(projectData));
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
        const query = await ctx.stub.getState(id);
        
        if (!query || query.length === 0) {
            throw new Error(`The user ${id} does not exist`);
        }
        return query.toString();
        
    }  

    async GetProject(ctx, id) {
        var query = await ctx.stub.getState(id); 
        if (!query || query.length === 0) {
            throw new Error(`The user ${id} does not exist`);
        }
        query.password = null;
        return query.toString();
        
    }

    async GetTransaction(ctx, id) {
        var query = await ctx.stub.getState(id);
        if (!query || query.length === 0) {
            throw new Error(`The user ${id} does not exist`);
        }
        query.password = null;
        return query.toString();
        
    }
}

module.exports = Utopiamaker;

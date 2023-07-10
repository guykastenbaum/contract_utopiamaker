/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';
import { createHash } from 'crypto';

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'utopiamaker');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));

// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));

// Path to user certificate.
const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'cert.pem'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();
const assetId = `user${Date.now()}`;

export async function main(): Promise<any> {

    await displayInputParameters();

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName);

        // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
        // await init(contract);

        // Return all the current assets on the ledger.
        //await getAllAssets(contract);

        // Create a new asset on the ledger.
        //await createAsset(contract);

        // Update an existing asset asynchronously.
        //await transferAssetAsync(contract);

        // Get the asset details by assetID.
        //await readAssetByID(contract);

        // Update an asset which does not exist.
        //await updateNonExistentAsset(contract)
        // await getInitStatus(contract);//
//        await getA(contract);
//        await getAllAssets(contract);
        // await getUserCount(contract);////
        // await createUser0(contract);//
        // await getUserCount(contract);//
        // await createUser1(contract);//
        // await getUserCount(contract);//
        // await createUser2(contract);//
        // await getUserCount(contract);//
        // await getUser(contract);//
        // await updateEmail(contract);
        // await getUser(contract);//
        // await getProjectCount(contract);
        // await createProject(contract);
        // await getProjectCount(contract);
        // await getProject(contract);
        // await getTransactionCount(contract);
        // await createTransaction(contract);
        // await getTransactionCount(contract);
        // await getTransaction(contract);
        // await getProject(contract);
        // await validateTransaction(contract);
        // await getTransaction(contract);
        // await getProject(contract);
        // await addContributor(contract);
        // await addValidator(contract);
        // await getProject(contract);
        return contract;
    } finally {
        // gateway.close();
        // client.close();
    }
}

// main().catch(error => {
//     console.error('******** FAILED to run the application:', error);
//     process.exitCode = 1;
// });

export async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

export async function newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

export async function newSigner(): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
export async function init(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: Init');

    await contract.submitTransaction('Init');

    console.log('*** Transaction committed successfully');
}


/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
export async function createUser(contract: Contract, user: { name: string, email: string, password: string}): Promise<any> {
    console.log('\n--> Submit Transaction: CreateUser, creates new user');

    const resultBytes = await contract.submitTransaction(
        'CreateUser',
        user.name,
        user.email,
        sha256Hash(user.password),
    );

    console.log('*** Transaction committed successfully');
    const result = new TextDecoder().decode(resultBytes);
    console.log('*** Result:', result);
    return result;
}

async function updateEmail(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: update Email, Update email of user');

    const resultBytes = await contract.submitTransaction(
        'UpdateEmail',
        'user0',
        'a20aff106fe011d5dd696e3b7105200ff74331eeb8e865bb80ebd82b12665a07',
        'philippeChange@example.com',
        );

    console.log('*** Transaction committed successfully');

    
}

async function updatePassword(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: updatePassword, update password of user');

    const resultBytes = await contract.submitTransaction(
        'UpdatePassword',
        'user0',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        'a20aff106fe011d5dd696e3b7105200ff74331eeb8e865bb80ebd82b12665a07',
        );

    console.log('*** Transaction committed successfully');
    
}

export async function createProject(contract: Contract, project: {projectId: string, creationTimestamp: string, startTimestamp: string, description: string, ownerId: string, members: string, validators: string, ownerPass: string, finishTimestamp: string}): Promise<void> {
    console.log('\n--> Submit Transaction: CreateProject');
    console.log('\n'+JSON.stringify(project));

    const resultBytes = await contract.submitTransaction(
        'CreateProject',
        'project one',
        '1672531200',
        '1704067200',
        'Example description',
        'user0',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '1688516687'
    );

    console.log('*** Transaction committed successfully');
    const result = new TextDecoder().decode(resultBytes);
    console.log('*** Result:', result);
}

export async function createTransaction(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: Create transaction');

    const resultBytes = await contract.submitTransaction(
        'CreateTransaction',
        'project0',
        'user0',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '{"time":"1 hour"}',
        '1688516687'
    );

    console.log('*** Transaction committed successfully');
    const result = new TextDecoder().decode(resultBytes);
    console.log('*** Result:', result);
}
async function createTransaction2(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: Create transaction');

    const resultBytes = await contract.submitTransaction(
        'CreateTransaction',
        'project0',
        'user0',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '{"time":"1 hour"}',
        '1688516687'
    );

    console.log('*** Transaction committed successfully');
    const result = new TextDecoder().decode(resultBytes);
    console.log('*** Result:', result);
}

export async function validateTransaction(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: Validate txn');
    await contract.submitTransaction(
        'ValidateTransaction',
        'transaction0',
        'user0',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '1688516687'
    );

    console.log('*** Transaction committed successfully');
}
async function addValidator(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: Validator added');
    await contract.submitTransaction(
        'AddValidator',
        'project0',
        'user0',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        'user2'
    );

    console.log('*** Transaction committed successfully');
}

export async function addContributor(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: Contributor added');
    await contract.submitTransaction(
        'AddContributor',
        'project0',
        'user0',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        'user0'
    );

    console.log('*** Transaction committed successfully');
}
async function addContributor1(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: Contributor added');
    await contract.submitTransaction(
        'AddContributor',
        'project0',
        'user0',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        'user1'
    );

    console.log('*** Transaction committed successfully');
}

async function addContributor2(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: Contributor added');
    await contract.submitTransaction(
        'AddContributor',
        'project0',
        'user0',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        'user2'
    );

    console.log('*** Transaction committed successfully');
}

export async function getInitStatus(contract: Contract): Promise<any> {
    console.log('\n--> Evaluate Transaction: GetInitState, function returns contract status');
    const resultBytes = await contract.evaluateTransaction('GetInitStatus');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result.status;
}

export async function getUserCount(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetUserCount, function returns user count');
    const resultBytes = await contract.evaluateTransaction('GetUserCount');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

export async function getUser(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetUser, function returns user attributes');
    const resultBytes = await contract.evaluateTransaction('GetUser', 'user0');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}


async function getUserByEmail(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetUserByEmail, function returns user');
    const resultBytes = await contract.evaluateTransaction('GetUserByEmail', 'philippe@example.com');
    const resultJson = utf8Decoder.decode(resultBytes);
    //const result = JSON.parse(resultJson);
    console.log('*** Result:', resultJson);
}

async function getUserByEmailChange(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetUserByEmail, function returns user');
    const resultBytes = await contract.evaluateTransaction('GetUserByEmail', 'philippeChange@example.com');
    const resultJson = utf8Decoder.decode(resultBytes);
    //const result = JSON.parse(resultJson);
    console.log('*** Result:', resultJson);
}

async function getUser1(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetUser, function returns user attributes');
    const resultBytes = await contract.evaluateTransaction('GetUser', 'user1');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getUser2(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetUser, function returns user attributes');
    const resultBytes = await contract.evaluateTransaction('GetUser', 'user2');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getProjectCount(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetProjectCount, function returns projects count');
    const resultBytes = await contract.evaluateTransaction('GetProjectCount');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

export async function getTransactionCount(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetTransactionCount, function returns transactions count');
    const resultBytes = await contract.evaluateTransaction('GetTransactionCount');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}
async function getProject(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetProject, function returns project attributes');
    const resultBytes = await contract.evaluateTransaction('GetProject', 'project0');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getTransaction(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetTransaction, function returns txn attributes');
    const resultBytes = await contract.evaluateTransaction('GetTransaction', 'transaction0');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
export async function displayInputParameters(): Promise<void> {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certPath:          ${certPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}


//HELPER FUNCTIONS
function sha256Hash(input: string): string {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

export default main;
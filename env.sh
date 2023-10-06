#!/bin/bash

export FBH=/data/fabric
export FBU=$FBH/utopiamaker-chaincode
#samples
export FBS=$FBH/fabric-samples
#network
export FBN=$FBH/fabric-samples/test-network
#contract
export FBC=$FBU/chaincode-javascript
#frontend
export FBF=$FBU/application-gateway-typescript

#front PM2 contract app
export PMC=/data/home/contract/contract

export PATH=$FBS/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:

export FABRIC_CFG_PATH=$FBS/config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_LOCALMSPID2="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$FBN/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_TLS_ROOTCERT_FILE2=$FBN/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=$FBN/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_MSPCONFIGPATH2=$FBN/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_ADDRESS2=localhost:9051
export CORE_PEER_CAFILE=$FBN/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export CHANNEL=utopia
export CHANNEL_NAME=$CHANNEL
export CHAINCODE_NAME=basic

export CORE_PEER_TLS_CERT_FILE=$FBN/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt
export CORE_PEER_TLS_KEY_FILE=$FBN/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key
export CORE_PEER_TLS_CERT_FILE2=$FBN/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/server.crt
export CORE_PEER_TLS_KEY_FILE2=$FBN/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/server.key

export CORE_TLS_CLIENT_KEY_PATH=$CORE_PEER_TLS_KEY_FILE
export CORE_TLS_CLIENT_CERT_PAT=$CORE_PEER_TLS_CERT_FILE

export CRYPTO_PATH=$FBN/organizations/peerOrganizations/org1.example.com
#envOrDefault('MSP_ID', 'Org1MSP');
# keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));
# certPath = envOrDefault('
#export CERT_PATH=$CRYPTO_PATH/users/User1@org1.example.com/msp/signcerts/cert.pem
export CERT_PATH=$CRYPTO_PATH/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem
export CERT_PATH_TLS=$CRYPTO_PATH/peers/peer0.org1.example.com/tls/ca.crt

BCCERTS=" --cafile $CORE_PEER_CAFILE"
BCOPTC=" -C $CHANNEL -n basic"
BCOPTP1=" --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE"
BCOPTP2=" --peerAddresses $CORE_PEER_ADDRESS2 --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE2"
BCOPTQ="$BCOPTC $BCCERTS $BCOPTP1"
BCOPTO=" -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls"
BCOPTI="$BCOPTO $BCOPTC $BCCERTS $BCOPTP1 $BCOPTP2"

export VIBCF=$PMC/src/app.ts
alias vibcf="vi $VIBCF"
export VIBCB=$FBC/lib/utopiamaker.js
alias vibc="vi $VIBCB"
alias peerq='peer chaincode query -C $CHANNEL -n basic -c '
#{"Args":["getAllUsers"]}'
puq () {
        pup "$1" "$2" "$3" "$4"
	#echo "peer chaincode qery $BCOPTQ -c '$PARG'"
	peer chaincode query $BCOPTQ -c "$PARG"
}
pui () {
        pup "$1" "$2" "$3" "$4"
	#echo "peer chaincode invoke $BCOPTI -c '$PARG'"
	peer chaincode invoke $BCOPTI -c "$PARG"
	if [ "$?" != "0" ];then echo ERROR-peer;fi
}
pup () {
	FNC=$1
	A1=$2
	A2=$3
	A3=$4
	shift
	REST=$*
if [ "$A3" != "" ];then PARG="{\"Function\":\"$FNC\",\"Args\":[\"$A1\",\"$A2\",\"$A3\"]}";fi
if [ "$A3"  = "" ];then PARG="{\"Function\":\"$FNC\",\"Args\":[\"$A1\",\"$A2\"]}";fi
if [ "$A2"  = "" ];then PARG="{\"Function\":\"$FNC\",\"Args\":[\"$A1\"]}";fi
if [ "$A1"  = "" ];then PARG="{\"Function\":\"$FNC\",\"Args\":[]}";fi
if [ "$(echo $A1|cut -c1-1)" = "[" ];then PARG="{\"Function\":\"$FNC\",\"Args\":$A1 $A2 $A3}";fi
if [ "$(echo $A1|cut -c1-1)" = "[" ];then PARG="{\"Function\":\"$FNC\",\"Args\":$REST}";fi
#if [ "$A2"  = "" ];then PARG="{\"Args\":[\"$A1\"]}";fi
}

DKIDS=$(docker ps -a|sed -e 's/ .*$//' -e '/CONTAINER/d')
DKLGS=$(for D in $DKIDS;do docker inspect --format='{{.LogPath}}' $D;done)
DKID=$(docker ps|grep -E "fabric-peer.*org1"|sed -e 's/ .*$//')
alias dl="docker logs $DKID"

export FABRIC_LOGGING_SPEC=ERROR
# FATAL | PANIC | ERROR | WARNING | INFO | DEBUG


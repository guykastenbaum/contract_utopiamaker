
cd /data/fabric

if [ ! -d utopiamaker-chaincode ];then
git clone https://github.com/nabarriosr/utopiamaker-chaincode.git
fi

#if [ ! -d fabric-samples ];then
#git clone https://github.com/hyperledger/fabric-samples.git
##git clone https://github.com/hyperledger/fabric.git
#fi


curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh 
chmod +x install-fabric.sh
./install-fabric.sh d s b

sh start.sh


. /data/fabric/env.sh

#cd $FBN
$FBN/network.sh down


echo "###UP###"
$FBN/network.sh up

#echo "docker container, ps : " docker container list docker ps -a

echo "###CHANNEL###"
#./network.sh createChannel -c $CHANNEL -ca
$FBN/network.sh createChannel -c $CHANNEL
#$FBN/network.sh createChannel -c $CHANNEL -ca
echo "###CHAINCODE###"
#./network.sh deployCC -ccn basic -ccp $FBC -ccl javascript -c $CHANNEL
rm $FBH/ccs.sh
bash $FBH/deploy.sh
#???? ./network.sh deployCC -ccn utopiamaker -ccp $FBC -ccl javascript -c $CHANNEL

echo "docker container, ps : "
docker container list
docker ps -a



#cd $FBF
#npm install
#npm start



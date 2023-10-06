. /data/fabric/env.sh
cd $FBS/test-network
./network.sh down
echo "docker container, ps : "
docker container list
docker ps -a


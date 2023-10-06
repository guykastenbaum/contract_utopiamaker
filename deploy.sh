. /data/fabric/env.sh
if [ ! -f $FBH/ccs.sh ];then echo "export CCS=1" > $FBH/ccs.sh;fi
. $FBH/ccs.sh
if [ "$CCS" = "" ];then CCS=1;fi
$FBN/network.sh deployCC -ccn basic -ccp $FBC -ccl javascript -c $CHANNEL -ccs $CCS 
if [ "$?" = "0" ];then
	echo "sequence $CCS => $(expr $CCS + 1)"
	CCS=$(expr $CCS + 1)
	sed -i $FBH/ccs.sh -e "s/=.*$/=$CCS/"
fi


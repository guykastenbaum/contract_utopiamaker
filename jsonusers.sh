#!/bin/sh

. ./ env.sh

J=jsonusers.json
rm jsonusers.log
if [ ! -f $J ];then
curl -o $J https://dbm.utopiamaker.com/api/dbm_usr_list
fi

N=$(cat $J |jq length)
I=0
I=22
N=40
while [ $I -lt $N ];do
	#echo $I
	MEMBERID=$(jq ".[$I].usr_memberid" $J)
	PASS=$(echo $MEMBERID|tr -d "\n\r\""|sha256sum|sed -e 's/ .*$//')
	PARG=$(jq ".[$I]|[.usr_usr,.usr_email,\"$PASS\"]" $J|tr -d "\n")
	#USER=$(jq ".[$I].usr_usr" $J|xargs echo)
	#EMAIL=$(cat $J |jq ".[$I].usr_email")
	#echo pui CreateUser "[\"$USER\",\"$EMAIL\",\"$PASS\"]"
	echo $I CreateUser "$PARG" $MEMBERID
	echo $I CreateUser "$PARG" $MEMBERID >> jsonusers.log
	pui CreateUser "$PARG" >> jsonusers.log 2>&1
	sleep 2
	I=$(expr $I + 1)
done

#cat $J |jq ".[0]"
#jq ".[0]|{user:.usr_usr,mail:.usr_email}" jsonusers.json 
#jq ".[0]|[.usr_usr,.usr_email,.usr_memberid]" jsonusers.json 


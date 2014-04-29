#!/bin/bash
echo "Content-Type: text/plain; charset=ISO-8859-1"
echo
echo "$QUERY_STRING" >> /tmp/test.log
#cmd="$(echo "$QUERY_STRING" | sed 's/%20/ /g;s/%22/\"/g;s/.*&//')"
cmd="$(echo "$QUERY_STRING" | sed "s/'/%27/g;"'s/%20/ /g;s/%22/\"/g;s/.*&//')"
echo $cmd >> /tmp/test.log
eval "$cmd"

timeinsecs=$(date +%s)
#check if the message is for a group
group="$(mysql -uroot -pletmein  --skip-column-names <<< "use groupChat; select groupName FROM users where groupName='"$to"';")"
#form the recd and boxID string accordingly
if [ "$group" ]; then
  users="$(mysql -uroot -pletmein  --skip-column-names <<< "use groupChat; select users FROM users where groupName='"$group"';")"
  recd="$users" #list of users
  recd="$(echo $recd | sed 's/ /0 /g;s/$/0/')"
  if [ "$user" != 'System' ]; then 
     recd="$(echo $recd | sed 's/'${from}'0/'${from}0' '${from}$userID'/')"
  fi
  boxID=${to}
else
  users="$to $from"
  recd="${to}0"
  boxID=${from}
  mysql -uroot -pletmein <<< "use groupChat;INSERT INTO messages (messages.from,messages.to,messages.box,messages.message,messages.sent,messages.recd) VALUES ('$from','$from','$to','$message','$timeinsecs','${from}0 ${from}$userID');"
fi
mysql -uroot -pletmein <<< "use groupChat;INSERT INTO messages (messages.from,messages.to,messages.box,messages.message,messages.sent,messages.recd) VALUES ('$from','$to','$boxID','$message','$timeinsecs','${recd}');"
mysql -uroot -pletmein <<< "use groupChat; SELECT max(id) from messages" | tail -1

#save message into each user log
message=$(/usr/lib/cgi-bin/URLdecode.sh <<< "$message")
message="${message//myESC22/\"}"
#2 files because of the 2 owners of the chat
for user in $users
do
    mkdir -p /var/www/CHATs/$user/
    if [ $user = $to ]; then #reg chat 
        chatFile="/var/www/CHATs/$user/${from}_$(date  +%m_%d_%y).txt"
    else
        chatFile="/var/www/CHATs/$user/${to}_$(date  +%m_%d_%y).txt"
    fi
    echo "$from: $message" >> $chatFile
done
#mkdir -p /var/www/CHATs/$to/
#chatFile="/var/www/CHATs/$to/${from}_$(date  +%d_%m_%y).txt"
#echo "$from: $message" >> $chatFile
echo newMSG >> /tmp/.msgLoop.cmd

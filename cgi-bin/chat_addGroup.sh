#!/bin/bash
echo "Content-Type: text/plain; charset=ISO-8859-1"
echo
echo "$QUERY_STRING" >> /tmp/test.log
cmd="$(echo "$QUERY_STRING" | sed "s/'/%27/g;"'s/%20/ /g;s/%22/\"/g;s/.*&//')"
echo $cmd >> /tmp/test.log
eval "$cmd"

#check if the group exists already
group="$(mysql -uroot -pletmein  --skip-column-names <<< "use groupChat; select groupName FROM users where groupName='"$groupName"';")"
if [ "$group" ]; then 
  if [ $newGroup = yes ]; then
    echo "$group is alredy in use"
  else #is an addition to the existing group
    for user in $users; do echo $user >> /tmp/.$groupName; done
    users="$(sort /tmp/.$groupName | uniq | sed ':a;N;$!ba;s/\n/ /g')"
    echo $users >> /tmp/test.log
    for user in $users; do echo $user >> /tmp/.$groupName; done
    mysql -uroot -pletmein <<< "use groupChat;UPDATE users SET users='$users' WHERE (groupName='$groupName');"
  fi
else
    mysql -uroot -pletmein <<< "use groupChat;INSERT INTO users (groupName, users) VALUES ('$groupName','$users');"
    echo -n > /tmp/.$groupName
    for user in $users; do echo $user >> /tmp/.$groupName; done
fi
source UserList.sh

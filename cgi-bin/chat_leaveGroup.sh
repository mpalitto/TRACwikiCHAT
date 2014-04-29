#!/bin/bash
echo "Content-Type: text/plain; charset=ISO-8859-1"
echo
echo "$QUERY_STRING" >> /tmp/test.log
cmd="$(echo "$QUERY_STRING" | sed "s/'/%27/g;"'s/%20/ /g;s/%22/\"/g;s/.*&//')"
echo $cmd >> /tmp/test.log
eval "$cmd"
source /usr/lib/cgi-bin/defs.conf
#user='new'
#groupName='newTeam'
userOpenSessions=$(sqlite3 $db "select name from auth_cookie where name='"$user"';" | wc -l)
if [ $type != logout ]; then echo testpoint 2 >> /tmp/test.log; fi
if [ $userOpenSessions -eq 1  ]; then echo testpoint 3 >> /tmp/test.log; fi
if [ $type != logout ] || [ $userOpenSessions -eq 1 ]; then
echo "testpoint 1" >> /tmp/test.log
    #mysql -uroot -pletmein <<< "use groupChat; UPDATE users SET users = REPLACE(users, '$user', '') WHERE (groupName='$groupName');"
    users="$(mysql -uroot -pletmein --skip-column-name <<< "use groupChat; SELECT users FROM users WHERE groupName='$groupName';")"
    for USER in $users
    do
      if [ "$USER" != "$user" ];then
          newUsers="$newUsers $USER"
      fi
    done
    mysql -uroot -pletmein <<< "use groupChat; UPDATE users SET users = '$newUsers' WHERE (groupName='$groupName');"
    if [ $(echo $newUsers | wc -w) -lt 2 ]; then #the group shall be terminated
        echo "users left: $newUsers" >> /tmp/test.log
        mysql -uroot -pletmein <<< "use groupChat; delete from users where groupName='$groupName';"
    fi
    if [ type == logout ]; then echo leftGrooup; fi
fi
source UserList.sh

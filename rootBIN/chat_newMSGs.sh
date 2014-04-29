#!/bin/bash
read USER
read tracAUTH
#echo -e "system\tsystem\tWelcome to the chat ${USER}!"
#sleep 1
source /usr/lib/cgi-bin/defs.conf
me='false'
ID=$(sqlite3 $db "select time from auth_cookie where cookie='$tracAUTH';")
if [ ! "$ID" ]; then
    echo -e "cmd\t$USER\tlogout" 
    exit
fi
echo -e "userID\t$USER\t$ID" | tee -a chat.log

to=$USER
myPID="" #for the message loop
MYPID="" #for the user list loop
MyPiD="" #for the command loop

####MESSAGE LOOP####
touch /tmp/.msgLoop.cmd; chown www-data:www-data /tmp/.msgLoop.cmd
for ns in 3 2 1
do
if [ -e /.msgLoop.$ID.fifo ]; then sleep $ns
else break; fi
done
if [ ! -e /.msgLoop.$ID.fifo ]; then mkfifo /.msgLoop.$ID.fifo
else echo "cannot make FIFO  /.msgLoop.$ID.fifo it exists" >> chat.log; fi
tail -n 0 -f /tmp/.msgLoop.cmd > /.msgLoop.$ID.fifo &
tailPID=$!
while read line
do
  if [ "$line" = 'exit' ] || [ ! "$(ps h $$)" ]; then kill $tailPID; rm /.msgLoop.$ID.fifo .$USER.usrListLoop.$ID.pid; break; fi
  if [ "$line" = 'newMSG' ]; then 
    newMSGs=$(mysql -uroot -pletmein --skip-column-names <<< "use groupChat; SELECT messages.box,messages.from,messages.message FROM messages WHERE (recd LIKE '%${to}0%' AND recd NOT LIKE '%${to}${ID}%' AND sent >= $ID);UPDATE messages SET recd = REPLACE(recd, '${to}0','${to}0 ${to}$ID') WHERE (recd LIKE '%${to}0%' AND recd NOT LIKE '%$to$ID%' AND sent >= $ID);")
    if [ "$newMSGs" ]; then
        echo -e "$newMSGs" # | tee -a chat.log
    fi
    sleep 1
  #### send a command to the client ####
  elif [ "$(grep clientCMD <<< $line)" ]; then 
    read hd id CMD <<< $line
    if [ $id = $ID ]; then
      echo -e "cmd\t$USER\t$CMD" | tee -a chat.log
    fi
  #### USER LIST ####
  elif [ "$(grep updateUserList <<< $line)" ]; then 
      echo "$ID: received updateUserList CMD" >> chat.log
      if  [ "$(diff /.usrList.connected .$USER.$ID.usrList.connected)" ] || [ "$(diff /tmp/.loggedIN .$USER.$ID.loggedIN)" ]; then
          echo "$ID: updating user list..." >> chat.log
          echo -e "UserList\tuser\tstartUserList"; sleep .1
          egrep $'\t'user:$'\t' /tmp/.loggedIN | egrep -v :$'\t'"$USER$" | while read user #list all users but me
          do
              sleep .1 #FierFox cannot handle the speed
              #if the user is logged in and it is chat connected report it
              uu="$(echo $user)"; uu=${uu/* /}
              if [ "$(ls /.$uu.usrListLoop.*.pid)" ] && [ "$(cat /.$uu.usrListLoop.*.pid | sed 's/[^0-9]*//g' | xargs ps h)" ]; then echo -e "$user"; fi
          done
          egrep $'\t'group:$'\t' /tmp/.loggedIN | while read id from group users #list all the groups where I am member of 
          do
              sleep .1 #FierFox cannot handle the speed
              for user in $users
              do
                  if [ "$user" = "$USER" ]; then
                    echo -e "UserList\tgroup:\t$group"
                    break
                  fi
              done
          done 
          echo -e "UserList\tuser\tendUserList"
          cp /tmp/.loggedIN .$USER.$ID.loggedIN #updated the user list
          cp /.usrList.connected .$USER.$ID.usrList.connected #updated the user list
      fi
  fi
done < /.msgLoop.$ID.fifo &
pid=$!
echo $pid > .$USER.usrListLoop.$ID.pid
echo -n > .$USER.$ID.loggedIN
echo -n > .$USER.$ID.usrList.connected
ls /.*.usrListLoop.*.pid > /.usrList.connected
source /usr/lib/cgi-bin/UserList.sh #new user gets in lets update the user list
####USER LIST LOOP####
# while true
# do
#   if [ ! "$(ps h $$)" ]; then rm .$USER.usrListLoop.$ID.pid .$USER.$ID.loggedIN .$USER.$ID.usrList.connected; ls /.*.usrListLoop.*.pid > /.usrList.connected; break; fi
#   #check if userlist diffs from earlier
#   if  [ "$(diff /.usrList.connected .$USER.$ID.usrList.connected)" ] || [ "$(diff /tmp/.loggedIN .$USER.$ID.loggedIN)" ]; then
#       echo -e "UserList\tuser\tstartUserList"; sleep 1
#       egrep $'\t'user:$'\t' /tmp/.loggedIN | egrep -v :$'\t'"$USER$" | while read user #list all users but me
#       do
#           sleep .1 #FierFox cannot handle the speed
#           #if the user is logged in and it is chat connected report it
#           uu="$(echo $user)"; uu=${uu/* /}
#           if [ "$(ls /.$uu.usrListLoop.*.pid)" ] && [ "$(cat /.$uu.usrListLoop.*.pid | sed 's/[^0-9]*//g' | xargs ps h)" ]; then echo -e "$user"; fi
#       done
#       egrep $'\t'group:$'\t' /tmp/.loggedIN | while read id from group users #list all the groups where I am member of 
#       do
#           sleep .1 #FierFox cannot handle the speed
#           for user in $users
#           do
#               if [ "$user" = "$USER" ]; then
#                 echo -e "UserList\tgroup:\t$group"
#                 break
#               fi
#           done
#       done 
#       echo -e "UserList\tuser\tendUserList"
#       cp /tmp/.loggedIN .$USER.$ID.loggedIN #updated the user list
#       cp /.usrList.connected .$USER.$ID.usrList.connected #updated the user list
#   fi
#   sleep 10
# # done | tee -a .$USER.usrList &
# done &
# PID=$!
# echo $PID > .$USER.usrListLoop.$ID.pid
# echo -n > .$USER.$ID.loggedIN
# echo -n > .$USER.$ID.usrList.connected
# ls /.*.usrListLoop.*.pid > /.usrList.connected
####Loop to send a command to the client ####
# while true
# do
#   #echo $me >> .$USER.log
#   if [ ! "$(ps h $$)" ]; then rm .$USER.cmdLoop.$ID.pid; break; fi
#   if [ -e /tmp/.wikilogout.cmd ]; then
#     source /usr/lib/cgi-bin/UserList.sh
#     rm /tmp/.wikilogout.cmd
#   fi
#   if [ -e .$USER.$ID.cmd ] && [ $me == 'false' ]; then
#     CMD="$(< .$USER.$ID.cmd)"
#     echo -e "cmd\t$USER\t$CMD" | tee -a chat.log
#     rm .$USER.$iD.cmd
#   fi
#   sleep 1
#   if [ $me == 'true' ] && [ ! -e .$USER.$ID.cmd ]; then
#     me='false'
#   fi
# done &
# PiD=$!
# echo $PiD > .$USER.cmdLoop.$ID.pid
####command from client####
while read cmd
do 
  echo "received: $cmd" >> chat.log   
  if [ "$cmd" = "closeconnection" ]; then echo $(date) closeConnection >> chat.log; kill $tailPID $pid $PID; rm /.msgLoop.$ID.fifo .$USER.usrListLoop.$ID.pid; source /usr/lib/cgi-bin/UserList.sh; break
  elif [ "$cmd" = "logout" ]; then echo "loggin out: $USER" >> chat.log
  fi
done
rm  -f .$USER.cmdLoop.$ID.pid .$USER.$ID.log .$USER.usrListLoop.$ID.pid .$USER.usrListLoop.$ID.pid .$USER.$ID.loggedIN .$USER.$ID.usrList.connected /.msgLoop.$ID.fifo
ls /.*.usrListLoop.*.pid > /.usrList.connected

#!/bin/bash
source /usr/lib/cgi-bin/defs.conf
sqlite3 $db "select name from auth_cookie" | sort | uniq | sed 's/^/UserList\tuser:\t/' > /tmp/.usersloggedIN
mysql -uroot -pletmein  --skip-column-names <<< "use groupChat; select groupName,users FROM users;" | sed 's/^/UserList\tgroup:\t/' > /tmp/.groupsloggedIN
cat /tmp/.usersloggedIN /tmp/.groupsloggedIN > /tmp/.loggedIN
chown www-data:www-data /tmp/.loggedIN /tmp/.usersloggedIN /tmp/.groupsloggedIN
echo updateUserList >> /tmp/.msgLoop.cmd

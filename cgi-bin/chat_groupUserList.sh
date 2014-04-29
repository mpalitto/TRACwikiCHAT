#!/bin/bash
echo "Content-Type: text/plain; charset=ISO-8859-1"
echo
echo "$QUERY_STRING" >> /tmp/test.log
cmd="$(echo "$QUERY_STRING" | sed "s/'/%27/g;"'s/%20/ /g;s/%22/\"/g;s/.*&//')"
echo $cmd >> /tmp/test.log
eval "$cmd"

mysql -uroot -pletmein --skip-column-names <<< "use groupChat; select users from users where groupName='$groupName';" | tee -a /tmp/test.log

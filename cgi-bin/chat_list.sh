#!/bin/bash
#generates the list of chat history
echo "Content-Type: text/plain; charset=ISO-8859-1"
echo
echo "$QUERY_STRING" >> /tmp/test.log
#cmd="$(echo "$QUERY_STRING" | sed 's/%20/ /g;s/%22/\"/g;s/.*&//')"
cmd="$(echo "$QUERY_STRING" | sed "s/'/%27/g;"'s/%20/ /g;s/%22/\"/g;s/.*&//')"
echo $cmd >> /tmp/test.log
eval "$cmd"

if [ "$user" ]; then #if user is logged in
  #sanatize user names
  user=${user// /_}
  ls -t /var/www/CHATs/$user/
fi

#!/bin/bash
echo "Content-Type: text/plain; charset=ISO-8859-1"
echo
echo "$QUERY_STRING" >> /tmp/test.log
#cmd="$(echo "$QUERY_STRING" | sed 's/%20/ /g;s/%22/\"/g;s/.*&//')"
cmd="$(echo "$QUERY_STRING" | sed "s/'/%27/g;"'s/%20/ /g;s/%22/\"/g;s/.*&//')"
echo $cmd >> /tmp/test.log
eval "$cmd"

source /usr/lib/cgi-bin/defs.conf
#user=matteo
sqlite3 $db "select name from auth_cookie" | sort | uniq > /tmp/.loggedin

groups="$(mysql -uroot -pletmein --skip-column-name <<< "use groupChat; select groupName from users where users like '"%$user%"';")"

echo "<form action="/cgi-bin/addToExistingGroup.sh" method="POST" id='existingGroupsForm'>"
for group in $groups
do
    mysql -uroot -pletmein --skip-column-name <<< "use groupChat; select users from users where groupName='$group';" | sed 's/ /\n/g' | sort > /tmp/.$group

    missing="$(comm -23 /tmp/.loggedin /tmp/.$group)"
    if [ "$missing" ]; then
        echo -n "<input type='radio' name='existingGroup' class='existingGroups' value='$group' onclick='javascript:\$(\"#groupName\").val(\"$group\");\$(\"#checkboxes\").html(\""
        for user in $missing
        do
            echo -n "<input type=\\\"checkbox\\\" class=\\\"existingGroups\\\" value=\\\"$user\\\">$user</br>"
        done
        echo  "\");'>$group"
        #echo "</br>"
    fi
done
echo "</form>"

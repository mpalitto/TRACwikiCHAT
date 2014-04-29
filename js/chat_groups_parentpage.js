//ADD group: it allow to add new groups or to add users to existing groups
$('body').append('<div id="addGroup"></div>');

$(document).ready(function(){
  $('#iframeID').load(function(){
    if(logged=='yes') {
       $('#mainnav', iframe).find('.first').after('<li><a id="groupChat" href="javascript:void(null);" >GroupChat</a></li>');
       $('#groupChat', iframe).click(function(){
           var addGroup=$('#addGroup');
           //start from a clean slate
           addGroup.html('<input type="radio" id="existingGroups" onclick="javascript:enableExistingGroups();">Add To existing groups:</br>');

           //get the list of groups the user is part of for "adding users to the existing group" function
           //the server returns the users logged-in but not part of the group yet
                 $.ajax({
                     url:"/cgi-bin/chat_getGroups.sh?user=%22"+user+"%22",
                     cache:false,
                     async: false,
                     type:"POST",
                     dataType:"text",
                     success: function(data) {
                       //alert(data);
                       addGroup.append(data);
                     }
                 });

           addGroup.append('</br><input type="radio" id="newGroup" onclick="javascript:enableNewGroup();">New Group:</br>');
           addGroup.append('<div id="GroupForm"></div>');
           $('#GroupForm').append('Group Name:<input type="text" class="newGroup" id="groupName"><br>'); //input the group name
           $('#groupName').keydown(function(event) {
                 // Ensure that it is a number and stop the keypress
                 console.log(event.keyCode);
                 if ( event.keyCode == 32 ) {
                      alert('Spaces are not allowed it will be replaced by under_scores');
                      event.preventDefault(); 
                 }       
          });

          $('#GroupForm').append('<div id="checkboxes"></div>');
          //open the addGroup dialog box
          $('.newGroup').attr('disabled',true);
          $('.existingGroups').attr('disabled',true);
          $("#addGroup").dialog("open");
       });
       $('#mainnav', iframe).find('.first').after('<li><a href="/project/svn-helloworld/wiki/user/chats" >Chats</a></li>');
    }
  });
});
var newGroup='no';
   function enableNewGroup(){
        newGroup='yes';
       //add the logged-in users to the add group addGroup
       $('#checkboxes').remove(); $('#addGroup').append('<div id="checkboxes"></div>');
       $('.user', iframe).each(function(){
           $('#checkboxes').append('<input type="checkbox" class="checkbox" value="'+$(this).text()+'" >'+$(this).text()+'</br>');
       });
       $('#groupName').val('');
       $('#existingGroups').attr('checked',false);
       $('.existingGroups').attr('checked',false);
       $('.existingGroups').attr('disabled',true);
       $('.newGroup').attr('disabled',false);
       //alert('HI');
   }
   function enableExistingGroups(){
       newGroup='no';
       $('#checkboxes').remove(); $('#addGroup').append('<div id="checkboxes"></div>');
       $('#newGroup').attr('checked',false);
       $('#groupName').val('');
       $('.newGroup').attr('checked',false);
       $('.newGroup').attr('disabled',true);
       $('.existingGroups').attr('disabled',false);
       //alert('HI');
   }

$(function() {
   //addGroupUI dialogbox
   $("#addGroup").dialog({
       autoOpen: false,
       modal: true,
       resizable: false,
       dialogClass: "dlg-no-close",
       dialogClass: "dlg-no-title",
       buttons: {
           "ADD Group": function() { //when the "ADD group" button is clicked
               var n = 0;
               var users = '';
               var groupName=$.trim($('#groupName').val());
               if (groupName=="") { alert('Please enter a group name'); }
               else {
                   groupName=groupName.replace(/ /g,'_');
                   $("#checkboxes").children("input:checked").each(
                      function() {
                           n=n+1;
                           users += $(this).val() + " ";
                       }
                   );
                   if (n==0){ alert('add at least one more user to the group'); }
                   else {
                       if(newGroup == 'yes') {users += user};
                       //alert('Group Name: '+groupName+' users: '+users);
                       $.ajax({
                         url:"/cgi-bin/chat_addGroup.sh?users=%22"+users+"%22;newGroup=%22"+newGroup+"%22;groupName=%22"+groupName+"%22",
                         cache:false,
                         async: false,
                         type:"POST",
                         success: function(data) {
                           if($.trim(data).length>0){
                             alert(data);
                           }
                         }
                       });
                       //alert('i m running');
                       //$('#addGroup').dialog("close");
                       sendme('System',groupName,'"'+users.replace(/ /g,", ")+'" have entered the chat');
                       $(this).dialog("close");
                   }
               }
           },
           "Cancel": function() {
               $(this).dialog("close");
           }
       }
   });
   //add the click function for the "GroupChat" button

});

//LEAVE group: it allows a user to leave an existing group of which he is part of
$('body').append('<div id="tmp"><div id="leaveGroup"></div>');
//$('.leaveGroup').each(function(){alert($(this).attr('value'))});
$(function() {
   //leaveGroup UI dialogbox
   $("#leaveGroup").dialog({
       autoOpen: false,
       modal: true,
       resizable: false,
       dialogClass: "dlg-no-close",
       dialogClass: "dlg-no-title",
       buttons: {
           "LEAVE Group": function() { //when the "LEAVE group button is clicked
               var groupName=$('#leaveGroup').attr('value');
               //alert(groupName);
               $.ajax({
                 url:"/cgi-bin/chat_leaveGroup.sh?user=%22"+user+"%22;groupName=%22"+groupName+"%22;type=%22leaveGroup%22",
                 cache:false,
                 async: false,
                 type:"POST"
               });

               sendme('System',groupName,'"'+user+'" has left the chat');
               $(this).dialog("close");
               updateUserList();
           },
           "Cancel": function() {
               $(this).dialog("close");
           }
       }
   });
});
   //add the click function for the "leaveGroupChat" x button
   function leaveGroup(group){
       //add the logged-in users to the add group myForm
       //alert(group);
       $('#leaveGroup').text('You are about to leave group: '+group); //starting from a clean slate
       $('#leaveGroup').attr('value',group);
       //open leaveGroup dialog box
       $("#leaveGroup").dialog("open");
   };
// $('a[href$="logout"]', iframe).click(function(event){$('.group').each(function(){
//                  var groupName=$(this).text();
//                  //alert('user: '+user+' leaving: '+$(this).attr('value'));
//                  $.ajax({
//                      url:"/cgi-bin/chat_leaveGroup.sh?user=%22"+user+"%22;groupName=%22"+groupName+"%22;type=%22logout%22",
//                      cache:false,
//                      async: false,
//                      type:"POST",
//                      success: function(data) {
//                        //alert(data);
//                        if (data=="leftGroup") { sendme(groupName,'System','"'+user+'" has logged out') };
//                      }
//                });
// })});

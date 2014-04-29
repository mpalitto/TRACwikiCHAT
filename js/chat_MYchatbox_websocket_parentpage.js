var ws = null; //web socket
function chat_matteo() { //making variables private
$(document).ready(function(){

var newMsg="";    //new message string
var Nmsg={};      //number of messages 
var DN={};        //number of messages that have beem displayed already
var lastid=0;     //last DB message id for future use
var boxMsgs = []; //array of messages for the chatbox used for organizing the cookie messages into an array for easy access
//create boxes
//var idList = [];
createBox =  function(id) {
          //$().MYchatbox(id, function(to, mymsg){alert('message sent '+to+': '+mymsg)});
          $().MYchatbox({from: user, to: id, sendCallBack: sendme, closeCallBack: closeBox});
          if(isNaN(DN[id])){
              $("#"+id).html(""); //initialize in case there was some content already
              DN[id]=0; //the number of displayed messages has to be zero
              //boxMsgs="";
          // } else {
          //     checkNewMsg(id);
          }
          checkNewMsg(id);
  }
closeBox = function(id) {
    DN[id] = 0;
}

createGroupBox =  function(id) {
  var mynewvar="";
  createBox(id);
  //get the list of users part of  the group chat and show it
  $.ajax({
    url: '/cgi-bin/chat_groupUserList.sh?groupName="'+id+'"',
    type: "POST",
    //data: {tabn:$.cookie("ntabs")},
    cache: false,
    dataType: "text",
    success: function(data) {
      mynewvar=$.trim(data).replace(/ /g,', ');
      //addMsgToCookie(id,'chat users',"che cavolo "+mynewvar);
      addMsgToCookie(id,'chat users',mynewvar);
      //alert(mynewvar);
    }
  });
  //addMsgToCookie(id,'chat users','che cavolo ');
  //checkNewMsg();
  }
//check if the number of messages in the chatbox cookie is greater than what it is "displayed"
//in which case display the new messages
var box=null;
var firstTime={};
checkNewMsg=function(id){
  //if(onFocus==true){
    box=$("#"+id); 
    //if(box.html()!=null) { //the .html() is null if the box is not open in the page. This happens when the page is reloaded or a new page is opened.
        //check box cookie msg counter against displayed msg counter
        if($.cookie(id+'Nmsg') == null) { Nmsg[id]=0; DN[id]=0; $.cookie(id+"Nmsg",Nmsg[id],{path:'/'})}
        else { Nmsg[id] = parseInt($.cookie(id+'Nmsg')) }

        console.log("ID: "+id+" - DN: "+DN[id]+" Nmsg:"+Nmsg[id]);
        //display the new messages
        if ( Nmsg[id] > DN[id] ) {
            if(newUserList[id] == 1 && box.length == 0){ createBox(id); }; //if(firstTime[id]!='no'){$('#matteoTest_'+id).trigger('click')}};
            console.log("from: "+id+" - DN: "+DN[id]+" Nmsg:"+Nmsg[id]+" firstTime: "+firstTime[id]);
            //update boxMsgs with the one found in the message cookie for the chatbox
            boxMsgs=$.cookie(id).split('\n'); //orgnize each message into an array for easy access
            var Nmsgs=boxMsgs.length; //Number of messages in the cookie
            var DiffNmsgs=Nmsg[id]-Nmsgs; //if cookie overflows this is the difference between the total messages an the ones in the cookie
            var i=DN[id]-DiffNmsgs;
            console.log('i: '+i+' Nmsgs: '+Nmsgs);
            if(i<0) {i=0; DN[id]=DiffNmsgs;} //if it is a new box and the cookie has reached the limit 2K of storage
            for (i=i;i<Nmsgs;i++)
            {
               console.log('i: '+i+' Nmsgs: '+Nmsgs);
               box.MYchatbox.addTXT(id, boxMsgs[i]);
            }
            DN[id]=Nmsg[id];
        }
        firstTime[id]='no';
    //}
    //}
};

//when a new user has logged on start listening for the change in the user's message cookie
var TlistenCookie = {}; //the array of listeners for new messages per chatbox
usersCookieListener = function(userName) {
         console.log('usersCookieListener called for: '+userName);
         
         if($.cookie(userName+'Nmsg') == null) { Nmsg[userName]=0; DN[userName]=0; $.cookie(userName+"Nmsg",Nmsg[userName],{path:'/'})}
         //else { Nmsg[userName] = $.cookie(userName+'Nmsg'); DN[userName] = Nmsg[userName] }
         else { Nmsg[userName] = $.cookie(userName+'Nmsg'); DN[userName] = 0 }
         //TlistenCookie[userName] = setInterval(function() {checkNewMsg(userName)}, 1000);
}

//////////////////////// the send a new message section//////////////////////////////////////////////////////
////////// it deals with the processing of the data entered in the input area of the chat box ///////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// when a message is either received from server or entered using the input field in the chatbox
// it is added to the cookie so that will be accessible from all tabs open on the same site domain
addMsgToCookie=function(id,user,msg){
   //alert("to: "+id+" from: "+user+" MSG: "+msg);
   //console.log("to: "+id+" from: "+user+" MSG: "+msg);
   //add new msg to the box cookie
   newMsg='<b>'+user+': </b><span>'+msg+'</span>';
   //Nmsg[id]=parseInt($.cookie(id+"Nmsg"));
   if($.cookie(id+'Nmsg') == null) { Nmsg[id]=0; DN[id]=0; $.cookie(id+"Nmsg",Nmsg[id],{path:'/'})}
   else { Nmsg[id] = parseInt($.cookie(id+'Nmsg')) }
   if(Nmsg[id]==0) { boxMsgs=newMsg; }
   else { 
       boxMsgs=$.cookie(id)+'\n'+newMsg; 
       console.log(boxMsgs.length);
       while (boxMsgs.length > 2048) { //the cookie is 2k it can't hold more
          boxMsgs=boxMsgs.replace(/(.*\n{1}){1}/,""); //removing the earliest entry
          //since if one message is removed and one is added the total number of messages in the cookie might remain unchanged
          console.log(boxMsgs.length);
          //console.log(boxMsgs);
       }
   };
   $.cookie(id,boxMsgs,{path:'/'}); //store the new set of messages into the message cookie
   Nmsg[id]++;
   console.log("New MSG added by: "+user+" - DN: "+DN[id]+" Nmsg:"+Nmsg[id]);
   $.cookie(id+"Nmsg",Nmsg[id],{path:'/'}); //alert(id+' Nmsg: '+Nmsg[id]);
   checkNewMsg(id);
};

//the following function replaces the http(s)://,ftp:// or file:// with the html clickable version of the link
function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a style='color:blue' href='$1'>$1</a>");
}

//when a new message is entered in the chatbox it gets added to the chatbox message cookie and sent to the server's DB 
sendme=function(from, to, msg){
        console.log('send: '+msg);
        msg=replaceURLWithHTMLLinks(msg); //check if there is a link in the message and convert it into clickable link
        if(from != 'System') {addMsgToCookie(to,user,msg)}; //if it is a system message it gets broadcasted to all, thus to me as well
        msg=msg.replace(/\"/g,"myESC22"); //the server side uses the double quotes for string delimiting
        //update message into DB
        msg=encodeURIComponent(msg); //it looks like this is automatically performed by the browser or jquery
        msg=msg.replace(/'/g,"%27");
        console.log('send: '+msg);
        $.ajax({
          url: '/cgi-bin/chat_send.sh?from="'+from+'";to="'+to+'";message="'+msg+'";userID="'+userID+'"',
          type: "POST",
          //data: {tabn:$.cookie("ntabs")},
          cache: false,
          dataType: "text",
          success: function(data) {
            lastid=data;
          }
        });
};

//register the function to be executed when a message is entered in the box
//chatboxManager.init({messageSent : sendme});

  var onFocus=false;
  var file="";

// $('a[href$="logout"]', iframe).click(function(event){
//     $.cookie('logged',false,{path : '/'});
//     ws.close();
//     alert('loggingout...');
//     logged="no";
//     $.ajax({
//       url:"/cgi-bin/wiki_logout.sh",
//       data:"user="+user,
//       cache:false,
//       async: false,
//       type:"GET",
//     });
// });

checkLogged = function() {
    //console.log(logged+' : '+$.cookie('logged'));
    if( $.cookie('logged')=='false' && logged=='yes' && $.cookie('connecting')==null) { logged='no'; $('#iframeID')[0].contentWindow.location.reload(true); }
    if( $.cookie('logged')=='true' && logged=='no') { logged='yes'; $('#iframeID')[0].contentWindow.location.reload(true); }
    setTimeout(function(){checkLogged()}, 3000); //check once every 3 seconds
}

$('#iframeID').load(function(){
    $('a[href$="login"]', iframe).click(function(event){
        newUserList = {}; //associative array the key is the user name, the value is 1 if the user exists
        oldUserList = {}; //associative array the key is the user name, the value is 1 if the user exists
        userList="";
    });
});

///////////////////////////////////////// Logged User ///////////////////////////////////////////
///// this section updates the list of users logged in and starting a listener for new msgs  ////
///// the listner will update the chatbox message cookie that will be pickedup and displayed ////
/////////////////////////////////////////////////////////////////////////////////////////////////

//provides a way to check on a 
var newUserList = {}; //associative array the key is the user name, the value is 1 if the user exists
var oldUserList = {}; //associative array the key is the user name, the value is 1 if the user exists

//check the new user list against the old user list 
//and it provides a way to call a function in case the user is added and another one if the user is deleted
function listen4NewUser() {
    $.each(newUserList, function(username, v) {if(oldUserList[username] != 1){if(username != user){usersCookieListener(username); console.log('new user: '+username)}}}); //user has logged in
    $.each(oldUserList, function(username, v) {if(newUserList[username] != 1){clearInterval(TlistenCookie[username]); console.log('user: '+username+' has logged out')}}); //user has logged out
    oldUserList = newUserList;
}

updateUserList = function(from,user) {
        if (user=='startUserList') {
          userList="";
          $('#users', iframe).text('');
          newUserList={};
        } else if (user=='endUserList') { listen4NewUser(); }
        else {
          if (from=='user:') { userList=userList+"<li><a class='user' href='javascript:void(null);' onclick=\"javascript:parent.createBox('"+user+"')\">"+user+"</a></li>" }
          else if (from=='group:'){ userList=userList+"<li><a class='group' href='javascript:void(null);' onclick=\"javascript:parent.createGroupBox('"+user+"')\">"+user+"</a><a value='"+user+"' class='leaveGroup' href='javascript:void(null)' onclick=\"javascript:parent.leaveGroup('"+user+"')\">    x</a></li>" }
          $('#users', iframe).html(userList);
          newUserList[user] = 1;
        }
};
// updateUserList = function() {
//    if(logged=="yes") {
//      $.ajax({
//         url:"/cgi-bin/addUser2List.sh?user=%22"+user+"%22;type=%22"+logged+"%22",
//         //data:"user=%22"+user+"%22;type=%22"+logged+"%22",
//         cache:false,
//         async: false,
//         type:"POST",
//         success:function(data) {
//           //alert(data);
//           //$('#users').text(data);
//           file = $.trim(data).split('\n');
//           $('#users').text('');
//           newUserList={};
//           $.each(file, function(index,v) {
//             v=$.trim(v);
//             if(v.length > 0){ //for not empty lines
//                 //alert($(file[index]).text());
//                 $('#users').append(v);
//                 //newUserList[$(v).text()] = 1;
//             }
//           });
//           $('.user').each(function(){newUserList[$(this).text()] = 1});
//           $('.group').each(function(){newUserList[$(this).text()] = 1});
//           listen4NewUser();
//         }
//      });
//    }
//    setTimeout(function(){updateUserList()}, 30000); //Update list once every 10 seconds
// };

var toggle=true;
var timer=null;

  //updateUserList();
  checkLogged();

  clearFlashingTitle = function() {
      clearInterval(timer);
      timer=null;
      setTimeout(function(){document.title=title}, 1000); //it might take up to 1sec for the last call to timer to happen
  }

  $(window).blur(function(){
    onFocus=false;
  });
  $(window).focus(function(event){
      onFocus=true;
  });

exeCMD = function(from,cmd) {
    if (cmd=="logout") { $('a[href="/trac/testTRAC/logout"]', iframe)[0].click(); }
};

//read from DB for new messages
   var newMSGs;
   var id;
   var from;
   var msg;
   var fields;
   var serverIPaddress = $(location).attr('href').replace(new RegExp('http://', ''), '').replace(new RegExp('/.*', ''), '');
   var authN=0;

   connect2websocket = function(){
      if(logged=="yes"){
        //alert('logged!');
        if($.cookie('connected') == null && $.cookie('connecting') == null) {
          $.cookie('connecting',1,{path : '/'});
          setTimeout(function(){ $.cookie('connecting',1,{expires : -1, path : '/'}); connect2websocket() }, 30000); //I give it 30 secs to connect and before trying to connect again
          ws = new WebSocket('ws://'+serverIPaddress+':1212');
          if(ws != null) {
              ws.onopen = function() {
          //alert('connected to ws://'+serverIPaddress+':1212');
                  $.cookie('connected',1,{path : '/'});
                  $.cookie('connecting',1,{expires : -1, path : '/'});
                  ws.send(user);
                  authN=$('#iframeID')[0].contentWindow.document.cookie.indexOf('trac_auth');
                  ws.send($('#iframeID')[0].contentWindow.document.cookie.slice(authN+10,authN+42));
                  clearInterval(timer);
                  if(onFocus==false){ timer=setInterval(function(){if(toggle==true){document.title="CHAT connected"; toggle=false} else {document.title=title; toggle=true}},1000);} //start toggle
              };
              ws.onclose = function() {
                  //alert('closing connection to ws://'+serverIPaddress+':1212');
                  clearInterval(timer);
                  timer=null;
                  setTimeout(function(){document.title=title}, 1000); //it might take up to 1sec for the last call to timer to happen
                  userList="";
                   $('#users', iframe).html(userList);
                  $.cookie('connected',1,{expires : -1, path : '/'});
                  $.cookie('connecting',1,{expires : -1, path : '/'});
                  ws.send('closeconnection');
                  setTimeout(function(){connect2websocket()}, 30000); //30 seconds
                  $.each(newUserList, function(username, v) {
                      clearInterval(TlistenCookie[username]); //user has logged out clear all the listeners
                  });
                  //alert('chat connection is now closed');
              };
              ws.onmessage = function(event) {
                  //alert(event.data);
                  newMSGs=$.trim(event.data);
                  console.log(newMSGs);
                  if(newMSGs.length > 0) {
                      //newMSGs=newMSGs.split('\n');
                      //$.each(newMSGs, function (i){
                          fields=newMSGs.split('\t'); id=fields[0]; from=fields[1]; msg=decodeURIComponent(fields[2]);
                          msg=msg.replace(/myESC22/g,'\"'); //the server side uses the double quotes for string delimiting
                          if(newUserList[id]!=1){ console.log('received msg for user not in the list: '+id) };//I have received a message for a user/group not yet in the list
                          if(id=="system") { alert("System: " + msg) }
                          else if (id=="UserList") { updateUserList(from,msg) }
                          else if (id=="cmd") { exeCMD(from,msg) }
                          else if (id=="userID") { userID = msg }
                          //else if (id=="UserList") { console.log(newMSGs) }
                          else { 
                              addMsgToCookie(id,from,msg)
                              //blink title as an alert of a new message until it is visited
                              clearInterval(timer);
                              if(onFocus==false){ timer=setInterval(function(){if(toggle==true){document.title="new message"; toggle=false} else {document.title=title; toggle=true}},1000);} //start toggle
                              }
                          console.log('from: "'+from+'" msg: "'+msg+'"');
                      //});
                      //$('#'+id).chatbox('option', 'boxManager')._scrollToBottom();
                  }
              }; 
            } else { setTimeout(function(){connect2websocket()}, 2000) }; //2 seconds 
        } else { setTimeout(function(){connect2websocket()}, 20000) }; //20 seconds 
      } else { setTimeout(function(){connect2websocket()}, 3000) }; //3 seconds 
    };
    connect2websocket();

    $(window).unload(function () { if(ws != null) {ws.send('closeconnection'); $.cookie('connected',1,{expires : -1, path : '/'}); console.log("websocket disconnected!"); setTimeout(function(){ws.close()},1000) }});
//  });
});

 //return addMsgToCookie;
}
chat_matteo();


TRACwikiCHAT
============

TRAC wiki CHAT with websocket and shellscipt for the server side and jquery for the client side.

This project:

*    CHAT to integrate with the TRAC wiki system.
*    Use BASH shell scripting for the server side and JQuery for the client side.
*    Use the new technology called WEBSOCKET.
*    Allows multiple conversations at the same time.
*    Facilitate group conversations.
*    Allow the same user to have several sessions opened at the same time (a user logged in from different computers or using more than one browser). 

Demo

http://matteo.awiki.org/matteoProject/wiki/portingWikiChat

WEBSOCKET

WebSockets represent a standard for bi-directional realtime communication between servers and clients. Firstly in web browsers, but ultimately between any server and any client.

It is an persistent connection between the client and the server and both parties can start sending data at any time.

It allows to send messages to a server and receive event-driven responses without having to poll the server for a reply.
meet websocketd

It turns anything that takes standard-in and standard-out into a websocket server!.

So long as you can write an executable program that reads STDIN and writes STDOUT, you can build a WebSocket server.

​https://github.com/joewalnes/websocketd/wiki

This is perfect for developing the server using BASH shell script!
WEBSOCKETs the good news

no need for polling for new messages.
WEBSOCKETs the bad news

Every time the page is re-loaded the connection dies and a new connection needs to be re-established... which is a process that takes a minute or so.
the Problem

TRAC reloads a page every time a link is clicked on.
the Solution

load TRAC into an iframe and have the wiki chat running on the parent page... clicking a link in the wiki page causes the content of iframe to be re-loaded but not the parent page where the chat code and the websocket connection reside. 

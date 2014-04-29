(function($) {
    var ww; //window width used for positioning box to the left side of the screen
    var n = 0; //box number used for positioning the boxes side-by-side
    var larghezza; //width of the box itself
    var width; //width of box internal elements (content area and text input area)
    var $content = {}; //for performance I store the content jQuery object when the box is created to have it available later when the content will be added
    $.fn.MYchatbox = function(options) {
      var settings = $.extend({ from: 'me', to: 'you', width: 213, sendCallBack: function(from, to, mymsg){alert('default send func '+to+': '+mymsg)}, closeCallBack: function(to){alert('default close func')}}, options);
      var id = settings.to;  //the msg recipient is also the box ID
      var from = settings.from;
      larghezza = settings.width;
      width = larghezza - 13;
      ww = $(window).width();
      var $boxDIV=$('<div id="'+id+'" class="MYchatbox"></div>'); //box div
      var $txtIN=$('<textarea class="txtIN" style="height: 50px; width: '+width+'px; position: absolute; left: 3px; bottom: 7px; resize: none;"></textarea>'); //box text input area
      $content[id]=$('<div class="content" disabled style="overflow-y: auto; background-color: #ffffff; height: 240px; width: '+width+'px; position: absolute; left: 3px; bottom: 65px; resize: none;"></div>'); //box message content
      var $dialog; //the dialog box when created generates another div which will end up inside the box div defined earlier

      if($('#'+id).length == 0) {
        n++;
        $dialog = $boxDIV.appendTo(document.body)
        .dialog({ 
              draggable: false,
              title: id,
              width: width,
              height: 350,
              position: [ww-n*larghezza,'bottom'], 
              resizable: false,
              close: function( event, ui ) { //when the close button is pressed
                   $boxDIV.remove(); //remove box from DOM
                   reposition();     //a box has been closed the others need to be repositioned
                   if($.isFunction(settings.closeCallBack)){ settings.closeCallBack.call(this, id) }; //callback function when close button is prssed
              }
        }).parent().css('position','fixed'); //so it won't scroll off the page
        $content[id] = $content[id].appendTo($dialog);
        $txtIN = $txtIN.appendTo($dialog);
        $txtIN.keydown(function(event) {
            if (event.keyCode && event.keyCode == $.ui.keyCode.ENTER) {
                msg = $.trim($txtIN.val());
                $txtIN.val(''); //clear text area after the msg is sent
                //console.log(msg);
                if (msg.length > 0) {
                   if($.isFunction(settings.sendCallBack)){ settings.sendCallBack.call(this, from, id, msg) };
                }
                return false;
            }
        });
      };
    };
    reposition = function () { //reposition boxes. usually called when a box is closed or the window is resized
        n = 0;
        ww = $(window).width(); 
        $('.MYchatbox').each(function(index){ n++; $(this).dialog('option','position', [ww-n*larghezza, 'bottom']) });
    };
    $(window).resize(function(){ reposition() }); //window has been risized boxes need to be repositioned

    $.fn.MYchatbox.addTXT = function(id, TXT) { //display any message into box content. Used when text is preformatted
        var newMsg='<div style="display: block; word-wrap: break-word; max-width: '+width+';">'+TXT+'</div>';
        $content[id].append(newMsg).scrollTop(200000); //scroll at the end of the content window
        reposition(); //in case the box was closed and the page was scrolloed
    };
    $.fn.MYchatbox.addMsg = function(id, from, messaggio) { //dispay message into box content with some default formatting
        var newMsg='<div style="display: block; word-wrap: break-word; max-width: '+width+'px;"><b>'+from+':</b> '+messaggio+'</div>';
        $content[id].append(newMsg).scrollTop(200000); //scroll at the end of the content window
        reposition(); //in case the box was closed and the page was scrolloed
    };
}( jQuery ));

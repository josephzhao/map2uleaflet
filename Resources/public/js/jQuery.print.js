/*  jQuery.print, version 1.0.3
 *  (c) Sathvik Ponangi, Doers' Guild
 * Licence: CC-By (http://creativecommons.org/licenses/by/3.0/)
 *--------------------------------------------------------------------------*/

(function($) {
    "use strict";
    // A nice closure for our definitions

    function getjQueryObject(string) {
        // Make string a vaild jQuery thing
        var jqObj = $("");
        try {
            jqObj = $(string).clone();
        } catch (e) {
            jqObj = $("<span />").html(string);
        }
        return jqObj;
    }

    function isNode(o) {
        /* http://stackoverflow.com/a/384380/937891 */
        return !!(typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
    }


    $.print = $.fn.print = function() {
        // Print a given set of elements

        var options, $this, self = this;
        var height;
        var width;



        // console.log("Printing", this, arguments);

        if (self instanceof $) {
            // Get the node if it is a jQuery object
            self = self.get(0);
            height = self.clientHeight;
            width = self.clientWidth;
        }

        //  alert(parseFloat(width) / height);

        if (isNode(self)) {
            // If `this` is a HTML element, i.e. for
            // $(selector).print()
            $this = $(self);
            if (arguments.length > 0) {
                options = arguments[0];
            }
        } else {
            if (arguments.length > 0) {
                // $.print(selector,options)
                $this = $(arguments[0]);
                if (isNode($this[0])) {
                    if (arguments.length > 1) {
                        options = arguments[1];
                    }
                } else {
                    // $.print(options)
                    options = arguments[0];
                    $this = $("html");
                }
            } else {
                // $.print()
                $this = $("html");
            }
        }

        // Default options
        var defaults = {
            globalStyles: true,
            mediaPrint: false,
            stylesheet: null,
            noPrintSelector: ".no-print",
            iframe: true,
            append: null,
            prepend: null
        };
        // Merge with user-options
        options = $.extend({}, defaults, (options || {}));

        var $styles = $("");
        if (options.globalStyles) {
            // Apply the stlyes from the current sheet to the printed page
            $styles = $("style, link, meta, title");
        } else if (options.mediaPrint) {
            // Apply the media-print stylesheet
            $styles = $("link[media=print]");
        }
        if (options.stylesheet) {
            // Add a custom stylesheet if given
            $styles = $.merge($styles, $('<link rel="stylesheet" href="' + options.stylesheet + '">'));
        }

        // Create a copy of the element to print
        var copy = $this.clone();
        // Wrap it in a span to get the HTML markup string
        copy = $("<span/>").append(copy);
        //      copy.css("width", "300px");
        //   copy.css("width",300);
        //      copy.css("height", "300px");
        //  copy.css("height",200);
        copy.width(300);
        copy.height(200);
        copy.css("overflow", 'hidden');

        // Remove unwanted elements
        copy.find(options.noPrintSelector).remove();
        // Add in the styles
        copy.append($styles.clone());
        // Appedned content
        copy.append(getjQueryObject(options.append));
        // Prepended content
        copy.prepend(getjQueryObject(options.prepend));

        copy.css("width", 300);
        copy.css("height", 200);
        copy.css("overflow", 'hidden');

        // Get the HTML markup string
        var content = copy.html();
        // Destroy the copy
        $(content).css("width", 300);
        $(content).css("height", 200);
        $(content).css("overflow", 'hidden');

        copy.remove();
//        var url = Routing.generate("create_pdf");
//        alert(content);
//        alert(escape(content));
//        
//          var formData = new FormData();
//          formData.append('data',escape(content));
////alert(content);
////        alert(url);
//        $.ajax({
//            url: url,
//            method: 'POST',
//            data: formData,
//            cache: false,
//            contentType: false,
//            processData: false,
//            beforeSend: function() {
//                window.map.spin(true);
//            },
//            complete: function() {
//                window.map.spin(false);
//            },
//            error: function(response) {
//                window.map.spin(false);
//                alert(response);
//            },
//            success: function(response) {
//                var WindowObject = window.open("", "PrintWindow",
//                        "width=750,height=350,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes");
//                $(WindowObject.document.body).append(response);
//                WindowObject.document.close();
//                WindowObject.focus();
//                WindowObject.print();
//                WindowObject.close();
//
//
//            }
//        });
//
//        return;
        //  $.post(url,{data:content}, function(response){alert(response);});


//        var printWin = window.open('', '', 'width=' + width + ',height=' + height + ',left=0,top=0,toolbar=0,scrollbars=0,status  =0');
//        printWin.document.write(content);
//        //    printWin.document.close();
//        printWin.focus();
//        printWin.print();
//        printWin.close();


//var DocumentContainer = document.getElementById("leafmap");
//var html = '<html><head>'+
//               '<link href="css/template.css" rel="stylesheet" type="text/css" />'+
//               '</head><body style="background:#ffffff;">'+
//               DocumentContainer.innerHTML+
//               '</body></html>';
// 
//    var WindowObject = window.open("", "PrintWindow",
//    "width=750,height=350,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes");
//    WindowObject.document.write(content);
//    WindowObject.document.close();
//    WindowObject.focus();
//    WindowObject.print();
//    WindowObject.close();

//  var doc = new jsPDF();
//  doc.fromHTML(content);
//  var string = doc.output('datauristring');
//
//var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
//
//var x = window.open();
//x.document.open();
//x.document.write(iframe);
//x.document.close();

        var pane = $(content).find('div.leaflet-map-pane');

        pane.css("width", 300);
        pane.css("height", 300);
        pane.css("overflow", 'hidden');
        
        var w, wdoc;
        if (options.iframe) {
            // Use an iframe for printing
            try {
                var $iframe = $(options.iframe + "");
                var iframeCount = $iframe.length;

                if (iframeCount === 0) {
                    // Create a new iFrame if none is given
                    $iframe = $('<iframe height="0" width="0" border="0" wmode="Opaque"/>').prependTo('body').css({
                        "position": "absolute",
//                        "width": width,
//                        "height": height,
                        //                       "padding": "500px",
                        //                       "margin": "500px",
                        "top": -999,
                        "left": -999
                    });
                }
                w = $iframe.get(0);
                w = w.contentWindow || w.contentDocument || w;
                wdoc = w.document || w.contentDocument || w;

                //   alert(height + "," + width+","+wdoc.body.getBoundingClientRect().height + ","+wdoc.body.getBoundingClientRect().width) ;




                //           wdoc.body.innerHeight = 300;// height;
                //          wdoc.body.innerWidth = 500;//width;

                wdoc.open();
                wdoc.write(content);


                wdoc.close();
                setTimeout(function() {
                    // Fix for IE : Allow it to render the iframe
                    w.focus();
                    w.print();
                    setTimeout(function() {
                        // Fix for IE
                        if (iframeCount === 0) {
                            // Destroy the iframe if created here
                            $iframe.remove();
                        }
                    }, 100);
                }, 250);
            } catch (e) {
                // Use the pop-up method if iframe fails for some reason
                console.error("Failed to print from iframe", e.stack, e.message);
                w = window.open();
                w.document.write(content);

                w.document.close();
                w.focus();
                w.print();
                w.close();
            }
        } else {
            // Use a new window for printing
            w = window.open();
            w.document.write(content);
            w.document.close();
            w.focus();

            w.print();
            w.close();
        }

//var doc = new jsPDF();
//  doc.fromHTML($iframe.html(),200,100);
//  var string = doc.output('datauristring');
//
//var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>";
//
//var x = window.open();
//x.document.open();
//x.document.write(iframe);
//x.document.close();
////
//        $(content).innerWidth(width);
//         $(content).innerHeight(height);
//       
        //     alert(height + "," + width+","+w.document.body.getBoundingClientRect().height + ","+w.document.body.getBoundingClientRect().width) ;
//      alert($(content).height() + "," + $(content).width()) ;
        // alert("3="+w.document.body.clientHeight+","+w.document.body.clientWidth);
        return this;
    };

})(jQuery);

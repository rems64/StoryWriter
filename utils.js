const $ = require("jquery");
const { SVG } = require("./svg.esm.js");
const fs = require("fs");
const ipc = require('electron').ipcRenderer;

var isInpupPopupOpen = false;
var concernedObj;

var locals = {}

ipc.send('getLocals', {});
ipc.on('sendLocals', (event, data) => {
    console.log("Async reply")
    console.log(data);
    locals=data.locals
});


function isNode()
{
    return ((typeof process !== 'undefined') && (process.release.name === 'node'))
}

function colorPicker(parent, loc)
{
    var self = this;
    console.log(loc)
    this.container = document.createElement('div');
    $(this.container).addClass("colorPickerContainer").appendTo($(parent));
    $(this.container).css("left", loc.x);
    $(this.container).css("top", loc.y);

    this.hueGradient = document.createElement('div');
    $(this.hueGradient).addClass("hg-master").appendTo($(this.container));

    this.circleGradient = document.createElement('div');
    $(this.circleGradient).addClass("hg-circle").appendTo($(this.container));

    this.circleSelected = false;
    $(this.circleGradient).on("mousedown", function(event) {
        self.circleSelected = true;
        
    });
    $(document).on("mouseup", function(event) {
        self.circleSelected = false;
    });
    $(document).on("mousemove", function(event) {
        var xPos = event.clientX-40-$(self.container).position().left;
        if(self.circleSelected) {
            if((xPos+20)>$(self.hueGradient).position().left-20)
                if((xPos+20)<($(self.hueGradient).position().left+$(self.hueGradient).width()-20))
                    $(self.circleGradient).css({left:xPos-10+'px'});
                else
                    $(self.circleGradient).css({left:($(self.hueGradient).position().left+$(self.hueGradient).width())-50+'px'});
            else
                $(self.circleGradient).css({left:$(self.hueGradient).position().left-50+'px'});
            var colH = (($(self.circleGradient).position().left-$(self.hueGradient).position().left)/($(self.hueGradient).width()))*360
            console.log(colH)
            $(self.circleGradient).css("background-color", "hsl("+ colH +",100%, 50%)")
        }
    });
    this.init = function() {

    }
    this.init();
}

function ContextMenu(parent, loc, elements)
{
    var self = this;
    this.container = document.createElement("div");
    this.elements = [];
    this.destroy = function() {
        console.log("Bye bye")
        //$(this.container).remove();
        $(".contextMenuContainer").remove();
    };
    $(this.container).on("mouseleave", function() {
        console.log("Destroying");
        $(".contextMenuContainer").remove();
    })
    if(parent!=false)
    {
        $(this.container).addClass("contextMenuContainer").appendTo($(parent));
    }
    else
    {
        $(this.container).addClass("contextMenuContainer").appendTo($("body"));
    }
    this.init = function() {
        var j = 0;
        for(var i in elements) {
            this.elements.push(new ContextMenuElement(this, {
                title: i,
                callback: elements[i].callback,
                additionalClasses: elements[i].additionalClasses
            }));
        }
        $(this.container).css("left", String(loc.x-10)+"px");
        if((loc.y+($(this.container).height()))>($(document).height()))
        {
            $(this.container).css("top", String(loc.y-(20+((loc.y-10+($(this.container).height()))-($(document).height()))))+"px");
            console.log("DEPASSE")
        }
        else
        {
            $(this.container).css("top", String(loc.y-10)+"px");
        }
    }
    this.init()
    this.remove = function() {
        /*
        for(var i in this.elements) {
            console.log(i)
            this.elements[i].remove();
        }*/
        this.container.remove();
    }
}

function ContextMenuElement(ctxtMenu, infos)
{
    this.bg = document.createElement("div");
    this.bg.innerHTML = infos.title;
    this.init = function() {
        $(this.bg).addClass("contextMenuElement").appendTo($(ctxtMenu.container));
        console.log(infos.additionalClasses);
        for(var i in infos.additionalClasses)
        {
            $(this.bg).addClass(infos.additionalClasses[i]);
            console.log(infos.additionalClasses[i])
        }
    }
    this.init();
    $(this.bg).on("click", function() {
        ctxtMenu.remove();
        infos.callback();
    })
}

function showColorPopop(concerned, loc)
{
    new colorPicker("body", loc);
}

function showInputPopup(concerned)
{
    $("#input-popup").css("visibility", "visible");
    $("#input-popup-textarea").val(concerned.text);
    isInpupPopupOpen = true;
    concernedObj = concerned;
}


function hideInputPopup()
{
    $("#input-popup").css("visibility", "hidden");
    isInpupPopupOpen = false;
}

$("#input-popup-undobtn").click((event) => {
    hideInputPopup();
})

$("#input-popup-savebtn").click((evt) => {
    concernedObj.text = $("#input-popup-textarea").val()
    concernedObj.updateText();
    hideInputPopup();
})

$.valHooks.textarea = {
    get: function(elem) {
        return elem.value.replace(/\r?\n/g, "\r\n");
    }
};

function error(txt) {
    new Error(txt);
}

function Error(txt) {
    var self = this;
    this.msg = document.createElement("div")
    $(this.msg).addClass("errorMsg").appendTo("body");
    //this.msg.innerHTML = String("An error occured during saving process, please report<br /><br /><i>" + txt + "</i>");
    this.msg.innerHTML = String(locals.errorMsg + "<br /><br /><i>" + txt + "</i>");
    this.timeout = setTimeout(function(){
        self.msg.remove()
    }, 7000);
}

function info(txt) {
    new Info(txt);
}

function Info(txt) {
    var self = this;
    this.msg = document.createElement("div")
    $(this.msg).addClass("infoMsg").appendTo($("#infosBar"));
    //this.msg.innerHTML = String("An error occured during saving process, please report<br /><br /><i>" + txt + "</i>");
    this.msg.innerHTML = String(locals.infoMsg + txt);
    this.timeout = setTimeout(function(){
        self.msg.remove()
    }, 5000);
}

$(document).keydown((evt) => {
    if(evt.key === "Escape") {
        hideInputPopup()
    }
})
//exports.isNode = isNode
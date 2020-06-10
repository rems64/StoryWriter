const $ = require("jquery");
const { SVG } = require("./svg.esm.js");
const fs = require("fs");
const ipc = require('electron').ipcRenderer;

var isInpupPopupOpen = false;
var concernedObj;

var locals = {}

ipc.send('getLocals', {});
ipc.on('sendLocals', (event, data) => {
    locals=data.locals
});


function isNode()
{
    return ((typeof process !== 'undefined') && (process.release.name === 'node'))
}

function colorPicker(parent, loc, initColor)
{
    var self = this;
    this.container = document.createElement('div');
    $(this.container).addClass("colorPickerContainer").appendTo($(parent));

    this.hueGradient = document.createElement('div');
    $(this.hueGradient).addClass("hg-master").appendTo($(this.container));

    this.circleGradient = document.createElement('div');
    $(this.circleGradient).addClass("hg-circle").appendTo($(this.container));

    this.circleSelected = false;
    $(this.circleGradient).on("mousedown", function(event) {
        self.circleSelected = true;
    });

    this.btnsWrapper = document.createElement('div');
    $(this.btnsWrapper).addClass("hg-btnsWrapper").appendTo($(this.container));

    this.cancelBtn = document.createElement('button');
    $(this.cancelBtn).addClass("hg-cancelBtn").appendTo($(this.btnsWrapper));
    this.cancelBtn.innerHTML = "Annuler"

    this.validateBtn = document.createElement('button');
    $(this.validateBtn).addClass("hg-valBtn").appendTo($(this.btnsWrapper));
    this.validateBtn.innerHTML = "Valider"

    $(document).on("mouseup", function(event) {
        self.circleSelected = false;
    });
    this.colH = 0;
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
            self.colH = (($(self.circleGradient).position().left-$(self.hueGradient).position().left)/($(self.hueGradient).width()))*360
            //console.log(self.colH)
            $(self.circleGradient).css("background-color", "hsl("+ self.colH +",100%, 50%)")
            concernedObj.updateColor(self.colH);
        }
    });
    $(self.cancelBtn).click(() => {
        $(self.container).remove()
        concernedObj=undefined;
    })
    $(self.validateBtn).click(() => {
        $(self.container).remove()
        concernedObj.updateColor(self.colH);
    })
    $(self.container).on("mouseleave", function() {
        $(self.container).remove()
        concernedObj=undefined;
    })
    this.init = function() {
        var desiredLoc = (initColor/360)*($(self.hueGradient).width())+$(self.hueGradient).position().left-40
        $(self.circleGradient).css({left:desiredLoc+'px'});
        self.colH = (($(self.circleGradient).position().left-$(self.hueGradient).position().left)/($(self.hueGradient).width()))*360
        //console.log(self.colH)
        $(self.circleGradient).css("background-color", "hsl("+ self.colH +",100%, 50%)")

        //if((loc.y+($(this.container).height()))>($(document).height()))
        //if(($(document).height()-$(self.container).height()))
        console.log((loc.y+$(self.container).outerHeight()))
        console.log($(document).height())
        if((loc.y+$(self.container).outerHeight())>$(document).height())
        {
            //$(this.container).css("top", String(loc.y-(20+((loc.y-10+($(this.container).height()))-($(document).height()))))+"px");
            $(this.container).css("top", String($(document).height()-$(self.container).outerHeight())+"px");
            //$(this.container).css("top", String(0)+"px");
            console.log("DEPASSE")
        }
        else
        {
            $(this.container).css("top", String(loc.y)+"px");
        }

        if((loc.x+$(self.container).outerWidth())>$(document).width())
        {
            $(this.container).css("left", String($(document).width()-$(self.container).outerWidth())+"px");
        }
        else
        {
            $(this.container).css("left", String(loc.x)+"px");
        }
    }
    this.init();
}

function ContextMenu(parent, loc, elements)
{
    var self = this;
    this.container = document.createElement("div");
    this.elements = [];
    this.destroy = function() {
        //console.log("Bye bye")
        //$(this.container).remove();
        $(".contextMenuContainer").remove();
    };
    $(this.container).on("mouseleave", function() {
        //console.log("Destroying");
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
            //console.log("DEPASSE")
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
        //console.log(infos.additionalClasses);
        for(var i in infos.additionalClasses)
        {
            $(this.bg).addClass(infos.additionalClasses[i]);
            //console.log(infos.additionalClasses[i])
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
    new colorPicker("body", loc, concerned.getCol());
    concernedObj=concerned;
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
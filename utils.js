const $ = require("jquery");
const { SVG } = require("./svg.esm.js");
const fs = require("fs");

var isInpupPopupOpen = false;
var concernedObj;

function isNode()
{
    return ((typeof process !== 'undefined') && (process.release.name === 'node'))
}

function colorPicker(parent)
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
    $(document).on("mouseup", function(event) {
        self.circleSelected = false;
    });
    $(document).on("mousemove", function(event) {
        if(self.circleSelected) {
            $(self.circleGradient).css({left:event.clientX-10+'px'});
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
    $(this.container).css("left", String(loc.x-10)+"px");
    $(this.container).css("top", String(loc.y-10)+"px");
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
    var j = 0;
    for(var i in elements) {
        this.elements.push(new ContextMenuElement(this, {
            title: i,
            callback: elements[i] 
        }));
    }
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
    $(this.bg).addClass("contextMenuElement").appendTo($(ctxtMenu.container));
    $(this.bg).on("click", function() {
        ctxtMenu.remove();
        infos.callback();
    })
}

function showColorPopop(concerned)
{
    new colorPicker("body");
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


$(document).keydown((evt) => {
    if(evt.key === "Escape") {
        hideInputPopup()
    }
})
//exports.isNode = isNode
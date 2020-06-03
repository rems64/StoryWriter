const $ = require("jquery");
const { SVG } = require("./svg.esm.js");

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
        console.log("oivhsgs");
        
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
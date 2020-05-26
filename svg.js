//const { isNode } = require("./utils.js");
//const { SVG } = require("./svg.esm.js");
//const $ = require("jquery");


function svgCanvas(parent, id)
{
    var self = this;
    this.draw = SVG().addTo(parent).size(1240, 720).id(id);
    //this.svgDOM = document.getElementsByTagName("svg")[0];
    this.svgDOM = document.getElementById(id);
    this.pt;
    this.setId = function(newId) {
        draw.id(newId)
    }
    this.mouseupEvt = new CustomEvent("mouseup");
    this.childsCallback = [];
    this.newChild = function(nChild) {
        this.childsCallback.push(nChild);
    }
    this.getCoords = function(evt) {
        if(!self.pt) {
            self.pt = self.svgDOM.createSVGPoint();
        }
        self.pt.x = evt.clientX;
        self.pt.y = evt.clientY;
      
        // The cursor point, translated into svg coordinates
        var cursorpt =  self.pt.matrixTransform(self.svgDOM.getScreenCTM().inverse());
        //console.log("(" + cursorpt.x + ", " + cursorpt.y + ")");
        //cursorpt.x = cursorpt.x-panZoomInfos[0]
        //cursorpt.y = cursorpt.y+panZoomInfos[1]
        return [cursorpt.x, cursorpt.y]
    }
    var self = this;
    window.addEventListener('resize', function(event){
        self.updateSize();
    });
    this.updateSize = function()
    {
        var clientWidth = document.getElementById("timeline").clientWidth;
        var clientHeight = document.getElementById("timeline").clientHeight;
        self.draw.size(clientWidth, clientHeight);
    };
    //$(document).on("mouseup", function() {
    //    console.log("mouseup");
    //    for(var i in self.childsCallback) {
    //        self.childsCallback[i].evtMouseup();
    //    }
    //})
    function init(){
        self.updateSize();
    }
    init();
}


function setPanZoom(svgDOM){
    let strAttr = panZoomInfos[0].toString() + " " + panZoomInfos[1].toString() + " " + panZoomInfos[2].toString() + " " + panZoomInfos[3].toString()
    svgDOM.setAttribute("viewBox", strAttr);
}

//exports.svgCanvas = svgCanvas
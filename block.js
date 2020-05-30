//const { SVG, getCoords } = require("./svg.js")
//const { $ } = require("jquery")

function Block(parentTrack, time, duration, color)
{
    var self = this;
    this.parent = parentTrack;
    this.time = time;
    this.duration = duration;
    this.color = color;
    this.position = {x:time, y:0};
    this.isSelected = false;
    this.clickOffset = {x: 0, y: 0};
    this.size = {x:this.duration, y:parentTrack.height}
    this.pTrack = parentTrack;
    this.shape = parentTrack.track.rect(this.size.x, this.size.y);
    this.clickOffset = {x:0, y:0};
    this.svgCvs = this.parent.svgCvs;
    self.hover = false;
    this.handleHover = false;
    this.getTime = function() {
        return this.time;
    }
    this.updateComponent = function() {
        self.shape.move(this.position.x, this.position.y);
        self.shape.size(self.size.x, self.size.y);
    }
    this.updateColor = function(color) {
        self.color = color;
        self.shape.css("fill", "hsl("+color+" 80%"+" 50%)");
    }
    this.setLength = function(newLength) {
        self.size.x = newLength;
        self.shape.size(self.size.x, self.size.y);
    }
    this.updateLength = function(newUnit) {
        self.size.x = newUnit*duration;
    }
    this.updateHeight = function(nHeight) {
        self.size.y = nHeight;
    }
    this.shape.on("click", function(event) {
        evtBlockClick(event, self);
        self.shape.front();
    })
    this.shape.on("mouseover", function(event) {
        console.log("handleHover!")
        self.hover = true;
    })
    this.shape.on("mouseout", function() {
        if(!self.isSelected) {
            self.hover = false;
            document.body.style.cursor = 'default';
        }
    })
    this.shape.on("mousedown", function(event) {
        self.isSelected = true;
        self.clickOffset.x = self.svgCvs.getCoords(event)[0] - self.position.x;
        self.clickOffset.y = self.svgCvs.getCoords(event)[1] - self.position.y;
    });
    $(document).on("mouseup", function() {
        self.isSelected = false;
    });
    $(document).on("mousemove", function(event) {
        if(self.isSelected) {
            if(!self.handleHover) {
                self.shape.move(self.position.x, self.position.y);
                self.position.x = self.svgCvs.getCoords(event)[0] - self.clickOffset.x;
                var concernedTrack = self.parent.parent.getApparteningTrack(self.svgCvs.getCoords(event)[1]);
                //console.log(concernedTrack);
                if(concernedTrack>=0) {
                    self.shape.addTo(self.parent.parent.tracks[concernedTrack].track);
                    self.pTrack.removeBlock(self);
                    self.pTrack = self.parent.parent.tracks[concernedTrack];
                    self.pTrack.addBlock(self);
                }
                //self.position.y = self.pTrack.loc.y;
                //self.shape.front();
                //console.log(self.position.x);
                //console.log(self.position.y);
            }
            else{
                console.log('updating length')
                self.updateLength();
                var nLength = self.svgCvs.getCoords(event)[0] - self.position.x;
                self.setLength(nLength);
            }
        }
        else if(self.hover) {
            var deltaX = self.svgCvs.getCoords(event)[0] - self.position.x;
            var margin = 10;
            //if(deltaX<self.duration) {
                if(deltaX>(self.size.x-margin)) {
                    document.body.style.cursor = 'e-resize';
                    self.handleHover = true;
                }
                else {
                    document.body.style.cursor = 'default';
                    self.handleHover = false;
                }
            //}
        }
    });
    this.init = function() {
        this.updateComponent();
        this.updateColor(self.color);
    }
    this.init();
}


function evtBlockClick(event, him){
    console.log(him);
}
//exports.Block = Block
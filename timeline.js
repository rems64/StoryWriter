//const { Block } = require("./block.js")
//import { SVG } from "./svg.esm.js"
//const { SVG } = require("./svg.esm.js");
//const $ = require("jquery");


function Track(timeline)
{
    var self = this;
    this.parent = timeline;
    this.track = timeline.main.nested();
    this.height = 40;
    this.minHeight = 10;
    this.loc = {x:0, y:0};
    this.blocks = [];
    //this.topLine = this.track.line().stroke({ width: 2 }).addClass("trackLines");
    this.bottomLine = this.track.line().stroke({ width: 4 }).addClass("trackLines").addClass("trackLinesBottom");
    self.isSelected = false;
    this.svgCvs = this.parent.parent;
    this.clear = function() {
        for(var blk in self.blocks){
            self.blocks[blk].clear();
        }
        self.blocks = []
        self.track.remove()
    }
    this.updateSelfComponents = function() {
        var ySum = 0;
        for(var i in self.parent.tracks) {
            //console.log(self.parent.tracks[i]);
            
            if(self.parent.tracks[i]!=self) {
                ySum+=self.parent.tracks[i].height;
            }
            else {
                break
            }
        }
        self.loc.y = ySum;
        self.track.move(self.loc.x, self.loc.y);
        self.bottomLine.plot(0, self.height, 10000, self.height);
        //self.bottomLine.front()
        //self.topLine.plot(0, 1, 10000, 1);
        //self.topLine.front()
    }
    this.removeBlock = function(blk) {
        for(var b in self.blocks) {
            if(self.blocks[b]==blk) {
                self.blocks.splice(b, 1);
            }
        }
    }
    this.addBlock = function(blk) {
        newIndex = sortedIndex(self.blocks, blk.time);
        self.blocks.splice(newIndex, 0, blk)
    }
    $(document).on("mouseup", function() {
        self.isSelected = false;
    });
    $(document).on("mousemove", function(evt) {
        if(self.isSelected) {
            if (self.svgCvs.getCoords(event)[1]-(self.track.y()+self.parent.main.y())>self.minHeight)
            {
                self.height = self.svgCvs.getCoords(event)[1]-(self.track.y()+self.parent.main.y());
                self.evtResize();
            }
        }
    })
    this.update = function() {
        self.updateSelfComponents();
        for (var i in this.blocks) {
            //self.blocks[i].updateLength(self.unitLength);
            self.updateSelfComponents();
            self.blocks[i].updateHeight(self.height);
            self.blocks[i].updateComponent();
        }
    }

    this.bottomLine.on("mousedown", function(event) {
        self.isSelected = true;
    });
    this.evtResize = function() {
        for (var i in this.blocks) {
            self.updateSelfComponents();
            self.blocks[i].updateHeight(self.height);
            self.blocks[i].updateComponent();
        }
        self.parent.update();
    }
}

function Timeline(parent, tracksNbr, currentTime, startTime, length)
{
    var self = this;
    this.parent = parent;
    this.currentTime = currentTime;
    this.startTime = startTime;
    this.endTime = length-startTime;
    this.v_startTime = startTime;
    this.v_endTime = length-startTime;
    this.tracksNbr = tracksNbr;
    this.v_ystart = 0;
    this.v_y_end = tracksNbr*100;
    this.blocks = [];
    this.v_blocks = [];
    this.main = self.parent.draw.nested();
    this.unitLength = 1;
    this.tracks = []
    this.compiledTimeline = [];
    this.reinit = function(tracksNbr, currentTime, startTime, length){
        self.tracksNbr = tracksNbr;
        self.init();
    };
    this.addTrack = function(nbr){
        var i=0;
        while(i<nbr)
        {
            this.tracks.push(new Track(self));
            i++
        }
        self.update();
    }
    this.clear = function() {
        for(var trk in self.tracks)
        {
            self.tracks[trk].clear();
        }
        self.tracks = []
    }
    this.compile = function() {
        self.compiledTimeline = [
            {
                "tracksNbr": self.tracksNbr
            }
        ];
        var i = 0;
        for(var trk in self.tracks) {
            var compiledTrack = []
            var j = 0;
            for(var blkIndex in self.tracks[trk].blocks)
            {
                var blk = self.tracks[trk].blocks[blkIndex]
                var tmpBlock = 
                {
                    t: blk.time,
                    d: blk.duration,
                    c: blk.color
                }
                compiledTrack.push(tmpBlock);
                //j++;
            }
            self.compiledTimeline.push(compiledTrack);
            i++;
        }
        //console.log(self.compiledTimeline);
    }
    this.save = function(path) {
        //var toWrite = JSON.stringify(self.compiledTimeline, null, 4);
        var toWrite = JSON.stringify(self.compiledTimeline);
        //console.log(toWrite);
        fs.writeFile(path, toWrite, function (err) {
            if (err) {
              console.log('[ERROR] An error occured during saving process, please report');
              error("SAVE PATH");
              console.log(err.message);
              return;
            }
            console.log('[INFO] Saving success')
            info("Successfully saved");
          });
    };
    this.load = function(path) {
        let rawdata = fs.readFileSync(path);
        let infos = JSON.parse(rawdata);
        self.reinit(infos[0].tracksNbr);
        console.log(infos);
        infos.shift();
        for(var i in infos)
        {
            console.log(infos[i])
            for(var j in infos[i])
            {
                //console.log(infos[i][j])
                mT.newBlock(i, infos[i][j].t, infos[i][j].d, String(infos[i][j].c));
            }
        }
    };

    this.setTime = function(newTime) {
        this.currentTime = newTime
    };
    this.getTime = function() {
        return this.currentTime;
    }
    this.evtMouseup = function() {
        for(var i in self.tracks) {
            self.tracks[i].evtMouseup();
        }
    }
    this.newBlock = function(trackId, time, duration, color) {
        let newBlock = new Block(this.tracks[trackId], time, duration, color);
        this.addBlock(newBlock, trackId);
    }
    this.newDragBlock = function() {
        let nBlk = new Block(this.tracks[0], 0, 100, "0");
        var evtMm = $(document).on("mousemove.drag", (event) => {
            nBlk.container.move(nBlk.position.x, nBlk.position.y);
            nBlk.position.x = nBlk.svgCvs.getCoords(event)[0] - nBlk.clickOffset.x;
            var concernedTrack = nBlk.parent.parent.getApparteningTrack(nBlk.svgCvs.getCoords(event)[1]);
            //console.log(concernedTrack);
            if(concernedTrack>=0) {
                nBlk.container.addTo(nBlk.parent.parent.tracks[concernedTrack].track);
                nBlk.pTrack.removeBlock(nBlk);
                nBlk.pTrack = nBlk.parent.parent.tracks[concernedTrack];
                nBlk.pTrack.addBlock(nBlk);
                nBlk.size.y = nBlk.parent.parent.tracks[concernedTrack].height;
                nBlk.shape.size(nBlk.size.x, nBlk.size.y);
                //console.log(concernedTrack)
            }

        })
        var evtMd = $(document).on("mousedown.drag", () => {
            $(document).off("mousemove.drag");
            $(document).off("mousedown.drag");
        })
    }
    this.update = function() {
        this.main.move(0, 10);
        for(var i in self.tracks)
        {
            self.tracks[i].update();
        }
    }
    this.addBlock = function(block, trackId) {
       let newIndex = sortedIndex(this.blocks, block.time);
       this.blocks.splice(newIndex, 0, block)

       newIndex = sortedIndex(this.tracks[trackId].blocks, block.time);
       this.tracks[trackId].blocks.splice(newIndex, 0, block)
    }
    this.getApparteningTrack = function(targetHeight) {
        console.log(targetHeight);
        var currentMin = self.main.y();
        var currentMax = 0;
        var currentHeight = 0;
        var height = self.tracks[0].height;
        for(var i in self.tracks) {
            if(i>0)
                currentMin+=self.tracks[i-1].height
            currentMax+=self.tracks[i].height
            //currentHeight+=self.tracks[i].loc.x
            /*
            currentHeight+=height;
            height = self.tracks[i].height;
            if(targetHeight > currentHeight) {
                if(targetHeight < (currentHeight+height)) {
                    //console.log(true)
                    return i;
                }
                else {
                    //console.log(targetHeight);
                    //console.log((currentHeight+height))
                }
            }
            else {
            }
        }
        return -1
        */
        if(targetHeight>currentMin)
        {
            if(targetHeight<currentMax)
            {
                return i;
            }
            else
            {
            }
        }
        else{
            console.log("Erreur incompréhensible");
        }
       }
       return -1
    }
    this.init = function() {
        var i = 0;
        while(i<self.tracksNbr) {
            self.tracks.push(new Track(self));
            i++
        }
        self.update();
    }
    this.init();
}


function sortedIndex(array, value) {
    var low = 0,
        high = array.length;

    while (low < high) {
        var mid = (low + high) >>> 1;
        if (array[mid].time < value) low = mid + 1;
        else high = mid;
    }
    return low;
}


//exports.Timeline = Timeline
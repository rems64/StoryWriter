//const { isNode } = require("./utils.js")
//const { svgCanvas } = require("./svg.js")
//const { Timeline } = require("./timeline.js")


let svg = new svgCanvas("#timeline", "timelineSvg");
let mT = new Timeline(svg, 5);
svg.newChild(mT);
mT.newBlock(0, 0, 100, "120");
mT.newBlock(1, 150, 100, "100");
mT.newBlock(2, 340, 10, "200");
mT.newBlock(3, 350, 100, "300");
mT.newBlock(4, 550, 100, "250");
mT.newBlock(0, 700, 100, "80");
mT.newBlock(1, 810, 100, "0");

mT.update();
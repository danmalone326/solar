// function circlePath(cx, cy, r){
//     return 'M '+cx+' '+cy+' m -'+r+', 0 a '+r+','+r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0';
// }

function Gauge(id,openingAngleD,offsetFromVerticalD) {

    // removes all elements from the svg
    this.clean = function() {
        allElements = Array.from(this.svg.childNodes);
        for (var i=0; i<allElements.length; i++) {
            this.svg.removeChild(allElements[i]);
        }
    }
    
    this.getOrCreateSvgElement = function(id,type){
        var element=document.getElementById(id);
        if (!element) {
            element = document.createElementNS("http://www.w3.org/2000/svg", type); //Create a path in SVG's namespace
            element.id = id;
            this.svg.appendChild(element); 
        }
        return element;   
    }

    this.addClassList = function(element, classList){
        if (classList){
            var classArray = classList.split(" ");
            for (var i=0; i<classArray.length; i++){
                element.classList.add(classArray[i]);
            }
        }
    }

    this.resize = function() {
        this.width = (this.svg.clientWidth || this.svg.parentNode.clientWidth) - (this.padding*2);
        this.height = (this.svg.clientHeight || this.svg.parentNode.clientHeight) - (this.padding*2);
//         console.log(this.width);
//         console.log(this.height);
        
        var openingAngleR = this.openingAngleD * Math.PI / 180;
        var offsetFromVerticalR = this.offsetFromVerticalD * Math.PI / 180;
        var centerR = (Math.PI/2) + offsetFromVerticalR;
        this.highAngleR = centerR - (openingAngleR/2);
        this.lowAngleR = centerR + (openingAngleR/2);
        
//         console.log(openingAngleR,offsetFromVerticalR,centerR);
//         console.log(this.highAngleR,this.lowAngleR);
        
        // Compute center and radius
        // scan the polar space at fixed radius and find
        // the minimum AND maximum Cartesian x and y values
        delta = 0.01;
 
        // initialize min and max coordinates to center point.
        xMin = 0;
        yMin = 0;
        xMax = 0;
        yMax = 0;
        
        for (theta=this.highAngleR; theta <= this.lowAngleR; theta += delta) {
            // compute coordinates
            x = Math.cos(theta);
            y = Math.sin(theta);

            if (x > xMax) { xMax = x; }
            if (x < xMin) { xMin = x; }
            if (y > yMax) { yMax = y; }
            if (y < yMin) { yMin = y; }
        }
        
        xMax += 1;
        yMax += 1;
        xMin += 1;
        yMin += 1;

        meterScale = Math.min(this.width/(xMax-xMin),this.height/(yMax-yMin));
//         console.log(this.width/(xMax-xMin),this.height/(yMax-yMin));
//         console.log(meterScale);
        
        xCenterAdjust = (this.width - (xMax-xMin)*meterScale)/2;
        yCenterAdjust = (this.height - (yMax-yMin)*meterScale)/2;
        
        this.r = meterScale;
        this.cx = meterScale * (1 - xMin) + this.padding + xCenterAdjust;
        this.cy = meterScale * (yMax - 1) + this.padding + yCenterAdjust;
        
        
        

        // display min and max values
//         console.log("xMin = " + xMin + ", xMax = " + xMax + ", xV = " + (xMax-xMin));
//         console.log("yMin = " + yMin + ", yMax = " + yMax + ", yV = " + (yMax-yMin));
        
//         console.log("scaledWidth = "+(xMax-xMin)*meterScale+", scaledHeight = "+(yMax-yMin)*meterScale);
//         console.log("cx = " + this.cx + ", cy = " + this.cy);
//         console.log("r = " + this.r)
    }

    this.arcSvgPath = function(cx, cy, r, a1, a2){
        var x1 = (r * Math.cos(a1));
        var y1 = -(r * Math.sin(a1));
  
        var x2 = (r * Math.cos(a2)) - x1;
        var y2 = -(r * Math.sin(a2)) - y1;
  
        if (a1 - a2 <= Math.PI) {
            mode="0,1";
        } else {
            mode="1,1";
        }
  
        result = 'M '+cx+' '+cy+' m '+x1+', '+y1+' a '+r+','+r+' 0 '+mode+' '+x2+','+y2+' ';
    //     console.log(result);
  
        return result;
    }

    this.ticksSvgPath = function(cx, cy, r, a1, a2, l, num){
        var result='';

        for (var i = 0; i < num; i++) {
            var angle = ((a1 - a2)/(num-1))*i + a2;
            var x1 = (r * Math.cos(angle)) + cx;
            var y1 = -(r * Math.sin(angle)) + cy;
  
            var x2 = ((r-l) * Math.cos(angle)) + cx;
            var y2 = -((r-l) * Math.sin(angle)) + cy;
            result = result + 'M '+x1+' '+y1+' L '+x2+', '+y2+' \n';
        }
  
    //     console.log(result);
  
        return result;
    }

    this.needleSvgPath = function(angle,r1,r2,type=0){
        var result='';

        var x = (r1 * Math.cos(angle)) + this.cx;
        var y = -(r1 * Math.sin(angle)) + this.cy;
        result = result + 'M '+x+' '+y+' ';
        
        switch(type){
            case 1:
            case 2:
                var a=angle + type*Math.PI/180;
                x = (r2 * Math.cos(a)) + this.cx;
                y = -(r2 * Math.sin(a)) + this.cy;
                result = result + 'L '+x+', '+y+' ';                            
                
                a=angle - type*Math.PI/180;
                x = (r2 * Math.cos(a)) + this.cx;
                y = -(r2 * Math.sin(a)) + this.cy;
                result = result + 'L '+x+', '+y+' '; 
                
                result = result + 'Z ';                           
                break;
            case 0:
            default:
                x = (r2 * Math.cos(angle)) + this.cx;
                y = -(r2 * Math.sin(angle)) + this.cy;
                result = result + 'L '+x+', '+y+' ';            
                break;
        }
        result = result + '\n';            

    //     console.log(result);  
        return result;
    }

    this.computeAngle = function(percent,lowAngleR=null,highAngleR=null){
        if (lowAngleR) {
            _lowAngleR = lowAngleR;
        } else {
            _lowAngleR = this.lowAngleR;
        }
        if (highAngleR) {
            _highAngleR = highAngleR;
        } else {
            _highAngleR = this.highAngleR;
        }
        var angle = ((_lowAngleR - _highAngleR)*(1.0-percent)) + _highAngleR;
        return angle;
    }

    this.drawNeedle = function(needle){
        var result = this.needleSvgPath(this.computeAngle(needle.currentPercent,
                                                          needle.startR,
                                                          needle.endR),
                                        this.r*needle.outRadiusP,
                                        this.r*needle.inRadiusP,
                                        needle.type);

// console.log('drawing needle:' + needle.id)
// console.log(needle)
        element = this.getOrCreateSvgElement(needle.id,'path');

        element.setAttributeNS(null,'d',result);
        this.addClassList(element,needle.classList);
    }
    
    this.needleMoveFormula = function(y,spring=0){
        var result;
        switch(spring) {
            case 1:
                result = Math.sin(y/2) * Math.pow(y,(y/4));
                break;
            case 2:
                result = Math.sin(y/1.6) * Math.pow(y,(y/4));
                break;
            case 3:
                result = Math.sin(y) * Math.pow(y,(y/4));
                break;
            default:
                result = Math.pow(y,2);
                break;
        }
        return result;
    }

    this.moveNeedle = function(needle) {
        var elapsed = new Date().getTime() - needle.moveStartTime;
    
        if (elapsed < needle.moveDuration) {
            yMax = 8.5;
            xMax = this.needleMoveFormula(yMax,needle.spring);
            y = yMax * (needle.moveDuration - elapsed) / needle.moveDuration;
            x = this.needleMoveFormula(y,needle.spring);
            needle.currentPercent = needle.moveTargetPercent - (x * (needle.moveTargetPercent - needle.moveStartPercent) / xMax);
        } else {
            needle.currentPercent = needle.moveTargetPercent;
            needle.moving = false;
        }
    }

    
//     this.setNeedle = function(num,percent){
//         needle = this.needles[num];
//         needle.percent = percent;
//         this.drawNeedle(needle);
//     }
    
    
    this.setNeedle = function(num,percent){
        needle = this.needles[num];
        needle.moveTargetPercent = percent;
        if (needle.invert){
            needle.moveTargetPercent=1-needle.moveTargetPercent;
        }
        needle.moveStartPercent = needle.currentPercent;
        needle.moveStartTime = new Date().getTime();
        needle.moving = true;
        this.startLoop();
    }
    
    this.addNeedle = function(outRadiusP,
                              inRadiusP=0,
                              classList=null,
                              type=0,
                              initialP=0,
                              invert=false,
                              startP=0,
                              endP=1) {
        var needleID = this.needles.length;
        var needle = {id: this.id+":"+"needle"+needleID, 
                    outRadiusP: outRadiusP, 
                    inRadiusP: inRadiusP,
                    classList: classList,
                    type: type,
                    currentPercent: 0,
                    invert: invert,
                    moveDuration: 1500,
                    spring: 3,
                    moving: false};
        needle.startR = this.computeAngle(startP);
        needle.endR = this.computeAngle(endP);
        if (invert){
            needle.currentPercent=1;
        }
        
        this.needles.push(needle);
        this.setNeedle(needleID,initialP)

        return needleID;
    }

    this.drawArc = function(unit){
        radius = this.r * unit.radiusP;

        result = '';    
    
        result += this.arcSvgPath(this.cx, 
                                  this.cy, 
                                  radius, 
                                  this.computeAngle(unit.startP), 
                                  this.computeAngle(unit.endP));

        element = this.getOrCreateSvgElement(unit.id,'path');
        element.setAttributeNS(null,'d',result);
        this.addClassList(element,unit.classList);
    }
    
    this.addArc = function(radiusP,classList=null,startP=0,endP=1) {
        var unit = {id: this.id+":"+"unit"+this.units.length, 
                    type: "arc",
                    radiusP: radiusP,
                    classList: classList,
                    startP: startP,
                    endP: endP};
        this.units.push(unit); 
    }
    
    this.drawTicks = function(unit){
        radius = this.r * unit.radiusP;

        result = '';    
    
        switch(unit.align) {
            case "top":
                //radius = radius;
                break;
            case "center":
                radius = radius + this.r*(unit.lengthP/2);
                break;
            case "bottom":
                radius = radius + this.r*unit.lengthP;
                break;
        }
        
        result += this.ticksSvgPath(this.cx, this.cy, radius, 
                                    this.computeAngle(unit.startP), 
                                    this.computeAngle(unit.endP), 
                                    this.r * unit.lengthP, 
                                    unit.ticks);
    
        element = this.getOrCreateSvgElement(unit.id,'path');
        element.setAttributeNS(null,'d',result);
        this.addClassList(element,unit.classList);
    }
    
    this.addTicks = function(radiusP,ticks,lengthP=0.05,classList=null,align="top",startP=0,endP=1) {
        var unit = {id: this.id+":"+"unit"+this.units.length,
                    type: "ticks",
                    radiusP: radiusP, 
                    ticks: ticks, 
                    lengthP: lengthP,
                    classList: classList, 
                    align: align,
                    startP: startP,
                    endP: endP};
        this.units.push(unit); 
    }
        
    this.drawNumberLabels = function(unit){
        radius = this.r * unit.radiusP;

        gElement = this.getOrCreateSvgElement(unit.id,'g');
        gElement.setAttributeNS(null, 'text-anchor', 'middle');
        gElement.setAttributeNS(null, 'dominant-baseline', 'middle');
        this.addClassList(gElement,unit.classList);
        
        angleStart = this.computeAngle(unit.startP); 
        angleEnd = this.computeAngle(unit.endP);
        r = this.r * unit.radiusP
        
        for (var i = 0; i < unit.count; i++) {
            var angle = ((angleEnd - angleStart)/(unit.count-1))*i + angleStart;
            var label = ((unit.endNumber - unit.startNumber)/(unit.count-1))*i + unit.startNumber;
            var x = (r * Math.cos(angle)) + this.cx;
            var y = -(r * Math.sin(angle)) + this.cy;

//             console.log(angle, label, x, y);
            
            var textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElement.setAttributeNS(null, 'x', x);
            textElement.setAttributeNS(null, 'y', y);
            var txt = document.createTextNode(label);
            textElement.appendChild(txt);
            
            gElement.appendChild(textElement);
        }
        
    }
    
    this.addNumberLabels = function(radiusP,
                                    startNumber=0,
                                    endNumber=100,
                                    count=11,
                                    classList=null,
                                    startP=0,
                                    endP=1) {
        var unit = {id: this.id+":"+"unit"+this.units.length,
                    type: "numberLabels",
                    radiusP: radiusP, 
                    startNumber: startNumber, 
                    endNumber: endNumber,
                    count: count,
                    classList: classList, 
                    startP: startP,
                    endP: endP};
        this.units.push(unit); 
    }
        
    this.drawUnit = function(unit){
        switch(unit.type) {
            case "arc":
                this.drawArc(unit);
                break;
            case "ticks":
                this.drawTicks(unit);
                break;
           case "numberLabels":
                this.drawNumberLabels(unit);
                break;
            default:
                console.out("unknown unit type.");
                console.out(unit);
                break;
        }
    }
    
    this.intervalID = null;
    this.intervalMillis = 20;
    
    this.startLoop = function() {
        if (!this.intervalID) {
            this.intervalID = setInterval(this.loop.bind(this),this.intervalMillis);
//             console.log('loop start:' + this.intervalID);
        }
    }
    
    this.stopLoop = function() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null;
//             console.log('loop stop');
        }
    }
    
    this.loop = function() {
        var stopLoop = true;
        
        for (var i=0; i<this.needles.length; i++) {
            needle=this.needles[i];
            if (needle.moving){
                this.moveNeedle(needle);
                this.drawNeedle(needle);
                stopLoop = false;
            }
        }

        if (stopLoop) {
            this.stopLoop();
        }
    }

    this.draw = function() {
        this.clean();
        for (var i=0; i<this.units.length; i++) {
            this.drawUnit(this.units[i]);
        }

        for (var i=0; i<this.needles.length; i++) {
            this.drawNeedle(this.needles[i]);
        }
    }
    

    this.id = id;
    this.svg = document.getElementById(this.id);
    
    this.openingAngleD = openingAngleD;
    this.offsetFromVerticalD = offsetFromVerticalD;

    this.padding = 5;
    
    this.units = [];
    this.needles = [];
    
    this.resize();
}


// var gauge1;
// var orangeNeedle;
// var purpleNeedle;
// 
// function updateOrangeNeedle(percent) {
//     gauge1.setNeedle(orangeNeedle,percent);
// }
// 
// function updatePurpleNeedle(percent) {
//     gauge1.setNeedle(purpleNeedle,percent);
// }
// 
// 
// function updateNeedle() {
//     var d = new Date();
//     var n = d.getSeconds();
//     var percent = n/60;
//     gauge1.setNeedle(orangeNeedle,percent);
// }
// 
// var resizeTimeout;
// function resize() {
//     clearTimeout(resizeTimeout);
//     resizeTimeout = setTimeout(function(){
//         gauge1.resize();
//         gauge1.draw();
//     },250);
// }
// 
// function draw() {
//     gauge1 = new Gauge('meter',document.getElementById('opening').value,document.getElementById('offset').value,6,60);
//     gauge1.addTicks(0.95,101,0.025,'green',"1px","center");
//     gauge1.addTicks(0.95,11,0.05,'red',"1px","center");
//     gauge1.addArc(0.95,'green',"1px");
//     gauge1.addNumberLabels(0.88,0,100,11,"2vw","red");
//     gauge1.addArc(0.74,'green',"10px",.69,1.01);
//     gauge1.addTicks(0.75,11,0.025,'white',"1px","top",.7,1);
//     gauge1.addArc(0.75,'white',"1px",.7,1);
//     gauge1.addTicks(0.5,11,0.025,'red',"1px","bottom");
//     gauge1.addArc(0.5,'red',"1px");
//     orangeNeedle = gauge1.addNeedle(1,0.05,"orange");
//     purpleNeedle = gauge1.addNeedle(.77,0.70,"purple","1px",.98,.7,1);
// //     this.addNeedle = function(outRadiusP,inRadiusP=0,color="black",weight="1px") {
//     gauge1.draw();
// 
//     
// //         this.drawUnits('units',this.cx,this.cy,this.r*.95,this.lowAngleR,this.highAngleR,this.majorTicks,this.minorTicks);
// //         this.drawUnits('units2',this.cx,this.cy,this.r*.75,this.lowAngleR,this.highAngleR,this.majorTicks,this.majorTicks);
// 
// //     drawUnits('units',200,200,190,0.75,0.25,10,11,101);
// //     drawUnits('units2',200,200,155,0.75,0.25,10,11,11);
// }


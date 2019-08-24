
// var metricDataURL="passwordMetrics.DEV.json";
// var metricDataURL="data:///Users/dmalone/code/meter-svg/passwordMetrics.DEV.json";
var metricDataURL="http://www.malone.org/~dmalone/dmaloneSolar.json";
var metricData;

var digitalDisplayDigits=6;

var dashboardInfo={};


var buttonID = ["bottomAnalogButton","bottomDigitalButton","bottomTextButton","bottomJsonButton"];
var divID = ["analogMeter","digitalMeter","textDiv","jsonDiv"];
var selectedButtonNum = 0;

var selectorSelected = 0;
var selectorText = ["Now","Today","This<br/>Month","This<br/>Year"];
var selectorValues = ["currentPower","lastDayEnergy","lastMonthEnergy","lastYearEnergy"];
var selectorPrecision = [3,3,3,3];
var selectorUnits = ["kW","kWh","kWh","kWh"];
var selectorDirection = [315,45,225,135];

var selectorMax = [10,100,1000,10000];

function setAllDisplay(value){
    for (count=0; count<buttonID.length; count++){
        divElement=document.getElementById(divID[count]);
        divElement.style.display=value;    
    }

    divElement=document.getElementById('selector');
    divElement.style.display=value;    
}

function bottomButtonSelect(buttonNum){
    var count, buttonElement, divElement;
    
    for (count=0; count<buttonID.length; count++){
        buttonElement=document.getElementById(buttonID[count]);
        divElement=document.getElementById(divID[count]);
        if (count == buttonNum){
            selectedButtonNum=count;
            buttonElement.style.borderTopColor='black';
            divElement.style.display='';
        } else{
            buttonElement.style.borderTopColor='';
            divElement.style.display='none';    
        }        
    }

    divElement=document.getElementById('selector');
    if (selectedButtonNum<2) {
        divElement.style.display='';
    } else {
        divElement.style.display='none';
    }
//     setupLayout(); 
    loadMetricData();
    selectorButtonSelect(selectorSelected);
}

var dialCenterX=0;
var dialCenterY=0;
var dialElement;
function setDialCenter(centerX,centerY,element){
    dialCenterX=centerX;
    dialCenterY=centerY;
    dialElement=element;
}

function rotateDial(degrees){
    dialElement.setAttribute("transform", "rotate("+degrees+" "+dialCenterX+" "+dialCenterY+")");
}

function selectorButtonSelect(index){
    var count, buttonElement, divElement;
    
    selectorSelected = index;
    
//     setupLayout(); 
    rotateDial(selectorDirection[selectorSelected]);
    loadMetricData();
}

function calculateCharacterWidth(string,containerElement,maxWidth,maxHeight){
    var tempElement=document.createElement('div');
    containerElement.appendChild(tempElement);
    tempElement.style.position="absolute";
    tempElement.style.width="auto";
    tempElement.style.height="auto";
    tempElement.style["white-space"]="nowrap";
    
    var fontSize=24;
    tempElement.style.fontSize=fontSize;
    tempElement.innerHTML=string;
    
    var width=(tempElement.clientWidth + 1);
    var height=(tempElement.clientHeight + 1);
//     console.log(width,height);
    
    ratio=maxWidth/width;
    if (height*ratio > maxHeight) {
        ratio=maxHeight/height;
    }
    width=width*ratio;
    height=height*ratio;
//     console.log(width,height);

    fontSize=fontSize*ratio;

    containerElement.removeChild(tempElement);
    
    return fontSize;    
}

function setPosition(element,left,top,width,height){
    element.style.position="absolute";
    element.style.left=left;
    element.style.top=top;
    element.style.width=width;
    element.style.height=height;
}

function setupLayout() {
//     console.log('setupLayout');

    setAllDisplay('');
    
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
//     console.log(w);
//     console.log(h);

    var areaWidth = w;
    var areaHeight = h;
    
    ratio=16/9;

    if (areaHeight > areaWidth*ratio) {
        areaHeight = Math.floor(areaWidth*ratio);
    } else {
        areaWidth = Math.floor(areaHeight/ratio);
    }

    areaWidth-=2;
    areaHeight-=8;

    var areaLeft = Math.floor((w - areaWidth)/2)+1;
    var areaTop = Math.floor((h - areaHeight)/2)+1;

//     console.log(areaWidth);
//     console.log(areaHeight);

    var areaCenter=Math.floor(usableWidth/2);

    var usableTop=2;
    var usableLeft=2;
    var usableWidth=areaWidth-2;
    var usableHeight=areaHeight-2;

    var menuHeight=usableHeight/16;

    var mainElement=document.getElementById('mainContainer');
    setPosition(mainElement,areaLeft,areaTop,areaWidth,areaHeight-menuHeight+1);
    
    // JSON Version
    var jsonElement=document.getElementById('jsonDiv');
    jsonElement.innerHTML="";
    

    var jsonTextElement=document.createElement('pre');
    jsonTextElement.classList.add('jsonText');
    dashboardInfo["jsonTextElement"]=jsonTextElement;
    jsonElement.appendChild(jsonTextElement);
    
    var jsonFontSize=areaWidth/18;
    jsonTextElement.style.fontSize=jsonFontSize;


    // Text Only
    var textElement=document.getElementById('textDiv');
    textElement.innerHTML="";
    textElement.style.width="100%";
    textElement.style.height="100%";
    
    var textPartHeight=usableHeight/4;
    var textValueHeight=textPartHeight*3/4;
    var textTitleHeight=textPartHeight*1/4;
    
    var thisPartTop=usableTop;
    var textTitleFontSize=usableWidth/14;
    var textValueFontSize=usableWidth/7;
    
    var divElement=document.createElement('div');
    divElement.classList.add('textValue');
    dashboardInfo["textNowValue"]=divElement;
    setPosition(divElement,0,thisPartTop+textTitleHeight,"100%",textValueHeight);
    divElement.style.fontSize=textValueFontSize;
    textElement.appendChild(divElement);

    var divElement=document.createElement('div');
    divElement.classList.add('textTitle');
    divElement.innerHTML="Now";
    setPosition(divElement,0,thisPartTop,"100%",textTitleHeight);
    divElement.style.fontSize=textTitleFontSize;
    textElement.appendChild(divElement);

    var thisPartTop=thisPartTop+textPartHeight;
    
    var divElement=document.createElement('div');
    divElement.classList.add('textValue');
    dashboardInfo["textTodayValue"]=divElement;
    setPosition(divElement,0,thisPartTop+textTitleHeight,"100%",textValueHeight);
    divElement.style.fontSize=textValueFontSize;
    textElement.appendChild(divElement);

    var divElement=document.createElement('div');
    divElement.classList.add('textTitle');
    divElement.innerHTML="Today";
    setPosition(divElement,0,thisPartTop,"100%",textTitleHeight);
    divElement.style.fontSize=textTitleFontSize;
    textElement.appendChild(divElement);

    var thisPartTop=thisPartTop+textPartHeight;
    
    var divElement=document.createElement('div');
    divElement.classList.add('textValue');
    dashboardInfo["textMonthValue"]=divElement;
    setPosition(divElement,0,thisPartTop+textTitleHeight,"100%",textValueHeight);
    divElement.style.fontSize=textValueFontSize;
    textElement.appendChild(divElement);

    var divElement=document.createElement('div');
    divElement.classList.add('textTitle');
    divElement.innerHTML="This Month";
    setPosition(divElement,0,thisPartTop,"100%",textTitleHeight);
    divElement.style.fontSize=textTitleFontSize;
    textElement.appendChild(divElement);

    // Digital Meter
    var displayPartHeight=usableHeight/4;
    var displayPartWidth=usableWidth;  // related to border that is set in css file
    
    var digitalMeterElement=document.getElementById('digitalMeter');
    
    var divElement=document.getElementById('digitalDisplay');
    divElement.style.width=displayPartWidth;
    divElement.style.height=displayPartHeight;

    var displayInnerBorder=displayPartWidth/60;
    var displayRowGap=displayPartWidth/55;
        
    var mainDigitalRowTop=displayInnerBorder;
    var mainDigitalRowWidth=usableWidth-(displayInnerBorder*2);
    
//     MAIN ROW
    var divElement=document.getElementById('mainDigitalRow');
    setPosition(divElement,'',mainDigitalRowTop,mainDigitalRowWidth,'auto');
    divElement.style.left=displayInnerBorder;


    var digitWidth=mainDigitalRowWidth/(digitalDisplayDigits+1);
    var valueWidth=digitWidth*digitalDisplayDigits;
    var unitLeft=displayInnerBorder+digitWidth*digitalDisplayDigits;
        
    var divElement=document.getElementById('digitalValue');

    var backString="8.".repeat(digitalDisplayDigits);
    var valueFontSize=calculateCharacterWidth(backString,divElement,valueWidth,200);
    divElement.style.fontSize=valueFontSize;

    var divElement=document.getElementById('digitalValueBack');
    divElement.innerHTML=backString;
    var valueHeight=(divElement.clientHeight + 1);
    var valueBottom=valueHeight+divElement.clientTop+(displayInnerBorder/3);
    

    var divElement=document.getElementById('digitalValueFront');
    dashboardInfo["digitalValueFront"]=divElement;
    
    var unitElement=document.getElementById('digitalUnit');
    setPosition(unitElement,'','',digitWidth,'');
    unitElement.style.right=0;

    var backString="kWh";
    var unitFontSize=calculateCharacterWidth(backString,unitElement,digitWidth,200);
    unitElement.style.fontSize=unitFontSize;

    var divElement=document.getElementById('digitalUnitBack');
    divElement.innerHTML=backString;
    var unitHeight=(divElement.clientHeight + 1);
    unitElement.style.top=valueHeight-unitHeight;
    
    var divElement=document.getElementById('digitalUnitFront');
    dashboardInfo["digitalUnitFront"]=divElement;

    var infoLabelLeft=displayInnerBorder;
    var infoValueLeft=infoLabelLeft+(mainDigitalRowWidth*1/5);
    var infoFontSize=unitFontSize/2;

    var infoRowTop=valueBottom+displayRowGap;
    var divElement=document.getElementById('info1Row');
    setPosition(divElement,infoLabelLeft,infoRowTop,'auto','auto');
    divElement.style.fontSize=infoFontSize;

    var labelElement=document.getElementById('info1LabelFront');
    var valueElement=document.getElementById('info1Value');
    setPosition(valueElement,infoValueLeft,'','','');
    
    dashboardInfo["info1LabelFront"]=document.getElementById('info1LabelFront');
    dashboardInfo["info1ValueFront"]=document.getElementById('info1ValueFront');
 
    var infoRowTop=infoRowTop+labelElement.clientHeight+displayRowGap;
    var divElement=document.getElementById('info2Row');
    setPosition(divElement,infoLabelLeft,infoRowTop,'auto','auto');
    divElement.style.fontSize=infoFontSize;

    var labelElement=document.getElementById('info2LabelFront');
    var valueElement=document.getElementById('info2Value');
    setPosition(valueElement,infoValueLeft,'','','');
    
    dashboardInfo["info2LabelFront"]=document.getElementById('info2LabelFront');
    dashboardInfo["info2ValueFront"]=document.getElementById('info2ValueFront');
 
    var infoRowTop=infoRowTop+labelElement.clientHeight+displayRowGap;
    var divElement=document.getElementById('info3Row');
    setPosition(divElement,infoLabelLeft,infoRowTop,'auto','auto');
    divElement.style.fontSize=infoFontSize;

    var labelElement=document.getElementById('info3LabelFront');
    var valueElement=document.getElementById('info3Value');
    setPosition(valueElement,infoValueLeft,'','','');
    
    dashboardInfo["info3LabelFront"]=document.getElementById('info3LabelFront');
    dashboardInfo["info3ValueFront"]=document.getElementById('info3ValueFront');
 
    var displayPartHeight=infoRowTop+labelElement.clientHeight+displayInnerBorder;
    var divElement=document.getElementById('digitalDisplay');
    divElement.style.height=displayPartHeight;
    
//  Selector
    var selectorWidth=usableWidth - menuHeight*2;
    var selectorHeight=selectorWidth;
    var selectorTop=usableHeight - menuHeight - (menuHeight/2) - selectorHeight;
    var selectorLeft=menuHeight;
    var selectorRadius=(selectorWidth/2)*0.90;
    var selectorColor="#777";
    
    var buttonWidth=selectorWidth/2;
    var buttonHeight=selectorHeight/2;
    
    var selectorTopElement=document.getElementById('selector');
    setPosition(selectorTopElement,selectorLeft,selectorTop,selectorWidth,selectorHeight);

    var selectorFontSize=calculateCharacterWidth(selectorText[3],selectorTopElement,buttonWidth/3,400);
    selectorTopElement.style.fontSize=selectorFontSize;


    var selectorElement=document.getElementById('selectorCurrent');
    setPosition(selectorElement,0,0,'','');
    var selectorElement=document.getElementById('selectorCurrentInner');
    selectorElement.innerHTML=selectorText[0];
    selectorElement.style.position='absolute';
    selectorElement.style.left='0';
    selectorElement.style.top='0';

    var selectorElement=document.getElementById('selectorToday');
    setPosition(selectorElement,buttonWidth,0,'','');
    var selectorElement=document.getElementById('selectorTodayInner');
    selectorElement.innerHTML=selectorText[1];
    selectorElement.style.position='absolute';
    selectorElement.style.right='0';
    selectorElement.style.top='0';

    var selectorElement=document.getElementById('selectorMonth');
    setPosition(selectorElement,0,buttonHeight,'','');
    var selectorElement=document.getElementById('selectorMonthInner');
    selectorElement.innerHTML=selectorText[2];
    selectorElement.style.position='absolute';
    selectorElement.style.left='0';
    selectorElement.style.bottom='0';

    var selectorElement=document.getElementById('selectorYear');
    setPosition(selectorElement,buttonWidth,buttonHeight,'','');
    var selectorElement=document.getElementById('selectorYearInner');
    selectorElement.innerHTML=selectorText[3];
    selectorElement.style.position='absolute';
    selectorElement.style.right='0';
    selectorElement.style.bottom='0';
    
    var dialElement=document.getElementById('selectorDial');
    dialElement.innerHTML="";
    
    var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // set width and height
    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", "100%");
    
    var circleElement=document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circleElement.setAttribute("cx", buttonWidth);
    circleElement.setAttribute("cy", buttonHeight);
    circleElement.setAttribute("r", selectorRadius);
    circleElement.setAttribute("stroke", selectorColor);
    svgElement.appendChild(circleElement);
    
    var groupElement=document.createElementNS("http://www.w3.org/2000/svg", "g");
    setDialCenter(buttonWidth,buttonHeight,groupElement);

    var ellipseElement=document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipseElement.setAttribute("cx", buttonWidth);
    ellipseElement.setAttribute("cy", buttonHeight);
    ellipseElement.setAttribute("rx", selectorRadius*0.10);
    ellipseElement.setAttribute("ry", selectorRadius*0.90);
    ellipseElement.setAttribute("stroke", selectorColor);
    groupElement.appendChild(ellipseElement);

    var ellipseElement=document.createElementNS("http://www.w3.org/2000/svg", "line");
    ellipseElement.setAttribute("x1", buttonWidth);
    ellipseElement.setAttribute("y1", selectorRadius*0.25);
    ellipseElement.setAttribute("x2", buttonWidth);
    ellipseElement.setAttribute("y2", selectorRadius*0.35);
    ellipseElement.setAttribute("stroke", selectorColor);
    ellipseElement.setAttribute("stroke-width", 2);
    groupElement.appendChild(ellipseElement);
    svgElement.appendChild(groupElement);
    dialElement.appendChild(svgElement);
    


// Analog Meter
    var analogMeterElement=document.getElementById('analogMeter');

    var gaugeWidth=usableWidth;
    var gaugeHeight=selectorTop - menuHeight;
    var gaugeTop=0;
    var gaugeLeft=0;
    
    var analogMeterElement=document.getElementById('analogMeterContainer');
    setPosition(analogMeterElement,gaugeLeft,gaugeTop,gaugeWidth,gaugeHeight);

    var labelFontSize=calculateCharacterWidth("10",analogMeterElement,gaugeWidth/20,200);
    analogMeterElement.style.fontSize=labelFontSize;

    var gauge1 = new Gauge('analogMeterSvg',105,0);
    gauge1.addTicks(0.95,101,0.025,'analogMeterTicks',"top");
    gauge1.addTicks(0.95,11,0.05,'analogMeterTicks',"top");
    gauge1.addArc(0.95,'analogMeterArc');
    
    var lowerTickCenter=0.75;
    gauge1.addTicks(lowerTickCenter,21,0.025,'analogMeterTicks',"center");
    gauge1.addArc(lowerTickCenter,'analogMeterArc');
    gauge1.addNumberLabels(0.83,0,10,11,'analogMeterLabel');

    var centerSize=0.075;
    gauge1.addArc(centerSize,'analogMeterCenter',-1.2,2.2);

    historyNeedleLength=0.05;
    historyNeedleOutRadius=lowerTickCenter+(historyNeedleLength/2);
    historyNeedleInRadius=lowerTickCenter-(historyNeedleLength/2);
    needle = gauge1.addNeedle(historyNeedleOutRadius,historyNeedleInRadius,'analogMeterNeedleHistoricPeak');
    dashboardInfo["analogMeterNeedleHistoricPeak"]=needle;

    needle = gauge1.addNeedle(historyNeedleOutRadius,historyNeedleInRadius,'analogMeterNeedleHistoricAverage');
    dashboardInfo["analogMeterNeedleHistoricAverage"]=needle;

    needle = gauge1.addNeedle(historyNeedleOutRadius,historyNeedleInRadius,'analogMeterNeedleHistoricLastPeak');
    dashboardInfo["analogMeterNeedleHistoricLastPeak"]=needle;

    needle = gauge1.addNeedle(historyNeedleOutRadius,historyNeedleInRadius,'analogMeterNeedleHistoricLast');
    dashboardInfo["analogMeterNeedleHistoricLast"]=needle;

    needlePeak = gauge1.addNeedle(1,centerSize,'analogMeterNeedlePeak');
    dashboardInfo["analogMeterNeedlePeak"]=needlePeak;

    needle = gauge1.addNeedle(1,centerSize,'analogMeterNeedle');
    dashboardInfo["analogMeterNeedle"]=needle;

    gauge1.draw();

    dashboardInfo["analogMeterSvg"]=gauge1;
    
    var analogUnitLeft=gaugeLeft+(gaugeWidth*2/3);
    var analogUnitTop=gaugeTop+gaugeHeight-(menuHeight*1.5);
    var analogUnitWidth=gaugeWidth-analogUnitLeft;
    var analogUnitHeight=menuHeight;
    var analogUnitElement=document.getElementById('analogUnit');
    setPosition(analogUnitElement,analogUnitLeft,analogUnitTop,analogUnitWidth,analogUnitHeight);

    var analogUnitElement=document.getElementById('analogUnitFrontText');
    dashboardInfo["analogUnitFrontText"]=analogUnitElement;
    var analogUnitElement=document.getElementById('analogUnitFrontMulti');
    dashboardInfo["analogUnitFrontMulti"]=analogUnitElement;


// Bottom Menu
    var divElement=document.getElementById('bottomMenu');
    setPosition(divElement,0,areaHeight-menuHeight,areaWidth,menuHeight);
    divElement.style['line-height']=menuHeight+'px';

// 4 Buttons
    var numButtons=4;
    var buttonTop=1;
    var buttonWidth=(areaWidth/numButtons);
    var buttonHeight=menuHeight-2;
    var buttonFontSize=calculateCharacterWidth('Digital',divElement,buttonWidth-(displayInnerBorder*2),menuHeight-(displayInnerBorder*2));

    
    var divElement=document.getElementById('bottomAnalogButton');
    setPosition(divElement,0*buttonWidth-1,buttonTop,buttonWidth,buttonHeight);
    divElement.style.fontSize=buttonFontSize;
    
    var divElement=document.getElementById('bottomDigitalButton');
    setPosition(divElement,1*buttonWidth-1,buttonTop,buttonWidth,buttonHeight);
    divElement.style.fontSize=buttonFontSize;
    
    var divElement=document.getElementById('bottomTextButton');
    setPosition(divElement,2*buttonWidth-1,buttonTop,buttonWidth,buttonHeight);
    divElement.style.fontSize=buttonFontSize;
    
    var divElement=document.getElementById('bottomJsonButton');
    setPosition(divElement,3*buttonWidth-1,buttonTop,buttonWidth,buttonHeight);
    divElement.style.fontSize=buttonFontSize;
    
    setAllDisplay('none');
//     bottomButtonSelect(selectedButtonNum);
}


function format7Segment(number,precision,totalDigits) {
    var tempString=number.toFixed(precision).toString();
    var numCharacters=totalDigits;
    if (tempString.indexOf('.')>=0){
        numCharacters++;
    }
    tempString=tempString.padStart(numCharacters,'!');
    tempString=tempString.substring(0,numCharacters);
    return tempString;
}

//     Changes date string from:
//         YYYY-MM-DD HH:MI:SS
//     to:
//         MM-DD-YYYY HH:MI:SS
//     and includes 7 segment formatting
function format7SegmentDate(dateStr) {
    var tempString=dateStr.substring(5,10) + '-' + dateStr.substring(0,4) + '!' + dateStr.substring(11);
    return tempString;
}

//     Changes date string from:
//         YYYY-MM-DD HH:MI:SS
//     to:
//         HH:MI P
//     and includes 7 segment formatting
function format7SegmentHHMI(dateStr) {
    var h=parseInt(dateStr.substring(11,13), 10);
    var pClass='';
    var p='';
    if (h>11) {pClass='lcdFront'} else {pClass='lcdBack'}
    var p='<span class="techFont ' + pClass + '">P</span>';
    if (h>12) {h-=12}
    if (h==0) {h=12}
    var tempString=h.toString().padStart(2,'!')+dateStr.substring(13,16)+' '+p;
    return tempString;
}

// This function is called whenever new metrics data has been loaded.
// lastModified is from the Last Updated header in the HTTP response
function metricsUpdated(lastModified) {

    // Set JSON tab
    var jsonString=JSON.stringify(metricData, Object.keys(metricData).sort(), 2);
    var jsonNew = jsonString.replace(/: /g, ":\n      ");
    dashboardInfo["jsonTextElement"].textContent=jsonNew;
    
    // Set TEXT tab
    dashboardInfo["textNowValue"].innerHTML=(Math.round(metricData['now']["currentPower"])/1000).toFixed(3)+" kW";
    dashboardInfo["textTodayValue"].innerHTML=(Math.round(metricData['now']["lastDayEnergy"])/1000).toFixed(3)+" kWh";
    dashboardInfo["textMonthValue"].innerHTML=(Math.round(metricData['now']["lastMonthEnergy"])/1000).toFixed(3)+" kWh";
    
    // Set Digital tab
    dashboardInfo["digitalValueFront"].innerHTML=format7Segment(metricData['now'][selectorValues[selectorSelected]]/1000,selectorPrecision[selectorSelected],digitalDisplayDigits);
    dashboardInfo["digitalUnitFront"].innerHTML=selectorUnits[selectorSelected];

    var updated=metricData['now']["lastUpdateTime"];
    var sunrise=metricData['now']["sunrise"];
    var sunset=metricData['now']["sunset"];
    
    var updatedLabel="UPDATED:";
    var sunriseLabel="SUNRISE:";
    var sunsetLabel="SUNSET:";
    
    if (updated<sunrise) {
        dashboardInfo["info1LabelFront"].innerHTML=updatedLabel;    
        dashboardInfo["info1ValueFront"].innerHTML=format7SegmentHHMI(updated);
        dashboardInfo["info2LabelFront"].innerHTML=sunriseLabel;    
        dashboardInfo["info2ValueFront"].innerHTML=format7SegmentHHMI(sunrise);
        dashboardInfo["info3LabelFront"].innerHTML=sunsetLabel;    
        dashboardInfo["info3ValueFront"].innerHTML=format7SegmentHHMI(sunset);
    } else if (updated<sunset) {
        dashboardInfo["info1LabelFront"].innerHTML=sunriseLabel;    
        dashboardInfo["info1ValueFront"].innerHTML=format7SegmentHHMI(sunrise);
        dashboardInfo["info2LabelFront"].innerHTML=updatedLabel;    
        dashboardInfo["info2ValueFront"].innerHTML=format7SegmentHHMI(updated);
        dashboardInfo["info3LabelFront"].innerHTML=sunsetLabel;    
        dashboardInfo["info3ValueFront"].innerHTML=format7SegmentHHMI(sunset);
    } else {
        dashboardInfo["info1LabelFront"].innerHTML=sunriseLabel;    
        dashboardInfo["info1ValueFront"].innerHTML=format7SegmentHHMI(sunrise);
        dashboardInfo["info2LabelFront"].innerHTML=sunsetLabel;    
        dashboardInfo["info2ValueFront"].innerHTML=format7SegmentHHMI(sunset);
        dashboardInfo["info3LabelFront"].innerHTML=updatedLabel;    
        dashboardInfo["info3ValueFront"].innerHTML=format7SegmentHHMI(updated);
    } 

    // set Analog tab
    var needlePercent=metricData['now'][selectorValues[selectorSelected]]/(1000*selectorMax[selectorSelected]);
    dashboardInfo["analogMeterSvg"].setNeedle(dashboardInfo["analogMeterNeedle"],needlePercent);
//     console.log(needlePercent);

    if (selectorValues[selectorSelected] == "currentPower") {
        needlePercent=metricData['now']["peakPower"]/(1000*selectorMax[selectorSelected]);
    }
    dashboardInfo["analogMeterSvg"].setNeedle(dashboardInfo["analogMeterNeedlePeak"],needlePercent);

    // set Analog history
    if (selectorValues[selectorSelected] == "currentPower") {
        historicLastPeak=metricData['yesterday']['peakPower'];
        historicLast=metricData['yesterday']['currentPower'];
        historicPeak=metricData['30days']['maxPeakPower'];
        historicAverage=metricData['30days']['avgPeakPower'];
    } else if (selectorValues[selectorSelected] == "lastDayEnergy") {
        historicLastPeak=metricData['yesterday']['maxEnergy'];
        historicLast=metricData['yesterday']['lastDayEnergy'];
        historicPeak=metricData['30days']['maxEnergy'];
        historicAverage=metricData['30days']['avgEnergy'];
    } else {
        historicLastPeak=0;
        historicLast=0;
        historicPeak=0;
        historicAverage=0;
    }

    needlePercent=historicLastPeak/(1000*selectorMax[selectorSelected]);
    dashboardInfo["analogMeterSvg"].setNeedle(dashboardInfo["analogMeterNeedleHistoricLastPeak"],needlePercent);

    needlePercent=historicLast/(1000*selectorMax[selectorSelected]);
    dashboardInfo["analogMeterSvg"].setNeedle(dashboardInfo["analogMeterNeedleHistoricLast"],needlePercent);

    needlePercent=historicPeak/(1000*selectorMax[selectorSelected]);
    dashboardInfo["analogMeterSvg"].setNeedle(dashboardInfo["analogMeterNeedleHistoricPeak"],needlePercent);

    needlePercent=historicAverage/(1000*selectorMax[selectorSelected]);
    dashboardInfo["analogMeterSvg"].setNeedle(dashboardInfo["analogMeterNeedleHistoricAverage"],needlePercent);


    // set Analog units
    if (selectorMax[selectorSelected] == 10) {
        dashboardInfo["analogUnitFrontText"].innerHTML="kW";
        dashboardInfo["analogUnitFrontMulti"].innerHTML="!";
    } else {
        dashboardInfo["analogUnitFrontText"].innerHTML="kWh x";
        dashboardInfo["analogUnitFrontMulti"].innerHTML=(selectorMax[selectorSelected]/10).toString();
    }
// analogUnitFront
//     dashboardInfo["analogUnitFrontText"]=analogUnitElement;
//     dashboardInfo["analogUnitFrontMulti"]=analogUnitElement;

}


// The following 2 functions handle refreshing the JSON metrics file
function loadJSON(url,callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true); 
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText,new Date(xobj.getResponseHeader("Last-Modified")));
          }
    };
    xobj.send(null);  
}

function loadMetricData() {
    loadJSON(metricDataURL,function(response,lastModified) {
        // Parse JSON string into object
        tempData = JSON.parse(response);
        metricData = tempData;
        metricsUpdated(lastModified);
    }); 
}

// This function is called every X ms to load the data 
// Also schedules the next refresh
var refreshDelay = 300000;
function refresh() {
    loadMetricData();
    setTimeout(function(){ refresh(); }, refreshDelay);
}

// This still needs to be fixed for multiple categories
// There is some debouncing of the resize handled in here
var resizeTimeout;
function resize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function(){
        setupLayout();
        bottomButtonSelect(selectedButtonNum);
        refresh();
        selectorButtonSelect(selectorSelected);
    },250);
}

function onload(){
//     console.log("onload");
    setupLayout(); 
    bottomButtonSelect(selectedButtonNum);
    refresh();
    selectorButtonSelect(selectorSelected);
}

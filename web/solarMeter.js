
// var metricDataURL="passwordMetrics.DEV.json";
// var metricDataURL="data:///Users/dmalone/code/meter-svg/passwordMetrics.DEV.json";
var metricDataURL="http://www.malone.org/~dmalone/dmaloneSolar.json";
var metricData;

var digitalDisplayDigits=6;


var dashboardInfo={};


// function addSvgAndText(outerInfo,newIDPrefix){
//     outerInfo[newIDPrefix]={}
//     
//     var newSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
//     newSvg.id = outerInfo.id+":"+newIDPrefix+":svg";
//     newSvg.classList.add('gauge');
//     outerInfo.element.appendChild(newSvg);
//     
//     outerInfo[newIDPrefix].svg={};
//     outerInfo[newIDPrefix].svg.id=newSvg.id;
//     outerInfo[newIDPrefix].svg.element=newSvg;
// 
//     var textDiv = document.createElement('div');
//     textDiv.id = outerInfo.id+":"+newIDPrefix+":text";
//     textDiv.classList.add('gaugeText');
//     outerInfo.element.appendChild(textDiv);
// 
//     outerInfo[newIDPrefix].text={};
//     outerInfo[newIDPrefix].text.id=textDiv.id;
//     outerInfo[newIDPrefix].text.element=textDiv;
// 
//     var countDiv = document.createElement('div');
//     countDiv.id = outerInfo.id+":"+newIDPrefix+":countText";
//     countDiv.classList.add('gaugeCount');
//     textDiv.appendChild(countDiv);
// 
//     outerInfo[newIDPrefix].countText={};
//     outerInfo[newIDPrefix].countText.id=countDiv.id;
//     outerInfo[newIDPrefix].countText.element=countDiv;
// 
//     var labelDiv = document.createElement('div');
//     labelDiv.id = outerInfo.id+":"+newIDPrefix+":labelText";
//     labelDiv.classList.add('gaugeLabel');
//     textDiv.appendChild(labelDiv);
// 
//     outerInfo[newIDPrefix].labelText={};
//     outerInfo[newIDPrefix].labelText.id=labelDiv.id;
//     outerInfo[newIDPrefix].labelText.element=labelDiv;
// }

var buttonID = ["bottomAnalogButton","bottomDigitalButton","bottomTextButton","bottomJsonButton"];
var divID = ["analogMeter","digitalMeter","textDiv","jsonDiv"];

function bottomButtonSelect(id){
    var count, buttonElement, divElement;
    
    for (count=0; count<buttonID.length; count++){
        buttonElement=document.getElementById(buttonID[count]);
        divElement=document.getElementById(divID[count]);
        if (id == buttonID[count]){
            buttonElement.style.borderTopColor='black';
            divElement.style.display='';
        } else{
            buttonElement.style.borderTopColor='';
            divElement.style.display='none';    
        }        
    }
    setupLayout(); 
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

    tempElement.style.display="none";
    
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
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    // console.log(w);
    // console.log(h);

    var areaWidth = w;
    var areaHeight = h;
    
    ratio=16/9;

    if (areaHeight > areaWidth*ratio) {
        areaHeight = Math.floor(areaWidth*ratio);
    } else {
        areaWidth = Math.floor(areaHeight/ratio);
    }

    var areaLeft = Math.floor((w - areaWidth)/2);
    var areaTop = Math.floor((h - areaHeight)/2);

    // console.log(dashboardW);
    // console.log(dashboardH);

    var areaCenter=Math.floor(areaWidth/2);
    var menuHeight=areaHeight/16;

    // JSON Version
    var jsonElement=document.getElementById('jsonDiv');
    setPosition(jsonElement,areaLeft,areaTop,areaWidth,areaHeight-menuHeight);
    jsonElement.innerHTML="";
    var jsonTextElement=document.createElement('pre');
    jsonTextElement.classList.add('jsonText');
    dashboardInfo["jsonTextElement"]=jsonTextElement;
    jsonElement.appendChild(jsonTextElement);

    // Text Only
    var textElement=document.getElementById('textDiv');
    setPosition(textElement,areaLeft,areaTop,areaWidth,areaHeight-menuHeight);
    textElement.innerHTML="";
    
    var textPartHeight=areaHeight/4;
    var textValueHeight=textPartHeight*3/4;
    var textTitleHeight=textPartHeight*1/4;
    
    var thisPartTop=areaTop;
    var textTitleFontSize=areaWidth/14;
    var textValueFontSize=areaWidth/7;
    
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
    var displayPartHeight=areaHeight/4;
    var displayPartWidth=areaWidth;  // related to border that is set in css file
    
//     var displayDigits=8;
    var digitalMeterElement=document.getElementById('digitalMeter');
    setPosition(digitalMeterElement,areaLeft,areaTop,areaWidth,areaHeight-menuHeight);
    
    var divElement=document.getElementById('digitalDisplay');
    divElement.style.width=displayPartWidth;
    divElement.style.height=displayPartHeight;

    var displayInnerBorder=displayPartWidth/60;
    var displayRowGap=displayPartWidth/55;
        
    var mainDigitalRowTop=displayInnerBorder;
    var mainDigitalRowWidth=areaWidth-(displayInnerBorder*2);
    
//     MAIN ROW
    var divElement=document.getElementById('mainDigitalRow');
    setPosition(divElement,'',mainDigitalRowTop,mainDigitalRowWidth,'auto');
    divElement.style.left=displayInnerBorder;


    var digitWidth=mainDigitalRowWidth/(digitalDisplayDigits+1);
    var valueWidth=digitWidth*digitalDisplayDigits;
    var unitLeft=displayInnerBorder+digitWidth*digitalDisplayDigits;
        
    var divElement=document.getElementById('digitalValue');
//     setPosition(divElement,displayInnerBorder,displayInnerBorder,'auto','auto');

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


// Analog Meter
    var digitalMeterElement=document.getElementById('analogMeter');
    setPosition(digitalMeterElement,areaLeft,areaTop,areaWidth,areaHeight-menuHeight);



// Bottom Menu
    var divElement=document.getElementById('bottomMenu');
    setPosition(divElement,areaLeft,areaTop+areaHeight-menuHeight,areaWidth,menuHeight);
    divElement.style['line-height']=menuHeight+'px';

// 4 Buttons
    var numButtons=4;
    var buttonWidth=areaWidth/numButtons;
    var buttonFontSize=calculateCharacterWidth('Digital',divElement,buttonWidth-(displayInnerBorder*2),menuHeight-(displayInnerBorder*2));

    
    var divElement=document.getElementById('bottomAnalogButton');
    setPosition(divElement,0*buttonWidth,0,buttonWidth,menuHeight);
    divElement.style.fontSize=buttonFontSize;
    
    var divElement=document.getElementById('bottomDigitalButton');
    setPosition(divElement,1*buttonWidth,0,buttonWidth,menuHeight);
    divElement.style.fontSize=buttonFontSize;
    
    var divElement=document.getElementById('bottomTextButton');
    setPosition(divElement,2*buttonWidth,0,buttonWidth,menuHeight);
    divElement.style.fontSize=buttonFontSize;
    
    var divElement=document.getElementById('bottomJsonButton');
    setPosition(divElement,3*buttonWidth,0,buttonWidth,menuHeight);
    divElement.style.fontSize=buttonFontSize;
    



// <div class="center">
// 	<div class="Clock-Wrapper">
// 		<span class="Clock-Time-Background D7MBI">88:88<span style="font-size:30px;">88</span></span>
// 		<span id="DSEGClock" class="Clock-Time-Front D7MBI"></span>
// 		<span class="Clock-Year-Background"><span class="D7MI">2088-88-88</span><span class="D14MI"> ~~~</span></span>
// 		<span id="DSEGClock-Year" class="Clock-Year-Front"></span>
// 	</div>
// </div>



//     var dlElement=document.createElement('dl');
//     dlElement.classList.add('textList');
//     
//     var dtElement=document.createElement('dt');
//     dtElement.classList.add('textTerm');
//     dtElement.innerHTML="Now"
//     dlElement.appendChild(dtElement);
//     
//     var ddElement=document.createElement('dd');
//     ddElement.classList.add('textDescription');
//     ddElement.id="textNowValue"
//     dashboardInfo["textNowValue"]=ddElement;
//     dlElement.appendChild(ddElement);
// 
//     var dtElement=document.createElement('dt');
//     dtElement.classList.add('textTerm');
//     dtElement.innerHTML="Today"
//     dlElement.appendChild(dtElement);
//     
//     var ddElement=document.createElement('dd');
//     ddElement.classList.add('textDescription');
//     ddElement.id="textTodayValue"
//     dashboardInfo["textTodayValue"]=ddElement;
//     dlElement.appendChild(ddElement);
// 
//     var dtElement=document.createElement('dt');
//     dtElement.classList.add('textTerm');
//     dtElement.innerHTML="This Month"
//     dlElement.appendChild(dtElement);
//     
//     var ddElement=document.createElement('dd');
//     ddElement.classList.add('textDescription');
//     ddElement.id="textMonthValue"
//     dashboardInfo["textMonthValue"]=ddElement;
//     dlElement.appendChild(ddElement);
// 
//     textElement.appendChild(dlElement);

//     
    
//     var meterLeft=areaLeft;
//     var meterTop=areaTop;
//     var meterWidth=areaWidth;
//     var meterHeight=areaWidth;
// 
//     var buttonsLeft=areaLeft;
//     var buttonsTop=meterTop+meterHeight;
//     var buttonsWidth=areaWidth;
//     var buttonsHeight=areaHeight-meterHeight;
//     
//     var meterInfo={};
// 
//     var outerElement=document.getElementById('outer');
//     outerElement.innerHTML="";
//     setPosition(outerElement,areaLeft,areaTop,areaWidth,areaHeight);
//     meterInfo['outerDiv']=outerElement;
//     
//     var gaugeDiv=document.createElement('div');
//     gaugeDiv.id=1;
// 
//     var gaugeTextColor="white";

}

// function draw() {
//     var category;
//     var timeframe;
//     for (var c=0; c<categories.length; c++){
//         category=categories[c];
//         for (var t=0; t<timeframes.length; t++) {
//             timeframe=timeframes[t];
//             if (dashboardInfo[category][timeframe].gauge){
//                 dashboardInfo[category][timeframe].gauge.draw();
//             }
//         }
//     }
// }


function format7Segment(number,precision,totalDigits) {
    var tempString=number.toFixed(precision).toString();
    var numCharacters=totalDigits;
    if (tempString.indexOf('.')>=0){
        numCharacters++;
    }
    tempString=tempString.padStart(numCharacters,'!');
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
    var p='';
    if (h>11) {p='P'}
    if (h>12) {h-=12}
    if (h==0) {h=12}
    var tempString=h.toString().padStart(2,'!')+dateStr.substring(13,16)+' '+p;
    return tempString;
}

// This function is called whenever new metrics data has been loaded.
// lastModified is from the Last Updated header in the HTTP response
function metricsUpdated(lastModified) {
//     var tempValue=0;

    dashboardInfo["jsonTextElement"].textContent=JSON.stringify(metricData, Object.keys(metricData).sort(), 2);
    
    dashboardInfo["textNowValue"].innerHTML=(Math.round(metricData["currentPower"])/1000).toFixed(3)+" kW";
    dashboardInfo["textTodayValue"].innerHTML=(Math.round(metricData["lastDayEnergy"])/1000).toFixed(3)+" kWh";
    dashboardInfo["textMonthValue"].innerHTML=(Math.round(metricData["lastMonthEnergy"])/1000).toFixed(3)+" kWh";
    
    dashboardInfo["digitalValueFront"].innerHTML=format7Segment(metricData["currentPower"]/1000,3,digitalDisplayDigits);

    var updated=metricData["lastUpdateTime"];
    var sunrise=metricData["sunrise"];
    var sunset=metricData["sunset"];
    
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

    
//         Set needles and text values
//     for (var t=0; t<timeframes.length; t++) {
//         timeframe=timeframes[t];
// 
//         timeframeInfo=dashboardInfo[category][timeframe];
        
//             add leading zeros
//         timeframeInfo.countText.element.innerHTML=`00000${dashboardInfo[category][timeframe].current}`.slice(-6);
//         timeframeInfo.labelText.element.innerHTML=dashboardInfo[category][timeframe].label;
//         timeframeInfo.gauge.setNeedle(timeframeInfo.needle,timeframeInfo.currentP);
//     }
//     dashboardInfo[category].updated.element.innerHTML="Last Updated: "+dashboardInfo[category].updated.value;
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
        metricData = JSON.parse(response);
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
        refresh();
    },250);
}

function onload(){
    console.log("onload");
    setupLayout(); 
    refresh();
    bottomButtonSelect(document.getElementById('bottomDigitalButton').id);
}

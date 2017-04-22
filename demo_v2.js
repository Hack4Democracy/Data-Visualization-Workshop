var table;
var rowCount;
var tallies;

var districtTotals;
var raceTotals;
var maxDistrictStops;
var allStops;


/** based on http://bpdnews.com/districts/ */
var districtLookup = {
  'A1' :   'Downtown', 
  'A15' : 'Charlestown', 
  'A7' : 'East Boston', 
  'B2' : 'Roxbury', 
  'B3' : 'Mattapan', 
  'C6' : 'South Boston', 
  'C11' : 'Dorchester', 
  'D4' : 'South End', 
  'D14' : 'Brighton', 
  'E5' : 'West Roxbury', 
  'E13' : 'Jamaica Plain', 
  'E18' : 'Hyde Park' 
};


var raceCodes = ['Not Entered', 'Asian or Pacific Islander', 'Black', 'Hispanic', 'White', 'American Indian or Alaskan Native', 'Middle Eastern', 'Unidentified'];
var UNKNOWN_RACE = 9999;
var UNKNOWN_RACE_REPLACEMENT = raceCodes.length-1;
var columnWidths = [100, 160, 50, 80, 50, 200, 100, 100];
var colors = [
  [],
  [255,0,0],
  [0,255,0],
  [0,0,255],
  [255,127,0]
]

/** 
 We will skip districts that aren't geographic
*/
var IGNORE = 'ignore';

var censusPercents = [2.2, 8.9, 24.4, 17.5, 47,  0 /* or < .5 */,  0 /* not tracked */];


function preload() {
  table = loadTable("data/Boston_Police_Department_FIO.csv", "csv", "header");
}



function setup() {
  createCanvas(1200, 800);
  rowCount = table.getRowCount();
  textFont("Arial");
  textFont("Helvetica");
  textFont("Helvetica Neue");
  textSize(12);

  query();
}

function draw() {
  clear();
  var district, raceData, stopData, stopReason, stopCount; 
  var xpos;
  var ypos = 80;
  var raceIndex;
  var districtStops;
  fill(0);
  textSize(18);
  text("Boston Police Department – Field Investigation/Observation Stops, 2011-2015", 50, 50);
  textSize(12);
  
  xpos = 220;
  for (raceIndex = 1; raceIndex <= 4; raceIndex++) {
    var rgb = colors[raceIndex];
    fill(rgb[0],rgb[1],rgb[2]);
    text(raceCodes[raceIndex], xpos, ypos);
    xpos += columnWidths[raceIndex];
  }
  ypos += 20;
  noStroke();
  
  for (district in tallies) {
    if (IGNORE != district) {
      raceData = tallies[district];
      xpos = 220;
      var districtCount = districtTotals[district];
      var h = districtCount/300;

      fill(0);
      text(district, 50, ypos + h/2+ 8);

      var codedStops = 0;
      for (raceIndex = 1; raceIndex <= 4; raceIndex++) {
        stopData = raceData[raceIndex];
        stopCount = 0;
        for (stopReason in stopData) {
          stopCount += stopData[stopReason].stops;
        }
        var rgb = colors[raceIndex];
        fill(rgb[0],rgb[1],rgb[2]);
        //text(stopCount, xpos, ypos);
        //xpos += columnWidths[raceIndex];
        var w = map(stopCount,0.0,districtCount,0, 700.0);
        rect(xpos, ypos, w, h);
        xpos += w;
        codedStops += stopCount;
      }
      w = map((districtCount-codedStops),0.0,districtCount,0, 700.0);
      fill(127);
      rect(xpos, ypos, w, h);
      //text(districtCount, xpos, ypos);
      if (h <12) {
        ypos += 24;
      } else {
        ypos += ceil(h) + 8;
      }
    }
  }
  
  drawRaceTotals( ypos +10);
  drawCensusBreakdown( ypos +40);
}

function drawRaceTotals(ypos){
  var xpos = 220;
  var w, rgb, h = 20;
  var codedCount = 0;

  fill(0);
  text("Totals", 50, ypos + h/2+ 2);
  for (raceIndex = 1; raceIndex <= 4; raceIndex++) {
    rgb = colors[raceIndex];
    fill(rgb[0],rgb[1],rgb[2]);
    w = map(raceTotals[raceIndex],0.0,allStops,0, 700.0);
    codedCount += raceTotals[raceIndex];
    rect(xpos, ypos, w, h);
    xpos += w;
  }
  fill(127);
  w = map(allStops - codedCount, 0.0,allStops,0, 700.0);
  rect(xpos, ypos, w, h);
}



function drawCensusBreakdown(ypos){
  var xpos = 220;
  var w, rgb, h = 20;

  fill(0);
  text("Population (2010 census)", 50, ypos + h/2+ 2);
  for (raceIndex = 1; raceIndex <= 4; raceIndex++) {
    rgb = colors[raceIndex];
    fill(rgb[0],rgb[1],rgb[2]);
    w = map(censusPercents[raceIndex],0.0,100,0, 700.0);
    rect(xpos, ypos, w, h);
    xpos += w;
  }
  fill(127);
  w = map(censusPercents[0],0.0,100,0, 700.0);
  rect(xpos, ypos, w, h);
}



function query() {
  tallies = {};
  var row;
  var district, date, race, fio, reason;

  for (row=0; row<rowCount; row++) {
    district = table.getString(row, "DIST");
    if (districtLookup[district] !== undefined) {
      district = districtLookup[district];
    }  else {
      district = IGNORE;
    }
    race = table.get(row, "RACE_ID");
    if (race == UNKNOWN_RACE) {
      race = UNKNOWN_RACE_REPLACEMENT;
    }

    // codes include 
    // F frisk
    // I investigate
    // O observation
    // S search
    // P ?? personal search?

    fio  = table.getString(row, "FIOFS_TYPE");
    reason  = table.getString(row, "STOP_REASONS");

    // we aren't using the date here, but this is how you might parse it.
    var dateString = table.getString(row, "FIO_DATE_CORRECTED");
    // We have something that looks like "01/30/2014 12:00:00 AM". 
    // Even though it says "12:00:00 AM", it always says that, so it's pretty useless. 
    // We can still grab the month, day, and year
    var month = parseInt(dateString.substring(0, 2));
    var day = parseInt(dateString.substring(3, 5)); 
    var year = parseInt(dateString.substring(6, 10));
    // In javascript land, months go from 0-11, not 1-12
    month--;
    date = new Date(year, month, day);

    tally(tallies, district, race, reason, fio);
  }
  

  // now generate some totals
  var raceData, stopData, stopReason, stopCount; 
  var raceIndex;
  var districtStops;
  raceTotals = [0,0,0,0,0,0,0,0];

  maxDistrictStops = 0;
  allStops = 0;
  
  districtTotals ={};

  for (district in tallies) {
    if (IGNORE != district) {
      raceData = tallies[district];
      districtStops = 0;
      for (raceIndex = 0; raceIndex < raceCodes.length; raceIndex++) {
        stopData = raceData[raceIndex];
        stopCount = 0;
        for (stopReason in stopData) {
          stopCount += stopData[stopReason].stops;
        } 
        districtStops += stopCount
        raceTotals[raceIndex] += stopCount;
      }
      if (districtStops > maxDistrictStops) {
        maxDistrictStops = districtStops;
      }
      districtTotals[district] = districtStops;
      allStops += districtStops;
    }
  }
  
}


function tally(tallies, district, race, reason, fio) {
  var districtData = tallies[district];
  if (undefined === districtData) {
    districtData = [];
    tallies[district] = districtData;
  }
  var raceData = districtData[race]; 
  if (undefined === raceData) {
    raceData = {};
    districtData[race] = raceData;
  }
  var reasonData = raceData[reason];
  if (undefined === reasonData) {
    reasonData = { 
      'frisks' :     0, 
      'investigations' :     0, 
      'observations' :     0, 
      'searches' :     0, 
      'stops' :     0
    };
    raceData[reason] = reasonData;
  }
  reasonData.stops++;
  
  // now tally the frisks, searches, investigations, observations
  var i, L = fio.length;
  for (i = 0; i<L; i++) {
    switch(fio[i]) {
    case 'F' : 
      reasonData.frisks++; 
      break;
    case 'I' : 
      reasonData.investigations++; 
      break;
    case 'O' : 
      reasonData.observations++; 
      break;
    case 'S' : 
      reasonData.searches++; 
      break;
    }
  }
}


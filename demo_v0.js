var table;
var rowCount;
var tallies;


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
    'E18' : 'Hyde Park', 
    'YVSF' : 'Youth Violence Strike Force'
}

var raceCodes = ['Not Entered', 'Asian or Pacific Islander', 'Black', 'Hispanic', 'White', 'American Indian or Alaskan Native', 'Middle Eastern', 'Unidentified'];
var UNKNOWN_RACE = 9999;
var UNKNOWN_RACE_REPLACEMENT = raceCodes.length-1;
var columnWidths = [100, 160, 50, 80, 50, 200, 100, 100];

function preload() {
    table = loadTable("data/Boston_Police_Department_FIO.csv", "csv", "header");
}


function setup() {
    createCanvas(1200, 720);
    rowCount = table.getRowCount();
    textFont("Arial");
    textFont("Helvetica");
    textFont("Helvetica Neue");
    fill(0);
    query();
}




function draw() {
  clear();
  var district, raceData, stopData, stopReason, stopCount; 
  var xpos = 220;
  var ypos = 80;
  var raceIndex;
  textSize(18);
  text("Boston Police Department – Field Investigation/Observation Stops, 2011-2015", 50, 50);
  textSize(12);
  for (raceIndex = 0; raceIndex < raceCodes.length; raceIndex++) {
    text(raceCodes[raceIndex], xpos, ypos);
    xpos += columnWidths[raceIndex];
  }
  ypos += 18;  
  for (district in tallies) {
    text(district, 50, ypos);
    raceData = tallies[district];
    xpos = 220;
    for (raceIndex = 0; raceIndex < raceCodes.length; raceIndex++) {
      stopCount = raceData[raceIndex];
      text(stopCount, xpos, ypos);
      xpos += columnWidths[raceIndex];
    }
    ypos += 18;
  }
}



function query() {
  tallies = {};
  var row;
  var district, date, race, fio, reason;

  for (row=0; row<rowCount; row++) {
    district = table.getString(row, "DIST");
    if (districtLookup[district] !== undefined) {
      district = districtLookup[district];
    } 
    race = table.get(row, "RACE_ID");
    if (race == UNKNOWN_RACE) {
      race = UNKNOWN_RACE_REPLACEMENT;
    }
    tally(tallies, district, race);
  }
}


function tally(tallies, district, race) {
  var districtData = tallies[district];
  if (undefined === districtData) {
    districtData = [0,0,0,0,0,0,0,0];
    tallies[district] = districtData;
  }
  districtData[race]++; 
}


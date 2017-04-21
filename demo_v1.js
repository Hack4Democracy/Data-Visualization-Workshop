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

/**
 BPD has code 0 for "Not Entered" and 9999 for "Unknown". In this app, we will combine them 
 */
var raceCodes = ['unidentified', 'Asian or Pacific Islander', 'Black', 'Hispanic', 'White', 'American Indian or Alaskan Native', 'Middle Eastern'];
var UNKNOWN_RACE = 9999;

var columnWidths = [100, 160, 50, 80, 50, 200, 100];

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
  var ypos = 100;
  var raceIndex;
  for (district in tallies) {
    text(district, 50, ypos);
    raceData = tallies[district];
    xpos = 220;
    for (raceIndex = 1; raceIndex < raceCodes.length; raceIndex++) {
      text(raceCodes[raceIndex], xpos, ypos);
      stopData = raceData[raceIndex];
      stopCount = 0;
      for (stopReason in stopData) {
        stopCount += stopData[stopReason].stops;
      } 
      text(stopCount, xpos, ypos+ 18);
      xpos += columnWidths[raceIndex];
    }
    ypos += 36;
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
    if (race == 9999) {
      race = 0;
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
      'frisks' : 0, 
      'investigations' :  0, 
      'observations' : 0, 
      'searches' : 0, 
      'stops' :  0
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
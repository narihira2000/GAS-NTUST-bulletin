var sheetId = ""

function doPost(e) {
  var params = e.parameter;
  var subject = params.subject;

  var SpreadSheet = SpreadsheetApp.openById(sheetId);
  var Sheet = SpreadSheet.getSheetByName("工作表1");

  Sheet.getRange(2, 1).setValue(subject);

  return ContentService.createTextOutput("success");
}

function doGet(){

  var SpreadSheet = SpreadsheetApp.openById(sheetId);
  var Sheet = SpreadSheet.getSheetByName("工作表1");

  var subject = Sheet.getRange(2, 1).getValue();

  return ContentService.createTextOutput((subject));
}

var client_id = "";
var client_secret = "";
var sheetId = ""

function doPost(e) {
  var params = e.parameter;

  var SpreadSheet = SpreadsheetApp.openById(sheetId);
  var Sheet = SpreadSheet.getSheetByName("工作表1");

  var LastRow = Sheet.getLastRow();

  var action = params.action;

  switch (action) {
    case ("write_user_data"):
      var userId = params.userId;
      var accessToken = params.accessToken;
      var code = params.code;

      Sheet.getRange(LastRow + 1, 1).setValue(userId);
      Sheet.getRange(LastRow + 1, 2).setValue(accessToken);
      Sheet.getRange(LastRow + 1, 3).setValue(code);
      break;
    default:
      break;
  }


  return ContentService.createTextOutput("success");
}

function doGet(e) {r;
  var action = params.action;

  var SpreadSheet = SpreadsheetApp.openById(sheetId);
  var Sheet = SpreadSheet.getSheetByName("工作表1");

  var LastRow = Sheet.getLastRow();

  switch (action) {
    case ("getAll"):
      var output = [];


      for (var i = 2; i <= LastRow; i++) {
        var at = Sheet.getRange(i, 2).getValue();
        if (at) {
          output.push(at);
        }
      }

      console.log(output);
      return ContentService.createTextOutput(JSON.stringify(output));
      break;
    case ("getTokensAndKeys"):
      var output = [];


      for (var i = 2; i <= LastRow; i++) {
        var at = Sheet.getRange(i, 2).getValue();
        if (at) {
          output.push({
            token: at
          });
        }

      }

      console.log(output);
      return ContentService.createTextOutput(JSON.stringify(output));
      break;
    case ("deleteByToken"):
      var deleteToken = params.deleteToken;
      for (var i = 2; i <= LastRow; i++) {
        var at = Sheet.getRange(i, 2).getValue();
        if (at === deleteToken) {
          Sheet.deleteRow(i);
          return ContentService.createTextOutput(deleteToken + " deleted");
          break;
        }
      }
      return ContentService.createTextOutput("not found");
      break;
    case ("getUid"):
      var token = params.token;
      for (var i = 2; i <= LastRow; i++) {
        var at = Sheet.getRange(i, 2).getValue();
        if (at === token) {
          var uid = Sheet.getRange(i, 1).getValue();
          return ContentService.createTextOutput(uid);
          break;
        }
      }
      return ContentService.createTextOutput("not found");
      break;
    default:
      return ContentService.createTextOutput("error");
      break;
  }

}

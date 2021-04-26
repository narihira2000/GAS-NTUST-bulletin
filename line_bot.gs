var channelToken = "";

var client_id = "";
var client_secret = "";
var line_data_sheet_url = "";
var redirect_uri = "";
var bitly_token = "";
var bitly_group_guid = "";

function getBitlyUrl(longUrl) {
  var apiUrl = "https://api-ssl.bitly.com/v4/shorten";
  const request_body = {
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + bitly_token,
    },
    'method': 'post',
    'payload': JSON.stringify({
      "group_guid": bitly_group_guid,
      "domain": "bit.ly",
      "long_url": longUrl
    })
  }
  var res = UrlFetchApp.fetch(apiUrl, request_body);
  if (res.getResponseCode() === 200) {
    var data = JSON.parse(res.getContentText());
    console.log(data.link);
    return data.link;
  }
  else {
    return longUrl;
  }
}

function replyMsg(replyToken, userMessage, userId) {

  userMessage = userMessage.trim();
  var ins = userMessage.split(/\s+/);

  var replyText = "123";
  var replyUrl = "https://notify-bot.line.me/oauth/authorize?response_type=code&client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=notify&state=" + userId;

  switch(ins[0]){
    case ("開始"):
    case ("開始使用"):
      var shortUrl = getBitlyUrl(replyUrl);
      replyText = "請點擊以下連結來註冊 Line Notify 通知\n注意!按下同意連動後要等一下才會跳轉成功畫面，按兩次會重複訂閱\n若 Line Notify出現兩則「連動完成」的通知，請記得解除其中一個，感謝~\n\n" + shortUrl;
      break;
    case ("取消訂閱"):
      replyText = "請點擊以下連結來解除通知連動\n\nhttps://notify-bot.line.me/my/";
      break;
    default:
      replyText = "請輸入「開始」或點擊選單的「開始使用」來進行更進一步的操作哦!";
      break;
  }

  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channelToken,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': replyText,
      }],
    }),
  });
}

function write_user_data(userId, accessToken, code) {
  const request_body = {
    'method': 'post',
    'payload': {
      action: 'write_user_data',
      userId: userId,
      accessToken: accessToken,
      code: code
    }
  }
  var res = UrlFetchApp.fetch(line_data_sheet_url, request_body);

  console.log(res.getContentText());
}

function get_token(code) {
  var url = "https://notify-bot.line.me/oauth/token";
  const request_body = {
    'method': 'post',
    'payload': {
      "grant_type": "authorization_code",
      "code": code,
      "redirect_uri": redirect_uri,
      "client_id": client_id,
      "client_secret": client_secret
    }
  }
  var res = UrlFetchApp.fetch(url, request_body);
  var data = JSON.parse(res.getContentText());

  console.log(data.access_token);
  return data.access_token;
}

function doGet(e) {
  var params = e.parameter;
  var code = params.code;
  var state = params.state;
  console.log(code, state);

  var access_token = get_token(code);

  if (typeof access_token === "undefined") {
    return ContentService.createTextOutput("發生錯誤，請稍後再試!");
  }
  else {
    write_user_data(state, access_token, code);

    return ContentService.createTextOutput("已完成通知註冊，請關閉此網頁!!");
  }
}

function doPost(e) {

  var msg = JSON.parse(e.postData.contents);
  Logger.log(msg);

  // 取出 replayToken 和發送的訊息文字
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;
  var userId = msg.events[0].source.userId;

  if (typeof replyToken === 'undefined') {
    return;
  }

  replyMsg(replyToken, userMessage, userId);

}

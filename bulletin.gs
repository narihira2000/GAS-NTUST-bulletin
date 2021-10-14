
var sheet_url = "";
var line_data_sheet_url = "";
var channel_id = "";
var tg_bot_token = "";
var line_channel_token = "";



function main() {

  var last_data = get_last_data();

  var data = fetch_bulletin_data(last_data);

  if (typeof data === "undefined") {
    console.log("website error");
    return;
  }
  else if (data === -1) {
    return;
  }

  var outputData = [];
  for (var i = 0; i < data.length; i++) {

    var tmp = {
      link_path: data[i].link_path,
      info_type: data[i].info_type,
      info_title: data[i].info_title
    }

    outputData.push(tmp);
  }

  //發送通知
  for (var i = 0; i < outputData.length; i++) {
    send_tg_notif(outputData[i]);
    if(i===19){
      // 如果資料超過20筆就先休息65秒避免超過tg上限
      Utilities.sleep(65*1000);
    }
  }

  for (var i = 0; i < outputData.length; i++) {
    heroku_send_line_notify(outputData[i]);
  }

}

function heroku_send_line_notify(outputData) {
  var url = "";

  var res = UrlFetchApp.fetch(url, {
    'contentType': 'application/json; charset=utf-8',
    'method': 'post',
    'payload': JSON.stringify({
      'output_data': outputData
    })
  });
  console.log(res.getContentText());
}

function fetch_bulletin_data(last_data) {
  var threads = GmailApp.search('subject:"[TaiwanTech] 臺科公佈欄(NTUST Bulletin)"');

  //比對資料，相同就不執行回傳-1
  if (last_data === threads[0].getFirstMessageSubject()) {
    console.log("nothing changed");
    return -1;
  }

  write_latest_data(threads[0].getFirstMessageSubject());

  console.log(threads[0].getFirstMessageSubject());
  var msg = threads[0].getMessages();

  const html = msg[0].getBody();

  // console.log(html);

  const $ = Cheerio.load(html);

  //抓link path
  var link_path = [];
  $('tbody td a[target="_blank"]').each(function () {
    // console.log(this);
    link_path.push($(this).attr('href'));
  });
  // console.log(link_path);

  //抓title
  var info_title = [];
  $('tbody td[data-title="標題"]').each(function () {
    // console.log(this);
    info_title.push($(this).text().trim());
  });
  // console.log(info_title);

  //抓取發布單位
  var user_name = [];
  $('tbody td[data-title="發佈單位"]').each(function () {
    user_name.push($(this).text().trim());
  });
  // console.log(user_name);

  var return_data = [];
  for (var i = 0; i < link_path.length; i++) {
    return_data.push({
      link_path: link_path[i],
      info_title: info_title[i],
      info_type: user_name[i]
    });
  }
  // console.log(return_data);

  return return_data;

}

function get_last_data() {
  const request_body = {
    'method': 'get'
  }
  var res = UrlFetchApp.fetch(sheet_url, request_body);

  console.log(res.getContentText());

  return res.getContentText();
}

function write_latest_data(subject) {
  const request_body = {
    'method': 'post',
    'payload': {
      subject: subject
    }
  }
  var res = UrlFetchApp.fetch(sheet_url, request_body);

  console.log(res.getContentText());
}

function send_tg_notif(data) {

  var url = "https://api.telegram.org/bot" + tg_bot_token + "/sendMessage";


  var caption = "【" + data.info_type + "】\n\n" + "<a href=\"" + data.link_path + "\">" + data.info_title + "</a>";
  // console.log(caption);

  request_body = {
    'method': 'post',
    'payload': {
      'chat_id': channel_id,
      'parse_mode': "HTML",
      'text': caption,
      'disable_web_page_preview': true,
      'disable_notification': true
    }
  }

  UrlFetchApp.fetch(url, request_body);

}

function get_line_token_status() {
  var request_body = {
    'method': 'get'
  }
  var res = UrlFetchApp.fetch(line_data_sheet_url + "?action=getAll", request_body);
  var tmp = JSON.parse(res.getContentText());

  for (var i = 0; i < tmp.length; i++) {
    request_body = {
      'headers': {
        'Authorization': 'Bearer ' + tmp[i],
      },
      'method': 'get'
    }
    var url = "https://notify-api.line.me/api/status";
    try {
      var res = UrlFetchApp.fetch(url, request_body);

    } catch (error) {
      console.log(error.toString());
      //使用者解除訂閱
      if (error.toString().includes("401") && error.toString().includes("Invalid access token")) {
        // return "401";
        console.log("401");
        var durl = line_data_sheet_url + "?action=deleteByToken&deleteToken=" + tmp[i];
        request_body = {
          'method': 'get'
        }
        UrlFetchApp.fetch(durl, request_body);
      }
      //使用者沒有把line notify加入要接受通知的群組
      else if (error.toString().includes("400") && error.toString().includes("LINE Notify account doesn't join group which you want to send.")) {
        console.log("400");
      }
    }
  }
}


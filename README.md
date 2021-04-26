# GAS-NTUST-bulletin
一個透過Google App Script發送台科公佈欄資訊到telegram和line notify的機器人

## 機器人網址
- [Telegram](https://t.me/NTUST_bulletin)
- [Line](https://page.line.me/983txppi)

## Screenshots
![](https://i.imgur.com/0dlIUcd.png)

## 部署說明
- 基本上把各.gs內容copy到google app script上即可執行
- 主要執行`bulletin.gs`中的main，並設為每10分鐘執行一次
- `bulletin.gs`有使用 [cheerio](https://github.com/tani/cheeriogs) 作為分析網頁資料的工具，若要部屬請記得在資料庫的地方新增服務(版本選擇12)
- 除了`bulletin.gs`以外的其他三個`.gs`檔皆須部署為網路應用程式並取得執行url
- 所有需要的private的網址、token皆放在各檔案的前幾行，請自行部署得到這些值後填入
- `line_data_sheet.gs`為`line_data.xlsx`的指令碼編輯器，而`bulletin_data_sheet.gs`為`bulletin_data.xlsx`的指令碼編輯器，使用方法為新建一試算表後點上方選單列的`工具>指令碼編輯器`即可打開google app script
![](https://i.imgur.com/DnMF9rK.png)

## 注意事項
- google app script有限制個功能使用次數，例如:
    - read email一天只能呼叫20000次
    - fetch url一天只能呼叫20000次
> 詳細可查看 [官網說明](https://developers.google.com/apps-script/guides/services/quotas)
- 由於Line Notify發送方式為針對單一使用者發送，所以若要達到群發功能需要取得所有access token並逐一發送，在訂閱人數上升的狀況下很容易超過quota，所以要把send line notify功能移到其他server實作
> 已新增heroku部分的code，存放於`heroku/`中，使用python並搭配Flask寫成

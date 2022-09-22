from flask import *
import os
import requests
import json
import asyncio
import aiohttp

app = Flask(__name__)

@app.route('/', methods=['POST', 'GET'])
def index():
    if(request.method == 'POST'):    
        output_data = request.get_json()
        data = output_data['output_data']
        print(output_data)

        line_data_sheet = ""
        r = requests.get(line_data_sheet + "?action=getTokensAndKeys")
        userDatas = json.loads(r.text)
        print(userDatas)

        async def send_line_notify(data, userData):
            url = "https://notify-api.line.me/api/notify"
            caption = "\n【" + data["info_type"] + "】\n\n" + data["info_title"] + "\n\n" + data["link_path"]
            header = {'Authorization': 'Bearer ' + userData['token']}
            outdata = {'message': caption}
            if "img_path" in data:
                outdata = {'message': caption, 'imageThumbnail': data["img_path"], 'imageFullsize': data["img_path"]}

            async with aiohttp.request("POST", url, headers=header, data=outdata) as resp:
                return resp.status

        tasks = []
        # print(data)
        for userData in userDatas:
            tasks.append(send_line_notify(data, userData))

        async def gather_requests():
            await asyncio.gather(*tasks)
            
        asyncio.run(gather_requests())
        return f'send line success'

    if(request.method == 'GET'):
        print("gettt")
        return f'hello'

if __name__ == 'main':
    app.run()

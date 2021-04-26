from flask import *
import os
import requests
import json
import asyncio

app = Flask(__name__)

@app.route('/', methods=['POST', 'GET'])
def index():
    if(request.method == 'POST'):    
        loop = asyncio.get_event_loop()
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

            res = await loop.run_in_executor(None, lambda: requests.post(url, headers=header, data=outdata))

        tasks = []
        # print(data)
        for userData in userDatas:
            task = loop.create_task(send_line_notify(data, userData))
            tasks.append(task)
            
        loop.run_until_complete(asyncio.wait(tasks))
        return f'send line success'

    if(request.method == 'GET'):
        print("gettt")
        return f'hello'

if __name__ == 'main':
    app.run()

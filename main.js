const express = require('express')
const fs = require('fs')
const fetch = require('node-fetch')
const cheerio = require('cheerio')

let app = express()

const setting = JSON.parse(fs.readFileSync('setting.json'))

app.listen(process.env.PORT || setting.port)

app.get('/api/character', async (req, res) => {
    let result = []
    let imgReg = new RegExp("[a-zA-z]+://[^]*[.jpg|.gif|.png]")
    let textReg = new RegExp(/[\u4e00-\u9fa5,\u0030-\u0039,\uff0c,\u3002,\uff08,\uff09,\u0020]*/g)
    let web = await fetch(setting.feed).then(res => res.text())
    $ = cheerio.load(web)
    let ul = $('.activity-feed').find('li')
    ul.each(function () {
        let unit = $(this)
        let className = unit.prop('class')
        let imgUrl = ''
        try {
            imgUrl = (unit.find('span.icon-frame').css('background-image')).match(imgReg)
        }
        catch (e) {
            switch (className) {
                case 'bosskill ':
                    imgUrl = './images/bosskill.gif'
                break;
                case 'crit ':
                    imgUrl = './images/crit.gif'
                break;
                default:
                    imgUrl = './images/guild.gif'
                break;
            }
        }
        let obj = {
            'img': imgUrl,
            'text': unit.find('dd').text().match(textReg).join(''),
            'time': unit.find('dt').text()
        }
        result.push(obj)
    })
    let headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": setting.cors
    }
    res.header(headers)
    res.send(result)
})
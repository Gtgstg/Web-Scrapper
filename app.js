let express = require('express');
let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');
let pdf = require('html-pdf');
let app = express();

app.get('/arbitrage', function(req, resp){

    let stock = ['Infosys','TataSteel'];
    let url = ['https://www.moneycontrol.com/india/stockpricequote/computers-software/infosys/IT','https://www.moneycontrol.com/india/stockpricequote/steel-large/tatasteel/TIS'];
    let htm = fs.readFileSync('demo.html', 'utf8');
    let page = cheerio.load(htm);

    for(let u = 0; u < url.length; u++){

        request(url[u], function(error, response, html){

            if(!error){

                let $ = cheerio.load(html);
                let values=[];

                $('.span_price_wrap').filter(function(){
                    let data = $(this);
                    values.push(parseFloat(data.text()));
                });

                page('.my_table').append(
                    `<tr>
                        <td>${stock[u]}</td>
                        <td>${values[1]}</td>
                        <td>${values[0]}</td>
                        <td>${Math.abs(values[1]-values[0])}</td>
                    </tr>`
                );

                if(u==url.length-1){
                    let options = { format: "A4", orientation: "portrait", border: "10mm" };
                    pdf.create(page.html(), options).toFile('./output.pdf', function(err, res) {
                        if (err) return console.log(err);
                        resp.download(res.filename);
                    });
                }
            }
            else console.log(error);
        });
    }
});

app.listen(process.env.PORT || 5000,function() {

    console.log("Work on 5000");
});
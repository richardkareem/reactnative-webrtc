const path = require('path')
const http = require('http')
const express = require('express')
const fs = require('fs')
const axios = require('axios')
const Tesseract = require('tesseract.js')
const fileUpload = require('express');
const { createWorker } = Tesseract;
const multer = require('multer');
const { Http2ServerResponse } = require('http2')
//obh 😀
//npx


const upload = multer({ dest: './public/data/uploads/' })
const uploadDIr = path.join(__dirname, './public/data/uploads')

// const { getIO, initIO } = require('./socket')

const app = express();
let port = 8080;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(fileUpload());
// multipart/formdata
// app.use(upload.array()); 
// app.use(express.static('public'));  
const dirname = 'C:\\Users\\newfamme\\Documents\\my-workspace\\ReactNativeRTC\\ReactNativeWebRTC'
// app.get('/', express.static(path.join(dirname, 'static')));
// app.use('/', express.static(path.join(__dirname, 'static')));




app.post('/', async (req, res) => {
    try {
        const image = req.body?.image;

        if(!image){
            throw new Error('Image Error Syng')
        }
        const worker = await createWorker(['ind'], 1);
        const responseWorker = await worker.recognize(image);
        console.log(responseWorker.data.text);
        const { blocks } = responseWorker.data;
        const arrayConfidents = blocks[0].paragraphs;
        const getLargestConfidesnt = arrayConfidents.map(item => {
            return item.confidence
        })
        const largest = Math.max(...getLargestConfidesnt);
    
        const resultConfident = arrayConfidents.find(item => item.confidence == largest)
        console.log("//////////////////////////////////////////////////////////////////");
        // console.log(resultConfident);
        // console.log(resultConfident.lines[0].words);
        const linesHighesConfident = Math.max(...resultConfident.lines.map(item => item.confidence));
        const resultLines = resultConfident.lines.filter(item =>{
            if(item.confidence.toString()[0] === linesHighesConfident.toString()[0]){
                return item
            }
            return
        })

        const shorterIndex = Math.min(...resultLines.map(item => item.words.length ));
        
        const resultFinal = resultLines.find(item => item.words.length == shorterIndex);

        const response = 
            {
                text: resultFinal.text,
                confident: resultFinal.confidence,
                lengthWord: resultLines.map(item => item.words.length )

            }
        
        return res.send(response)

    } catch (error) {
        console.log(error);
    }
})




const httpServer = http.createServer(app)


// initIO(httpServer);


httpServer.listen(port);
console.log("server started on ", port);

// getIO();
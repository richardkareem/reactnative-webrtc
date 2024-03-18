const path = require('path')
const http = require('http')
const express = require('express')

const { getIO, initIO } = require('./socket')

const app = express();
let port = 8000;

// app.get('/', (req, res) =>{
//     console.log(res.body);
//     res.send("masok")
// });
const dirname = 'C:\\Users\\newfamme\\Documents\\my-workspace\\ReactNativeRTC\\ReactNativeWebRTC'
app.get('/', express.static(path.join(dirname, 'static')));
// app.use('/', express.static(path.join(__dirname, 'static')));


const httpServer = http.createServer(app)


initIO(httpServer);


httpServer.listen(port);
console.log("server started on ", port);

getIO();
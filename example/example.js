//Light nodejs server to send data

var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(function(req, res) {
    res.sendFile(__dirname + '/public/index.html')
})

var listener = app.listen(9001, function(){
    console.log('listening on port : ' + listener.address().port)
})


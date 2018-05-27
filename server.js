var fs = require('fs')
var http = require('http');
var port = process.env.PORT || 3001;

var server = http.createServer((req, res) => {
    let obj = [];
    req.on('data', (chunk) => {
        obj.push(chunk);
    });
    req.on('end', () => {
        console.log("close req");
        obj = Buffer.concat(obj).toString();
        fs.writeFile('info.json', obj, (err) => {
            if(err){
                console.info("Filesystem error: ", err);
            } 
            console.info("Filesystem wrote file with data: ", obj);
        });
    });
    res.write('snice');
    res.end();
}).on('error', (err) => {
    console.log(err);
});

server.listen(port, (err) => {
    if(err) console.log("Error commited on server", err)
    console.log("Server started listening to at port: "+port);
});
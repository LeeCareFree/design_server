var fs = require('fs');
var http = require('http');

var PORT = 3000;

createHttpServer();

/*
 * Create http server.
 */
function createHttpServer() {
    http.createServer(function (req, res) {
        downloadFile(res);
    }).listen(PORT, '8.129.214.128');
    console.log('Server running at http://8.129.214.128:' + PORT + '...');
}

/*
 * Output the download file.
 */
function downloadFile(res) {
    // The must headers.
    res.setHeader('Content-type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment;filename=app-release.apk');    // 'aaa.txt' can be customized.
    var fileStream = fs.createReadStream('./download/app-release.apk');
    fileStream.on('data', function (data) {
        res.write(data, 'binary');
    });
    fileStream.on('end', function () {
        res.end();
        console.log('The file has been downloaded successfully!');
    });
}
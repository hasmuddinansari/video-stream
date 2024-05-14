const express = require("express");
const app = express();
const fs = require("fs");
const path = require('path')

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/full-video', function (req, res) {
    const filePath = path.join(__dirname, 'video2.mp4');
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
})

app.get("/stream-video", function (req, res) {
    const range = req.headers.range;
    if (!range) {
        return res.status(400).send("Requires Range header");
    }

    const videoPath = "video2.mp4";
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6; //1mb
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

app.listen(9000, function () {
    console.log("Listening on port 9000!");
});
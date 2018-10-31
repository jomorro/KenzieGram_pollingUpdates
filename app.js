const express = require("express");
const multer = require("multer");
const fs = require('fs');
const path = require('path');

const port = 3000;
const uploadsPath = './public/uploads';
const publicPath = './public/';

const app = express();
app.set("view engine", "pug");
app.use(express.static(publicPath));

const storage = multer.diskStorage({
    destination: uploadsPath,
    filename: function (req, file, callback) {
        const fileCurName = path.extname(file.originalname);
        const fileNewName = file.originalname.replace(new RegExp(fileCurName), "") + "-" + Date.now() + fileCurName;
        callback(null, fileNewName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: function (req, file, callback) {
        fileType(file, callback);
    }
});

function fileType(file, callback) {
    const checktypes = /jpg|jpeg|png|gif/;

    const extname = checktypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = checktypes.test(file.mimetype);

    if (extname && mimetype) {
        return callback(null, true);
    } else {
        callback("Error: Images are the only thing that can be uploaded")
    }
}

app.get('/', (req, res) => {
    fs.readdir(uploadsPath, function (err, items) {
        if (err) {
            return console.log('Error reading the directory ${uploadsPath}', err);
        }
        const itemPaths = items
            .map(item => "uploads/${item}")
            .map(imagePath => [fs.statSync("public/" + imagePath).ctime, imagePath])
            .sort((cTimeFoPath1, cTimeFoPath2) => cTimeFoPath2[0] - cTimeFoPath1[0])
            .map(([imageCtime, imagePath]) => imagePath);
        res.render("index", {
            title: 'KenzieGram',
            h1: 'Welcome to Kenziegram',
            images: itemPaths
        });
    });
});

app.post("/uploads", upload.single("myImage"), (req, res) => {
    res.render("upload", {
        title: "Upload",
        h1: "file uploaded",
        imagePath: "uploads/$(req.file.filename}"
    });
});

app.listen(port, () => console.log("Server listening on port ${port}."));
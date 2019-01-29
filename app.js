
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const port = 3000;
const uploadsPath = './public/uploads';
const publicPath = './public/';

const app = express();
app.set('view engine', 'pug');
app.use(express.static(publicPath));

// Determines destination of where file is stored and how it will be stored to the disk.
const storage = multer.diskStorage({
    destination: uploadsPath,
    filename: function (req, file, callback) {
        const fileExtName = path.extname(file.originalname);
        const newFilename = file.originalname.replace(new RegExp(fileExtName), '')
            + '-' 
            + Date.now() 
            + fileExtName;
        callback(null, newFilename);
    }
});
//Specifies size limits for the optional properties below and which files are to be accepted.
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2000000
    },
    fileFilter: function (req, file, callback) {
        checkFileType(file, callback);
    }
});

function checkFileType(file, callback) {
    const filetypes = /jpg|jpeg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return callback(null, true);
    } else {
        callback('Error: Can only be Images!');
    }
}

app.get('/', (req, res) => {
    fs.readdir(uploadsPath, function(err, items) {
        if (err) {
            return console.log(`Error reading directory ${uploadsPath} `, err);
        }
        const itemPaths = items
            .map(item => `uploads/${item}`)
            .map(imagePath => [fs.statSync('public/' + imagePath).ctime, imagePath])
            .sort((cTimeAndPath1, cTimeAndPath2) => cTimeAndPath2[0] - cTimeAndPath1[0])
            .map(([imageCtime, imagePath]) => imagePath);
        res.render('index', {title: 'KenzieGram', h1: 'Welcome to Kenziegram', images: itemPaths});
    });
});

app.post('/uploads/', upload.single('myImage'), (req, res) => {
    res.render('upload', {title: 'Upload', h1: 'file uploaded', imagePath: `uploads/${req.file.filename}`});
});

app.listen(port, () => console.log(`Server listening on port ${port}.`));
// index.js

const express = require("express");
var app = express()
app.use(express.json())

const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Product = require('./models/Product');
const { response } = require("express");
const { json } = require("body-parser");
const { on } = require("./models/Product");




//เพราะ express ไม่สามารถรับค่า request body ได้ default จะเป็น undefined จะสามารถใช้ได้ก็ต่อ เมื่อใช้ body-parser middleware
// const dns = require('dns');

// dns.lookup('8.8.8.8', (err, value) => {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     console.log(value);
// });


// คำสั่งเชื่อม MongoDB Atlas
var MongoClient = require('mongodb').MongoClient;
var mongo_uri = "mongodb+srv://chutinan:1234@chutinan-fd5zj.gcp.mongodb.net/PVpanel?retryWrites=true&w=majority";
mongoose.Promise = global.Promise;
mongoose.connect(mongo_uri, { useNewUrlParser: true }).then(
    () => {
        console.log("[success] task 2 : connected to the database ");
    },
    error => {
        console.log("[failed] task 2 " + error);
        process.exit();
    }
);



app.use(cors());

// คำสั่งสำหรับแปลงค่า JSON ให้สามารถดึงและส่งค่าไปยัง MongoDB Atlas ได้
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 80;
var status = 0;
// 0 offline
// 1 start
// 2 done

var date = new Date();
var lightweight = 50;

// สร้าง database schema
//const PRODUCTS = mongoose.model('PRODUCTS', { board: String })

// สร้าง instance จาก model
//const PVpanel = new PRODUCTS ({ board: 'AB12347' })

// save ลง database (return เป็น Promise)
//PVpanel.save().then(() => console.log('meow'))

//app.listen(port, () => {
//    console.log("[success] task 1 : listening on port " + port);
//});

// สำหรับ HTTP GET



app.get('/products', async (req, res) => {
    console.log("GET ALL")
    const products = await Product.find({ status_Save: "on" })
    res.json(products)
})

app.get('/products/:id', async (req, res) => {
    var ObjectId = require('mongodb').ObjectId;
    var id = req.params.id;
    var products = await Product.findById(id)
    res.json(products)
})

app.post('/products', async (req, res) => {
    console.log("POST DATA")
    var payload = req.body
    payload.volts = req.body.volts.sort(function (a, b) { return a - b })
    payload.current = req.body.current.sort(function (a, b) { return a - b })
    payload.status_Save = "off"
    //console.log(payload)
    try {
        const products = new Product(payload)
        await products.save()
        status = 2
    } catch (error) {
        console.log(error)
    }

    res.status(201).end()
})

app.put('/save/:id', async (req, res) => {

    const id = req.params.id
    const payload = req.body
    payload.volts = req.body.volts.sort(function (a, b) { return a - b })
    payload.current = req.body.current.sort(function (a, b) { return a - b })
    payload.nameBoard = req.body.nameBoard
    payload.light_intensity = lightweight
    payload.status_Save = "on"
    
    payload.myDateTime = new Date().getTime.toString

    const products = await Product.findByIdAndUpdate(id, { $set: { payload} })
    res.json(products)
})

app.put('/save', async (req, res) => {

    console.log("Savelast")

    var ObjectId = require('mongodb').ObjectId;

    var _id = await Product.find().sort({ _id: -1 }).limit(1);

    const payload = req.body
    // payload.volts = req.body.volts.sort(function (a, b) { return a - b })
    // payload.current = req.body.current.sort(function (a, b) { return a - b })
    payload.nameBoard = req.body.nameBoard
    payload.light_intensity = lightweight
    payload.status_Save = "on"  
    
    payload.myDateTime = new Date().toISOString().toString()

    const products = await Product.findByIdAndUpdate(_id, { $set: payload })
    res.json(products)



})

//Edit products
app.put('/products/:id', async (req, res) => {
    console.log("EDIT BY ID");
    const payload = req.body
    const id = req.params.id
    const products = await Product.findByIdAndUpdate(id, { $set: payload })
    res.json(products)
})

app.delete('/products/:id', async (req, res) => {
    console.log("Delete");
    const id = req.params.id

    await Product.findByIdAndDelete(id)
    res.status(204).end()
})

// BORAD

app.get('/board/check', async (req, res) => {
    //res.send(products);
    date = new Date();
    res.json({ status, lightweight })
})
app.get('/board/done', async (req, res) => {
    date = new Date();
    status = 2;
    res.send(status + "");
})

app.get('/test/findLast', async (req, res) => {
    console.log("Find Last");
    var ObjectId = require('mongodb').ObjectId;
    var products = await Product.find().sort({ _id: -1 }).limit(1);
    res.json(products)
})

app.get('/appcheck', async (req, res) => {
    var now = new Date();
    var timeDifference = (Math.abs(now.getTime() - date.getTime()) / 1000);
    if (timeDifference > 10) {
        //status = 0;
    }
    res.json({ status, date, timeDifference });
})


app.get("/appstart/:lightweight", async (req, res) => {
    console.log(req.params.lightweight);
    var tmp_light = req.params.lightweight;
    var now = new Date();
    var timeDifference = Math.abs(now.getTime() - date.getTime());
    if (timeDifference / 1000 > 10) {
        status = 0;
        res.status(400).json({});
    } else {
        status = 1;
        lightweight = parseInt(tmp_light);
        res.status(200).json({});
    }
})

app.get("/appstop", async (req, res) => {
    var now = new Date();
    status = 0;
    res.status(200).json({});
})

app.listen(port, () => {
    console.log("[success] task 1 : listening on port " + port);
});

app.use((req, res, next) => {
    var err = new Error("ไม่พบ path ที่คุณต้องการ");
    err.status = 404;
    next(err);
})

var firstDate = new Date()
setTimeout(() => {
    var secondDate = new Date()

    var timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());
    console.log(timeDifference / 1000);

}, 3000);

mongoose.connection.on('error', er => {
    console.error('MongoDB error', err)
})


const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const initData = require('./data.js');


main().then(() => { console.log("mongo db connected") 
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/StayVista");
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "67bc8f9f367db50076882bbc"}));
    await Listing.insertMany(initData.data);
    console.log("Data added");
};

initDB();

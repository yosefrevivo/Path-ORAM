const express = require("express");
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const HEIGHT = 12;
const BUCKET_SIZE = 4;
const BLOCK_COUNT = (2 ** HEIGHT) - 1;
const MEMORY = new Array(BLOCK_COUNT);


for (let i = 0; i < MEMORY.length; i++)
  MEMORY[i] = new Array(BUCKET_SIZE);

const app = express();
app.use(express.json());

app.get("/getNode", (req, res) => {

  try {
    
    let { nodeNum } = req?.query;

    // return the req.
    res.json({ data: MEMORY[nodeNum] });

  } catch(err) { res.json({ data: "Error: Cant get your node." }); }

});

app.post("/setNode", (req, res) => {

  try {
    
    let { nodeNum, data } = req?.body;
    MEMORY[nodeNum] = data;
    console.log(data);

    res.json({ status: "Success, node set." });

  } catch(err) { res.json({ status: "Error: Cant set your node." }); }

});

app.post("/save", (req, res) => {

    let allData = fs.readFileSync(__dirname + "/data/allData.json", "utf-8");
    let allDataJson = allData == ""? {}: JSON.parse(allData);

    let { name, data } = req?.body;

    allDataJson[name] = data;

    fs.writeFileSync(__dirname + "/data/allData.json", JSON.stringify(allDataJson), "utf-8");

    res.json({ message: "Saved successfully" });

  });

app.get("/get", (req, res) => {

    let allData = fs.readFileSync(__dirname + "/data/allData.json", "utf-8");
    let allDataJson = allData? JSON.parse(allData): {};

    let { name } = req.query;
    res.json({ data: allDataJson[name] });

});

app.get("/getMemory", (req, res) => {

    res.json({ data: MEMORY });

});

app.delete("/delete", (req, res) => {

    let allData = fs.readFileSync(__dirname + "/data/allData.json", "utf-8");
    let allDataJson = allData == ""? {}: JSON.parse(allData);

    let { name } = req?.body;

    delete allDataJson[name];

    fs.writeFileSync(__dirname + "/data/allData.json", JSON.stringify(allDataJson), "utf-8");

    res.json({ message: "Deleted successfully" });

});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

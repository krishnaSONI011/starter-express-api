const express =require('express')
const axios = require('axios')
const csv = require('csv-parser');
const fs = require('fs')
const cors =require('cors')
let app = express()

app.use(cors())
app.use(express.json()); 

app.listen(8080, ()=>{
    console.log("server start")
})
app.get("/",async (req,res)=>{
    try{
        let r = await axios.get("http://vehicletrack.biz/api/companyvehiclelatestinfo?token=C_3BD0B0A02B")

        return res.status(r.status).json(r.data)
    }catch(err){
        console.error(err)
    }
})

app.post('/filterData', (req, res) => {
    const { vehicleNo, startDate, endDate } = req.body;
  
    if (!vehicleNo || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing parameters: vehicleNo, startDate, or endDate' });
    }
  
    const results = [];
    const csvFilePath = 'gps.csv';
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.VehicleNo === vehicleNo) {
          const rowDate = new Date(row.Date);
          const startDateTime = new Date(startDate);
          const endDateTime = new Date(endDate);
  
          if (rowDate >= startDateTime && rowDate <= endDateTime) {
            results.push(row);
          }
        }
      })
      .on('end', () => {
        console.log('CSV file reading and filtering complete.');
        res.json({ data: results });
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  });
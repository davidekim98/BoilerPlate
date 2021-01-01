const express = require('express')
const app = express()
const port = 5000

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://davidk:jHBggiY0KylxSQCt@cluster0.lyorw.mongodb.net/Cluster0?retryWrites=true&w=majority', {
	useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(()=>console.log('Mongoose Connected...'))
	.catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at https://nodeandreact.run.goorm.io with the port number: ${port}`)
})
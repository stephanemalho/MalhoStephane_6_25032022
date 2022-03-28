// console.log("du code s'affiche sur le terminal");
const http = require('http');
const express = require('express');

const app = express();
app.use((req, res) => {
    res.json({ message: 'requête reçue !' }); 
});
app.set('port',process.env.PORT || 4200 );
const server = http.createServer(app);

server.listen(process.env.PORT || 4200);




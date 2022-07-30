const express = require('express');
const app = express();
const todos = require('./routes/todos');

app.use(express.json());
app.use('/api/todos', todos);

app.use(express.urlencoded({extended : true}));

const port = process.env.PORT || 51174;

app.listen(port, () => {
    console.log(`Listing to port ${port}`);
});
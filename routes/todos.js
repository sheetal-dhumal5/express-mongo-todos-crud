const express = require('express');
const router = express.Router();
const Joi = require('joi');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/brian').then( () => console.log('Mongodb connection established'));

const todoSchema = new mongoose.Schema({
    name:{type: String, required: true, minlength:3, maxlength:20},   //built-in validation
    priority:Number,
    description:String
});

const Todo = mongoose.model('Todo', todoSchema);

//get all records api
router.get('/', async(req,res) => {
    const result = await Todo.find();
    res.send(result);
});

//post api - to add data
router.post('/', async(req,res) =>  {
    try {
        const todo = new Todo({
            name: req.body.name,      
            priority: req.body.priority,
            description: req.body.description
        });
        const result = await todo.save();
        res.status(201).send(todo); // Success
    } catch(e) {
        res.status(400).send(e.message);
    }
});

//get by id parameter - single record api
router.get('/:id', async(req,res) => {
    const paramId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(paramId)) {
        return res.status(422).send('Invalid Url Parameter Id');
    }

    const existTodos = await Todo.find();
    const findExist = existTodos.find( todo => todo.id === paramId )
    if (!findExist) {
        return res.status(404).send(`Record with id ${paramId} does not exist`);
    }
    res.send(findExist);
});

//delete by id parameter api
router.delete('/:id', async(req,res) =>  {
    const paramId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(paramId)) {
        return res.status(422).send('Invalid Url Parameter Id');
    }

    const existTodos = await Todo.find();
    const filterTodo = existTodos.filter( todo => todo.id !== paramId )
    if (existTodos.length === filterTodo.length ) {
        return res.status(404).send(`Record with id ${paramId} does not exist`);
    }

    const result = await Todo.findByIdAndRemove(paramId); 
    res.send({success: true, msg: `Record with id: ${paramId} removed successfully`});
});

//put api for update data by id parameter
router.put('/:id', async(req, res) => {
    const paramId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(paramId)) {
        return res.status(422).send('Invalid Url Parameter Id');
    }

    const existTodos = await Todo.find();
    const filterTodo = existTodos.filter( todo => todo.id !== paramId )
    if (existTodos.length === filterTodo.length ) {
        return res.status(404).send(`Record with id ${paramId} does not exist`);
    }

    const schema = Joi.object({
        _id: Joi.string(),
        name: Joi.string().min(3).max(20).required(),
        priority: Joi.number(),
        description: Joi.string()
    });
    const { error } = schema.validate(req.body);
    if(error) {
        return res.status(400).send(error.details[0].message);
    }

    const result = await Todo.findByIdAndUpdate(paramId, 
        {$set: {
            name: req.body.name,
            priority: req.body.priority,
            description: req.body.description
        }}, 
        {new: true});
    res.send(result);
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
          process.exit(0);
      });
});

module.exports = router;

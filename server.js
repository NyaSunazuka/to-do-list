///--------------------------------------------------------------------/////
//////////Run Server//////////
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./db.env" });
const { Pool } = require("pg");
const pool = new Pool({
    connectionString:process.env.DATABASE_URL,
});
// async function example(){
//     const result = await someAsyncFunction();
//     console.log(result);
    
// }
// example();


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// app.get("/",(req,res) => {
//     res.send("Task Manager API is runnig...");
// });


const PORT = process.env.PORT || 12000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

///--------------------------------------------------------------------/////
//////////Task Model//////////

let tasks = [
    {id: 1,name:"Simple Task", completed: false}
];


///--------------------------------------------------------------------/////
//////////Create Task//////////

app.post("/tasks", async (req,res)=>{
    const {name} = req.body;
    if (!name){
        return res.status(400).json({error:"name is required"});
    }

    try {
        const result = await pool.query(
            "insert into tasks (name) VALUES ($1) RETURNING *",
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch(err){
        res.status(500).json({error:"Database error"});
    }
    // const newTask = {
    //     id: tasks.length+1,
    //     name: name,
    //     completed: false

    // };
    // tasks.push(newTask);
    // res.status(201).json(newTask);
});


///--------------------------------------------------------------------/////
//////////Read Task//////////

app.get("/tasks", async (req,res) => {

    try{
        const result = await pool.query("select * from tasks order by id asc");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error:"Database error"});
    }

    // res.json(tasks);
});

app.get("/tasks/:id", async (req,res)=>{

    try{
        const result = await pool.query("select * from tasks where id =$1",[req.params.id]);
        if(result.rows.length ===0) return res.status(404).json({error: "Task not found"});
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error:"Database error"});
    }


    // const task = tasks.find(t => t.id === parseInt(req.params.id));
    // if (!task) {
    //     return res.status(404).json({error:"Task not found"});
    // }
    // res.json(task);
})

///--------------------------------------------------------------------/////
//////////Update Task//////////

app.put("/tasks/:id", async (req,res) => {

    const {name , completed} = req.body;
    
    try{
        const result = await pool.query(
            "update tasks set name = coalesce($1,name),completed = coalesce($2, completed) where id = $3 returning *",
            [name, completed, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error:"Database error"});
    }




    // const task = tasks.find(t => t.id === parseInt(req.params.id));
    // if (!task){
    //     return res.status(404).json({error:"Task not found"});
    // }
    // const { name, completed} = req.body;
    // if (name) task.name = name;
    // if (completed !== undefined) task.completed = completed;
    // res.json(task);
});



///--------------------------------------------------------------------/////
//////////Delete Task//////////

app.delete("/tasks/:id", async (req,res) => {

    try{
        const result = await pool.query("delete from tasks where id = $1 returning *", [req.params.id]);
        if (result.rows.length ===0) return res.status(404).json({error:"Task not found"});
        res.status(204).send();
        
    } catch (err) {
        res.status(500).json({error:"Database error"});
    }



    // const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
    // if (taskIndex === -1){
    //     return res.status(404).jsons({error:"Task not found"});

    // }

    // tasks.splice(taskIndex,1);
    // res.status(204).send();

});

// เช็คการเชื่อมต่อฐานข้อมูล
app.get("/check-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");  // สั่งให้ฐานข้อมูลแสดงเวลาปัจจุบัน
        const result2 = await pool.query("select * from tasks");
        console.log("Database connected:", result.rows[0]); // log เวลาที่ได้จากฐานข้อมูล
        console.log("result = ", result2); // log เวลาที่ได้จากฐานข้อมูล
        res.status(200).json({ message: "Database connected successfully", time: result.rows[0] });
    } catch (err) {
        console.error("Database connection error:", err);  // log ถ้ามีข้อผิดพลาด
        res.status(500).json({ error: "Database connection failed" });
    }
});

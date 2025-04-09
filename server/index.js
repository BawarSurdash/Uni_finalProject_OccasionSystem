const express =require(('express'))

const app=express();

const db=require('./models');
const cors=require('cors');
app.use(express.json());
app.use(cors());

const postRouter=require('./routes/Posts');
app.use('/posts',postRouter);

const userRouter=require('./routes/Users');
app.use('/auth',userRouter);

// Force sync to recreate tables with new structure
db.sequelize.sync({ force: true }).then(()=>{
    console.log('Database has been resynced and tables recreated');

    app.listen(3001,()=>{
        console.log('server is running on port 3001');
    })
})



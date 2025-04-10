const express =require(('express'))

const app=express();

const db=require('./models');
const cors=require('cors');
app.use(express.json());
app.use(cors());

// Load manual associations
const setupAssociations = require('./config/associations');
setupAssociations(db);

const postRouter=require('./routes/Posts');
app.use('/posts',postRouter);

const userRouter=require('./routes/Users');
app.use('/auth',userRouter);

const bookingRouter=require('./routes/Booking');
app.use('/booking',bookingRouter);

const notificationRouter=require('./routes/notification');
app.use('/notification',notificationRouter);

// Change from force:true to alter:true to avoid destroying data
db.sequelize.sync({ alter: true }).then(()=>{
    console.log('Database has been synced');

    app.listen(3001,()=>{
        console.log('server is running on port 3001');
    })
})



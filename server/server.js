const exp=require('express')
const cors=require('cors')
const app=exp()
require('dotenv').config()
const mongoose=require('mongoose');
const studentApp = require('./API/studentApi');
const wardenApp = require('./API/wardenApi');
const port=process.env.PORT||4000;
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
mongoose.connect(process.env.DBURL)
.then(()=>app.listen(port,()=>console.log(`server listening on ${port}...`)))
.catch(err=>console.log("Error in connection ",err))

// app.use(cookieParser());
//Routes
app.use("/student-api",studentApp)
app.use("/warden-api",wardenApp)

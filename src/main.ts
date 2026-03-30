import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import roomRoutes from "./routes/room.routes";
import bookingRoutes from "./routes/booking.routes";
const app = express();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/users', bookingRoutes)




export const pool = new Pool({
    user: 'maksimdenderis',
    host: 'localhost',
    database: 'booking_system',
    password: '',
    port: 5432,
})

pool.connect((err:any, client:any, release:any) =>{
    if (err){
        return console.error("Error connecting to pool", err.stack);
    }
    console.log('Успіщне підключення до PostgreSQL');
    release();
})

app.listen (3001, ()=>{
    console.log('Server listening on port 3001');
})
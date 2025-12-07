import express, { type NextFunction, type Response, type Request } from "express";
import dotenv from "dotenv";
import io from "socket.io-client";
import axios from "axios";
import { mockProducts } from "./productsData.js";
import { seedDatabase, sequelize } from "./DB/sequelize.js";
import { searchProduct, syncTable } from "./DB/syncTableAlgo.js";
dotenv.config();
const app = express();
const port = 3000;


const apiKey = process.env.API_KEY;
const apiUrl = process.env.API_URL;
const myPhone = process.env.MY_PHONE;
const whatsAppPhoneNumberId = process.env.WHATS_APP_PHONE_NUMBER_ID
const whatsAppVerifyToken = process.env.VERIFY_TOKEN
const whatsAppKey = process.env.WHATSAPP_TOKEN
const geminiKey = process.env.GEMINI_API_KEY


const socketClient = io(apiUrl);
let socketId = "";
socketClient.on("connect", () => {
    console.log("Connected to Socket server");
});
socketClient.on("server_error", (data) => {
    console.log(data);
});



setInterval(() => {
    if(!socketClient.connected){
        console.log("trying to reconnect...");
        socketClient.connect();
    }
}, 5000);

socketClient.on("id", (data:string) => {
    socketId = data;
    socketClient.emit("temp_save", {socketId:socketId,  phoneNumber:myPhone, apiKey, whatsAppPhoneNumberId, whatsAppVerifyToken, whatsAppKey, geminiKey});
})
socketClient.on("search", async (userMsg:string) => {
    console.log("Search request received for:", userMsg);
    const products = await searchProduct('laptp'); 
    socketClient.emit("product_found", products[0]);
})
app.use(express.static('public'));
app.set("view engine", "ejs");
app.set("views", "src/views");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const isValidApiKey = async (req:Request, res:Response, next:NextFunction) => {
    try{
        const data = await axios(`${apiUrl}/test_user`, {
            method: "post",
            data: {
                key: apiKey  
            }
        })
        if(data.status == 200 || data.data.ok){
            next();
            return
        } else {
            console.log("Invalid API Key");
            res.send("UnAuthorized !!");
        }
        
    } catch (error) {
        console.log(error);
        res.send("UnAuthorized !!");
    }
}

app.use("/test", isValidApiKey, (req, res) => {
    res.send("User Authorized");
});

app.get("/", (req, res) => {
    res.render("index");
})

app.listen(port, async () => {
    await sequelize.authenticate()
    await seedDatabase();
    await syncTable("product_tests", "id", 2000);

    
    console.log(`Server is running at http://localhost:${port}`);
});


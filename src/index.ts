import express from "express";
import bodyParser from "body-parser";
import serveStatic from "serve-static";
import mongoose from "mongoose";
import Book from "./model/book.model";
//import cors from "cors"
// Instancier Express
const app=express();

// Middleware bodyParser pour parser le corps des requetes en Json
app.use(bodyParser.json())

// Middlewere pour configurer le dossier des ressources statique
app.use(serveStatic("public"));

// Activer CORS

// Connection à MongoDB
const uri:string="mongodb://localhost:27017/biblio";
mongoose.connect(uri,(error => {
    if(error){ console.log(error);}
    else {console.log("Mongo db connection success");}
}));

app.get("/",(req,resp)=>{
    resp.send("Hello Express");
});

app.get("/books",(req,resp)=>{
    Book.find((err,books)=>{
        if(err){resp.status(500).send(err);}
        else {resp.send(books);}
    });
});


app.get("/books/:id",(req,resp)=>{
    Book.findById(req.params.id,(err:any,book:any)=>{
        if(err)resp.status(500).send(err);
        else resp.send(book);
    });
});

app.post("/books",(req,resp)=>{
    let book=new Book(req.body);
    book.save(err=>{
        if(err){ resp.status(500).send(err);}
        else {resp.send(book);}
    })
});

app.put("/books/:id",(req,resp)=>{
    Book.findByIdAndUpdate(req.params.id,req.body,(err:any)=>{
        if(err) resp.status(500).send(err);
        else resp.send("Successfully updated book");
    })
});

app.delete("/books/:id",(req,resp)=>{
    Book.findByIdAndDelete(req.params.id,(err:any)=>{
        if(err) resp.status(500).send(err);
        else resp.send("Successfully deleted book");
    })
});

/* Requete HTTP GET http://localhost:8700/pbooks?page=1&size5 */
app.get("/pbooks",(req,resp)=>{
    let p:number=parseInt(String(req.query.page || 1));
    let size:number=parseInt(String(req.query.size || 5));
    Book.paginate({}, { page: p,limit: size }, function(err, result){
        if(err) resp.status(500).send(err);
        else resp.send(result);
    });
});

/* Requete HTTP GET http://localhost:8700/books-search?kw=J&page=1&size5 */
app.get("/books-search",(req,resp)=>{
    let p:number=parseInt(String(req.query.page || 1));
    let size:number=parseInt(String(req.query.size || 5));
    let keyword:string=String(req.query.kw || "");
    Book.paginate({title:{$regex:".*(?i)"+keyword+".*"}}, { page: p,limit: size }, function(err, result){
        if(err) resp.status(500).send(err);
        else resp.send(result);
    });
});


app.listen(8085,()=>{
    console.log("Server Started");
});
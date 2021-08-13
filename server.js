const express = require('express')
const jwt = require('jsonwebtoken')
const {results: agentes} = require('./data/agentes')
const fs = require('fs')
const exphdbs = require('express-handlebars')
const app = express()

//handlebars
app.set("view engine", "handlebars")
app.engine("handlebars", 
    exphdbs({
        layoutsDir: __dirname + "/views" 
    })
)

//middleware necesarios para obtener body de formularios
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.listen(3000)

//clave privada
const privateKey = fs.readFileSync("claveprivada.txt")

// *--- RUTAS ---*
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

// localhost:3000/SignIn
app.post("/SignIn", (req, res) => {
    const {email, password} = req.body
    const usuario = agentes.find(a => a.email == email && a.password == password)
    console.log(usuario)
    if (usuario){
        const token = jwt.sign({
            data: usuario.email,
            exp: Math.floor(Date.now()/1000) + 120
        }, privateKey)
        res.render("acceso",  {
            layout: "acceso",
            email, 
            token
        })
    }
    else{
        res.status(403).send("Acceso denegado")
    }
})

app.get("/expedientes", (req, res) => {
    const {token} = req.query
    jwt.verify(token, privateKey, (err, decoded) => {
        console.log(decoded)
        if (err){
            const mensajeError = err.message
            res.status(401).render("accesodenegado", {layout: "accesodenegado", mensajeError})
        }
        else{
            res.status(200).render("expediente", {layout: "expediente", correo: decoded.data})
        }
    })
})

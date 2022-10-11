const express = require('express');
const app = express();
const port = 8080;

app.get('/hello', (req, res) => {
    res.send('Hello World!')
})

app.get('/calc', (req, res) => {
    let type = req.header('Accept') == "*/*" ? "application/json" : req.header('Accept');
    if(type != "text/plain" && type != "application/json") {
        res.status(415).json({
            error: "Type de retour incompatible"
        })
    }

    let queries = req.query;
    let op = queries.operator;
    let result;
    let calc;
    let first = queries.first;
    let last = queries.last;

    switch (op) {
        case "add":
            op = "+";
        break;
    
        case "multiply":
            op = "*";
        break;

        case "sub":
            op = "-";
        break;

        case "divide":
            op = "/";
        break;
                            
        default:
            res.status(418).json({
                error: "opérateur inconnu"
            })
        break;
    }

    if(op == "/" && (first == "0" || last == "0")){
        result = "div/0";
    }else{
        calc = first + op + last;
        result = eval(calc);
    }

    if(type == "application/json"){
        res.status(200).type(type).json({
            result: result
        })
    }else{
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(String(result))
    }

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})  
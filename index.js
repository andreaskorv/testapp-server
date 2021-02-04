const express = require("express");
var fs               = require("fs");
var LINQ = require("node-linq").LINQ;
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var sha256 = require('js-sha256');
   
const app = express();
app.use(express.static(__dirname));
   
// создаем парсер для данных в формате json
const jsonParser = express.json();

/*function makeid() {
    console.log("!");
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 14; i++)
    {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }  
    return text;
  }*/
 
// настройка CORS
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   res.header("Access-Control-Allow-Methods", "GET, PATCH, PUT, POST, DELETE, OPTIONS");
   next();  // передаем обработку запроса методу app.post("/postuser"...
 });

app.post("/getcategories", jsonParser, function(request, response) {
    response.json(JSON.parse(fs.readFileSync('data/categories.json')));
});

app.post("/getorders", jsonParser, function(request, response) {
    var forResponce = new LINQ(JSON.parse(fs.readFileSync('data/Orders.json')))
    .Where(function(order) {return order.provider == request.body.provider}).ToArray();
    response.json(forResponce);
});

app.post("/getordersclient", jsonParser, function(request, response) {
    var forResponce = new LINQ(JSON.parse(fs.readFileSync('data/Orders.json')))
    .Where(function(order) {return order.provider == request.body.client}).ToArray();
    for (var i = 0; i < forResponce.length; i++)
    {
        var forProvider = new LINQ(JSON.parse(fs.readFileSync('data/Providers.json')))
        .Where(function(provider) {return forResponce[i].provider == provider.id}).ToArray()[0];
        forResponce[i].provider = forProvider;
    }
    response.json(forResponce);
});

app.post("/getsales", jsonParser, function(request, response) {
    var forResponce = new LINQ(JSON.parse(fs.readFileSync('data/Providers.json')))
    .Where(function(provider) {return provider.category == request.body.category}).
    Select(function(provider) {return { "id" : provider.id,
    "avatar": provider.avatar,
    "organization": provider.organization}}).ToArray();
    //console.log(forResponce);
    response.json(forResponce);
})

app.post("/getservices", jsonParser, function(request, response) {
    var id = request.body.id;
    var forResponce = new LINQ(JSON.parse(fs.readFileSync('data/Providers.json'))).
    Where(function(provider) { return provider.id == id}).Select(function(provider) {
        return provider.services
    }).ToArray();
    forResponce = forResponce[0];
    response.json(forResponce);
})

app.post('/removeorder', jsonParser, function(request, response) {
    var forRemove = request.body.id;
    let forDatabase = JSON.parse(fs.readFileSync('data/Orders.json'));
    for(var i=0;i<forDatabase.length;i++)
    {
        if(forDatabase[i].id == forRemove)
        {
            forDatabase.splice(i, 1);//removes one item from the given index i
            break;
        }
    }
    fs.writeFileSync('data/Orders.json', JSON.stringify(forDatabase));
    console.log(forDatabase);
    var forResponce = new LINQ(forDatabase)
    .Where(function(order) {return order.provider == request.body.provider}).ToArray();
    response.json(forResponce);
});

app.post("/addprovider", upload.single('avatar'), function(req, res){
    let rawdata = fs.readFileSync("data/Providers.json", 'utf-8');
    let database = JSON.parse(rawdata);
    let forId = database.length;
    let provider = JSON.parse(req.body.data);
    database.push({
        id : forId,
        organization : provider.organization,
        address : provider.address,
        phone : provider.phone,
        email : provider.email,
        from : provider.from,
        to : provider.to,
        password : provider.password,
        services : provider.services,
        avatar: req.file.filename
    });
    var json = JSON.stringify(database);
    fs.writeFileSync('data/Providers.json', json);/*, function(err) { 
        if (err) 
          console.log(err); 
        else { 
          console.log("File written successfully\n"); 
          console.log("The written has the following contents:"); 
          //console.log(fs.readFileSync("books.txt", "utf8")); 
        } 
    }
    );*/
    rawdata = fs.readFileSync("data/Users.json", 'utf-8');
    database = JSON.parse(rawdata);
    database.push({
        id : database.length,
        email : req.body.email,
        password : req.body.password,
        status : "provider"
    });
    json = JSON.stringify(database);
    fs.writeFileSync('data/Users.json', json);
    res.json({answer: forId});
});

app.post("/addclient", jsonParser, function(req, res) {
    console.log(req.body);
    let rawdata = fs.readFileSync("data/Clients.json", 'utf-8');
    let database = JSON.parse(rawdata);
    let forId = database.length;
    let client = req.body;
    database.push({
        id : forId,
        name: client.name,
        surname : client.surname,
        year: client.year,
        phone : client.phone,
        email : client.email,
        login : client.login,
        password : client.password
    });
    var json = JSON.stringify(database);
    fs.writeFileSync('data/Clients.json', json);
    rawdata = fs.readFileSync("data/Users.json", 'utf-8');
    database = JSON.parse(rawdata);
    database.push({
        id : database.length,
        email : req.body.email,
        password : req.body.password,
        status : "client"
    });
    json = JSON.stringify(database);
    fs.writeFileSync('data/Users.json', json);
    res.json({answer: forId});
})

app.post("/addorder", jsonParser, function(req, res){
    let rawdata = fs.readFileSync("data/Orders.json", 'utf-8');
    let database = JSON.parse(rawdata);
    let forId = database.length;
    let orders = req.body.order;
    console.log(orders);
    for (var i = 0; i < orders.length; i++)
    {
        database.push({
            id : forId++,
            datetime : orders[i].datetime,
            clientname : orders[i].clientname,
            telephonenumber : orders[i].telephonenumber,
            kindofservice : orders[i].kindofservice,
            durance : orders[i].durance,
            provider : orders[i].provider
        });
    }
    var json = JSON.stringify(database);
    fs.writeFileSync('data/Orders.json', json);
    res.json({answer: ":)"});
})

app.get("/getsaleimage", jsonParser, function(request, response) {
    response.sendFile(__dirname + "/uploads/" + request.query.avatar);
})

app.post("/login_key", jsonParser, function(request, response){
    var forReturn = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 14; i++)
    {
        forReturn += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    fs.writeFileSync("data/key.json", forReturn);
    response.json(forReturn);
})

app.post("/login", jsonParser, function(request, response){
    let rawdata = fs.readFileSync("data/Users.json", 'utf-8');
    let database = JSON.parse(rawdata);
    let key = fs.readFileSync("data/key.json", "utf-8");
    for (var i = 0; i < database.length; i++)
    {
        var forCheck = sha256(key + database[i].email + database[i].password);
        console.log(forCheck);
        if (forCheck == request.body.result)
        {
            console.log(forCheck);
            fs.writeFileSync("data/key.json", "");
            response.json({"id": database[i].id, "status": database[i].status});
            return;
        }
    }
    response.json({"id" : -1});
})
  
app.listen(3000);
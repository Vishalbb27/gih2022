const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
var mysql = require("mysql");
const { globalAgent } = require("http");
const Swal = require("sweetalert2")


const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const gpuTempeturyCommand = 'nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader'; // change it for your OS

async function getGPUTemperature() {
    try {
      const result = await execAsync(gpuTempeturyCommand);
      return result.stdout;
    } catch (error) {
      console.log('Error during getting GPU temperature');
      return 'unknown';
    }
  }

var a = getGPUTemperature().then(function(result) {
    global.tempe = result;
    console.log(global.tempe);
});



var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "6366vishalbb178198",
  database: "foodDelivery",
});

createDatabase();

function createDatabase() {
  con.connect(function (err) {
    if (err) throw err;
    console.log("Database connected");
    con.query(
      "CREATE DATABASE IF NOT EXISTS foodDelivery",
      function (err, result) {
        if (err) throw err;
        console.log("Database created");
      }
    );
    createTable();
    insertIntoTable();
  });
}

function createTable() {
  var sql =
    "CREATE TABLE IF NOT EXISTS PATIENT (P_ID INTEGER PRIMARY KEY AUTO_INCREMENT,P_NAME VARCHAR(20),P_GENDER CHAR,AGE INTEGER,P_MOBILE BIGINT NOT NULL,P_AREA VARCHAR(50),P_CITY VARCHAR(30),P_CURADDRESS VARCHAR(50))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Patient Details table created");
  });
  var sql =
    "CREATE TABLE IF NOT EXISTS DOCTOR (D_ID INTEGER PRIMARY KEY AUTO_INCREMENT, D_NAME VARCHAR(20), D_GENDER CHAR, D_AREA VARCHAR(20),D_CITY VARCHAR(20))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Restaurant table created");
  });
  var sql =
    "CREATE TABLE IF NOT EXISTS TABLETS (T_ID INTEGER PRIMARY KEY AUTO_INCREMENT,T_NAME VARCHAR(20),T_DETAILS VARCHAR(50))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Food table created");
  });
  var sql =
    "CREATE TABLE IF NOT EXISTS CLINIC (C_ID INTEGER PRIMARY KEY AUTO_INCREMENT,C_NAME VARCHAR(20),C_AREA VARCHAR(50),C_CITY VARCHAR(50),C_TABAVAILABLE VARCHAR(20))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Cart table created");
  });
}

function insertIntoTable() {
  var sql =
    "INSERT INTO CLINIC (C_NAME,C_AREA,C_CITY,C_TABAVAILABLE) VALUES ('ADARSH CLINIC','Vijayanagar','Mysore','yes')";
  con.query(sql, function (err, result) {
    if (err) throw err;
  });

  var sql =
  "INSERT INTO CLINIC (C_NAME,C_AREA,C_CITY,C_TABAVAILABLE) VALUES ('ANIRUDH CLINIC','Gokulam','Mysore','no')";
  con.query(sql, function (err, result) {
    if (err) throw err;
  });

  var sql =
  "INSERT INTO CLINIC (C_NAME,C_AREA,C_CITY,C_TABAVAILABLE) VALUES ('VATSA CLINIC','Kuvempunagar','Bengalore','yes')"
  con.query(sql, function (err, result) {
    if (err) throw err;
  });

  var sql =
  "INSERT INTO CLINIC (C_NAME,C_AREA,C_CITY,C_TABAVAILABLE) VALUES ('SWAROOP CLINIC','Jayanagar','Bengalore','yes')"
  con.query(sql, function (err, result) {
    if (err) throw err;
  });

  var sql =
  "INSERT INTO CLINIC (C_NAME,C_AREA,C_CITY,C_TABAVAILABLE) VALUES ('VIKYAT CLINIC','Basavangudi','Bengalore','no')"
  con.query(sql, function (err, result) {
    if (err) throw err;
  });
}

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/signup", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});
app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/feed", function (req, res) {
    var sql="SELECT * FROM PATIENT WHERE P_MOBILE = '" + global.phone +"'";
    con.query(sql, function (err, result) {
        if (err) throw err;
    res.render("feed", {name: result[0].P_NAME});
    });
});
app.get("/patient", function (req, res) {
    var a = getGPUTemperature().then(function(result) {
        global.tempe = result;
    });
    var sql="SELECT * FROM PATIENT WHERE P_MOBILE = '" + global.phone + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        var address = result[0].P_AREA+", "+result[0].P_CITY
        res.render("patient", {
            name: result[0].P_NAME,
            gender: result[0].P_GENDER,
            age: result[0].AGE,
            phone: result[0].P_MOBILE,
            temp: global.tempe,
            address: address,
           
        });
  });
});
app.get("/doctor", function (req, res) {
    var a = getGPUTemperature().then(function(result) {
        global.tempe = result;
        // console.log(global.tempe);
    });
  var sql = "SELECT * FROM PATIENT";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render("doctor", {
      resultArray: result,
      temp: global.tempe,
    });
  });
});
app.get("/clinic", function (req, res) {
    var sql = "SELECT * FROM CLINIC";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render("clinic", {
        resultArray: result,
    })
  });
});
app.all("/name/:p_name", function (req, res) {
    var p_name = req.params.p_name;
    var sql = "SELECT P_AREA FROM PATIENT WHERE P_NAME = '" + p_name + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        var sql = "SELECT * FROM PATIENT WHERE P_AREA = '" + result[0].P_AREA + "'";
        con.query(sql, function (err, result) {
            if (err) throw err;
            
        })
        
    });
})
app.post("/signup", function (req, res) {
  global.name = req.body.name;
  global.age = req.body.age;
  global.gender = req.body.gender;
  global.phone = req.body.phone;
  global.city = req.body.city;
  global.area = req.body.area;
  global.address = global.area + "," + global.city;
  console.log(
    global.name,
    global.age,
    global.gender,
    global.phone,
    global.city,
    global.area
  );

  var sql =
    "INSERT INTO PATIENT (P_NAME, P_GENDER, AGE, P_MOBILE, P_AREA, P_CITY) VALUES ('" +
    global.name +
    "', '" +
    global.gender +
    "','" +
    global.age +
    "','"  +
    global.phone +
    "','" +
    global.area +
    "','" +
    global.city +
    "')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Values inserted into patients details table");
    res.redirect("/login");
  });
});

app.post("/login", function (req, res) {
  global.phone = req.body.phone;
  if (global.phone == "1234") {
    res.redirect("/doctor");
  } else {
    var sql = "SELECT * FROM PATIENT WHERE P_MOBILE = '" + global.phone + "'";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      if (result.length == 0) {
        res.redirect("/signup");
      } else {
        res.redirect("/patient");
      }
    });
  }
});


//create a push notification




app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening to port 3000");
});
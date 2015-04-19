var tessel = require("tessel");
var gprs   = require("gprs-sim900").use(tessel.port["A"]);
var servo  = require("servo-pca9685").use(tessel.port["C"]);

var servoOne = {
  number: 1,
  module: servo,
  open: function(){
    console.log("servoOne.open");
    this.module.move(this.number, 1);
  },

  close: function(){
    console.log("servoOne.close");
    this.module.move(this.number, 0);
  }
}

var door = {
  status: false,
  servo: servoOne,

  open: function(){
    this.status = true;
    console.log("door.open");
    this.servo.open();
  },

  close: function(){
    console.log("door.close");
    this.servo.close();
    this.status = false;
  },
  
  isOpen: function(){
    if(this.status == true){
      return true;
    }
    else{
      return false;
    }
  },
  
  isClose: function(){
    return !this.isOpen();
  },
  
  message: function(message){
    console.log("door.message");
    if(message == "OPEN" || message == "open" || message == "Open"){
      door.open();
    }
    else{
      console.log("wrong command!");
    }
  },
};

gprs.emitMe(["+", "NORMAL POWER DOWN"]);

gprs.on("ready", function(){
  console.log("GPRS ready.");
  console.log("GPRS searching network....");
});

gprs.on("+", function(data){
  console.log("new SMS received:", data);
  var index = data.split(",")[1];
  gprs.readSMS(index, 1, 1, function(error, message){
    if(message[3] == "OK"){
      door.message(message[2]);
    }
    else{
      console.log("message not found");
    }
  });
});

gprs.on("error", function(error){
  console.log("GPRS error.");
  console.log(error);
});

servo.on("ready", function(){
  console.log("Servo Ready!");
});


function allSMS(callback){
  gprs._txrx("AT+CMGL=\"ALL\"", 20000, callback);
}

function removeAllSMS(){
  var i = 0;
  setInterval(function(){
    gprs.readSMS(i, 1, 1, function(error, message){
      console.log(error);
      console.log(message);
      i++;
    });
  },1500);
}

// Command the GPRS module via the command line
process.stdin.resume();
process.stdin.on('data', function (data) {
  data = String(data).replace(/[\r\n]*$/, '');  //  Removes the line endings
  console.log('got command', [data]);
  if(data == "open"){
    door.open();
    setTimeout(function(){
      door.close();
    },5000);
  }
  else{
    gprs._txrx(data, 10000, function(err, data) {
      console.log('\nreply:\nerr:\t', err, '\ndata:');
      data.forEach(function(d) {
        console.log('\t' + d);
      });
      console.log('');
    });
  }
});
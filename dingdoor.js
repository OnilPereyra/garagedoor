var tessel = require("tessel");
var gprs = require("gprs-sim900").use(tessel.port["A"]);

var door = {
  status: false,
  
  open: function(){
    this.status = true;
  },
  close: function(){
    this.status = false;
  },
  open_boolean: function(){
    return this.status;
  },
  close_boolean: function(){
    return !this.status
  }
};

gprs.emitMe(["+", "NORMAL POWER DOWN", "RING"]);

gprs.on("ready", function(){
  console.log("GPRS ready.");
  console.log("GPRS searching network....");
});

gprs.on("RING", function(data){
  console.log(data);
  console.log("close:", door.close_boolean());
  if(door.close_boolean()){
    door.open();
    console.log("Opening Door");
    setTimeout(function(){
      console.log("Closing Door after 5 seconds");
      open.close();
    }, 5000);
  }
  else{
    console.log("Door is Open!");
  }
});

gprs.on("+", function(data){
  console.log("new SMS received. ");
  console.log("data:", data);
});

gprs.on("error", function(error){
  console.log("GPRS error.");
  console.log(error);
});

// Command the GPRS module via the command line
process.stdin.resume();
process.stdin.on('data', function (data) {
  data = String(data).replace(/[\r\n]*$/, '');  //  Removes the line endings
  console.log('got command', [data]);
  gprs._txrx(data, 10000, function(err, data) {
    console.log('\nreply:\nerr:\t', err, '\ndata:');
    data.forEach(function(d) {
      console.log('\t' + d);
    });
    console.log('');
  });
});

function allSMS(callback){
  gprs._txrx("AT+CMGL=\"ALL\"", 20000, callback);
}
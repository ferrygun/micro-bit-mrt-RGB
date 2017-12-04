'use strict'
const BBCMicrobit = require('bbc-microbit');
const request = require('request');

const EVENT_FAMILY = 8888;
const EVENT_VALUE_ANY = 0;


function getData(callback) {
    request({
        url: 'https://sgmrtarrivaltime.herokuapp.com/webhook',
        method: "POST",
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        },
        form: {
          key: '',
          stationcode: '' //To Pasir Ris
        },
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        } else {
            callback('error');
        }
    });
}

console.log('Scanning for microbit');
BBCMicrobit.discover(function(microbit) {
    console.log('\tdiscovered microbit: id = %s, address = %s', microbit.id, microbit.address);

    microbit.on('disconnect', function() {
        console.log('\tmicrobit disconnected!');
        process.exit(0);
    });


    console.log('connecting to microbit');
    microbit.connectAndSetUp(function() {
        console.log('\tconnected to microbit');


        console.log('subscribing to event family, any event value');
        microbit.subscribeEvents(EVENT_VALUE_ANY, EVENT_FAMILY, function() {
            console.log('\tsubscribed to micro:bit events of required type');
        });


        //Off all LEDs
        microbit.writeEvent(19, 8888, function() {});
        microbit.writeEvent(23, 8888, function() {});
        microbit.writeEvent(28, 8888, function() {});
 
        let myVar = setInterval(function() {
            
            getData(function(returnValue) {
              let x = returnValue;

              if(x != 'error') {
                x = JSON.parse(returnValue).results.next_train_arr;
                //console.log(JSON.parse(returnValue).results);
                //console.log(x);
                
                if(x == 'Ar') {
                  //Red
                  microbit.writeEvent(23, 8888, function() {});
                  microbit.writeEvent(21, 8888, function() {});
                  microbit.writeEvent(18, 8888, function() {});
                }

                if(x <= 1) {
                  //Green 
                  microbit.writeEvent(19, 8888, function() {});
                  microbit.writeEvent(23, 8888, function() {});
                  microbit.writeEvent(20, 8888, function() {});
                }

                if(x >= 2) {
                  //Blue 
                  microbit.writeEvent(19, 8888, function() {});
                  microbit.writeEvent(21, 8888, function() {});
                  microbit.writeEvent(22, 8888, function() {});
                }
              }

            });  
            

        }, 3 * 1000);

    });

});

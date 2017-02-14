/*
 * This HAP device bridges BLE to defined or default mqtt broker/channel.
 */

'use strict';

var request = require('request');

var Service, Characteristic;

// should be overridden from config
var default_broker_address = 'mqtt://192.168.1.21'
var default_mqtt_channel = "/relay/4"

var mqtt = require('mqtt')
var mqttClient = null;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-4rshield", "4RelayShield", FourRelayShield);
}

class FourRelayShield {

  constructor(log, config)
  {
    this.log = log;

    var that = this;

    this.name = config['name'] || "4-Relay Switch";
    this.mqttBroker = config['mqtt_broker'];
    this.mqttChannel = config['mqtt_channel'];

    this.stateA = 0; // consider enabled by default, set -1 on failure.
    this.stateB = 0; // consider enabled by default, set -1 on failure.
    this.stateC = 0; // consider enabled by default, set -1 on failure.
    this.stateD = 0; // consider enabled by default, set -1 on failure.
    this.status = 0;

    if (!this.mqttBroker) {
      this.log.warn('Config is missing mqtt_broker, fallback to default.');        
      this.mqttBroker = default_broker_address;
      if (!this.mqttBroker.contains("mqtt://")) {
        this.mqttBroker = "mqtt://" + this.mqttBroker;
      }
    }

    if (!this.mqttChannel) {
      this.log.warn('Config is missing mqtt_channel, fallback to default.');
      this.mqttChannel = default_mqtt_channel;        
    }

    this.log("Connecting to mqtt broker: " + this.mqttBroker)
    mqttClient = mqtt.connect(this.mqttBroker)

    mqttClient.on('connect', function () {
      var subscription = that.mqttChannel + '/state'
      console.log("MQTT connected, subscribing to monitor: " + subscription )
      mqttClient.subscribe(subscription)
    })

    mqttClient.on('error', function () {
      console.log("MQTT error")
      this.status = -1
    })

    mqttClient.on('offline', function () {
      console.log("MQTT offline")
      this.status = -1
    })

    mqttClient.on('message', function (topic, message) {
      console.log("topic: " + topic.toString())
      console.log("message: " + message.toString())

      if (topic == "/relay/4/A/state") {
        if (message == "ON") {
          this.stateA = 1;
        } else {
          this.stateA = 0;
        }
        console.log("[processing] message " + message)
      }

      if (topic == "/relay/4/B/state") {
        if (message == "ON") {
          this.stateB = 1;
        } else {
          this.stateB = 0;
        }
        console.log("[processing] message " + message)
      }

      if (topic == "/relay/4/C/state") {
        if (message == "ON") {
          this.stateC = 1;
        } else {
          this.stateC = 0;
        }
        console.log("[processing] message " + message)
      }

      if (topic == "/relay/4/D/state") {
        if (message == "ON") {
          this.stateD = 1;
        } else {
          this.stateD = 0;
        }
        console.log("[processing] message " + message)
      }
    })
  }

  setPowerStateA(powerOn, callback, context) {
    console.log('setPowerState: %s', String(powerOn));
    if(context !== 'fromSetValue') {        
      if (mqttClient) { 
        this.log('publishing ON/OFF to 4R-A'); 
        if (powerOn) {                
          mqttClient.publish("/relay/4/A", "ON");
        } else {
          mqttClient.publish("/relay/4/A", "OFF");
        }              
        callback(null);
      }    
    }
  }

  getPowerStateA(callback) {
    console.log('getPowerState callback(null, '+this.stateB+')');
    callback(null, this.stateA);    
  }

  setPowerStateB(powerOn, callback, context) {
    console.log('setPowerState: %s', String(powerOn));
    if(context !== 'fromSetValue') {        
      if (mqttClient) { 
        this.log('publishing ON/OFF to 4R-B'); 
        if (powerOn) {                
          mqttClient.publish("/relay/4/B", "ON");
        } else {
          mqttClient.publish("/relay/4/B", "OFF");
        }              
        callback(null);
      }    
    }
  }

  getPowerStateB(callback) {
    console.log('getPowerState callback(null, '+this.stateB+')');
    callback(null, this.stateB);    
  }

  setPowerStateC(powerOn, callback, context) {
    console.log('setPowerState: %s', String(powerOn));
    if(context !== 'fromSetValue') {        
      if (mqttClient) { 
        this.log('publishing ON/OFF to 4R-C'); 
        if (powerOn) {                
          mqttClient.publish("/relay/4/C", "ON");
        } else {
          mqttClient.publish("/relay/4/C", "OFF");
        }              
        callback(null);
      }    
    }
  }

  getPowerStateC(callback) {
    console.log('getPowerState callback(null, '+this.stateC+')');
    callback(null, this.stateC);    
  }

  setPowerStateD(powerOn, callback, context) {
    console.log('setPowerState: %s', String(powerOn));
    if(context !== 'fromSetValue') {        
      if (mqttClient) { 
        this.log('publishing ON/OFF to 4R-D'); 
        if (powerOn) {                
          mqttClient.publish("/relay/4/D", "ON");
        } else {
          mqttClient.publish("/relay/4/D", "OFF");
        }              
        callback(null);
      }    
    }
  }

  getPowerStateD(callback) {
    console.log('getPowerState callback(null, '+this.stateD+')');
    callback(null, this.stateD);    
  }

  getServices() {

    var lightbulbService = new Service.Lightbulb(this.name, "master");
    var lightbulbServiceB = new Service.Lightbulb(this.name+"B", "B");

    var informationService = new Service.AccessoryInformation();

    informationService
    .setCharacteristic(Characteristic.Manufacturer, "Page 42")
    .setCharacteristic(Characteristic.Model, "4-Relay Shield")
    .setCharacteristic(Characteristic.SerialNumber, "1");    

    lightbulbService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getPowerStateA.bind(this))
    .on('set', this.setPowerStateA.bind(this));

  /*
    lightbulbServiceB
    .getCharacteristic(Characteristic.On)
    .on('get', this.getPowerStateB.bind(this))
    .on('set', this.setPowerStateB.bind(this));

    lightbulbServiceC
    .getCharacteristic(Characteristic.On)
    .on('get', this.getPowerStateC.bind(this))
    .on('set', this.setPowerStateC.bind(this));
    lightbulbServiceC.subtype = "C";

    lightbulbServiceD
    .getCharacteristic(Characteristic.On)
    .on('get', this.getPowerStateD.bind(this))
    .on('set', this.setPowerStateD.bind(this));
    lightbulbServiceD.subtype = "D";
    */

    return [lightbulbService, informationService];
  }
}
/*
 * This HAP device connects to defined or default mqtt broker/channel and responds to brightness.
 */

 var request = require('request');

 var Service, Characteristic;

// should be overridden from config
var default_broker_address = 'mqtt://localhost'
var default_mqtt_channel = "/relay/4"

var mqtt = require('mqtt')
var mqttClient = null;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-4rshield", "4RelayShield", TwoRelayShield);
}

function TwoRelayShield(log, config) {
  this.log = log;

  this.name = config['name'] || "Relay Switch";
  this.mqttBroker = config['mqtt_broker'];
  this.mqttChannel = config['mqtt_channel'];

    this.stateA = 0; // consider enabled by default, set -1 on failure.
    this.stateB = 0; // consider enabled by default, set -1 on failure.
    this.stateC = 0; // consider enabled by default, set -1 on failure.
    this.stateD = 0; // consider enabled by default, set -1 on failure.

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

    init_mqtt(this.mqttBroker, this.mqttChannel);
    init_mqtt(this.mqttBroker, "/relay/A/state");
    init_mqtt(this.mqttBroker, "/relay/B/state");
    init_mqtt(this.mqttBroker, "/relay/C/state");
    init_mqtt(this.mqttBroker, "/relay/D/state");
  }

  function init_mqtt(broker_address, channel) {
    console.log("Connecting to mqtt broker: " + broker_address)
    mqttClient = mqtt.connect(broker_address)

    var that = this

    mqttClient.on('connect', function () {
      var subscription = channel + '/state'
      console.log("MQTT connected, subscribing to monitor: " + subscription )
      mqttClient.subscribe(subscription)
    })

    mqttClient.on('error', function () {
      console.log("MQTT error")
      this.brightness = -1
    })

    mqttClient.on('offline', function () {
      console.log("MQTT offline")
      this.brightness = -1
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

  TwoRelayShield.prototype.setPowerState = function(powerOn, callback, context) {
    console.log('setPowerState: %s', String(powerOn));
    if(context !== 'fromSetValue') {        
      if (mqttClient) { 
        this.log('publishing ON/OFF to: %s', this.mqttChannel); 
        if (powerOn) {                
          mqttClient.publish(this.mqttChannel, "ON");
        } else {
          mqttClient.publish(this.mqttChannel, "OFF");
        }              
        callback(null);
      }    
    }
  }

  TwoRelayShield.prototype.getPowerState = function(callback) {
    console.log('getPowerState callback(null, '+this.brightness+')');
    var status = 0
    if (this.brightness > 0) {
      callback(null, 1);
    } else {
      callback(null, 0);
    }
  }

  TwoRelayShield.prototype.getServices = function() {

    var lightbulbService = new Service.Lightbulb(this.name);
    var informationService = new Service.AccessoryInformation();

    informationService
    .setCharacteristic(Characteristic.Manufacturer, "Page 42")
    .setCharacteristic(Characteristic.Model, "4-Relay Shield")
    .setCharacteristic(Characteristic.SerialNumber, "1");

    lightbulbService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getPowerState.bind(this))
    .on('set', this.setPowerState.bind(this));

    return [lightbulbService, informationService];
  }
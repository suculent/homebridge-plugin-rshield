dofile("config.lua")

mqttBroker = mqtt_broker 
mqttUser = "none"
mqttPass = "none"
mqttChannelA = "/relay/4/A"
mqttChannelB = "/relay/4/B"
mqttChannelC = "/relay/4/C"
mqttChannelD = "/relay/4/D"
mqttChannelState = "/relay/4/state"
 
deviceID=node.chipid()
 
wifi.setmode(wifi.STATION)
wifi.sta.config (wifi_ssid, wifi_password)
 
-- Pin connections
mqttLed = 4 -- On-board LED
relayPinA = 2 -- D2
relayPinB = 3 -- D3
-- (D4 is the LED)
relayPinC = 5 -- D5
relayPinD = 6 -- D6

gpio.mode(relayPinA, gpio.OUTPUT)
gpio.mode(relayPinB, gpio.OUTPUT)
gpio.mode(relayPinC, gpio.OUTPUT)
gpio.mode(relayPinD, gpio.OUTPUT)
gpio.mode(mqttLed, gpio.OUTPUT)

gpio.write(relayPinA, gpio.HIGH) 
gpio.write(relayPinB, gpio.HIGH) 
gpio.write(relayPinC, gpio.HIGH) 
gpio.write(relayPinD, gpio.HIGH) 
gpio.write(mqttLed, gpio.LOW)
  
m = mqtt.Client("4RelayShield-" .. deviceID, 180, mqttUser, mqttPass)
m:lwt("/lwt", "4RelayShield " .. deviceID, 0, 0)
m:on("offline", function(con)
    ip = wifi.sta.getip()
    print ("MQTT reconnecting to " .. mqttBroker .. " from " .. ip)
    tmr.alarm(1, 10000, 0, function()
        node.restart();
    end)
end)
 
-- Update status to MQTT
function mqtt_update()
    
    if (gpio.read(relayPinA) == 0) then
        m:publish(mqttChannelA .. "/state","OFF",0,0)
    else
        m:publish(mqttChannelA .. "/state","ON",0,0)
    end
    
    if (gpio.read(relayPinB) == 0) then
        m:publish(mqttChannelB .. "/state","OFF",0,0)
    else
        m:publish(mqttChannelB .. "/state","ON",0,0)
    end

    if (gpio.read(relayPinC) == 0) then
        m:publish(mqttChannelC .. "/state","OFF",0,0)
    else
        m:publish(mqttChannelC .. "/state","ON",0,0)
    end

    if (gpio.read(relayPinD) == 0) then
        m:publish(mqttChannelD .. "/state","OFF",0,0)
    else
        m:publish(mqttChannelD .. "/state","ON",0,0)
    end
end
  
-- On publish message receive event
m:on("message", function(conn, topic, data)
    pwm.stop(mqttLed)
    print("Recieved:" .. topic .. ":" .. data)   
    if (topic==mqttChannelA) then
        if (data=="ON") then
            print("Enabling Output")
            gpio.write(relayPinA, gpio.LOW)
        elseif (data=="OFF") then
            print("Disabling Output")                 
            gpio.write(relayPinA, gpio.HIGH)
        else
            print("Invalid command (" .. data .. ")")
        end
    end
    if (topic==mqttChannelB) then
        if (data=="ON") then
            print("Enabling Output")
            gpio.write(relayPinB, gpio.LOW)
        elseif (data=="OFF") then
            print("Disabling Output")                 
            gpio.write(relayPinB, gpio.HIGH)
        else
            print("Invalid command (" .. data .. ")")
        end
    end
    if (topic==mqttChannelC) then
        if (data=="ON") then
            print("Enabling Output")
            gpio.write(relayPinC, gpio.LOW)
        elseif (data=="OFF") then
            print("Disabling Output")                 
            gpio.write(relayPinC, gpio.HIGH)
        else
            print("Invalid command (" .. data .. ")")
        end
    end
    if (topic==mqttChannelD) then
        if (data=="ON") then
            print("Enabling Output")
            gpio.write(relayPinD, gpio.LOW)
        elseif (data=="OFF") then
            print("Disabling Output")                 
            gpio.write(relayPinD, gpio.HIGH)
        else
            print("Invalid command (" .. data .. ")")
        end
    end
    mqtt_update()
end)
 
-- Subscribe to MQTT
function mqtt_sub(channel)
    print("MQTT subscribing to " .. channel)
    m:subscribe(channel,0, function(conn)
        pwm.setup(mqttLed, 1, 512)
        pwm.start(mqttLed)
    end)    
end

tmr.alarm(0, 1000, 1, function()
    if wifi.sta.status() == 5 and wifi.sta.getip() ~= nil then  
        tmr.stop(0)
        m:connect(mqttBroker, 1883, 0, function(conn)
            gpio.write(mqttLed, gpio.LOW)
            print("MQTT connected to:" .. mqttBroker)
            mqtt_sub(mqttChannelA)
            tmr.delay(5)
            mqtt_sub(mqttChannelB)            
            tmr.delay(5)
            mqtt_sub(mqttChannelC)            
            tmr.delay(5)
            mqtt_sub(mqttChannelD)
            tmr.delay(5)
        end)
    end
end)
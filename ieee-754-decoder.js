
var adeunis_decoder = {
    SENSORS: [
        {
            name: 'temperature',
            displayName: 'Temperature',
            value: undefined,
            unit: 'C'
        },
        {
            name: 'density',
            displayName: 'Density',
            value: undefined,
            unit: 'kg/m3'
        },
        {
            name: 'gauge-pressure',
            displayName: 'Gauge pressure',
            value: undefined,
            unit: 'bar'
        },
        {
            name: 'abs-pressure',
            displayName: 'Absolute pressure',
            value: undefined,
            unit: 'kPa'
        }
    ],
    // This function takes as input a hexidecimal number as a string and outputs the float representation 
    hexStringToByteArray: function(hexString) {
        // http://www.java2s.com/example/nodejs/string/convert-hex-string-to-byte-array.html
        if (hexString.length % 2 !== 0) {
            throw "Must have an even number of hex digits to convert to bytes";
        }
        var numBytes = hexString.length / 2;
        var byteArray = new Uint8Array(numBytes);
        for (var i=0; i<numBytes; i++) {
            byteArray[i] = parseInt(hexString.substr(i*2, 2), 16);
        }
        return byteArray.reverse();
    },
    bytesToFloat: function (bytes){
        // https://pretagteam.com/question/encoding-and-decoding-ieee-754-floats-in-javascript
        var buffer = new ArrayBuffer(bytes.length);
        // The Uint8Array uses the buffer as its memory.
        // This way we can store data byte by byte
        var byteArray = new Uint8Array(buffer);
        for (var i = 0; i < bytes.length; i++) {
           byteArray[i] = bytes[i];
        }
        
        // float array uses the same buffer as memory location
        var floatArray = new Float32Array(buffer);
        
        // floatValue is a "number", because a number in javascript is a
        // double (IEEE-754 @ 64bit) => it can hold f32 values
        return floatArray[0];
    },
    bytesToHexString: function(bytes){
        return Array.from(bytes, function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    },
    decode: function(input){
        msg = this.bytesToHexString(input)
        result = {}
        for (var i=0;i<this.SENSORS.length;i++){
            start_index = 4 + (i * 8)
            end_index = 12 + (i * 8)
            input_unflipped = msg.substring(start_index,end_index)
            first = input_unflipped.slice(0,4)
            second = input_unflipped.slice(4)
            flipped = second + first
            decoded_sensor_value = this.bytesToFloat(this.hexStringToByteArray(flipped))
            
            sensor = this.SENSORS[i]
            result[sensor.name] = {
                displayName: sensor.displayName,
                value: decoded_sensor_value,
                unit: sensor.unit
            }
        }
        return result;
    },
};

function Decoder(bytes, port){
    return adeunis_decoder.decode(bytes)
}

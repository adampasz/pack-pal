var util = require('util');
var exec = require('child_process').exec;
var sh = require('./command_queue').init().enqueue;
var self = this;

exports.init = function(onReady, launchMethod, target, debug, descriptor, airsdk, iosSim, useASCSH) {
    self.MXMLC = (useASCSH ? 'ascshd mxmlc' : airsdk + '/bin/mxmlc') + ' +AIR_HOME=' + airsdk;
    self.launchMethod = launchMethod;
    self.target = target;
    self.debug = debug;
    self.airsdk = airsdk;
    self.descriptor = descriptor;
    self.iosSim = '-platformsdk ' + iosSim;
    fetchNetworkIP(console.error, onReady);
    return this;
}

exports.compile = function(args) {
    echo("COMPILING...");
    var cmd = self.MXMLC + ' ' + args + (self.debug ? ' -debug=true' : ' -debug=false -omit-trace-statements=true -verbose-stacktraces=false');
    sh(cmd);
}

exports.launch = function(payload, appID) {
    echo("LAUNCHING...");
    if (self.target == "android") {
        if (self.launchMethod == "simulator") {
            console.error("Android Simulator not currently supported!");
        } else {
            sh(getADTPath() + " -uninstallApp -platform android -appid " + appID);
            sh(getADTPath() + " -installApp -platform android -package " + payload + ".apk");
            sh(getADTPath() + " -launchApp -platform android -appid " + appID + " > /dev/null &");
        }
    } else if (self.target == "ios") {
        var cmd = getADTPath() + " -uninstallApp -platform ios -appid " + appID;
        if (self.launchMethod == "simulator") {
            cmd += getIOSSimArgs();
        }
        sh(cmd);

        cmd = getADTPath() + " -installApp -platform ios -package " + payload + ".ipa";
        if (self.launchMethod == "simulator") {
            cmd += getIOSSimArgs();
        }
        sh(cmd);

        if (self.launchMethod == "simulator") {
            sh(getADTPath() + " -launchApp -platform ios -appid " + appID + " " + getIOSSimArgs());
        } else {
            echo("Install complete and app. is ready to launch manually. (Note: ios does not support auto-launch).");
        }
    } else if (self.launchMethod == "simulator") {
        sh(self.airsdk + "/bin/adl -profile extendedMobileDevice -screensize '768x1004:768x1024' '" + self.descriptor + "' root-directory '.'" + " > /dev/null &");
    } else {
        echo("Launch not specified.");
    }
}

exports.package = function(password, cert, profile, payload, appID, swf) {
    echo("PACKAGING");
    if (self.target) {
        var args = [];
        if (self.target == "android") {
            args = args.concat(['-target', self.debug ? 'apk-debug' : 'apk-captive-runtime']);
        } else if (self.target == "ios") {
            if (self.launchMethod == "simulator") {
                args = args.concat(['-target', self.debug ? 'ipa-debug-interpreter-simulator' : 'ipa-test-interpreter-simulator']);
            } else {
                args = args.concat(['-target', self.debug ? 'ipa-debug-interpreter' : 'ipa-ad-hoc']);
            }
            if (self.debug) {
                args = args.concat(['-connect', self.networkIP]);
            }
            if (self.target == "ios") {
                args = args.concat(['-hideAneLibSymbols', self.launchMethod == "simulator" ? 'no' : 'yes']);
                args = args.concat(['-provisioning-profile', profile]);
            }
            args = args.concat(['-keystore', cert]);
            args = args.concat(['-storetype', 'pkcs12']);
            args = args.concat(['-storepass', password]);
        }

        var cmd = "'" + getADTPath() + "' '-package' " + args.join(" ");
        cmd += " '" + payload + (self.target == "ios" ? ".ipa" : ".apk") + "' " + self.descriptor + " " + swf;
        if (self.launchMethod == "simulator") {
            cmd += ' ' + self.iosSim;
        }
        sh(cmd);
    } else {
        echo("Nothing to package. Target not specified.");
    }
}

/////////////
// PRIVATE
/////////////
var getADTPath = function() {
    return self.airsdk + "/bin/adt"
}

var getIOSSimArgs = function() {
    return ' ' + self.iosSim + ' -device ios-simulator';
}


// local IP address of build machine -- used for remote debugging on device
// Not sure why there's no obvious way to do this directly node. :P
var fetchNetworkIP = function(error, callback) {
    if (!self.networkIP) {
        var cmd = 'python -c \"exec(\'import socket\\nprint socket.gethostbyname(socket.gethostname())\')"'
        exec(cmd, function(error, stdout, stderr) {
            self.networkIP = stdout.replace(/(\r\n|\n|\r)/gm, ""); //remove newline
            console.log("Network IP=" + self.networkIP);
            callback(stdout);
        });
    } else {
        callback(self.networkIP);
    }
}

var echo = function(msg) {
    sh('echo "' + msg + '"');
}

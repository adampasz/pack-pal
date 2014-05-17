#!/usr/bin/env node
 //parse args
var nopt = require("nopt"),
    knownOpts = {
        "debug": Boolean,
        "experimental": Boolean,
        "target": ["ios", "android"],
        "launch": ["simulator", "device"],
        "resolution": String,
        "config": String,
    }, shortHands = {
        "i": ["--target", "ios"],
        "a": ["--target", "android"],
        "s": ["--launch", "simulator"],
        "x": ["--experimental"],
        "c": ["--config"],
    }, options = nopt(knownOpts, shortHands, process.argv, 2);
console.log(options);
if (!options.hasOwnProperty('config')) {
	options.config = 'pack.json'
}

//load json configuration for this task
var fs = require('fs'),
    data = fs.readFileSync(options.config);

var config = JSON.parse(data.toString());
//init packager

var air = require('./air_packager.js')
    .init(onBuilderReady, options.launch, options.target, options.debug, config.descriptor_path, config.air_sdk_path, config.ios_sim_path, options.experimental);

function onBuilderReady() {
    var payload = config.build_path + config.executable_name;
    air.compile(config.compiler_args + ' -output ' + payload + '.swf');
    var cert = options.target == "ios" ? config.ios_certificate_path : config.android_certificate_path;
    var profile = config.profile_path;
    var pass = config.certificate_password;
    air.package(pass, cert, profile, payload, config.app_id, payload + '.swf');
    air.launch(payload, config.app_id);
    //TODO: some properties could be parsed from the descriptor file...
}

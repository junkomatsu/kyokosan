// Constructor

var spawn = require('child_process').spawn
  , exec = require('child_process').exec
  , request = require('request')
  , EventEmitter = require('events').EventEmitter;

var voicelist = {
  'sv' : 'Oskar', // sweden
  'es' : 'Monica', // espanol
  'sk' : 'Laura', // slobakia
  'th' : 'Narisa', // thai
  'de' : 'Anna', // duiche
  'hu' : 'Eszter', // hangary
  'hi' : 'Lekha', // hindi
  'fi' : 'Mikko', // finland
  'fr' : 'Audrey', // france
  'pl' : 'Agata', // poland
  'pt' : 'Joana', // portogal
  'ro' : 'Simona', // romania
  'zh-cn' : 'Ting-Ting', // china
  'ko' : 'Yuna', // korea
  'id' : 'Damayanti', // indonesia
  'el' : 'Melina', // greek
  'it' : 'Paolo', // italian
  'nl' : 'Xander', // holand
  'ar' : 'Maged', // arabic
  'zh-tw' : 'Ya-Ling', // taiwan
  'ja' : 'Kyoko', // japanese
  'en' : 'Alex', // english
};

var SpeachProcessor = function() {
  this.queue = [];
  this.stopWhenEmptyQueue = false;
  process.nextTick(this.processSay.bind(this));
  this.voice = 'kyoko';
}

SpeachProcessor.prototype = new EventEmitter();

SpeachProcessor.prototype.enqueue = function(message) {
  this.queue.push(message)
};

SpeachProcessor.prototype.processSay = function() {
  var self = this;
  var tweet = this.queue.shift();
  if (tweet && tweet.text) {
    var message = tweet.text;
    console.log('--------------------------------');
    console.log('process:' + message);

    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
    message = message.replace(exp, '');
    message = message.replace(/ #\w+/gi, ' ');
    message = message.replace(/@\w+/gi, ' ');
    message = message.replace(/〜/g, 'ー');

    console.log('normalized:' + message);


    var lang = undefined;
    var detect = spawn('./detect.sh', [message]);
    detect.stdout.on('data', function (result) {
      if (!lang) {
        lang = result.toString('utf-8').split(':')[0];
      }
    });
    detect.on('exit', function (code) {
      console.log('lang detected = ' + lang);
      var voice = voicelist['en'];
      if (voicelist[lang]) { voice = voicelist[lang]; }

      tweet.lang = lang;
      self.emit('speach',tweet);

      var bell = exec('afplay bell.aiff', function() {

        var say = spawn('say', ['-v', voice, message]);
        say.on('exit', function (code) {
          console.log('finish say');
          process.nextTick(self.processSay.bind(self));
        });
      });
    });
  } else {
    if (!this.stopWhenEmptyQueue) {
      process.nextTick(self.processSay.bind(self));
    }
  }
}

SpeachProcessor.prototype.stopWhenEmptyQueue = function(value) {
  this.stopWhenEmptyQueue = value;
}

module.exports = SpeachProcessor;


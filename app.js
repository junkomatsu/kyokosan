
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , spawn = require('child_process').spawn
  , SpeachProcessor = require('./lib/SpeachProcessor');

process.on('uncaughtException', function(err) {
  console.log(err, err.stack);
});

var app = express();
var server = http.createServer(app);

var twitter = require('ntwitter');
var io = require('socket.io').listen(server);

var twitter = new twitter({
  consumer_key: '*****',
  consumer_secret: '*****',
  access_token_key: '*****',
  access_token_secret: '*****',
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){

  var keyword = '';
  if (req.query.keyword) {
    keyword = req.query.keyword;
  }

  var method = 'statuses/sample';
  var params = undefined;
  if (keyword) { 
    method = 'statuses/filter';
    params = {'track':keyword};
  }

  var processor = new SpeachProcessor();
  processor.on('speach', function(data) {
    console.log('on speach:' + data);
    io.sockets.emit('message', data);
  });

  twitter.stream(method, params, function(stream) {
    stream.on('data', function(data) {
      processor.enqueue(data);
    });
    stream.on('end', function(response) {
      console.log('on end:' + response);
    });
    stream.on('destroy', function(response) {
      console.log('on destroy:' + response);
    });
    stream.on('error', function(response) {
      console.log('on error:' + response);
    });
  });

  res.render('index', {
    title: 'Twitter Stream Speaching - kyokosan',
    keyword: keyword
  });

});

io.sockets.on('connection', function(socket) {
  console.log('socket.io connected');
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

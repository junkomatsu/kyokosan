var SpeachProcessor = require('../lib/SpeachProcessor.js');

describe('SpeachProcessor', function() {
  var processor = new SpeachProcessor();
  var speach = false;
  var tweet;

  it('is enqueued japanese text tweet', function() {
    this.speach = undefined;
    runs(function() { 
      processor.enqueue({'text' : 'こんにちは、世界!'}); 
    });
    var that = this;
    processor.on('speach', function(speach) {
      console.log('speach:' + speach);
      that.speach = speach;
    });

    waitsFor(function() {
      return this.speach !== undefined;
    }, 'emitted speach', 10000);

    runs(function() {
      expect(this.speach.lang).toEqual('ja');
    });
  });


  it('is enqueued and not to throw', function() {
    expect(function() { processor.enqueue({'text' : 'hello, world!'}); }).not.toThrow();
  });



});

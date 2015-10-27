//得到边和点的信息，同时按天按form-to划分数据
var lineReader = require('line-reader'),
    eventproxy = require('eventproxy'),
    Promise = require('bluebird');
    fs = require('fs');

var nodeMap = new Map();
var edgeMap = new Map();
var fileCount = 7;
var ep = new eventproxy();
var eachLine = Promise.promisify(lineReader.eachLine);

ep.after('got_file', fileCount, function(){
  var nodeslist = [];
  nodeMap.forEach(function(value, key, map) {
    var id = value;
    var label = key;
    nodeslist.push(
      {"id": id, "label": label}
    );
  });
  fs.writeFile('api/nodes.json', JSON.stringify(nodeslist), function(err){
    if(err) throw err;
    console.log('nodes success');
  });

  var edgeslist = [];
  edgeMap.forEach(function(value, key, map) {
    var from = parseInt(value['from'].slice(2, 4));
    var to = parseInt(value['to'].slice(2, 4));
    edgeslist.push(
      {"from": from, "to": to, "arrows": "to"}
    )
  });
  fs.writeFile('api/edges.json', JSON.stringify(edgeslist), function(err){
    if(err) throw err;
    console.log('edges success');
  });
})

for(var i = 1; i <= fileCount; i++){
  (function(i) {
    eachLine('initialData/flow090' + i + '.txt', function(line) {
      var from = line.split(",")[1].toString();
      var to = line.split(",")[0].toString();

      var pointData = '[' + line.slice(from.length + to.length + 2, line.length) + ']';
      var path = 'api/data/' + i + '/' + from + to + '.json';
      fs.writeFile(path, pointData, function(err){
        if(err) throw err;
      });

      if(!nodeMap.has(from)){
        nodeMap.set(from, parseInt(from.slice(2, 4)));
      }
      if(!nodeMap.has(to)){
        nodeMap.set(to, parseInt(to.slice(2, 4)));
      }

      if(!edgeMap.has(from + to)){
        edgeMap.set(from + to, {from: from, to: to});
      }
    }).then(function() {
      ep.emit('got_file');
    }).catch(function(err) {
      console.error(err);
    });
  }(i));
}

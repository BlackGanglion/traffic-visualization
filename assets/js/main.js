var readJson = function(file){
  var content;
  $.ajaxSettings.async = false;
  $.getJSON(file, function(data){
    content = data;
  });
  return content;
};

//创建节点
var nodeList = readJson('api/nodes.json');
var nodes = new vis.DataSet(nodeList);

//创建边
var edgeList = readJson('api/edges.json');
var edges = new vis.DataSet(edgeList);

//以边的uuid作为键名，边的两个节点作为键值，建立map
var edgesMap = new Map();
edges.forEach(function(data) {
  var id = data.id;
  var from = data.from;
  var to = data.to;
  edgesMap.set(id, {from: from, to: to});
});

//创建网络图
var container = $('#mynetwork')[0];
var data = {
  nodes: nodes,
  edges: edges
};

var options = {};
var network = new vis.Network(container, data, options);

var showModel = function (from, to) {
  $('.modal-title').text('The analyse of tl'
      + from + ' To tl' + to);
  for(var i = 1; i <= 7; i++){
    $('#' + i).on("click", function(){
      var id = $(this).attr('id');
      getDataAndRender(id, from, to);
    })
  }
};

network.on("click", function(params) {
  if(params.edges.length == 1 && params.nodes.length == 0){
    var uuid = params.edges[0];
    var from = edgesMap.get(uuid)['from'];
    var to = edgesMap.get(uuid)['to'];

    showModel(from, to);

    $('#myModal').modal('show');
  }
});

var getDataAndRender = function(day, from, to) {
  $.getJSON('api/data/' + day + '/tl' + from + 'tl' + to + '.json', function(content) {

    var series = [];
    series.push({
      type: 'area',
      turboThreshold: 0,
      name: '车流量',
      pointInterval: 30 * 1000,
      pointStart: Date.UTC(2014, 9, day, 6, 0, 0),
      data: content
    });

    $('#showtable').highcharts({
      chart: {
        zoomType: 'x',
        spacingRight: 20
      },
      title: {
        text: 'The analyse of tl' + from + ' To tl' + to
      },
      subtitle: {
        text: 'tl' + from + '红绿灯到tl' + to + '红绿灯的车流量可视化 (第 ' + day +' 天) '
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          minute: '%H : %M'
        },
        title: {
          text: '6:00 ~ 20:00 / 30s'
        }
      },
      yAxis: {
        title: {
          text: '当前车流量'
        }
      },
      tooltip: {
        shared: true
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
          },
          lineWidth: 1,
          marker: {
            enabled: false
          },
          shadow: false,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          threshold: null
        }
      },
      series: series,
      credits: {
        enabled:false
      }
    });
  });
}

var w=900,
    h=530,
    margin={
      top:0,
      right:30,
      bottom:0,
      left:30
    },
    width=w-margin.left-margin.right,
    height=h-margin.top-margin.bottom;
var svg=d3.select("body")
.append("svg")
.attr({
  id:"chart",
  width:width,
  height:height
}),
    chart=svg.append("g")
.attr({transform:"translate("+margin.left+","+margin.top+")"});
var links = [
  {source: "Microsoft", target: "Amazon", type: "licensing"},
  {source: "Microsoft", target: "HTC", type: "licensing"},
  {source: "Samsung", target: "Apple", type: "suit"},
  {source: "Motorola", target: "Apple", type: "suit"},
  {source: "Nokia", target: "Apple", type: "resolved"},
  {source: "HTC", target: "Apple", type: "suit"},
  {source: "Kodak", target: "Apple", type: "suit"},
  {source: "Microsoft", target: "Barnes & Noble", type: "suit"},
  {source: "Microsoft", target: "Foxconn", type: "suit"},
  {source: "Oracle", target: "Google", type: "suit"},
  {source: "Apple", target: "HTC", type: "suit"},
  {source: "Microsoft", target: "Inventec", type: "suit"},
  {source: "Samsung", target: "Kodak", type: "resolved"},
  {source: "LG", target: "Kodak", type: "resolved"},
  {source: "RIM", target: "Kodak", type: "suit"},
  {source: "Sony", target: "LG", type: "suit"},
  {source: "Kodak", target: "LG", type: "resolved"},
  {source: "Apple", target: "Nokia", type: "resolved"},
  {source: "Qualcomm", target: "Nokia", type: "resolved"},
  {source: "Apple", target: "Motorola", type: "suit"},
  {source: "Microsoft", target: "Motorola", type: "suit"},
  {source: "Motorola", target: "Microsoft", type: "suit"},
  {source: "Huawei", target: "ZTE", type: "suit"},
  {source: "Ericsson", target: "ZTE", type: "suit"},
  {source: "Kodak", target: "Samsung", type: "resolved"},
  {source: "Apple", target: "Samsung", type: "suit"},
  {source: "Kodak", target: "RIM", type: "suit"},
  {source: "Nokia", target: "Qualcomm", type: "suit"}
];
var nodes={};
links.forEach(function(link){
  link.source=nodes[link.source] || (nodes[link.source]={name:link.source});
  link.target=nodes[link.target] || (nodes[link.target]={name:link.target});
});
var type=[];
links.filter(function(item){
  if(!type.includes(item.type)){
    type.push(item.type);
  }
});
/* function to generate random colors for links*/
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}/*End of function*/

var strokes={}/*Object to store links.type as key and color as value*/

for(var i=0;i<type.length;i++){
  strokes[type[i]]=getRandomColor();
}

var force=d3.layout.force()
.size([width,height])
.nodes(d3.values(nodes))
.links(links)
.linkDistance(60)
.gravity(0.1)
.charge(-300)
.on("tick",tick)
.start();
chart.append("defs").selectAll("marker")
  .data(type)
  .enter()
  .append("marker")
  .attr({
  id:function(d){return d;},
  viewBox:"0 -5 10 10",
  refX:15,
  refY:-1.5,
  markerWidth:5,
  markerHeight:5,
  orient:"auto",
  fill:"#404040"
})
  .append("path")
  .attr("d","M0,-5L10,0L0,5")
  .style("fill",function(d){
  for(var key in strokes){
    if(d==key){
      return strokes[key];
    }
  }
});
var  path=chart.append("g")
.selectAll("path")
.data(force.links())
.enter()
.append("path")
.attr("class",function(d){
  return "link "+ d.type;
})
.style("stroke",function(d){
  for(var key in strokes){
    if(key==d.type){
      return strokes[d.type];
    }
  }
})
.attr("marker-end",function(d){
  return "url(#"+d.type+")"; 
});
var node=chart.append("g").selectAll(".node")
.data(d3.values(nodes))
.enter()
.append("circle")
.classed("node",true)
.attr({r:6});
//enter()
var text=chart.append("g")
.selectAll(".label")
.data(force.nodes())
.enter()
.append("text")
.classed("label",true)
//update()
text.attr("x", 13)
  .attr("y", ".31em")
  .text(function(d){
  return d.name;
});
//exit()
text.data(force.nodes())
  .exit()
  .remove()
//legends
chart.selectAll(".legend")
  .data(type)
  .enter()
  .append("circle")
  .classed("legend",true);
chart.selectAll(".legend-label")
  .data(type)
  .enter()
  .append("text")
  .classed("legend-label",true);
var legend=chart.selectAll(".legend")
.attr({
  cx:width-144,
  cy:function(d,i){
    return (height-100)+i*30;
  },
  r:6,
  fill:function(d,i){
    for(var key in strokes){
      if(d==key){
        return strokes[d];
      }
    }
  }
});
var legend_label=chart.selectAll(".legend-label")
.attr({
  x:width-130,
  y:function(d,i){
    return (height-95)+i*30;
  }
})
.text(function(d){
  return d;
});
chart.selectAll(".legend-label")
  .data(type)
  .exit()
  .remove();

function tick(e){
  node.attr({
    "transform":function(d){
      return "translate("+d.x+","+d.y+")";
    }
  })
    .call(force.drag());
  text.attr({
    "transform":function(d){
      return "translate("+d.x+","+d.y+")";
    }
  });
  path.attr("d",function(d){
    var dx=d.target.x-d.source.x;
    var dy=d.target.y-d.source.y;
    var dr=Math.sqrt(dx*dx+dy*dy);

    return "M"+
      d.source.x + ',' +
      d.source.y + " A " +
      dr + "," + dr + " 0 0,1" +//space before 0 is very important
      d.target.x + ","+
      d.target.y;
  });
}
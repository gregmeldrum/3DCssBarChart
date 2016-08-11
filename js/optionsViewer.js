// Add the mouse movement handlers
var $body = $('body');

function processOptionsData(optData, calls) {
  var chartWidth = 165;
  var chartDepth = 140;
  var chartMaxHeight = 127;
  var numExpiry = optData.length;
  var numStrikes = optData[0].strikePrices.length;

  var barWidth = closestIntegerDivisibleByTwo(chartWidth / numStrikes);
  var barDepth = closestIntegerDivisibleByTwo(chartDepth / numExpiry);
  //var heightMultiplier = getBarHeightMultiplier(optData, calls, chartMaxHeight);
                
  // Position and size the base
  var screenWidth = $(".container").width();
  var screenHeight = $(".container").height();
  var leftOffset = (screenWidth - chartWidth) / 2;
  var topOffset = (screenHeight - chartDepth) / 2;
  $(".container").css({'top': 0,
                       'left': 0});
  $(".scene").css({'width': screenWidth, 
                  'height': screenHeight});

  $(".base").css({'top': topOffset,
                  'left': leftOffset,
                  'width': chartWidth, 
                  'height': chartDepth});
  
  var barChart3d = new BarChart(topOffset, leftOffset, barWidth, barDepth,
                  optData, calls,  $('#scene'), chartMaxHeight);
  barChart3d.render();
}

function closestIntegerDivisibleByTwo(input) {
  return Math.round(input / 2) * 2;
}

$body.on('mousedown', function (evt) {
  var initX = evt.screenX;
  var initY = evt.screenY;
  $body.on('mousemove', function handler(evt) {
    // drag
    var moveX = initX - evt.screenX;
    var moveY = initY - evt.screenY;
    var zRot = moveX / 3;
    var xRot = moveY / 2;
    position.update(zRot, xRot);
  });
  $body.on('mouseup', function handler(evt) {
    $body.off('mousemove');
    position.resetRotation();
  });
});



$(document).ready(function () {
  // Do the initial rendering
  position.update(0, 0);
})

processOptionsData(optionsData, true);


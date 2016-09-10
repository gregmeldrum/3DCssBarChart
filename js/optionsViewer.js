function processOptionsData(optData, calls) {

  // Convert the options data into the format the
  // BarChart3d object is expecting
  //{
  //  xlabels: [],
  //  ylabels: [],
  //  data[x][y] = zValue
  //}

  function normalizeData(optionsData) {
    var barChartData = {
      xLabels: [],
      yLabels: [],
      data: []
    };

    // Convert the options data into a normalized form
    optionsData.forEach(function (expirationData, expIdx) {
      expirationData.strikePrices.forEach(function (strikePriceData, strikeIdx) {

        // Set the x labels
        if (expIdx == 0) {
          barChartData.xLabels.push(strikePriceData.strikePrice);
          barChartData.data[strikeIdx] = [];
        }

        // Set the y labels and create 2nd dimension of data array
        if (strikeIdx == 0) {
          barChartData.yLabels.push(expirationData.expiry);
        }

        // Set the z value depending if its a put or a call
        barChartData.data[strikeIdx][expIdx] = (calls ? strikePriceData.data.callLastTrade : strikePriceData.data.putLastTrade)
      })
    })
    return barChartData;
  }

  //console.log(barChartData);


  // Set the height, width and depth of the graph
  var chartWidth = 165;
  var chartDepth = 140;
  var chartMaxHeight = 127;

  // Figure out the dimensions of the graph
  var numExpiry = optData.length;
  var numStrikes = optData[0].strikePrices.length;

  var barWidth = closestIntegerDivisibleByTwo(chartWidth / numStrikes);
  var barDepth = closestIntegerDivisibleByTwo(chartDepth / numExpiry);

  // Position and size the base
  var screenWidth = $(".container").width();
  var screenHeight = $(".container").height();
  var leftOffset = (screenWidth - chartWidth) / 2;
  var topOffset = (screenHeight - chartDepth) / 2;
  $(".container").css({
    'top': 0,
    'left': 0
  });
  $(".scene").css({
    'width': screenWidth,
    'height': screenHeight
  });

  $(".base").css({
    'top': topOffset,
    'left': leftOffset,
    'width': chartWidth,
    'height': chartDepth
  });

  var barChartData = normalizeData(optData);

  var barChart3d = new BarChart(topOffset, leftOffset, barWidth, barDepth,
    barChartData, $('#scene'), chartMaxHeight);
  barChart3d.render();
}

function closestIntegerDivisibleByTwo(input) {
  return Math.round(input / 2) * 2;
}


// Add the mouse movement handlers
var $container = $('.container');


$container.on('mousedown touchstart', function (evt) {
  var initX = 0;
  var initY = 0;
  var mousePos = getMousePosition(evt);
  initX = mousePos.xPos;
  initY = mousePos.yPos;
  $container.on('mousemove touchmove', function handler(evt) {
    // drag
    var mousePos = getMousePosition(evt);
    var moveX = initX - mousePos.xPos;
    var moveY = initY - mousePos.yPos;
    var zRot = moveX / 3;
    var xRot = moveY / 2;
    position.update(zRot, xRot);
  });
  $container.on('mouseup touchend', function handler(evt) {
    $container.off('mousemove touchmove');
    position.resetRotation();
  });
});

// Get the current mouse position
// Check for mouse and touch coordinates
function getMousePosition(evt) {
  var event = evt;
  if (evt.type == 'touchstart' || evt.type == 'touchmove') {
    event = evt.originalEvent.touches[0];
    evt.preventDefault();
  }
  return {
    xPos: event.pageX,
    yPos: event.pageY
  }
}

$(document).ready(function () {
  // Do the initial rendering
  position.update(0, 0);
})

processOptionsData(optionsData, true /*call data*/);


var optionBarChart = (function (calls) {

  var chartWidth = 165;
  var chartDepth = 140;
  var chartMaxHeight = 127;
  var useCallData = calls;
  var barChart3d;
  var optionsData;

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
          var dateString = (new Date(expirationData.expiry)).toString();
          // Just pull out the Month, Day, Year
          var truncatedString = dateString.split(' ').slice(1, 4).join(' ');
          barChartData.yLabels.push(truncatedString);
        }

        // Set the z value depending if its a put or a call
        barChartData.data[strikeIdx][expIdx] = (useCallData ? strikePriceData.data.callLastTrade : strikePriceData.data.putLastTrade)
      })
    })
    return barChartData;
  }

  function render(optData) {
    // Store the options data
    optionsData = optData;

    // Set the height, width and depth of the graph
    var barChartData = normalizeData(optionsData);
    barChart3d = new BarChart3D(chartWidth, chartDepth, chartMaxHeight, barChartData, transformationManager);
  }

  function toggleCallPut() {
    useCallData = !useCallData;

    var barChartData = normalizeData(optionsData);
    barChart3d.rerender(barChartData);
  }

  return {
    render: render,
    toggleCallPut: toggleCallPut
  }
})(true);

//
// Starting point
//
optionBarChart.render(optionsData);

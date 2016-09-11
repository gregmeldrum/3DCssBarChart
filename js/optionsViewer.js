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
          var dateString = (new Date(expirationData.expiry)).toString();
          // Just pull out the Month, Day, Year
          var truncatedString = dateString.split(' ').slice(1, 4).join(' ');
          barChartData.yLabels.push(truncatedString);
        }

        // Set the z value depending if its a put or a call
        barChartData.data[strikeIdx][expIdx] = (calls ? strikePriceData.data.callLastTrade : strikePriceData.data.putLastTrade)
      })
    })
    return barChartData;
  }


  // Set the height, width and depth of the graph
  var chartWidth = 165;
  var chartDepth = 140;
  var chartMaxHeight = 127;
  var barChartData = normalizeData(optData);
  var barChart3d = new BarChart3D(chartWidth, chartDepth, chartMaxHeight, barChartData, transformationManager);
}

//
// Starting point
//
processOptionsData(optionsData, true /*call data*/);


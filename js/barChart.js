/**
 * TODO: make barchart generic instead of tangling it with the options data
 */

function BarChart(topOffset, leftOffset, barWidth, barDepth,
                  optData, calls, parentElement, chartMaxHeight) {
  this.topOffset = topOffset;
  this.leftOffset = leftOffset;
  this.barWidth = barWidth;
  this.barDepth = barDepth;
  this.calls = calls;
  this.parentElement = parentElement;
  this.chartMaxHeight = chartMaxHeight;
  
  /*
   * Get the minimum and maximum price data. This can be used to scale
   * the z axis of the graph
   */
  this.getDataMinMax = function getDataMinMax(optData, calls, chartMaxHeight) {
    // Loop over expiry date
    var minPrice = 9999;
    var maxPrice = 0;
    for (var expiryIdx = 0; expiryIdx < optData.length; expiryIdx++) {
      var expirationData = optData[expiryIdx];
      for (var strikePriceIdx = 0; strikePriceIdx < expirationData.strikePrices.length; strikePriceIdx++) {
        var priceData = expirationData.strikePrices[strikePriceIdx];
        if (calls) {
          minPrice = Math.min(minPrice, priceData.data.callLastTrade);
          maxPrice = Math.max(maxPrice, priceData.data.callLastTrade);
        } else {
          minPrice = Math.min(minPrice, priceData.data.putLastTrade);
          maxPrice = Math.max(maxPrice, priceData.data.putLastTrade);
        }
      }
    }
    return {
      minPrice: minPrice,
      maxPrice: maxPrice
    };
  };
 

  this.dataMinMax = this.getDataMinMax(optData, calls, chartMaxHeight);

  // For now, Assume we start at 0 instead of priceMin
  // TODO: Use the min price to set the min z axis
  this.heightMultiplier = this.chartMaxHeight / this.dataMinMax.maxPrice;

  // Create the color gradient
  var gradient = new Gradient('3A837E', '5A3A83');

  // Create the dom elements that make up the 3D Bar Chart
  this.render = function () {
    for (var expiryIdx = 0; expiryIdx < optData.length; expiryIdx++) {
      var expirationData = optData[optData.length - expiryIdx - 1];
      for (var strikePriceIdx = 0; strikePriceIdx < expirationData.strikePrices.length; strikePriceIdx++) {
        var priceData = expirationData.strikePrices[strikePriceIdx];
        this.drawBar(expiryIdx, strikePriceIdx, priceData);
      }
    }

    this.drawStrikePriceLabel();   
    this.drawExpirationPriceLabel();
    this.drawZPlanes();   
  }

  /*
   * Draw the labels for the 3 axis
   */
  this.drawExpirationPriceLabel = function () {
    for (var expiryIdx = 0; expiryIdx < optData.length; expiryIdx++) {
      var expirationData = optData[optData.length - expiryIdx - 1];
      //console.log(expirationData);
      var expDate = new Date(expirationData.expiry);
      var dateComponents = expDate.toString().split(' ');
      var labelOffset = leftOffset + expirationData.strikePrices.length * this.barWidth  - (this.barWidth / 2);
      var textTranslation = expiryIdx * barDepth;

      var yLabel1 = this.drawLabel('label', topOffset, labelOffset,
                        'rotateX(-90deg) translateZ(' + (textTranslation + 10) + 'px) translateY(4px) rotateY(90deg)',
                        dateComponents[1]);
      var yLabel2 = this.drawLabel('label', topOffset, labelOffset,
                        'rotateX(-90deg) translateZ(' + (textTranslation + 10) + 'px) translateY(17px) rotateY(90deg)',
                        dateComponents[2]);
      var yLabel3 = this.drawLabel('label', topOffset, labelOffset,
                        'rotateX(-90deg) translateZ(' + (textTranslation + 10) + 'px) translateY(30px) rotateY(90deg)',
                        dateComponents[3]);
      parentElement.append(yLabel1);
      parentElement.append(yLabel2);
      parentElement.append(yLabel3);
    }
  }

  this.drawStrikePriceLabel = function () {
    for (var strikeIdx = 0; strikeIdx < optData[0].strikePrices.length; strikeIdx++) {
      var strikePrice = optData[0].strikePrices[strikeIdx].strikePrice;
      //console.log(strikePrice);
      var barLeftOffset = leftOffset + (strikeIdx * barWidth);
      var textTranslation = optData.length * barDepth;
      var xLabel = this.drawLabel('label', topOffset, barLeftOffset,
                   'rotateX(-90deg) translateZ(' + textTranslation + 'px) translateY(4px)',
                   strikePrice);
      parentElement.append(xLabel);
    }
  }

  this.drawZPlanes = function() {
     var numOfZAxisPlanes = 4;
     var zAxisPlaneScale = this.getZAxisScale(numOfZAxisPlanes);
     console.log("zAxisPlaneScale %", zAxisPlaneScale);
     for (var planeIdx = 0; planeIdx <= numOfZAxisPlanes; planeIdx++) {
         var width = optData[0].strikePrices.length * this.barWidth;
         var depth = optData.length * this.barDepth;
         var plane = this.drawZAxisPlane(this.topOffset, this.leftOffset,  width, depth,
                             'translateZ(' + zAxisPlaneScale * planeIdx * this.heightMultiplier + 'px)');
         var value1 = this.drawLabel('label', this.topOffset, this.leftOffset,
                             'translateZ(' + (zAxisPlaneScale * planeIdx * this.heightMultiplier + 5) + 'px) rotateX(-90deg) translateX(-30px)',
                             zAxisPlaneScale * planeIdx);
        //var value2 = this.drawLabel('label', this.topOffset, this.leftOffset,
        //                     'translateZ(' + (zAxisPlaneScale * planeIdx * this.heightMultiplier + 5) + 'px) rotateX(-90deg) translateX(' +
        //                     width + 'px)',
        //                     zAxisPlaneScale * planeIdx);
        this.parentElement.append(plane);
        this.parentElement.append(value1);
        //this.parentElement.append(value2);
     }
  };

  this.getZAxisScale = function(numOfZAxisPlanes) {
     // Assume range starts at 0
     var range = this.dataMinMax.maxPrice - 0;
     var steps = [10, 5, 2.5, 2, 1, 0.5, 0.25, 0.1, 0.05, 0.025];

     var roughSteps = range / numOfZAxisPlanes;

     var diff = 9999;
     for (var idx = 0; idx < steps.length; idx++) {
       var currentDiff = Math.abs(steps[idx] - roughSteps);
        console.log("roughSteps %s steps[idx] %s currentDiff %s diff %s", roughSteps, steps[idx], currentDiff, diff);
      if (currentDiff > diff) {
         // We've found the closest step unit
         return steps[idx - 1];
       } else {
         diff = currentDiff;
       }
     }
  }


  this.drawBar = function drawBar(expiryIdx, strikePriceIdx, priceData) {
    var price = ((calls) ? priceData.data.callLastTrade : priceData.data.putLastTrade);
    var height = Math.ceil(this.heightMultiplier * price);
    var color = gradient.getColor(height / this.chartMaxHeight);

    var idString = expiryIdx + strikePriceIdx;
    var barTopOffset = topOffset + (expiryIdx * barDepth);
    var barLeftOffset = leftOffset + (strikePriceIdx * barWidth);

    var backFace = this.drawBarFace('back' + idString,
      barTopOffset, barLeftOffset, barWidth, height, 'rotateX(90deg)', gradient.darken(color, .5));
    var frontFace = this.drawBarFace('front' + idString,
      barTopOffset + barDepth, barLeftOffset, barWidth, height, 'rotateX(90deg)',
      gradient.darken(color, 0.0));
    var topFace = this.drawBarFace('top' + idString,
      barTopOffset, barLeftOffset, barWidth, barDepth, 'translateZ(' + (height) + 'px)',
      gradient.darken(color, -0.1));
    var leftFace = this.drawBarFace('left' + idString,
      barTopOffset + barDepth / 2,
      barLeftOffset - barDepth / 2, 
      barDepth, height, 'rotateX(90deg) rotateY(90deg)',
      gradient.darken(color, 0.1));
    var rightFace = this.drawBarFace('right' + idString,
      barTopOffset + barDepth / 2,
      barLeftOffset + barWidth - barDepth / 2, 
      barDepth, height, 'rotateX(90deg) rotateY(90deg)',
      gradient.darken(color, 0.2));

    // Add the faces to the DOM
    parentElement.append(backFace);
    parentElement.append(frontFace);
    parentElement.append(leftFace);
    parentElement.append(rightFace);
    parentElement.append(topFace);
  }

  // TODO: Combine these methods into one
  this.drawBarFace = function drawBarFace(id, top, left, width, height, transform, color) {
    return $('<figure></figure>').attr('id', id)
      .addClass('post')
      .css({
        'top': top,
        'left': left,
        'width': width,
        'height': height,
        'transform': transform,
        '-webkit-transform': transform,
        '-ms-transform': transform,
        'background-color': '#' + color
      });
  };

  this.drawZAxisPlane = function drawZAxisPlane(top, left, width, height, transform) {
    return $('<table></table>')
      .addClass('plane')
      .css({
        'top': top,
        'left': left,
        'width': width,
        'height': height,
        '-webkit-transform': transform,
        '-ms-transform': transform,
        'transform': transform
      });
  };

  this.drawLabel = function drawLabel(labelClass, top, left, transform, text) {
    return $('<div></div>')
      //.attr('id', id)
      .addClass(labelClass)
      .css({
        'top': top,
        'left': left,
        '-webkit-transform': transform,
        '-ms-transform': transform,
        'transform': transform,
      })
      .text(text);
  };
};

function Gradient(startColor, endColor) {
  this.startColor = startColor;
  this.endColor = endColor;

  this.toHex = function (x) {
    x = x.toString(16);
    return (x.length == 1) ? '0' + x : x;
  };

  this.getColor = function (ratio) {
    var r = Math.ceil(parseInt(this.startColor.substring(0, 2), 16) * ratio
      + parseInt(this.endColor.substring(0, 2), 16) * (1 - ratio));
    var g = Math.ceil(parseInt(this.startColor.substring(2, 4), 16) * ratio
      + parseInt(this.endColor.substring(2, 4), 16) * (1 - ratio));
    var b = Math.ceil(parseInt(this.startColor.substring(4, 6), 16) * ratio
      + parseInt(this.endColor.substring(4, 6), 16) * (1 - ratio));

    return this.toHex(r) + this.toHex(g) + this.toHex(b);
  }

  this.darken = function(origColor, darkenFactor) {
    var darkMult = 1 - darkenFactor;
    var r = Math.ceil(parseInt(origColor.substring(0, 2), 16) * darkMult);
    var g = Math.ceil(parseInt(origColor.substring(2, 4), 16) * darkMult);
    var b = Math.ceil(parseInt(origColor.substring(4, 6), 16) * darkMult);

    return this.toHex(r) + this.toHex(g) + this.toHex(b);
  }
};

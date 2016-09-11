// BarChart3d object is expecting data in the format
//{
//  xlabels: [],
//  ylabels: [],
//  data[x][y] = zValue
//}

function BarChart3D(chartWidth, chartDepth, chartMaxHeight, data, sceneRotationManager) {

  var that = this;

  this.init = function (chartWidth, chartDepth, chartMaxHeight, data) {
    this.chartMaxHeight = chartMaxHeight;
    this.data = data;

    // Initialize the dom
    this.initializeDom();
    // Resize and reposition
    this.calculateChartDimensions(chartWidth, chartDepth);
    // Bind the mouse handler to manage the rotation
    this.bindMouseHandler(sceneRotationManager);

    this.dataMinMax = this.getDataMinMax(this.data, this.chartMaxHeight);

    // For now, Assume we start at 0 instead of priceMin
    // TODO: Use the min price to set the min z axis
    this.heightMultiplier = this.chartMaxHeight / this.dataMinMax.maxPrice;
  }

  // Initialize the DOM for the BarChart
  //    Create a holder div called scene
  //    Also, create the base figure that
  //    goes at the bottom of the chart
  this.initializeDom = function () {
    this.container = $(".barChartContainer");
    this.container.css({
      'top': 0,
      'left': 0
    });

    this.scene = $('<div></div>')
      .addClass("scene")
      .attr('id', 'scene');

    this.baseFigure = $('<figure></figure>')
      .addClass("base");
    this.container.append(this.scene);
    this.scene.append(this.baseFigure);
  }

  // Calculate the dimensions of the chart
  //   and set up the dom
  this.calculateChartDimensions = function (chartWidth, chartDepth) {

    var numYAxisPoints = data.yLabels.length;
    var numXAxisPoints = data.xLabels.length;
    var screenWidth = this.container.width();
    var screenHeight = this.container.height();

    // Define inline helper function
    function closestIntegerDivisibleByTwo(input) {
      return Math.round(input / 2) * 2;
    }

    this.barWidth = closestIntegerDivisibleByTwo(chartWidth / numXAxisPoints);
    this.barDepth = closestIntegerDivisibleByTwo(chartDepth / numYAxisPoints);
    this.leftOffset = (screenWidth - chartWidth) / 2;
    this.topOffset = (screenHeight - chartDepth) / 2;

    this.scene.css(
      {
        'width': screenWidth,
        'height': screenHeight
      }
    );

    this.baseFigure.css(
      {
        'top': this.topOffset,
        'left': this.leftOffset,
        'width': chartWidth,
        'height': chartDepth
      }
    );

  }


  //
  // Get the minimum and maximum data values. This can be used to scale
  // the z axis of the graph
  //
  this.getDataMinMax = function (data, chartMaxHeight) {
    var minPrice = 9999;
    var maxPrice = 0;

    data.data.forEach(function (yArray, xIdx) {
      yArray.forEach(function (zValue, yIdx) {
        minPrice = Math.min(minPrice, zValue);
        maxPrice = Math.max(maxPrice, zValue);
      })
    })
    return {
      minPrice: minPrice,
      maxPrice: maxPrice
    };
  };

  // Main render function
  // Draw the bars and labels
  this.render = function () {
    this.gradient = new Gradient('3A837E', '5A3A83');

    data.data.forEach(function (yArray, xIdx) {
      yArray.forEach(function (zValue, yIdx) {

        that.drawBar(xIdx, yArray.length - yIdx - 1, zValue);
      })
    });

    this.drawXLabel();
    this.drawYLabel();
    this.drawZPlanes();
  }

  //
  // Draw the labels for the y Axis
  // 
  this.drawYLabel = function () {
    data.yLabels.forEach(function (yLabel, yIdx) {
      var labels = yLabel.split(' ');
      var labelOffset = that.leftOffset + (data.xLabels.length * that.barWidth) - (that.barWidth / 2);
      var textTranslation = (data.yLabels.length - yIdx - 1) * that.barDepth + 10;

      labels.forEach(function (subLabel, subLabelIdx) {
        var yOffset = 4 + subLabelIdx * 13;
        var yLabel = that.drawLabel('label', that.topOffset, labelOffset,
          'rotateX(-90deg) translateZ(' + textTranslation + 'px) translateY(' + yOffset + 'px) rotateY(90deg)',
          subLabel);
        that.scene.append(yLabel);
      });
    });
  }

  //
  // Draw the X axis labels
  //
  this.drawXLabel = function () {
    data.xLabels.forEach(function (xLabelValue, xIdx) {
      //console.log(xLabelValue);
      var barLeftOffset = that.leftOffset + (xIdx * that.barWidth);
      var textTranslation = data.yLabels.length * that.barDepth;
      var xLabel = that.drawLabel('label', that.topOffset, barLeftOffset,
        'rotateX(-90deg) translateZ(' + textTranslation + 'px) translateY(4px)',
        xLabelValue);

      // Add the labels to the dom  
      that.scene.append(xLabel);
    });
  }

  //
  // Draw the planes in the Z axis
  //
  this.drawZPlanes = function () {
    var numOfZAxisPlanes = 4;
    var zAxisPlaneScale = this.getZAxisScale(numOfZAxisPlanes);
    console.log("zAxisPlaneScale %", zAxisPlaneScale);
    for (var planeIdx = 0; planeIdx <= numOfZAxisPlanes; planeIdx++) {
      var width = data.xLabels.length * this.barWidth;
      var depth = data.yLabels.length * this.barDepth;
      var plane = this.drawZAxisPlane(this.topOffset, this.leftOffset, width, depth,
        'translateZ(' + zAxisPlaneScale * planeIdx * this.heightMultiplier + 'px)');
      var value1 = this.drawLabel('label', this.topOffset, this.leftOffset,
        'translateZ(' + (zAxisPlaneScale * planeIdx * this.heightMultiplier + 5) + 'px) rotateX(-90deg) translateX(-30px)',
        zAxisPlaneScale * planeIdx);
      //var value2 = this.drawLabel('label', this.topOffset, this.leftOffset,
      //                     'translateZ(' + (zAxisPlaneScale * planeIdx * this.heightMultiplier + 5) + 'px) rotateX(-90deg) translateX(' +
      //                     width + 'px)',
      //                     zAxisPlaneScale * planeIdx);
      this.scene.append(plane);
      this.scene.append(value1);
      //this.scene.append(value2);
    }
  };

  // Determine the scale of the Z axis
  this.getZAxisScale = function (numOfZAxisPlanes) {
    // Assume range starts at 0
    var range = this.dataMinMax.maxPrice - 0;
    var steps = [10, 5, 2.5, 2, 1, 0.5, 0.25, 0.1, 0.05, 0.025];

    var roughSteps = range / numOfZAxisPlanes;

    var diff = 9999;
    for (var idx = 0; idx < steps.length; idx++) {
      var currentDiff = Math.abs(steps[idx] - roughSteps);
      //console.log("roughSteps %s steps[idx] %s currentDiff %s diff %s", roughSteps, steps[idx], currentDiff, diff);
      if (currentDiff > diff) {
        // We've found the closest step unit
        return steps[idx - 1];
      } else {
        diff = currentDiff;
      }
    }
  }

  // Draw the bar (all 5 faces)
  this.drawBar = function drawBar(xIdx, yIdx, zValue) {
    var height = Math.ceil(this.heightMultiplier * zValue);
    var color = this.gradient.getColor(height / this.chartMaxHeight);

    var idString = yIdx + xIdx;
    var barTopOffset = this.topOffset + (yIdx * this.barDepth);
    var barLeftOffset = this.leftOffset + (xIdx * this.barWidth);

    var backFace = this.drawBarFace('back' + idString,
      barTopOffset, barLeftOffset, this.barWidth, height, 'rotateX(90deg)', this.gradient.darken(color, .5));
    var frontFace = this.drawBarFace('front' + idString,
      barTopOffset + this.barDepth, barLeftOffset, this.barWidth, height, 'rotateX(90deg)',
      this.gradient.darken(color, 0.0));
    var topFace = this.drawBarFace('top' + idString,
      barTopOffset, barLeftOffset, this.barWidth, this.barDepth, 'translateZ(' + (height) + 'px)',
      this.gradient.darken(color, -0.1));
    var leftFace = this.drawBarFace('left' + idString,
      barTopOffset + this.barDepth / 2,
      barLeftOffset - this.barDepth / 2,
      this.barDepth, height, 'rotateX(90deg) rotateY(90deg)',
      this.gradient.darken(color, 0.1));
    var rightFace = this.drawBarFace('right' + idString,
      barTopOffset + this.barDepth / 2,
      barLeftOffset + this.barWidth - this.barDepth / 2,
      this.barDepth, height, 'rotateX(90deg) rotateY(90deg)',
      this.gradient.darken(color, 0.2));

    // Add the faces to the DOM
    this.scene.append(backFace);
    this.scene.append(frontFace);
    this.scene.append(leftFace);
    this.scene.append(rightFace);
    this.scene.append(topFace);
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

  this.bindMouseHandler = function(sceneRotationManager) {
    // Set the initial position
    sceneRotationManager.update(0, 0);

    // Save the container in a var for the closure.
    var container = this.container;

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

    container.on('mousedown touchstart', function (evt) {
      var initX = 0;
      var initY = 0;
      var mousePos = getMousePosition(evt);
      initX = mousePos.xPos;
      initY = mousePos.yPos;
      container.on('mousemove touchmove', function handler(evt) {
        // drag
        var mousePos = getMousePosition(evt);
        var moveX = initX - mousePos.xPos;
        var moveY = initY - mousePos.yPos;
        var zRot = moveX / 3;
        var xRot = moveY / 2;
        sceneRotationManager.update(zRot, xRot);
      });
      container.on('mouseup touchend', function handler(evt) {
        container.off('mousemove touchmove');
        sceneRotationManager.resetRotation();
      });
    });
  }

  // Initialize the barchart object
  this.init(chartWidth, chartDepth, chartMaxHeight, data);
  // Render the barchart
  this.render();
};


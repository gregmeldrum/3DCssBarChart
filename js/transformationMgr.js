/*
 * Create an object to manage the transformation (rotation)
 * of the dom subtree
 */
var transformationManager = (function () {
  var prevZRot = 0;
  var prevXRot = 0;

  // Set the initial rotation along the Z and X axis
  var zRot = 35;
  var xRot = 65;

  // Update the rotation with the new values
  function update(newZRot, newXRot) {
    // Manage the Z axis rotation
    zRotDelta = newZRot - prevZRot;
    zRot = zRot += zRotDelta;
    prevZRot = newZRot;

    //Manage the X axis rotation
    xRotDelta = newXRot - prevXRot;
    xRot = xRot += xRotDelta;
    prevXRot = newXRot;

    render();
  };

  function render() {
    renderBlock("scene", zRot, xRot);
  }

  // Apply a transformation to a class
  function renderBlock(theClass, rotationZ, rotationX) {
    var transform = 'rotateX( ' + rotationX + 'deg) rotateZ(' + rotationZ + 'deg)';
    $('.' + theClass).css({
      transform: transform
    });
  }

  // Reset the previous rotation values to 0
  function resetRotation() {
    prevZRot = 0;
    prevXRot = 0;
  }

  // Return the public methods
  return {
    update: update,
    resetRotation: resetRotation
  };
})();

/*
 * Create an object to manage the translation (rotation)
 * of the dom subtree
 */
var position = (function () {
  var prevZRot = 0;
  var prevXRot = 0;

  var zRot = 35;
  var xRot = 65;

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

  function renderBlock(theClass, rotationZ, rotationX) {
    var transform = 'rotateX( ' + rotationX + 'deg) rotateZ(' + rotationZ + 'deg)';
    //console.log(transform);
    $('.' + theClass).css({
      transform: transform
    });
  }

  function resetRotation() {
    prevZRot = 0;
    prevXRot = 0;
  }

  return {
    update: update,
    resetRotation: resetRotation
  };
})();

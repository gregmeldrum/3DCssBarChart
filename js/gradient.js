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

  this.darken = function (origColor, darkenFactor) {
    var darkMult = 1 - darkenFactor;
    var r = Math.ceil(parseInt(origColor.substring(0, 2), 16) * darkMult);
    var g = Math.ceil(parseInt(origColor.substring(2, 4), 16) * darkMult);
    var b = Math.ceil(parseInt(origColor.substring(4, 6), 16) * darkMult);

    return this.toHex(r) + this.toHex(g) + this.toHex(b);
  }
};

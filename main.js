define(['lines'], function(lines) {
  var Line = lines.Line;

  function getClickCoords(e, clickElem) {
    /* Get the coordinates for a click on canvas, or null if invalid */
    var offset = {
      x : 0,
      y : 0
    };

    var el = clickElem;
    do {
      offset.x += el.offsetLeft - el.scrollLeft;
      offset.y += el.offsetTop - el.scrollTop;
      // Do not do body, because chrome adds scroll to body but FF does not
    } while ((el = el.offsetParent) && (el !== document.body))

    var x = e.pageX - offset.x;
    var y = e.pageY - offset.y;

    // Account for the border
    var canvasStyle = getComputedStyle(clickElem);
    x -= canvasStyle.getPropertyValue('border-left-width').replace(/px$/, '');
    y -= canvasStyle.getPropertyValue('border-top-width').replace(/px$/, '');
    // Invalid click handling
    if (y < 0 || y > clickElem.height || x < 0 || x > clickElem.width) {
      return null;
    }
    return { x : x, y : y };
  }

  function Intersections(options) {
    this._canvas = document.getElementById(options.canvas);

    this._ctx = this._canvas.getContext('2d');
    this._canvas.addEventListener('click', this.onClick.bind(this));

    // List of lines we have drawn so far
    this._lines = [];
    this._lineStart = null;

    this._lineOptions = {
      draw : true,
      canvas : this._canvas,
    };
  }

  Intersections.prototype.onClick = function (e) {
    var coords = getClickCoords(e, this._canvas);
    // Invalid click
    if (!coords) return;

    if (!this._lineStart) {
      this._lineStart = coords;
    }
    else {
      var newLine = new Line(this._lineStart, coords, this._lineOptions);
      this._lineStart = null;
      this._lines.push(newLine);
      this.findNewIntersections()
    }
  };

  Intersections.prototype.findNewIntersections = function() {
    /* Find the intersections of the last line with any previous line */
    var lastIdx = this._lines.length - 2;
    var newLine = this._lines[lastIdx + 1];

    var ctx = this._ctx;

    for (var i = 0; i <= lastIdx; ++i) {
      var pt = lines.intersect(newLine, this._lines[i]);
      if (!pt) continue;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'red';
      ctx.fill();
    }
  };

  new Intersections({ canvas: 'lineCanvas' });
});

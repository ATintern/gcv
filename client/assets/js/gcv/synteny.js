'use strict'

/** The Genomic Context Viewer namespace. */
var GCV = GCV || {};

/** The macro-synteny viewer. */
GCV.Synteny = class {

  // Private

  // Constants
  _BLOCK_HEIGHT = 11;
  _PAD          = 2;
  _PTR_LEN      = 5;
  _FADE         = 0.15;
  _COLORS       = [  // 100 maximally distinct colors
    '#7A2719', '#5CE33C', '#E146E9', '#64C6DE', '#E8B031', '#322755', '#436521',
    '#DE8EBA', '#5C77E3', '#CEE197', '#E32C76', '#E54229', '#2F2418', '#E1A782',
    '#788483', '#68E8B2', '#9E2B85', '#E4E42A', '#D5D9D5', '#76404F', '#589BDB',
    '#E276DE', '#92C535', '#DE6459', '#E07529', '#A060E4', '#895997', '#7ED177',
    '#916D46', '#5BB0A4', '#365167', '#A4AE89', '#ACA630', '#38568F', '#D2B8E2',
    '#AF7B23', '#81A158', '#9E2F55', '#57E7E1', '#D8BD70', '#316F4B', '#5989A8',
    '#D17686', '#213F2C', '#A6808E', '#358937', '#504CA1', '#AA7CDD', '#393E0D',
    '#B02828', '#5EB381', '#47B033', '#DF3EAA', '#4E191E', '#9445AC', '#7A691F',
    '#382135', '#709628', '#EF6FB0', '#603719', '#6B5A57', '#A44A1C', '#ABC6E2',
    '#9883B0', '#A6E1D3', '#357975', '#DC3A56', '#561238', '#E1C5AB', '#8B8ED9',
    '#D897DF', '#61E575', '#E19B55', '#1F303A', '#A09258', '#B94781', '#A4E937',
    '#EAABBB', '#6E617D', '#B1A9AF', '#B16844', '#61307A', '#ED8B80', '#BB60A6',
    '#E15A7F', '#615C37', '#7C2363', '#D240C2', '#9A5854', '#643F64', '#8C2A36',
    '#698463', '#BAE367', '#E0DE51', '#BF8C7E', '#C8E6B6', '#A6577B', '#484A3A',
    '#D4DE7C', '#CD3488'
  ];

	_getElementCoords(element, coords) {
	  var ctm = element.getCTM(),
	  x = ctm.e + coords.x*ctm.a + coords.y*ctm.c,
	  y = ctm.f + coords.x*ctm.b + coords.y*ctm.d;
	  return {x: x, y: y};
	};

  /**
    * Adds a hidden iframe that calls the given resize event whenever its width
    * changes.
    * @param {string} el - The element to add the iframe to.
    * @param {function} f - The function to call when a resize event occurs.
    * @return {object} - The hidden iframe.
    */
  _autoResize(el, f) {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('allowtransparency', true);
    iframe.className = 'GCV-resizer';
    el.appendChild(iframe);
    iframe.contentWindow.onresize = function () {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(f, 10)
    };
    return iframe;
  }

  /**
    * Fades everything in the view besides the given selection.
    * @param {object} selection - What's omitted from the fade.
    */
  _beginHoverTimeout;
  _beginHover(selection) {
    clearTimeout(this._beginHoverTimeout);
    this._beginHoverTimeout = setTimeout(() => {
      d3.selectAll('.GCV').classed('hovering', true);
      selection.classed('active', true);
    }, this.options.hoverDelay);
  }

  /**
    * Unfades everything in the view and revokes the selection's omission from
    * being faded.
    * @param {object} selection - What's no longer omitted.
    */
  _hoverTimeout = 0;
  _endHover(selection) {
    selection.classed('active', false);
    // delay unfading for smoother mouse dragging
    clearTimeout(this._beginHoverTimeout);
    clearTimeout(this._hoverTimeout);
    this._hoverTimeout = setTimeout(function () {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = undefined;
      // make sure nothing is being hovered
      if (d3.selectAll('.GCV .active').empty()) {
        d3.selectAll('.GCV').classed('hovering', false);
      }
    }, 125);
  }

  /** Resizes the viewer and scale. Will be decorated by other components. */
  _resize() {
    var w = this.container.clientWidth,
        r1 = this.left + (2 * this._PAD),
        r2 = w - (this.right + this._PAD);
    this.viewer.attr('width', w);
    this.scale.range([r1, r2]);
  }

  /**
    * Decorates the _resize function with the given function.
    * @param {function} d - The decorator function.
    */
  _decorateResize(d) {
    this._resize = function (resize) {
      resize();
      d();
    }.bind(this, this._resize);
  }

  /**
    * Parses parameters and initializes variables.
    * @param {HTMLElement|string} el - ID of or the element itself where the
    * viewer will be drawn in.
    * @param {object} data - The data the viewer will visualize.
    * @param {object} options - Optional parameters.
    */
  _init(el, data, options) {
    // parse positional parameters
    if (el instanceof HTMLElement)
      this.container = el;
    else
      this.container = document.getElementById(el);
    if (this.container === null) {
      throw new Error('"' + el + '" is not a valid element/ID');
    }
    this.data = data;
    if (this.data === undefined) {
      throw new Error("'data' is undefined");
    }
    // create the viewer
    this.viewer = d3.select(this.container)
      .append('svg')
      .attr('class', 'GCV')
      .attr('height', this._PAD);
    // compute the space required for chromosome names
		var chromosomes = data.tracks.map(function (t) { return t.chromosome; });
    this.left = 0;
    this.right = this._PAD;
    // create the scale used to map block coordinates to pixels
    this.scale = d3.scale.linear()
      .domain([0, data.length]);
    // make sure resize always has the right context
    this._resize = this._resize.bind(this);
    // initialize the viewer width and scale range
    this._resize();
    // parse optional parameters
    this.options = Object.assign({}, options);
    this.options.nameClick = this.options.nameClick || function (y, i) { };
    this.options.blockClick = this.options.blockClick || function (b) { };
    this.options.viewportDrag = this.options.viewportDrag;
    this.options.viewport = this.options.viewport || false;
    this.options.autoResize = this.options.autoResize || false;
    this.options.hoverDelay = this.options.hoverDelay || 500;
    this.options.highlight = this.options.highlight || [];
    if (this.options.contextmenu)
      this.viewer.on('contextmenu', () => {
        this.options.contextmenu(d3.event);
      });
    if (this.options.click)
      this.viewer.on('click', () => {
        this.options.click(d3.event);
      });
  }

  /**
    * Positions the given element, resizes the viewer, and returns the vertical
    * center of the positioned element.
    * @param {object} e - The element to be positioned.
    * @return {number} - The vertical middle of the element after positioning.
    */
  _positionElement(e) {
    var h = e.node().getBBox().height,
        y = parseInt(this.viewer.attr('height'));
    e.attr('transform', 'translate(0, ' + (e.offset + y) + ')');
    this.viewer.attr('height', y + h + this._PAD);
    return y + (h / 2);
  }

  /**
    * Creates the x-axis.
    * @return {object} - D3 selection of the x-axis.
    */
  _drawXAxis() {
    // draw the axis
    var xAxis = this.viewer.append('g').attr('class', 'axis');
    // add the label
    var label = xAxis.append('text')
      .attr('class', 'query')
      .text(this.data.chromosome);
    // how the axis is resized
    xAxis.resize = function () {
      // update the axis
      var axis = d3.svg.axis()
        .scale(this.scale)
        .orient('top')
        .tickValues(this.scale.domain())
        .tickFormat((x, i) => { return x; });
      xAxis.call(axis)
        .selectAll('text')
        .style('text-anchor', function (t, i) {
          if (i == 1) {
            return 'start';
          } return 'end';
        });
      var padding = this._PAD + (2 * axis.tickPadding()),
          lBox = label.node().getBBox();
      xAxis.labelWidth = padding + lBox.width;
      label.style('text-anchor', 'end').attr('transform', (b) => {
        var x = this.left - padding,
            y = -(lBox.height / 2);
        return 'translate(' + x + ', ' + y + ')';
      });
    }.bind(this);
    // resize once to position everything
    xAxis.resize();
    xAxis.offset = xAxis.node().getBBox().height;
    return xAxis;
  }
  
  /**
    * Uses the Greedy Interval Scheduling Algorithm to group track blocks.
    * @param {array} data - The blocks to be grouped.
    */
  _blocksToRows(data) {
    // create a copy so there are no side effects when sorting
    var orderedBlocks = data.slice();
    // reverse sort by stop location so we can remove elements during iteration
    orderedBlocks.sort(function (a, b) { return b.stop - a.stop; });
    // create track rows
    var rows = [];
    while (orderedBlocks.length > 0) {
      // the first block to stop will start the row
      var row = orderedBlocks.splice(orderedBlocks.length - 1, 1),
          k = 0,
          y = rows.length;
      row[0].y = y;
      // iteratively add blocks whose starts don't overlap with the last stop
      for (var i = orderedBlocks.length - 1; i >= 0; i--) {
        if (orderedBlocks[i].start > row[k].stop) {
          orderedBlocks[i].y = y;
          row.push.apply(row, orderedBlocks.splice(i, 1));
          k++;
        }
      }
      rows.push(row);
    }
  }

  /**
    * Creates a graphic containing a track's blocks.
    * @param {number} i - The index of the track in the input data to draw.
    * @return {object} - D3 selection of the new track.
    */
  _drawTrack(i) {
    var obj = this,
        //c = this._COLORS[i % this._COLORS.length],
        t = this.data.tracks[i];
		this.viewer.append('defs')
		  .append('pattern')
		    .attr('id', 'diagonalHatch')
		    .attr('patternUnits', 'userSpaceOnUse')
		    .attr('width', 4)
		    .attr('height', 4)
		  .append('path')
		    .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
		    .attr('stroke', '#000000')
		    .attr('stroke-width', 1);
    // create the track's rows of blocks
    this._blocksToRows(t.blocks);
  	// create the track
    var selector = 'macro-' + i.toString(),
  	    track = this.viewer.append('g')
          .attr('data-macro-track', i.toString())
          .attr('data-chromosome', this.data.tracks[i].chromosome);
    track.offset = 0;
    // create the track's blocks
    var blocks = track.selectAll('block')
  	  .data(t.blocks)
  	  .enter()
      .append('g')
  	  .style('cursor', 'pointer')
      .on('mouseover', function (b) {
        obj.block = this;
        obj._beginHover(d3.select(this));
      })
  	  .on('mouseout', function (b) {
        obj.block = undefined;
        obj._endHover(d3.select(this));
      })
  	  .on('click', () => { this.options.blockClick(); });
    // help for generating points
    var genPoints = function (b, yTop, yBottom, yMiddle) {
      var x1 = obj.scale(b.start),
          x2 = obj.scale(b.stop);
      // draw a block if it's large enough
      if (x2 - x1 > obj._PTR_LEN) {
        var p = [  // x, y coordinates of block
          x1, yTop,
          x2, yTop,
          x2, yBottom,
          x1, yBottom
        ];
        // add the orientation pointer
        if (b.orientation == '+') {
          p[2] -= obj._PTR_LEN;
          p[4] -= obj._PTR_LEN;
          p.splice(4, 0, x2, yMiddle);
        } else if (b.orientation == '-') {
          p[0] += obj._PTR_LEN;
          p[6] += obj._PTR_LEN;
          p.push(x1, yMiddle);
        }
        return p;
      }
      // draw just a pointer
      var ptr = (b.orientation == '-') ? -obj._PTR_LEN : obj._PTR_LEN;
      return [  // x, y coordinates of block
        x1, yTop,
        x1 + ptr, yMiddle,
        x1, yBottom
      ];
    }
    // draw the blocks
  	var polygons = blocks.append('polygon')
      .attr('class', 'block')
  	  .style('fill',  i % 2 ? '#000000' : 'url(#diagonalHatch)')
      .attr('points', function (b) {
        var yTop = ((obj._BLOCK_HEIGHT + obj._PAD) * b.y) + obj._PAD,
            yBottom = yTop + obj._BLOCK_HEIGHT,
            yMiddle = yTop + (obj._BLOCK_HEIGHT / 2),
            block = d3.select(this);
        d3.select(this)  // evil nested assignments!
          .attr('data-y-top', yTop)
          .attr('data-y-bottom', yBottom)
          .attr('data-y-middle', yMiddle);
        return genPoints(b, yTop, yBottom, yMiddle);
      });
    // draw the tooltips
    var tips = blocks.append('text')
      .attr('class', 'synteny-tip')
  	  .attr('text-anchor', 'end')
  	  .text(function (b) { return b.start + ' - ' + b.stop; })
      .attr('data-x', function (b) {
        var x1 = b.start,
            x2 = b.stop;
        return x1 + ((x2 - x1) / 2);
      })
      .attr('data-y', function (b) {
        return (obj._BLOCK_HEIGHT + obj._PAD) * (b.y + 1);
      })
      .attr('transform', function (b) {
        var tip = d3.select(this),
            x = obj.scale(tip.attr('data-x')),
            y = tip.attr('data-y');
        return 'translate(' + x + ', ' + y + ')';
      });
    // how the blocks are resized
    track.resize = function (polygons, tips) {
      var obj = this;
  	  polygons.attr('points', function (b) {
        var block = d3.select(this),
            yTop = block.attr('data-y-top'),
            yBottom = block.attr('data-y-bottom'),
            yMiddle = block.attr('data-y-middle');
        return genPoints(b, yTop, yBottom, yMiddle);
      });
      tips.attr('transform', function (b) {
        var tip = d3.select(this),
            o = parseInt(tip.attr('data-offset')),
            x = obj.scale(tip.attr('data-x')) + o,
            y = parseInt(tip.attr('data-y')) - o;
        //return 'translate(' + x +', ' + y + ') ' + tip.attr('data-rotate');
        return 'translate(' + x +', ' + y + ') rotate(-45)';
      });
    }.bind(this, polygons, tips);
    // how tips are adjusted so they don't overflow the view
    track.adjustTips = function (tips, resize) {
      var vRect = obj.viewer.node().getBoundingClientRect();
      tips.classed('synteny-tip', false)
        .attr('data-offset', function (b) {
          var tRect = this.getBoundingClientRect(),
              d = Math.sqrt(Math.pow(tRect.width, 2) / 2);  // rotated height
          return (tRect.bottom + d > vRect.bottom) ? d : 0;
          //return 'rotate(' + r + ')';
        })
        .classed('synteny-tip', true);
      resize();
    }.bind(this, tips, track.resize);
    return track;
  }


  /**
    * Creates the y-axis, placing labels at their respective locations.
    * @param {array} ticks - The locations of the track labels.
    * @param {int} t - The pixel location of the top of the block area.
    * @param {int} b - The pixel location of the bottom of the block area.
    * @return {object} - D3 selection of the y-axis.
    */
  _drawYAxis(ticks, t, b) {
    // construct the y-axes
    var axis = d3.svg.axis()
      .scale(d3.scale.linear().domain([t, b]).range([t, b]))
      .orient('left')
      .tickValues(ticks)
      .tickFormat((y, i) => {
        return this.data.tracks[i].chromosome;
      });
    // draw the axes of the graph
    var yAxis = this.viewer.append('g')
      .attr('class', 'axis')
      .call(axis);
    yAxis.selectAll('text')
      .attr('class', (y, i) => {
        var cls = 'macro-' + i.toString();
        if (this.options.highlight.indexOf(this.data.tracks[i].chromosome) != -1)
          cls += ' bold';
        return cls;
      })
  	  .style('cursor', 'pointer')
      .on('mouseover', (y, i) => {
        var iStr = i.toString(),
            track = '.GCV [data-macro-track="' + iStr + '"]',
            name = this.data.tracks[i].chromosome,
            chromosome = '.GCV [data-chromosome="' + name + '"]';
        var selection = d3.selectAll(track + ', ' + chromosome)
          .filter(function () {
            var t = this.getAttribute('data-macro-track');
            return t === null || t == iStr;
          });
        this._beginHover(selection);
      })
      .on('mouseout', (y, i) => {
        var iStr = i.toString(),
            track = '.GCV [data-macro-track="' + iStr + '"]',
            name = this.data.tracks[i].chromosome,
            chromosome = '.GCV [data-chromosome="' + name + '"]';
        var selection = d3.selectAll(track + ', ' + chromosome)
          .filter(function () {
            var t = this.getAttribute('data-macro-track');
            return t === null || t == iStr;
          });
        this._endHover(selection);
      })
      .on('click', () => { this.options.nameClick(); });
    return yAxis;
  }

  /**
    * Gets the element under the element currently under mouse pointer.
    * @input {MouseEvent} e - The mouse event used to find the elements.
    * @output {HTMLElement} - The elements under the element current under the
    * mouse pointer.
    */
  _secondElementUnderPointer(e) {
    var x = e.clientX,
        y = e.clientY,
        stack = [];
    // find the elements
    var first = document.elementFromPoint(x, y);
    first.classList.add('pointer-events-none');
    var second = document.elementFromPoint(x, y);
    // reset pointer-events
    first.classList.remove('pointer-events-none');
    return second;
  }

  /**
    * Fires the given event on the given element.
    * @input {HTMLElement} el - The element to fire the event on.
    * @input {string} e - The event to be fired on the element.
    */
  _fireEvent(el, e) {
    if (el.fireEvent) {
      el.fireEvent('on' + e);
    } else {
      var eObj = document.createEvent('Events');
      eObj.initEvent(e, true, false);
      el.dispatchEvent(eObj);
    }
  }

  /**
    * Programmatically triggers hover events by assuming the given element
    * is being hovered and considering the last known element being hovered.
    * @input{HTMLElement} el - The element to consider.
    */
  _artificialHover(el) {
    if (this.block !== undefined && this.block !== el) {
      this._fireEvent(this.block, 'mouseout');
    }
    if (el.classList.contains('block') && el !== this.block) {
      this._fireEvent(el, 'mouseover');
    }
  }

  /**
    * Creates the viewport over the specified genomic interval.
    * @return {object} - D3 selection of the viewport.
    */
  _drawViewport() {
    var h = parseInt(this.viewer.attr('height')) - this._PAD;
    var viewport = this.viewer.append('rect')
      .attr('class', 'viewport')
      .attr('y', this._PAD)
      .attr('height', h)
      .attr('cursor', (d) => {
        if (this.options.viewportDrag) return 'move';
        return 'auto';
      })
      // translate viewport mouse events to block mouse events
      .on('mouseover', () => {
        var el = this._secondElementUnderPointer(d3.event);
        this._artificialHover(el);
      })
  	  .on('mouseout', () => {
        var e = d3.event,
            el = document.elementFromPoint(e.clientX, e.clientY);
        this._artificialHover(el);
      })
      .on('mousemove', () => {
        var el = this._secondElementUnderPointer(d3.event);
        this._artificialHover(el);
      })
      .on('click', () => {
        var el = this._secondElementUnderPointer(d3.event);
        if (el.classList.contains('block'))
          this._fireEvent(el, 'click');
      });
    if (this.options.viewportDrag) {
      viewport.call(d3.behavior.drag()
        .on('drag', () => {
          var r = this.scale.range(),
              w = parseFloat(viewport.attr('width')),
              x = parseFloat(viewport.attr('x')),
              newX = Math.max(x + d3.event.dx, r[0]);
          if (newX + w > r[1]) newX = r[1] - w;
          viewport.attr('x', newX);
        })
        .on('dragend', () => {
          var x1 = parseFloat(viewport.attr('x')),
              x2 = x1 + parseFloat(viewport.attr('width')),
              d1 = this.scale.invert(x1),
              d2 = this.scale.invert(x2);
          this.options.viewportDrag(d1, d2);
        }));
    }
    // how the viewport is resized
    viewport.resize = function () {
      var x1 = this.scale(this.options.viewport.start),
          x2 = this.scale(this.options.viewport.stop);
      viewport.attr('x', x1).attr('width', x2 - x1);
    }.bind(this);
    // resize once to position everything
    viewport.resize();
    return viewport;
  }

  /** Draws the viewer. */
  _draw() {
    // draw the x-axis
    var xAxis = this._drawXAxis();
    this._positionElement(xAxis);
    // decorate the resize function with that of the x-axis
    this._decorateResize(xAxis.resize);
    // draw the tracks
    var ticks = [],
        tracks = [];
    var t = this.viewer.attr('height');
    for (var i = 0; i < this.data.tracks.length; i++) {
      // make the track
      var track = this._drawTrack(i);
      // put it in the correct location
      var m = this._positionElement(track);
      // save the track's label location
      ticks.push(m);
      // save the track for the resize call
      tracks.push(track);
    }
    var b = this.viewer.attr('height');
    // decorate the resize function with that of the track
    var resizeTracks = function () {
      tracks.forEach(function (t, i) {
        t.resize();
      });
    }
    this._decorateResize(resizeTracks);
    // rotate the tips now that all the tracks have been drawn
    tracks.forEach(function (t, i) {
      t.adjustTips();
    });
    // move all tips to front
    this.viewer.selectAll('.synteny-tip').moveToFront();
    // draw the y-axis
    var yAxis = this._drawYAxis(ticks, t, b);
    this.left = Math.max(xAxis.labelWidth, yAxis.node().getBBox().width)
              + this._PAD;
    yAxis.attr('transform', 'translate(' + this.left + ', 0)');
    this.left += this._PAD;
    this._resize();
    // draw the viewport
    if (this.options.viewport) {
      var viewport = this._drawViewport();
      this._decorateResize(viewport.resize);
    }
    // create an auto resize iframe, if necessary
    if (this.options.autoResize) {
      this.resizer = this._autoResize(this.container, (e) => {
        this._resize();
      });
    }
    // add bottom padding
    var h = parseInt(this.viewer.attr('height')) + this._PAD;
    this.viewer.attr('height', h);
  }
  
  // Public

  /**
    * The constructor.
    * @param {HTMLElement|string} el - ID of or the element itself where the
    * viewer will be drawn in.
    * @param {object} data - The data the viewer will visualize.
    * @param {object} options - Optional parameters.
    */
  constructor(el, data, options) {
    this._init(el, data, options);
    this._draw();
  }

  /** Makes a copy of the SVG and inlines external GCV styles. */
  _inlineCopy() {
    // clone the current view node
    var clone = d3.select(this.viewer.node().cloneNode(true));
    // load the external styles
    var sheets = document.styleSheets;
    // inline GCV styles
    for (var i = 0; i < sheets.length; i++) {
      var rules = sheets[i].rules || sheets[i].cssRules;
      for (var r in rules) {
        var rule = rules[r],
            selector = rule.selectorText;
        if (selector !== undefined && selector.startsWith('.GCV')) {
          var style = rule.style,
              selection = clone.selectAll(selector);
          for (var k = 0; k < style.length; k++) {
            var prop = style[k];
            selection.style(prop, style[prop]);
          }
        }
      }
    }
    return clone;
	}

  /** Generates the raw SVG xml. */
  xml() {
    try {
      var isFileSaverSupported = !!new Blob();
    } catch (e) {
      alert("Your broswer does not support saving");
    }
    // create a clone of the viewer with all GCV styles inlined
    var clone = this._inlineCopy();
    // generate the data
    var xml = (new XMLSerializer).serializeToString(clone.node());
    return xml;
  }

  /** Manually destroys the viewer. */
  destroy() {
    if (this.container) {
      this.container.removeChild(this.viewer.node());
      if (this.resizer) {
        this.container.removeChild(this.resizer);
      }
    }
    this.container = this.viewer = this.resizer = undefined;
  }
}

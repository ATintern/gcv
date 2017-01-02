'use strict'


/** The Genomic Context Viewer namespace. */
var GCV = GCV || {};

// merge partitions from same chromosome with the interval scheduling
// greedy algorithm
// TODO: should be same group only
//var partition_groups = [];
//// sort the partition groups by "finish time"
//partitions[id].sort(function (a, b) {
//  return a[a.length-1].x-b[b.length-1].x;
//});
//// generate the merged tracks
//while (partitions[id].length > 0) {
//  var track_genes = [];
//  var remove = [];
//  for (var i = 0; i < partitions[id].length; i++) {
//    // make sure the genes are ordered by x coordinate
//    partitions[id].sort(function (a, b) {
//      return a.x-b.x;
//    });
//    // greedy ordering
//    var partition = partitions[id][i];
//    if (track_genes.length == 0 ||
//        partition[0].x > track_genes[track_genes.length-1].x) {
//      track_genes = track_genes.concat(partition);
//      remove.push(i);
//    }
//  }
//  // remove the tracks that were merged
//  for (var i = remove.length-1; i >= 0; i--) {
//    partitions[id].splice(remove[i], 1);
//  }
//  // save the new group
//  var group = clone(groups[id]);
//  group.genes = track_genes.slice(0);
//  partition_groups.push(group);
//}
//// order the new groups largest to smallest
//partition_groups.sort(function (a, b) {
//  return b.genes.length-a.genes.length;
//});
//// add the new groups to the data
//for (var i = 0; i < partition_groups.length; i++) {
//  partition_groups[i].genes = partition_groups[i].genes.map(
//                              function(gene) {
//                                gene.y = group_y;
//                                return gene;
//                              });
//  group_y++;
//  tracks.groups.push(partition_groups[i]);
//}


/**
  * Merges overlapping tracks from the same group to maximize alignment score.
  * @param {object} data - The micro-synteny viewer data to be merged.
  */
GCV.merge = function (data) {
  // make a copy of the data (tracks)
  var tracks = $.extend(true, {}, data);
  if (data.groups.length > 0) {
    // groups tracks by group id
    var groups = {};
    for (var i = 1; i < tracks.groups.length; i++) {  // skip first (query) track
      var track = tracks.groups[i];
      groups[track.id] = groups[track.id] || [];
      groups[track.id].push(track);
    }
    tracks.groups = [tracks.groups[0]];
    // try to merge each partition
    for (var id in groups) {
      if (!groups.hasOwnProperty(id)) {
        continue;
      }
      var groupTracks = groups[id],
          merged = [];  // which tracks have been merged into another
      // iterate pairs of tracks to see if one is a sub-inversion of the other
      for (var j = 0; j < groupTracks.length && merged.indexOf(j) == -1; j++) {
        var jTrack = groupTracks[j],
            jLevels = 0,
            jIds = jTrack.genes.map(function (g) { return g.id; });
        for (var k = j + 1; k < groupTracks.length && merged.indexOf(k) == -1; k++) {
          var kTrack = groupTracks[k],
              kLevels = 0,
              kIds = kTrack.genes.map(function (g) { return g.id; });
          // compute the intersection
          var overlap = jIds.filter(function (jId) {
            return kIds.indexOf(jId) != -1;
          });
          if (overlap.length > 0) {
            // j is the inversion
            if (kIds.length > jIds.length) {
              // get index list
              var indices = overlap.map(function (jId) {
                return kIds.indexOf(jId);
              });
              // compute the score of the inverted sequence before inverting
              var min = Math.min.apply(null, indices),
                  max = Math.max.apply(null, indices);
              var startGene = kTrack.genes[min],
                  endGene = kTrack.genes[max];
              var score = endGene.suffixScore - startGene.suffixScore;
              // perform the inversion if it will improve the super-track's score
              if (jTrack.score > score) {
                merged.push(j);
                // increment the level counter
                kLevels++;
                // perform the inversion
                jTrack.genes.reverse();
                var args = [min, max - min + 1],
                    geneArgs = args.concat(jTrack.genes);
                Array.prototype.splice.apply(kTrack.genes, geneArgs);
                // adjust inversion scores and y coordinates
                max = min + jTrack.genes.length;
                var pred = (min > 0) ? kTrack.genes[min - 1].suffixScore : 0;
                for (var l = min; l < max; l++) {
                  kTrack.genes[l].suffixScore += pred;
                  kTrack.genes[l].y = kLevels;
                }
                // adjust post-inversion scores
                var adjustment = jTrack.score - score;
                for (var l = max; l < kTrack.genes.length; l++) {
                  kTrack.genes[l].suffixScore += adjustment;
                }
                kTrack.score += adjustment;
              }
            // k is the inversion
            } else if (jIds.length == kIds.length) {
              // get index list
              var indices = overlap.map(function (jId) {
                return jIds.indexOf(jId);
              });
              // compute the score of the inverted sequence before inverting
              var min = Math.min.apply(null, indices),
                  max = Math.max.apply(null, indices);
              var startGene = jTrack.genes[min],
                  endGene = jTrack.genes[max];
              var score = endGene.suffixScore - startGene.suffixScore;
              // perform the inversion if it will improve the super-track's score
              if (kTrack.score > score) {
                merged.push(k);
                // increment the level counter
                jLevels++;
                // perform the inversion
                kTrack.genes.reverse();
                var args = [min, max - min + 1],
                    geneArgs = args.concat(kTrack.genes),
                    idArgs = args.concat(kIds);
                Array.prototype.splice.apply(jTrack.genes, geneArgs);
                Array.prototype.splice.apply(jIds, idArgs);
                // adjust inversion scores and y coordinates
                max = min + kTrack.genes.length;
                var pred = (min > 0) ? jTrack.genes[min - 1].suffixScore : 0;
                for (var l = min; l < max; l++) {
                  jTrack.genes[l].suffixScore += pred;
                  jTrack.genes[l].y = jLevels;
                }
                // adjust post-inversion scores
                var adjustment = kTrack.score - score;
                for (var l = max; l < jTrack.genes.length; l++) {
                  jTrack.genes[l].suffixScore += adjustment;
                }
                jTrack.score += adjustment;
              }
            }
          }
        }
        // add the track if it wasn't merged during its iteration
        if (merged.indexOf(j) == -1) {
          tracks.groups.push(jTrack);
        }
      }
    }
  }
  return tracks;
}


/** The micro-synteny viewer. */
GCV.Viewer = class {

  // Private

  // Constants
  _PAD = 5;
  _GLYPH_SIZE = 30;

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
  _beginHover(selection) {
    d3.selectAll('.GCV').classed('hovering', true);
    selection.classed('active', true);
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

  /** Resizes the viewer and x scale. Will be decorated by other components. */
  _resize() {
    var w = this.container.clientWidth,
        doublePad = 2 * this._PAD,
        halfGlyph = this._GLYPH_SIZE / 2,
        r1 = this.left + halfGlyph,
        r2 = w - (this.right + halfGlyph);
    this.viewer.attr('width', w);
    this.x.range([r1, r2]);
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
    * @param {object} colors - D3 family-to-color map.
    * @param {object} data - The data the viewer will visualize.
    * @param {object} options - Optional parameters.
    */
  _init(el, colors, data, options) {
    // parse positional parameters
    if (el instanceof HTMLElement)
      this.container = el;
    else
      this.container = document.getElementById(el);
    if (this.container === null) {
      throw new Error('"' + el + '" is not a valid element/ID');
    }
    this.colors = colors;
    if (this.colors === undefined) {
      throw new Error('"color" is undefined');
    }
    this.data = data;
    if (this.data === undefined) {
      throw new Error('"data" is undefined');
    }
    // create the viewer
    var levels = data.groups.map(group => {
      return Math.max.apply(null, group.genes.map(gene => gene.y)) + 1;
    });
    var numLevels = levels.reduce((a, b) => a + b, 0),
        halfTrack = this._GLYPH_SIZE / 2,
        top = this._PAD + halfTrack,
        bottom = top + (this._GLYPH_SIZE * numLevels);
    this.viewer = d3.select(this.container)
      .append('svg')
      .attr('class', 'GCV')
      .attr('height', bottom + halfTrack);
    // compute the x scale, track names and locations, and line thickness
    var minX = Infinity,
        maxX = -Infinity;
    var minDistance = Infinity,
        maxDistance = -Infinity;
		this.names = [];
    this.ticks = [];
    var tick = 0;
    this.distances = [];
    for (var i = 0; i < this.data.groups.length; i++) {
      var group = this.data.groups[i],
          fminI = Infinity,
          fmaxI = -Infinity;
      this.ticks.push(tick);
      tick += levels[i];
      var distances = [];
      for (var j = 0; j < group.genes.length; j++) {
        var gene = group.genes[j],
            fmax = gene.fmax,
            fmin = gene.fmin,
            x = gene.x;
        fminI = Math.min.apply(null, [fminI, fmax, fmin]);
        fmaxI = Math.max.apply(null, [fmaxI, fmax, fmin]);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        if (j < group.genes.length - 1) {
          var nextGene = group.genes[j + 1],
              nextFmin = nextGene.fmin,
              nextFmax = nextGene.fmax;
          var dist = Math.min.apply(null, [
            fmin - nextFmin,
            fmax - nextFmin,
            fmin - nextFmax,
            fmax - nextFmin
          ]);
          distances.push(dist);
          minDistance = Math.min(minDistance, dist);
          maxDistance = Math.max(maxDistance, dist);
        }
      }
      this.names.push(group.chromosome_name + ':' + fminI + '-' + fmaxI);
      this.distances.push(distances);
    }
    // initialize the x, y, and line thickness scales
    this.x = d3.scale.linear().domain([minX, maxX]);
    this.y = d3.scale.linear().domain([0, numLevels - 1])
               .range([top, bottom]);
    this.thickness = d3.scale.linear()
      .domain([minDistance, maxDistance])
      .range([.1, 5]);
    // parse optional parameters
    this.options = Object.assign({}, options);
    this.options.boldFirst = this.options.boldFirst || false;
    this.options.highlight = this.options.hightlight || [];
    this.options.selectiveColoring = this.options.selectiveColoring;
    this.options.nameClick = this.options.nameClick || function (y, i) { };
    this.options.geneClick = this.options.geneClick || function (b) { };
    this.options.plotClick = this.options.plotClick;
    this.options.autoResize = this.options.autoResize || false;
    // set the right padding
    this.right = this._PAD;
    // make sure resize always has the right context
    this._resize = this._resize.bind(this);
  }

  /**
    * Creates a graphic containing a track's genes.
    * @param {number} i - The index of the track in the input data to draw.
    * @return {object} - D3 selection of the new track.
    */
  _drawTrack(i) {
    var obj = this,
        t = this.data.groups[i],
        y = this.ticks[i];
  	// make svg group for the track
    var track = this.viewer.append('g')
          .attr('data-micro-track', i.toString())
          .attr('data-chromosome', this.data.groups[i].chromosome_name),
        neighbors = [];
    // add the lines
    for (var j = 0; j < t.genes.length - 1; j++) {
      neighbors.push({a: t.genes[j], b: t.genes[j + 1]});
    }
    var lineGroups = track.selectAll('rail')
      .data(neighbors)
      .enter()
      .append('g')
      .attr('class', 'rail');
    // draw lines left to right to simplify resizing
    var lines = lineGroups.append('line')
      	.attr('class', 'line')
        .attr('stroke-width', function (n, j) {
          return obj.thickness(obj.distances[i][j]);
        })
      	.attr('x1', 0)
      	.attr('y1', function (n) {
          var height = Math.abs(obj.y(n.a.y) - obj.y(n.b.y));
          if (n.a.x <= n.b.x) {
            return (n.a.y < n.b.y) ? 0 : height;
          } return (n.a.y < n.b.y) ? height : 0;
        })
      	.attr('y2', function (n) {
          var height = Math.abs(obj.y(n.a.y) - obj.y(n.b.y));
          if (n.a.x <= n.b.x) {
            return (n.a.y < n.b.y) ? height : 0;
          } return (n.a.y < n.b.y) ? 0 : height;
        });
    // add tooltips to the lines
    var lineTips = lineGroups.append('text')
    	.attr('class', 'synteny-tip')
      .attr('text-anchor', 'end')
    	.text(function (n, j) { return obj.distances[i][j]; });
    // make the gene groups
  	var geneGroups = track.selectAll('gene')
      .data(t.genes)
  	  .enter()
  	  .append('g')
  	  .attr('class', 'gene')
      .attr('data-gene', g => g.id)
      .attr('data-family', g => g.family)
  	  .attr('transform', function (g) {
  	    return 'translate(' + obj.x(g.x) + ', ' + obj.y(y + g.y) + ')';
  	  })
  	  .style('cursor', 'pointer')
      .on('mouseover', function (g) {
        var gene = '.GCV [data-gene="' + g.id + '"]',
            family = '.GCV [data-family="' + g.family + '"]';
        var selection = d3.selectAll(gene + ', ' + family)
          .filter(function () {
            var d = this.getAttribute('data-gene');
            return d === null || d == g.id;
          });
        obj._beginHover(selection);
      })
  	  .on('mouseout', function (g) {
        var gene = '.GCV [data-gene="' + g.id + '"]',
            family = '.GCV [data-family="' + g.family + '"]';
        var selection = d3.selectAll(gene + ', ' + family)
          .filter(function () {
            var d = this.getAttribute('data-gene');
            return d === null || d == g.id;
          });
        obj._endHover(selection);
      })
  	  .on('click', obj.options.geneClick);
  	// add genes to the gene groups
  	var genes = geneGroups.append('path')
  	  .attr('d', d3.svg.symbol().type('triangle-up').size(200))
  	  .attr('class', function (g) {
  	  	if (obj.options.highlight.indexOf(g.name) != -1) {
  	  	  return 'point focus';
  	  	} else if (g.family == '') {
  	  	  return 'point no_fam';
  	  	} else if (obj.options.selectiveColoring !== undefined &&
        obj.options.selectiveColoring[g.family] == 1) {
  	  	  return 'point single';
  	  	} return 'point';
      })
  	  .attr('transform', function (g) {
        var orientation = (g.strand == 1) ? '90' : '-90';
        return 'rotate(' + orientation + ')';
      })
  	  .style('fill', function (g) {
  	  	if (g.family == '' ||
        (obj.options.selectiveColoring !== undefined &&
        obj.options.selectiveColoring[g.family] == 1)) {
  	  	  return '#ffffff';
  	  	} return obj.colors(g.family);
  	  });
    // add tooltips to the gene groups
    var geneTips = geneGroups.append('text')
      .attr('class', 'synteny-tip')
  	  .attr('text-anchor', 'end')
  	  .text(function (g) { return g.name + ': ' + g.fmin + ' - ' + g.fmax; })
    // how the track is resized
    track.resize = function (geneGroups, linesGroups, lines, lineTips) {
      var obj = this;
      geneGroups.attr('transform', function (g) {
        return 'translate(' + obj.x(g.x) + ', ' + obj.y(y + g.y) + ')';
  	  });
      lineGroups.attr('transform', function (n) {
        var left = Math.min(n.a.x, n.b.x),
            top = y + Math.min(n.a.y, n.b.y);
        return 'translate(' + obj.x(left) + ', ' + obj.y(top) + ')';
      });
      lines.attr('x2', function (n) {
        return Math.abs(obj.x(n.a.x) - obj.x(n.b.x));
      });
      lineTips.attr('transform', function (n) {
        var x = Math.abs(obj.x(n.a.x) - obj.x(n.b.x)) / 2,
            y = Math.abs(obj.y(n.a.y) - obj.y(n.b.y)) / 2;
        // awkward syntax FTW
        var transform = d3.transform(d3.select(this).attr('transform'));
        transform.translate = [x, y];
        return transform;
      });
    }.bind(this, geneGroups, lineGroups, lines, lineTips);
    // how tips are rotated so they don't overflow the view
    var tips = track.selectAll('.synteny-tip');
    track.rotateTips = function (tips, resize) {
      var vRect = obj.viewer.node().getBoundingClientRect();
      tips.classed('synteny-tip', false)
        .attr('transform', function (t) {
          var tRect = this.getBoundingClientRect(),
              h = Math.sqrt(Math.pow(tRect.width, 2) / 2),  // rotated height
              r = (tRect.bottom + h > vRect.bottom) ? 45 : -45;
          return 'rotate(' + r + ')';
        })
        .classed('synteny-tip', true);
      resize();
    }.bind(this, tips, track.resize);
    return track;
  }


  /**
    * Creates the y-axis, placing labels at their respective locations.
    * @return {object} - D3 selection of the y-axis.
    */
  _drawYAxis() {
    // construct the y-axes
    var axis = d3.svg.axis().scale(this.y)
      .orient('left')
      .tickValues(this.ticks)
      .tickFormat((y, i) => { return this.names[i]; });
    // draw the axes of the graph
    var yAxis = this.viewer.append('g')
      .attr('class', 'axis')
      .call(axis);
    yAxis.selectAll('text')
      .attr('class', (y, i) => {
        return (i == 0 && this.options.boldFirst) ? 'query ' : '';
      })
      .attr('data-micro-track', (y, i) => i.toString())
      .attr('data-chromosome', (y, i) => this.data.groups[i].chromosome_name)
  	  .style('cursor', 'pointer')
      .on('mouseover', (y, i) => {
        var iStr = i.toString(),
            micro = '.GCV [data-micro-track="' + iStr + '"]',
            name = this.data.groups[i].chromosome_name,
            chromosome = '.GCV [data-chromosome="' + name + '"]';
        var selection = d3.selectAll(micro + ', ' + chromosome)
          .filter(function () {
            var t = this.getAttribute('data-micro-track');
            return t === null || t == iStr;
          });
        this._beginHover(selection);
      })
      .on('mouseout', (y, i) => {
        var iStr = i.toString(),
            micro = '.GCV [data-micro-track="' + iStr + '"]',
            name = this.data.groups[i].chromosome_name,
            chromosome = '.GCV [data-chromosome="' + name + '"]';
        var selection = d3.selectAll(micro + ', ' + chromosome)
          .filter(function () {
            var t = this.getAttribute('data-micro-track');
            return t === null || t == iStr;
          });
        this._endHover(selection);
      })
      .on('click', (y, i) => {
        this.options.nameClick(this.data.groups[i]);
      });
    return yAxis;
  }


  /**
    * Creates the plot y-axis, placing labels at their respective locations.
    * @return {object} - D3 selection of the plot y-axis.
    */
  _drawPlotAxis() {
    // construct the plot y-axes
    var axis = d3.svg.axis().scale(this.y)
      .orient('right')
      .tickValues(this.ticks)
      .tickFormat('plot');
    // draw the axes of the graph
    var plotYAxis = this.viewer.append('g')
      .attr('class', 'axis')
      .call(axis);
    plotYAxis.selectAll('text')
  	  .style('cursor', 'pointer')
      .on('click', (y, i) => {
        this.options.plotClick(this.data.groups[i]);
      });
    return plotYAxis;
  }

  /** Draws the viewer. */
  _draw() {
    // draw the y-axes
    var yAxis = this._drawYAxis();
    this.left = yAxis.node().getBBox().width + this._PAD;
    yAxis.attr('transform', 'translate(' + this.left + ', 0)');
    this.left += this._PAD;
    if (this.options.plotClick !== undefined) {
      var plotAxis = this._drawPlotAxis();
      this.right += plotAxis.node().getBBox().width + this._PAD;
      var obj = this;
      var resizePlotYAxis = function () {
        var x = obj.viewer.attr('width') - obj.right + obj._PAD;
        plotAxis.attr('transform', 'translate(' + x + ', 0)');
      }
      this._decorateResize(resizePlotYAxis);
    }
    this._resize();
    // draw the tracks
    var tracks = [];
    for (var i = 0; i < this.data.groups.length; i++) {
      // make the track and save it for the resize call
      tracks.push(this._drawTrack(i));
    }
    // decorate the resize function with that of the track
    var resizeTracks = function () {
      tracks.forEach(function (t, i) {
        t.resize();
      });
    }
    this._decorateResize(resizeTracks);
    // rotate the tips now that all the tracks have been drawn
    tracks.forEach(function (t, i) {
      t.rotateTips();
    });
    // move all tips to front
    this.viewer.selectAll('.synteny-tip').moveToFront();
    // create an auto resize iframe, if necessary
    if (this.options.autoResize) {
      this.resizer = this._autoResize(this.container, (e) => {
        this._resize();
      });
    }
  }
  
  // Public

  /**
    * The constructor.
    * @param {HTMLElement|string} el - ID of or the element itself where the
    * viewer will be drawn in.
    * @param {object} colors - D3 family-to-color map.
    * @param {object} data - The data the viewer will visualize.
    * @param {object} options - Optional parameters.
    */
  constructor(el, colors, data, options) {
    this._init(el, colors, data, options);
    this._draw();
  }

  /** Manually destroys the viewer. */
  destroy() {
    if (this.resizer) {
      if (this.resizer.contentWindow)
        this.resizer.contentWindow.onresize = undefined;
      this.container.removeChild(this.resizer);
    }
    this.container.removeChild(this.viewer.node());
    this.container = this.viewer = this.resizer = undefined;
  }
}
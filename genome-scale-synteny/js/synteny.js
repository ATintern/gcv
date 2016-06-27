var Synteny = (function (PIXI) {

  var _FADE = 0.15;

  /* private */

  /* variables */

  // 100 maximally distinct colors
  var _colors = [0x7A2719, 0x5CE33C, 0xE146E9, 0x64C6DE, 0xE8B031, 0x322755, 0x436521, 0xDE8EBA, 0x5C77E3, 0xCEE197, 0xE32C76, 0xE54229, 0x2F2418, 0xE1A782, 0x788483, 0x68E8B2, 0x9E2B85, 0xE4E42A, 0xD5D9D5, 0x76404F, 0x589BDB, 0xE276DE, 0x92C535, 0xDE6459, 0xE07529, 0xA060E4, 0x895997, 0x7ED177, 0x916D46, 0x5BB0A4, 0x365167, 0xA4AE89, 0xACA630, 0x38568F, 0xD2B8E2, 0xAF7B23, 0x81A158, 0x9E2F55, 0x57E7E1, 0xD8BD70, 0x316F4B, 0x5989A8, 0xD17686, 0x213F2C, 0xA6808E, 0x358937, 0x504CA1, 0xAA7CDD, 0x393E0D, 0xB02828, 0x5EB381, 0x47B033, 0xDF3EAA, 0x4E191E, 0x9445AC, 0x7A691F, 0x382135, 0x709628, 0xEF6FB0, 0x603719, 0x6B5A57, 0xA44A1C, 0xABC6E2, 0x9883B0, 0xA6E1D3, 0x357975, 0xDC3A56, 0x561238, 0xE1C5AB, 0x8B8ED9, 0xD897DF, 0x61E575, 0xE19B55, 0x1F303A, 0xA09258, 0xB94781, 0xA4E937, 0xEAABBB, 0x6E617D, 0xB1A9AF, 0xB16844, 0x61307A, 0xED8B80, 0xBB60A6, 0xE15A7F, 0x615C37, 0x7C2363, 0xD240C2, 0x9A5854, 0x643F64, 0x8C2A36, 0x698463, 0xBAE367, 0xE0DE51, 0xBF8C7E, 0xC8E6B6, 0xA6577B, 0x484A3A, 0xD4DE7C, 0xCD3488];

  /* PIXI drawing functions */
  
  // greedy interval scheduling algorithm for grouping track blocks
  var _createRows = function (blocks) {
    // create a copy so there are no side effects
    var orderedBlocks = blocks.slice();
    // reverse sort by stop location so we can remove elements during iteration
    orderedBlocks.sort(function (a, b) {
      return b.stop - a.stop;
    });
    // create track rows
    var rows = [];
    while (orderedBlocks.length > 0) {
      // the first block to stop will start the row
      var row = orderedBlocks.splice(orderedBlocks.length - 1, 1);
      var k = 0;
      // iteratively add blocks whose starts don't overlap with the last stop
      for (var i = orderedBlocks.length - 1; i >= 0; i--) {
        if (orderedBlocks[i].start > row[k].stop) {
          row.push.apply(row, orderedBlocks.splice(i, 1));
          k++;
        }
      }
      rows.push(row);
    }
    return rows;
  }

  // create a graphic containing a track's blocks
  var _createTrack = function (renderer, LENGTH, SCALE, NAME_OFFSET, HEIGHT,
  PADDING, COLOR, track, nameClick) {
    var POINTER_LENGTH = 5;
    // create the rows for the track
    var rows = _createRows(track.blocks);
    // where the blocks will be drawn
    var blocks = new PIXI.Graphics();
    // set a fill and line style
    blocks.beginFill(COLOR);
    blocks.lineStyle(1, COLOR, 1);
    // draw each row in the track
    var tips = [];
    var tipArgs = {font : HEIGHT + 'px Arial', align : 'left'};
    for (var i = 0; i < rows.length; i++) {
      var iBlocks = rows[i];
      var y1 = (HEIGHT + PADDING) * i + PADDING;  // vertical
      var y2 = y1 + HEIGHT;
      // draw each block in the row
      for (var k = 0; k < iBlocks.length; k++) {
        var b = iBlocks[k];
        // create the polygon points of the block
        var x1 = SCALE * b.start;
        var x2 = SCALE * b.stop;
        var points = [  // x, y coordinates of block
          x1, y1,
          x2, y1,
          x2, y2,
          x1, y2
        ];
        // add the orientation pointer
        var middle = y1 + (HEIGHT / 2);
        if (b.orientation == '+') {
          points[2] -= POINTER_LENGTH;
          points[4] -= POINTER_LENGTH;
          points.splice(4, 0, (SCALE * b.stop), middle);
        } else if (b.orientation == '-') {
          points[0] += POINTER_LENGTH;
          points[6] += POINTER_LENGTH;
          points.push((SCALE * b.start), middle);
        }
        // create the polygon
        blocks.drawPolygon(points);
        // create a tooltips for the track
        var tip = new PIXI.Text(b.start + ' - ' + b.stop, tipArgs);
        tip.position.x = x1 + ((x2 - x1) / 2);
        tip.position.y = y1 /*+ (HEIGHT / 2)*/;
        tip.rotation = 45 * (Math.PI / 180);
        tips.push(tip);
      }
    }
    blocks.endFill();
    // create a render texture so the blocks can be rendered as a sprite
    var h = blocks.getBounds().height;
    var w = SCALE * LENGTH;
    var blocksTexture = new PIXI.RenderTexture(renderer, w, h);
    blocksTexture.render(blocks);
    // render the blocks as a sprite
    var blocksSprite = new PIXI.Sprite(blocksTexture);
    blocksSprite.position.x = NAME_OFFSET;
    // make the blocksSprite interactive so we can capture mouse events
    blocksSprite.interactive = true;
    // make the cursor a pointer when it rolls over the track
    blocksSprite.buttonMode = true;
    // create the track name
    var nameArgs = {font : HEIGHT + 'px Arial', align : 'right'};
    var name = new PIXI.Text(track.chromosome, nameArgs);
    // position it next to the blocks
    name.position.x = NAME_OFFSET - (name.width + (2 * PADDING));
    name.position.y = (blocks.height - name.height) / 2;
    // make it interactive
    name.interactive = true;
    name.buttonMode = true;
    name
      // begin dragging track
      .on('mousedown', _mousedown)
      .on('touchstart', _mousedown)
      // stop dragging track
      .on('mouseup', _mouseup)
      .on('touchend', _mouseup)
      .on('mouseupoutside', _mouseup)
      .on('touchendoutside', _mouseup)
      // track being dragged
      .on('mouseover', _mouseover)
      .on('mousemove', _mousemove)
      .on('mouseout', _mouseout);
    // add the name and blocks to a container
    var container = new PIXI.Container();
    container.addChild(name);
    container.addChild(blocksSprite);
    // let it know what blocks it's associated with
    container.tips = tips;
    container.blocks = blocksSprite;
    return container;
  }

  // creates the query ruler graphic
  var _createRuler = function (chromosome, LENGTH, SCALE, NAME_OFFSET, HEIGHT,
  PADDING) {
    // create the query name
    var args = {font : 'bold ' + HEIGHT + 'px Arial', align : 'right'};
    var name = new PIXI.Text(chromosome, args);
    name.position.x = NAME_OFFSET - (name.width + (2 * PADDING));
    name.position.y = HEIGHT / 2;
    // create the ruler
    var ruler = new PIXI.Graphics();
    ruler.position.x = NAME_OFFSET;
    // draw the ruler
    ruler.lineStyle(1, 0x000000, 1);
    ruler.moveTo(0, HEIGHT);
    ruler.lineTo(0, HEIGHT / 2);
    var right = LENGTH * SCALE;
    ruler.lineTo(right, HEIGHT / 2);
    ruler.lineTo(right, HEIGHT);
    ruler.endFill();
    // add the genome length labels
    var start = new PIXI.Text('0', args);
    start.position.x = NAME_OFFSET;
    start.position.y = HEIGHT;
    var stop = new PIXI.Text(LENGTH, args);
    stop.position.x = ruler.position.x + ruler.width - stop.width;
    stop.position.y = HEIGHT;
    // add the pieces to a container
    var container = new PIXI.Container();
    container.addChild(name);
    container.addChild(ruler);
    container.addChild(start);
    container.addChild(stop);
    return container;
  }

  var _createViewport = function (start, stop, SCALE, y, HEIGHT) {
    // create the Graphics that will hold the viewport
    var viewport = new PIXI.Graphics();
    // set a fill and line style
    viewport.beginFill(0x000000);
    viewport.lineStyle(1, 0x000000, 1);
    // draw the port
    var x = SCALE * start;
    var width = (SCALE * stop) - x;
    viewport.drawRect(x, y, width, HEIGHT);
    viewport.endFill();
    // make the viewport semi-transparent
    viewport.alpha = _FADE;
    return viewport;
  }

  /* mouse interaction events */
  
  var _mousedown = function (event) {
    // we want to operate at the track level
    var track = this.parent;  // this = track name
    _beginDrag(track);
  }

  var _mouseup = function (event) {
    // we want to operate at the track level
    var track = this.parent;  // this = track name
    // end dragging the track
    if (track.newY !== undefined) {
      _endDrag(track);
    }
  }

  var _mouseover = function (event) {
    var track = this.parent;
    var table = track.parent;
    var tracks = table.children;
    // show the track's tooltips if no track is being dragged
    if (tracks.every(function (element, index, array) {
      return element.newY === undefined;
    })) {
      _showTooltips(track);
    }
  }

  var _mousemove = function (event) {
    var track = this.parent;
    // move the track if it's being dragged
    if (track.newY !== undefined) {
      _drag(event, track);
    }
  }

  var _mouseout = function (event) {
    var track = this.parent;
    // hide the track's tooltips
    _hideTooltips(track);
  }

  /* interaction behaviors */

  // how track dragging begins
  var _beginDrag = function(track) {
    // the track's new y coordinate will be computed as it's dragged
    track.newY = track.position.y;
    // bring the row being dragged to the front
    var children = track.parent.children;
    children.splice(children.indexOf(track), 1);
    children.push(track);
  }

  // dragging a track
  var _drag = function (event, track) {
    var newY = track.newY;
    // update the track's position according to the mouse's location
    var table = track.parent;
    var dragY = event.data.getLocalPosition(table).y;
    // make sure the new position is within the bounds of the "table"
    if (dragY >= 0 && dragY + track.height <= table.height) {
      track.position.y = dragY;
    }
    // move other tracks as they're dragged over
    for (var i = 0; i < table.children.length; i++) {
      var child = table.children[i];
      if (child != track) {
        var childY = child.position.y;
        // if the track was dragged DOWN past the child
        if (childY + (child.height / 2) < dragY && childY > newY) {
          // update the track being dragged
          track.newY = (childY + child.height) - track.height;
          // update the track being dragged over
          child.position.y = newY;
        // if the track was dragged UP past the child
        } else if (childY + (child.height / 2) > dragY && childY < newY) {
          // update the track being dragged
          track.newY = childY;
          // update the track being dragged over
          child.position.y = (newY + track.height) - child.height;
        }
      }
    }
  }

  // stop dragging a track
  var _endDrag = function (track) {
    // put the track in its new position
    track.position.y = track.newY;
    // discard dragging specific data
    track.newY = undefined;
  }

  // show a track's tooltips and fade the other tracks
  var _showTooltips = function (track) {
    var table = track.parent;
    var tracks = table.children;
    // fade all the other tracks
    for (var i = 0; i < tracks.length; i++) {
      var t = tracks[i];
      if (t != track) {
        t.alpha = _FADE;
      }
    }
    // draw tooltips for each of the track's blocks
    for (var i = 0; i < track.tips.length; i++) {
      tip = track.tips[i];
      track.blocks.addChild(tip);
    }
  }

  // hide a track's tooltips and show the other tracks
  var _hideTooltips = function (track) {
    var table = track.parent;
    var tracks = table.children;
    // unfade all the other tracks
    for (var i = 0; i < tracks.length; i++) {
      var t = tracks[i];
      if (t != track) {
        t.alpha = 1;
      }
    }
    // remove the track's tooltips
    for (var i = 0; i < track.tips.length; i++) {
      tip = track.tips[i];
      track.blocks.removeChild(tip);
    }
  }

  /* public */

  // draws a synteny view
  var draw = function (elementId, data, options) {
    // parse optional parameters
    var options = options || {};
    var nameClick = options.nameClick || function() { };
    // get the dom element that will contain the view
    var container = document.getElementById(elementId);
    // width and height used to initially draw the view
    var w = container.offsetWidth;
    var h = container.offsetHeight;
    // prefer WebGL renderer, but fallback to canvas
    var args = {antialias: true, transparent: true};
    var renderer = PIXI.autoDetectRenderer(w, h, args);
    // add the renderer drawing element to the dom
    container.appendChild(renderer.view);
    // create the root container of the scene graph
    var stage = new PIXI.Container();
    // the dimensions of a track
    var HEIGHT = 11;
    var PADDING = 2;
    // the bounds of the tracks "table"
    var NAME_OFFSET = 100;
    var right = 10;
    var SCALE = (w - (NAME_OFFSET + right)) / data.length;
    // draw the query position ruler
    var ruler = _createRuler(
      data.chromosome,
      data.length,
      SCALE,
      NAME_OFFSET,
      HEIGHT,
      PADDING
    );
    ruler.position.y = PADDING;
    stage.addChild(ruler);
    // create a container for the tracks "table"
    var table = new PIXI.Container();
    // draw the tracks
    for (var i = 0; i < data.tracks.length; i++) {
      // the track's color
      var c = _colors[i % _colors.length];
      // create the track
      var track = _createTrack(
        renderer,
        data.length,
        SCALE,
        NAME_OFFSET,
        HEIGHT,
        PADDING,
        c,
        data.tracks[i],
        nameClick
      );
      // position the track relative to the "table"
      track.position.y = table.height;
      // bestow the track its data
      track.data = data.tracks[i];
      // draw the track
      table.addChild(track);
    }
    // position the table relative to the ruler
    tableY = ruler.position.y + ruler.height + (3 * PADDING);
    table.position.y = tableY;
    // draw the table
    stage.addChild(table);
    // draw the viewport for the context currently being viewed
    if (options.viewport !== undefined) {
      var viewport = _createViewport(
        options.viewport.start,
        options.viewport.stop,
        SCALE,
        tableY,
        table.height
      );
      stage.addChild(viewport);
    }
    // run the render loop
    animate();
    // how to animate the view
    function animate () {
      renderer.render(stage);
      requestAnimationFrame(animate);
    }
    // resize the renderer with the dom container
    container.onresize = function (event) {
      var w = container.innerWidth;
      var h = container.innerHeight;
      // resize the canvas but keeps ratio the same
      renderer.view.style.width = w + "px";
      renderer.view.style.height = h + "px";
      // adjust the ratio
      renderer.resize(w, h);
    }
  }

  // revealing module pattern
  return {
    draw: draw
  };
})(PIXI);

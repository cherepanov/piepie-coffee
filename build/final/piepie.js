/**
 * Creates PiePie chart instance.
 *
 * @author Alexey Cherepanov<a@cherepanov.info>
 * 
 * @this {PiePie}
 * @constructor
 * @return {PiePie} PiePie object
 * 
 * @param {json} config configuration object
 *  @param {Integer}  config.x      x-coordinate location
 *  @param {Integer}  config.y      y-coordinate location
 *  @param {Integer}  chartWidth    chart canvas width
 *  @param {Integer}  chartHeight     chart canvas height
 *  @param {json}     config.background   background fill attributes
 *  @param {Array}    config.colors     array of sector colors in hex format
 *  @param {String}   config.dataURL    location of service
 *  @param {Integer}  config.rotation   pie rotation angle in degrees
*/
var PiePie;
PiePie = (function() {
  function PiePie(config) {
    var chartHeight, chartWidth, data, drawLegend, drawSector, label, legendHeight, legendPosX, legendPosY, legendWidth, onDrawFinish, paper, pieCenterX, pieCenterY, pieInnerRadius, pieOuterRadius, pieSpotRadius, rotation;
    chartWidth = config.width;
    chartHeight = config.height;
    pieCenterX = chartWidth / 2;
    pieCenterY = chartHeight / 2;
    pieInnerRadius = chartWidth * 0.2;
    pieOuterRadius = chartWidth * 0.35;
    pieSpotRadius = (pieOuterRadius + pieInnerRadius) * 0.53;
    data = {};
    label = "";
    rotation = (config.rotation ? config.rotation : 0);
    onDrawFinish = config.onDrawFinish || function() {};
    paper = Raphael(config.x, config.y, chartWidth, chartHeight);
    legendWidth = 0;
    legendHeight = 0;
    legendPosX = 0;
    legendPosY = 0;
    paper.rect(0, 0, chartWidth, chartHeight).attr(config.background);
    paper.customAttributes.arc = function(startAngle, endAngle, innerRadius, outerRadius) {
      var innerEndX, innerEndY, innerStartX, innerStartY, outerEndX, outerEndY, outerStartX, outerStartY;
      outerStartX = pieCenterX - outerRadius * Math.cosA(startAngle);
      outerStartY = pieCenterY - outerRadius * Math.sinA(startAngle);
      outerEndX = pieCenterX - outerRadius * Math.cosA(endAngle);
      outerEndY = pieCenterY - outerRadius * Math.sinA(endAngle);
      innerStartX = pieCenterX - innerRadius * Math.cosA(startAngle);
      innerStartY = pieCenterY - innerRadius * Math.sinA(startAngle);
      innerEndX = pieCenterX - innerRadius * Math.cosA(endAngle);
      innerEndY = pieCenterY - innerRadius * Math.sinA(endAngle);
      return {
        path: ["M", outerStartX, outerStartY, "A", outerRadius, outerRadius, 0, 0, 1, outerEndX, outerEndY, "L", innerEndX, innerEndY, "A", innerRadius, innerRadius, 0, 0, 0, innerStartX, innerStartY, "L", outerStartX, outerStartY, "Z"]
      };
    };
    $.getJSON(config.dataURL, function(res) {
      var animationQueue, pieOffset;
      pieOffset = 0;
      animationQueue = $({});
      data = res.data;
      label = res.label;
      drawLegend();
      $(data).each(function(idx, obj) {
        animationQueue.queue(function(next) {
          var callback, percent;
          percent = parseFloat(obj.value);
          callback = (idx === data.length - 1 ? onDrawFinish : next);
          drawSector(pieOffset, percent, config.colors[idx], callback);
          pieOffset += percent;
        });
      });
    });
    /**
     * @memberOf PiePie
     * @return {any} private class variable
    */
    PiePie.prototype.getPrivateProperty = function(name) {
      return eval(name);
    };
    drawSector = function(offset, percent, color, onAnimationEnd) {
      var baseColor, drawTip, endAngle, innerArc, outerAnimation, outerArc, set, spotColor, startAngle, tipAngle, tipCenterX, tipCenterY, tipEndX, tipEndY, tipLineEndX, tipOrientation;
      drawTip = function() {
        set.push(paper.circle(tipCenterX, tipCenterY, 3).attr({
          fill: "#000",
          stroke: "none"
        }));
        set.push(paper.path(["M", tipCenterX, tipCenterY, "L", tipEndX, tipEndY, "L", tipLineEndX, tipEndY]));
        set.push(paper.text(tipLineEndX + (tipOrientation ? 12 : -12), tipEndY - 10, percent * 100 + "%"));
      };
      startAngle = 180 * offset + rotation;
      endAngle = 180 * (offset + percent) + rotation;
      tipAngle = (startAngle + endAngle) / 2;
      tipCenterX = pieCenterX - pieSpotRadius * Math.cosA(tipAngle);
      tipCenterY = pieCenterY - pieSpotRadius * Math.sinA(tipAngle);
      tipEndX = pieCenterX - 1.1 * pieOuterRadius * Math.cosA(tipAngle);
      tipEndY = pieCenterY - 1.1 * pieOuterRadius * Math.sinA(tipAngle);
      tipOrientation = Math.cosA(tipAngle) > 0;
      tipLineEndX = tipEndX + (tipOrientation ? -30 : +30);
      baseColor = Raphael.rgb2hsb(color);
      spotColor = $.extend(baseColor);
      spotColor.b *= 0.9;
      set = paper.set();
      outerArc = paper.path().attr({
        arc: [startAngle, startAngle, pieSpotRadius - 1, pieOuterRadius]
      }).attr({
        fill: baseColor,
        stroke: "none"
      });
      innerArc = paper.path().attr({
        arc: [startAngle, startAngle, pieInnerRadius, pieSpotRadius + 1]
      }).attr({
        fill: spotColor,
        stroke: "none"
      });
      set.push(innerArc);
      set.push(outerArc);
      outerAnimation = Raphael.animation({
        arc: [startAngle, endAngle, pieSpotRadius - 1, pieOuterRadius]
      }, 1000, ">", function() {
        onAnimationEnd();
        drawTip();
        set.mouseover(function() {
          set.stop().animate({
            transform: "s1.1 1.1 " + pieCenterX + " " + pieCenterY
          }, 500, "elastic");
        });
        set.mouseout(function() {
          set.stop().animate({
            transform: ""
          }, 500, "elastic");
        });
      });
      outerArc.animate(outerAnimation);
      innerArc.animateWith(outerArc, outerAnimation, {
        arc: [startAngle, endAngle, pieInnerRadius, pieSpotRadius + 1]
      }, 1000, ">");
    };
    drawLegend = function() {
      var l, y;
      legendPosX = pieCenterX - pieOuterRadius;
      legendPosY = pieCenterY + chartHeight * 0.1;
      switch (true) {
        case (180 > rotation && rotation > 89):
          legendPosY = pieCenterY - data.length * 10;
          legendPosX = chartWidth * 0.05;
          break;
        case (270 > rotation && rotation > 179):
          legendPosY = chartHeight * 0.1;
          break;
        case rotation > 269:
          legendPosX = pieCenterX + chartWidth * 0.05;
          legendPosY = pieCenterY - data.length * 10;
          break;
      }
      l = paper.text(legendPosX, legendPosY, label.toUpperCase()).attr({
        font: "16px Arial",
        "font-weight": "bold",
        fill: "#000",
        "text-anchor": "start"
      });
      l = l.getBBox();
      legendWidth = l.width;
      legendHeight = l.height + 20;
      y = legendPosY;
      $(data).each(function(idx, obj) {
        var c, f;
        y += 20;
        legendHeight += 20;
        c = Raphael.rgb2hsb(config.colors[idx]);
        c.b *= 0.5;
        c = Raphael.hsb2rgb(c);
        f = "315-" + c + "-" + config.colors[idx];
        paper.rect(legendPosX, y, 20, 10).attr({
          fill: f,
          stroke: "none"
        });
        l = paper.text(legendPosX + 24, y + 4, obj.title.toUpperCase()).attr({
          "text-anchor": "start"
        });
        l = l.getBBox();
        return legendWidth = (l.width + 24 > legendWidth ? l.width + 24 : legendWidth);
      });
    };
  }
  return PiePie;
})();
###*
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
 *  @param {Integer}  config.width    chart canvas width
 *  @param {Integer}  config.height     chart canvas height
 *  @param {json}     config.background   background fill attributes
 *  @param {Array}    config.colors     array of sector colors in hex format
 *  @param {String}   config.dataURL    location of service
 *  @param {Integer}  config.rotation   pie rotation angle in degrees
###

class PiePie

  constructor: (config) ->

    pieCenterX = config.width / 2
    pieCenterY = config.height / 2
    pieInnerRadius = config.width * 0.2
    pieOuterRadius = config.width * 0.35
    pieSpotRadius = (pieOuterRadius + pieInnerRadius) * 0.53
    data = {}
    label = ""
    rotation = (if config.rotation then config.rotation else 0)
    onDrawFinish = config.onDrawFinish or ->
    paper = Raphael(config.x, config.y, config.width, config.height)
    legendWidth = 0
    legendHeight = 0

    paper.rect(0, 0, config.width, config.height).attr config.background
    paper.customAttributes.arc = (startAngle, endAngle, innerRadius, outerRadius) ->
      outerStartX = pieCenterX - outerRadius * Math.cosA(startAngle)
      outerStartY = pieCenterY - outerRadius * Math.sinA(startAngle)
      outerEndX = pieCenterX - outerRadius * Math.cosA(endAngle)
      outerEndY = pieCenterY - outerRadius * Math.sinA(endAngle)
      innerStartX = pieCenterX - innerRadius * Math.cosA(startAngle)
      innerStartY = pieCenterY - innerRadius * Math.sinA(startAngle)
      innerEndX = pieCenterX - innerRadius * Math.cosA(endAngle)
      innerEndY = pieCenterY - innerRadius * Math.sinA(endAngle)
      path: [ "M", outerStartX, outerStartY,
            "A", outerRadius, outerRadius, 0, 0, 1, outerEndX, outerEndY,
            "L", innerEndX, innerEndY,
            "A", innerRadius, innerRadius, 0, 0, 0, innerStartX, innerStartY,
            "L", outerStartX, outerStartY,
            "Z" ]
    
    $.getJSON config.dataURL, (res) ->
      pieOffset = 0
      animationQueue = $({})
      data = res.data
      label = res.label
      drawLegend()
      $(data).each (idx, obj) ->
        animationQueue.queue (next) ->
          percent = parseFloat(obj.value)
          callback = (if idx is data.length - 1 then onDrawFinish else next)
          drawSector pieOffset, percent, config.colors[idx], callback
          pieOffset += percent
          return
        return
      return

    PiePie.prototype.getPrivateProperty = (name) ->
      eval(name)

    drawSector = (offset, percent, color, onAnimationEnd) ->
  
      drawTip = ->
        set.push paper.circle(tipCenterX, tipCenterY, 3).attr(
          fill: "#000"
          stroke: "none"
        )
        set.push paper.path([ "M", tipCenterX, tipCenterY, "L", tipEndX, tipEndY, "L", tipLineEndX, tipEndY ])
        set.push paper.text(tipLineEndX + (if tipOrientation then 12 else -12), tipEndY - 10, percent * 100 + "%")
        return
  
      startAngle = 180 * offset + rotation
      endAngle = 180 * (offset + percent) + rotation
      tipAngle = (startAngle + endAngle) / 2
      tipCenterX = pieCenterX - pieSpotRadius * Math.cosA(tipAngle)
      tipCenterY = pieCenterY - pieSpotRadius * Math.sinA(tipAngle)
      tipEndX = pieCenterX - 1.1 * pieOuterRadius * Math.cosA(tipAngle)
      tipEndY = pieCenterY - 1.1 * pieOuterRadius * Math.sinA(tipAngle)
      tipOrientation = Math.cosA(tipAngle) > 0
      tipLineEndX = tipEndX + (if tipOrientation then -30 else +30)
      baseColor = Raphael.rgb2hsb(color)
      spotColor = $.extend(baseColor)
      spotColor.b *= 0.9
      set = paper.set()
        
      outerArc = paper.path().attr(arc: [ startAngle, startAngle, pieSpotRadius - 1, pieOuterRadius ]).attr(
        fill: baseColor
        stroke: "none"
      )
      innerArc = paper.path().attr(arc: [ startAngle, startAngle, pieInnerRadius, pieSpotRadius + 1 ]).attr(
        fill: spotColor
        stroke: "none"
      )
      set.push innerArc
      set.push outerArc
        
      outerAnimation = Raphael.animation(
        arc: [ startAngle, endAngle, pieSpotRadius - 1, pieOuterRadius ]
      , 1000, ">", ->
        onAnimationEnd()
        drawTip()
        set.mouseover ->
          set.stop().animate
            transform: "s1.1 1.1 " + pieCenterX + " " + pieCenterY, 500, "elastic"
          return
        set.mouseout ->
          set.stop().animate
            transform: "", 500, "elastic"
          return
        return
      )
        
      outerArc.animate outerAnimation
      innerArc.animateWith outerArc, outerAnimation,
        arc: [ startAngle, endAngle, pieInnerRadius, pieSpotRadius + 1 ], 1000, ">"
  
      return
  
    drawLegend = ->
      x = pieCenterX - pieOuterRadius
      y = pieCenterY + config.height * 0.1
      switch true
        when (180 > rotation > 89)
          y = pieCenterY - data.length * 10
          x = config.width * 0.1
          break
        when (270 > rotation > 179)
          y = config.height * 0.1
          break
        when (rotation > 269)
          x = pieCenterX + config.width * 0.05
          y = pieCenterY - data.length * 10
          break
      l = paper.text(x, y, label.toUpperCase()).attr(
        font: "16px Arial"
        "font-weight": "bold"
        fill: "#000"
        "text-anchor": "start"
      )
      l = l.getBBox()
      legendWidth = l.width
      legendHeight = l.height + 20
      $(data).each (idx, obj) ->
        y += 20
        legendHeight += 20
        c = Raphael.rgb2hsb(config.colors[idx])
        c.b *= 0.5
        c = Raphael.hsb2rgb(c)
        f = "315-" + c + "-" + config.colors[idx]
        paper.rect(x, y, 20, 10).attr
          fill: f
          stroke: "none"
      
        l = paper.text(x + 24, y + 4, obj.title.toUpperCase()).attr("text-anchor": "start")
        l = l.getBBox()
        legendWidth = (if l.width + 24 > legendWidth then l.width + 24 else legendWidth)
      return


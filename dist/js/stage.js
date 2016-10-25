;
;/* ========================================================================
 * Bootstrap: tooltip.js v3.3.6
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== 
 * ========================================================================
 * Copyright 2016 Tim Lauv (+ this.options.position)
 * ======================================================================== 
 */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.6'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    },
    position: 50 //relative position of arrow to top/left is 50%
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      //this.options.position is the relative position of arrow to content box top/left
      .css(isVertical ? 'left' : 'top', this.options.position * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type)
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var elOffset  = isBody ? { top: 0, left: 0 } : $element.offset()
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    //this.options.position is the relative position of arrow to content box top/left
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth * (this.options.position / 100) } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth * (this.options.position / 100) } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight * (this.options.position / 100), left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight * (this.options.position / 100), left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

;/* ========================================================================
 * Bootstrap: popover.js v3.3.6
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.6'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

;/**
 * This is where we extend the abilities of adding an enclosing div wrapper with specified class(className) for using of '^^^className'.
 * For example, the following illustration shows the input and output.
 *          +-----------+     +-----------------------------------------+
 *          | '^^^xyz', |     | <div class="xyz">                       |
 *          | '**ab**', |     |   <p><strong>ab</strong></p>            |
 *          | '~~~',    |     |   <pre>                                 |
 *          | 'cc',     | ==> |     <code class="hljs stylus">cc        |
 *          | 'dd',     |     |       <span class="hljs-tag">dd</span>  |
 *          | '~~~',    |     |     </code>                             |
 *          | '^^^'     |     |   </pre>                                |
 *          |           |     | </div>                                  |
 *          +-----------+     +-----------------------------------------+
 * Note: the div wrapper can't not be used recursively, for instance, you can not use it like:
 *          +-----------+
 *          | '^^^xyz', |
 *          | '^^^abc', |
 *          | '~~~',    |
 *          | 'dd',     |
 *          | '~~~',    |
 *          | '^^^',    |
 *          | '^^^'     |
 *          +-----------+
 * The following illustration indicate the typical flow how the whole bunch stuff works:
 *          
 *              +-----------+                                   +-----------+
 *              | Lex Rules |                                   | Renderer  |
 *              +-----------+                                   +-----------+
 *                    |                                               |
 *                    |                                               |
 *                    v                                               v
 *   +-----+     +-------+  Lexing(Lexer.token)   +--------+  Rendering Current Token     +--------+
 *   | src | --> | Lexer | ---------------------> | Parser | ---------------------------> | output |
 *   +-----+     +-------+                        +--------+                              +--------+
 *   
 * @author Zhizhen Fan
 * @created 2016.05.11
 * @updated 2016.05.17 (Tim Lauv)
 * 
 * Based on marked.js 0.3.5 by Christopher Jeffrey.
 */

;(function(){

  /**
   * Overwrite the static Lex method to add new rules.
   */
  marked.Lexer.lex = function(src, options){
    var lexer = new marked.Lexer(options);
    _.extend(lexer.rules, {
      // Append the new added rules here
      clsfences: /^ *(\^{3,}|\!{3,}) *(\S+(?: +\S+)*)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/
    });
    return lexer.lex(src);
  };


  /**
   * Overwrite the Lexing function to apply new rules in the loop.
   */
  marked.Lexer.prototype.token = function(src, top, bq){
    var src = src.replace(/^ +$/gm, ''),
      next, loose, cap, bull, b, item, space, i, l;

    while(src){
      // newline
      if(cap = this.rules.newline.exec(src)){
        src = src.substring(cap[0].length);
        if(cap[0].length > 1){
          this.tokens.push({
            type: 'space'
          });
        }
      }

      // code
      if(cap = this.rules.code.exec(src)){
        src = src.substring(cap[0].length);
        cap = cap[0].replace(/^ {4}/gm, '');
        this.tokens.push({
          type: 'code',
          text: !this.options.pedantic ? cap.replace(/\n+$/, '') : cap
        });
        continue;
      }

      // fences (gfm)
      if(cap = this.rules.fences.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'code',
          lang: cap[2],
          text: cap[3] || ''
        });
        continue;
      }

      // fences for div wrapper with specified class
      if(cap = this.rules.clsfences.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'clswrapper',
          cls: cap[2],
          text: cap[3]
        });
        continue;
      }

      // heading
      if(cap = this.rules.heading.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[1].length,
          text: cap[2]
        });
        continue;
      }

      // table no leading pipe (gfm)
      if(top && (cap = this.rules.nptable.exec(src))){
        src = src.substring(cap[0].length);

        item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3].replace(/\n$/, '').split('\n')
        };

        for(i = 0; i < item.align.length; i++){
          if(/^ *-+: *$/.test(item.align[i])){
            item.align[i] = 'right';
          } else if(/^ *:-+: *$/.test(item.align[i])){
            item.align[i] = 'center';
          } else if(/^ *:-+ *$/.test(item.align[i])){
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }

        for(i = 0; i < item.cells.length; i++){
          item.cells[i] = item.cells[i].split(/ *\| */);
        }

        this.tokens.push(item);

        continue;
      }

      // lheading
      if(cap = this.rules.lheading.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[2] === '=' ? 1 : 2,
          text: cap[1]
        });
        continue;
      }

      // hr
      if(cap = this.rules.hr.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'hr'
        });
        continue;
      }

      // blockquote
      if(cap = this.rules.blockquote.exec(src)){
        src = src.substring(cap[0].length);

        this.tokens.push({
          type: 'blockquote_start'
        });

        cap = cap[0].replace(/^ *> ?/gm, '');

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
        this.token(cap, top, true);

        this.tokens.push({
          type: 'blockquote_end'
        });

        continue;
      }

      // list
      if(cap = this.rules.list.exec(src)){
        src = src.substring(cap[0].length);
        bull = cap[2];

        this.tokens.push({
          type: 'list_start',
          ordered: bull.length > 1
        });

        // Get each top-level item.
        cap = cap[0].match(this.rules.item);

        next = false;
        l = cap.length;
        i = 0;

        for(; i < l; i++){
          item = cap[i];

          // Remove the list item's bullet
          // so it is seen as the next token.
          space = item.length;
          item = item.replace(/^ *([*+-]|\d+\.) +/, '');

          // Outdent whatever the
          // list item contains. Hacky.
          if(~item.indexOf('\n ')){
            space -= item.length;
            item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
          }

          // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.
          if(this.options.smartLists && i !== l - 1){
            //was using block.bullet, fixed (Tim Lauv)
            b = this.rules.bullet.exec(cap[i + 1])[0];
            if(bull !== b && !(bull.length > 1 && b.length > 1)){
              src = cap.slice(i + 1).join('\n') + src;
              i = l - 1;
            }
          }

          // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.
          loose = next || /\n\n(?!\s*$)/.test(item);
          if(i !== l - 1){
            next = item.charAt(item.length - 1) === '\n';
            if(!loose) loose = next;
          }

          this.tokens.push({
            type: loose ? 'loose_item_start' : 'list_item_start'
          });

          // Recurse.
          this.token(item, false, bq);

          this.tokens.push({
            type: 'list_item_end'
          });
        }

        this.tokens.push({
          type: 'list_end'
        });

        continue;
      }

      // html
      if(cap = this.rules.html.exec(src)){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: this.options.sanitize ? 'paragraph' : 'html',
          pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
          text: cap[0]
        });
        continue;
      }

      // def
      if((!bq && top) && (cap = this.rules.def.exec(src))){
        src = src.substring(cap[0].length);
        this.tokens.links[cap[1].toLowerCase()] = {
          href: cap[2],
          title: cap[3]
        };
        continue;
      }

      // table (gfm)
      if(top && (cap = this.rules.table.exec(src))){
        src = src.substring(cap[0].length);

        item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
        };

        for(i = 0; i < item.align.length; i++){
          if(/^ *-+: *$/.test(item.align[i])){
            item.align[i] = 'right';
          } else if(/^ *:-+: *$/.test(item.align[i])){
            item.align[i] = 'center';
          } else if(/^ *:-+ *$/.test(item.align[i])){
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }

        for(i = 0; i < item.cells.length; i++){
          item.cells[i] = item.cells[i]
            .replace(/^ *\| *| *\| *$/g, '')
            .split(/ *\| */);
        }

        this.tokens.push(item);

        continue;
      }

      // top-level paragraph
      if(top && (cap = this.rules.paragraph.exec(src))){
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'paragraph',
          text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
        });
        continue;
      }

      // text
      if(cap = this.rules.text.exec(src)){
        // Top-level should never reach here.
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'text',
          text: cap[0]
        });
        continue;
      }

      if(src){
        throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
      }
    }

    return this.tokens;
  };

  /**
   * Overwrite the function to apply the new renderers.
   */
  marked.Parser.prototype.tok = function(){
    switch(this.token.type){
      case 'space':
        return '';
      case 'hr':
        return this.renderer.hr();
      case 'heading':
        return this.renderer.heading(
          this.inline.output(this.token.text),
          this.token.depth,
          this.token.text);
      case 'code':
        return this.renderer.code(this.token.text,
          this.token.lang,
          this.token.escaped);
      case 'clswrapper':
        return this.renderer.clswrapper(this.token.cls,
          this.token.text,
          this.token.escaped);
      case 'table':
        var header = '',
          body = '',
          i, row, cell, flags, j;

        // header
        cell = '';
        for(i = 0; i < this.token.header.length; i++){
          flags = {
            header: true,
            align: this.token.align[i]
          };
          cell += this.renderer.tablecell(
            this.inline.output(this.token.header[i]), {
              header: true,
              align: this.token.align[i]
            }
          );
        }
        header += this.renderer.tablerow(cell);

        for(i = 0; i < this.token.cells.length; i++){
          row = this.token.cells[i];

          cell = '';
          for(j = 0; j < row.length; j++){
            cell += this.renderer.tablecell(
              this.inline.output(row[j]), {
                header: false,
                align: this.token.align[j]
              }
            );
          }

          body += this.renderer.tablerow(cell);
        }
        return this.renderer.table(header, body);
      case 'blockquote_start':
        var body = '';

        while(this.next().type !== 'blockquote_end'){
          body += this.tok();
        }

        return this.renderer.blockquote(body);
      case 'list_start':
        var body = '',
          ordered = this.token.ordered;

        while(this.next().type !== 'list_end'){
          body += this.tok();
        }

        return this.renderer.list(body, ordered);
      case 'list_item_start':
        var body = '';

        while(this.next().type !== 'list_item_end'){
          body += this.token.type === 'text' ? this.parseText() : this.tok();
        }

        return this.renderer.listitem(body);
      case 'loose_item_start':
        var body = '';

        while(this.next().type !== 'list_item_end'){
          body += this.tok();
        }

        return this.renderer.listitem(body);
      case 'html':
        var html = !this.token.pre && !this.options.pedantic ? this.inline.output(this.token.text) : this.token.text;
        return this.renderer.html(html);
      case 'paragraph':
        return this.renderer.paragraph(this.inline.output(this.token.text));
      case 'text':
        return this.renderer.paragraph(this.parseText());
    }
  };

  /**
   * Extend the Renderer with new type and its handler.
   */
  _.extend(marked.Renderer.prototype, {
    clswrapper: function(cls, text){
      return '<div class="' + cls + '">' + marked.Parser.parse(marked.Lexer.lex(text, this.options), this.options) + '</div>\n';
    }
  });

})();
;/**
 * Environment setup (global)
 *
 * @author Tim Lauv
 */

;(function($, _, Swag, underscoreString, Marionette){

	/**
	 * Global shortcuts
	 * ----------------
	 * $window
	 * $document
	 * $head
	 * $body
	 */
	_.each(['document', 'window'], function(coreDomObj){
		window['$' + coreDomObj] = $(window[coreDomObj]);
	});
	_.each(['body', 'head'], function(coreDomWrap){
		window['$' + coreDomWrap] = $(coreDomWrap);
	});

	/**
	 * 3rd party lib init
	 * ---------------------------------
	 */
	Swag.registerHelpers();
	
	_.isPlainObject = function(o){
		return _.isObject(o) && !_.isFunction(o) && !_.isArray(o) && !_.isElement(o);
	};
	_.string = underscoreString;

	/**
	 * Define top level module containers
	 * ----------------------------------
	 * 				App
	 * 				 |
	 * 			   -----
	 * 			  /     \
	 * 			Core    Util
	 * 			 |       |
	 * 			 |      ...
	 * 		Resuable
	 * 		  |Context|
	 * 		  |Widget | --fallback--> View (Regional)
	 * 		  |Editor |
	 * 		Remote (RESTful)
	 * 		Lock
	 */
	window.app = window.Application = new Marionette.Application();
	_.each(['Core', 'Util'], function(coreModule){
		Application.module(coreModule);
	});

})(jQuery, _, Swag, s, Marionette);

;/*
 * Main application definition.
 *
 * Usage
 * -----------------------
 * ###How to start my app?
 * 
 * 1. app.setup({config});
 * 2. app.run([hybrid ready e]);
 * 
 * Suggested additional events are:
 *   	app:error - app.onError ==> window.onerror in hybrid mode.
 *    	app:login - app.onLogin [not-defined]
 *     	app:logout - app.onLogout [not-defined]
 *      app:server-push - app.onServerPush [not-defined]
 * You can define them in a fn through app.addInitializer(fn(options));
 * 
 * 
 * Global vars
 * ------------
 * $window
 * $document
 * $body, $head
 * Application
 *
 * 
 * Global coop events
 * ------------
 * window-resized
 * window-scroll
 * context-switched
 * 
 *
 * @author Tim Lauv
 * @created 2014.02.17
 * @updated 2015.08.03
 * @updated 2016.03.31
 */

;(function(app){

	//setup configures, navigation mechanisms (both ctx switch and #history) and 1st(main) view.
	app.setup = function(config){
		
		//0. Re-run app.setup will only affect app.config variable.
		if(app.config) {
			_.extend(app.config, config);
			return;
		}

		//1. Configure.
		app.config = _.extend({

			//------------------------------------------app.mainView-------------------------------------------
			//mainView has limited ability as a generic view (supports data/action, but can not be form, canvas or having co-ops)
			template: undefined,
			layout: undefined,
			//e.g:: have a unified layout template.
			/**
			 * ------------------------
			 * |		top 	      |
			 * ------------------------
			 * | left | center | right|
			 * |	  |        |      |
			 * |	  |        |      |
			 * |	  |        |      |
			 * |	  |        |      |
			 * ------------------------
			 * |		bottom 	      |
			 * ------------------------		 
			 * 
			 * == --> layout: ['1:#top', ['5', ['1:left', '4:center', '1:right']], '1:.bottom, .bottom2, .bottom3']
			 */
			data: undefined,
			actions: undefined,
			navRegion: 'contexts', //alias: contextRegion
			//---------------------------------------------------------------------------------------------
			defaultView: undefined, //alias: defaultContext, this is the context (name) the application will sit on upon loading.
			icings: {}, //various fixed overlaying regions for visual prompts ('name': {top, bottom, height, left, right, width})
						//alias -- curtains			
			fullScreen: false, //This will put <body> to be full screen sized (window.innerHeight).
	        websockets: [], //Websocket paths to initialize with (single path with multi-channel prefered).
	        baseAjaxURI: '', //Modify this to fit your own backend apis. e.g index.php?q= or '/api',
	        viewTemplates: 'static/template', //this is assisted by the build tool, combining all the *.html handlebars templates into one big json.
			viewSrcs: undefined, //set this to enable reusable view dynamic loading.
			i18nResources: 'static/resource', //this the the default location where our I18N plugin looks for locale translations.
			i18nTransFile: 'i18n.json', //can be {locale}.json
			i18nLocale: '', //if you really want to force the app to certain locale other than browser preference. (Still override-able by ?locale=.. in url)
			rapidEventDelay: 200, //in ms this is the rapid event delay control value shared within the application (e.g window resize, app.throttle, app.debounce).
			timeout: 5 * 60 * 1000, //general communication timeout (ms). for app.remote and $.fileupload atm.
			//------------------------------------------3rd-party options----------------------------------
			marked: {
				gfm: true,
				tables: true,
				breaks: true,
				pedantic: false, //don't use original markdown.pl choices
				sanitize: true,
				smartLists: true,
				smartypants: false //don't be too smart on the punctuations
			},
			hljs: {
				languages: ['c', 'python', 'javascript', 'html', 'css']
			}
		}, config);
		
		//2. Global App Events Listener Dispatcher
		app.Util.addMetaEvent(app, 'app');

		//3. Setup the application with content routing (navigation).
		// - use app:navigate (path) at all times when navigate between contexts & views.
		app.onNavigate = function(options, silent){
			if(!app.available()) {
				app.trigger('app:locked', options);
				return;
			}

			var path = '', opt = options || '';
			if(_.isString(opt)){
				path = opt;
			}else {
				//backward compatibility 
				path = _.string.rtrim([opt.context || app.currentContext.name, opt.module || opt.subpath].join('/'), '/');
			}
			if(silent || app.hybridEvent)
				navigate(path);//hybrid app will navigate using the silent mode.
			else
				window.location.hash = 'navigate/' + path;
		};

		app.onContextGuardError = function(error, ctxName){
			console.error('DEV:Context-Guard-Error:', ctxName, error);
		};

		//---navigation worker---
			function navigate(path){
				path = _.compact(String(path).split('/'));
				if(path.length <= 0) throw new Error('DEV::Application::navigate() Navigation path empty...');

				var context = path.shift();

				if(!context) throw new Error('DEV::Application::navigate() Empty context/view name...');
				var TargetContext = app.get(context, 'Context', true); //fallback to use view if context not found.
				if(!TargetContext) throw new Error('DEV::Application::navigate() You must have the required context/view ' + context + ' defined...');			
				if(!app.currentContext || app.currentContext.name !== context) {
					
					//re-create target context upon switching
					var targetCtx = new TargetContext(), guardError;

					//allow context to guard itself (e.g for user authentication)
					if(targetCtx.guard) guardError = targetCtx.guard();
					if(guardError) {
						app.trigger('app:context-guard-error', guardError, targetCtx.name);
						app.trigger('app:navigation-aborted', targetCtx.name);
						return;
					}
					//allow context to check/do certain stuff before navigated to
					targetCtx.trigger('context:before-navigate-to');

					//save your context state within onNavigateAway()
					if(app.currentContext) app.currentContext.trigger('context:navigate-away'); 
					//prepare and show this new context					
					app.Util.addMetaEvent(targetCtx, 'context');
					var navRegion = app.config.navRegion || app.config.contextRegion;
					var targetRegion = app.mainView.getRegion(navRegion);
					if(!targetRegion) throw new Error('DEV::Application::navigate() You don\'t have region \'' + navRegion + '\' defined');		
					
					//note that .show() is guaranteed to happen after region enter/exit effects
					targetRegion.once('show', function(){
						app.currentContext = targetCtx;
						//fire a notification to app as meta-event.
						app.trigger('app:context-switched', app.currentContext.name);
						app.coop('context-switched', app.currentContext.name, {ctx: app.currentContext, subpath: path.join('/')});
						//notify regional views in the context (views further down in the nav chain)
						app.currentContext.trigger('context:navigate-chain', path);
					});
					targetRegion.show(targetCtx);
					//note that 'view:navigate-to' triggers after '(view:show -->) region:show';
				}else
					//notify regional views in the context (with old flag set to true)
					app.currentContext.trigger('context:navigate-chain', path, true);

			}
		//-----------------------

		//4 Put up Main View and activate Routing (href = #navigate/...) AFTER running all the initializers user has defined.
		app.on("app:initialized", function(options){

			//a. Put main template into position.
			app.addRegions({
				'region-app': '[region="app"]'
			});
			//Warning: calling ensureEl() on the app region will not work like regions in layouts.
			//(Bug??: the additional <div> under the app region is somehow inevitable atm...)
			app.trigger('app:before-mainview-ready');
			if(!app.config.layout)
				app.mainView = app.mainView || app.view({
					name: 'Main',
					data: app.config.data,
					actions: app.config.actions,
					template: app.config.template || ('<div region="' + (app.config.navRegion || app.config.contextRegion) + '"></div>'),
				}, true);
			else
				app.mainView = app.mainView || app.view({
					name: 'Main',
					data: app.config.data,
					actions: app.config.actions,
					layout: app.config.layout,
				}, true);
			app.getRegion('region-app').show(app.mainView).$el.css({height: '100%', width: '100%'});
			//Caveat: if you use app.config.data, the mainview-ready event won't be the real `data-rendered ready`.
			app.trigger('app:mainview-ready');

			//b. Create the fixed overlaying regions according to app.config.icings (like a cake, yay!)
			var icings = {};
			_.each(_.extend({}, app.config.icings, app.config.curtains), function(cfg, name){
				if(name === 'app') return;

				var irUID = _.uniqueId('app-icing-');
				$body.append($('<div id="' + irUID + '" style="position:fixed"></div>').css(cfg).hide()); //default on hidden
				icings[['icing', 'region', name].join('-')] = '#' + irUID;
			});
			app.addRegions(icings);
			app.icing = function(name, flag){
				var ir = app.getRegion(['icing', 'region', name].join('-'));
				ir.ensureEl();
				if(flag === false)
					ir.$el.hide();
				else
					ir.$el.show();
				return ir;
			}; 
			app.curtain = app.icing; //alias: curtain()

			//c. init client page router and history:
			var Router = Backbone.Marionette.AppRouter.extend({
				appRoutes: {
					'navigate/*path' : 'navigateTo', //navigate to a context and signal it about *module (can be a path for further navigation within)
				},
				controller: {
					navigateTo: function(path){
						app.navigate(path, true); //will skip updating #hash since the router is triggered by #hash change.
					},
				}
			});

			app.router = new Router();
			if(Backbone.history)
				Backbone.history.start();

			//d. Auto navigate to init context (view that gets put in mainView's navRegion)
			app.config.defaultContext = app.config.defaultView || app.config.defaultContext;
			if(!window.location.hash && app.config.defaultContext)
				app.navigate(app.config.defaultContext);
		});

		return app;
	};

	/**
	 * Define app init function upon doc.ready
	 * -----------------------------------------
	 * We support using stage.js in a hybrid app
	 * 
	 */
	app.run = function(hybridEvent){

		hybridEvent = (hybridEvent === true) ? 'deviceready' : hybridEvent;

		//called upon doc.ready
		function kickstart(){

			//1. Check if we need 'fast-click' on mobile plateforms
			if(Modernizr.mobile)
				FastClick.attach(document.body);

			//2. Track window resize
			function trackScreenSize(e, silent){
				var screenSize = {h: $window.height(), w: $window.width()};
				if(!validScreenSize(screenSize)) return;

				////////////////cache the screen size/////////////
				app.screenSize = screenSize;
				//////////////////////////////////////////////////
				if(app.config.fullScreen){
					$body.height(screenSize.h);
					$body.width(screenSize.w);
				}
				if(!silent){
					app.trigger('app:resized', screenSize);
					app.coop('window-resized', screenSize);
				}
			}
			function validScreenSize(size){
				return size.h > 0 && size.w > 0;
			}
			$window.on('resize', app.debounce(trackScreenSize));
			//check screen size, trigger app:resized and get app.screenSize ready.
			app._ensureScreenSize = function(done){
				trackScreenSize(); 
				if(!app.screenSize) _.delay(app._ensureScreenSize, app.config.rapidEventDelay/4, done);
				else done();
			};
			//align $body with screen size if app.config.fullScreen = true
			if(app.config.layout)
				app.config.fullScreen = true;
			if(app.config.fullScreen){
				$body.css({
					overflow: 'hidden',
					margin: 0,
					padding: 0					
				});
			}

			//3. Track window scroll
			function trackScroll(){
				var top = $window.scrollTop();
				app.trigger('app:scroll', top);
				app.coop('window-scroll', top);
			}
			$window.on('scroll', app.throttle(trackScroll));

			//4 Load Theme css & View templates & i18n translations
			var theme = app.uri(window.location.toString()).search(true).theme || app.config.theme;
			//4.0 Dynamic theme (skipped)
			if(theme){
				console.warn('DEV::Application::theme is now deprecated, please use theme css directly in <head>');
			}

			//4.1 Inject template pack
			app.addInitializer(function(){
				//based on path in app.config.viewTemplates
				return app.inject.tpl('all.json');
			});

			//4.2 Activate i18n
			app.addInitializer(function(){
				return I18N.init({
					locale: app.config.i18nLocale,
					resourcePath: app.config.i18nResources,
					translationFile: app.config.i18nTransFile
				});
			});

			//5 Register websockets
			_.each(app.config.websockets, function(wspath){
				app.ws(wspath); //we don't wait for websocket hand-shake
			});

			//6. Start the app --> pre init --> initializers --> post init(router setup)
			app._ensureScreenSize(function(){
				app.start();				
			});

		}

		//hook up desktop/mobile doc.ready respectively.
		if(hybridEvent){
			//Mobile development
			app.hybridEvent = hybridEvent; //window.cordova is probably true.
			window.onerror = function(errorMsg, target, lineNum){
				app.trigger('app:error', {
					errorMsg: errorMsg,
					target: target,
					lineNum: lineNum
				});
			};
		    app.onError = function(eMsg, target, lineNum){
		    	//override this to have remote debugging assistant
		        console.error(eMsg, target, lineNum);
		    };
			//!!VERY IMPORTANT!! Disable 'touchmove' on non .scrollable elements
			document.addEventListener("touchmove", function(e) {
			  if (!e.target.classList.contains('scrollable')) {
			    // no more scrolling
			    e.preventDefault();
			  }
			}, false);
			document.addEventListener(hybridEvent, function(){
				$document.ready(kickstart);
			}, false);
		}else
			$document.ready(kickstart);

		return app;

	};

})(Application);




;/**
 * Framework APIs (global - app.*)
 *
 * Note: View APIs are in view.js (view - view.*)
 * 
 * @author Tim Lauv
 */

;(function(app){

	/**
	 * Universal app object creation api entry point
	 * ----------------------------------------------------
	 * @deprecated Use the detailed apis instead.
	 */
	app.create = function(type, config){
		console.warn('DEV::Application::create() method is deprecated, use methods listed in ', app._apis, ' for alternatives');
	};

	/**
	 * Detailed api entry point
	 * ------------------------
	 * If you don't want to use .create() there you go:
	 */
	_.extend(app, {

		//----------------view------------------
		//pass in [name,] options to define (named will be registered)
		//pass in [name] to get (name can be of path form)
		//pass in [name,] instance to create (named will be registered again)
		view: function(name /*or options*/, options /*or instance flag*/){
			if(_.isString(name)){
				if(_.isBoolean(options) && options) return app.Core.View.create(name);
				if(_.isPlainObject(options)) return app.Core.View.register(name, options);
			}

			if(_.isPlainObject(name)){
				var instance = options;
				options = name;
				var Def = options.name ? app.Core.View.register(options) : Backbone.Marionette[options.type || 'Layout'].extend(options);

				if(_.isBoolean(instance) && instance) return new Def();
				return Def;
			}

			return app.Core.View.get(name);
		},

		//pass in [name,] options to register (always requires a name)
		//pass in [name] to get (name can be of path form)
		context: function(name /*or options*/, options){
			if(!options) {
				if(_.isString(name) || !name)
					return app.Core.Context.get(name);
				else
					options = name;
			}
			else
				_.extend(options, {name: name});
			return app.Core.Context.register(options);
		},

		//pass in name, factory to register
		//pass in name, options to create
		//pass in [name] to get (name can be of path form)
		widget: function(name, options /*or factory*/){
			if(!options) return app.Core.Widget.get(name);
			if(_.isFunction(options))
				//register
				return app.Core.Widget.register(name, options);
			return app.Core.Widget.create(name, options);
			//you can not register the definition when providing name, options.
		},

		//pass in name, factory to register
		//pass in name, options to create
		//pass in [name] to get (name can be of path form)
		editor: function(name, options /*or factory*/){
			if(!options) return app.Core.Editor.get(name);
			if(_.isFunction(options))
				//register
				return app.Core.Editor.register(name, options);
			return app.Core.Editor.create(name, options);
			//you can not register the definition when providing name, options.
		},

			//@deprecated---------------------
			regional: function(name, options){
				options = options || {};
				if(_.isString(name))
					_.extend(options, {name: name});
				else
					_.extend(options, name);
				console.warn('DEV::Application::regional() method is deprecated, use .view() instead for', options.name || options /*as an indicator of anonymous view*/);
				return app.view(options, !options.name);
			},
			//--------------------------------
		
		//(name can be of path form)
		has: function(name, type){
			if(type)
				return app.Core[type] && app.Core[type].has(name);

			_.each(['Context', 'View', 'Widget', 'Editor'], function(t){
				if(!type && app.Core[t].has(name))
					type = t;
			});

			return type;
		},

		//(name can be of path form)
		//always return View definition.
		get: function(name, type, fallback /*in effect only if you specify type*/){
			if(!name)
				return {
					'Context': app.Core.Context.get(),
					'View': app.Core.View.get(),
					'Widget': app.Core.Widget.get(),
					'Editor': app.Core.Editor.get()
				};

			var Reusable, t = type || 'View';

			//try local
			Reusable = (app.Core[t] && app.Core[t].get(name)) || (fallback && app.Core['View'].get(name));
			
			//try remote, if we have app.viewSrcs set to load the View def dynamically
			if(!Reusable && app.config && app.config.viewSrcs){
				app.inject.js(
					_.compact([app.config.viewSrcs, t.toLowerCase(), app.nameToPath(name)]).join('/') + '.js',
					true //sync
				).done(function(){
					app.debug(t, name, 'injected', 'from', app.config.viewSrcs);
					Reusable = app.get(name, t);
				}).fail(function(jqXHR, settings, e){
					if(!fallback || (t === 'View'))
						throw new Error('DEV::Application::get() can NOT load definition for ' + name + ' - [' + e + ']');
					else
						Reusable = app.get(name, 'View');
				});
			}

			return Reusable;
		},

		coop: function(event, options){
			app.trigger('app:coop', event, options);
			app.trigger('app:coop-' + event, options);
			return app;
		},

		pathToName: function(path){
			if(!_.isString(path)) throw new Error('DEV::Application::pathToName() You must pass in a valid path string.');
			if(_.contains(path, '.')) return path;
			return path.split('/').map(_.string.humanize).map(_.string.classify).join('.');
		},

		nameToPath: function(name){
			if(!_.isString(name)) throw new Error('DEV::Application::nameToPath() You must pass in a Reusable view name.');
			if(_.contains(name, '/')) return name;
			return name.split('.').map(_.string.humanize).map(_.string.slugify).join('/');
		},

		//----------------navigation-----------
		navigate: function(options, silent){
			return app.trigger('app:navigate', options, silent);
		},	

		//-----------------mutex---------------
		lock: function(topic){
			return app.Core.Lock.lock(topic);
		},

		unlock: function(topic){
			return app.Core.Lock.unlock(topic);
		},

		available: function(topic){
			return app.Core.Lock.available(topic);
		},

		//-----------------remote data------------
		
		//returns jqXHR object (use promise pls)
		remote: function(options /*or url*/, payload, restOpt){
			options = options || {};
			if(options.payload || payload){
				payload = options.payload || payload;
				return app.Core.Remote.change(options, _.extend({payload: payload}, restOpt));
			}
			else
				return app.Core.Remote.get(options, restOpt);
		},
		
		download: function(ticket){
			return app.Util.download(ticket);
		},

		//data push 
		//(ws channels)
		_websockets: {},
		/**
		 * returns a promise.
		 * 
		 * Usage
		 * -----
		 * register: app.config.websockets [] or app.ws(socketPath);
		 * receive (e): view.coop['ws-data-[channel]'] or app.onWsData = custom fn;
		 * send (json): app.ws(socketPath)
		 * 								.then(function(ws){ws.channel(...).json({...});}); default per channel data
		 * 								.then(function(ws){ws.send(); or ws.json();}); anything by any contract
		 * e.websocket = ws in .then(function(ws){})
		 *
		 * Default messaging contract
		 * --------------------------
		 * json {channel: '..:..', payload: {.data.}} through ws.channel('..:..').json({.data.})
		 */
		ws: function(socketPath){
			if(!Modernizr.websockets) throw new Error('DEV::Application::ws() Websocket is not supported by your browser!');
			socketPath = socketPath || '/ws';
			var d = $.Deferred();
			if(!app._websockets[socketPath]) { 

				app._websockets[socketPath] = new WebSocket("ws://" + location.host + socketPath);
				//events: 'open', 'error', 'close', 'message' = e.data
				//apis: send(), +json(), +channel().json(), close()

				app._websockets[socketPath].json = function(data){
					app._websockets[socketPath].send(JSON.stringify(data));
				};
				app._websockets[socketPath].channel = function(channel){
					return {
						json: function(data){
							app._websockets[socketPath].json({
								channel: channel,
								payload: data
							});
						}
					};
				};
				app._websockets[socketPath].onclose = function(){
					app._websockets[socketPath] = undefined;
				};
				app._websockets[socketPath].onopen = function(){
					return d.resolve(app._websockets[socketPath]);
				};

				//general ws data stub, override this through app.ws(path).then(function(ws){ws.onmessage=...});
				//Dev Server will always send default json contract string {"channel": "...", "payload": "..."}
				app._websockets[socketPath].onmessage = function(e){
					//opt a. override app.onWsData to active otherwise
					app.trigger('app:ws-data', {websocket: app._websockets[socketPath], path: socketPath, raw: e.data});
					//opt b. use global coop event 'ws-data-[channel]' in views directly (default json contract)
					try {
						var data = JSON.parse(e.data);
						app.coop('ws-data-' + data.channel, data.payload, {websocket: app._websockets[socketPath], path: socketPath});
					}catch(ex){
						console.warn('DEV::Application::ws() Websocket is getting non-default {channel: ..., payload: ...} json contract strings...');
					}
				};
				
			}else
				d.resolve(app._websockets[socketPath]);
			return d.promise();
		},

		//data polling 
		//(through later.js) and emit data events/or invoke callback
		_polls: {},
		poll: function(url /*or {options} for app.remote()*/, occurrence, coopEvent /*or callback*/) {
		    //stop everything
		    if (url === false)
		        return _.each(this._polls, function(card) {
		            card.cancel();
		        });

		    var schedule;
		    if (_.isString(occurrence)) {
		        schedule = app.later.parse.text(occurrence);
		        if (schedule.error !== -1)
		            throw new Error('DEV::Application::poll() occurrence string unrecognizable...');
		    } else if (_.isPlainObject(occurrence))
		        schedule = occurrence;
		    else //number
		        schedule = Number(occurrence);

		    //make a key from url, or {url: ..., params/querys}
		    var key = url;
		    if (_.isPlainObject(key))
		        key = [key.url, _.reduce((_.map(key.params || key.querys, function(qV, qKey) {
		            return [qKey, qV].join('='); 
		        })).sort(), function(qSignature, more) {
		            return [more, qSignature].join('&');
		        }, '')].join('?');

		    //cancel polling
		    if (occurrence === false) {
		        if (this._polls[key])
		            return this._polls[key].cancel();
		        console.warn('DEV::Application::poll() No polling card registered yet for ' + key);
		        return;
		    }

		    //cancel previous polling
		    if (this._polls[key])
		        this._polls[key].cancel();

		    //register polling card
		    if (!occurrence || !coopEvent)
		        throw new Error('DEV::Application::poll() You must specify an occurrence and a coop event or callback...');
		    var card = {
		        _key: key,
		        url: url,
		        eof: coopEvent,
		        timerId: 'unknown',
		        failed: 0,
		        valid: true,
		    };
		    this._polls[key] = card;

		    var call = _.isNumber(schedule) ? window.setTimeout : app.later.setTimeout;
		    var worker = function() {
		        app.remote(url).done(function(data) {
		            //callback
		            if (_.isFunction(card.eof))
		                card.eof(data, card);
		            //coop event
		            else
		                app.coop('poll-data-' + card.eof, data, card);
		        }).fail(function() {
		            card.failed++;
		            //Warning: Hardcoded 3 attemps here!
		            if (card.failed >= 3) card.cancel();
		        }).always(function() {
		            //go schedule the next call
		            if (card.valid)
		                card.timerId = call(worker, schedule);
		        });
		    };
		    //+timerType
		    card.timerType = (call === window.setTimeout) ? 'native' : 'later.js';
		    //+timerId
		    card.timerId = call(worker, schedule);
		    //+cancel()
		    var that = this;
		    card.cancel = function() {
		        if (this.timerType === 'native')
		            window.clearTimeout(this.timerId);
		        else
		            this.timerId.clear();
		        this.valid = false;
		        delete that._polls[this._key];
		    };
		},

		//-----------------dispatcher/observer/cache----------------
		dispatcher: function(obj){ //+on/once, off; +listenTo/Once, stopListening; +trigger;
			var dispatcher;
			if(_.isPlainObject(obj))
				dispatcher = _.extend(obj, Backbone.Events);
			else
				dispatcher = _.clone(Backbone.Events);
			dispatcher.dispose = function(){
				this.off();
				this.stopListening();
			};
			return dispatcher;
		}, reactor: function(){ return app.dispatcher.apply(this, arguments); }, //alias: reactor

		model: function(data){
			//return new Backbone.Model(data);
			//Warning: Possible performance impact...
			return new Backbone.DeepModel(data);
			/////////////////////////////////////////
		},

		collection: function(data){
			if(data && !_.isArray(data))
				throw new Error('DEV::Application::collection You need to specify an array to init a collection');
			return new Backbone.Collection(data);
		},

		//selectn
		extract: function(keypath, from){
			return selectn(keypath, from);
		},

		//----------------url params---------------------------------
		param: function(key, defaultVal){
			var params = URI.parseQuery(app.uri(window.location.href).search()) || {};
			if(key) return params[key] || defaultVal;
			return params;
		},
		
		//----------------raw animation (DON'T mix with jQuery fx)---------------
		//(specifically, don't call $.animate() inside updateFn)
		//(you also can NOT control the rate the browser calls updateFn, its 60 FPS all the time...)
		animation: function(updateFn, condition, ctx){
			var id;
			var stepFn = function(t){
				updateFn.call(ctx);//...update...(1 tick)
				if(!condition || (condition && condition.call(ctx)))//...condition...(to continue)
					move();
			};
			var move = function(){
				if(id === undefined) return;
				id = app._nextFrame(stepFn);
			};
			var stop = function(){
				app._cancelFrame(id);
				id = undefined;
			};
			return {
				start: function(){id = -1; move();},
				stop: stop
			};
		},

		_nextFrame: function(stepFn){
			//return request id
			return window.requestAnimationFrame(stepFn);
		},

		_cancelFrame: function(id){
			return window.cancelAnimationFrame(id);
		},

		//effects see https://daneden.github.io/animate.css/
		//sample usage: 'view:data-rendered' --> app.animateItems();
		animateItems: function(selector /*or $items*/, effect, stagger){
			var $selector = $(selector); 
			if(_.isNumber(effect)){
				stagger = effect;
				effect = undefined;
			}
			effect = effect || 'flipInX';
			stagger = stagger || 150;
			var inOrOut = /In/.test(effect)? 1: (/Out/.test(effect)? -1: 0);

			$selector.each(function(i, el){
				var $el = $(el);
				//////////////////different than region.show effect because of stagger delay//////////////////
				if(inOrOut)
					if(inOrOut === 1) $el.css('opacity', 0);
					else $el.css('opacity', 1);
				//////////////////////////////////////////////////////////////////////////////////////////////
				_.delay(function($el){
					var fxName = effect + ' animated';
					$el.one(app.ADE, function(){
						$el.removeClass(fxName);
					}).addClass(fxName);
					///////////////reset opacity immediately, not after ADE///////////////
					if(inOrOut)
						if(inOrOut === 1) $el.css('opacity', 1);
						else $el.css('opacity', 0);
					//////////////////////////////////////////////////////////////////////
				}, i * stagger, $el);
			});
		},
		//----------------config.rapidEventDelay wrapped util--------------------
		//**Caveat: must separate app.config() away from app.run(), put view def (anything)
		//that uses app.config in between in your index.html. (the build tool automatically taken care of this)
		throttle: function(fn, ms){
			return _.throttle(fn, ms || app.config.rapidEventDelay);
		},

		debounce: function(fn, ms){
			return _.debounce(fn, ms || app.config.rapidEventDelay);
		},

		//----------------markdown-------------------
		//options.marked, options.hljs
		//https://guides.github.com/features/mastering-markdown/
		//our addition:
		//	^^^class class2 class3 ...
		//	...
		//	^^^
		markdown: function(md, $anchor /*or options*/, options){
			options = options || (!($anchor instanceof jQuery) && $anchor) || {};
			//render content
			var html = marked(md, app.debug('marked options are', _.extend(app.config.marked, (options.marked && options.marked) || options, $anchor instanceof jQuery && $anchor.data('marked')))), hljs = window.hljs;
			//highlight code (use ```language to specify type)
			if(hljs){
				hljs.configure(app.debug('hljs options are', _.extend(app.config.hljs, options.hljs, $anchor instanceof jQuery && $anchor.data('hljs'))));
				var $html = $('<div>' + html + '</div>');
				$html.find('pre code').each(function(){
					hljs.highlightBlock(this);
				});
				html = $html.html();
			}
			if($anchor instanceof jQuery)
				return $anchor.html(html).addClass('md-content');
			return html;
		},

		//----------------notify/overlay/popover---------------------
		notify: function(title /*or options*/, msg, type /*or otherOptions*/, otherOptions){
			if(_.isString(title)){
				if(_.isPlainObject(type)){
					otherOptions = type;
					type = undefined;
				}
				if(otherOptions && otherOptions.icon){
					//theme awesome ({.icon, .more})
					$.amaran(_.extend({
						theme: 'awesome ' + (type || 'ok'),
						//see http://ersu.me/article/amaranjs/amaranjs-themes for types
						content: {
							title: title,
							message: msg,
							info: otherOptions.more || ' ',
							icon: otherOptions.icon
						}
					}, otherOptions));
				} else {
					//custom theme
					$.amaran(_.extend({
						content: {
							themeName: 'stagejs',
							title: title,
							message: msg, 
							type: type || 'info',
						},
						themeTemplate: app.NOTIFYTPL
					}, otherOptions));
				}
			}
			else
				$.amaran(title);
		},

		//overlay or popover
		prompt: function(view, anchor, placement, options){
			if(_.isFunction(view))
				view = new view();
			else if(_.isString(view))
				view = new (app.get(view))();

			//is popover
			if(_.isString(placement)){
				options = options || {};
				options.placement = placement;
				return view.popover(anchor, options);
			}

			//is overlay
			options = placement;
			return view.overlay(anchor, options);
		},

		//----------------i18n-----------------------
		i18n: function(key, ns){
			if(key){
				//insert translations to current locale
				if(_.isPlainObject(key))
					return I18N.insertTrans(key);
				//return a translation for specified key, ns/module
				return String(key).i18n(ns);
			}
			return I18N.getResourceJSON(null, false); //collect available strings (so far) into an i18n object.
		},

		//----------------debug----------------------
		//Note: debug() will always return the last argument as return val. (for non-intrusive inline debug printing)
		debug: function(){
			var fn = console.debug || console.log;
			if(app.param('debug') === 'true')
				fn.apply(console, arguments);
			return arguments.length && arguments[arguments.length - 1];
		},

		//find a view instance by name or its DOM element.
		locate: function(name /*el or $el*/){
			//el, $el for *contained* view names only
			if(!_.isString(name)){
				var all;
				if(name)
					all = $(name).find('[data-view-name]');
				else
					all = $('[data-view-name]');

				all = all.map(function(index, el){
					return $(el).attr('data-view-name');
				}).get();
				return all;
			}

			//name string, find the view instance and sub-view names
			var view = $('[data-view-name="' + name + '"]').data('view');
			return view && {view: view, 'sub-views': app.locate(view.$el)};
		},

		//output performance related meta info so far for a view by name or its DOM element.
		profile: function(name /*el or $el*/){
			//el, $el for *contained* views total count and rankings
			if(!_.isString(name)){
				var all;
				if(name)
				 	all = $(name).find('[data-render-count]');
				else
					all = $('[data-render-count]');

				all = all.map(function(index, el){
					var $el = $(el);
					return {name: $el.data('view-name'), 'render-count': Number($el.data('render-count')), $el: $el};
				}).get();
				return {total: _.reduce(all, function(memo, num){ return memo + num['render-count']; }, 0), rankings: _.sortBy(all, 'render-count').reverse()};
			}

			//name string, profile the specific view and its sub-views
			var result = app.locate(name), view;
			if(result) view = result.view;
			return view && {name: view.$el.data('view-name'), 'render-count': view.$el.data('render-count'), $el: view.$el, 'sub-views': app.profile(view.$el)};
		},

		//mark views on screen. (hard-coded style, experimental)
		mark: function(name /*el or $el*/){
			var nameTagPairing = [], $body;
			if(_.isString(name)){
				var result = app.locate(name);
				if(!result) return;
				$body = result.view.parentRegion.$el;
			}else if(name){
				$body = $(name);
			}else
				$body = $('body');

			//clear all name tag
			$body.find('.dev-support-view-name-tag').remove();
			//round-1: generate border and name tags
			_.each(app.locate($body), function(v){
				var result = app.locate(v), $container;
				//add a container style
				if(result.view.category !== 'Editor')
					$container = result.view.parentRegion && result.view.parentRegion.$el;
				else
					$container = result.view.$el;
				//else return;
				if(!$container) return;

				$container.css({
					'padding': '1.5em', 
					'border': '1px dashed black'
				});
				//add a name tag (and live position it to container's top left)
				var $nameTag = $('<span class="label label-default dev-support-view-name-tag" style="position:absolute;">' + result.view.$el.data('view-name') + '</span>');
				//add click event to $nameTag
				$nameTag.css({cursor: 'pointer'})
				.on('click', function(){
					app.reload(result.view.$el.data('view-name'), true);
				});
				$body.append($nameTag);
				nameTagPairing.push({$tag: $nameTag, $ct: $container, view: result.view});
			});
			//round-2: position the name tags
			$window.trigger('resize');//trigger a possible resizing globally.
			_.defer(function(){
				_.each(nameTagPairing, function(pair){
					pair.$tag.position({
						my: 'left top',
						at: 'left top',
						of: pair.$ct
					});
					pair.view.on('close', function(){
						pair.$tag.remove();
					});
				});
			});
		},

		//reload everything, or override a view with newer version.
		reload: function(name, override/*optional*/){
			//reload globally
			if(!name)
				return window.location.reload();

			var result = app.locate(name);
			if(!result){
				app.mark();//highlight available views.
				throw new Error('DEV::app.reload():: Can NOT find view with given name: ' + name);
			}

			var v = result.view,
				region = v.parentRegion,
				category;
			//get type of the named object
			_.each(app.get(), function(data, key){
				if(data.indexOf(name) >= 0){
					category = key;
					return;
				}
			});
			if(!category)
				throw new Error('DEV::app.reload():: No category can be found with given view: ' + name);
			override = override || false;
			//override old view
			if(override){
				//clear template cache in cache
				app.Util.Tpl.cache.clear(v.template);
				//un-register the view
				app.Core[category].remove(name);
				//re-show the new view
				try{
					var view = new (app.get(name, category))();
					view.once('view:all-region-shown', function(){
						app.mark(name);
					});
					region.show(view);
				}catch(e){
					console.warn('DEV::app.reload()::Abort, this', name, 'view is not defined alone, you need to find its source.', e);
				}
			}else{
				//re-render the view
				v.refresh();
			}
			//return this;
		},

		inject: {
			js: function(){
				return app.Util.inject.apply(null, arguments);
			},

			tpl: function(){
				return app.Util.Tpl.remote.apply(app.Util.Tpl, arguments);
			},

			css: function(){
				return loadCSS.apply(null, arguments);
			}
		},

		//--------3rd party lib pass-through---------
		
		// js-cookie (former jquery-cookie)
		//.set(), .get(), .remove()
		cookie: Cookies,

		// store.js (localStorage)
		//.set(), .get(), .getAll(), .remove(), .clear()
		store: store.enabled && store,

		// validator.js (form data type,val,deps validation)
		validator: validator,

		// moment.js (date and time)
		moment: moment,

		// URI.js (uri,query and hash in the url)
		uri: URI,

		// later.js (schedule repeated workers, e.g poll RESTful data)
		later: later,
	});

	//editor rules
	app.editor.validator = app.editor.rule = function(name, fn){
		if(!_.isString(name)) throw new Error('DEV::Validator:: You must specify a validator/rule name to use.');
		return app.Core.Editor.addRule(name, fn);
	};

	//alias
	app.page = app.context;
	app.area = app.regional;

	/**
	 * API summary
	 */
	app._apis = [
		'dispatcher/reactor', 'model', 'collection',
		//view related
		'context - @alias:page', 'view', 'widget', 'editor', 'editor.validator - @alias:editor.rule',
		//global action locks
		'lock', 'unlock', 'available', 
		//utils
		'has', 'get', 'coop', 'navigate', 'icing/curtain', 'i18n', 'param', 'animation', 'animateItems', 'throttle', 'debounce',
		//com
		'remote', 'download', 'ws', 'poll',
		//3rd-party lib short-cut
		'extract', 'markdown', 'notify', 'prompt', //wraps
		'cookie', 'store', 'moment', 'uri', 'validator', 'later', //direct refs
		//supportive
		'debug', 'reload', 'locate', 'profile', 'mark', 'nameToPath', 'pathToName', 'inject.js', 'inject.tpl', 'inject.css',
		//@deprecated
		'create - @deprecated', 'regional - @deprecated'
	];

	/**
	 * Statics
	 */
	//animation done events used in Animate.css
	app.ADE = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	//notification template
	app.NOTIFYTPL = Handlebars.compile('<div class="alert alert-dismissable alert-{{type}}"><button data-dismiss="alert" class="close" type="button">×</button><strong>{{title}}</strong> {{{message}}}</div>');

})(Application);
;/**
 * Util for adding meta-event programming ability to object
 *
 * Currently applied to: Application, Context and View.
 *
 * @author Tim Lauv
 * @created 2014.03.22
 * @updated 2016.03.31
 */

;(function(app){

	//e as event in meta-event domain:e without the domain: string
	app.Util.metaEventToListenerName = function(e){
		if(!e) throw new Error('DEV::Util::metaEventToListenerName() e an NOT be empty...');
		return _.string.camelize('on-' + e.split(/[\.:-\s\/]/).join('-')); //IMPORTANT e --> fn rule
	};

	app.Util.addMetaEvent = function(target, namespace, delegate){
		if(!delegate) delegate = target;
		target.listenTo(target, 'all', function(eWithNamespace){
			//separate the domain: string
			var tmp = String(eWithNamespace).split(':');
			if(tmp.length !== 2 || tmp[0] !== namespace) return;
			//apply the e --> fn rule
			var listener = app.Util.metaEventToListenerName(tmp[1]);
			if(delegate[listener])
				delegate[listener].apply(target, _.toArray(arguments).slice(1));
		});
	};

})(Application);
;/**
 * Application universal downloader
 *
 * Usage
 * -----
 * 'string' - url
 * 	or
 * {
 * 	 url:
 * 	 ... (rest as url? query strings)
 * }
 *
 * @author Tim Lauv
 * @created 2013.04.01
 * @updated 2013.11.08
 * @updated 2014.03.04
 */
;(function(app){

	function downloader(ticket){
	    var drone = $('#hidden-download-iframe');
	    if(drone.length > 0){
	    }else{
	        $('body').append('<iframe id="hidden-download-iframe" style="display:none"></iframe>');
	        drone = $('#hidden-download-iframe');
	    }
	    
	    if(_.isString(ticket)) ticket = { url: ticket };
	    drone.attr('src', (app.uri(ticket.url || '/').addQuery(_.omit(ticket, 'url'))).toString());
	}

	app.Util.download = downloader;

})(Application);
;/**
 * This is the template builder/registry util, making it easier to create new templates for View objects.
 * (used by M.TemplateCache* in template-cache.js)
 *
 * Note: use build() for local templates and remote() for remote ones
 *
 * Usage (name as id)
 * -----
 * app.Util.Tpl.build(name, [</>, </>, ...]) / ([</>, </>, ...]) / ('</></>...</>')
 * app.Util.Tpl.remote(url, sync) - default on using app.config.viewTemplates as base before url, use '/' as start to skip
 *
 * @author Tim Lauv
 * @create 2013.12.20
 * @updated 2014.10.25
 * @updated 2016.03.24
 */

;(function(app){

	var namefix = /[\.\/]/;
	var Template = {

		//normalize the tpl names so they can be used as html tag ids.
		normalizeId: function(name){
			return String(name).split(namefix).join('-');
		},

		cache: Backbone.Marionette.TemplateCache,

		build: function (name, tplString){
			if(arguments.length === 1) {
				tplString = name;
				name = null;
			}
			var tpl = _.isArray(tplString)?tplString.join(''):tplString;

			if(name) {
				//process name to be valid id string, use String() to force type conversion before using .split()
				var id = this.normalizeId(name);
				var $tag = $('head > script[id="' + id + '"]');
				if($tag.length > 0) {
					//override
					$tag.html(tpl);
					this.cache.clear('#' + name);
					console.warn('DEV::Overriden::Template::', name);
				}
				else $('head').append(['<script type="text/tpl" id="', id, '">', tpl, '</script>'].join(''));
			}

			return tpl;
		},

		//load all prepared/combined templates from server (*.json without CORS)
		//or
		//load individual tpl
		//all loaded tpl will be stored in cache (app.Util.Tpl.cache.templateCaches)
		remote: function(name, sync){
			var that = this;
			if(!name) throw new Error('DEV::Util.Tpl::remote() your template name can NOT be empty!');

			var originalName = name;
			if(_.string.startsWith(name, '@'))
				name = name.slice(1);
			var base = app.config.viewTemplates;
			if(_.string.startsWith(name, '/')){
				name = name.slice(1);
				base = '.';
			}
			var url = base + '/' + name;
			if(_.string.endsWith(url, '.json')){
				//load all from preped .json
				return $.ajax({
					url: url,
					dataType: 'json', //force return data type.
					async: !sync
				}).done(function(tpls){
					_.each(tpls, function(t, n){
						Template.cache.make(n, t);
					});
				});//.json can be empty or missing.
			}else {
				//individual tpl
				return $.ajax({
					url: url,
					dataType: 'html',
					async: !sync
				}).done(function(tpl){
					Template.cache.make(originalName, tpl);
				}).fail(function(){
					throw new Error('DEV::Util.Tpl::remote() Can not load template...' + url + ', re-check your app.config.viewTemplates setting');
				});
			}
		}
	};

	app.Util.Tpl = Template;

})(Application);

;/**
 * Script injecting util for [batch] reloading certain script[s] without refreshing app.
 *
 * batch mode: use a .json to describe the js listing
 * json format:
 * 1. ["scriptA.js", "lib/scriptB.js", "another-listing.json"]
 * 2. {
 * 		"base": "js",
 * 		"list": [ ... ] //same as 1
 * }
 *
 * @author Tim Lauv
 * @created 2014.10.08
 */

;(function(app){

	app.Util.inject = function(url, sync){

		url = url || 'patch.json';

		if(_.string.endsWith(url, '.js'))
			return $.ajax({
				url: url,
				async: !sync,
				dataType: 'script'
			});
		else
			return $.getJSON(url, function(list){
				var base = '';
				if(!_.isArray(list)) {
					base = list.base;
					list = list.list;
				}
				_.each(list, function(js){
					app.Util.inject((_.string.endsWith(base, '/')?base: (!base?'':(base + '/'))) + js, sync);
				});
			});
	};

})(Application);
;/*
 * This is the Remote data interfacing core module of this application framework.
 * (Replacing the old Data API module)
 *
 * options:
 * --------
 * a. url string
 * or 
 * b. object:
 * 	1. + _entity[_id][_method] - string
 *  2. + params(alias:querys) - object
 *  3. + payload - object (payload._id overrides _id)
 *  4. $.ajax options (without -data, -type, -processData, -contentType)
 *
 *  Global CROSSDOMAIN Settings - *Deprecated*: set this in a per-request base or use server side proxy
 *  see MDN - https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
 *  If you ever need crossdomain in development, we recommend that you TURN OFF local server's auth layer/middleware. 
 *  To use crossdomain ajax, in any of your request, add this option:
 *  xdomain: {
 *  	protocol: '', //https or not? default: '' -> http
 *   	host: '127.0.0.1', 
 *   	port: '5000',
 *   	headers: {
 *   		'Credential': 'user:pwd'/'token',
 *   		...
 *  }
 *  Again, it is always better to use server side proxy/forwarding instead of client side x-domain.
 *
 * events:
 * -------
 * app:ajax - change global ajax options here
 * app:ajax-success - single progress
 * app:ajax-error - single progress
 * app:ajax-start - single progress
 * app:ajax-stop - single progress
 * app:ajax-active - overall
 * app:ajax-inactive - overall
 * app:remote-pre-get - fine grind op stub
 * app:remote-pre-change - fine grind op stub
 * 
 * @author Tim Lauv
 * @created 2014.03.24
 */ 

;(function(app, _, $){

	var definition = app.module('Core.Remote');

	function fixOptions(options, restOpt){
		if(!options) throw new Error('DEV::Core.Remote::options empty, you need to pass in at least a url string');
		if(_.isString(options)) 
			options	= _.extend(restOpt || {}, { 
				url: options
			});

		//default options
		_.extend(options, restOpt || {}, {
			type: undefined,
			data: undefined,
			processData: false,
			contentType: 'application/json; charset=UTF-8', // req format
			//**Caveat**: we do NOT assume a json format response.---------------------------------------
			//dataType: 'json', //need 'application/json; charset=utf-8' in response Content-Type header.
			//-------------------------------------------------------------------------------------------
			timeout: app.config.timeout,
		});

		//process _entity[_id][_method] and strip off options.querys(alias:params)
		if(options.entity || options._entity){
			var entity = options.entity || options._entity;
			options.url = entity;
		}
		if(options.payload && options.payload._id){
			options._id = options.payload._id;
		}
		if(options._id || options._method){
			var url = app.uri(options.url);
			options.url = url.path(_.compact([url.path(), options._id, options._method]).join('/')).toString();
		}
		options.params = _.extend(options.params || {}, options.querys);
		if(options.params){
			options.url = (app.uri(options.url)).search(options.params).toString();
		}

		app.trigger('app:ajax', options);		
		return options;
	}

	_.extend(definition, {

		//GET
		get: function(options, restOpt){
			options = fixOptions(options, restOpt);
			options.type = 'GET';
			app.trigger('app:remote-pre-get', options);
			return $.ajax(options);
		},

		//POST(no payload._id)/PUT/DELETE(payload = {_id: ...})
		change: function(options, restOpt){
			options = fixOptions(options, restOpt);
			if(!options.payload) throw new Error('DEV::Core.Remote::payload empty, please use GET');
			if(options.payload._id && _.size(options.payload) === 1) options.type = 'DELETE';
			else {
				if(!_.isObject(options.payload)) options.payload = { payload: options.payload };
				if(!options.payload._id) options.type = 'POST';
				else options.type = 'PUT';
			}

			if(options.type !== 'DELETE'){
				//encode payload into json data
				options.data = JSON.stringify(options.payload);
			}

			app.trigger('app:remote-pre-change', options);
			return $.ajax(options);
		}

	});

	//Global jQuery ajax event mappings to app:ajax-* events.
	//swapped!
	$document.ajaxSend(function(e, jqXHR, ajaxOptions) {
		app.trigger('app:ajax-start', e, jqXHR, ajaxOptions);
	});
	//swapped!
	$document.ajaxComplete(function(e, jqXHR, ajaxOptions) {
		app.trigger('app:ajax-stop', e, jqXHR, ajaxOptions);
	});
	//same
	$document.ajaxSuccess(function(e, jqXHR, ajaxOptions, data){
		app.trigger('app:ajax-success', e, jqXHR, ajaxOptions, data);
	});
	//same
	$document.ajaxError(function(e, jqXHR, ajaxOptions, error){
		app.trigger('app:ajax-error', e, jqXHR, ajaxOptions, error);
	});
	//new name!
	$document.ajaxStart(function() {
		app.trigger('app:ajax-active');
	});
	//new name!
	$document.ajaxStop(function() {
		app.trigger('app:ajax-inactive');
	});

	//Ajax Options Fix: (baseAjaxURI, CORS and cache)
	app.onAjax = function(options){

		//app.config.baseAjaxURI
		if(app.config.baseAjaxURI)
			options.url = options.url.match(/^[\/\.]/)? options.url : [app.config.baseAjaxURI, options.url].join('/');	

		//crossdomain:
		var crossdomain = options.xdomain;
		if(crossdomain){
			options.url = (crossdomain.protocol || 'http') + '://' + (crossdomain.host || 'localhost') + ((crossdomain.port && (':'+crossdomain.port)) || '') + (/^\//.test(options.url)?options.url:('/'+options.url));
			options.crossDomain = true;
			options.xhrFields = _.extend(options.xhrFields || {}, {
				withCredentials: true //persists session cookies.
			});
			options.headers = _.extend(options.headers || {}, crossdomain.headers);
			// Using another way of setting withCredentials flag to skip FF error in sycned CORS ajax - no cookies tho...:(
			// options.beforeSend = function(xhr) {
			// 	xhr.withCredentials = true;
			// };
		}

		//cache:[disable it for IE only]
		if(Modernizr.ie)
			options.cache = false;
	
	};
	

})(Application, _, jQuery);
;/**
 * Application locking mech for actions, events and <a href> navigations ...
 *
 * Usage
 * -----
 * create (name, number) -- topic and allowance;
 * lock (name) -- 	return true for locking successfully, false otherwise;
 * 					default on creating a (name, 1) lock for unknown name;
 * 					no name means to use the global lock;
 * unlock (name) -- unlock topic, does nothing by default;
 * 					no name means to use the global lock;
 * get(name) -- get specific lock topic info;
 * 				no name means to return all info;
 *
 * @author Tim Lauv
 * @created 2014.08.21
 */

;(function(app){

	var definition = app.module('Core.Lock');
	var locks = {},
	global = false; //true to lock globally, false otherwise.

	_.extend(definition, {
		create: function(topic, allowance){
			if(!_.isString(topic) || !topic) throw new Error('DEV::Core.Lock::create() You must give this lock a name/topic ...');
			if(locks[topic]) return false;

			allowance = _.isNumber(allowance)? (allowance || 1) : 1;
			locks[topic] = {
				current: allowance,
				allowance: allowance
			};
			return true;
		},

		get: function(topic){
			if(!topic || topic === '*') return {
				global: global,
				locks: locks
			};
			else
				return locks[topic];
		},

		//return true/false indicating op successful/unsuccessful
		lock: function(topic){
			if(global) return false;

			if(!topic || topic === '*') {
				//global
				if(!global){ //not locked
					global = true;
					return true;
				}else //locked already
					return false;
			}else {
				if(_.isUndefined(locks[topic])){
					this.create(topic, 1);
					return this.lock(topic);
				}else{
					if(locks[topic].current > 0){
						locks[topic].current --;
						return true;
					}else 
						return false;
				}
			}
		},

		//return nothing...
		unlock: function(topic){
			if(!topic || topic === '*') {
				//global
				if(global){ //locked
					global = false;
				}
			}else {
				if(!_.isUndefined(locks[topic])){
					if(locks[topic].current < locks[topic].allowance)
						locks[topic].current ++;
				}
			}
		},

		available: function(topic){
			if(global) return false;
			
			if(!topic || topic === '*')
				return global === false;
			else {
				var status = this.get(topic);
				if(status) return status.current > 0;
				else return true;
			} 
				
		}
	});



})(Application);
;/**
 * Widget/Editor registry. With a regFacotry to control the registry mech.
 *
 * Important
 * =========
 * Use create() at all times if possible, use get()[deprecated...] definition with caution, instantiate only 1 instance per definition.
 * There is something fishy about the initialize() function (Backbone introduced), events binding only get to execute once with this.listenTo(), if multiple instances of a part
 * listens to a same object's events in their initialize(), only one copy of the group of listeners are active.
 * 
 *
 * @author Tim Lauv
 * @create 2013.11.10
 * @update 2014.03.03
 * @update 2015.07.29 (merged Regional, Context)
 */

(function(_, app, Marionette){

	function makeRegistry(regName){
		regName = _.string.classify(regName);
		var manager = app.module('Core.' + regName);
		_.extend(manager, {

			map: {},
			has: function(name /*or path*/){
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable::has() You must specify the name of the ' + regName + ' to look for.');
				if(this.map[name]) return name;
				name = app.pathToName(name);
				if(this.map[name]) return name;
				return undefined;
			},

			//no auto pathToName conversion
			register: function(name /*or options*/, factory /*or options or none*/){

				//type 1: options only
				var options;
				if(_.isPlainObject(name)){
					options = name;
					name = options.name;
					_.extend(/*{
						...
					},*/ options, {
						className: regName.toLowerCase() + ' ' + _.string.slugify(regName + '-' + options.name) + ' ' + (options.className || ''),
					});
					factory = function(){
						return Marionette[options.type || 'Layout'].extend(options);
					};
				}

				//type 2: name and options
				else if(_.isPlainObject(factory)){
					options = _.extend(factory, {
						name: name,
						className: regName.toLowerCase() + ' ' + _.string.slugify(regName + '-' + name) + ' ' + (factory.className || ''),
					});
					factory = function(){
						return Marionette[options.type || 'Layout'].extend(options);
					};
				}

				//type 3: name and a factory func (won't have preset className)
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable::register() You must specify a ' + regName + ' name to register.');
				if(!_.isFunction(factory)) throw new Error('DEV::Reusable::register() You must specify a ' + regName + ' factory function to register ' + name + ' !');

				if(this.has(name))
					console.warn('DEV::Overriden::Reusable ' + regName + '.' + name);
				this.map[name] = factory();
				//+metadata to instances
				this.map[name].prototype.name = name;
				this.map[name].prototype.category = regName;
				if(!this.map[name].prototype.className)
					this.map[name].prototype.className = regName.toLowerCase() + ' ' + _.string.slugify(regName + '-' + name);

				//fire the coop event (e.g for auto menu entry injection)
				app.trigger('app:reusable-registered', this.map[name], regName);
				app.coop('reusable-registered', this.map[name], regName);
				return this.map[name];

			},

			create: function(name /*or path*/, options){
				if(!_.isString(name) || !name) throw new Error('DEV::Reusable::create() You must specify the name of the ' + regName + ' to create.');
				var Reusable = this.get(name);
				if(Reusable)
					return new Reusable(options || {});
				throw new Error('DEV::Reusable::create() Required definition [' + name + '] in ' + regName + ' not found...');
			},

			get: function(name /*or path*/){
				if(!name) return _.keys(this.map);
				name = this.has(name);
				if(name)
					return this.map[name];
			},

			alter: function(name /*or path*/, options){
				var Reusable = this.get(name);
				if(Reusable){
					Reusable = Reusable.extend(options);
					return Reusable;
				}
				throw new Error('DEV::Reusable::alter() Required definition [' + name + '] in ' + regName + ' not found...');
			},

			remove: function(name /*or path*/){
				if(name)
					delete this.map[name];
			},

		});

		return manager;

	}

	makeRegistry('Context'); //top level views (see infrastructure: navigation worker)
	makeRegistry('Regional'); //general named views (e.g a form, a chart, a list, a customized detail)
	app.Core.View = app.Core.Regional; //alias
	makeRegistry('Widget'); //specialized named views (e.g a datagrid, a menu, ..., see reusable/widgets)
	makeRegistry('Editor'); //specialized small views used in form views (see reusable/editors, lib+-/marionette/item-view,layout)

})(_, Application, Marionette);
;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.Backbone = window.Backbone || {};
window.Backbone.DeepModel = require('.');

},{".":20}],2:[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var arrayCopy = require('lodash._arraycopy'),
    arrayEach = require('lodash._arrayeach'),
    baseFor = require('lodash._basefor'),
    createAssigner = require('lodash._createassigner'),
    isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray'),
    isPlainObject = require('lodash.isplainobject'),
    isTypedArray = require('lodash.istypedarray'),
    keys = require('lodash.keys'),
    toPlainObject = require('lodash.toplainobject');

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * The base implementation of `_.forOwn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.merge` without support for argument juggling,
 * multiple sources, and `this` binding `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} [customizer] The function to customize merging properties.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {Object} Returns the destination object.
 */
function baseMerge(object, source, customizer, stackA, stackB) {
  if (!isObject(object)) {
    return object;
  }
  var isSrcArr = isLength(source.length) && (isArray(source) || isTypedArray(source));
  (isSrcArr ? arrayEach : baseForOwn)(source, function(srcValue, key, source) {
    if (isObjectLike(srcValue)) {
      stackA || (stackA = []);
      stackB || (stackB = []);
      return baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
    }
    var value = object[key],
        result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
        isCommon = typeof result == 'undefined';

    if (isCommon) {
      result = srcValue;
    }
    if ((isSrcArr || typeof result != 'undefined') &&
        (isCommon || (result === result ? (result !== value) : (value === value)))) {
      object[key] = result;
    }
  });
  return object;
}

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize merging properties.
 * @param {Array} [stackA=[]] Tracks traversed source objects.
 * @param {Array} [stackB=[]] Associates values with source counterparts.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
  var length = stackA.length,
      srcValue = source[key];

  while (length--) {
    if (stackA[length] == srcValue) {
      object[key] = stackB[length];
      return;
    }
  }
  var value = object[key],
      result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
      isCommon = typeof result == 'undefined';

  if (isCommon) {
    result = srcValue;
    if (isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))) {
      result = isArray(value)
        ? value
        : (value ? arrayCopy(value) : []);
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      result = isArguments(value)
        ? toPlainObject(value)
        : (isPlainObject(value) ? value : {});
    }
    else {
      isCommon = false;
    }
  }
  // Add the source value to the stack of traversed objects and associate
  // it with its merged value.
  stackA.push(srcValue);
  stackB.push(result);

  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
  } else if (result === result ? (result !== value) : (value === value)) {
    object[key] = result;
  }
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on ES `ToLength`. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

/**
 * Recursively merges own enumerable properties of the source object(s), that
 * don't resolve to `undefined` into the destination object. Subsequent sources
 * overwrite property assignments of previous sources. If `customizer` is
 * provided it is invoked to produce the merged values of the destination and
 * source properties. If `customizer` returns `undefined` merging is handled
 * by the method instead. The `customizer` is bound to `thisArg` and invoked
 * with five arguments; (objectValue, sourceValue, key, object, source).
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize merging properties.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var users = {
 *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
 * };
 *
 * var ages = {
 *   'data': [{ 'age': 36 }, { 'age': 40 }]
 * };
 *
 * _.merge(users, ages);
 * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
 *
 * // using a customizer callback
 * var object = {
 *   'fruits': ['apple'],
 *   'vegetables': ['beet']
 * };
 *
 * var other = {
 *   'fruits': ['banana'],
 *   'vegetables': ['carrot']
 * };
 *
 * _.merge(object, other, function(a, b) {
 *   if (_.isArray(a)) {
 *     return a.concat(b);
 *   }
 * });
 * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
 */
var merge = createAssigner(baseMerge);

module.exports = merge;

},{"lodash._arraycopy":3,"lodash._arrayeach":4,"lodash._basefor":5,"lodash._createassigner":6,"lodash.isarguments":9,"lodash.isarray":10,"lodash.isplainobject":11,"lodash.istypedarray":14,"lodash.keys":15,"lodash.toplainobject":17}],3:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function arrayCopy(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = arrayCopy;

},{}],4:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.forEach` for arrays without support for callback
 * shorthands or `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;

},{}],5:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * The base implementation of `baseForIn` and `baseForOwn` which iterates
 * over `object` properties returned by `keysFunc` invoking `iteratee` for
 * each property. Iterator functions may exit iteration early by explicitly
 * returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
function baseFor(object, iteratee, keysFunc) {
  var index = -1,
      iterable = toObject(object),
      props = keysFunc(object),
      length = props.length;

  while (++index < length) {
    var key = props[index];
    if (iteratee(iterable[key], key, iterable) === false) {
      break;
    }
  }
  return object;
}

/**
 * Converts `value` to an object if it is not one.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {Object} Returns the object.
 */
function toObject(value) {
  return isObject(value) ? value : Object(value);
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

module.exports = baseFor;

},{}],6:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var bindCallback = require('lodash._bindcallback'),
    isIterateeCall = require('lodash._isiterateecall');

/**
 * Creates a function that assigns properties of source object(s) to a given
 * destination object.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return function() {
    var args = arguments,
        length = args.length,
        object = args[0];

    if (length < 2 || object == null) {
      return object;
    }
    var customizer = args[length - 2],
        thisArg = args[length - 1],
        guard = args[3];

    if (length > 3 && typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = (length > 2 && typeof thisArg == 'function') ? thisArg : null;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(args[1], args[2], guard)) {
      customizer = length == 3 ? null : customizer;
      length = 2;
    }
    var index = 0;
    while (++index < length) {
      var source = args[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  };
}

module.exports = createAssigner;

},{"lodash._bindcallback":7,"lodash._isiterateecall":8}],7:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (typeof thisArg == 'undefined') {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = bindCallback;

},{}],8:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = +value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number') {
    var length = object.length,
        prereq = isLength(length) && isIndex(index, length);
  } else {
    prereq = type == 'string' && index in object;
  }
  if (prereq) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on ES `ToLength`. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

module.exports = isIterateeCall;

},{}],9:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like length.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * (function() { return _.isArguments(arguments); })();
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  var length = isObjectLike(value) ? value.length : undefined;
  return (isLength(length) && objToString.call(value) == argsTag) || false;
}

module.exports = isArguments;

},{}],10:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Used to match `RegExp` special characters.
 * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
 * for more details.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Converts `value` to a string if it is not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reNative = RegExp('^' +
  escapeRegExp(objToString)
  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like length.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * (function() { return _.isArray(arguments); })();
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return (isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag) || false;
};

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reNative.test(fnToString.call(value));
  }
  return (isObjectLike(value) && reHostCtor.test(value)) || false;
}

/**
 * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
 * "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = isArray;

},{}],11:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseFor = require('lodash._basefor'),
    isNative = require('lodash.isnative'),
    keysIn = require('lodash.keysin');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/** Native method references. */
var getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf;

/**
 * The base implementation of `_.forIn` without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForIn(object, iteratee) {
  return baseFor(object, iteratee, keysIn);
}

/**
 * A fallback implementation of `_.isPlainObject` which checks if `value`
 * is an object created by the `Object` constructor or has a `[[Prototype]]`
 * of `null`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 */
function shimIsPlainObject(value) {
  var Ctor;

  // Exit early for non `Object` objects.
  if (!(isObjectLike(value) && objToString.call(value) == objectTag) ||
      (!hasOwnProperty.call(value, 'constructor') &&
        (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
    return false;
  }
  // IE < 9 iterates inherited properties before own properties. If the first
  // iterated property is an object's own property then there are no inherited
  // enumerable properties.
  var result;
  // In most environments an object's own properties are iterated before
  // its inherited properties. If the last iterated property is an object's
  // own property then there are no inherited enumerable properties.
  baseForIn(value, function(subValue, key) {
    result = key;
  });
  return typeof result == 'undefined' || hasOwnProperty.call(value, result);
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * **Note:** This method assumes objects created by the `Object` constructor
 * have no inherited enumerable properties.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
  if (!(value && objToString.call(value) == objectTag)) {
    return false;
  }
  var valueOf = value.valueOf,
      objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

  return objProto
    ? (value == objProto || getPrototypeOf(value) == objProto)
    : shimIsPlainObject(value);
};

module.exports = isPlainObject;

},{"lodash._basefor":5,"lodash.isnative":12,"lodash.keysin":13}],12:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Used to match `RegExp` special characters.
 * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
 * for more details.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Converts `value` to a string if it is not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reNative = RegExp('^' +
  escapeRegExp(objToString)
  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reNative.test(fnToString.call(value));
  }
  return (isObjectLike(value) && reHostCtor.test(value)) || false;
}

/**
 * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
 * "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = isNative;

},{}],13:[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * An object environment feature flags.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

(function(x) {

  /**
   * Detect if `arguments` object indexes are non-enumerable.
   *
   * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object
   * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat
   * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`
   * checks for indexes that exceed their function's formal parameters with
   * associated values of `0`.
   *
   * @memberOf _.support
   * @type boolean
   */
  try {
    support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
  } catch(e) {
    support.nonEnumArgs = true;
  }
}(0, 0));

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = +value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on ES `ToLength`. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keysIn;

},{"lodash.isarguments":9,"lodash.isarray":10}],14:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dateTag] = typedArrayTags[errorTag] =
typedArrayTags[funcTag] = typedArrayTags[mapTag] =
typedArrayTags[numberTag] = typedArrayTags[objectTag] =
typedArrayTags[regexpTag] = typedArrayTags[setTag] =
typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like length.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return (isObjectLike(value) && isLength(value.length) && typedArrayTags[objToString.call(value)]) || false;
}

module.exports = isTypedArray;

},{}],15:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray'),
    isNative = require('lodash.isnative');

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Native method references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * An object environment feature flags.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

(function(x) {

  /**
   * Detect if `arguments` object indexes are non-enumerable.
   *
   * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object
   * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat
   * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`
   * checks for indexes that exceed their function's formal parameters with
   * associated values of `0`.
   *
   * @memberOf _.support
   * @type boolean
   */
  try {
    support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
  } catch(e) {
    support.nonEnumArgs = true;
  }
}(0, 0));

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = +value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on ES `ToLength`. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = length && isLength(length) &&
    (isArray(object) || (support.nonEnumArgs && isArguments(object)));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is the language type of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return type == 'function' || (value && type == 'object') || false;
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (object) {
    var Ctor = object.constructor,
        length = object.length;
  }
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && (length && isLength(length)))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keys;

},{"lodash.isarguments":9,"lodash.isarray":10,"lodash.isnative":16}],16:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],17:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseCopy = require('lodash._basecopy'),
    keysIn = require('lodash.keysin');

/**
 * Converts `value` to a plain object flattening inherited enumerable
 * properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return baseCopy(value, keysIn(value));
}

module.exports = toPlainObject;

},{"lodash._basecopy":18,"lodash.keysin":19}],18:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies the properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Array} props The property names to copy.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, object, props) {
  if (!props) {
    props = object;
    object = {};
  }
  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],19:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13,"lodash.isarguments":9,"lodash.isarray":10}],20:[function(require,module,exports){
try {
	var _ = require('underscore');
} catch (e) {
	var _ = window._;
}
try {
	var Backbone = require('backbone');
} catch (e) {
	var Backbone = window.Backbone;
}
var merge = require('lodash.merge');

/**
 * Takes a nested object and returns a shallow object keyed with the path names
 * e.g. { "level1.level2": "value" }
 *
 * @param  {Object}      Nested object e.g. { level1: { level2: 'value' } }
 * @return {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
 */
function objToPaths(obj, ignoreArray) { //Tim's Hack: added ignoreArray option!
	var ret = {},
		separator = DeepModel.keyPathSeparator;

	for (var key in obj) {
		var val = obj[key];

		if (val && (val.constructor === Object || (!ignoreArray && val.constructor === Array)) && !_.isEmpty(val)) {
			//Recursion for embedded objects
			var obj2 = objToPaths(val, ignoreArray);

			for (var key2 in obj2) {
				var val2 = obj2[key2];

				ret[key + separator + key2] = val2;
			}
		} else {
			ret[key] = val;
		}
	}

	return ret;
}

/**
 * [getNested description]
 * @param  {object} obj           to fetch attribute from
 * @param  {string} path          path e.g. 'user.name'
 * @param  {[type]} return_exists [description]
 * @return {mixed}                [description]
 */
function getNested(obj, path, return_exists) {
	var separator = DeepModel.keyPathSeparator;

	var fields = path ? path.split(separator) : [];
	var result = obj;
	return_exists || (return_exists === false);
	for (var i = 0, n = fields.length; i < n; i++) {
		if (return_exists && !_.has(result, fields[i])) {
			return false;
		}
		result = result[fields[i]];

		if (result == null && i < n - 1) {
			result = {};
		}

		if (typeof result === 'undefined') {
			if (return_exists) {
				return true;
			}
			return result;
		}
	}
	if (return_exists) {
		return true;
	}
	return result;
}



/**
 * @param {Object} obj                Object to fetch attribute from
 * @param {String} path               Object path e.g. 'user.name'
 * @param {Object} [options]          Options
 * @param {Boolean} [options.unset]   Whether to delete the value
 * @param {Mixed}                     Value to set
 */
function setNested(obj, path, val, options) {
	options = options || {};

	var separator = DeepModel.keyPathSeparator;

	var fields = path ? path.split(separator) : [];
	var result = obj;
	for (var i = 0, n = fields.length; i < n && result !== undefined; i++) {
		var field = fields[i];

		//If the last in the path, set the value
		if (i === n - 1) {
			options.unset ? delete result[field] : result[field] = val;
		} else {
			//Create the child object if it doesn't exist, or isn't an object
			if (typeof result[field] === 'undefined' || !_.isObject(result[field])) {
				var nextField = fields[i + 1];

				// create array if next field is integer, else create object
				result[field] = /^\d+$/.test(nextField) ? [] : {};
			}

			//Move onto the next part of the path
			result = result[field];
		}
	}
}

function deleteNested(obj, path) {
	setNested(obj, path, null, {
		unset: true
	});
}

var DeepModel = Backbone.Model.extend({

	// Override constructor
	// Support having nested defaults by using _.deepExtend instead of _.extend
	constructor: function(attributes, options) {
		var defaults;
		var attrs = attributes || {};
		this.cid = _.uniqueId('c');
		this.attributes = {};
		if (options && options.collection) this.collection = options.collection;
		if (options && options.parse) attrs = this.parse(attrs, options) || {};
		if (defaults = _.result(this, 'defaults')) {
			//<custom code>
			// Replaced the call to _.defaults with _.deepExtend.
			attrs = merge(defaults, attrs);
			//</custom code>
		}
		this.set(attrs, options);
		this.changed = {};
		this.initialize.apply(this, arguments);
	},

	// Return a copy of the model's `attributes` object.
	toJSON: function(options) {
		return merge({}, this.attributes);
	},

	// Override get
	// Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
	get: function(attr) {
		return getNested(this.attributes, attr);
	},

	// Override set
	// Supports nested attributes via the syntax 'obj.attr' e.g. 'author.user.name'
	set: function(key, val, options) {
		var attr, attrs, unset, changes, silent, changing, prev, current;
		if (key == null) return this;

		// Handle both `"key", value` and `{key: value}` -style arguments.
		if (typeof key === 'object') {
			attrs = key;
			options = val || {};
		} else {
			(attrs = {})[key] = val;
		}

		options || (options = {});

		// Run validation.
		if (!this._validate(attrs, options)) return false;

		// Extract attributes and options.
		unset = options.unset;
		silent = options.silent;
		changes = [];
		changing = this._changing;
		this._changing = true;

		if (!changing) {
			this._previousAttributes = merge({}, this.attributes); //<custom>: Replaced _.clone with _.deepClone
			this.changed = {};
		}
		current = this.attributes, prev = this._previousAttributes;

		// Check for changes of `id`.
		if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

		//<custom code>
		attrs = objToPaths(attrs, true);//Tim's Hack: activate ignoreArray option! no more array.0.xyz
                                    //This is to fix the array 'shrink' problem with 'change':
                                    //set('array', [1, 2, 3])
                                    //set('array', [1]) will give no 'change' event.
		//</custom code>

		// For each `set` attribute, update or delete the current value.
		for (attr in attrs) {
			val = attrs[attr];

			//<custom code>: Using getNested, setNested and deleteNested
			if (!_.isEqual(getNested(current, attr), val)) changes.push(attr);
			if (!_.isEqual(getNested(prev, attr), val)) {
				setNested(this.changed, attr, val);
			} else {
				deleteNested(this.changed, attr);
			}
			unset ? deleteNested(current, attr) : setNested(current, attr, val);
			//</custom code>
		}

		// Trigger all relevant attribute changes.
		if (!silent) {
			if (changes.length) this._pending = true;

			//<custom code>
			var separator = DeepModel.keyPathSeparator;
			var alreadyTriggered = {}; // * @restorer

			for (var i = 0, l = changes.length; i < l; i++) {
				var key = changes[i];

				if (!alreadyTriggered.hasOwnProperty(key) || !alreadyTriggered[key]) { // * @restorer
					alreadyTriggered[key] = true; // * @restorer
					this.trigger('change:' + key, this, getNested(current, key), options);
				} // * @restorer

				var fields = key.split(separator);

				//Trigger change events for parent keys with wildcard (*) notation
				for (var n = fields.length - 1; n > 0; n--) {
					var parentKey = fields.slice(0, n).join(separator),
						wildcardKey = parentKey + separator + '*';

					if (!alreadyTriggered.hasOwnProperty(wildcardKey) || !alreadyTriggered[wildcardKey]) { // * @restorer
						alreadyTriggered[wildcardKey] = true; // * @restorer
						this.trigger('change:' + wildcardKey, this, getNested(current, parentKey), options);
					} // * @restorer

					// + @restorer
					if (!alreadyTriggered.hasOwnProperty(parentKey) || !alreadyTriggered[parentKey]) {
						alreadyTriggered[parentKey] = true;
						this.trigger('change:' + parentKey, this, getNested(current, parentKey), options);
					}
					// - @restorer
				}
				//</custom code>
			}
		}

		if (changing) return this;
		if (!silent) {
			while (this._pending) {
				this._pending = false;
				this.trigger('change', this, options);
			}
		}
		this._pending = false;
		this._changing = false;
		return this;
	},

	// Clear all attributes on the model, firing `"change"` unless you choose
	// to silence it.
	clear: function(options) {
		var attrs = {};
		var shallowAttributes = objToPaths(this.attributes);
		for (var key in shallowAttributes) attrs[key] = void 0;
		return this.set(attrs, _.extend({}, options, {
			unset: true
		}));
	},

	// Determine if the model has changed since the last `"change"` event.
	// If you specify an attribute name, determine if that attribute has changed.
	hasChanged: function(attr) {
		if (attr == null) return !_.isEmpty(this.changed);
		return getNested(this.changed, attr) !== undefined;
	},

	// Return an object containing all the attributes that have changed, or
	// false if there are no changed attributes. Useful for determining what
	// parts of a view need to be updated and/or what attributes need to be
	// persisted to the server. Unset attributes will be set to undefined.
	// You can also pass an attributes object to diff against the model,
	// determining if there *would be* a change.
	changedAttributes: function(diff) {
		//<custom code>: objToPaths
		if (!diff) return this.hasChanged() ? objToPaths(this.changed) : false;
		//</custom code>

		var old = this._changing ? this._previousAttributes : this.attributes;

		//<custom code>
		diff = objToPaths(diff);
		old = objToPaths(old);
		//</custom code>

		var val, changed = false;
		for (var attr in diff) {
			if (_.isEqual(old[attr], (val = diff[attr]))) continue;
			(changed || (changed = {}))[attr] = val;
		}
		return changed;
	},

	// Get the previous value of an attribute, recorded at the time the last
	// `"change"` event was fired.
	previous: function(attr) {
		if (attr == null || !this._previousAttributes) return null;

		//<custom code>
		return getNested(this._previousAttributes, attr);
		//</custom code>
	},

	// Get all of the attributes of the model at the time of the previous
	// `"change"` event.
	previousAttributes: function() {
		//<custom code>
		return merge({}, this._previousAttributes);
		//</custom code>
	}
});


//Config; override in your app to customise
DeepModel.keyPathSeparator = '.';


module.exports = DeepModel;

},{"backbone":undefined,"lodash.merge":2,"underscore":undefined}]},{},[1]);

;/**
 * Overriding the special M.Application module so that,
 *
 * It waits for `callbacks:all-done` event from its init chain and trigger `app:initialized`.
 *
 * Usage
 * -----
 * All init routines added through `app.addInitializer()` can now contain async code.
 * ```
 * app.addInitializer(function(){
 *    return app.remote('some-data.json').done(...);
 * });
 * ```
 *
 * Deps
 * ----
 * see callbacks.js
 *
 * @author Tim Lauv
 * @created 2016.03.24
 */
;(function(app){

	_.extend(Marionette.Application.prototype, {

		// kick off all of the application's processes.
		// initializes all of the regions that have been added
		// to the app, and runs all of the initializer functions (+async promise)
		start: function(options){
			this._initCallbacks.once('callbacks:all-done', function(noi){
				app.trigger('app:initialized', options);
			});
			this._initCallbacks.run(options, this);
		},

	});

})(Application);
;/**
 * Overriding the special M.Callbacks module so that any callback in the chain
 * could return a promise for async operations. 
 *
 * Final done event is `callbacks:all-done` triggered on the Callbacks object (now also has events!).
 *
 * Caveat 1: we skipped this._callbacks since it is always initialized with length 2 ... :S
 * Caveat 2: changes made here also affect all the init/finalize chains in M.Modules, but luckily no one is using them.
 *
 * @author Tim Lauv
 * @created 2016.03.24
 */
;(function(app) {

    _.extend(Marionette.Callbacks.prototype, Backbone.Events, {

        // Add a callback to be executed. Callbacks added here are
        // guaranteed to execute, even if they are added after the
        // `run` method is called.
        add: function(callback, contextOverride) {
        	this._cbs = this._cbs || [];
            this._cbs.push({ cb: callback, ctx: contextOverride });

            var that = this;
            this._deferred.done(function(context, options) {
                if (contextOverride) { context = contextOverride; }
                var result = callback.call(context, options);
                //both sync and async objects can be returned by a callback/initializer
                $.when(result).always(function(){
                    that._alldone();
                });
            });
        },

        // Run all registered callbacks with the context specified.
        // Additional callbacks can be added after this has been run
        // and they will still be executed.
        run: function(options, context) {
            var that = this;
            this._cbs = this._cbs || [];
            if(this._cbs.length){
	            this._alldone = _.after(this._cbs.length, function() {
	                that.trigger('callbacks:all-done', that._cbs.length);
	            });
	            this._deferred.resolve(context, options);
	        }else {
	        	this.trigger('callbacks:all-done');
	        }
        },

        // Resets the list of callbacks to be run, allowing the same list
        // to be run multiple times - whenever the `run` method is called.
        reset: function() {
            var callbacks = this._cbs;
            this._deferred = Marionette.$.Deferred();
            this._cbs = [];
            this._alldone = _.noop;

            _.each(callbacks, function(cb) {
                this.add(cb.cb, cb.ctx);
            }, this);
        }
    });

})(Application);
;/**
 * Override M.TemplateCache to hookup our own template-builder.js util
 *
 * @author Tim Lauv
 * @created 2014.02.25
 * @updated 2016.03.24
 */
;(function(app){

	_.extend(Backbone.Marionette.TemplateCache, {
		// Get the specified template by id. Either
		// retrieves the cached version, or loads it
		// through cache.load
		get: function(templateId) {
		    var cachedTemplate = this.templateCaches[templateId] || this.make(templateId);
		    return cachedTemplate.load(); //-> cache.loadTemplate()
		},

		//+ split out a make cache function from the original mono get()
		//used in a. app.inject.tpl/app.Util.Tpl.remote
		//consulted in b. cache.loadTemplate
		make: function(templateId, rawTemplate) {
			var cachedTemplate = new Marionette.TemplateCache(templateId);
			this.templateCaches[templateId] = cachedTemplate;
			cachedTemplate.rawTemplate = rawTemplate;
			return cachedTemplate;
		}

	});

	_.extend(Backbone.Marionette.TemplateCache.prototype, {

		//1 Override the default raw-template retrieving method 
		//(invoked by M.TemplateCache.get() by cache.load() if the cache doesn't have cache.compiledTemplate)
		//We allow both #id or @*.html/.md(remote) and template html string(or string array) as parameter.
		//This method is only invoked with a template cache miss. So clear your cache if you have changed the template. (app.Util.Tpl.cache.clear(name))
		loadTemplate: function(idOrTplString){
			//local in-DOM template
			if(_.string.startsWith(idOrTplString, '#')) 
				return $(idOrTplString).html();
			//remote template (with local stored map cache)
			if(_.string.startsWith(idOrTplString, '@')) {
				var rtpl;
				//fetch from cache
				if(this.rawTemplate){
					rtpl = this.rawTemplate;
				}
				//fetch from remote: (might need server-side CORS support)
				//**Caveat: triggering app.inject.tpl() will replace the cache object that triggered this loadTemplate() call.
				else
					//sync mode injecting
					app.inject.tpl(idOrTplString, true).done(function(tpl){
						rtpl = tpl;
					});

				//pre-process the markdown if needed (put here to also support batched all.json tpl injected markdowns)
				if(_.string.endsWith(idOrTplString, '.md'))
					rtpl = app.markdown(rtpl);
				return rtpl;
			}
			//string and string array
			return app.Util.Tpl.build(idOrTplString);
			//this can NOT be null or empty since Marionette.Render guards it so don't need to use idOrTplString || ' ';
		},

		//2 Override to use Handlebars templating engine with Backbone.Marionette
		compileTemplate: function(rawTemplate) {
		    return Handlebars.compile(rawTemplate);
		},

	});

})(Application);

;/**
 * Override the RegionManager methods (for refinement and bug fixing)
 *
 * @author Tim Lauv
 * @created 2016.02.05
 */

;(function(app){

	_.extend(Marionette.RegionManager.prototype, {

	    // Close all regions in the region manager, but
	    // leave them attached
	    closeRegions: function(_cb) {
	    	if(!_.size(this._regions))//**Caveat: this._regions is not an [];
	    		return _cb && _cb();

	    	var callback = _.after(_.size(this._regions), function(){
	    		_cb && _cb();
	    	});
	        _.each(this._regions, function(region, name) {
	            region.close(callback);
	        }, this);
	    },

	    // *Close all regions* and shut down the region-manager entirely
	    // *region.close()* needs a sync on close effects;
	    close: function(_cb) {
	    	this.closeRegions(_.bind(function(){
		        this.removeRegions();
		        Marionette.Controller.prototype.close.apply(this, arguments);
		        _cb && _cb();
	    	}, this)); //was missing in M v1.8.9
	    },

	});

})(Application);
;/**
 * Enhancing the Backbone.Marionette.Region Class
 *
 * 1. open()/close/show() (altered to support enter/exit effects)
 * --------------
 * a. consult view.effect animation names (from Animate.css or your own, not from jQuery ui) when showing a view;
 * b. inject parent view as parentCt to sub-regional view;
 *
 * 2. resize()
 * -----------
 * ...
 *
 *
 * Effect config
 * -------------
 * in both view & region
 * 
 * use the css animation name as enter (show) & exit (close) effect name.
 * 1. 'lightSpeed' or {enter: 'lightSpeedIn', exit: '...'} in view definition
 * 2. effect="lightSpeed" or effect-enter="lightSpeedIn" effect-exit="..." on region tag
 *
 * https://daneden.github.io/animate.css/
 * 
 *
 * Show
 * -------------
 * 1. means view.$el is in DOM, (sub-region view will only render after parent region 'show')
 * 2. 'show' will be triggered after enter animation done.
 * 
 * @author Tim Lauv
 * @updated 2014.03.03
 * @updated 2015.08.10
 * @updated 2015.12.15
 * @updated 2015.02.03
 */

;(function(app) {

    _.extend(Backbone.Marionette.Region.prototype, {

        //'region:show', 'view:show' will always trigger after effect done.
        //note that, newView is always a view instance.
    	show: function(newView, options){
            this.ensureEl();
            
            var view = this.currentView;
            if (view) {
                this.close(_.bind(function(){
                    this._show(newView, options);
                }, this));
                return this;
            }
            return this._show(newView, options);
    	},

    	//modified show method (removed preventClose & same view check)
        _show: function(view, options) {

            //so now you can use region.show(app.view({...anonymous...}));
            if(_.isFunction(view))
                view = new view(options);

            view.render();
            Marionette.triggerMethod.call(this, "before:show", view);

            if (_.isFunction(view.triggerMethod)) {
                view.triggerMethod("before:show");
            } else {
                Marionette.triggerMethod.call(view, "before:show");
            }

            this.open(view, _.bind(function(){

                //original region:show from M.Region
                //Marionette.triggerMethod.call(this, "show", view);

                //call view:show
                if (_.isFunction(view.triggerMethod)) {
                    view.triggerMethod("show");
                } else {
                    Marionette.triggerMethod.call(view, "show");
                }

                //delay region:show till after view:show (to accommodate navRegion build up in Layout)
                Marionette.triggerMethod.call(this, "show", view);
            }, this));

            return this;
        },

        open: function(view, _cb) {
            var that = this;

            //from original open() method in Marionette
            this.$el.empty().append(view.el);
            //-----------------------------------------
            
            //mark currentView, parentRegion
            this.currentView = view;
            view.parentRegion = this;

            //inject parent view container through region into the regional views
            if (this._parentLayout) {
                view.parentCt = this._parentLayout;
                //also passing down the name of the outter-most context container.
                if (this._parentLayout.category === 'Context') view.parentCtx = this._parentLayout;
                else if (this._parentLayout.parentCtx) view.parentCtx = this._parentLayout.parentCtx;
            }

            //play effect (before 'show')
            var enterEffect = (_.isPlainObject(view.effect) ? view.effect.enter : (view.effect ? (view.effect + 'In') : '')) || (this.$el.attr('effect')? (this.$el.attr('effect') + 'In') : '') || this.$el.attr('effect-enter');
            if (enterEffect) {
                view.$el.addClass(enterEffect + ' animated').one(app.ADE, function() {
                    view.$el.removeClass('animated ' + enterEffect);
                    _cb && _cb();
                });
            }else
                _cb && _cb();

            return this;
        },

        // Close the current view, if there is one. If there is no
        // current view, it does nothing and returns immediately.
        // 'region:close', 'view:close' will be triggered after animation effect done.
        close: function(_cb) {
            var view = this.currentView;
            if (!view || view.isClosed) {
                _cb && _cb();
                return;
            }

            // call 'close' or 'remove', depending on which is found
            if (view.close) {
                var callback = _.bind(function(){
                    Marionette.triggerMethod.call(this, "close", view);
                    delete this.currentView;
                    _cb && _cb(); //for opening new view immediately (internal, see show());
                }, this);

                var exitEffect = (_.isPlainObject(view.effect) ? view.effect.exit : (view.effect ? (view.effect + 'Out') : '')) || (this.$el.attr('effect')? (this.$el.attr('effect') + 'Out'): '') || this.$el.attr('effect-exit');
                if (exitEffect) {
                    view.$el.addClass(exitEffect + ' animated')
                    .one(app.ADE, function(e) {
                        e.stopPropagation();
                        view.close(callback);
                    });
                    return;
                }else
                    view.close(callback);
            } else if (view.remove) {
                view.remove();
                Marionette.triggerMethod.call(this, "close", view);
                delete this.currentView;
                _cb && _cb(); //for opening new view immediately (internal, see show());
            }
        },

    });

})(Application);

;/**
 * This is where we extend and enhance the abilities of a View through init,lifecycle augmentation.
 * 
 * View life-cycle:
 * ---------------
 * new View
 * 		|
 * 		is
 * 		|
 * [M.Layout*] see layout.js
 * 		|+render()*, +close()*, +regions recognition (+effects recognition)
 * 		|
 * M.ItemView
 * 		|+render() --> this.getTemplate() --> M.Renderer.render --> M.TemplateCache.get --> cache.load --> cache.loadTemplate
 * 		|+set()/get() [for data loading, 1-way binding (need 2-way binders?)]
 * 		|[use bindUIElements() in render()]
 * 		|
 * [M.View.prototype.constructor*] (this file, does NOT have render())
 * 		|+fixed enhancements, +ui recognition,
 * 		|+pick and activate optional ones (b, see below List of view options...)
 * 		|
 * M.View.apply(this)
 * 		|+close, +this.options, +bindUIElements
 * 		|
 * BB.View.prototype.constructor
 * 		|+events, +remove, +picks (a, see below List of view options...)
 * 		|
 * 	 ._ensureElement()
 *   .initialize(options) [options is already available in this.options]
 * 	 .delegateEvents() (pickup .events)
 * 		|
 * ---------------
 * 
 * Fixed enhancement:
 * +pick additional live options
 * +rewire get/set to getVal/setVal for Editor view.
 * +auto ui tags detection and register
 * +meta event programming (view:* (event-name) - on* (camelized))
 * +coop e support
 * +useParentData support
 * +view name to $el metadata
 * (see ItemView for the rest of optional abilities, e.g template, data, actions, editors, tooltips, overlay, popover, ...)
 *
 * List of view options passed through new View(opt) that will be auto-merged as properties:
 * 		a. from Backbone.View ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
 * 		b*. from M.View ['templateHelpers']; (through M.getOption() -- tried both this and this.options)
 *   	c. from us ['effect', 'template', 'layout', 'data'/'useParentData', 'ui', 'coop', 'actions', 'editors', 'tooltips', 'overlay', 'popover', 'svg'];
 *
 * Tip:
 * All new View(opt) will have this.options = opt ready in initialize(), also this.*[all auto-picked properties above].
 * 
 * Note: that 'svg' is deprecated and will be changed in the future.
 * Note: override View.constructor to affect only decendents, e.g ItemView and CollectionView... 
 * (This is the Backbone way of extend...)
 * Note: this.name and this.category comes from core.reusable registry.
 * Note: $.plugin effects are from jQuery.UI, view/region effects are from animate.css
 * 
 * 
 * @author Tim Lauv
 * @created 2014.02.25
 * @updated 2015.08.03
 * @updated 2016.09.06
 */


;(function(app){

	//+api
	_.extend(Backbone.Marionette.View.prototype, {
		//expose isInDOM method (hidden in marionette.domRefresh.js)
		isInDOM: function(){
			if(!this.$el) return undefined;
			return $.contains(document.documentElement, this.$el[0]);
		},

		//override to give default empty template
		getTemplate: function(){
			return Marionette.getOption(this, 'template') || (
				(Marionette.getOption(this, 'editors') || Marionette.getOption(this, 'svg') || Marionette.getOption(this, 'layout'))? ' ' : '<div class="wrapper-full bg-warning"><p class="h3" style="margin:0;"><span class="label label-default" style="display:inline-block;">No Template</span> ' + this.name + '</p></div>'
			);
		},

		//local collaboration under the same parentCt (Trick: use this.coop() instead of this._coop())
		_coop: function(){
			var pCt = this.parentCt, listener = app.Util.metaEventToListenerName(arguments[0]);
			while (pCt && !pCt[listener]) pCt = pCt.parentCt;
			if(pCt) pCt[listener].apply(pCt, _.toArray(arguments).slice(1));
		},

		//activate tooltips (bootstrap version)
		_enableTooltips: function(options){
			this.listenTo(this, 'render', function(){
				//will activate tooltip with specific options object - see /libs/bower_components/bootstrap[x]/docs/javascript.html#tooltips
				this.$('[data-toggle="tooltip"]').tooltip(options);
			});
		},

		/**
		 * Action Tag listener hookups +actions{} (do it in initialize())
		 * + event forwarding ability to action tags
		 * Usage
		 * -----
		 * 		1. add action tags to html template -> e.g  <div ... action="listener"></div>
		 * 													<div ... action-dblclick="listener"></div>
		 * 													<div ... action-scroll="view:method-name"></div>
		 * 		2. implement the action method name in UI definition body's actions{} object. 
		 * 		functions under actions{} are invoked with 'this' as scope (the view object).
		 * 		functions under actions{} are called with a 2 params ($action, e) which is a jQuery object referencing the action tag and the jQuery prepared event object, use e.originalEvent to get the DOM one.
		 *
		 * Options
		 * -------
		 * 1. uiName - [_UNKNOWN_.View] this is optional, mainly for better debugging msg;
		 * 2. passOn - [false] this is to let the event of action tags bubble up if an action listener is not found. 
		 *
		 * Caveat
		 * ------
		 * Your listeners might need to be _.throttled() with app.config.rapidEventDelay.
		 * 
		 * Note:
		 * A. We removed _.bind() altogether from the _enableActionTags() function and use Function.apply(scope, args) instead for listener invocation to avoid actions{} methods binding problem.
		 * Functions under actions will only be bound ONCE to the first instance of the view definition, since _.bind() can not rebind functions that were already bound, other instances of
		 * the view prototype will have all the action listeners bound to the wrong view object. This holds true to all nested functions, if you assign the bound version of the function back to itself
		 * e.g. this.nest.func = _.bind(this.nest.func, this); - Do NOT do this in initialize()/constructor()!! Use Function.apply() for invocation instead!!!
		 *
		 * B. We only do e.stopPropagation for you, if you need e.preventDefault(), do it yourself in the action impl;
		 */
		_enableSpecialActionTags: function(){
			var that = this;
			_.each(['scroll', 'scroll-bottom', 'scroll-top', /*'left,right'*/ 'error', 'load'], function(e){
				this.$el.find('[action-' + e + ']').each(function(index, el){
					//extra e.sub-events are handled by e listener, so skip.
					var tmp = e.split('-');
					var $el = $(this);
					if($el.data('special-e-' + tmp[0])) return;

					$el.on(tmp[0], function(innerE){
						//dirty hack to make scroll-bottom/-top [/-left/-right] work in actions
						if(innerE.type === 'scroll'){
							if($el.attr('action-scroll-bottom'))
								//window scroll distance  + window height (include padding) === inner doc height.
								($el.scrollTop() + $el.innerHeight() === $el.prop('scrollHeight')) && (innerE.type += '-bottom');
							if($el.attr('action-scroll-top'))
								($el.scrollTop() === 0) && (innerE.type += '-top');
							// case 'left':
							// case 'right':
							//**NOTE: that, scroll-* will always be triggered by scroll, we just ignore it when there is no action-scroll tag
							if(innerE.type === 'scroll' && !$el.attr('action-scroll'))
								return;
						}
						that._doAction(innerE);
					}).data('special-e-' + tmp[0], 'registered');
				});
			}, this);
		},
		_enableActionTags: function(uiName, passOn){ //the uiName is just there to output meaningful dev msg if some actions haven't been implemented.

			if(_.isBoolean(uiName)){
				passOn = uiName;
				uiName = '';
			}
			passOn = passOn || false;
			this.events = this.events || {};
			//hookup general action tag event listener dispatcher
			//**Caveat**: _doAction is not _.throttled() with app.config.rapidEventDelay atm.
			_.extend(this.events, {
				//------------default------------------------------
				'click [action]': '_doAction',

				//------------<any>--------------------------------
				'click [action-click]': '_doAction',
				'dblclick [action-dblclick]': '_doAction',
				'contextmenu [action-contextmenu]': '_doAction',

				'mousedown [action-mousedown]': '_doAction',
				'mousemove [action-mousemove]': '_doAction',
				'mouseup [action-mouseup]': '_doAction',
				'mouseenter [action-mouseenter]': '_doAction', //per tag, [not a bubble event in some browser, use mouseover]
				'mouseleave [action-mouseleave]': '_doAction', //per tag, [not a bubble event in some browser, use mouseout]
				'mouseover [action-mouseover]': '_doAction', //=enter but bubble
				'mouseout [action-mouseout]': '_doAction', //=leave but bubble

				//note that 'hover' is not a valid event.

				'keydown [action-keydown]': '_doAction',
				'keyup [action-keyup]': '_doAction',
				//'keypress [action-keypress]': '_doAction', //use keydown instead (non-printing keys and focus-able diff)

				//'focus [action-focus]': '_doAction', //use focusin instead (non bubble even with passOn: true in IE)
				'focusin [action-focusin]': '_doAction', //tabindex=seq or -1
				'focusout [action-focusout]': '_doAction', //tabindex=seq or -1
				//'blur [action-blur]': '_doAction', //use focusin instead (non bubble even with passOn: true in IE, FF)

				//------------<input>, <select>, <textarea>--------
				'change [action-change]': '_doAction',
				'select [action-select]': '_doAction', //text selection only <input>, <textarea>
				'submit [action-submit]': '_doAction', //<input type="submit">, <input type="image"> or <button type="submit">

				//------------<div>, <any.overflow>----------------
				//'scroll [action-scroll]': '_doAction', //non bubble, see _enableSpecialActionTags
				//'scroll-bottom'
				//'scroll-top'

				//------------<script>, <img>, <iframe>------------
				//'error [action-error]': '_doAction', //non bubble, _enableSpecialActionTags
				//'load [action-load]': '_doAction' //non bubble, _enableSpecialActionTags

				//window events:
				// load [use $(ready-fn) instead],
				// unload, 
				// resize [use coop 'window-resized'], 
				// scroll [use coop 'window-scroll'],

			});
			this.actions = this.actions || {}; 	
			uiName = uiName || this.name || '_UNKNOWN_.View';

			//captured events will not bubble further up (due to e.stopPropagation)
			this._doAction = function(e){

				//**Caveat: non-bubble event will not change e.currentTarget to be current el (the one has [action-*])
				var $el = $(e.currentTarget);
				var action = $el.attr('action-' + e.type) || $el.attr('action') || ('_NON-BUBBLE_' + e.type);
				var lockTopic = $el.attr('lock'),
				unlockTopic = $el.attr('unlock');

				if(unlockTopic) app.unlock(unlockTopic);

				if(lockTopic && !app.lock(lockTopic)){
					e.stopPropagation();
					e.preventDefault();
					app.trigger('app:locked', action, lockTopic);
					return;
				}

				if($el.hasClass('disabled') || $el.parent().hasClass('disabled')) {
					e.stopPropagation();
					e.preventDefault();					
					return;
				}

				//Special: only triggering a meta event (e.g action-dblclick=view:method-name) without doing anything.
				var eventForwarding = String(action).split(':');
				if(eventForwarding.length >= 2) {
					while(eventForwarding.length > 2)
						eventForwarding.shift();
					e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					return this.trigger(eventForwarding.join(':'));
				}

				//Normal: call the action fn
				var doer = this.actions[action];
				if(doer) {
					e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					doer.apply(this, [$el, e, lockTopic]); //use 'this' view object as scope when applying the action listeners.
				}else {
					if(passOn){
						return;
					}else {
						e.stopPropagation(); //Important::This is to prevent confusing the parent view's action tag listeners.
					}
					throw new Error('DEV::' + (uiName || 'UI Component') + '::_enableActionTags() You have not yet implemented this action - [' + action + ']');
				}
			};		
		},

		/**
		 * Activation tags (similar to actions but only for a limited group of mouse events)
		 *
		 * Note that it only fires the `activated` events on the view and adds `.active` or user specified classes (after :...) to the tag
		 * 
		 * Usage
		 * -----
		 * 1. add activate="group-name[:classes]" to your div/li/span/input or any tags;
		 * 2. use "*group-name[:classes]" for multi-activation otherwise it will be exclusive activation only (e.g only one element with .active class at a given time);
		 * 3. use deactivate="group-name" for auto reverse effect of the above; (only removes the classes on current tag)
		 *
		 * When it adds classes upon user io trigger, it also fires the `view:item-activated` event on the view;
		 * When it removes classes, it also fires the `view:item-deactivated` event (only for click/dblclick atm ...>.<...) on the view;
		 *
		 * Supported e
		 * -----------
		 * You can use activate-<trigger e>="..." and deactivate-<trigger e>="..." for other supported mouse triggers
		 *
		 * Symmetrical:
		 * 		click (default)
		 *   	dblclick
		 *
		 * Asymmetrical:
		 * 		mouseover/mouseout
		 *   	focusin/focusout
		 * 
		 */
		_enableActivationTags: function(){
			this.events = this.events || {};
			_.extend(this.events, {
				//------------default------------------------------
				'click [activate]': '_doActivation',
				'click [deactivate]': '_doDeactivation',

				//------------<any>--------------------------------
				'click [activate-click]': '_doActivation',
				'click [deactivate-click]': '_doDeactivation',
				'dblclick [activate-dblclick]': '_doActivation',
				'dblclick [deactivate-dblclick]': '_doDeactivation',
				//asymm
				'mouseover [activate-mouseover]': '_doActivation', //=enter but bubble
				'mouseout [deactivate-mouseout]': '_doDeactivation', //=leave but bubble
				'focusin [activate-focusin]': '_doActivation', //tabindex=seq or -1
				'focusout [deactivate-focusout]': '_doDeactivation', //tabindex=seq or -1
			});

			//Note: Need to use $el.data instead of $el._var for persisting marks and states on el.
			this._doActivation = function(e, silent){
				var $el = $(e.currentTarget);
				var activate = ($el.attr('activate-' + e.type) || $el.attr('activate')).split(':');
				var group = activate[0], classes = activate[1] || 'active';
				if($el.data('deactivation-' + group)) return; //skip already activated item

				//0. set $el._cancelDeactivation = true (single group single e.type) if it hasn't been;
				if(!$el.data('cancel-deactivation'))
					$el.data('cancel-deactivation', true);
				//1. if group didn't starts with *, go remove all other in-group $el's classes (within this view.$el);
				if(!_.string.startsWith(group, '*')){
					this.$el.find('[activate^=' + group + ']').removeClass(classes).removeData('deactivation-' + group);
					this.$el.find('[activate-' + e.type + '^=' + group + ']').removeClass(classes).removeData('deactivation-' + group);
				}
				//2. add classes to $el, mark the activated item;
				$el.addClass(classes);
				$el.data('deactivation-' + group, classes);
				//3. fire the view:item-activated event
				if(!silent)
					this.trigger('view:item-activated', $el, group, classes);

				//finally
				e.stopPropagation(); //Important::This is to prevent confusing the parent view's activation tag listener.
			};

			//Caveat: 'view:item-deactivated' only triggers on click and dblclick deactivations...(-?-)
			this._doDeactivation = function(e){
				var $el = $(e.currentTarget);
				var group = $el.attr('deactivate-' + e.type) || $el.attr('deactivate');
				if(!group) return; //abort

				//0. if $el._cancelDeactivation remove it and abort, this is for not deactivate right after activate with deactivate="true"; 
				if($el.data('cancel-deactivation')) {
					$el.removeData('cancel-deactivation')
					return;
				}

				//1. remove classes from $el;
				var classes = $el.data('deactivation-' + group);
				if(classes){
					$el.removeClass(classes);
					$el.removeData('deactivation-' + group);
					//1. fire the view:item-deactivated event
					this.trigger('view:item-deactivated', $el, group, classes);
				}
				
				//finally
				e.stopPropagation(); //Important::This is to prevent confusing the parent view's activation tag listener.
			};

			//+Manual api (for silent feedback calls - no 'view:item-activated' event fired by default)
			this.activate = function(group, matchFn /*or index or [attr=""] selector*/, loud){
				var $items, attr, events = ['', 'click', 'dblclick', 'mouseover', 'focusin']; //Refactor: Cache it!
				if(_.isNumber(matchFn)){
					var index = matchFn;
					matchFn = function(i){
						return i == index;
					};
				}
				//search for group (per event)
				for(var i in events){
					var e = events[i];
					attr = e ? 'activate-' + e : 'activate';
					$items = this.$el.find(app.debug('[' + attr + '^=' + group + ']'));
					if($items.length)
						return $items.filter(matchFn).trigger(e || 'click', !loud);
				}
			};
		},

		/**
		 * Overlay
		 * options:
		 * 1. anchor - css selector of parent html el
		 * 2. rest of the $.overlay plugin options without content and onClose
		 */
		_enableOverlay: function(){
			this._overlayConfig = _.isBoolean(this.overlay)? {}: this.overlay;
			this.overlay = function(anchor, options){
				var $anchor;
				if(anchor instanceof jQuery)
					$anchor = anchor;
				else if(_.isPlainObject(anchor)){
					options = anchor;
					anchor = options.anchor;
				}
				//'selector' or 'el'
				if(anchor)
					$anchor = $(anchor);
				else
					$anchor = $('body');
				options = options || {};

				var that = this;
				this.listenTo(this, 'close', function(){
					$anchor.overlay();//close the overlay if this.close() is called.
				});
				$anchor.overlay(_.extend(this._overlayConfig || {}, options, {
					content: function(){
						return that.render().el;
					},
					onShow: function(){
						//that.trigger('show'); //Trigger 'show' doesn't invoke onShow, use triggerMethod the Marionette way!
						that.triggerMethod('show'); //trigger event while invoking on{Event};
					},
					onClose: function(){
						that.close(); //closed by overlay x
					}
				}));
				return this;
			};			
		},

		/**
		 * Popover
		 * options:
		 * 1. anchor - css selector or el/$el
		 * 2. res of $.popover plugin options from bootstrap
		 */
	 	_enablePopover: function(){
	 		this._popoverConfig = _.isBoolean(this.popover)? {}: this.popover;
	 		this.popover = function(anchor, options){
	 			//default options
	 			var that = this,
	 				defaultOptions = {
		 				animation: false,
		 				html: true,
		 				content: this.render().$el,
		 				container: 'body',
		 				placement: 'auto right',//default placement is right
		 				//style: {..css..}
		 			},
		 			$anchor;
		 		//check para1(anchor point) is a jquery object or a DOM element
	 			if(anchor instanceof jQuery)
	 				//jquery object
	 				$anchor = anchor;
				else if(_.isPlainObject(anchor)){
					//none, check options.anchor
					options = anchor;
					anchor = options.anchor;
				}
	 			//'selector', 'el'
	 			if(anchor)
	 				$anchor = $(anchor);
	 			else{
	 				//wrong type of object
	 				throw new Error("RUNTIME::popover:: You must specify a anchor to use for this popover view...");
	 			}

	 			//check whether there is already a popover attach to the anchor
	 			//Caveat: animated popover might still be in the process of closing but invisible. (empty extra click)
	 			if($anchor.data('bs.popover')){
	 				var tempID = $anchor.data('bs.popover').$tip[0].id;
	 				//remove elements attached on anchor
	 				$anchor.popover('destroy');	
	 				//remove popover div
	 				$('#'+tempID).remove();
	 				//do NOT re-open it
	 				return;
	 			}
	 			//check whether user has data-content, if yes throw warning
	 			var dataOptions = $anchor.data() || {};
	 			if(dataOptions.content || dataOptions.html)
	 				console.warn('DEV::Popover::define data-content in the template will cause incorrect display for the popover view!');
	 			//merge user data with default option
	 			_.extend(defaultOptions, dataOptions);
	 			//merge options with default options
	 			options = options || {};
	 			options = _.extend(defaultOptions, this._popoverConfig, options);
	 			//check whether the placement has auto for better placement, if not add auto
	 			if(options.placement.indexOf('auto') < 0)
	 				options.placement = 'auto '+options.placement;
	 			//check whether user has given custom container
	 			if(options.container !== 'body'){
	 				console.warn('DEV::Popover::You have overwritten the container. It might cause incorrect in display.');
	 			}
	 			//check whether user has given the bond view
	 			if(!options.bond)
	 				console.warn('DEV::Popover::You have not provided a bond view. It might cause view close incorrectly');
	 			else{
	 				this.listenTo(options.bond, 'close', function(){
						if($anchor.data('bs.popover')){
							var tempID = $anchor.data('bs.popover').$tip[0].id;
							//remove elements on anchor
			 				$anchor.popover('destroy');
			 				//remove popover div
			 				$('#'+tempID).remove();	
						}
					});
	 			}
	 			//initialize the popover
	 			$anchor.popover(options)
	 			//add options.style (alias: css)
				.on('show.bs.popover', function(){
					that.$el.css(options.style || options.css || {});
				})
	 			//adjust the bottom placement, since it does not work well with auto
	 			.on('shown.bs.popover', function(){
					//auto + bottom does not work well, recheck on show event
					if(options.placement === 'auto bottom'){
						var $this = $(this),
							popId = $this.attr('aria-describedby'),
							$elem = $('#'+popId);
						//check whether already flipped
						if($elem[0].className.indexOf('top') > 0){
							var offset = $this.offset(),
								height = $this.height();
							//check necessity
							if(offset.top + height + $elem.height() < $window.height()){
								$anchor.data('bs.popover').options.placement = 'bottom';
								$anchor.popover('show');	
							}
						}
					}
					//that.trigger('show'); //Trigger 'show' doesn't invoke onShow, use triggerMethod the Marionette way!
					that.triggerMethod('show'); //trigger event while invoking on{Event};
				})
				.on('hidden.bs.popover', function(){
					//trigger view close method
					that.close();
				})
				.popover('toggle');
				//possible solution for repositioning the visible popovers on window resize event (experimental)
 				/*$window.on("resize", function() {
				    $(".popover").each(function() {
				        var popover = $(this),
				        	ctrl = $(popover.context);
				        if (popover.is(":visible")) {
				            ctrl.popover('show');
				        }
				    });
				});*/
				return this;
	 		};
	 	}
	});

	//*init, life-cycle
	Backbone.Marionette.View.prototype.constructor = function(options){
		options = options || {};

		//----------------------deprecated config---------------------------
		if((this.type || options.type) && !this.forceViewType)
			console.warn('DEV::View+::type is deprecated, please do not specify ' + (this.name?'in ' + this.name:''));
		//------------------------------------------------------------------

		//----------------------fixed view enhancements---------------------
		//auto-pick live init options
		_.extend(this, _.pick(options, ['effect', 'template', 'layout', 'data', 'useParentData', 'ui', 'coop', 'actions', 'dnd', 'selectable', 'editors', 'tooltips', 'overlay', 'popover', 'svg', /*'canvas'*/]));

		//re-wire this.get()/set() to this.getVal()/setVal(), data model in editors is used as configure object.
		if(this.category === 'Editor'){
			this.get = this.getVal;
			this.set = this.setVal;
		}

		//extend ui collection after first render (to support inline [ui=""] mark in template)
		//**Caveat: bindUIElements in item-view render() will not pick up changes made here. (we re-init [ui=]tags manually)
		this.listenTo(this, 'render', function(){
			var that = this;
			this.ui = this.ui || {};
			_.each(_.unique(this.$el.find('[ui]').map(function(){
				return $(this).attr('ui');
			})), function(key){
				that.ui[key] = that.$el.find('[ui=' + key + ']');
			});
		});

		//add data-view-name meta attribute to view.$el and also view to view.$el.data('view')
		this.listenToOnce(this, 'render', function(){
			this.$el.attr('data-view-name', this.name || _.uniqueId('anonymous-view-'));
			this.$el.data('view', this);
		});

		//add data-render-count meta attribute to view.$el
		this._renderCount = 0;
		this.listenTo(this, 'render', function(){
			this.$el.attr('data-render-count', ++this._renderCount);
			//**Caveat: data-attribute change will not change $.data(), it is one way and one time in jQuery.
			this.$el.data('render-count', this._renderCount);
		});

		//meta-event programming ability
		app.Util.addMetaEvent(this, 'view');

		//global co-op (global events forwarding through app)
		if(this.coop) {
			this._postman = {};
			//register
			_.each(this.coop, function(e){
				var self = this;
				this._postman[e] = function(options){
					self.trigger('view:' + e, options);
					//considering the parent-DOM-removed edge case
					if(self.isInDOM() === false)
						app.off('app:coop-' + e, self._postman[e]);
				};
				app.on('app:coop-' + e, this._postman[e]);
			}, this);
			//cleanup
			this.listenTo(this, 'close', function(){
				_.each(this._postman, function(fn, e){
					app.off('app:coop-' + e, fn);
				});
			});
		}
		//recover local (same-ancestor) collaboration
		this.coop = this._coop;

		//data / useParentData ({}, [] or url for GET only)
		this.listenToOnce(this, 'show', function() {
		    //supports getting parent data from useParentData.
		    if (this.parentCt && this.useParentData) {
		        var tmp = this.parentCt.get(this.useParentData);
		        //wrap non-object data into an object with same key indicated by .useParentData.
		        if (!_.isUndefined(tmp) && !_.isPlainObject(tmp)) {
		            var tmpwrap = {};
		            tmpwrap[this.useParentData] = tmp;
		            tmp = tmpwrap;
		        }
		        this.data = tmp;
		    }
		    if (this.data)
		        this.set(this.data);
		});

		//enable i18n
		if(I18N.locale) {
			this.listenTo(this, 'render', function(){
				this.$el.i18n({search: true});
			});
		}

		//---------------------optional view enhancements-------------------
		//dnd (drag, drop, and sortables) 
		if(this.dnd) {
			this.listenTo(this, 'render', function(){
				var that = this;
				if(this.dnd.sortables) delete this.dnd.drag;
				var dnd = this.dnd;
				//draggables
				if(dnd.drag){
					var defaultDragOpt = {
						zIndex: 100,
						//revert: true,
						helper: 'clone', //remember to keep size (done for you in default drag listener);
						items: '.ui-draggable-item', //+
						drag: function(e, ui){
							var $sample = that._cachedDraggableItem; //for better performance
							that.trigger('view:drag', $(ui.helper).width($sample.width()), ui, e);
						}
					};
					if(_.isString(dnd.drag))
						defaultDragOpt.items = dnd.drag;
					else
						_.extend(defaultDragOpt, dnd.drag);
					this._cachedDraggableItem = this.$el.find(defaultDragOpt.items).draggable(defaultDragOpt).first();
				}
				//droppable
				if(dnd.drop){
					var defaultDropOpt = {
						//container: '', //+
						zIndex: 50,
						activeClass: 'ui-droppable-active',
						hoverClass: 'ui-droppable-hover',
						accept: '.ui-draggable-item',
						drop: function(e, ui){
							that.trigger('view:drop', $(ui.draggable), ui, e);
						}
					};
					if(_.isString(dnd.drop))
						defaultDropOpt.accept = dnd.drop;
					else
						_.extend(defaultDropOpt, dnd.drop);
					var $ctDrop = (defaultDropOpt.container && this.$el.find(defaultDropOpt.container)) || this.$el;
					$ctDrop.droppable(defaultDropOpt);

					//provide a default onDrop to view
					if(!this.onDrop){
						this.onDrop = function($item, ui, e){
							$ctDrop.append($item.clone().removeClass(defaultDropOpt.accept.slice(1)).css('position', 'static'));
						};
					}
				}
				//sortable
				if(dnd.sort){
					var defaultSortOpt = {
						//container: '', //+
						placeholder: 'ui-sortable-placeholder', //remember to keep size in css (done for you in default sort listener)
						//revert: true,
						//helper: 'clone',
						items: '.ui-sortable-item',
						sort: function(e, ui){
							var $sample = that._cachedSortableItem;
							if(!$sample || !$sample.length)
								$sample = that._cachedSortableItem = that.$el.find(defaultSortOpt.items).first();
							$(ui.placeholder).height($sample.outerHeight()).css('border', '1px dashed grey');
							that.trigger('view:sort', $(ui.item), ui, e);
						},
						change: function(e, ui){
							that.trigger('view:sort-change', $(ui.item), ui, e);
						}
					};
					if(_.isString(dnd.sort))
						defaultSortOpt.items = dnd.sort;
					else
						_.extend(defaultSortOpt, dnd.sort);
					var $ctSort = (defaultSortOpt.container && this.$el.find(defaultSortOpt.container)) || this.$el;
					$ctSort.sortable(defaultSortOpt);
				}
			});
		}

		//selectable
		if(this.selectable){
			this.listenTo(this, 'render', function(){
				var that = this;
				var defaults = {
					filter: '.ui-selectable-item',
					selected: function(e, ui){
						that.trigger('view:item-selected', $(ui.selected), e);
					},
					unselected: function(e, ui){
						that.trigger('view:item-unselected', $(ui.unselected), e);
					},
					selecting: function(e, ui){ //.ui-selecting
						that.trigger('view:item-selecting', $(ui.selecting), e);
					},
					unselecting: function(e, ui){
						that.trigger('view:item-unselecting', $(ui.unselecting), e);
					},
					stop: function(e){ //.ui-selected
						that.trigger('view:selection-done', that.$el.find('.ui-selected'));
					},
					start: function(e){
						that.trigger('view:selection-begin');
					}
				};
				if(_.isString(this.selectable))
					defaults.filter = this.selectable;
				else
					_.extend(defaults, this.selectable);
				this.$el.selectable(defaults);
			});
		}

		//de/activations
		this._enableActivationTags();

		//actions - 1 (bubble events that can be delegated)
		if(this.actions) {
			this._enableActionTags(this.actions._bubble);
			//actions - 2 (non bubbling events)
			this.listenTo(this, 'render', function(){
				this._enableSpecialActionTags();
			});
		}

		//tooltip
		if(this.tooltips) {
			this._enableTooltips(this.tooltips);
		}

		//overlay (use this view as overlay)
		//unconditional 1.9.2+
		this._enableOverlay();

		//popover (use this view as popover)
		//unconditional 1.9.2+
		this._enablePopover();

		//editors -- doesn't re-activate upon re-render (usually used with non-data bound template or no template)
		if(this.editors && this._activateEditors) this.listenToOnce(this, 'render', function(){
			this._activateEditors(this.editors);
		});

		//svg (if rapheal.js is present) -- doesn't re-activate upon re-render (usually used with no template)
		if(this.svg && this._enableSVG) {
			this.listenToOnce(this, 'show', this._enableSVG);
		}

		//--------------------+ready event---------------------------		
		//ensure a ready event for static views (align with data and form views)
		//Caveat: re-render a static view will not trigger 'view:ready' again...
		this.listenTo(this, 'show', function(){
			//call view:ready (if not waiting for data render after 1st `show`)
			if(!this.data && !this.useParentData)
			    this.trigger('view:ready');
			    //note that form view will not re-render on .set(data) so there should be no 2x view:ready triggered.
		});

		return Backbone.Marionette.View.apply(this, arguments);
	};


})(Application);
;/**
 * Marionette.ItemView Enhancements (can be used in Layout as well) - Note that you can NOT use these in a CompositeView.
 *
 * 1. svg (+this.paper, *this.paper.clear())
 * 2. basic Editors (view as form piece)
 * 3. data <-> render handling 
 *
 * @author Tim Lauv
 * @created 2014.02.26
 * @updated 2015.08.03
 * @updated 2016.02.17
 */

;(function(app){

	//Original M.ItemView render, close (as a Reference here, to be overriden later)
	_.extend(Backbone.Marionette.ItemView.prototype, {

		// Override the default close event to add a few
		// more events that are triggered.
		close: function(_cb) {
		    if (this.isClosed) {
		    	_cb && _cb();
		        return;
		    }

		    this.triggerMethod('item:before:close');
		    Marionette.View.prototype.close.apply(this, arguments);
		    this.triggerMethod('item:closed');
		    _cb && _cb();
		},

		// Render the view, defaulting to underscore.js templates.
		// You can override this in your view definition to provide
		// a very specific rendering for your view. In general, though,
		// you should override the `Marionette.Renderer` object to
		// change how Marionette renders views.
		// + honoring empty template (before-render modification on $el will no longer be replaced)
		render: function() {
		    this.isClosed = false;

		    this.triggerMethod("before:render", this);
		    this.triggerMethod("item:before:render", this);

		    var data = this.serializeData();
		    data = this.mixinTemplateHelpers(data);

		    var template = this.getTemplate();
		    var html = Marionette.Renderer.render(template, data);

		    //+ skip empty template
		    if(_.string.ltrim(html))
		    	this.$el.html(html);
		    this.bindUIElements();

		    this.triggerMethod("render", this);
		    this.triggerMethod("item:rendered", this);

		    return this;
		},

		//Editors don't render according to the underlying backbone model.
		_renderTplOrResetEditors: function(){
			if(this._editors){
				this.setValues(this.model.toJSON());
				//note that as a form view, updating data does NOT refresh sub-regional views...
				this.trigger('view:editors-updated');
			}
			else {
				this.render();
				//note that this will re-render the sub-regional views.
				this.trigger('view:data-rendered');
			}
			//static view, data view and form all have onReady now...
			this.trigger('view:ready');
		},
		
		//Set & change the underlying data of the view.
		set: function(){

			if(!this.model){
				this.model = app.model();
			}

			var self = this;

			//check one-way binding
			if(!this._oneWayBound){
				this.listenTo(this.model, 'change', function(){
					self._renderTplOrResetEditors();
				});
				this._oneWayBound = true;			
			}

			//bypassing Model/Collection setup in Backbone.
			if(arguments.length === 1){
				var data = arguments[0];
				if(_.isString(data)){
					this.data = data;
					//to prevent from calling refresh() in initialize()
					return this.isInDOM() && this.refresh();
				}
				else if(_.isArray(data))
					return this.model.set('items', _.clone(data)); 
					//conform to original Backbone/Marionette settings
					//Caveat: Only shallow copy provided for data array here... 
					//		  Individual changes to any item data still affects all instances of this View if 'data' is specified in def.
			}
			return this.model.set.apply(this.model, arguments);
		},

		//Use this instead of this.model.attributes to get the underlying data of the view.
		get: function(){
			if(this._editors){
				if(arguments.length) {
					var editor = this.getEditor.apply(this, arguments);
					if(editor)
						return editor.getVal();
					return;
				}
				return this.getValues();
			}

			if(!this.model) {
				console.warn('DEV::ItemView+::get() You have not yet setup data in view ' + this.name);
				return;
			}
			
			if(arguments.length)
				return this.model.get.apply(this.model, arguments);
			return this.model.toJSON();
		},

		//Reload (if data: url) and re-render the view, or resetting the editors.
		refresh: function(options){
			if(!this.data) return console.warn('DEV::ItemView+::refresh() You must set view.data to use this method.');
			
			this.model && this.model.clear({silent: true});
			if(_.isString(this.data)){
				var self = this;
				return app.remote(this.data, null, options).done(function(d){
					self.set(d);
				});
			}
			else
				return this.model && this.set(this.model.toJSON());
		},

		//Meta-event view:render-data
		onRenderData: function(data){
			this.set(data);
		},

		//Inject a svg canvas within view. (fully extended to parent region size)
		_enableSVG: function(){
			if(!Raphael && !Snap) throw new Error('DEV::ItemView+::_enableSVG() You did NOT have Raphael.js/Snap.svg included...');
			var SVG = Raphael || Snap;
			this.$el.css({
				'width': '100%',
				'height': '100%',
			});
			this.paper = SVG(this.el);
			this.$el.find('svg').attr({
				'width': '100%',
				'height': '100%',
			});

			var that = this;
			//+._fit() to paper.clear() (since this.paper.height/width won't change with the above w/h:100% settings)
			this.paper._fit = function(w, h){
				that.paper.setSize(w || that.$el.width(), h || that.$el.height());
			};
			var tmp = this.paper.clear;
			this.paper.clear = function(){
				tmp.apply(that.paper, arguments);
				that.paper._fit();
			};
			//just call this.paper.clear() when resize --> re-draw. so this.paper.width/height will be corrected.

		},

		/**
		 * Editor Activation - do it once upon render()
		 * 
		 * Turn per field config into real editors.
		 * You can activate editors in any Layout/ItemView object, it doesn't have to be a turnIntoForm() instrumented view.
		 * You can also send a view with activated editors to a form by using addFormPart()[in onShow() or onRender()] it is turn(ed)IntoForm()
		 *
		 * options
		 * -------
		 * _global: general config as a base for all editors, (overriden by individual editor config)
		 * editors: {
		 *  //simple 
		 * 	name: {
		 * 		type: ..., (*required) - basic or registered customized ones
		 * 		label: ...,
		 * 		help: ...,
		 * 		tooltip: ...,
		 * 		placeholder: ...,
		 * 		options: ...,
		 * 		validate: ...,
		 * 		fieldname: ..., optional for collecting values through $.serializeForm()
		 * 		
		 * 		... (see specific editor options in pre-defined/parts/editors/index.js)
		 * 		
		 * 		appendTo: ... - per editor appendTo cfg
		 * 	},
		 * 	...,
		 * 	//compound (use another view as wrapper)
		 * 	name: app.view({
		 * 		template: ...,
		 * 		getVal: ...,
		 * 		setVal: ...,
		 * 		validate: ...,
		 * 		status: ...,
		 * 		[editors: ...,]
		 * 		[disable: ...,]
		 * 		[isEnabled: ...,]
		 * 	}),
		 * }
		 *
		 * This will add *this._editors* to the view object. Do NOT use a region name with region='editors'...
		 * 
		 * Add new: You can repeatedly invoke this method to add new editors to the view.
		 * Remove current: Close this view to automatically clean up all the editors used.
		 *
		 * optionally you can implement setValues()/getValues()/validate() in your view, and that will get invoked by the outter form view if there is one.
		 *
		 * Warning:
		 * activateEditors will not call on editor's onShow method, so don't put anything in it! Use onRender if needs be instead!!
		 * 
		 */
		_activateEditors: function(options){
			this._editors = this._editors || {};
			if(this._editors.attachView) throw new Error('DEV::ItemView+::_activateEditors() will need this._editors object, it is now a Region!');

			var global = options._global || {};
			_.each(options, function(config, name){
				if(name.match(/^_./)) return; //skip _config items like _global

				var Editor, editor;
				if(!_.isFunction(config)){
					//0. apply global config
					config = _.extend({name: name, parentCt: this}, global, config);
					//if no label, we remove the standard (twt-bootstrap) 'form-group' class from editor template for easier css styling.
					if(!config.label) config.className = config.className || ' ';

					//1. instantiate
					config.type = config.type || 'text'; 
					Editor = (app.Core.Editor.map.Basic.supported[config.type] && app.Core.Editor.map.Basic) || app.get(config.type, 'Editor');
					
					//Tempo Fix: remove type so it won't confuse View init with Item/Collection/CompositeView types.
					if(Editor !== app.Core.Editor.map.Basic)
						delete config.type;
					////////////////////////////////////////////////////////////////////////////////////////////////

					editor = new Editor(config);					
				}else {
					//if config is a view definition use it directly 
					//(compound editor, e.g: app.view({template: ..., editors: ..., getVal: ..., setVal: ...}))
					Editor = config;
					config = _.extend({name: name, parentCt: this}, global);
					editor = new Editor(config); //you need to implement event forwarding to parentCt like Basic.
					editor.isCompound = true;
					editor.category = 'Editor';
				}
				this._editors[name] = editor.render();

				//2. add it into view (specific, appendTo(editor cfg), appendTo(general cfg), append)
				var $position = this.$('[editor="' + name + '"]');
				if($position.length === 0 && config.appendTo)
					$position = this.$(config.appendTo);
				if($position.length === 0)
					$position = this.$el;
				$position.append(editor.el);
				
				//3. patch in default value
				if(config.value)
					editor.setVal(config.value);

			}, this);

			this.listenTo(this, 'before:close', function(){
				_.each(this._editors, function(editorview){
					editorview.close();
				});
			});

			//0. getEditor(name)
			this.getEditor = function(name){
				return this._editors[name];
			};

			//1. getValues (O(n) - n is the total number of editors on this form)
			this.getValues = function(){
				var vals = {};
				_.each(this._editors, function(editor, name){
					var v = editor.getVal();
					if(v !== undefined && v !== null) vals[name] = v;
				});
				//Warning: Possible performance impact...
				return app.model(vals).toJSON(); //construct a deep model for editor 'a.b.c' getVal();
				/////////////////////////////////////////
			};

			//2. setValues (O(n) - n is the total number of editors on this form)
			this.setValues = function(vals, loud){
				if(!vals) return;
				_.each(this._editors, function(editor, name){
					var v = vals[name] || app.extract(name, vals);
					if(v !== null && v !== undefined){
						editor.setVal(v, loud);
					}
				});
			};

			//3. validate
			this.validate = function(show){
				var errors = {};

				_.each(this._editors, function(editor, name){
					var e;
					if(!this.isCompound)
						e = editor.validate(show);
					else
						e = editor.validate(); //just collect errors
					if(e) errors[name] = e;
				}, this);

				if(this.isCompound && show) this.status(errors); //let the compound editor view decide where to show the errors
				if(_.size(errors) === 0) return;

				return errors; 
			};

			//4. highlight status msg - linking to individual editor's status method
			this.status = function(options){
				if(_.isString(options)) {
					throw new Error('DEV::ItemView+::_activateEditors() You need to pass in messages object instead of ' + options);
				}

				//clear status
				if(!options || _.isEmpty(options)) {
					_.each(this._editors, function(editor, name){
						editor.status();
					});
					return;
				}
				//set status to each editor
				_.each(options, function(opt, name){
					if(this._editors[name]) this._editors[name].status(opt);
				}, this);
			};

			//auto setValues according to this.model?
			
		}

	});


})(Application);
;/**
 * Enhancing the Marionette.Layout Definition to auto detect regions and regional views through its template.
 *
 *
 * Fixed
 * -----
 * auto region detect and register by region="" in template
 * auto regional view display by attribute view="" in template (+@mockup.html)
 * change a region's view by trigger 'region:load-view' on that region, then give it a view name. (registered through B.M.Layout.regional() or say app.create('Regional', ...))
 * 
 * 
 * Experimental (removed)
 * ------------
 * default getValues/setValues and validate() method supporting editors value collection and verification
 *
 *
 * @author Tim Lauv
 * @create 2014.02.25
 * @update 2014.07.15 (+chainable nav region support)
 * @update 2014.07.28 (+view="@mockup.html" support)
 * @update 2015.11.03 (-form nesting on regions)
 * @update 2015.11.11 (+getViewIn('region'))
 * @update 2015.12.15 (navRegion chaining on region:show instead)
 * @update 2016.02.05 (close*(_cb) for region closing effect sync)
 */

;(function(app){

	//+api view.getViewIn('region')
	_.extend(Backbone.Marionette.Layout.prototype, {
		getViewIn: function(region){
			var r = this.getRegion(region);
			if(!r)
				throw new Error('DEV::Layout+::getViewIn() Region ' + region + ' is not available...');
			return r && r.currentView;
		},

		//overriding view.close() to support:
		//	closing 1 specific region by ('name').
		//	handle closing regions, and then close the view itself.
		//	taking care of closing effect sync (reported on 'item:closed')
		close: function(_cb /*or region name*/){
			if(_.isString(_cb)){
				var region = this.getRegion(_cb);
				return region && region.close();
			}
		    if(this.isClosed){
		    	_cb && _cb();
		        return;
		    }
		    this.regionManager.close(_.bind(function(){
		    	Marionette.ItemView.prototype.close.apply(this, arguments);
		    	_cb && _cb();
		    }, this));
		},

		//allow a .region.show() shortcut through .show('region', ...)
		show: function(region /*name only*/, View /*or template or name or instance*/, options){
			var r = this.getRegion(region);
			if(r) 
				return r.trigger('region:load-view', View, options);
		},

		//add more items into a specific region
		more: function(region /*name only*/, data /*array only*/, View /*or name*/, replace /*use set() instead of add, also reconsider View*/){
			if(!_.isArray(data))
				throw new Error('DEV::Layout+::more() You must give an array as data objects...');
			//accept plain array of strings and numbers. (only in this function)
			var d;
			if(data && !_.isObject(data[0]))
				d = _.map(data, function(v){return {'value': v};});
			else
				d = data;
			////////////////////////////////////////
			
			if(_.isBoolean(View)){
				replace = View;
				View = undefined;
			}

			var cv = this.getViewIn(region);
			if(replace && View)
				cv.itemView = _.isString(View)? app.get(View) : View;
			if(cv && cv.collection){
				if(replace)
					cv.set(d);
				else
					cv.collection.add(d);
			}
			else {
				this.getRegion(region).show(app.view({
					forceViewType: true,
					type: 'CollectionView',
					itemView: _.isString(View)? app.get(View) : View, //if !View then Error: An `itemView` must be specified
				}));//to support 'action-scroll' in region.
				this.getViewIn(region)._moreItems = true; //set parentCt bypass mode for items (see collection-view:buildItemView);
				this.getViewIn(region).set(d);
			}
		},

		//lock or unlock a region with overlayed spin/view (e.g waiting)
		lock: function(region /*name only*/, flag /*true or false*/, View /*or icon name for .fa-spin or {object for overlay configuration}*/){
			//check whether region is a string
			if (typeof(region) !== 'string') {
			    View = flag;
			    flag = region;
			    region = '';
			}
			//check whether we have flag parameter
			if(!_.isBoolean(flag)){
				View = flag;
				flag = true;
			}
			//make the overlay view, check View is object or a string
			var $anchor = (region === '')? this.$el : 
				(this.getViewIn(region))? this.getViewIn(region).$el : this.getRegion(region).$el;

			if(flag){//flag = true
				if(_.isFunction(View)){//view
					$anchor.overlay({
						content: (new View()).render().$el,
						effect: false
					});
				}else if(_.isPlainObject(View)){//plain object as overlay option
					View.effect = View.effect || false;
					$anchor.overlay(View);
				}else{//spin icon
					$anchor.overlay({
						content: '<div class="lock-spinner"><i class="' + View + '"></i></div>',
						effect: false
					});
				}
			}else{//flag = false
				$anchor.overlay();
			}
		},
	});

	/**
	 * Fixed behavior overridden. 
	 *
	 * Using standard Class overriding technique to change Backbone.Marionette.Layout 
	 * (this is different than what we did for Backbone.Marionette.View)
	 */
	var Old = Backbone.Marionette.Layout;
	Backbone.Marionette.Layout = Old.extend({

		constructor: function(options){
			options = options || {};

			this.regions = _.extend({}, this.regions, options.regions);
			
			//hornor layout configuration through $.split plug-in
			if(this.layout)
				this.listenToOnce(this, 'before:render', function(){
					var $el = this.$el, //use View.$el to trigger jQuery plugin
						_layoutConig = [];
					if(_.isArray(this.layout)){
						//this.layout is an array
						$el.flexlayout(_.result(this, 'layout'));
					}else if(_.isPlainObject(this.layout)){
						//this.layout is an object
						_layoutConig = this.layout.split;
						$el.flexlayout(_layoutConig, _.result(this, 'layout'));
					}else
						throw new Error('DEV::Layout+::layout can only be an array or an object.');
				});
			
			//find region marks after 1-render
			this.listenToOnce(this, 'render', function(){
				var that = this;
				//a. named regions (for dynamic navigation)
				this.$el.find('[region]').each(function(index, el){
					var r = $(el).attr('region');
					//that.regions[r] = '[region="' + r + '"]';
					that.regions[r] = {
						selector: '[region="' + r + '"]'
					};
				});
				//b. anonymous regions (for static view nesting)
				this.$el.find('[view]').each(function(index, el){
					var $el = $(el);
					if($el.attr('region')) return; //skip dynamic regions (already detected)

					var r = $el.attr('view');
					that.regions[_.uniqueId('anonymous-region-')] = {
						selector: '[view="' + r + '"]'
					};
				});
				this.addRegions(this.regions); //rely on M.Layout._reInitializeRegions() in M.Layout.render();
			});

			//Giving view/region the ability to show:
			//1. a registered View/Widget by name and options
			//2. direct templates
			//	2.1 @*.html -- remote template in html
			//	2.2 @*.md -- remote template in markdown
			//	2.3 'raw html string'
			//	2.4 ['raw html string1', 'raw html string2']
			//	2.5 a '#id' marked DOM element 
			//3. view def (class fn)
			//4. view instance (object)
			// 
			//Through 
			//	view="" in the template; (1, 2.1, 2.2, 2.5 only)
			//  this.show('region', ...) in a view; (all 1-4)
			//  'region:load-view' on a region; (all 1-4)
			this.listenTo(this, 'render', function(){
				_.each(this.regions, function(selector, region){
					//ensure region and container style
					this[region].ensureEl();
					this[region].$el.addClass('region region-' + _.string.slugify(region));
					this[region]._parentLayout = this;

					//+since we don't have meta-e enhancement on regions, the 'region:load-view' impl is added here.
					//meta-e are only available on app and view (and context)
					this[region].listenTo(this[region], 'region:load-view', function(name /*or templates or View def/instance*/, options){ //can load both view and widget.
						if(!name) return;

						if(_.isString(name)){
							//Template directly (static/mockup view)?
							if(!/^[_A-Z]/.test(name)){
								return this.show(app.view({
									template: name,
								}));
							}
							else{
							//View name (_ or A-Z starts a View name, no $ sign here sorry...)
								var Reusable = app.get(name, _.isPlainObject(options)?'Widget':'', true); //fallback to use view if widget not found.
								if(Reusable){
									//Caveat: don't forget to pick up overridable func & properties from options in your Widget.
									return this.show(new Reusable(options));
								}else
									console.warn('DEV::Layout+::region:load-view View required ' + name + ' can NOT be found...use app.view({name: ..., ...}).');					
							}
							return;
						}

						//View definition
						if(_.isFunction(name))
							return this.show(new name(options));

						//View instance
						if(_.isPlainObject(name))
							return this.show(name);
					});
					
				},this);
			});

			//Automatically shows the region's view="" attr indicated View or @*.html/*.md
			//Note: re-render a view will not re-render the regions. use .set() or .show() will.
			//Note: 'all-region-shown' will sync on 'region:show' which in turn wait on enterEffects before sub-region 'view:show';
			//Note: 'show' and 'all-region-shown' doesn't mean 'data-rendered' thus 'ready'. Data render only starts after 'show';
			this.listenTo(this, 'show view:data-rendered', function(){
				var pairs = [];
				_.each(this.regions, function(selector, r){
					if(this.debug) this[r].$el.html('<p class="alert alert-info">Region <strong>' + r + '</strong></p>'); //give it a fake one.
					var viewName = this[r].$el.attr('view');
					if(viewName) //found in-line View name.
						pairs.push({region: r, name: viewName}); 
				}, this);
				if(!pairs.length)
					return this.trigger('view:all-region-shown');

				var callback = _.after(pairs.length, _.bind(function(){
					this.trigger('view:all-region-shown');
				}, this));
				_.each(pairs, function(p){
					this[p.region].on('show', callback);
					this[p.region].trigger('region:load-view', p.name);
				}, this);
				
			});

			//supporting the navigation chain if it is a named layout view with valid navRegion (context, regional, ...)
			if(this.name){
				this.navRegion = options.navRegion || this.navRegion;
				//if(this.navRegion)
				this.onNavigateChain = function(pathArray, old){
					if(!pathArray || pathArray.length === 0){
						if(!old)
							this.trigger('view:navigate-to');//use this to show the default view
						else {
							if(this.navRegion) this.getRegion(this.navRegion).close();
						}
						return;	
					}

					if(!this.navRegion) return this.trigger('view:navigate-to', pathArray.join('/'));

					if(!this.regions[this.navRegion]){
						console.warn('DEV::Layout+::onNavigateChain()', 'invalid navRegion', this.navRegion, 'in', this.name);
						return;
					}
					
					var targetViewName = pathArray.shift();
					var TargetView = app.get(targetViewName);

					if(TargetView){
						var navRegion = this.getRegion(this.navRegion);
						if(!navRegion.currentView || TargetView.prototype.name !== navRegion.currentView.name){
							//new
							var view = new TargetView();
							if(navRegion.currentView) navRegion.currentView.trigger('view:navigate-away');
							
							//chain on region:show (instead of view:show to let view use onShow() before chaining)
							navRegion.once('show', function(){
								view.trigger('view:navigate-chain', pathArray);
							});	
							navRegion.show(view);
							return;
						}else{
							//old
							navRegion.currentView.trigger('view:navigate-chain', pathArray, true);
						}


					}else{
						pathArray.unshift(targetViewName);
						return this.trigger('view:navigate-to', pathArray.join('/'));	
					}

				};
			}								

			return Old.prototype.constructor.call(this, options);
		},	
	});	

})(Application);
;/**
 * Marionette.CollectionView Enhancements (can be used in CompositeView as well)
 *
 * 1. Render with data 
 * 		view:render-data, view:data-rendered
 * 		
 * 2. Pagination, Filtering, Sorting support
 * 		view:load-page, view:page-changed
 * 		
 * 		TBI: 
 * 		view:sort-by, view:filter-by
 *
 * @author Tim Lauv
 * @created 2014.04.30
 * @updated 2016.02.10
 */

;(function(app){

	/**
	 * Meta-event Listeners (pre-defined)
	 * view:render-data
	 * view:load-page
	 */
	_.extend(Backbone.Marionette.CollectionView.prototype, {

		// Handle cleanup and other closing needs for
		// the collection of views.
		close: function(_cb) {
		    if (this.isClosed) {
		    	_cb && _cb();
		        return;
		    }

		    this.triggerMethod("collection:before:close");
		    this.closeChildren(_.bind(function(){
			    //triggers 'close' before BB.remove() --> stopListening
			    Marionette.View.prototype.close.apply(this, arguments);
			    this.triggerMethod("collection:closed"); //align with ItemView
			    _cb && _cb();
		    }, this));
		},

		// Close the child views that this collection view
		// is holding on to, if any
		closeChildren: function(_cb) {
			if(!_.size(this.children))
				_cb && _cb();
			else {
				var callback = _.after(_.size(this.children), function(){
					_cb && _cb();
				});
			    this.children.each(function(child) {
			        this.removeChildView(child, callback);
			    }, this);
			    //this.checkEmpty();
			}
		},

		// Remove the child view and close it
		removeChildView: function(view, _cb) {

		    // shut down the child view properly,
		    // including events that the collection has from it
		    if (view) {
		        // call 'close' or 'remove', depending on which is found
		        if (view.close) {
		            view.close(_.bind(function(){
				        this.stopListening(view);
				        this.children.remove(view);
				        this.triggerMethod("item:removed", view);
				        _cb && _cb();
		            }, this));
		        } else if (view.remove) {
		            view.remove();
			        this.stopListening(view);
			        this.children.remove(view);
			        this.triggerMethod("item:removed", view);
			        _cb && _cb();
		        }
		    }
		},

		// Build an `itemView` for a model in the collection. (inject parentCt)
		buildItemView: function(item, ItemViewType, itemViewOptions) {
			var options = _.extend({ model: item }, itemViewOptions);
			var view = new ItemViewType(options);
			if(this._moreItems === true){
				//.more()-ed items will bypass this CollectionView and use 'grand parent' as parentCt.
				view.parentCt = this.parentCt;
				view.parentRegion = this.parentRegion;
			}
			else
				view.parentCt = this;
			return view;
		},

		/////////////////////////////
		onRenderData: function(data){
			this.set(data);
		},

		//no refresh() yet (auto data-url fetch in item-view.js)
		set: function(data, options){
			if(!_.isArray(data)) throw new Error('DEV::CollectionView+::set() You need to have an array passed in as data...');
			
			if(!this.collection){
				this.collection = app.collection();
				this._initialEvents(); //from M.CollectionView
			}
			
			if(options && _.isBoolean(options))
				this.collection.reset(data);
			else 
				this.collection.set(data, options);
			//align with normal view's data rendered and ready events notification
			this.trigger('view:data-rendered');
			this.trigger('view:ready');
			return this;
		},

		get: function(idCidOrModel){
			if(!idCidOrModel)
				return this.collection && this.collection.toJSON();
			return this.collection && this.collection.get(idCidOrModel);
		},
		///////////////////////////////////////////////////////////////////////////
		/**
		 * Note that view:load-page will have its options cached in this._remote
		 *
		 * To reset: (either)
		 * 1. clear this._remote
		 * 2. issue overriding options (including the options for app.remote())
		 */
		onLoadPage: function(options){
			options = _.extend({
				page: 1,
				pageSize: 15,
				dataKey: 'payload',
				totalKey: 'total',
				params: {},
				//+ app.remote() options
			}, this._remote, options);

			//merge pagination ?offset=...&size=... params/querys into app.remote options
			_.each(['params', 'querys'], function(k){
				if(!options[k]) return;

				_.extend(options[k], {
					offset: (options.page -1) * options.pageSize,
					size: options.pageSize
				});
			});

			var that = this;
			//store pagination status for later access
			this._remote = options;

			//allow customized page data processing sequence, but provides a default (onLoadPageDone).
			app.remote(_.omit(options, 'page', 'pageSize', 'dataKey', 'totalKey'))
				.done(function(){
					that.trigger('view:load-page-done', arguments);
				})
				.fail(function(){
					that.trigger('view:load-page-fail', arguments);
				})
				.always(function(){
					that.trigger('view:load-page-always', arguments);
				});
		},

		onLoadPageDone: function(args){
			var result = args[0];
			//render this page:
			this.set(result[this._remote.dataKey]);
			//signal other widget (e.g a paginator widget)
			this.trigger('view:page-changed', {
				current: this._remote.page,
				total: Math.ceil(result[this._remote.totalKey]/this._remote.pageSize), //total page-count
			});
		}
	});

})(Application);
;/**
 * i18n plug-in for loading & using localization resource files.
 *
 * Config
 * ------
 * I18N.init(options) - change the resource folder path or key-trans file name per locale.
 * 	options:
 * 		resourcePath: ... - resource folder path without locale
 * 		translationFile: ... - the file name that holds the key trans pairs for a certain locale.
 *
 * 
 * APIs
 * ----
 * .getResourceProperties(flag) -- get all i18n keys and trans rendered in the app in "key" = "val" format;
 * .getResourceJSON(flag) -- get the above listing in JSON format;
 *
 * use flag = true in the above functions if you only want to get un-translated entries;
 * 
 * 
 * Usage
 * -----
 * 1. load this i18n.js before any of your modules/widgets
 * 2. use '...string...'.i18n() instead of just '...string...',
 * 3. use {{i18n vars/paths or '...string...'}} in templates, {{{...}}} for un-escaped.
 * 4. use $.i18n(options) to translate html tags with [data-i18n-key] [data-i18n-module] data attributes. 
 *
 *
 * Dependencies
 * ------------
 * jQuery, underscore, [Handlebars] 
 *
 * 
 * @author Yan Zhu, Tim Lauv
 * @created 2013-08-26
 * @updated 2014-08-06
 * @updated 2016.03.24 (I18N.init now returns a jqXHR object)
 * 
 */
var I18N = {};
;(function($, _) {
	
	//----------------configure utils------------------
	var configure = {
		resourcePath: 'static/resource',
		translationFile: 'i18n.json'
	};
	
	var locale, resources = {};	
	I18N.init = function(options){
		_.extend(configure, options);
		var params = app.uri(window.location.toString()).search(true);
		locale = I18N.locale = params.locale || configure.locale || Detectizr.browser.language;

		if (locale) {
			// load resources from file
			/**
			 * {locale}.json or {locale}/{translationFile}
			 * {
			 * 	locale: {locale},
			 *  trans: {
			 * 	 key: "" or {
			 * 	  "_default": "",
			 *    {ns}: ""
			 *   }
			 *  }
			 * }
			 */
			return $.ajax({
				url: [configure.resourcePath, (configure.translationFile.indexOf('{locale}') >= 0?configure.translationFile.replace('{locale}', locale):[locale, configure.translationFile].join('/'))].join('/'),
				dataType: 'json',
				success: function(data, textStatus, jqXHR) {
					if(!data || !data.trans) throw new Error('RUNTIME::i18n::Malformed ' + locale + ' data...');
					resources = data.trans;
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.warn('RUNTIME::i18n::', errorThrown);
				}
			});
		}
	};
	//-------------------------------------------------
	
	
	/**
	 * =============================================================
	 * String Object plugin
	 * options:
	 * 	module - the module/namespace ref-ed translation of the key.
	 * =============================================================
	 */
	String.prototype.i18n = function(options) {
		var key = $.trim(this);
		
		if (!locale || !key) {
			//console.log('locale', locale, 'is falsy');
			return key;
		}
		
		var translation = resources[key];
		if (typeof(translation) === 'undefined') {
			//console.log('translation', translation, 'is undefined');
			// report this key
			resources[key] = '';

			return key;
		} else if (typeof(translation) === 'object') {
			//console.log('translation', translation, 'is object');
			var ns = (_.isString(options) && options) || (options && options.module) || '_default';
			translation = translation[ns];
			if (typeof(translation) === 'undefined') {
				//console.log('translation', translation, 'is undefined');
				// report this namespace
				resources[key][ns] = '';

				return key;
			}
		}
		translation = String(translation);
		if (translation.trim() === '') {
			return key;
		}
		return translation;
	};

	function getResourceProperties(untransedOnly) {
		var formatted = [];

		function makeNSLine(ns) {
			formatted.push('## module: ');
			formatted.push(ns);
			formatted.push(' ##');
			formatted.push('\n');
		}

		function makeLine(key, value) {
			key = String(key);
			value = String(value);
			formatted.push('"');
			formatted.push(key.replace(/"/g, '\\"'));
			formatted.push('"');
			formatted.push('=');
			formatted.push(value);
			formatted.push('\n');
		}

		_.each(resources, function(value, key) {
			if(untransedOnly && !value) return;

			if (typeof(value) === 'object') {
				_.each(value, function(translation, ns) {
					if (ns !== '_default') {
						makeNSLine(ns);
					}
					makeLine(key, translation);
				});
			} else {
				makeLine(key, value);
			}
		});

		var result = formatted.join('');
		// console.log(result);
		// TODO: write result to file
		return result;
	}

	function getResourceJSON(untransedOnly, encode) {
		var res = resources;
		if(untransedOnly){
			res = _.reject(resources, function(trans, key){
				if(trans) return true; return false;
			});
		}
		if(_.isUndefined(encode))
			encode = true;
		var result = {
			locale: locale,
			trans: res
		};

		if(encode)
			return JSON.stringify(result, null, '\t');
		return result;
	}

	function insertTrans(trans){
		_.extend(resources, trans);
	}

	I18N.getResourceProperties = getResourceProperties;
	I18N.getResourceJSON = getResourceJSON;
	I18N.insertTrans = insertTrans;

	/**
	 * =============================================================
	 * Handlebars helper(s) for displaying text in i18n environment.
	 * {{i18n \'key\'}}
	 * =============================================================
	 */
	if(Handlebars){
		Handlebars.registerHelper('i18n', function(key, ns, options) {
			if(!options) {
				options = ns;
				ns = undefined;
			}
			if(_.isString(key))
	  			return key.i18n(ns && {module:ns});
	  		return key;
		});
	}

	/**
	 * =============================================================
	 * Jquery plugin for linking html tags with i18n environment.
	 * 
	 * data-i18n-key = '*' to use everything in between the selected dom object tag.
	 * <span data-i18n-key="*">abcd...</span> means to use abcd... as the key.
	 *
	 * data-i18n-module = '...' to specify the module/namespace.
	 *
	 * options:
	 * 	1. search, whether or not to use find() to locate i18n tags.
	 * =============================================================
	 */
	function _i18nIterator(index, el) {
		var $el = $(el);
		var key = $el.data('i18nKey');
		var ns = $el.data('i18nModule');
		if(key === '*') key = $.trim($el.html());
		$el.html(key.i18n({module:ns}));
		$el.removeAttr('data-i18n-key');
	}
	$.fn.i18n = function(options){
		options = _.extend({
			//defaults
			search: false
		}, options);

		if(!options.search)
			return this.filter('[data-i18n-key]').each(_i18nIterator);
		else {
			this.find('[data-i18n-key]').each(_i18nIterator);
			return this;
		}
	};


})(jQuery, _);

;/**
 * The Table-Of-Content plugin used with document html pages.
 *
 * Usage
 * -----
 * $.toc({
 * 	ignoreRoot: false | true - whether to ignore h1
 *  headerHTML: html before ul (sibling) - experimental
 * })
 *
 * Document format
 * ---------------
 * h1 -- book title
 * h2 -- chapters
 * h3 -- sections
 * ...
 *
 * Dependency
 * ----------
 * jQuery, Underscore
 *
 * 
 * @author Tim Lauv
 * @created 2014.03.02
 */

(function($){

	/*===============the util functions================*/
	//build ul/li table-of-content listing
	var order = {};
	for (var i = 1; i <= 6; i++) {
		order['h' + i] = order['H' + i] = i;
	}
	function toc($el, options){
		//default options
		options = _.extend({

			ignoreRoot: false,
			headerHTML: '', //'<h3><i class="glyphicon glyphicon-book"></i> Table of Content</h3>'

		}, options);

		//statistical registry
		var $headers = [];

		//traverse the document tree
		var $root = $('<div></div>').append(options.headerHTML).append('<ul></ul>');
		$root.$children = $root.find('> ul').data('children', []);
		var $index = $root;
		var level = options.ignoreRoot ? 1 : 0;
		$el.find((options.ignoreRoot?'':'h1,') + 'h2,h3,h4,h5,h6').each(function(){

			var $this = $(this);
			var tag = $this.context.localName; //or tagName which will be uppercased
			var title = $this.html();
			var id = $this.attr('id');

			//header in document
			$headers.push($this);

			//node that represent the header in toc html
			var $node = $('<li><a href="#" data-id="' + id + '" action="goTo">' + title + '</a><ul></ul></li>'); //like <li> <a>me</a> <ul>children[]</ul> </li>
			$node.data({
				title: title,
				id: id
			});
			switch(tag){
				case 'h2': case 'H2':
				$node.addClass('chapter');
				break;
				case 'h3': case 'H3':
				$node.addClass('section');
				break;
				default:
				break;
			}
			$node.$children = $node.find('> ul').data('children', []);

			var gap = order[tag] - level;

			if(gap > 0) { //drilling in (always 1 lvl down)
				$node.$parent = $index;
				$index.$children.append($node).data('children').push($node);
				level ++;
			}else if (gap === 0) {
				//back to same level ul (parent li's ul)
				$node.$parent = $index.$parent;
				$index.$parent.$children.append($node).data('children').push($node);
			}else {
				while (gap < 0){
					gap ++;
					$index = $index.$parent; //back to parent li one lvl up
					level --;
				}
				//now $index points to the targeting level node
				$node.$parent = $index.$parent;
				$index.$parent.$children.append($node).data('children').push($node); //insert a same level node besides the found targeting level node
			}
			$index = $node; //point $index to this new node

			//link the document $header element with toc node
			$this.data('toc-node', $node);
			
		});
		$el.data('toc', {
			html: '<div class="md-toc">' + $root.html() + '</div>',
			$headers: $headers, //actual document $(header) node refs
		});
	}

	/*===============the plugin================*/

	//store table-of-content listing in data-toc
	$.fn.toc = function(options){
		return this.each(function(index, el){
			var $el = $(el);
			toc($el, options);
		});
	};

})(jQuery);
;/**
 * This is the plug-in that put an div(overlay) on top of selected elements (inner-div style)
 *
 * Arguments
 * ---------
 * show: true|false show or close the overlay
 * options: {
 * 		[class: 'class name strings for styling purposes';]
 * 		background: if no 'class' in options
 * 		zIndex: if no 'class' in options
 * 		effect: 'jquery ui effects string', or specifically: (use 'false' to disable)
 * 			openEffect: ...,
 * 			closeEffect: ...,
 * 		duration:
 * 			openDuration: ...,
 * 			closeDuration: ...,
 * 		easing:
 * 			openEasing: ...,
 * 			closeEasing: ...,
 * 		content: 'text'/html or el or a function($el, $overlay) that returns one of the three.
 * 		onShow($el, $overlay) - show callback;
 * 		onClose($el, $overlay) - close callback;
 * 		move: true|false - whether or not to make the overlay-container draggable through jquery ui.
 * 		resize: true|false - whether or not to make the overlay-container resizable through jquery ui.
 * }
 *
 * Custom Content
 * --------------
 * You can change the content in onShow($el, $overlay) by $overlay.data('content').html(...)
 * or
 * You can pass in view.render().el if you have backbone based view as content. 
 * Note that in order to prevent *Ghost View* you need to close()/clean-up your view object in onClose callback.
 * 
 *
 * Dependencies
 * ------------
 * Handlebars, _, $window, $
 * 
 * @author Tim Lauv
 * @create 2013.12.26
 */

(function($){

	/*===============preparations======================*/
	var template = Handlebars.compile([
		'<div class="overlay {{class}}" style="position:absolute; top: 0; left: 0; right: 0; bottom: 0; {{#unless class}}z-index:{{zIndex}};background:{{background}};{{/unless}}">',
			'<div class="overlay-outer" style="display: table;table-layout: fixed; height: 100%; width: 100%;">',
				'<div class="overlay-inner" style="display: table-cell;text-align: center;vertical-align: middle; width: 100%;">',
					'<div class="overlay-content-ct" style="display: inline-block;outline: medium none; position:relative;">',
						//a. your overlay content will be put here, and it will always be auto-centered.
						//b. overflow scrolling is not automatic the content's scroll box needs,
						//	1. a max-height < app.screenSize.h
						//	2. overflow-y: auto
						//	to work.
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	].join(''));	

	/*===============the util functions================*/

	/*===============the plugin================*/
	$.fn.overlay = function(show, options){
		if($.isPlainObject(show)){
			options = show;
			show = true;
		}
		if(_.isString(show) || _.isNumber(show)){
			options = _.extend({content: show}, options);
			show = true;
		}
		if(_.isUndefined(show)) show = false; //$.overlay() closes previous overlay on the element.
		options = options || {};

		return this.each(function(index, el){
			var $el = $(this),
			$overlay;

			if(!show){
				if(!$el.data('overlay')) return;

				$overlay = $el.data('overlay');
				options = _.extend({}, $overlay.data('closeOptions'), options);
				var closeEffect = options.closeEffect || options.effect;
				if(_.isUndefined(closeEffect))
					closeEffect = 'clip';
				if(!closeEffect) //so you can use effect: false
					options.duration = 0;
				//**Caveat: $.fn.hide() is from jquery.UI instead of jquery
				$overlay.hide({
					effect: closeEffect,
					duration: options.closeDuration || options.duration,
					easing: options.closeEasing || options.easing,
					complete: function(){
						if(options.onClose)
							options.onClose($el, $overlay);
						if($overlay.data('onResize'))
							//check so we don't remove global 'resize' listeners accidentally
							$window.off('resize', $overlay.data('onResize'));
						$overlay.remove();//el, data, and events removed;
						var recoverCSS = $el.data('recover-css');						
						$el.css({
							overflowY: recoverCSS.overflow.y,
							overflowX: recoverCSS.overflow.x,
							position: recoverCSS.position
						});
						$el.removeData('overlay', 'recover-css');
					}
				});
			}else {
				if($el.data('overlay')) return;

				//options default (template related):
				options = _.extend({
					zIndex: 100,
					background: (options.content)?'rgba(0, 0, 0, 0.6)':'none',
					move: false,
					resize: false
				}, options);

				$overlay = $(template(options));
				$el.data('recover-css', {
					overflow: {
						x: $el.css('overflowX'),
						y: $el.css('overflowY')
					},
					position: $el.css('position')
				});				
				$el.append($overlay).css({
					'position': 'relative',
					'overflow': 'hidden'
				});
				//fix the overlay height, this also affect the default 'clip' effect
				if($el[0].tagName === 'BODY') {
					$overlay.offset({top: $window.scrollTop()});
					$overlay.height($window.height());
					$overlay.data('onResize', function(){
						$overlay.height($window.height());
						//console.log('test to see if the listener is still there...');
					});
					$window.on('resize', $overlay.data('onResize'));
				}
				$overlay.hide();

				$el.data('overlay', $overlay);
				$container = $overlay.find('.overlay-content-ct');
				if(options.resize) $container.resizable({ containment: "parent" });
				if(options.move) $container.draggable({ containment: "parent" });
				$overlay.data({
					'closeOptions': _.pick(options, 'closeEffect', 'effect', 'closeDuration', 'duration', 'closeEasing', 'easing', 'onClose'),
					'container': $container
				});
				$overlay.data('container').html(_.isFunction(options.content)?options.content($el, $overlay):options.content);
				var openEffect = options.openEffect || options.effect;
				if(_.isUndefined(openEffect))
					openEffect = 'clip';
				if(!openEffect) //so you can use effect: false
					options.duration = 0;
				//**Caveat: $.fn.show() is from jquery.UI instead of jquery
				$overlay.show({
					effect: openEffect,
					duration: options.openDuration || options.duration,
					easing: options.openEasing || options.easing,
					complete: function(){
						if(options.onShow)
							options.onShow($el, $overlay);
					}
				});
				
			}

		});
	};

})(jQuery);
;/**
 * This is the code template for **basic** <input>, <select>, <textarea> editor.
 *
 * Note that the validate function defaults on no-op. You should override this according to field settings during form/formPart init.
 *
 * Init Options
 * ============
 * [layout]: { - Note that if you use this layout class, you must also use form-horizontal in the outter most form container
 * 		label: in col-..-[1..12] bootstrap 3 grid class
 * 		field: ...
 * }
 * type (see predefined/parts/editors/README.md)
 * label
 * help
 * tooltip
 * placeholder
 * value: default value
 * 
 * //radios/selects/checkboxes only
 * options: { 
 * 	inline: true|false (for radios and checkboxes only - note that the choice data should be prepared and passed in instead of using url or callbacks to fetch within the editor)
 * 	data: [] or {group:[], group2:[]} - (groups are for select only)
 * 	labelField
 * 	valueField
 * 	remote: app.remote() options for fetching the options.data
 * }
 *
 * //single checkbox only
 * boxLabel: (single checkbox label other than field label.)
 * checked: '...' - checked value
 * unchecked: '...' - unchecked value
 *
 * //select only
 * multiple
 * 
 * //textarea only 
 * rows
 *
 * //specifically for file only (see also fileeditor.upload(options))
 * upload: {
 * 	standalone: false/true - whether or not to display a stand-alone upload button for this field.
 * 	formData: - an {} or function to return additional data to be submitted together with the file.
 * 	fileInput: - a jQuery collection of input[type=file][name=file[]] objects. (for multi-file upload through one editor api)
 * 	url - a string indicating where to upload the file to.
 * 	...  see complete option listing on [https://github.com/blueimp/jQuery-File-Upload/wiki/Options].
 *
 *  callbacks: { - with 'this' in the callbacks pointing to the editor.
 *  	done/fail/always/progress ... - see complete callback listing on [https://github.com/blueimp/jQuery-File-Upload/wiki/Options].
 *  }
 * }
 * 
 * validate (custom function and/or rules see core/parts/editors/basic/validations.js) - The validation function should return null or 'error string' to be used in status.
 * parentCt - event delegate.
 *
 * Events
 * ======
 * editor:change
 * editor:keyup
 * editor:focusin/out
 * view:editor-changed (parentCt)
 *
 * Constrain
 * =========
 * Do addon/transform stuff in onRender() *Do NOT* use onShow() it won't be invoked by _enableEditors() enhancement in ItemView/Layout.
 * 
 *
 * @author Tim Lauv
 * @contributor Yan.Zhu
 * @created 2013.11.10
 * @updated 2014.02.26 [Bootstrap 3.1+]
 * @updated 2015.12.07 [awesome-bootstrap-checkbox & radio]
 * @version 1.2.1
 */

;(function(app){

	app.Core.Editor.register('Basic', function(){

		var UI = app.view({

			template: '#editor-basic-tpl',
			className: 'form-group', //this class is suggested to be removed if there is no label in this editor options.
			type: 'ItemView',
			forceViewType: true, //supress ItemView type warning by framework.

			events: {
				//fired on both parentCt and this editor
				'change': '_triggerEvent', 
				'keyup input, textarea': '_triggerEvent', 
				'focusout': '_triggerEvent', 
				'focusin': '_triggerEvent' 
			},

			//need to forward events if has this.parentCt
			_triggerEvent: function(e){
				var host = this;
				host.trigger('editor:' + e.type, this.model.get('name'), this);
				//host.trigger('editor:' + e.type + ':' + this.model.get('name'), this);

				if(this.parentCt){
					this.parentCt.trigger('editor:' + e.type, this.model.get('name'), this);
					//this.parentCt.trigger('editor:' + e.type + ':' + this.model.get('name'), this);
					if(e.type == 'change')
						this.parentCt.trigger('view:editor-changed', this.model.get('name'), this);
				}
			},

			initialize: function(options){
				//[parentCt](to fire events on) as delegate
				this.parentCt = options.parentCt || this.parentCt;
				
				//prep the choices data for select/radios/checkboxes
				if(options.type in {'select': true, 'radios': true, 'checkboxes': true}){
					switch(options.type){
						case 'radios':
						options.type = 'radio'; //fix the <input> type
						break;
						case 'checkboxes':
						options.type = 'checkbox'; //fix the <input> type
						break;
						default:
						break;
					}

					options.options = options.options || {};
					options.options = _.extend({
						data: [],
						valueField: 'value',
						labelField: 'label'
					}, options.options);

					var choices = options.options; //for easy reference within extractChoices()
					var extractChoices = function (data){
						if(_.isObject(data[0])){
							data = _.map(data, function(c){
								return {value: c[choices.valueField], label: c[choices.labelField]};
							});
						}else {
							data = _.map(data, function(c){
								return {value: c, label: _.string.titleize(c)};
							});
						}
						return data;
					};

					var prepareChoices = function (choices){

						if(!_.isArray(choices.data)){
							choices.grouped = true;
						}

						if(choices.grouped){
							//select (grouped)
							_.each(choices.data, function(array, group){
								choices.data[group] = extractChoices(array);
							});
						}else {
							//select, radios, checkboxes
							choices.data = extractChoices(choices.data);
						}

						return choices;
					};

					if(!choices.remote)
						prepareChoices(options.options);
					else
						this.listenToOnce(this, 'render', function(){
							var that = this;
							app.remote(choices.remote).done(function(data){
								
								//Warning: to leave less config overhead, developers have no way to pre-process the choice data returned atm.
								that.setChoices(data);
							});
						});

					//give it a method for reconfigure the choices later
					this.setChoices = function(data){
						var choices = this.model.get('options');
						choices.data = data;
						this.model.set('options', prepareChoices(choices));
						this.render();
					};
				}

				//prep basic editor display
				var uuiid = _.uniqueId('basic-editor-'); //unique UI id
				this.model = new Backbone.Model({
					uiId: uuiid, 
					layout: options.layout || '',
					name: options.name, //*required
					type: options.type, //default: text
					multiple: options.multiple || false, //optional
					rows: options.rows || 3, //optional
					fieldname: options.fieldname || uuiid, //optional - not recommended, 1. with jquery.serializeForm plugin, 2. prevent same-def form radios collision
					label: options.label || '', //optional
					placeholder: options.placeholder || '', //optional

					help: options.help || '', //optional
					tooltip: (_.isString(options.tooltip) && options.tooltip) || '', //optional
					options: options.options || undefined, //optional {inline: true|false, data:[{label:'l', val:'v', ...}, {label:'ll', val:'vx', ...}] or ['v', 'v1', ...], labelField:..., valueField:...}
					//specifically for a single checkbox field:
					boxLabel: options.boxLabel || '',
					value: options.value,
					checked: options.checked || true,
					unchecked: options.unchecked || false
				});
				//mark view name to be Basic.type.name (more specific than just Basic)
				this.name = [this.name, options.type, options.name].join('.');

				//prep validations
				if(options.validate) {
					this.validators = _.map(options.validate, function(validation, name){
						if(_.isFunction(validation)){
							return {fn: validation};
						}else 
							return {rule: name, options:validation};
					});
					//forge the validation method of this editor				
					this.validate = function(show){
						if(!this.isEnabled()) return; //skip the disabled ones.
						
						var error;
						if(_.isFunction(options.validate)) {
							error = options.validate(this.getVal(), this.parentCt); 

						}
						else {
							var validators = _.clone(this.validators);
							while(validators.length > 0){
								var validator = validators.shift();
								if(validator.fn) {
									error = validator.fn(this.getVal(), this.parentCt);
								}else {
									error = (app.Core.Editor.rules[validator.rule] && app.Core.Editor.rules[validator.rule](validator.options, this.getVal(), this.parentCt));
								}
								if(!_.isEmpty(error)) break;
							}
						}
						if(show) {
							this._followup(error); //eager validation, will be disabled if used in Compound editor 
							//this.status(error);
						}
						return error;//return error msg or nothing						
					};

					//internal helper function to group identical process (error -> eagerly validated)
					this._followup = function(error){
						if(!_.isEmpty(error)){
							this.status(error);
							//become eagerly validated
							this.eagerValidation = true;
						}else {
							this.status();
							this.eagerValidation = false;
						}
					};
					this.listenTo(this, 'editor:change editor:keyup', function(){
						if(this.eagerValidation)
							this.validate(true);
					});

				}

				//prep tooltip upon rendered.
				if(options.tooltip)
					this._enableTooltips(_.isObject(options.tooltip)?options.tooltip:{});

				//prep fileupload if type === 'file'
				if(options.type === 'file'){
					this._enableActionTags('Editor.File');
					if(!options.upload || !options.upload.url) throw new Error('DEV::Editor.Basic.File::You need options.upload.url to point to where to upload the file.');

					//1. listen to editor:change so we can reveal [upload] and [clear] buttons
					this.listenTo(this, 'editor:change', function(){
						if(this.ui.input.val()){
							if(options.upload.standalone)
								this.ui.upload.removeClass('hidden').show();
							this.ui.clearfile.removeClass('hidden').show();
						}
						else {
							this.ui.upload.hide();
							this.ui.clearfile.hide();
						}
					});
					this.onRender = function(){

						this.$el.fileupload({
							fileInput: null, //-remove the plugin's 'change' listener to delay the add event.
							//forceIframeTransport: true, //-note that if iframe is used, error/fail callback will not be possible without further hack using frame['iframe name'].document
						});

						if(options.upload.callbacks){
							_.each(options.upload.callbacks, function(f, e){
								this.$el.bind('fileupload' + e, _.bind(f, this));
							}, this);
						}
					};
					
					_.extend(this.actions, {
						//2. implement [clear] button action
						clear: function(){
							this.setVal('', true);
						},
						//3. implement [upload] button action
						upload: function(){

							//TBI: emit an event before upload.

							var that = this;
							this.upload(_.extend({
								//stub success callback:
								success: function(reply){
									that.ui.result.html(_.isString(reply)?reply.i18n():JSON.stringify(reply));
									_.delay(function(){
										that.ui.result.empty();
									}, 6000);
								}
							}, options.upload));
						}
					});

					//unique editor api
					this.upload = function(config){
						config = _.extend({}, options.upload, config);
						//fix the formData value
						if(config.formData) 
							config.formData = _.result(config, 'formData');
						
						//fix the url with app.config.baseAjaxURI (since form uploading counts as data api)
						if(app.config.baseAjaxURI)
							config.url = [app.config.baseAjaxURI, config.url].join('/');

						//send the file(s) through fileupload plugin.
						this.$el.fileupload('send', _.extend({
							timeout: app.config.timeout * 2,
							fileInput: this.ui.input,
						}, config));
					};

				}

			},

			isEnabled: function(){
				return !this._inactive;
			},
			
			disable: function(flag){

				if(flag === false){
					this._inactive = false;
				}else {
					this._inactive = true;
				}

				if(_.isUndefined(flag)){
					//disable but visible, will not participate in validation
					if(this.ui.input)
						this.ui.input.prop('disabled', true);
					return;
				}

				if(flag){
					//hide and will not participate in validation
					this.$el.hide();
				}else {
					//shown and editable
					if(this.ui.input)
						this.ui.input.prop('disabled', false);
					this.$el.show();
				}
			},

			setVal: function(val, loud){
				if(this.ui.inputs){
					//radios/checkboxes
					this.ui.inputs.find('input').val(_.isArray(val)?val:[val]);
				}else if(this.ui['input-ro']){
					val = _.escape(val);
					this.ui['input-ro'].data('value', val).html(val);
				}else {
					if(this.model.get('type') === 'checkbox'){
						this.ui.input.prop('checked', val === this.model.get('checked'));
					}
					this.ui.input.val(val);
				}
				if(loud) {
					this._triggerEvent({type: 'change'});
				}
			},

			getVal: function(){
				if(!this.isEnabled()) return; //skip the disabled ones.

				if(this.ui.inputs){
					//radios/checkboxes
					var result = this.$('input:checked').map(function(el, index){
						return $(this).val();
					}).get();
					if(this.model.get('type') === 'radio') result = result.pop();
					return result;
				}else {
					if(this.model.get('type') === 'checkbox'){
						return this.ui.input.prop('checked')? (this.model.get('checked') || true) : (this.model.get('unchecked') || false);
					}
					if(this.ui.input)
						return this.ui.input.val();
					
					//skipping input-ro field val...
				}
			},

			validate: _.noop,

			status: function(options){
			//options: 
			//		- false/undefined: clear status
			//		- object: {
			//			type:
			//			msg:
			//		}
			//		- string: error msg

				//set or clear status of this editor UI
				if(options){

					var type = 'error', msg = options;
					if(!_.isString(options)){
						type = options.type || type;
						msg = options.msg || type;
					}

					//set warning, error, info, success... msg type, no checking atm.
					var className = 'has-' + type;
					this.$el
						.removeClass(this.$el.data('type-class'))
						.addClass(className)
						.data('type-class', className);
					this.ui.msg.html(msg.i18n());

				}else {
					//clear
					this.$el
						.removeClass(this.$el.data('type-class'))
						.removeData('type-class');
					this.ui.msg.empty();
				}
			}

		});

		UI.supported = {
			'ro': true,
			'text': true,
			'textarea': true,
			'select': true,
			'file': true,
			'checkboxes': true,
			'checkbox': true,
			'radios': true,
			'hidden': true,
			'password': true,
			//h5 only (use Modernizr checks)
			'number': Modernizr.inputtypes.number,
			'range': Modernizr.inputtypes.range,
			'email': Modernizr.inputtypes.email,
			'tel': Modernizr.inputtypes.tel,
			'search': Modernizr.inputtypes.search,
			'url': Modernizr.inputtypes.url,
			'color': Modernizr.inputtypes.color,
			'time': Modernizr.inputtypes.time,
			'date': Modernizr.inputtypes.date,
			'datetime': Modernizr.inputtypes.datetime,
			'datetime-local': Modernizr.inputtypes['datetime-local'],
			'month': Modernizr.inputtypes.month,
			'week': Modernizr.inputtypes.week,
		};

		return UI;

	});



	app.Util.Tpl.build('editor-basic-tpl', [
		'{{#if label}}',
			'<label class="control-label {{#if layout}}{{layout.label}}{{/if}}" for="{{uiId}}">{{i18n label}}</label>',
		'{{/if}}',
		'<div class="{{#if layout}}{{layout.field}}{{/if}}" data-toggle="tooltip" title="{{i18n tooltip}}">', //for positioning with the label.

			//1. select
			'{{#is type "select"}}',
				'<select ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="form-control" id="{{uiId}}" {{#if multiple}}multiple="multiple"{{/if}} style="margin-bottom:0">',
					'{{#if options.grouped}}',
						'{{#each options.data}}',
						'<optgroup label="{{i18n @key}}">',
							'{{#each this}}',
							'<option value="{{value}}">{{i18n label}}</option>',
							'{{/each}}',
						'</optgroup>',
						'{{/each}}',
					'{{else}}',
						'{{#each options.data}}',
						'<option value="{{value}}">{{i18n label}}</option>',
						'{{/each}}',
					'{{/if}}',
				'</select>',
			'{{else}}',
				//2. textarea
				'{{#is type "textarea"}}',
					'<textarea ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" class="form-control" id="{{uiId}}" rows="{{rows}}" placeholder="{{i18n placeholder}}" style="margin-bottom:0"></textarea>',
				'{{else}}',
					//3. input
					//checkboxes/radios
					'{{#if options}}',
						'<div ui="inputs">',
						'{{#each options.data}}',
							'<div class="{{../type}} {{#if ../options.inline}}{{../type}}-inline{{/if}}">',
								//note that the {{if}} within a {{each}} will no longer impose +1 level down in the content scope. (after Handlebars v4)
								'<input id="{{../uiId}}-{{@index}}" ui="input" name="{{#if ../fieldname}}{{../fieldname}}{{else}}{{../name}}{{/if}}{{#is ../type "checkbox"}}[]{{/is}}" type="{{../type}}" value={{value}}> ',
								'<label for="{{../uiId}}-{{@index}}">{{i18n label}}</label>',
							'</div>',
						'{{/each}}',
						'</div>',
					//single field
					'{{else}}',
						'<div class="{{type}}">',
						'{{#is type "checkbox"}}',
							//single checkbox
							'<input id="{{uiId}}" ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" type="checkbox" value="{{value}}"> ',
							'<label for="{{uiId}}">{{i18n boxLabel}}</label>',
						'{{else}}',
							//normal field
							'{{#is type "ro"}}',//read-only
								'<div ui="input-ro" data-value="{{{value}}}" class="form-control-static">{{value}}</div>',
							'{{else}}',
								'<input ui="input" name="{{#if fieldname}}{{fieldname}}{{else}}{{name}}{{/if}}" {{#isnt type "file"}}class="form-control"{{else}} style="display:inline;" {{/isnt}} type="{{type}}" id="{{uiId}}" placeholder="{{i18n placeholder}}" value="{{value}}"> <!--1 space-->',
								'{{#is type "file"}}',
									'<span action="upload" class="hidden file-upload-action-trigger" ui="upload" style="cursor:pointer;"><i class="glyphicon glyphicon-upload"></i> <!--1 space--></span>',
									'<span action="clear" class="hidden file-upload-action-trigger" ui="clearfile"  style="cursor:pointer;"><i class="glyphicon glyphicon-remove-circle"></i></span>',
									'<span ui="result" class="file-upload-result wrapper-horizontal"></span>',
								'{{/is}}',							
							'{{/is}}',
						'{{/is}}',
						'</div>',	
					'{{/if}}',
				'{{/is}}',
			'{{/is}}',

			//msg & help
			'{{#if help}}<span class="help-block editor-help-text" style="margin-bottom:0"><small>{{i18n help}}</small></span>{{/if}}',
			'<span class="help-block editor-status-text input-error" ui="msg">{{i18n msg}}</span>',
		'</div>'
	]);

})(Application);
;/**
 * Pre-defined validation rules/methods for basic editors.
 *
 * Rule Signature
 * --------------
 * name: function(options, val, form){
 * 	return nothing if ok
 * 	return error message if not
 * }
 *
 * Method Signature
 * ----------------
 * anything: function(val, form){
 * 	... same as rule signature
 * }
 *
 * Editor Config
 * -------------
 * validate: {
 * 	rule: options,
 * 	rule2: options,
 * 	fn: function(val, form){} - custom method
 * 	rule3: function(val, form){} - overriding existing rule for this editor
 * 	...
 * }
 *
 * or 
 *
 * validate: function(val, form){}
 *
 * A little note
 * -------------
 * We use the Application.Core.Editor module to register our validation rules, the enhanced editors or total customized editors might use them through the underlying basic editor(s) involved.
 *
 * @author Tim Lauv
 * @created 2013.11.13
 */

;(function(app){


	//preset rules
	app.Core.Editor.rules = {

		required: function(options, val, form){
			if(!val) return (_.isObject(options) && options.msg) || 'This field is required';
		}

	};

	//adding new rules at runtime
	app.Core.Editor.addRule = function(name, fn){
		if(!name || !_.isFunction(fn)) throw new Error('DEV::Editor::Basic validation rule must have a name and a function implementation.');
		if(app.Core.Editor.rules[name]) console.warn('DEV::Editor::Basic validation rule name ['+ name +'] is already defined.');

		app.Core.Editor.rules[name] = fn;
	};

})(Application);
;/**
 * This is the minimum Datagrid widget for data tables
 *
 * [table]
 * 		[thead]
 * 			<tr> th, ..., th </tr>
 * 		[tbody]
 * 			<tr> td, ..., td </tr>
 * 			...
 * 			<tr> ... </tr>
 *
 * Options
 * -------
 * 1. data []: rows of data
 * 2. columns [
 * 		{
 * 			name: datum key in data row
 * 			cell: cell name
 * 			header: header cell name
 * 			label: name given to header cell (instead of _.titleize(name))
 * 		}
 * ]
 * 3. details: false or datum name in data row or a view definition (render with row.model) - TBI
 * 
 *
 * Events
 * ------
 * 1. row:clicked
 * 2. row:dblclicked
 * 
 * 
 * Note
 * ----
 * The details row appears under each normal data row;
 *
 * TBI
 * ---
 * select header/cell
 * details row is still in TBI status (extra tr stub, view close clean up)
 * 
 * 
 * @author Tim Lauv
 * @created 2014.04.22
 */

;(function(app){

	app.widget('Datagrid', function(){

		var UI = app.view({
			tagName: 'table',
			template: [
				'<thead region="header"></thead>',
				'<tbody region="body"></tbody>'
			],
			initialize: function(options){
				this._options = _.extend({
					data: [],
					details: false,
					columns: []
				}, options);
			},
			onShow: function(){
				var that = this;
				var body = new Body({
					//el can be css selector string, dom or $(dom)
					el: this.body.$el 
					//Note that a region's el !== $el[0], but a view's el === $el[0] in Marionette.
				}).on('all', function(e){
					//setup data/page related events forwarding
					if(/page-/.test(e) || /data-/.test(e))
						that.trigger.apply(that, arguments);
				});

				this.header.show(HeaderRow);
				this.body.show(body);
				this.trigger('view:reconfigure', this._options);
			},
			onReconfigure: function(options){
				options = options || {};
				//1. reconfigure data and columns into this._options
				this._options = _.extend(this._options, options);

				//2. rebuild header cells - let it rerender with new column array
				_.each(this._options.columns, function(column){
					column.header = column.header || 'string';
					column.cell = column.cell || column.header || 'string';
					column.label = column.label || _.string.titleize(column.name);
				});

				////////////////Note that the ifs here are for early 'show' --> .set() when using local .data////////////////
				if(this.header.currentView) //update column headers region				
					this.header.currentView.set(this._options.columns);
				if(this.body.currentView)
					this.body.currentView._options = this._options;
				/////////////////////////////////////////////////////////////////////////////////////////////////////////////
				this.trigger('view:render-data', this._options.data);
			},
			onRenderData: function(data){
				if(this.body.currentView){
					//3. rebuild body rows - let it rerender with new data array
					this.body.currentView.trigger('view:render-data', data);
				}
			},
			onLoadPage: function(options){
				if(this.body.currentView){
					this.body.currentView.trigger('view:load-page', options);
				}
			},
			set: function(data){
				//override the default data rendering meta-event responder
				this.trigger('view:reconfigure', {data: data});
				//this is just to answer the 'view:render-data' event
			},
			get: function(){
				return this.getBody().get();
			},
			getBody: function(){
				return this.body.currentView;
			},
			getHeader: function(){
				return this.header.currentView;
			}
		});

		var HeaderRow = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: 'dynamic',
			itemViewEventPrefix: 'headercell',
			tagName: 'tr',
			initialize: function(options){
				this.grid = this.parentCt || (options && options.grid); //give each row the grid view ref.
			},
			//buildItemView - select proper header cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				return app.widget(_.string.classify([item.get('header'), 'header', 'cell'].join('-')), {
					model: item,
					tagName: 'th',

					row: this //link each cell with the row. (use/link it in cell's init())
				});
			}
		});

		var Row = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: 'dynamic',
			itemViewEventPrefix: 'cell',
			tagName: 'tr',
			triggers: { //forward DOM events to row
				'click': {
					event: 'clicked',
					preventDefault: false //for cell elements to work properly (checkbox/radio/<anchor/>)
				},
				'dblclick': {
					event: 'dblclicked',
					preventDefault: false
				}
			},
			initialize: function(options){
				this.grid = options.body.parentCt; //give each row the grid view ref.
			},
			//buildItemView - select proper cell
			buildItemView: function(item, ItemViewType, itemViewOptions){
				return app.widget(_.string.classify([item.get('cell'), 'cell'].join('-')), {
					tagName: 'td',
					model: item,

					row: this //link each cell with the row. (use/link it in cell's init())
				});
			}			
		});

		var Body = app.view({
			type: 'CollectionView',
			forceViewType: true,
			itemView: Row,
			itemViewEventPrefix: 'row',
			itemViewOptions: function(model, index){
				return {
					collection: app.collection(_.map(this._options.columns, function(column){
						return _.extend({
							value: app.extract(column.name || '', model.attributes),
							index: index
						}, column);
					}, this)),

					body: this //passing body to row view
				};
			},
			itemEvents: { //forward row events to grid
				'clicked': function(e, row){
					row.grid.trigger('row:clicked', row);
				},
				'dblclicked': function(e, row){
					row.grid.trigger('row:dblclicked', row);
				}
			}
		});
		return UI;

	});

})(Application);
;/**
 * The Default String Column Header Definition.
 *
 * @author Tim Lauv
 * @created 2013.11.25
 * @updated 2014.04.22
 */


;(function(app){

	app.widget('StringHeaderCell', function(){

		var UI = app.view({
			template: '<span><i class="{{icon}}"></i> {{{i18n label}}}</span>',
		});

		return UI;
	});

})(Application);
;/**
 * The Default String Column Cell Definition.
 *
 * @author Tim Lauv
 * @created 2013.11.25
 * @updated 2014.04.22
 */


;(function(app){

	app.widget('StringCell', function(){

		var UI = app.view({
			template: '<span>{{{value}}}</span>',
		});

		return UI;
	});

})(Application);
;/**
 * Cell that shows the seq number of record
 *
 * @author Tim Lauv
 * @created 2014.04.23
 */

;(function(app){

	app.widget('SeqCell', function(){
		var UI = app.view({
			template: '{{index}}'
		});

		return UI;
	});

})(Application);
;/**
 * This is the ActionCell definition 
 *
 * options
 * -------
 * passed down by this.model.get('actions')
 * 
 * actions: { (replace the actions)
 * 		'name': {
 * 			label: ...,
 * 			icon: ...,
 * 			tooltip: ...,
 * 			fn: function(){
 * 				this.model is the row record data model
 * 			}
 * 		},
 * 		...
 * }
 *
 * @author Tim Lauv
 * @created 2013.11.27
 * @updated 2014.04.22
 */

;(function(app){

	app.widget('ActionCell', function(){

		var UI = app.view({
			template: [
				'{{#each actions}}',
					'<span class="action-cell-item" action="{{@key}}" data-toggle="tooltip" title="{{i18n tooltip}}"><i class="{{icon}}"></i> {{i18n label}}</span> ',
				'{{/each}}'
			],
			className: 'action-cell',

			initialize: function(options){
				this.row = options.row;
				var actions = this.model.get('actions') || {};

					//default
					_.each({
						preview: {
							icon: 'glyphicon glyphicon-eye-open',
							tooltip: 'Preview'
						},
						edit: {
							icon: 'glyphicon glyphicon-pencil',
							tooltip: 'Edit'
						},
						'delete': {
							icon: 'glyphicon glyphicon-remove',
							tooltip: 'Delete'
						}
					}, function(def, name){
						if(actions[name]){
							actions[name] = _.extend(def, actions[name]);
						}
					});


				//allow action impl overriden by action config.fn
				this.actions = this.actions || {};
				_.each(actions, function(action, name){
					if(action.fn){
						this.actions[name] = function($action){
							action.fn.apply(this.row, arguments);
							/*Warning:: If we use options.row here, it won't work, since the options object will change, hence this event listener will be refering to other record's row when triggered*/
						};
					}
				}, this);
				this.model.set('actions', actions);
				this._enableActionTags(true);
			},
			tooltips: true

		});

		return UI;

	});	

})(Application);

;/**
 * This is the Tree widget.
 *
 * <ul>
 * 	<li></li>
 * 	<li></li>
 * 	<li>
 * 		<a></a> -- item val
 * 		<ul>...</ul> -- nested children
 * 	</li>
 * 	...
 * </ul>
 *
 * options
 * -------
 * 1. data - [{
 * 		val: ...
 * 		icon: ...
 * 		children: []
 * }]
 * 2. node - default view definition config: see nodeViewConfig below
 *
 * 3. onSelected: callback
 *
 * override node view
 * ------------------
 * a. just template (e.g val attr used in template)
 * use node: {template: [...]}; don't forget <ul></ul> at the end of tpl string.
 * 
 * b. children array attr
 * use node: {
 * 		initialize: function(){
 * 			if(this.className() === 'node') this.collection = app.collection(this.model.get('[new children attr]'));
 * 		}
 * }
 *
 * note
 * ----
 * support search and expand a path (use $parent in node/leaf onSelected()'s first argument)
 *
 * @author Tim Lauv
 * @created 2014.04.24
 */

;(function(app){

	app.widget('Tree', function(){

		var nodeViewConfig = {
			type: 'CompositeView',
			forceViewType: true,
			tagName: 'li',
			itemViewContainer: 'ul',
			itemViewOptions: function(){
				return {parent: this};
			},
			className: function(){
				if(_.size(this.model.get('children')) >= 1){
					return 'node';
				}
				return 'leaf';
			},
			initialize: function(options){
				this.parent = options.parent;
				if(this.className() === 'node') this.collection = app.collection(this.model.get('children'));
				this.listenTo(this, 'render', function(){
					this.$el.addClass('clickable').data({
						//register the meta-data of this node/leaf view
						view: this,
						'$children': this.$el.find('> ul'),
						'$parent': this.parent && this.parent.$el
					});
				});
			},
			template: [
				'<a class="item" href="#"><i class="type-indicator"></i> <i class="{{icon}}"></i> {{{i18n val}}}</a>',
				'<ul class="children hidden"></ul>' //1--tree nodes default on collapsed
			]
		};

		var Root = app.view({
			type: 'CollectionView',
			forceViewType: true,
			className: 'tree tree-root',
			tagName: 'ul',
			initialize: function(options){
				this._options = options;
				this.itemView = this._options.itemView || app.view(_.extend({}, nodeViewConfig, _.omit(this._options.node, 'type', 'tagName', 'itemViewContainer', 'itemViewOptions', 'className', 'initialize')));
				this.onSelected = options.onSelected || this.onSelected;
			},
			onShow: function(){
				this.trigger('view:reconfigure', this._options);
			},
			onReconfigure: function(options){
				_.extend(this._options, options);
				this.trigger('view:render-data', this._options.data); //the default onRenderData() should be suffice.
			},
			events: {
				'click .clickable': function(e){
					e.stopPropagation();
					var $el = $(e.currentTarget);
					var meta = $el.data();
					if($el.hasClass('node')) this.trigger('view:toggleChildren', meta);
					this.trigger('view:selected', $el.data(), $el, e);
				}
			},
			onToggleChildren: function(meta){
				//2--click to become expanded
				meta.$children.toggleClass('hidden');
				meta.view.$el.toggleClass('expanded');	
			},

			//override this
			onSelected: function(meta, $el, e){
			
			}

		});

		return Root;

	});

})(Application);
;/**
 * Passive Paginator widget used with lists (CollectionView instances)
 *
 * options
 * -------
 * 0. target [opt] - target list view instance
 * 1. currentPage
 * 2. totalPages
 * 3. pageWindowSize - 3 means [1,2,3,...,] or [...,4,5,6,...] or [...,7,8,9] - default on 5
 *
 * format
 * ------
 * << [1,2,...] >>
 *
 * link with lists
 * ---------------
 * trigger('view:change-page', page number)
 * 
 * [listenTo(target, 'view:page-changed')] - if target is passed in through init options
 * [listenTo(this, 'view:change-page')] - if target is passed in through init options
 * 
 * @author Tim Lauv
 * @create 2014.05.05
 * @update 2014.12.01 (+pageWindowSize)
 */

;(function(app){

	app.widget('Paginator', function(){
		var UI = app.view({

			className: 'pagination',
			tagName: 'ul',
			
			template: [
				'<li {{#if atFirstPage}}class="disabled"{{/if}}><a href="#" action="goToFirstPage" data-page="--">'+_.escape('<<')+'</a></li>',
				'<li {{#if atFirstWindow}}class="hidden"{{/if}}><a href="#" action="goToAdjacentWindow" data-window="-">...</a></li>',
				'{{#each pages}}',
					'<li {{#if isCurrent}}class="active"{{/if}}><a href="#" action="goToPage" data-page="{{number}}">{{number}} <span class="sr-only">(current)</span></a></li>',
				'{{/each}}',
				'<li {{#if atLastWindow}}class="hidden"{{/if}}><a href="#" action="goToAdjacentWindow" data-window="+">...</a></li>',
				'<li {{#if atLastPage}}class="disabled"{{/if}}><a href="#" action="goToLastPage" data-page="++">'+_.escape('>>')+'</a></li>',
			],

			initialize: function(options){
				this._options = _.extend({
					pageWindowSize: 5,
				},options);
				//if options.target, link to its 'view:page-changed' event
				if(options.target) this.listenTo(options.target, 'view:page-changed', function(args){
					this.trigger('view:reconfigure', {
						currentPage: args.current,
						totalPages: args.total
					});
				});
			},
			onShow: function(){
				//this.trigger('view:reconfigure', this._options);
			},
			onReconfigure: function(options){
				_.extend(this._options, options);
				//use options.currentPage, totalPages to build config data - atFirstPage, atLastPage, pages[{number:..., isCurrent:...}]
				//calculate currentWindow dynamically
				this._options.currentWindow = Math.ceil(this._options.currentPage/this._options.pageWindowSize);
				var config = {
					atFirstPage: this._options.currentPage === 1,
					atLastPage: this._options.currentPage === this._options.totalPages,
					atFirstWindow: this._options.currentWindow === 1,
					atLastWindow: this._options.currentWindow === Math.ceil(this._options.totalPages/this._options.pageWindowSize),
					pages: _.reduce(_.range(1, this._options.totalPages + 1), function(memo, pNum){
						if(pNum > (this._options.currentWindow - 1) * this._options.pageWindowSize && pNum <= this._options.currentWindow * this._options.pageWindowSize)
							memo.push({
								number: pNum,
								isCurrent: pNum === this._options.currentPage
							});
						return memo;
					}, [], this)
				};

				this.trigger('view:render-data', config);
			},
			actions: {
				goToPage: function($btn, e){
					e.preventDefault();
					var page = $btn.data('page');
					if(page === this._options.currentPage) return;

					this.trigger('view:change-page', page);
				},
				goToFirstPage: function($btn, e){
					e.preventDefault();
					this.trigger('view:change-page', 1);
				},
				goToLastPage: function($btn, e){
					e.preventDefault();
					this.trigger('view:change-page', this._options.totalPages);
				},
				//Skipped atm.../////////////////////////
				// goToAdjacentPage: function($btn, e){
				// 	e.preventDefault();
				// 	var pNum = this._options.currentPage;
				// 	var op = $btn.data('page');
				// 	if(op === '+')
				// 		pNum ++;
				// 	else
				// 		pNum --;

				// 	if(pNum < 1 || pNum > this._options.totalPages) return;
				// 	if(pNum > this._options.currentWindow * this._options.pageWindowSize) this._options.currentWindow ++;
				// 	if(pNum <= (this._options.currentWindow - 1) * this._options.pageWindowSize) this._options.currentWindow --;
				// 	this.trigger('view:change-page', pNum);
				// },
				/////////////////////////////////////////
				goToAdjacentWindow: function($btn, e){
					e.preventDefault();
					var pWin = this._options.currentWindow;
					var op = $btn.data('window');
					if(op === '+')
						pWin ++;
					else
						pWin --;

					if (pWin < 1 || pWin > Math.ceil(this._options.totalPages/this._options.pageWindowSize)) return;
					this.trigger('view:change-page', (pWin == 1) ? 1 : (pWin-1) * this._options.pageWindowSize + 1);
				}
			},
			//////Can be overriden in options to add extra params///////
			onChangePage: function(pNum){
				//use the overriden version (see the stub impl below for what to override)
				if(this._options.onChangePage)
					return this._options.onChangePage.call(this, pNum);

				//use just a default stub implementation
				if(this._options.target) 
					this._options.target.trigger('view:load-page', {
						page: pNum
						//add more params/querys
					});
			}

		});

		return UI;
	});

})(Application);
;;app.stagejs = "1.9.3-1130 build 1477364407739";
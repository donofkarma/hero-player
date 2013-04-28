/**
* Featured Content/Hero Player
*
* @version	0.4
* @author	Jasal Vadgama - http://blacklabelcreative.com/
* @require	jQuery 1.9.1 - http://jquery.com/
			Hammer.JS v1.0.5 - http://eightmedia.github.com/hammer.js
*			jQuery Easing 1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
* @license	MIT
**/

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variable rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = "heroPlayer",
		defaults = {
			// SETTINGS
			animateSpeed: 1000,				// speed of each transition (ms)
			autoScroll: false,				// turn on auto scroll
			circular: false,				// moves list item around
			easing: 'easeInOutCubic',		// define the type of easing
			hiddenControlsOpacity: 0,		// opacity of the controls when hidden
			scrollInterval: 5000,			// time between scrolls (ms)
			showControls: true,				// show controls on the main items
			showNav: false,					// show the quick nav menu for the main items

			// CALLBACKS
			onHeroLoad: '',					// function to call once the player has loaded
			beforeAnimate: '',				// function to call before animation
			onComplete: ''					// function to call after animation completion
		},
		vars = {
			cInterval: '',					// setInterval holder
			currentItem: 0,					// the index of the currently displayed item
			itemCount: 0,					// total number of items in the player
			itemWidth: 0,					// width of one hero item
			offset: 0,						// the current margin-left for non-circular players
			totalItemWidth: 0,				// total width of items
			isBeforeAnimate: false,			// is beforeAnimate a function
			isOnComplete: false				// is OnComplete a function
		};

	// The actual plugin constructor
	function Plugin(element, options) {
		this.element = element;
		this.$element = $(element);
		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function() {
			// Place initialization logic here
			// You already have access to the DOM element and
			// the options via the instance, e.g. this.element
			// and this.options
			// you can add more functions like the one below and
			// call them like so: this.yourOtherFunction(this.element, this.options).

			var $heroUl = this.$element.find('ul'),
				$directNav;

			// set up vars
			vars.itemCount = this.$element.find('li').length;
			vars.itemWidth = this.$element.width();
			vars.totalItemWidth = vars.itemWidth * vars.itemCount;

			// make sure the hiddenControlsOpacity is > 0 and < 1
			if (this.options.hiddenControlsOpacity > 1) {
				this.options.hiddenControlsOpacity = 1;
			} else if (this.options.hiddenControlsOpacity < 0) {
				this.options.hiddenControlsOpacity = 0;
			}

			// set ul width
			$heroUl.css({
				width: vars.totalItemWidth + 'px'
			}).wrap('<div class="heroMask" />');

			// if circular, set up new start state
			if (this.options.circular) {
				// move last item to the beginning and set new margin-left
				this.$element.find('li:last').prependTo($heroUl);
				$heroUl.css('margin-left', '-' + vars.itemWidth + 'px');
			}

			// set up controls
			if (this.options.showControls) {
				$('<a class="arrowPrev" href="#">Previous</a>')
					.on('click', { scope: this }, function(e) {
						e.preventDefault();
						e.data.scope.animatePrev();
					})
					.css('opacity', this.options.hiddenControlsOpacity)
					.appendTo(this.$element.find('.heroMask'));

				$('<a class="arrowNext" href="#">Next</a>')
					.on('click', { scope: this }, function(e) {
						e.preventDefault();
						e.data.scope.animateNext(1);
					})
					.css('opacity', this.options.hiddenControlsOpacity)
					.appendTo(this.$element.find('.heroMask'));

				// add fade effect if needed
				if (this.options.hiddenControlsOpacity < 1) {
					this.$element.find('.heroMask').on('mouseenter', { element: this.$element }, function(e) {
						e.data.element.find('.arrowPrev, .arrowNext').stop(true, true).animate({
							opacity: 1
						});
					}).on('mouseleave', { element: this.$element, opacity: this.options.hiddenControlsOpacity }, function(e) {
						e.data.element.find('.arrowPrev, .arrowNext').stop(true, true).animate({
							opacity: e.data.opacity
						});
					});
				}
			}

			// set up direct nav
			if (this.options.showNav) {
				$directNav = $('<div class="directNav"></div>');

				for (i = 0; i < vars.itemCount; i++) {
					$('<a href="#" title=""></a>').appendTo($directNav);
				}

				$directNav.find('a').bind('click', { scope: this }, function(e) {
					e.preventDefault();
					e.data.scope.animateDirect($(this).index());
				});

				$directNav.find('a:first').addClass('active');
				$directNav.appendTo(this.$element);
			}

			// add auto scroll
			if (this.options.autoScroll) {
				vars.cInterval = window.setInterval(function() { animateNext(this, 1); }, this.options.scrollInterval);

				this.$element.on('mouseenter', function() {
					window.clearInterval(vars.cInterval);
				}).on('mouseleave', function() {
					vars.cInterval = window.setInterval(function() { animateNext(this, 1); }, this.options.scrollInterval);
				});
			}

			// set up callbacks
			if (typeof this.options.onHeroLoad === 'function') {
				this.options.onHeroLoad(this);
			}
			if (typeof this.options.beforeAnimate === 'function') {
				vars.isBeforeAnimate = true;
			}
			if (typeof this.options.onComplete === 'function') {
				vars.isOnComplete = true;
			}
		},

		animatePrev: function() {
			var self = this,
				$heroUl = this.$element.find('ul');

			// fire beforeAnimate
			if (vars.isBeforeAnimate) {
				this.options.beforeAnimate(this.$element);
			}

			if (!this.options.circular) {
				if (vars.offset === 0) {
					vars.offset = (vars.totalItemWidth - vars.itemWidth) * -1;
				} else {
					vars.offset = vars.offset + vars.itemWidth;
				}

				$heroUl.stop(false, false).animate({
					marginLeft: vars.offset + 'px'
				}, this.options.animateSpeed, this.options.easing, function() {
					// fire onComplete
					if (vars.isOnComplete) {
						self.options.onComplete(this.$element);
					}
				});
			} else {
				// animate player
				$heroUl.stop(false, false).animate({
					marginLeft: '0px'
				}, this.options.animateSpeed, this.options.easing, function() {
					// move last item to start
					self.$element.find('li:last').prependTo($heroUl);

					// change css margin left to one item
					$heroUl.css('margin-left', '-' + vars.itemWidth + 'px');

					// fire onComplete
					if (vars.isOnComplete) {
						self.options.onComplete(self.$element);
					}
				});
			}

			// set currentItem
			if (vars.currentItem === 0) {
				vars.currentItem = vars.itemCount - 1;
			} else {
				vars.currentItem--;
			}

			this.$element.find('a.active').removeClass('active');
			this.$element.find('.directNav a:eq(' + vars.currentItem + ')').addClass('active');
		},

		animateNext: function(moves) {
			var self = this;
				$heroUl = this.$element.find('ul');

			// fire beforeAnimate
			if (vars.isBeforeAnimate) {
				this.options.beforeAnimate(this.$element);
			}

			if (!this.options.circular) {
				if (vars.offset * -1 < (vars.totalItemWidth - vars.itemWidth))
					vars.offset = vars.offset - vars.itemWidth;
				else
					vars.offset = 0;

				$heroUl.stop(false, false).animate({
					marginLeft: vars.offset + 'px'
				}, this.options.animateSpeed, this.options.easing, function() {
					// fire onComplete
					if (vars.isOnComplete) {
						this.options.onComplete(this.$element);
					}
				});
			} else {
				// animate player
				$heroUl.stop(false, false).animate({
					marginLeft: '-' + (vars.itemWidth + (vars.itemWidth * moves)) + 'px'
				}, this.options.animateSpeed, this.options.easing, function() {
					for (i = 0; i < moves; i++) {
						// move first item to end
						self.$element.find('li:first').appendTo($heroUl);
					}

					// change css margin left to one item
					$heroUl.css('margin-left', '-' + vars.itemWidth + 'px');

					// fire onComplete
					if (vars.isOnComplete) {
						self.options.onComplete(self.$element);
					}
				});
			}

			// set currentItem
			if (vars.currentItem == vars.itemCount - 1)
				vars.currentItem = 0;
			else
				vars.currentItem++;

			this.$element.find('a.active').removeClass('active');
			this.$element.find('.directNav a:eq(' + vars.currentItem + ')').addClass('active');
		},

		animateDirect: function(item) {
			var moveTo,
				self = this,
				$heroUl = this.$element.find('ul');

			// fire beforeAnimate
			if (vars.isBeforeAnimate) {
				this.options.beforeAnimate(this.$element);
			}

			if (!this.options.circular) {
				if (item === 0) {
					vars.offset = 0;
				} else {
					vars.offset = (vars.itemWidth * item) * -1;
				}

				$heroUl.stop(false, false).animate({
					marginLeft: vars.offset + 'px'
				}, this.options.animateSpeed, this.options.easing, function() {
					// fire onComplete
					if (vars.isOnComplete) {
						self.options.onComplete(self.$element);
					}
				});

				// set currentItem
				vars.currentItem = item;

				this.$element.find('a.active').removeClass('active');
				this.$element.find('.directNav a:eq(' + vars.currentItem + ')').addClass('active');
			} else {
				// set to same data ie 1 indexed list
				item += 1;
				current = vars.currentItem + 1;

				moveTo = vars.itemCount - (current - item);

				if (moveTo > vars.itemCount) {
					moveTo -= vars.itemCount;
				}

				// animate
				if (moveTo == vars.itemCount - 1) {
					// previous step
					this.animatePrev();
				} else if (moveTo < vars.itemCount - 1) {
					// next step
					this.animateNext(moveTo);
				}
			}
		}
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};

})(jQuery, window, document);
/**
* Featured Content/Hero Player
*
* @version	0.2
* @author	Jasal Vadgama - http://blacklabelcreative.com/
* @require	jQuery - http://jquery.com/
*			jQuery Easing 1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
* @license	MIT
**/

(function($){
	$.fn.hero = function(settings) {
		var config = {
			animateSpeed: 1000,				// speed of each transition (ms)
			autoScroll: false,				// turn on auto scroll
			circular: false,				// moves list item around
			easing: 'easeInOutCubic',		// define the type of easing
			scrollInterval: 5000,			// time between scrolls (ms)
			showControls: true,				// show controls on the main items
			showNav: false					// show the quick nav menu for the main items
		};

		var vars = {
			cInterval: '',					// setInterval holder
			currentItem: 0,					// the index of the currently displayed item
			itemCount: 0,					// total number of items in the player
			itemWidth: 0,					// width of one hero item
			offset: 0,						// the current margin-left for non-circular players
			totalItemWidth: 0				// total width of items
		};

		if (settings) $.extend(config, settings);

		function init(hero) {
			var $heroUl = hero.find('ul'),
				$directNav;

			// set up vars
			vars.itemCount = hero.find('li').length;
			vars.itemWidth = hero.width();
			vars.totalItemWidth = vars.itemWidth * vars.itemCount;

			// set ul width
			$heroUl.css({
				width: vars.totalItemWidth + 'px'
			}).wrap('<div class="heroMask" />');
			
			// if circular, set up new start state
			if (config.circular) {
				// move last item to the beginning and set new margin-left
				hero.find('li:last').prependTo($heroUl);
				$heroUl.css('margin-left', '-' + vars.itemWidth + 'px');
			}
			
			// set up controls
			if (config.showControls) {
				$('<a class="arrowPrev" href="#">Previous</a>')
					.bind('click', function(e) {
						e.preventDefault();

						animatePrev(hero);
					}).appendTo(hero.find('.heroMask'));

				$('<a class="arrowNext" href="#">Next</a>')
					.bind('click', function(e) {
						e.preventDefault();

						animateNext(hero, 1);
					}).appendTo(hero.find('.heroMask'));
				
				// add fade effect
				hero.find('.heroMask').mouseenter(function() {
					hero.find('.arrowPrev, .arrowNext').stop(true, true).fadeIn();
				}).mouseleave(function() {
					hero.find('.arrowPrev, .arrowNext').stop(true, true).fadeOut();
				});
			}
			
			// set up direct nav
			if (config.showNav) {
				$directNav = $('<div class="directNav"></div>');
				
				for (i = 0; i < vars.itemCount; i++) {
					$('<a href="#" title="">&#160;</a>')
						.bind('click', function(e) {
							e.preventDefault();
							animateDirect(hero, $(this).index());
							hero.find('a.active').removeClass('active');
							$(this).addClass('active');
						})
						.appendTo($directNav);
				}

				$directNav.appendTo(hero);
				hero.find('.directNav a:eq(' + vars.currentItem + ')').addClass('active');
			}
			
			// add auto scroll
			if (config.autoScroll) {
				vars.cInterval = window.setInterval(function() { animateNext(hero, 1); }, config.scrollInterval);

				hero.mouseenter(function() {
					window.clearInterval(vars.cInterval);
				}).mouseleave(function() {
					vars.cInterval = window.setInterval(function() { animateNext(hero, 1); }, config.scrollInterval);
				});
			}
		}
		
		function animatePrev(hero) {
			var $heroUl = hero.find('ul');

			if (!config.circular) {
				if (vars.offset === 0) {
					vars.offset = (vars.totalItemWidth - vars.itemWidth) * -1;
				} else {
					vars.offset = vars.offset + vars.itemWidth;
				}

				$heroUl.stop(false, false).animate({
					marginLeft: vars.offset + 'px'
				}, config.animateSpeed, config.easing);
			} else {
				// animate player
				$heroUl.stop(false, false).animate({
					marginLeft: '0px'
				}, config.animateSpeed, config.easing, function() {
					// move last item to start
					hero.find('li:last').prependTo($heroUl);

					// change css margin left to one item
					$heroUl.css('margin-left', '-' + vars.itemWidth + 'px');
				});
			}
			
			// set currentItem
			if (vars.currentItem === 0) {
				vars.currentItem = vars.itemCount - 1;
			} else {
				vars.currentItem--;
			}

			hero.find('a.active').removeClass('active');
			hero.find('.directNav a:eq(' + vars.currentItem + ')').addClass('active');
		}
		
		function animateNext(hero, moves) {
			var $heroUl = hero.find('ul');

			if (!config.circular) {
				if (vars.offset * -1 < (vars.totalItemWidth - vars.itemWidth))
					vars.offset = vars.offset - vars.itemWidth;
				else
					vars.offset = 0;
			
				$heroUl.stop(false, false).animate({
					marginLeft: vars.offset + 'px'
				}, config.animateSpeed, config.easing);
			} else {
				// animate player
				$heroUl.stop(false, false).animate({
					marginLeft: '-' + (vars.itemWidth + (vars.itemWidth * moves)) + 'px'
				}, config.animateSpeed, config.easing, function() {
					for (i = 0; i < moves; i++) {
						// move first item to end
						hero.find('li:first').appendTo($heroUl);
					}
					
					// change css margin left to one item
					$heroUl.css('margin-left', '-' + vars.itemWidth + 'px');
				});
			}
			
			// set currentItem
			if (vars.currentItem == vars.itemCount - 1)
				vars.currentItem = 0;
			else
				vars.currentItem++;

			hero.find('a.active').removeClass('active');
			hero.find('.directNav a:eq(' + vars.currentItem + ')').addClass('active');
		}

		function animateDirect(hero, item) {
			var moveTo,
				$heroUl = hero.find('ul');

			if (!config.circular) {
				if (item === 0) {
					vars.offset = 0;
				} else {
					vars.offset = (vars.itemWidth * item) * -1;
				}

				$heroUl.stop(false, false).animate({
					marginLeft: vars.offset + 'px'
				}, config.animateSpeed, config.easing);

				// set currentItem
				vars.currentItem = item;

				hero.find('a.active').removeClass('active');
				hero.find('.directNav a:eq(' + vars.currentItem + ')').addClass('active');
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
					animatePrev(hero);
				} else if (moveTo < vars.itemCount - 1) {
					// next step
					animateNext(hero, moveTo);
				}
			}
		}

		// init hero player
		init(this);
	};
})(jQuery);
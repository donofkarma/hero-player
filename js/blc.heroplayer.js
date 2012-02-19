/**
* Featured Content/Hero Player
*
* @version	0.1
* @author	Jasal Vadgama - http://blacklabelcreative.com/
* @require	jQuery - http://jquery.com/
*			jQuery Easing 1.3 - http://link here/
* @license	GPL v3
**/

(function($){
	$.fn.hero = function(settings) {
		var config = {
			animateSpeed: 1000,				// speed of each transition (ms)
			autoScroll: false,				// turn on auto scroll
			circular: false,				// moves list item around
			easing: "easeInOutCubic",		// define the type of easing
			scrollInterval: 5000,			// time between scrolls (ms)
			showControls: true,				// show controls on the main items
			showNav: false					// show the quick nav menu for the main items
		};

		var vars = {
			cInterval: "",					// setInterval holder
			currentItem: 0,					// the index of the currently displayed item
			itemCount: 0,					// total number of items in the player
			itemWidth: 0,					// width of one hero item
			offset: 0,						// the current margin-left for non-circular players
			totalItemWidth: 0				// total width of items
		};

		if (settings) $.extend(config, settings);

		function init(hero) {
			// set up vars
			vars.currentItem = 0;
			vars.itemCount = $(hero).find("li").length;
			vars.itemWidth = $(hero).width();
			vars.offset = 0;
			vars.totalItemWidth = vars.itemWidth * vars.itemCount;

			// set ul width
			$(hero).find("ul").css({
				width: vars.totalItemWidth + "px"
			}).wrap("<div class='heroMask' />");
			
			// if circular, set up new start state
			if (config.circular) {
				// move last item to the beginning and set new margin-left
				$(hero).find("li:last").prependTo($(hero).find("ul"));
				$(hero).find("ul").css("margin-left", "-" + vars.itemWidth + "px");
			}
			
			// set up controls
			if (config.showControls) {
				$("<a class='arrowPrev' href='#'>Previous</a>")
					.click(function() {
						animatePrev(hero);
						return false;
					}).appendTo($(hero).find(".heroMask"));

				$("<a class='arrowNext' href='#'>Next</a>")
					.click(function() {
						animateNext(hero, 1);
						return false;
					}).appendTo($(hero).find(".heroMask"));
				
				// add fade effect
				$(hero).find(".heroMask").mouseenter(function() {
					$(hero).find(".arrowPrev, .arrowNext").fadeIn();
				}).mouseleave(function() {
					$(hero).find(".arrowPrev, .arrowNext").fadeOut();
				});
			}
			
			// set up direct nav
			if (config.showNav) {
				$("<div class='directNav'></div>").appendTo($(hero));
				
				for (i = 0; i < vars.itemCount; i++) {
					$("<a href='#' title=''></a>")
						.html("item " + i)
						.click(function() {
							animateDirect(hero, $(this).index());
							$(hero).find("a.active").removeClass("active");
							$(this).addClass("active");
							return false;
						})
						.appendTo($(hero).find(".directNav"));
				}

				$(hero).find("a.active").removeClass("active");
				$(hero).find(".directNav a:eq(" + vars.currentItem + ")").addClass("active");
			}
			
			// add auto scroll
			if (config.autoScroll) {
				vars.cInterval = window.setInterval(function() { animateNext(hero, 1); }, config.scrollInterval);

				$(hero).mouseenter(function() {
					window.clearInterval(vars.cInterval);
				}).mouseleave(function() {
					vars.cInterval = window.setInterval(function() { animateNext(hero, 1); }, config.scrollInterval);
				});
			}
		}
		
		function animatePrev(hero) {
			if (!config.circular) {
				if (vars.offset === 0) {
					vars.offset = (vars.totalItemWidth - vars.itemWidth) * -1;
				} else {
					vars.offset = vars.offset + vars.itemWidth;
				}

				$(hero).find("ul").stop(false, false).animate({
					marginLeft: vars.offset + "px"
				}, config.animateSpeed, config.easing);
			} else {
				// animate player
				$(hero).find("ul").stop(false, false).animate({
					marginLeft: "0px"
				}, config.animateSpeed, config.easing, function() {
					// move last item to start
					$(hero).find("li:last").prependTo($(hero).find("ul"));

					// change css margin left to one item
					$(hero).find("ul").css("margin-left", "-" + vars.itemWidth + "px");
				});
			}
			
			// set currentItem
			if (vars.currentItem === 0) {
				vars.currentItem = vars.itemCount - 1;
			} else {
				vars.currentItem--;
			}

			$(hero).find("a.active").removeClass("active");
			$(hero).find(".directNav a:eq(" + vars.currentItem + ")").addClass("active");
		}
		
		function animateNext(hero, moves) {
			if (!config.circular) {
				if (vars.offset * -1 < (vars.totalItemWidth - vars.itemWidth))
					vars.offset = vars.offset - vars.itemWidth;
				else
					vars.offset = 0;
			
				$(hero).find("ul").stop(false, false).animate({
					marginLeft: vars.offset + "px"
				}, config.animateSpeed, config.easing);
			} else {
				// animate player
				$(hero).find("ul").stop(false, false).animate({
					marginLeft: "-" + (vars.itemWidth + (vars.itemWidth * moves)) + "px"
				}, config.animateSpeed, config.easing, function() {
					for (i = 0; i < moves; i++) {
						// move first item to end
						$(hero).find("li:first").appendTo($(hero).find("ul"));
					}
					
					// change css margin left to one item
					$(hero).find("ul").css("margin-left", "-" + vars.itemWidth + "px");
				});
			}
			
			// set currentItem
			if (vars.currentItem == vars.itemCount - 1)
				vars.currentItem = 0;
			else
				vars.currentItem++;

			$(hero).find("a.active").removeClass("active");
			$(hero).find(".directNav a:eq(" + vars.currentItem + ")").addClass("active");
		}

		function animateDirect(hero, item) {
			if (!config.circular) {
				if (item === 0) {
					vars.offset = 0;
				} else {
					vars.offset = (vars.itemWidth * item) * -1;
				}

				$(hero).find("ul").stop(false, false).animate({
					marginLeft: vars.offset + "px"
				}, config.animateSpeed, config.easing);

				// set currentItem
				vars.currentItem = item;

				$(hero).find("a.active").removeClass("active");
				$(hero).find(".directNav a:eq(" + vars.currentItem + ")").addClass("active");
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
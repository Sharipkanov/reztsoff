(function () {

	function YOURAPPNAME(doc) {
		var _self = this;

		_self.doc = doc;
		_self.window = window;
		_self.html = _self.doc.querySelector('html');
		_self.body = _self.doc.body;
		_self.location = location;
		_self.hash = location.hash;
		_self.Object = Object;
		_self.scrollWidth = 0;

		_self.bootstrap();
	}

	YOURAPPNAME.prototype.bootstrap = function () {
		var _self = this;

		// Initialize window scollBar width
		_self.scrollWidth = _self.scrollBarWidth();
	};

	// Window load types (loading, dom, full)
	YOURAPPNAME.prototype.appLoad = function (type, callback) {
		var _self = this;

		switch (type) {
			case 'loading':
				if (_self.doc.readyState === 'loading') callback();

				break;
			case 'dom':
				_self.doc.onreadystatechange = function () {
					if (_self.doc.readyState === 'complete') callback();
				};

				break;
			case 'full':
				_self.window.onload = function (e) {
					callback(e);
				};

				break;
			default:
				callback();
		}
	};

	// Detect scroll default scrollBar width (return a number)
	YOURAPPNAME.prototype.scrollBarWidth = function () {
		var _self = this,
			outer = _self.doc.createElement("div");
		outer.style.visibility = "hidden";
		outer.style.width = "100px";
		outer.style.msOverflowStyle = "scrollbar";

		_self.body.appendChild(outer);

		var widthNoScroll = outer.offsetWidth;

		outer.style.overflow = "scroll";

		var inner = _self.doc.createElement("div");

		inner.style.width = "100%";
		outer.appendChild(inner);

		var widthWithScroll = inner.offsetWidth;

		outer.parentNode.removeChild(outer);

		return widthNoScroll - widthWithScroll;
	};

	YOURAPPNAME.prototype.initSwitcher = function () {
		var _self = this;

		var switchers = _self.doc.querySelectorAll('[data-switcher]');

		if (switchers && switchers.length > 0) {
			for (var i = 0; i < switchers.length; i++) {
				var switcher = switchers[i],
					switcherOptions = _self.options(switcher.dataset.switcher),
					switcherElems = switcher.children,
					switcherTargets = _self.doc.querySelector('[data-switcher-target="' + switcherOptions.target + '"]').children;

				for (var y = 0; y < switcherElems.length; y++) {
					var switcherElem = switcherElems[y],
						parentNode = switcher.children,
						switcherTarget = switcherTargets[y];

					if (switcherElem.classList.contains('active')) {
						for (var z = 0; z < parentNode.length; z++) {
							parentNode[z].classList.remove('active');
							switcherTargets[z].classList.remove('active');
						}
						switcherElem.classList.add('active');
						switcherTarget.classList.add('active');
					}

					switcherElem.children[0].addEventListener('click', function (elem, target, parent, targets) {
						return function (e) {
							e.preventDefault();
							if (!elem.classList.contains('active')) {
								for (var z = 0; z < parentNode.length; z++) {
									parent[z].classList.remove('active');
									targets[z].classList.remove('active');
								}
								elem.classList.add('active');
								target.classList.add('active');
							}
						};

					}(switcherElem, switcherTarget, parentNode, switcherTargets));
				}
			}
		}
	};

	YOURAPPNAME.prototype.str2json = function (str, notevil) {
		try {
			if (notevil) {
				return JSON.parse(str
					.replace(/([\$\w]+)\s*:/g, function (_, $1) {
						return '"' + $1 + '":';
					})
					.replace(/'([^']+)'/g, function (_, $1) {
						return '"' + $1 + '"';
					})
				);
			} else {
				return (new Function("", "var json = " + str + "; return JSON.parse(JSON.stringify(json));"))();
			}
		} catch (e) {
			return false;
		}
	};

	YOURAPPNAME.prototype.options = function (string) {
		var _self = this;

		if (typeof string != 'string') return string;

		if (string.indexOf(':') != -1 && string.trim().substr(-1) != '}') {
			string = '{' + string + '}';
		}

		var start = (string ? string.indexOf("{") : -1), options = {};

		if (start != -1) {
			try {
				options = _self.str2json(string.substr(start));
			} catch (e) {
			}
		}

		return options;
	};

	YOURAPPNAME.prototype.modal = function () {
		var _self = this;

		var modal = {}, i;

		modal.init = function () {
			var popupOverlays = _self.doc.getElementsByClassName('popup-overlay');

			for (i = 0; i < popupOverlays.length; i++) {
				popupOverlays[i].addEventListener('click', function (e) {
					if(e.target === e.currentTarget) e.preventDefault();

					if (e.target.classList.contains('popup-overlay')) {
						modal.closeModal();
					}
				});
			}

			var closeButtons = _self.doc.getElementsByClassName('js-close-popup');

			for (i = 0; i < closeButtons.length; i++) {
				closeButtons[i].addEventListener('click', function (e) {
					e.preventDefault();

					var popupName = this.closest('.popup').getAttribute('data-popup');

					modal.closeModal(popupName);
				});
			}

			var openPopupsBtns = _self.doc.getElementsByClassName('js-open-popup');

			for (i = 0; i < openPopupsBtns.length; i++) {
				openPopupsBtns[i].addEventListener('click', function (e) {
					e.preventDefault();

					var popupName = this.getAttribute('data-popup-name');

					modal.openModal(popupName);
				});
			}
		};

		modal.openModal = function (popupName) {
			_self.doc.querySelector('.popup-overlay').classList.add('opened');
			var popup = _self.doc.querySelector('[data-popup="' + popupName + '"]');

			popup.classList.add('opened');

			_self.html.style.overflow = 'hidden';
			_self.body.style.paddingRight = _self.scrollWidth + 'px';
		};

		modal.closeModal = function (popupName) {
			_self.doc.getElementsByClassName('popup-overlay')[0].classList.remove('opened');
			if (popupName) {
				var popup = _self.doc.querySelector('[data-popup="' + popupName + '"]');
				popup.classList.remove('opened');
			} else {
				var popups = _self.doc.querySelectorAll('[data-popup]');

				for (var i = 0; i < popups.length; i++) {
					popups[i].classList.remove('opened');
				}
			}

			_self.html.style.overflow = 'initial';
			_self.body.style.paddingRight = 'initial';
		};

		modal.init();

		return modal;
	};

	var app = new YOURAPPNAME(document);

	app.appLoad('loading', function () {
		// App is loading... Paste your app code here. 4example u can run preloader event here and stop it in action appLoad dom or full
	});

	app.appLoad('dom', function () {
		// DOM is loaded! Paste your app code here (Pure JS code).
		// Do not use jQuery here cause external libs do not loads here...

		// app.initSwitcher(); // data-switcher="{target='anything'}" , data-switcher-target="anything"
		var modals = app.modal();

		var ADOButtons = app.doc.getElementsByClassName('js-article-direction-open');
		var ADCButtons = app.doc.getElementsByClassName('js-article-direction-close');
		var AD = app.doc.getElementsByClassName('article-direction');
		var i;

		if (ADOButtons && ADOButtons.length > 0) {
			for (i = 0; i < ADOButtons.length; i++) {
				var ADOBtn = ADOButtons[i];

				ADOBtn.addEventListener('click', function (e) {
					e.preventDefault();

					for (var y = 0; y < AD.length; y++) {
						AD[y].classList.remove('article-direction_active');
					}

					var ADparent = this.closest('.article-direction');
					ADparent.classList.add('article-direction_active');
				});
			}
		}

		if (ADCButtons && ADCButtons.length > 0) {
			for (i = 0; i < ADCButtons.length; i++) {
				var ADCBtn = ADCButtons[i];

				ADCBtn.addEventListener('click', function (e) {
					e.preventDefault();

					for (var y = 0; y < AD.length; y++) {
						AD[y].classList.remove('article-direction_active');
					}
				});
			}
		}
	});

	app.appLoad('full', function (e) {
		// App was fully load! Paste external app source code here... 4example if your use jQuery and something else
		// Please do not use jQuery ready state function to avoid mass calling document event trigger!

		var $reviewsCarousel = $('.reviews-carousel'),
				$licencesCarousel = $('.licenses-carousel');

		$licencesCarousel.owlCarousel({
			items:1,
			autoplay: true,
			autoplayTimeout: 35000
		});

		$reviewsCarousel.owlCarousel({
			items: 1
		});

		$('.js-reviews-carousel-slide').click(function (e) {
			e.preventDefault();

			var $btn = $(this);
			var $slideDirection = $btn.attr('href').replace('#', '');

			$reviewsCarousel.trigger($slideDirection + '.owl.carousel');

		});

		$('.js-scroll-navigation, .js-scroll-section').click(function (e) {
			e.preventDefault();

			$('html, body').animate({
				scrollTop: $($.attr(this, 'href')).offset().top
			}, 500);
		});
	});

})();

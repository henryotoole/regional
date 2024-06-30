/**util.js
 * Josh Reed 2020
 * 
 * Core utility classes for the Regional Model Framework
 */

class OverlayTooltip
{
	/**
	 * This constructor instantiates a new tooltip overlay and attaches it to $binder. It will then show on hover for an appropriate amount of time.
	 * @param {JQuery object} $dom The DOM to add the tooltip to
	 * @param {String} text The tooltip text
	 * @param {number} hover_delay How long the user must hover for the tooltip to show.
	 * @param {string} classes Space-separated string of classes to apply to the tooltip
	 */
	constructor($binder, text, hover_delay, classes)
	{
		this.hover_delay = hover_delay; // In seconds, how long hover must occur before this fires.

		this.$dom = $("<div></div>").addClass(classes).css('left', '-9999px').css('top', '0px').html(text).attr('regattr_tooltip', '1');
		//Go ahead and render it really far offscreen so we can get a width and height
		
		$binder.hover((e)=>{
			if(!this.timeout_id){
				this.timeout_id = window.setTimeout(()=>{
					this.timeout_id = null;
					this.show(e);
				}, this.hover_delay * 1000)
			}
		}, ()=>{
			if(this.timeout_id){
				window.clearTimeout(this.timeout_id);
				this.timeout_id = null;
			}
			this.hide();
		})

		$binder.on('click',()=>{ window.clearTimeout(this.timeout_id); });
		$binder.on('click',()=>{ this.hide() });
	}

	/**
	 * Add the preserved $dom to the $body of the page and position it such that it is always on screen.
	 * @param {MouseEvent} e The event object from $.hover()
	 */
	show(e)
	{
		$('body').append(this.$dom);
		var ww = window.innerWidth,
			wh = window.innerHeight,
			cx = e.clientX,
			cy = e.clientY,
			ctxt = 0, ctxl = 0;

		var ctmw = this.$dom.width(), ctmh = this.$dom.height();
		
		// Flip the side of the mouse to render the menu if it exceeds page dimensions
		ctxt = ((cx + ctmw) > ww) ? cx + 20 - ctmw : cx + 20;
		ctxl = ((cy + ctmh) > wh) ? cy + 20 - ctmh : cy + 20;
		
		this.$dom.css('left', ctxt + 'px').css('top', ctxl + 'px');
	}

	/**
	 * Remove the tooltip from $body while preserving the $dom
	 */
	hide()
	{
		this.$dom.remove();
	}
}

/**
 * Setup the sentry instance to track errors on this app.
 * @param {Boolean} dev_mode Whether this server is in dev mode
 */
function sentry_setup(dev_mode, sentry_url)
{
	//dev_mode = 0;
	if(!dev_mode)
	{
		console.log("Starting browser in non-development mode. Launching SentryIO")
		// Setup sentry io error tracking
		Sentry.init({ dsn: sentry_url });
	}
	else
	{
		console.log("Starting browser in development mode")
	}
}

/**
 * Initialize the assumed-to-be-loaded JQuery object to have some key characteristics, primarily concerning AJAX request handling.
 */
function jquery_setup(csrf_token)
{
	$.ajaxSetup({
		beforeSend: function(xhr, settings)
		{
			if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain)
			{
				xhr.setRequestHeader("X-CSRFToken", csrf_token)
				//console.log("Preflight");
				//console.log($('#csrf_token').val());
				//console.log($('#csrf_token'));
			}
		}
	});
	//If any ajax request returns an error, this is triggered.
	$(document).ajaxError(function(event, jqxhr, settings, thrownError)
	{
		console.log("===========XHR ERROR===========")
		console.log(jqxhr.status + ": " + jqxhr.responseText)
		console.log("===============================")
		if(jqxhr.status == 901){
			//TODO Change this to a onechoice overlay overlay.
			APP.luxedo.alert.activate('','Session has expired, please reload the page.','https://portal.myluxedo.com/workspace','REFRESH');
		}
	});

	$.ajaxSetup({
		timeout: 100*1000, //Make sure every JQUERY request times out after some time, hopefully p1reventing buildup if server gets bogged.
	});
}

/**
 * Bind some custom methods to the core console object
 */
function bindify_console()
{
	console.todo = function(msg)
	{
		console.log('%c//TODO: '+msg, 'color: #6a9955');
	}
}

/**
 * Bind some core methods to the javascript Number object.
 */
function bindify_number()
{
	//Define a clamp function. Why this isn't base javascript is beyond me.
	Number.prototype.clamp = function(min, max)
	{
		return Math.min(Math.max(this, min), max);
	};
}


/**
 * Create a new, random, very-likely-to-be-unique hash
 */
function generate_hash()
{
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < 25; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}


function validate_email(email)
{
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


/**
 * Open a file source url in a new tab and attempt to download it. Requires JQUERY.
 * @param {String} src_url URL to static source file
 * @param {String} file_name OPTIONAL: The suggested name.
 */
function download_file(src_url, file_name)
{
	var $dl = $("<a></a>")
		.attr('href', src_url)
		.attr('download', (file_name == undefined ? 'download_file' : file_name))
		.css('display', 'none')

	$('body').append($dl)
	$dl.get(0).click()
}


/**
 * Class containing only static methods for color utility.
 */
class ColorUtil
{
	/**
	 * Tries to convert a color name to rgb/a hex representation
	 * @param name
	 * @returns {string | CanvasGradient | CanvasPattern}
	 */
	static standardizeColor(name) {

		// Since invalid color's will be parsed as black, filter them out
		if (name.toLowerCase() === 'black') {
			return '#000';
		}

		const ctx = document.createElement('canvas').getContext('2d');
		ctx.fillStyle = name;
		return ctx.fillStyle === '#000' ? null : ctx.fillStyle;
	}

	/**
	 * Convert HSV spectrum to RGB.
	 * @param h Hue
	 * @param s Saturation
	 * @param v Value
	 * @returns {number[]} Array with rgb values.
	 */
	static hsvToRgb(h, s, v) {
		h = (h / 360) * 6;
		s /= 100;
		v /= 100;

		const i = floor(h);

		const f = h - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);

		const mod = i % 6;
		const r = [v, q, p, p, t, v][mod];
		const g = [t, v, v, q, p, p][mod];
		const b = [p, p, t, v, v, q][mod];

		return [
			r * 255,
			g * 255,
			b * 255
		];
	}

	/**
	 * Convert HSV spectrum to Hex.
	 * @param h Hue
	 * @param s Saturation
	 * @param v Value
	 * @returns {string[]} Hex values
	 */
	static hsvToHex(h, s, v) {
		return ColorUtil.hsvToRgb(h, s, v).map(v =>
			round(v).toString(16).padStart(2, '0')
		);
	}

	/**
	 * Convert HSV spectrum to CMYK.
	 * @param h Hue
	 * @param s Saturation
	 * @param v Value
	 * @returns {number[]} CMYK values
	 */
	static hsvToCmyk(h, s, v) {
		const rgb = ColorUtil.hsvToRgb(h, s, v);
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;

		const k = Math.min(1 - r, 1 - g, 1 - b);
		const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
		const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
		const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

		return [
			c * 100,
			m * 100,
			y * 100,
			k * 100
		];
	}

	/**
	 * Convert HSV spectrum to HSL.
	 * @param h Hue
	 * @param s Saturation
	 * @param v Value
	 * @returns {number[]} HSL values
	 */
	static hsvToHsl(h, s, v) {
		s /= 100;
		v /= 100;

		const l = (2 - s) * v / 2;

		if (l !== 0) {
			if (l === 1) {
				s = 0;
			} else if (l < 0.5) {
				s = s * v / (l * 2);
			} else {
				s = s * v / (2 - l * 2);
			}
		}

		return [
			h,
			s * 100,
			l * 100
		];
	}

	/**
	 * Convert RGB to HSV.
	 * @param r Red
	 * @param g Green
	 * @param b Blue
	 * @return {number[]} HSV values.
	 */
	static rgbToHsv(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;

		const minVal = Math.min(r, g, b);
		const maxVal = Math.max(r, g, b);
		const delta = maxVal - minVal;

		let h, s;
		const v = maxVal;
		if (delta === 0) {
			h = s = 0;
		} else {
			s = delta / maxVal;
			const dr = (((maxVal - r) / 6) + (delta / 2)) / delta;
			const dg = (((maxVal - g) / 6) + (delta / 2)) / delta;
			const db = (((maxVal - b) / 6) + (delta / 2)) / delta;

			if (r === maxVal) {
				h = db - dg;
			} else if (g === maxVal) {
				h = (1 / 3) + dr - db;
			} else if (b === maxVal) {
				h = (2 / 3) + dg - dr;
			}

			if (h < 0) {
				h += 1;
			} else if (h > 1) {
				h -= 1;
			}
		}

		return [
			h * 360,
			s * 100,
			v * 100
		];
	}

	/**
	 * Convert CMYK to HSV.
	 * @param c Cyan
	 * @param m Magenta
	 * @param y Yellow
	 * @param k Key (Black)
	 * @return {number[]} HSV values.
	 */
	static cmykToHsv(c, m, y, k) {
		c /= 100;
		m /= 100;
		y /= 100;
		k /= 100;

		const r = (1 - Math.min(1, c * (1 - k) + k)) * 255;
		const g = (1 - Math.min(1, m * (1 - k) + k)) * 255;
		const b = (1 - Math.min(1, y * (1 - k) + k)) * 255;

		return [...ColorUtil.rgbToHsv(r, g, b)];
	}

	/**
	 * Convert HSL to HSV.
	 * @param h Hue
	 * @param s Saturation
	 * @param l Lightness
	 * @return {number[]} HSV values.
	 */
	static hslToHsv(h, s, l) {
		s /= 100;
		l /= 100;
		s *= l < 0.5 ? l : 1 - l;

		const ns = (2 * s / (l + s)) * 100;
		const v = (l + s) * 100;
		return [h, isNaN(ns) ? 0 : ns, v];
	}

	/**
	 * Convert HEX to HSV.
	 * @param hex Hexadecimal string of rgb colors, can have length 3 or 6.
	 * @return {number[]} HSV values.
	 */
	static hexToHsv(hex) {
		return ColorUtil.rgbToHsv(...hex.match(/.{2}/g).map(v => parseInt(v, 16)));
	}

	/**
	 * Try's to parse a string which represents a color to a HSV array.
	 * Current supported types are cmyk, rgba, hsla and hexadecimal.
	 * @param str
	 * @return {*}
	 */
	static parseToHSVA(str) {

		// Check if string is a color-name
		str = str.match(/^[a-zA-Z]+$/) ? ColorUtil.standardizeColor(str) : str;

		// Regular expressions to match different types of color represention
		const regex = {
			cmyk: /^cmyk[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)/i,
			rgba: /^((rgba)|rgb)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i,
			hsla: /^((hsla)|hsl)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i,
			hsva: /^((hsva)|hsv)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i,
			hexa: /^#?(([\dA-Fa-f]{3,4})|([\dA-Fa-f]{6})|([\dA-Fa-f]{8}))$/i
		};

		/**
		 * Takes an Array of any type, convert strings which represents
		 * a number to a number an anything else to undefined.
		 * @param array
		 * @return {*}
		 */
		const numarize = array => array.map(v => /^(|\d+)\.\d+|\d+$/.test(v) ? Number(v) : undefined);

		let match;
		invalid: for (const type in regex) {

			// Check if current scheme passed
			if (!(match = regex[type].exec(str))) {
				continue;
			}

			// Match[2] does only contain a truly value if rgba, hsla, or hsla got matched
			const alphaValid = a => (!!match[2] === (typeof a === 'number'));

			// Try to convert
			switch (type) {
				case 'cmyk': {
					const [, c, m, y, k] = numarize(match);

					if (c > 100 || m > 100 || y > 100 || k > 100) {
						break invalid;
					}

					return {values: ColorUtil.cmykToHsv(c, m, y, k), type};
				}
				case 'rgba': {
					const [, , , r, g, b, a] = numarize(match);

					if (r > 255 || g > 255 || b > 255 || a < 0 || a > 1 || !alphaValid(a)) {
						break invalid;
					}

					return {values: [...ColorUtil.rgbToHsv(r, g, b), a], a, type};
				}
				case 'hexa': {
					let [, hex] = match;

					if (hex.length === 4 || hex.length === 3) {
						hex = hex.split('').map(v => v + v).join('');
					}

					const raw = hex.substring(0, 6);
					let a = hex.substring(6);

					// Convert 0 - 255 to 0 - 1 for opacity
					a = a ? (parseInt(a, 16) / 255) : undefined;

					return {values: [...ColorUtil.hexToHsv(raw), a], a, type};
				}
				case 'hsla': {
					const [, , , h, s, l, a] = numarize(match);

					if (h > 360 || s > 100 || l > 100 || a < 0 || a > 1 || !alphaValid(a)) {
						break invalid;
					}

					return {values: [...ColorUtil.hslToHsv(h, s, l), a], a, type};
				}
				case 'hsva': {
					const [, , , h, s, v, a] = numarize(match);

					if (h > 360 || s > 100 || v > 100 || a < 0 || a > 1 || !alphaValid(a)) {
						break invalid;
					}

					return {values: [h, s, v, a], a, type};
				}
			}
		}

		return {values: null, type: null};
	}
}

export {
	OverlayTooltip,
	jquery_setup,
	bindify_console,
	bindify_number,
	sentry_setup,
	generate_hash,
	download_file,
	validate_email,
	ColorUtil}
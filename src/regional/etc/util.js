// util.js
// Josh Reed 2020 2024
// 
// Some random little utilities.

import {b64_md5} from "../regional.js"

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

/**
 * Get a 'unique' checksum for the provided data using MD5.
 * 
 * Quirks:
 * 1. MD5 means that collisions are possible but extremely unlikley.
 * 2. This uses JSON.stringify() which has slightly different behavior than, for example, python's json.dumps().
 *    Thus this checksum method might not work cross-platform.
 * 
 * Speed:
 * I've not done extensive tests, but on my own machine in firefox it took 76ms to checksum a 30,000 record
 * datatable in dict form.
 * 
 * @param {Object} data serializable JSON data
 * 
 * @returns {String} A checksum 32 chars in length.
 */
function checksum_json(data)
{
	return b64_md5(JSON.stringify(data))
}

/**
 * Check whether this email is valid or not.
 * 
 * @param {string} email Any string, nominally representing an email.
 * @returns {Boolean} True if valid, false otherwise
 */
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
 * Find the locations of all 'substrings' within 'string'.
 * 
 * @param {string} substring The substring we are looking to match within string.
 * @param {string} string The main string we are searching through.
 * 
 * @returns {Array.<Number} List of indices at which we find matches. This will be the index of the first character of
 * 	match.
 */
function str_locations(substring, string){
	var a=[],i=-1;
	while((i=string.indexOf(substring,i+1)) >= 0) a.push(i);
	return a;
}

/**
 * Execute a series of promises serially. The first promise in the list will return before the next is
 * launched.
 * 
 * Now, promises execute immediately upon instantiation. This means that this function cannot simply be given
 * a list of *promises* - they'd already be executing. Instead, the argument is a list of functions that
 * **return** promises.
 * 
 * @param {Array.<Function>} promise_fns A list of functions that return promises
 * 
 * @returns {Promise} A wrapping promise that will resolve when all sub-promises have resolved.
 */
function serial_promises(promise_fns)
{
	if(promise_fns[0] instanceof Promise) throw new Error(
		"serial_promises() takes a list of functions that return promises, not a list of actual promises."
	)
	let out_list = []

	return new Promise((res, rej)=>
	{
		let fn = (index)=>
		{
			promise_fns[index]().then((out)=>
			{
				out_list.push(out)
				if((index + 1) < promise_fns.length)
				{
					fn(index + 1)
				}
				else
				{
					res(out_list)
				}
			})
		}
		fn(0)
	})
}

/**
 * Get the extension from a path, URL, or filename.
 * 
 * @param {String} fpath 
 * @returns {String} Extension, e.g. "ext" or undefined if none.
 */
function path_ext(fpath)
{
	let name = fpath.split("/").pop()
	if(name.indexOf(".") == -1) return undefined
	let ext = name.split(".").pop()
	return ext
}

const _throttle_memspace = {}

/**
 * This function will construct and return a 'throttled' version of the provided `fn`. Calls to this resulting
 * function will be passed through if it's been more than `min_delay` since the last call and ignored otherwise.
 * 
 * Note that this behavior results in applying the call to the 'leading' edge of the throttling event.
 * 
 * https://developer.mozilla.org/en-US/docs/Glossary/Throttle
 * 
 * @param {Number} min_delay_ms The minimum amount of time that must elapse between successive calls to fn
 * @param {Function} fn The function to be called
 * 
 * @returns {Function} A function to call that will be forward to 'fn' as long as enough time has elapsed.
 */
function throttle_leading(min_delay_ms, fn)
{
	const fnid = generate_hash()
	return (...args)=>
	{
		if(!_throttle_memspace.hasOwnProperty(fnid)) _throttle_memspace[fnid] = 0
		let elapsed_ms = Date.now() - _throttle_memspace[fnid]
		if(elapsed_ms > min_delay_ms)
		{
			fn(...args)
			_throttle_memspace[fnid] = Date.now()
		}
	}
}

/**
 * Linearly interpolate within the range from y1 to y2, given the location of x on the range from x1 to x2.
 * 
 * @param {Number} x1 
 * @param {Number} x2 
 * @param {Number} y1 
 * @param {Number} y2 
 * @param {Number} x Choice number
 */
function linterp(x1, x2, y1, y2, x)
{
	return y1 + (((x - x1)*(y2 - y1))/(x2-x1))
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
	bindify_console,
	bindify_number,
	sentry_setup,
	generate_hash,
	checksum_json,
	download_file,
	validate_email,
	str_locations,
	serial_promises,
	path_ext,
	throttle_leading,
	linterp,
	ColorUtil
}
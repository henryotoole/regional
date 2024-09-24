// src/regional/lib/md5.js
function blob_md5(blob) {
  return new Promise((res, rej) => {
    blob.arrayBuffer().then((bbytes) => {
      res(
        hex_md5(
          binl2rstr(
            binl_md5(bbytes)
          )
        )
      );
    });
  });
}
var hexcase = 0;
var b64pad = "";
function hex_md5(s) {
  return rstr2hex(rstr_md5(str2rstr_utf8(s)));
}
function b64_md5(s) {
  return rstr2b64(rstr_md5(str2rstr_utf8(s)));
}
function rstr_md5(s) {
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}
function rstr2hex(input) {
  try {
    hexcase;
  } catch (e) {
    hexcase = 0;
  }
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var output = "";
  var x;
  for (var i = 0; i < input.length; i++) {
    x = input.charCodeAt(i);
    output += hex_tab.charAt(x >>> 4 & 15) + hex_tab.charAt(x & 15);
  }
  return output;
}
function rstr2b64(input) {
  try {
    b64pad;
  } catch (e) {
    b64pad = "";
  }
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var output = "";
  var len = input.length;
  for (var i = 0; i < len; i += 3) {
    var triplet = input.charCodeAt(i) << 16 | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
    for (var j = 0; j < 4; j++) {
      if (i * 8 + j * 6 > input.length * 8) output += b64pad;
      else output += tab.charAt(triplet >>> 6 * (3 - j) & 63);
    }
  }
  return output;
}
function str2rstr_utf8(input) {
  var output = "";
  var i = -1;
  var x, y;
  while (++i < input.length) {
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if (55296 <= x && x <= 56319 && 56320 <= y && y <= 57343) {
      x = 65536 + ((x & 1023) << 10) + (y & 1023);
      i++;
    }
    if (x <= 127)
      output += String.fromCharCode(x);
    else if (x <= 2047)
      output += String.fromCharCode(
        192 | x >>> 6 & 31,
        128 | x & 63
      );
    else if (x <= 65535)
      output += String.fromCharCode(
        224 | x >>> 12 & 15,
        128 | x >>> 6 & 63,
        128 | x & 63
      );
    else if (x <= 2097151)
      output += String.fromCharCode(
        240 | x >>> 18 & 7,
        128 | x >>> 12 & 63,
        128 | x >>> 6 & 63,
        128 | x & 63
      );
  }
  return output;
}
function rstr2binl(input) {
  var output = Array(input.length >> 2);
  for (var i = 0; i < output.length; i++)
    output[i] = 0;
  for (var i = 0; i < input.length * 8; i += 8)
    output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << i % 32;
  return output;
}
function binl2rstr(input) {
  var output = "";
  for (var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode(input[i >> 5] >>> i % 32 & 255);
  return output;
}
function binl_md5(x, len) {
  x[len >> 5] |= 128 << len % 32;
  x[(len + 64 >>> 9 << 4) + 14] = len;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;
  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}
function md5_cmn(q, a, b, x, s, t) {
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
}
function md5_ff(a, b, c, d, x, s, t) {
  return md5_cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t) {
  return md5_cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t) {
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t) {
  return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
}
function safe_add(x, y) {
  var lsw = (x & 65535) + (y & 65535);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bit_rol(num2, cnt) {
  return num2 << cnt | num2 >>> 32 - cnt;
}

// src/regional/etc/util.js
function sentry_setup(dev_mode, sentry_url) {
  if (!dev_mode) {
    console.log("Starting browser in non-development mode. Launching SentryIO");
    Sentry.init({ dsn: sentry_url });
  } else {
    console.log("Starting browser in development mode");
  }
}
function bindify_console() {
  console.todo = function(msg) {
    console.log("%c//TODO: " + msg, "color: #6a9955");
  };
}
function bindify_number() {
  Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
  };
}
function generate_hash() {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 25; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function checksum_json(data2) {
  return b64_md5(JSON.stringify(data2));
}
function validate_email(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
function download_file(src_url, file_name) {
  var $dl = $("<a></a>").attr("href", src_url).attr("download", file_name == void 0 ? "download_file" : file_name).css("display", "none");
  $("body").append($dl);
  $dl.get(0).click();
}
function str_locations(substring, string) {
  var a = [], i = -1;
  while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i);
  return a;
}
function serial_promises(promise_fns) {
  if (promise_fns[0] instanceof Promise) throw new Error(
    "serial_promises() takes a list of functions that return promises, not a list of actual promises."
  );
  let out_list = [];
  return new Promise((res, rej) => {
    let fn = (index) => {
      promise_fns[index]().then((out) => {
        out_list.push(out);
        if (index + 1 < promise_fns.length) {
          fn(index + 1);
        } else {
          res(out_list);
        }
      });
    };
    fn(0);
  });
}
function path_ext(fpath) {
  let name = fpath.split("/").pop();
  if (name.indexOf(".") == -1) return void 0;
  let ext = name.split(".").pop();
  return ext;
}
var _throttle_memspace = {};
function throttle_leading(min_delay_ms, fn) {
  const fnid = generate_hash();
  return (...args) => {
    if (!_throttle_memspace.hasOwnProperty(fnid)) _throttle_memspace[fnid] = 0;
    let elapsed_ms = Date.now() - _throttle_memspace[fnid];
    if (elapsed_ms > min_delay_ms) {
      fn(...args);
      _throttle_memspace[fnid] = Date.now();
    }
  };
}
function linterp(x1, x2, y1, y2, x) {
  return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
}
var ColorUtil = class _ColorUtil {
  /**
   * Tries to convert a color name to rgb/a hex representation
   * @param name
   * @returns {string | CanvasGradient | CanvasPattern}
   */
  static standardizeColor(name) {
    if (name.toLowerCase() === "black") {
      return "#000";
    }
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = name;
    return ctx.fillStyle === "#000" ? null : ctx.fillStyle;
  }
  /**
   * Convert HSV spectrum to RGB.
   * @param h Hue
   * @param s Saturation
   * @param v Value
   * @returns {number[]} Array with rgb values.
   */
  static hsvToRgb(h, s, v) {
    h = h / 360 * 6;
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
    return _ColorUtil.hsvToRgb(h, s, v).map(
      (v2) => round(v2).toString(16).padStart(2, "0")
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
    const rgb = _ColorUtil.hsvToRgb(h, s, v);
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
      const dr = ((maxVal - r) / 6 + delta / 2) / delta;
      const dg = ((maxVal - g) / 6 + delta / 2) / delta;
      const db = ((maxVal - b) / 6 + delta / 2) / delta;
      if (r === maxVal) {
        h = db - dg;
      } else if (g === maxVal) {
        h = 1 / 3 + dr - db;
      } else if (b === maxVal) {
        h = 2 / 3 + dg - dr;
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
    return [..._ColorUtil.rgbToHsv(r, g, b)];
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
    const ns = 2 * s / (l + s) * 100;
    const v = (l + s) * 100;
    return [h, isNaN(ns) ? 0 : ns, v];
  }
  /**
   * Convert HEX to HSV.
   * @param hex Hexadecimal string of rgb colors, can have length 3 or 6.
   * @return {number[]} HSV values.
   */
  static hexToHsv(hex) {
    return _ColorUtil.rgbToHsv(...hex.match(/.{2}/g).map((v) => parseInt(v, 16)));
  }
  /**
   * Try's to parse a string which represents a color to a HSV array.
   * Current supported types are cmyk, rgba, hsla and hexadecimal.
   * @param str
   * @return {*}
   */
  static parseToHSVA(str) {
    str = str.match(/^[a-zA-Z]+$/) ? _ColorUtil.standardizeColor(str) : str;
    const regex = {
      cmyk: /^cmyk[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)/i,
      rgba: /^((rgba)|rgb)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i,
      hsla: /^((hsla)|hsl)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i,
      hsva: /^((hsva)|hsv)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i,
      hexa: /^#?(([\dA-Fa-f]{3,4})|([\dA-Fa-f]{6})|([\dA-Fa-f]{8}))$/i
    };
    const numarize = (array) => array.map((v) => /^(|\d+)\.\d+|\d+$/.test(v) ? Number(v) : void 0);
    let match;
    invalid: for (const type in regex) {
      if (!(match = regex[type].exec(str))) {
        continue;
      }
      const alphaValid = (a) => !!match[2] === (typeof a === "number");
      switch (type) {
        case "cmyk": {
          const [, c, m, y, k] = numarize(match);
          if (c > 100 || m > 100 || y > 100 || k > 100) {
            break invalid;
          }
          return { values: _ColorUtil.cmykToHsv(c, m, y, k), type };
        }
        case "rgba": {
          const [, , , r, g, b, a] = numarize(match);
          if (r > 255 || g > 255 || b > 255 || a < 0 || a > 1 || !alphaValid(a)) {
            break invalid;
          }
          return { values: [..._ColorUtil.rgbToHsv(r, g, b), a], a, type };
        }
        case "hexa": {
          let [, hex] = match;
          if (hex.length === 4 || hex.length === 3) {
            hex = hex.split("").map((v) => v + v).join("");
          }
          const raw = hex.substring(0, 6);
          let a = hex.substring(6);
          a = a ? parseInt(a, 16) / 255 : void 0;
          return { values: [..._ColorUtil.hexToHsv(raw), a], a, type };
        }
        case "hsla": {
          const [, , , h, s, l, a] = numarize(match);
          if (h > 360 || s > 100 || l > 100 || a < 0 || a > 1 || !alphaValid(a)) {
            break invalid;
          }
          return { values: [..._ColorUtil.hslToHsv(h, s, l), a], a, type };
        }
        case "hsva": {
          const [, , , h, s, v, a] = numarize(match);
          if (h > 360 || s > 100 || v > 100 || a < 0 || a > 1 || !alphaValid(a)) {
            break invalid;
          }
          return { values: [h, s, v, a], a, type };
        }
      }
    }
    return { values: null, type: null };
  }
};

// src/regional/etc/css.js
function css_selector_exists(rule_or_selector) {
  let selector = rule_or_selector;
  if (rule_or_selector.indexOf("{") != -1) {
    selector = rule_or_selector.substring(0, rule_or_selector.indexOf("{")).trim();
    selector.trim();
  }
  let pool = [
    document.styleSheets,
    document.adoptedStyleSheets
  ];
  for (let i_pool = 0; i_pool < pool.length; i_pool++) {
    let stylesheets = pool[i_pool];
    for (let i_sheet = 0; i_sheet < stylesheets.length; i_sheet++) {
      let stylesheet = stylesheets[i_sheet];
      for (let i_rule = 0; i_rule < stylesheet.cssRules.length; i_rule++) {
        let rule = stylesheet.cssRules[i_rule];
        if (rule.selectorText == selector) {
          return true;
        }
      }
    }
  }
  return false;
}
function css_inject(rule) {
  let regss;
  document.adoptedStyleSheets.forEach((ss) => {
    if (ss._regcss_name == "regcss") regss = ss;
  });
  if (!regss) {
    regss = new CSSStyleSheet();
    regss._regcss_name = "regcss";
    document.adoptedStyleSheets.push(regss);
  }
  regss.insertRule(rule, regss.cssRules.length);
}
function css_format_as_rule(selector, style_data, nested) {
  let style_line = selector + " {";
  for (const [propname, propval] of Object.entries(style_data)) {
    style_line += propname + ": " + propval + ";";
  }
  if (nested) {
    for (const [nested_selector, nested_style_obj] of Object.entries(nested)) {
      style_line += "& " + nested_selector + " {";
      for (const [nested_propname, nested_propval] of Object.entries(nested_style_obj)) {
        style_line += nested_propname + ": " + nested_propval + ";";
      }
      style_line += "}";
    }
  }
  style_line += "}";
  return style_line;
}

// src/regional/etc/clipboard.js
var Clipboard = class {
  /**
   * Setup the app-wide clipboard and selection. Only components can be copied to the clipboard.
   */
  constructor(app) {
    this.control_types = {
      "keystroke": { id: "keystroke" },
      "rightclick": { id: "rightclick" },
      "button": { id: "button" }
    };
    this.copydata = {
      control_type: void 0,
      // The specific control method used to copy the attached object
      components: []
      // This is where the component copy list will actually reside.
    };
    this.selection = {
      components: [],
      // The components currently selected (not copies, instances)
      callback: () => {
      }
      // Called when a selection is performed
    };
    this.selection_locked = 0;
    this.app = app;
  }
  /**
   * Copy the current selection to the clipboard.
   * @param {Event} e The event from click or keypress
   * @param {Object} control_type The app.clipboard.control_type for this copy operation.
   */
  copy(e, control_type) {
    console.log("Copying " + this.selection.components + " to clipboard.");
    this.clear();
    for (var x = 0; x < this.selection.components.length; x++) {
      this.copydata.components.push(this.selection.components[x].get_copy());
    }
    this.copydata.control_type = control_type;
  }
  /**
   * Paste whatever is on the clipboard as best possible. This is handled centrally (in the app.clipboard) to account
   * for all the different originations of this event.
   * @param {Event} e The event from click or keypress
   * @param {Object} control_type The app.clipboard.control_type for this copy operation.
   */
  paste(e, control_type) {
    var target_region = this.app.focus_region_get();
    if (control_type.id == this.control_types.keystroke.id) {
    } else if (control_type.id == this.control_types.rightclick.id) {
    } else {
      return;
    }
    console.log("Pasting " + this.copydata.components.length + " objects into region " + target_region.id);
    for (var x = 0; x < this.copydata.components.length; x++) {
      target_region.paste_component(e, this.copydata.components[x]);
    }
  }
  /**
   * Clear the clipboard of any attached data.
   */
  clear() {
    this.copydata.control_type = void 0;
    this.copydata.components = [];
  }
  /**
   * Select a component or list of components, app wide. This is the primary function for this action.
   * @param {*} components Component or list of components
   */
  select(components) {
    if (!(components instanceof Array)) components = [components];
    if (this.selection_locked) {
      console.log("Cannot select right now -- selection is locked.");
      return;
    }
    console.log("Selecting: ");
    console.log(components);
    this.selection.components = components;
    for (var x = 0; x < this.selection.components.length; x++) {
      this.selection.components[x].on_select();
    }
    this.selection.callback(this.selection.components);
    this.app.render();
  }
  deselect() {
    if (this.selection_locked) {
      console.log("Cannot deselect right now -- selection is locked.");
      return;
    }
    if (this.has_selected()) {
      for (var x = 0; x < this.selection.components.length; x++) {
        this.selection.components[x].on_deselect();
      }
      this.selection.components = [];
      this.app.render();
    }
  }
  /**
   * Return true if anything is currently selected.
   */
  has_selected() {
    return this.selection.components.length > 0;
  }
  /**
   * Return true if the first AND only selected object is instanceof one of the provided component
   * class defs.
   * @param {Array} ClassDefs A list of ClassDefs
   */
  has_selected_of_type(ClassDefs) {
    if (this.selection.components.length == 1) {
      return ClassDefs.some((CD) => {
        return this.selection.components[0] instanceof CD;
      });
    }
    return 0;
  }
  /**
   * Return true if anything is currently copied on clipboard.
   */
  has_copied() {
    return this.copydata.components.length > 0;
  }
  /**
   * Return True if all comps on the clipboard are of the ClassDef's provided in defs
   * @param {Array} defs A list of ClassDef's
   */
  has_copied_of_type(defs) {
    if (this.copydata.components.length == 0) return 0;
    var components = this.copydata.components;
    for (var x = 0; x < components.length; x++) {
      var flag = 0;
      for (var y = 0; y < defs.length; y++) {
        if (components[x] instanceof defs[y]) {
          flag = 1;
        }
      }
      if (flag == 0) {
        return 0;
      }
    }
    return 1;
  }
  /**
   * Return 1 if the provided component is selected, 0 otherwise.
   * @param {Component} component 
   */
  is_selected(component) {
    for (var x = 0; x < this.selection.components.length; x++) {
      if (this.selection.components[x].type == component.type && this.selection.components[x].data.id == component.data.id) {
        return 1;
      }
    }
    return 0;
  }
  /**
   * Return a list of current selected components.
   */
  get_selected() {
    return this.selection.components;
  }
  /**
   * Lock the selection such that it cannot be unselected and no other selections can be made
   */
  selection_lock() {
    this.selection_locked = 1;
  }
  /**
   * Unlock the selection such that it operates like normal.
   */
  selection_unlock() {
    this.selection_locked = 0;
  }
  /**
   * Register a callback to be called on selection. There can only be one of these at a time, so binding a selection function
   * will automatically clear the last selection function.
   * @param {Function} fn The function to be called on select. Args: (components)
   */
  selection_bind(fn) {
    this.selection.callback = fn;
  }
  /**
   * Clear whatever selection callback was bound.
   */
  selection_bind_clear() {
    this.selection.callback = () => {
    };
  }
  /**
   * Call the delete() function on every selected component
   */
  selection_delete() {
    for (var x = 0; x < this.selection.components.length; x++) {
      this.selection.components[x].delete();
    }
  }
};

// src/regional/etc/rhtml_el.js
var RHElement = class _RHElement extends HTMLElement {
  // Typehint declarations.
  /** @description Add a custom place to put data, tied to only one key to prevent collisions. */
  _reg_ds = {
    /** @description This remembers what display was set to before hide() was called */
    sh_display,
    /** @description Whether or not the 'hide()' behavior is currently active */
    sh_is_hidden
  };
  /**
   * Wrap the provided element, returning a new instance of RHElement. This is the only way, currently,
   * to instantiate a new RHElement.
   * 
   * @param {HTMLElement} el Element to wrap
   * 
   * @returns {RHElement} The same element, but wrapped to have RHElement functionality.
   */
  static wrap(el) {
    if (el._reg_ds) return el;
    el._reg_ds = {
      sh_is_hidden: false,
      sh_display: void 0
    };
    el.hide = _RHElement.prototype.hide.bind(el);
    el.show = _RHElement.prototype.show.bind(el);
    el.empty = _RHElement.prototype.empty.bind(el);
    el.text = _RHElement.prototype.text.bind(el);
    el.dims_outer = _RHElement.prototype.dims_outer.bind(el);
    el.class_set = _RHElement.prototype.class_set.bind(el);
    return el;
  }
  /**
   * Hide this element by applying 'display: none' to the style. The original style display, if it existed,
   * will be remembered unless it was already 'none'. If it was already 'none', that is ignored and it will
   * be assumed that control of display is handled entirely by js logic.
   */
  hide() {
    if (this._reg_ds.sh_is_hidden) return;
    this._reg_ds.sh_is_hidden = true;
    this._reg_ds.sh_display = this.style.display;
    this.style.display = "none";
    if (this._reg_ds.sh_display == "none") this._reg_ds.sh_display = "";
  }
  /**
   * Show an element that was previously hidden. This achieves this by removing display: none from
   * the style and replacing it with whatever display was set to before (including nothing)
   */
  show() {
    if (!this._reg_ds.sh_is_hidden) return;
    if (this._reg_ds.sh_display == "none") {
      this._reg_ds.sh_display = "";
    }
    this._reg_ds.sh_is_hidden = false;
    this.style.display = this._reg_ds.sh_display;
    this._reg_ds.sh_display = void 0;
  }
  /**
   * Remove all child elements of this element.
   */
  empty() {
    while (this.firstChild) {
      this.removeChild(this.lastChild);
    }
  }
  /**
   * A quick method to add or remove a class on the basis of a boolean value.
   * 
   * This is merely shorthand for this.classList.toggle(class_name, true)
   * 
   * @param {String} class_name The name of a class
   * @param {Boolean} do_set True to set this class, False to remove
   */
  class_set(class_name, do_set) {
    this.classList.toggle(class_name, do_set);
  }
  /**
   * Shorthand to set the text of this element. Achieved by setting this.textContent to provided string
   * 
   * @param {String} str text to set.
   */
  text(str) {
    this.textContent = str;
  }
  /**
   * Get the dimensions of this element in pixels, including margin, borders, padding, and inner content.
   * 
   * This will NOT work if strange things have been applied to the element, such as `transform: scale()`
   * 
   * @returns {Object.<String, int>} {x: x_px, y: y_px}
   */
  dims_outer() {
    let computed_style = window.getComputedStyle(this);
    let mt = parseInt(computed_style.marginTop, 10), mb = parseInt(computed_style.marginBottom, 10), ml = parseInt(computed_style.marginLeft, 10), mr = parseInt(computed_style.marginRight, 10);
    return {
      x: this.offsetWidth + ml + mr,
      y: this.offsetHeight + mt + mb
    };
  }
};

// src/regional/etc/fab.js
var Fabricator = class {
  /**
   * Instantiate a new Fabricator instance with the provided HTML.
   * 
   * ### Lifecycle ###
   * 1. A fabricator is first instantiated with one and only one HTML string.
   * 2. A fabricator can then have various sets of CSS associated with it.
   * 3. Then fabricator.fabricate() is called, which actually dumps the css to the document and fabricates
   *    the DOM. After this, the fabricator is immutable.
   * 4. Helper functions like get_members or get_root_element can be called. They'll all reference the
   *    immutable document object, as well as some internal class variables.
   * 
   * ### Expressions ###
   * An expression is simply a way to indicate to the Fabricator an intended substitution. HTML resembling
   * `<div id="main_text_col"> {{ main_text }} </div>` will have {{ main_text }} replaced with the value
   * of `expressions["main_text"]` before parsing. If `expressions["main_text"] = "A spectre is haunting Europe"`
   * then the resulting HTML will be `<div id="main_text_col"> A spectre is haunting Europe </div>`
   * 
   * If no matching entry exists in expressions, then the expression will simply be removed from the result.
   * 
   * ### Members ###
   * In adherence with the 'rfm_member' attribute being used to signify a member element in DOM-html, the
   * Fabricator will intelligently check for this tag and assign 
   * 
   * @param {str} html_str The HTML which shall be dynamically parsed.
   * @param {Object.<str, *>} [expressions] An optional object that maps string keys to expression values.
   */
  constructor(html_str, expressions) {
    if (!expressions) expressions = {};
    this.html_str = this._preprocess_expressions(html_str, expressions);
    this._members = {};
    this._immutable = false;
    this._css_rules = [];
  }
  /**
   * Add a CSS rule to this fabricator. When fabricate() fires, all css rules will be added
   * to the document and made available. Collision checks are performed, so if this is called
   * multiple times for the same (or an existing) selector, no action will be taken.
   * 
   * This function can NOT be used to change an existing CSS rule.
   * 
   * @param {string} rule A css rule. Must contain only one selector and style block.
   * 
   * @returns {Fabricator} self for chaining
   */
  add_css_rule(rule) {
    if (this._immutable) throw "Fabricator is immutable and can no longer be modified.";
    this._css_rules.push(rule);
    return this;
  }
  /**
   * Get a mapping of member names to member elements.
   * 
   * @returns {Object.<str, RHElement>} The member mapping.
   */
  get_members() {
    if (!this._immutable) throw "Cannot call until after fabricate()";
    return this._members;
  }
  /**
   * Get a member by name. This is a convenience function that just does a key lookup in the member dict.
   * 
   * @param {String} member_name The member name to get
   * 
   * @returns {RHElement} The chosen member or undefined if none
   */
  get_member(member_name) {
    if (!this._immutable) throw "Cannot call until after fabricate()";
    return this._members[member_name];
  }
  /**
   * Append all fabricated elements to the provided one.
   * 
   * @param {HTMLElement} el The element (presumably from the real document) to append our fabrication to
   */
  append_to(el) {
    for (let i = this._dom.body.children.length - 1; i >= 0; i--) {
      el.prepend(this._dom.body.children[i]);
    }
  }
  /**
   * This takes the HTML and CSS instructions provided so far to this instance and:
   * 1. Generates the DOM
   * 2. Appends CSS to the document
   * 
   * After this function is called, the Fabricator should be considered immutable and further calls to
   * non-get_ functions will raise an error.
   * 
   * @returns {Fabricator} self for chaining
   */
  fabricate() {
    if (this._immutable) throw "Fabricator is immutable and can no longer be modified.";
    this._immutable = true;
    this._dom = this._parse_html(this.html_str);
    this._css_inject();
    this._members_discover();
    return this;
  }
  /**
   * @private
   * Perform the expression sub-in behavior. 
   * 
   * An expression is simply a way to indicate to the Fabricator an intended substitution. HTML resembling
   * `<div id="main_text_col"> {{ main_text }} </div>` will have {{ main_text }} replaced with the value
   * of `expressions["main_text"]` before parsing. If `expressions["main_text"] = "A spectre is haunting Europe"`
   * then the resulting HTML will be `<div id="main_text_col"> A spectre is haunting Europe </div>`
   * 
   * ERRORS:
   * 1. Brackets are not nested.
   * 2. All brackets close properly.
   * 
   * @param {string} html_str The HTML which shall be dynamically parsed.
   * @param {Object.<string, *>} expressions An object that maps string keys to expression values.
   * 
   * @returns {string} the resulting string with all expressions subbed-in or removed.
   */
  _preprocess_expressions(html_str, expressions) {
    let open_locs = str_locations("{{", html_str);
    let close_locs = str_locations("}}", html_str);
    let html_str_out = "";
    if (open_locs.length != close_locs.length) throw new FabricatorError(
      "Open expression count does not match close expression count. Can not parse expressions.",
      this
    );
    if (open_locs.length == 0 && close_locs.length == 0) return html_str;
    let html_i_last_end = 0;
    open_locs.forEach((html_i_open, loc_i) => {
      let html_i_close = close_locs[loc_i];
      if (html_i_close <= html_i_open) throw new FabricatorError(
        "Expression close and open mismatch! Can not parse expressions.",
        this
      );
      if (loc_i + 1 < open_locs.length) {
        if (open_locs[loc_i + 1] <= html_i_close) throw new FabricatorError(
          "Nested expressions are not allowed. Can not parse expressions.",
          this
        );
      }
      let expression_str = html_str.substring(html_i_open + 2, html_i_close).trim();
      let exp_value = expression_str in expressions ? expressions[expression_str] : "";
      html_str_out += html_str.substring(html_i_last_end, html_i_open);
      html_str_out += exp_value;
      if (loc_i + 1 == open_locs.length) {
        html_str_out += html_str.substring(html_i_close + 2);
      }
      html_i_last_end = html_i_close + 2;
    });
    return html_str_out;
  }
  /**
   * @protected
   * Inject all stored instructional information about CSS into the document.
   */
  _css_inject() {
    this._css_rules.forEach((css_rule) => {
      if (!css_selector_exists(css_rule)) {
        css_inject(css_rule);
      }
    });
  }
  /**
   * @private
   * Parse a plain HTML string into proper DOM elements. This function leverages the built-in DOMParser
   * to create a full document.
   * 
   * @param {string} html_str A pure html string. Expressions should have been removed.
   * 
   * @returns {Document}
   */
  _parse_html(html_str) {
    return new DOMParser().parseFromString(html_str, "text/html");
  }
  /**
   * @private
   * Investigate this.dom to discover all 'rfm_members' within. This will populate this._members.
   */
  _members_discover() {
    let traverse = (el) => {
      for (const child of el.children) {
        if (child.hasAttribute("rfm_member")) {
          this._members[child.getAttribute("rfm_member")] = RHElement.wrap(child);
        }
        traverse(child);
      }
    };
    traverse(this._dom.body);
  }
};

// src/regional/etc/errors.js
var RegionalStructureError = class extends Error {
  constructor(message, options) {
    super(message, options);
  }
};
var FabricatorError = class extends Error {
  /**
   * Create a new fabricator error.
   * @param {string} message Message to print
   * @param {Fabricator} fab The fabricator that tripped this issue.
   */
  constructor(message, fab) {
    super(message, {});
    this.fab = fab;
  }
};
var TODOError2 = class extends Error {
  constructor(message, options) {
    super(message, options);
  }
};

// src/regional/components/comp.js
var Component = class {
  /** @type {*} The ID for the record this component models. */
  id;
  /** @type {DHTabular} The datahandler from which this component originated */
  datahandler;
  /**
   * Create a new component. This should generally only be called from within a datahandler class.
   * 
   * @param {*} id The unique ID by which we can reference the record in the datahandler
   * @param {DHTabular} dh The Tabular DataHandler that originated this component instance.
   */
  constructor(id2, dh) {
    this.id = id2;
    this.datahandler = dh;
  }
  /**
   * The data reference links straight into the DataHandler's component space for this data.
   * 
   * ```
   * comp_instance.data.key = "val"
   * ```
   * is equivalent to
   * 
   * ```
   * datahandler_instance._data[id].key = "val"
   * ```
   * 
   * @returns {Object} A reference to a unique memory space for this object where its data may be found.
   */
  get data() {
    let data2 = this.datahandler.data_get_ref(this.id);
    if (data2 == void 0) throw new Error(
      `${this.constructor.name} is stale: record no longer exists in ${this.datahandler.constructor.name} for ID: '${this.id}'.`
    );
    return data2;
  }
  /**
   * The settings reference is unique to this record ID, but shared across all record ID's.
   */
  get settings() {
    let settings = this.datahandler.settings_get_ref(this.id);
    if (settings == void 0) throw new Error(
      `${this.constructor.name} is stale: record no longer exists in ${this.datahandler.constructor.name} for ID: '${this.id}'.`
    );
    return settings;
  }
  set data(v) {
    throw new Error("Can not overwrite datalink.");
  }
  set settings(v) {
    throw new Error("Can not overwrite datalink.");
  }
  /**
   * Check if this component equals another component. If they are of the same ClassDef and same ID, they are
   * equal.
   * @param {Component} component another component instance
   */
  equals(component) {
    return component instanceof this.constructor && this.id == component.id;
  }
};

// src/regional/datahandlers/dh.js
var DataHandler = class {
  /** @type {Object} This is where all local data for this DataHandler is stored. */
  _data;
  /**
   * Create a new datahandler instance. At the base level, this merely sets up an empty data variable.
   */
  constructor() {
    this._data = {};
  }
  /**
   * @abstract
   * Retrieve all 'tracked' data from the server that has not yet already been pulled down. Depending on
   * implementation, this might simply be all of the data that exists. A REST implementation may choose to track
   * certain ID's and only retrieve certain rows. However it happens, pull() should all desired data that the
   * datahandler has so far been configured to want available locally.
   * 
   * @returns {Promise} A promise that will resolve when the data pull is complete
   */
  async pull() {
  }
  /**
   * @abstract
   * Update the server to match this local client. Implementations will vary. All data can be sent to server,
   * or only the subset that has changed (for efficiency). As a result of calling this, the server data should
   * match that of the local client for all data in this datahandler.
   * 
   * @returns {Promise} A promise that will resolve when the data push is complete
   */
  async push() {
  }
  /**
   * @abstract
   * Get a unique string / name of some sort that signifies this datahandler. This is used for situations
   * where a list of DH's needs to be keyed and accessed uniquely. Must be implemented in child.
   * 
   * @returns {String} Unique string for this TYPE of datahandler.
   */
  get name() {
  }
  /**
   * Get the current data-state checksum for this datahandler. This method may be overridden by a child
   * to take advantage of checksum caching.
   * 
   * @returns {String} 32 char checksum.
   */
  get checksum() {
    return this.generate_checksum();
  }
  /**
   * @abstract
   * Generate a new, unique checksum that reflects the current state of this DataHandler.
   * 
   * @returns {String} 32 char checksum.
   */
  generate_checksum() {
  }
  /**
   * Call pull() on multiple datahandlers in parallel. 
   * 
   * @param {Array} dh_list A list of datahandlers
   * 
   * @returns {Promise} A promise that will resolve with no arguments when all data is pulled down.
   */
  static data_refresh_multiple(dh_list) {
    return new Promise((res, rej) => {
      var all_promises = [];
      dh_list.forEach((dh) => {
        all_promises.push(dh.pull());
      });
      Promise.all(all_promises).then(() => {
        res();
      });
    });
  }
};

// src/regional/datahandlers/dh_tabular.js
var DHTabular = class extends DataHandler {
  /** @type {Object} A place for local 'settings' to tie to a record */
  _settings;
  /**
   * Create a new datahandler instance. At the base level, this merely sets up an empty data variable.
   */
  constructor() {
    super();
    this._settings = {};
  }
  /**
   * Update a record for an ID. If the record does not exist, it will be created. Existing records will
   * have all values from 'data' assigned over on a per-key basis. This means that existing data keys
   * for an existing record that are NOT present in the supplied data will NOT be removed.
   * 
   * @param {*} id The ID of the record to delete.
   * @param {Object} data The data to set for this record.
   */
  data_update_record(id2, data2) {
    if (this._data[id2] == void 0) this._data[id2] = {};
    if (this._settings[id2] == void 0) this._settings[id2] = {};
    Object.assign(this._data[id2], data2);
  }
  /**
   * Get information for a specific record. The returned object is a reference. Modifying it will modify
   * record data.
   * 
   * @param {*} id The ID of the record
   * 
   * @returns {Object} Data for this record or undefined if no such ID exists
   */
  data_get_ref(id2) {
    return this._data[id2];
  }
  /**
   * Delete all data and settings for the provided record ID.
   * 
   * @param {*} id The ID of the record to delete
   */
  data_delete_record(id2) {
    delete this._data[id2];
    delete this._settings[id2];
  }
  /**
   * @returns {Array} A list of currently known ID's.
   */
  get_all_ids() {
    return Object.keys(this._data);
  }
  /**
   * Perform a basic operation similar to SQL's WHERE clause. For now, this only performs equality-matching.
   * 
   * The filter_data object should resemble:
   * 
   * ```
   * {
   *      'col_name': MATCHING_COL_VALUE,
   *      'col2_name': MATCHING_COL2_VALUE,
   *      ...
   * }
   * ```
   * 
   * All known records that have `col_name` value equal to `MATCHING_COL_VALUE` and col2 etc. will be returned.
   * 
   * @param {Object} filter_data Object with data column names to values
   * 
   * @returns {Object} id-mapped data for each matching tabular record. This is NOT dereferenced.
   */
  where(filter_data) {
    let out = {};
    Object.entries(this._data).forEach(([id2, data2]) => {
      let all_match = true;
      Object.entries(filter_data).forEach(([k, v]) => {
        if (data2[k] != v) all_match = false;
      });
      if (all_match) {
        out[id2] = data2;
      }
    });
    return out;
  }
  /**
   * Get reference to settings space for the provided ID.
   * 
   * @param {*} id The ID of the record
   * 
   * @returns {Object} Settings for this record or undefined if no such ID exists
   */
  settings_get_ref(id2) {
    return this._settings[id2];
  }
  /**
   * TODO Checksum Caching
   * This will be neccessary for the future. I'm not setting it up just yet because too much is on my stack
   * already.
   * 1. Add a Proxy for _data and _settings so that generic set operations cause checksum update.
   * 2. Add a sort of context manager for temporarily disabling autoregen during mass operations.
   * 3. Cause that context manager to be used during push() and pull()
   */
  /**
   * The checksum for a tabular datahandler is composed of both data and settings.
   */
  generate_checksum() {
    return checksum_json([this._data, this._settings]);
  }
  /**
   * @abstract
   * Get a component instance of the relevant type for this DataHandler. Component instances are really
   * just containers for code that store both their settings and data back here in the datahandler. Multiple
   * instances of a Component for the same ID will refer to the exact same locations in memory.
   * 
   * This may be called any number of times in any number of places, and all instances of a component for a
   * certain ID will behave as if they are, in fact, the same component.
   * 
   * @param {*} id The ID to get a component for.
   * 
   * @returns {Component}
   */
  comp_get(id2) {
  }
};

// src/regional/datahandlers/dh_rest.js
var PUSH_CONFLICT_RESOLUTIONS = {
  /** This will resolve push conflicts by raising an exception and placing the burden on the developer. */
  WITH_EXCEPTION: Symbol("WITH_EXCEPTION"),
  /** This will resolve push conflicts by presuming that the server accepted changes, but did not report so. */
  KEEP_CHANGES: Symbol("KEEP_CHANGES"),
  /** This will resolve push conflicts by presuming that the server rejected changes, but did not report so. */
  DISCARD_CHANGES: Symbol("DISCARD_CHANGES")
};
var JSON_HEADERS = {
  "Accept": "application/json",
  "Content-Type": "application/json"
};
var ErrorREST = class extends Error {
  /**
   * Construct an error to raise when a REST operation fails. This will just auto-format the error message
   * and add specified fields to the error for upstream reading.
   * 
   * @param {String} operation An informal, plain english string describing what we were attempting
   * @param {String} method The HTTP method verb that was used e.g. GET or PUT
   * @param {Number} http_code The response HTTP code e.g. 200, 403
   */
  constructor(operation, method, http_code) {
    super(`Operation '${operation}' fails with code ${http_code}`);
    this.data = {
      operation,
      method,
      http_code
    };
  }
};
var DHREST = class extends DHTabular {
  /** @type {URL} The url at which access to this API is made */
  api_url;
  /** @type {Array} The currently-tracked ID's for this datahandler instance */
  _tracked_ids;
  /** @type {Array} A list of ID's that have been marked for refresh. */
  _marked_ids;
  /** @type {Object} A mirror of _data that contains only data that originated from the server. No local changes. */
  _data_from_server;
  /** @type {Boolean} Whether the bulk_get method is used to fetch multiple ID's */
  _bulk_get_enabled;
  /** @type {Boolean} Whether the bulk_update method is used to update multiple ID's */
  _bulk_update_enabled;
  /** @type {string} The key of the ID for a record in server-returned data */
  _id_key;
  /** @type {PUSH_CONFLICT_RESOLUTIONS} how this dh instance will resolve push conflicts */
  push_conflict_res;
  /**
   * Construct a new REST DataHandler that will point at the provided URL.
   * 
   * The api_url can be an absolute URL to another domain, or one relative to the current domain's root
   * 
   * @param {string} api_url The root path to the REST API routes, e.g. '/api/v2/noun'
   * @param {Boolean} bulk_get Whether to get multiple at once with bulk fetching. Default true
   * @param {Boolean} bulk_update Whether to update multiple at once with bulk update. Default true
   * @param {string} id_key What key in record data represents the ID. Defaults to "id"
   */
  constructor(api_url, bulk_get = true, bulk_update = false, id_key = "id") {
    super();
    if (api_url.slice(-1) == "/") api_url = api_url.substring(0, api_url.length - 1);
    try {
      this.api_url = new URL(api_url);
    } catch {
      this.api_url = new URL(api_url, window.location.origin);
    }
    this._bulk_get_enabled = bulk_get;
    this._bulk_update_enabled = bulk_update;
    this._id_key = id_key;
    this.push_conflict_res = PUSH_CONFLICT_RESOLUTIONS.WITH_EXCEPTION;
    this._tracked_ids = [];
    this._marked_ids = [];
    this._data_from_server = {};
  }
  /**
   * Unique name for a REST datahandler is it's constructor name followed by api url.
   */
  get name() {
    return `${this.constructor.name}_${this.api_url}`;
  }
  /**
   * Retrieve all 'tracked' data from the server that has not yet already been pulled down. This can be called
   * as frequently as wished and will only bother the server when tracked data is found to be missing.
   * 
   * **Warning**: Any data that has changed on the server **by other clients** since the *last time* this method
   * was called will not be updated unless they have been marked for refresh. See mark_for_refresh().
   * 
   * **Implementation**
   * In this REST implementation, this looks at our tracked ID's and local cache data in _data. All tracked ID's
   * that are not in _data will be fetched with _get_many() and stored in _data.
   * 
   * @returns {Promise} A promise that will resolve when the data pull is complete
   */
  async pull() {
    let ids_missing = [];
    this._tracked_ids.forEach((id2) => {
      if (this._data[id2] == void 0) ids_missing.push(id2);
    });
    let ids_to_pull = [.../* @__PURE__ */ new Set([...this._marked_ids, ...ids_missing])];
    return this._get_many(ids_to_pull).then(() => {
      this._marked_ids = [];
    });
  }
  /**
   * Update the server to match this local client. This can be called as frequently as wished, as only changes
   * that have occurred as a result of local actions will be sent.
   * 
   * **Warning**: Calling this could precipitate a change in local data, as the UPDATE on the server may
   * incur some code that makes additional changes, in this table or perhaps elsewhere. This DH's local
   * copy will be brought up-to-date with ALL changes automaticaly. Other DH's will not.
   * 
   * **Implementation** In this REST implementation, this looks at a cache of local that reflects what the
   * server ought to contain (and indeed will contain if no other clients have made independent changes).
   * Any differences between that cache and local data will be sent to the server.
   * 
   * @returns {Promise} A promise that will resolve when the data push is complete
   */
  async push() {
    let change_map = this._local_data_xor();
    return this._put_many(change_map).then(() => {
      Object.keys(this._data).forEach((id2) => {
        this._all_keys = [.../* @__PURE__ */ new Set([
          ...Object.keys(this._data[id2]),
          ...Object.keys(this._data_from_server[id2])
        ])];
        this._all_keys.forEach((k) => {
          if (this._data[id2][k] != this._data_from_server[id2][k]) {
            this._push_resolve_conflict(id2, k);
          }
        });
      });
    });
  }
  /**
   * This function is neccessary in the event that the server doesn't report a change.
   * 
   * Consider the following situation:
   * 
   * id 2 has update sent for `{k1: v1, k2: v2}`, because
   * 		`_data[2] = {k1: v1, k2: v2}` and `_data_from_server[2] = {k1: PRE, k2: PRE}`
   * 
   * Perhaps the server responds with `{k1: v1}` as the 'updated' response. This is a problem,
   * because now there's still a conflict for 'k2' and push() will trigger a request every
   * time it is called.
   * 
   * To deal with this:
   * A) An error could be raised, forcing the developer to investigate the issue.
   * B) All effected ID's could be marked for refresh and a pull() called.
   * C) Local cache of 'server data' could be altered to match the changes we've made, which implicitly
   *    assumes that the server has *accepted* the new value, just not reported it.
   * D) Local data could be made to match local cache of 'server data', which would discard any local
   *    changes and implicitly assume that the server has rejected the new value, but not reported it.
   * 
   * @param {*} id The ID of the object with a conflict.
   * @param {string} k The key to the data dict where the conflict was noticed.
   */
  _push_resolve_conflict(id2, k) {
    if (this.push_conflict_res == PUSH_CONFLICT_RESOLUTIONS.WITH_EXCEPTION) {
      throw new Error(`Push conflict when updating <${this.constructor.name}:${id2}> - key '${k}'was nominally updated but not reported by server. Value was changed from${this._data_from_server[id2][k]} to ${this._data[id2][k]}`);
    } else if (this.push_conflict_res == PUSH_CONFLICT_RESOLUTIONS.KEEP_CHANGES) {
      this._data_from_server[id2][k] = this._data[id2][k];
    } else if (this.push_conflict_res == PUSH_CONFLICT_RESOLUTIONS.DISCARD_CHANGES) {
      this._data[id2][k] = this._data_from_server[id2][k];
    }
  }
  /**
   * Mark the following ID's for refresh. Next time pull() is called, these ID's will have fresh state
   * data pulled regardless of whether state data already exists locally.
   * 
   * This can be called multiple times with overlapping ID's safely.
   * 
   * @param {*} id_or_ids Either a single ID or a list of ID's
   */
  mark_for_refresh(id_or_ids) {
    if (!(id_or_ids instanceof Array)) id_or_ids = [id_or_ids];
    let ids = id_or_ids;
    this._marked_ids = [.../* @__PURE__ */ new Set([...this._marked_ids, ...ids])];
  }
  /**
   * Mark all tracked ID's for refresh.
   */
  mark_all_for_refresh() {
    this.mark_for_refresh(this._tracked_ids);
  }
  /**
   * @param {*} id The ID to get a URL for, or undefined for base URL e.g. /api/url/
   * @returns {URL} Of the form www.xxxxxx.com/api/url/id
   */
  _url_for(id2) {
    if (id2) {
      return new URL(id2, this.api_url + "/");
    } else {
      return this.api_url;
    }
  }
  /**
   * Create a new object via the API this DH points at. This will:
   * + Fire a POST request at the 'plural' URL
   * + Update local data with the result
   * + Track the newly created record.
   * 
   * The contents of 'data' will be specific to the object being created. This can be overridden in an
   * object-specific subclass to define arguments and provide documentation, if desired, but super() should
   * still be called with a proper data object in the end.
   * 
   * @param {Object} data Key/value mapped data for new device record.
   * 
   * @returns {Promise} That will resolve with the new ID as an argument when the new record has been created.
   */
  async create(data2) {
    return new Promise((res, rej) => {
      return this._create(data2).then((returned_data) => {
        if (!(this._id_key in returned_data)) {
          rej(
            `When creating new ${this.constructor.name} record, returned data did not contain an ID on key '${this._id_key}'. Check that the id_key constructor param is correct.`
          );
        }
        let id2 = returned_data[this._id_key];
        this._local_data_set_from_server(id2, returned_data);
        res(id2);
      }).catch((e) => {
        rej(e);
      });
    });
  }
  /**
   * Actually do the heavy lifting to create a new object via the API this DH points at. This will:
   * + Fire a POST request at the 'plural' URL
   * + Update local data with the result
   * + Track the newly created record.
   * 
   * @param {Object} data Key/value mapped data for new device record.
   * 
   * @returns {Promise} That will resolve with the returned data as an argument when the new record has been created.
   */
  async _create(data2) {
    return fetch(
      this._url_for(void 0),
      {
        method: "POST",
        body: JSON.stringify(data2),
        headers: JSON_HEADERS
      }
    ).then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new ErrorREST(
          "Create new",
          "POST",
          response.status
        );
      }
    });
  }
  /**
   * Delete a record by ID. This will perform the deletion on the server and then update local records
   * accordingly if successful. Data record will be deleted and ID will be untracked.
   * 
   * @param {*} id The ID of the record to delete.
   * 
   * @returns {Promise} That will resolve when the record has successfully been deleted.
   */
  async delete(id2) {
    return this._delete(id2).then(() => {
      this.data_delete_record(id2);
      this.untrack_ids([id2]);
    });
  }
  /**
   * Delete a record by ID via a DELETE request sent to the 'plural' URL. Cascading effects may need
   * to be considered. This will not change the internal state of this datahandler - it is only concerned
   * with prosecuting the REST operation.
   * 
   * @param {*} id The ID of the record to delete.
   * 
   * @returns {Promise} That will resolve when the record has successfully been deleted.
   */
  async _delete(id2) {
    return new Promise((res, rej) => {
      fetch(
        this._url_for(id2),
        {
          method: "DELETE"
        }
      ).then((response) => {
        if (response.status == 200) {
          res();
        } else {
          rej(`Deletion of <${this.constructor.name}:${id2}> fails with code ${response.status}`);
        }
      });
    });
  }
  /**
   * Shorthand to fire a GET request at the plural URL to get a list of available ID's.
   * 
   * **On Filtering**
   * Filtering is made automatically possible via the included 'filter_data' arg. When it is provided,
   * it will take the form {"k1": "v1", "k2": "v2", ...}. The returned ID's should all have record data
   * rows "k1" that have value "v1" and "k2" with "v2", etc.
   * 
   * Record data that is excluded from serialization (for example, user passhash) is not allowed for filtering
   * and will trip an error.
   * 
   * @param {Object} filter_data Optional data to filter response by.
   * 
   * @returns {Promise} That resolves with the list of ID's available.
   */
  async list(filter_data) {
    return new Promise((res, rej) => {
      let altered_url = this._url_for(void 0);
      if (filter_data) {
        altered_url = new URL(this._url_for(void 0) + "_get_filtered");
        altered_url.searchParams.append("filter", btoa(JSON.stringify(filter_data)));
      }
      fetch(
        altered_url,
        {
          method: "GET"
        }
      ).then((response) => {
        if (response.status == 200) {
          return response.json();
        } else {
          rej(new ErrorREST(
            "Fetch list of ID's",
            "GET",
            response.status
          ));
        }
      }).then((data2) => {
        res(data2);
      });
    });
  }
  /**
   * Fire a classic GET request at the singular URL to get the data for the indicated instance by ID.
   * 
   * @param {*} id The ID to get data for
   * 
   * @returns {Promise} A promise that will resolve with data for this record
   */
  async _get(id2) {
    return new Promise((res, rej) => {
      fetch(
        this._url_for(id2),
        {
          method: "GET"
        }
      ).then((response) => {
        if (response.status == 200) {
          return response.json();
        } else {
          rej(`Get data for <${this.constructor.name}:${id2}> fails with code ${response.status}`);
        }
      }).then((data2) => {
        res(data2);
      });
    });
  }
  /**
   * Fire a classic PUT request at the singular URL to update some data for the indicated instance by ID.
   * 
   * @param {*} id The ID to get data for
   * @param {Object} data Key/value pairs of data which shall be sent to the server to update this record
   * 
   * @returns {Promise} A promise that will resolve with new data for this record
   */
  async _put(id2, data2) {
    return new Promise((res, rej) => {
      fetch(
        this._url_for(id2),
        {
          method: "PUT",
          body: JSON.stringify(data2),
          headers: JSON_HEADERS
        }
      ).then((response) => {
        if (response.status == 200) {
          return response.json();
        } else {
          rej(`Update data for <${this.constructor.name}:${id2}> fails with code ${response.status}`);
        }
      }).then((data3) => {
        res(data3);
      });
    });
  }
  /**
   * Fire a bulk get command against the API. This method is more efficient than firing many individual GET
   * commands. However, there seems to be no generally accepted format for this. Furthermore, it mostly
   * mitigates the advantages of caching.
   * 
   * Bulk get, on my systems, is achieved by sending a URL parameter along with a GET request to the general
   * API URL. The format of this parameter is:
   * 
   * ```
   * "/api/url/object?ids=BASE_64_ENCODED_ID_LIST"
   * 
   * let BASE_64_ENCODED_ID_LIST = btoa(JSON.stringify(id_list))
   * ```
   * 
   * This has the consequence of enforcing only UTF-8 characters for ID's, which I am Ok with.
   * 
   * I intend to do some research with this method, in fact, and find whether caching and getting single
   * resources can perform better than multi-fetch in the long run. But that relies on discovering a safe
   * way to cache resources that might one day change, as they are after all in a database. Hmm...
   * 
   * @param {Array} ids ID's to get information for.
   * 
   * @returns {Promise} That resolves with a data_map of id to Object with data for all requested ID's.
   */
  async _get_bulk(ids) {
    let altered_url = new URL(this._url_for(void 0) + "_get_bulk");
    altered_url.searchParams.append("ids", btoa(JSON.stringify(ids)));
    return new Promise((res, rej) => {
      if (ids.length == 0) {
        res({});
        return;
      }
      fetch(
        altered_url,
        {
          method: "GET"
        }
      ).then((response) => {
        if (response.status == 200) {
          return response.json();
        } else {
          rej(`Update data for <${this.constructor.name}:${ids}> fails with code ${response.status}`);
        }
      }).then((data2) => {
        res(data2);
      });
    });
  }
  /**
   * Fire a bulk update command against the API. This method is more efficient than firing many individual
   * PUT requests, and furthermore does not have any downsides as caching was never an option.
   * 
   * Bulk put, on my systems, is achieved by sending a dict of the form:
   * 
   * ```
   * {
   * 		1: {key: val, key2: val2, ...}
   * 		2: {key: val, key2: val2, ...}
   * 		...
   * 		n: {key: val, key2: val2, ...}
   * }
   * ```
   * 
   * With an id-mapped data object for all ID's to update.
   * 
   * @param {Object} data_map ID-mapped Objects which contain 'data' for classic PUT requests.
   * 
   * @returns {Promise} A promise that will resolve a similar ID map with whatever was updated.
   */
  async _put_bulk(data_map) {
    throw "TODO Not yet implemented... need to think about how errors and discrepancies are handled.";
    return fetch(
      this._url_for(id),
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: JSON_HEADERS
      }
    );
  }
  /**
   * This is an internal helper method which will contact the server to get a new, full
   * set of data for every ID included. Depending on instance configuration, this will either do so
   * with a bulk operation (GET /api/noun?ids=[1, 2, 3]) or by making many individual GET requests
   * (GET /api/noun/1, GET /api/noun/2, ...).
   * 
   * @param {Array} ids The ID's to fetch.
   * 
   * @returns {Promise} A promise that will resolve without args when all id's have been gotten and stored
   */
  async _get_many(ids) {
    if (this._bulk_get_enabled) {
      return this._get_bulk(ids).then((data_map) => {
        Object.entries(data_map).forEach(([id2, data2]) => {
          this._local_data_set_from_server(id2, data2);
        });
      });
    } else {
      var all_promises = [];
      ids.forEach((id2) => {
        let get_and_set = new Promise((res, rej) => {
          this._get(id2).then((data_returned) => {
            this._local_data_set_from_server(id2, data_returned);
            res();
          });
        });
        all_promises.push(get_and_set);
      });
      return Promise.all(all_promises);
    }
  }
  /**
   * This is an internal helper method which will cause the server to update records for all object data
   * in the provided data_map. Depending on instance configuration, this will either use a bulk update
   * operation or spawn a great many individual updates.
   * 
   * @param {Object} data_map ID-mapped Objects which contain 'data' for classic PUT requests.
   * 
   * @returns {Promise} A promise that will resolve with no args when all updates are complete.
   */
  async _put_many(data_map) {
    if (this._bulk_update_enabled) {
      return this._put_bulk(data_map);
    } else {
      var all_promises = [];
      Object.entries(data_map).forEach(([id2, data2]) => {
        let put_and_set = new Promise((res, rej) => {
          this._put(id2, data2).then((data_returned) => {
            this._local_data_set_from_server(id2, data_returned);
            res();
          });
        });
        all_promises.push(put_and_set);
      });
      return Promise.all(all_promises);
    }
  }
  /**
   * This is a handy piece of automation that will track all ID's available. This might be quite a few,
   * so beware.
   * 
   * Under the hood, this is achieved by firing a GET request at the plural URL and collecting the ID's
   * that it returns.
   * 
   * @returns {Promise} That will resolve when all ID's have been collected for tracking.
   */
  async track_all() {
    return this.list().then((ids) => {
      this.track_ids(ids);
    });
  }
  data_delete_record(id2) {
    super.data_delete_record(id2);
    delete this._data_from_server[id2];
  }
  /**
   * Track the provided list of ID's.
   * 
   * A tracked id will automatically be pulled by pull() actions. To track an ID is, generally, to ensure
   * that its data will always be available to the frontend more or less automatically.
   * 
   * @param {Array} ids A list of ID's to track. They will likely be ints, but might be strings. All unique.
   */
  track_ids(ids) {
    this._tracked_ids = [.../* @__PURE__ */ new Set([...this._tracked_ids, ...ids])];
  }
  /**
   * Untrack a set of ID's. This will:
   * 
   * 1. Remove the ID from tracking, ensuring that future pull()'s won't fetch data for it.
   * 2. Remove the record data for this ID from this datahandler instance's data entirely.
   * 
   * @param {Array} ids A list of ID's to untrack.
   */
  untrack_ids(ids) {
    for (var x = ids.length - 1; x >= 0; x--) {
      let id2 = ids[x];
      var index = this._tracked_ids.indexOf(id2);
      if (index != -1) {
        this._tracked_ids.splice(index, 1);
      }
      this.data_delete_record(id2);
    }
  }
  /**
   * Untrack all currently tracked ID's. This will:
   * 
   * 1. Remove all IDs from tracking, ensuring that future pull()'s won't fetch data for them.
   * 2. Remove all record data for these IDs from this datahandler instance's data entirely.
   */
  untrack_all() {
    this.untrack_ids(this._tracked_ids);
  }
  /**
   * Set data for this object in the local data cache. This should only ever be called for data that is
   * **known to be true** from the server.
   * 
   * This updates both our local data (which may contain local changes) and our local cache of server data
   * (which never contains local changes).
   * 
   * @param {*} id The ID of the record
   * @param {Object} data The data that corresponds with this object (some or all)
   */
  _local_data_set_from_server(id2, data2) {
    this.data_update_record(id2, data2);
    if (this._data_from_server[id2] == void 0) this._data_from_server[id2] = {};
    Object.assign(this._data_from_server[id2], data2);
  }
  /**
   * Compare the local data to the local cache of server data and see if we've made any local
   * changes. If we have, produce a data_map which contains only those values which
   * have changed.
   * 
   * @returns {Object} A data_map object where vals are {colname-key: row-value} dicts
   * 	of local changes that are not yet on the server.
   */
  _local_data_xor() {
    var data_map = {};
    Object.keys(this._data_from_server).forEach((id2) => {
      var server_data = this._data_from_server[id2], local_data = this._data[id2], diffs = {};
      if (local_data == void 0) {
        throw `Local record for '${id2}' does not exist in local data. Something has gone wrong.`;
      }
      Object.keys(server_data).forEach((k) => {
        if (server_data[k] != local_data[k]) {
          diffs[k] = local_data[k];
        }
      });
      if (Object.keys(diffs).length > 0) {
        data_map[id2] = diffs;
      }
    });
    return data_map;
  }
};

// src/regional/regions/reg.js
var Region = class _Region {
  /** Get how long the mouse must hover over a tooltip to show it, in seconds.*/
  static get tooltip_hover_time() {
    return 2;
  }
  /** Get the attribute name for 'member' tags. See get_member_element()*/
  static get member_attr_name() {
    return "rfm_member";
  }
  /** @type {Fabricator} The fabricator that this instance has been set to use. undefined it not used. */
  _fab;
  /** @type {Boolean} Whether or not this region is currently active.*/
  _active;
  /** @type {Object.<string, Region>} Sub-regions that are nested within this region's model. Key-value mapped on ID */
  subregions;
  /** @type {Region} This will be set if this region is linked as a subregion to a parent region. */
  superregion;
  /** @type {Object.<str, DataHandler>} Map of datahandlers that this region is subscribed to. */
  datahandlers;
  /** 
   * @type {Object.<str, *>} Static data that is unique to the instance of the region. Can not change after
   * construction.*/
  config;
  /** @description Settings object for this region. This is local data which is erased on page refresh. */
  settings;
  /** @type {RegionSwitchyard} Reference to the switchyard region. */
  swyd;
  /** @type {RHElement} The DOM element that represents the overall container for this region. */
  reg;
  /** @type {Object} Key-value map on member name of members. */
  _member_cache;
  /** @type {Boolean} Whether or not this region has been ethereal-enabled */
  ethereal;
  /** @type {Object} Key-value mapping for checksums of model data */
  _model_checksums;
  /** @type {Object.<str, Function>} A map of keys to handler-types */
  _handlers;
  /**
   * Instantiate a new region instance. Merely constructing a region does nothing except allocate a bit of space
   * in memory.
   * 
   * The region-creation toolchain is as follows:
   * 1. Instantiate the region (constructor).
   * 2. Fabricate the region. This is done by calling fab() on the instance. This step is technically optional;
   *    if the DOM for this region already exists in the page then fab() shouldn't be called.
   * 3. Link the new region to some point within the existing region heirarchy, as well as various pointers
   *    that make working with regions convenient. This is done with link().
   * 
   * When creating custom region classes, it's a good idea to extend the constructor to type declare
   * all class internal variables. See sample site for an example.
   * 
   * @param {Object} config Optional config key/value pairs to override defaults.
   */
  constructor(config) {
    this._active = true;
    this.subregions = {};
    this.config = this._config_default();
    this.datahandlers = {};
    this.settings = {};
    this._member_cache = {};
    this._model_checksums = {};
    this._model_aux_tracked = {};
    this.ethereal = false;
    this._handlers = {
      _on_render: []
    };
    Object.assign(this.config, config);
    this.paste_allowed_components = [];
    this.anchor = {
      enabled: 0,
      path: this.id
    };
  }
  /**
   * Fabricate this region's DOM. This will use the Fabricator that has been defined for this region
   * in fab_get().
   * 
   * @param {Fabricator} fab The fabricator to use to generate this region's DOM structure.
   * 
   * @returns {this} itself for function call chaining
   */
  fab() {
    this._fab = this.fab_get();
    return this;
  }
  /**
   * @abstract
   * Get an instance of a Fabricator object for this region. Not every region needs to define a fabricator.
   * Some regions will simply bind themselves to existing code in the webpage and have no need for this method.
   * Recall that config is available at this point during region construction.
   * 
   * @returns {Fabricator}
   */
  fab_get() {
  }
  /**
   * Perform linking operations for this region:
   * + Link this region to its super-region and vice versa
   * + Link this region to the specific element in webpage DOM that it represents.
   * + Link this region to the switchyard and datahandlers and setup certain events.
   * + Assign a unique in-memory ID for this region and set the reg_el's ID to the same.
   * + Fabrication links (if fab() was called earlier), including links to this.$element and linking $elements
   *   to the reg_el.
   * 
   * @param {Region} reg_super The super (or parent) region that this region will be a subregion of.
   * @param {HTMLElement} reg_el The main element for this region, which this region will be bound to.
   * 
   * @returns {this} itself for function call chaining
   */
  link(reg_super, reg_el) {
    this.swyd = reg_super.swyd;
    this.swyd._focus_region_setup_listeners(this);
    this.reg = RHElement.wrap(reg_el);
    this.reg.setAttribute("rfm_reg", this.constructor.name);
    this._link_ids();
    this.superregion = reg_super;
    reg_super._link_subregion(this);
    this._link_fabricate();
    this._create_subregions();
    this._on_link_post();
    return this;
  }
  /**
   * @protected
   * Setup a unique ID for this region and ensure this region's reg matches.
   */
  _link_ids() {
    this.id = this.swyd._id_get_next(this.constructor.name);
    this.reg.id = this.id;
  }
  /**
   * @protected
   * Use this region's _fab (if it is defined) to generate DOM elements for this region. Those elements
   * will be appended direclty under this regions reg object. Pointers will be created between this region
   * instance and those members (e.g. this.member_name -> RHElm(<div rfm_member=member_name>))
   */
  _link_fabricate() {
    if (this._fab === void 0) return;
    this._fab.fabricate();
    this._fab.append_to(this.reg);
    for (const [member_name, member] of Object.entries(this._fab.get_members())) {
      this[member_name] = member;
    }
  }
  /**
   * @abstract
   * This is called after linking is complete. Anything which should be done as part of the creation of a region
   * but relies on all regional structure already being setup should go here. This might include:
   * + Manually binding DOM elements in non-fabricated regions to HTML-defined tags.
   * + Registering events to elements.
   */
  _on_link_post() {
  }
  /**
   * @private
   * Link the provided region to this region as a subregion. This should only be performed once per subregion,
   * but can be performed any number of times for this region.
   * 
   * If the subregion has already been registered, an error will be raised.
   * 
   * @param {Region} reg 
   */
  _link_subregion(reg) {
    this.subregions[reg.id] = reg;
  }
  /**
   * @abstract
   * This is called after linking is complete (just after _on_link_post()). This function can be overridden
   * by child classes to explicitly instantiate subregions that are required for this region to function.
   */
  _create_subregions() {
  }
  /**
   * Subscribe this region to a specific datahandler. By subscribing a region to a datahandler, we ensure
   * that the region will use this datahandler's checksum when deciding whether or not to actually re-render.
   * 
   * @param {*} dh_or_list A DataHandler instance or list of instances
   */
  datahandler_subscribe(dh_or_list) {
    if (!(dh_or_list instanceof Array)) dh_or_list = [dh_or_list];
    dh_or_list.forEach((dh) => {
      if (dh == void 0) throw new Error("Tried to subscribe to undefined datahandler.");
      if (this.datahandlers[dh.name] != void 0) throw new Error(`DH ${dh.name} already registered.`);
      this.datahandlers[dh.name] = dh;
    });
  }
  /**
   * Ethereal regions are regions that are not embedded in the usual 'concrete' chain of DOM elements that nest
   * up to the region element. They are 'free floating' so to speak, and can appear anywhere on screen. The
   * point of such a region is mostly to be used as a sort of 'overlay' or in-app popup.
   * 
   * Regional has a bit of magic here to abstract away the bother of managing things like overlays. Calling
   * etherealize() during the region-creation stage will result in the following behaviors for this region:
   * 1. This region's Z-index will be set to the 'z_index_eth_base' config in the switchyard, placing it in
   *    front of all other regions.
   * 2. Classes will be applied to this reg that will position it absolutely to completely fill the viewport.
   *    The reg will be set to a grey color with opacity so that only DOM within the region is clickable
   *    and appears focused.
   * 
   * Some restrictions:
   * 1. This function should be called AFTER link() because reg must be available.
   * 2. This region must be a direct child of the switchyard.
   * 
   * @param {Number} [z_index] An optional secondary z-index, which should be considered to be relative only to
   * 		other etherealized regions.
   * 
   * @returns {this} This, for function call chaining
   */
  etherealize(z_index) {
    if (!this.reg) throw new RegionalStructureError("Must link() before etherealize()");
    if (!(this.superregion instanceof RegionSwitchyard)) throw new RegionalStructureError(
      "Ethereal regions must be direct children of the Switchyard"
    );
    if (!z_index) z_index = 0;
    this.ethereal = true;
    this.reg.classList.add("rcss-eth");
    this.reg.style.zIndex = this.swyd.config.z_index_eth_base + z_index;
    this.reg.hide();
    return this;
  }
  /**
   * Bind an input region (usually very small, like a text box or dropdown) to this region such
   * 
   * Should the settings key be an arg of this function??
   * 
   * @param {RegInput} input The input to tie into this region.
   */
  input_add(input) {
    throw TODOError("Write new Region Input mechanism. May require different args..");
  }
  /**
   * Get an $element for a 'member' of this region. A member is a DOM element that belongs to this region which
   * is *unique* within this region. It may not be unique across other regions. The member 'name' is like
   * its ID, but unique to only this region.
   * 
   * There should be only one member per member name. Within the DOM, a member is given a custom attribute
   * like 'rfm_member=member_name'. This is searched by query, which is fast these days.
   * 
   * To keep things fast, the result of the query is cached within this region's memory against its member
   * name. For this reason, member elements should not be deleted or hot-swapped.
   * 
   * @param {str} member_name The name of the member. Unique to this region.
   * 
   * @throws {RegionalStructureError}
   * 
   * @return {HTMLElement} The member element
   */
  member_get(member_name) {
    if (member_name in this._member_cache) {
      return this._member_cache[member_name];
    }
    let statement = "[" + _Region.member_attr_name + "=" + member_name + "]";
    let $el = this.reg.querySelector(statement);
    if (!$el) throw new RegionalStructureError("Region " + this.id + " does not have member '" + member_name + "'.");
    this._member_cache[member_name] = $el;
    return $el;
  }
  /**
   * Get the ClassDef for this region's context menu.
   */
  get context_menu() {
    return ContextMenu;
  }
  /**
   * @abstract
   * Child classes that use config shall override this to define config defaults.
   * 
   * @returns {Object} Default config object for this class.
   */
  _config_default() {
    return {};
  }
  /**
   * This initiates a reset of the settings of this region back to their default values (e.g. those present
   * on pageload). All subregions will also have their settings refresh - this action ripples downwards.
   */
  settings_refresh() {
    this._on_settings_refresh();
    for (const [subreg_id, subreg] of Object.entries(this.subregions)) {
      subreg.settings_refresh();
    }
  }
  /**
   * @abstract
   * @protected
   * This is called whenever this specific region has its settings refreshed. This is the preferred location
   * to setup settings information in a Region subclass.
   */
  _on_settings_refresh() {
  }
  /**
   * Completely redraw this region and all active subregions. This will ripple downwards to across all 
   * sub-regions and reginputs unless this region is unactive.
   * 
   * **Caching**
   * A cached-checksum system is employed to determine whether the workhorse _on_render() method
   * should even be called. A region only needs to be re-rendered when the 'model' that informs the render
   * has changed. Most of the time, the model is composed only of region settings and subscribed data.
   * Sometimes regions will refer to other data, such as a settings value of a super-region. In this event,
   * that data can be tracked as well by calling `render_checksum_add_tracked()` on post load.
   * 
   * 
   * If neither data nor settings have changed for a region, it will not be re-rendered
   * (unless forced). However, even if nothing has changed the render() call will still ripple downwards.
   * 
   * @param {Boolean} force If set, force the render even if this region's settings and data have not changed.
   */
  render(force = false) {
    if (!this.is_active()) {
      return;
    }
    for (const [subreg_id, subreg] of Object.entries(this.subregions)) {
      if (subreg.is_active()) {
        subreg.render(force);
      }
    }
    if (force || this._render_has_model_changed()) {
      this._on_render();
      this._handlers._on_render.forEach((handler) => {
        handler();
      });
    }
  }
  /**
   * Add a hook that will be called just after this._on_render is called.
   * 
   * @param {Function} fn Will be called without args _on_render()
   */
  render_add_handler(fn) {
    this._handlers._on_render.push(fn);
  }
  /**
   * @abstract
   * @protected
   * This is called whenever this specific region has its settings refreshed. This is the preferred location
   * to actually place the code that will 'redraw' a region.
   */
  _on_render() {
  }
  /**
   * Check whether the model (data and settings) have changed since this region was last rendered. If they
   * have, this function will also update the checksums. Calling this function twice in a row will ALWAYS
   * result in false being returned.
   * 
   * This is achieved by getting a checksum for region settings and subscribed datahandler states and
   * comparing that checksum against the checksums at last graphical render.
   * 
   * @returns {Boolean} True if an update is required.
   */
  _render_has_model_changed() {
    let current_checksums = this._render_checksums_get();
    let update_needed = false;
    for (const [k, checksum] of Object.entries(current_checksums)) {
      if (checksum != this._model_checksums[k]) {
        update_needed = true;
        break;
      }
    }
    if (!update_needed) return false;
    this._model_checksums = current_checksums;
    return true;
  }
  /**
   * Get the checksum map for this object. Keys are the names of the data which was used to create each
   * checksum. By default, this should return a key for the settings of the region along with any
   * subscribed datahandlers.
   * 
   * @returns {Object.<String, String>} A map of checksums for this object.
   */
  _render_checksums_get() {
    let current_checksums = { "reg_settings": checksum_json(this.settings) };
    Object.entries(this.datahandlers).forEach(([name, dh]) => {
      current_checksums[name] = dh.checksum;
    });
    Object.entries(this._model_aux_tracked).forEach(([name, aux_fn]) => {
      let aux_v = aux_fn();
      if (aux_v == void 0) aux_v = 0;
      current_checksums[name] = checksum_json(aux_v);
    });
    return current_checksums;
  }
  /**
   * This function will add an 'auxiliary' tracked piece of data to the render checksums. This indicates
   * to the region machinery that the provided data is part of the model for this region even though it
   * does not lie within region settings and data.
   * 
   * The aux_fn provided will be called with no arguments to produce a return value. This return value will
   * be checksum'd, so it must be JSON serializable. This function will be called very frequently, so take
   * care that it is not expensive!
   * 
   * @param {String} name The name of this checksum addition. This should be unique relative to this class inst.
   * @param {Function} aux_fn The function that returns the checksummable value.
   */
  render_checksum_add_tracked(name, aux_fn) {
    this._model_aux_tracked[name] = aux_fn;
  }
  /**
   * Return True if the current objects on the clipboard can paste here, False if even one of them can not.
   */
  can_paste() {
    return this.swyd.clipboard.has_copied_of_type(this.paste_allowed_components);
  }
  /**
   * @abstract
   * This function should be overwritten in any child class that allows pasting. Called by app on a paste
   * maneuver.
   * @param {Event} e The originating event
   * @param {Component} component
   */
  paste_component(e, component) {
  }
  /**
   * This is called by the switchyard for top-level subregions to propagate key events down the region
   * heirarchy.
   * 
   * @param {str} name The name of the event that was fired. Either keyup or keydown
   * @param {Event} e The keyboard event that was fired.
   */
  _key_event_prop(name, e) {
    if (!this.is_active()) return;
    if (name == "keydown") this.key_event_down(e);
    else if (name == "keyup") this.key_event_up(e);
    for (const [subreg_id, subreg] of Object.entries(this.subregions)) {
      subreg._key_event_prop(e);
    }
  }
  /**
   * @abstract
   * Called whenever there is a keydown event. Override this in child classes to add behavior.
   * 
   * Key events in regional are handled slightly differently than other events. Normally, when a key event
   * occurs it will apply to anything 'content editable' like an input or a textarea. If nothing of the sort
   * is 'in focus', it ripples up until it hits the document.
   * 
   * For some regions, it's handy to capture key events for certain hotkey-type functions (CTRL+S to save, for
   * example). A keydown can not be directly bound to most tags that a reg is likely to be, so region-specific
   * keypress handling requires a bit of its own logic. The Switchyard has listening methods that specifically
   * propagate the event to all regions that are currently 'active'. When a keydown event occurs, unless it
   * is captured (for instance, by a focused input box) all active regions will have this method called.
   * 
   * @param {KeyboardEvent} e The keyboard event from the native handler.
   */
  key_event_down(e) {
  }
  /**
   * @abstract
   * Called whenever there is a keyup event. Override this in child classes to add behavior. Only called if
   * region is active.
   * 
   * See docstring for key_event_down() for more info.
   * 
   * @param {KeyboardEvent} e The keyboard event from the native handler.
   */
  key_event_up(e) {
  }
  /**
   * Determine whether or not this region is currently active. Only active regions will have be shown and
   * have ripple-down actions like settings_refresh() and render() propagate.
   * 
   * @returns {Boolean}
   */
  is_active() {
    return this._active;
  }
  /**
   * Activate this region.
   * 
   * Regions can be 'active' or 'disactive. An active region is visible and functioning. A 'disactive' region
   * is hidden in the DOM and effectively disabled in the regional structure. A 'disactive' region will:
   * + Not re-render when render is called.
   * + Have events disabled
   * 
   * This function is not intended to be extended by subclasses. Most of the time, activation behavior should
   * go in on_activate().
   */
  activate() {
    this.settings_refresh();
    this._active = true;
    this._on_activate_pre();
    for (let x = 0; x < this.subregions.length; x++) {
      this.subregions[x].activate();
    }
    this.reg.show();
    this.swyd.focus_region_set(this);
    if (this.anchor.enabled) {
      this._anchor_activate();
    }
    this.render();
    this._on_activate_post();
  }
  /**
   * @abstract
   * This is called when a region is activated, just before all sub-regions are activated. Any changes
   * made to settings here will be available for subregions.
   */
  _on_activate_pre() {
  }
  /**
   * @abstract
   * This is called when a region is activated, just after the core function has finished setting it up.
   * By the time this is called, settings_refresh and render has been called for this region
   * and all sub-regions that have also been activated.
   */
  _on_activate_post() {
  }
  /**
   * Deactivate this region.... TODO
   */
  deactivate() {
    if (this.active) this.on_deactivate();
    this.active = false;
    for (let x = 0; x < this.subregions.length; x++) {
      this.subregions[x].deactivate();
    }
    this.reg.hide();
  }
  /**
   * @abstract
   * Called on deactivate(), but ONLY if this region was actually active.
   */
  _on_deactivate() {
  }
};

// src/regional/regions/reg_one_choice.js
var RegOneChoice = class extends Region {
  fab_get() {
    let css = (
      /* css */
      `
			[rfm_reg="RegTwoChoiceNav"] {
				& .cont
				{
					max-width: 30em;
					padding: 0.5em;
					background-color: white;
				}
				& .title
				{
					
				}
				& .text
				{
					padding-top: 0.5em;
					padding-bottom: 0.5em;
				}
				& .row
				{
					display: flex; flex-direction: row; justify-content: flex-end;
				}
				$ .btn
				{
					cursor: pointer;
				}
			}
		`
    );
    let html = (
      /* html */
      `
			<div rfm_member='cont' class='cont'>
				<div rfm_member="title" class='title'>Title</div>
				<div rfm_member="text" class='text'>Text</div>
				<div class='row'>
					<button class='btn' rfm_member="continue"> Continue </button>
				</div>
			</div>
		`
    );
    return new Fabricator(html).add_css_rule(css);
  }
  /** @type {RHElement}*/
  cont;
  /** @type {RHElement}*/
  title;
  /** @type {RHElement}*/
  text;
  /** @type {RHElement}*/
  continue;
  /** @type {Function} The promise resolve created when a choice is actively presented. */
  _choice_promise_res;
  _on_link_post() {
    this.continue.addEventListener("click", () => {
      this.choice_continue();
    });
  }
  /**
   * Called when the user clicks the continue button.
   */
  choice_continue() {
    if (this._choice_promise_res == void 0) return;
    this._choice_promise_res();
  }
  /**
   * Present the user with a message. The message is configured by the parameters below. This region will
   * be re-rendered with the provided input and activated.
   * 
   * A promise is returned that will resolve when the user clicks the continue button.
   * 
   * @param {String} title The title of the overlay
   * @param {String} text The text of the overlay. This should explain what the user is being asked to confirm
   * @param {String} continue_label The text of the 'continue' button. Defaults to "Continue"
   */
  async present_message(title, text, continue_label = "Continue") {
    this.activate();
    this.settings.title = title;
    this.settings.text = text;
    this.settings.continue = continue_label;
    this.render();
    return new Promise((res, rej) => {
      this._choice_promise_res = res;
    }).finally(() => {
      this._choice_promise_res = void 0;
      this.deactivate();
    });
  }
  _on_settings_refresh() {
    this.settings.title = "Make A Choice";
    this.settings.text = "Either confirm or deny this action.";
    this.settings.continue = "Continue";
  }
  _on_render() {
    this.title.text(this.settings.title);
    this.text.text(this.settings.text);
    this.continue.text(this.settings.continue);
  }
  _on_deactivate() {
    this.choice_continue();
  }
};

// src/regional/regions/reg_two_choice.js
var RegTwoChoice = class extends Region {
  fab_get() {
    let css = (
      /* css */
      `
			[rfm_reg="RegTwoChoiceNav"] {
				& .cont
				{
					max-width: 30em;
					padding: 0.5em;
					background-color: white;
				}
				& .title
				{
					
				}
				& .text
				{
					padding-top: 0.5em;
					padding-bottom: 0.5em;
				}
				& .row
				{
					display: flex; flex-direction: row; justify-content: space-between;
				}
				$ .btn
				{
					cursor: pointer;
				}
			}
		`
    );
    let html = (
      /* html */
      `
			<div rfm_member='cont' class='cont'>
				<div rfm_member="title" class='title'>Title</div>
				<div rfm_member="text" class='text'>Text</div>
				<div class='row'>
					<button class='btn' rfm_member="deny"> Deny </button>
					<div style="width: 5em"></div>
					<button class='btn' rfm_member="confirm"> Confirm </button>
				</div>
			</div>
		`
    );
    return new Fabricator(html).add_css_rule(css);
  }
  /** @type {RHElement}*/
  cont;
  /** @type {RHElement}*/
  title;
  /** @type {RHElement}*/
  text;
  /** @type {RHElement}*/
  deny;
  /** @type {RHElement}*/
  confirm;
  /** @type {Function} The promise resolve created when a choice is actively presented. */
  _choice_promise_res;
  /** @type {Function} The promise reject created when a choice is actively presented. */
  _choice_promise_rej;
  _on_link_post() {
    this.deny.addEventListener("click", () => {
      this.choice_deny();
    });
    this.confirm.addEventListener("click", () => {
      this.choice_confirm();
    });
  }
  /**
   * Deny the active choice promise, if there is one.
   */
  choice_deny() {
    if (this._choice_promise_rej == void 0) return;
    this._choice_promise_rej();
  }
  /**
   * Confirm the active choice promise, if there is one.
   */
  choice_confirm() {
    if (this._choice_promise_res == void 0) return;
    this._choice_promise_res();
  }
  /**
   * Present the user with a choice. The choice is configured by the parameters below. This region will
   * be re-rendered with the provided input and activated.
   * 
   * A promise is returned that will resolve if the user clicks the confirm button or reject if the user
   * clicks the deny button or deactivates the region.
   * 
   * @param {String} title The title of the overlay
   * @param {String} text The text of the overlay. This should explain what the user is being asked to confirm
   * @param {String} deny_label The text of the 'deny' button. Defaults to "Deny"
   * @param {String} confirm_label The text of the 'confirm' button. Defaults to "Confirm"
   */
  async present_choice(title, text, deny_label = "Deny", confirm_label = "Confirm") {
    this.activate();
    this.settings.title = title;
    this.settings.text = text;
    this.settings.deny = deny_label;
    this.settings.confirm = confirm_label;
    this.render();
    return new Promise((res, rej) => {
      this._choice_promise_res = res;
      this._choice_promise_rej = rej;
    }).finally(() => {
      this._choice_promise_res = void 0;
      this._choice_promise_rej = void 0;
      this.deactivate();
    });
  }
  _on_settings_refresh() {
    this.settings.title = "Make A Choice";
    this.settings.text = "Either confirm or deny this action.";
    this.settings.deny = "Deny";
    this.settings.confirm = "Confirm";
  }
  _on_render() {
    this.title.text(this.settings.title);
    this.text.text(this.settings.text);
    this.deny.text(this.settings.deny);
    this.confirm.text(this.settings.confirm);
  }
  _on_deactivate() {
    this.deny();
  }
};

// src/regional/regions/reg_in.js
var RegIn = class extends Region {
  /** @type {Number} If undefined, debouncer is disabled. If defined, the debouncer duration in seconds. */
  _debouncer_duration;
  /** @type {Boolean} The number of debouncing actions that have occured within the operation */
  _debouncer_count = 0;
  /** @type {Object} Reference to variable at which region input value is stored */
  _value_ref;
  /** @type {String} The key in `value_ref` at which value is stored: `value_ref[value_key] = value` */
  _value_key;
  /**
   * @type {Function} If configured, the validation function for this input. Accepts one arg (the user-input
   * value) and expected to return True or False, depending on validity of data.
   */
  _val_fn;
  /** @type {string} Message to display when validation fails */
  _val_fail_text;
  /** @type {RHElement} The validation failure notice element, manually defined by external code*/
  _val_fail_notice_ovr;
  /** @type {RHElement} The default validation failure notice element, generated by RegIn or child */
  _val_fail_notice_base;
  /** @description Settings object for this region. This is local data which is erased on page refresh. */
  settings = {
    /** @description Local copy of the input value. This will always match the view. */
    value: void 0,
    /** @description Set to true if we are in 'validation failure' state. */
    val_failure_state: void 0
  };
  constructor() {
    super();
    this._value_update_handlers = [];
  }
  /**
   * Perform linking operations for this region:
   * + Link this region to its super-region and vice versa
   * + Link this region to the specific element in webpage DOM that it represents.
   * + Link this region to the switchyard and datahandlers and setup certain events.
   * + Assign a unique in-memory ID for this region and set the reg_el's ID to the same.
   * + Fabrication links (if fab() was called earlier), including links to this.$element and linking $elements
   *   to the reg_el.
   * 
   * The additional final two parameters allow this input region to store its value by reference in a location
   * of the implementor's choosing. This will most commonly be `superregion.settings` and `some_settings_key`.
   * It could also, for example, refer to the Switchyard settings or some Component's settings. It could
   * even be tied directly to data in a Datahandler!
   * 
   * @param {Region} reg_super The super (or parent) region that this region will be a subregion of.
   * @param {HTMLElement} reg_el The main element for this region, which this region will be bound to.
   * @param {Object} value_ref Reference to object in which region input value is stored. See above.
   * @param {String} value_key The key in `value_ref` at which value is stored: `value_ref[value_key] = value`
   * 
   * @returns {this} itself for function call chaining
   */
  link(reg_super, reg_el, value_ref, value_key) {
    super.link(reg_super, reg_el);
    this._value_ref = value_ref;
    this._value_key = value_key;
    return this;
  }
  _on_link_post() {
    this.render_checksum_add_tracked("regin_value_ref", () => {
      return this._value_ref[this._value_key];
    });
  }
  /**
   * Add a handler that will be called whenever the value for this input updates as a result of an action
   * taken by the user.
   * 
   * @param {Function} fn A function to call when the value for this object updates. Arg: new value
   */
  add_value_update_handler(fn) {
    this._value_update_handlers.push(fn);
  }
  /**
   * @protected
   * This should be called the child class whenever the 'value' for this input is altered by the user via
   * the 'view' (e.g. the DOM rendered by the browser) as frequently as possible. For an <input> tag, this
   * would be every keystroke, etc.
   * 
   * Commonly, this will take the form:
   * `$el.addEventListener("input", (e) => {this.view_alters_value($el.value)});`
   * 
   * @param {*} value Whatever the value has changed to.
   */
  _view_alters_value(value) {
    if (this._debouncer_duration) {
      this._debouncer_count++;
      window.setTimeout(function(original_debouncer_count, original_value) {
        if (this._debouncer_count == original_debouncer_count) {
          this._view_alters_value_prosecute_update(original_value);
          this._debouncer_count = 0;
        }
      }.bind(this, this._debouncer_count, value), this._debouncer_duration * 1e3);
    } else {
      this._view_alters_value_prosecute_update(value);
    }
  }
  /**
   * @private
   * 
   * Called whenever value has actually changed post debouncer. At this stage, local value settings (model)
   * is always altered to match. Then validation (if configured) occurs.
   * 
   * If validation fails for the current input, the local value (e.g. this.settings.value) will match but
   * the new value will NOT be propagated 'upwards' to the superregion until the user corrects it.
   * 
   * @param {*} value Whatever the value has changed to.
   */
  _view_alters_value_prosecute_update(value) {
    this.settings.value = value;
    if (this._val_fn && !this._val_fn(value)) {
      this.settings.val_failure_state = true;
    } else {
      this.settings.val_failure_state = false;
      this._view_alter_propagate(value);
    }
    this.render();
  }
  /**
   * @private
   * 
   * Actually propagate the new value upwards to the model/settings of the superregion and re-render it.
   * 
   * @param {*} value Whatever the value has changed to. Will be validated if validation is enabled.
   */
  _view_alter_propagate(value) {
    this._value_ref[this._value_key] = value;
    this.superregion.render();
    this._value_update_handlers.forEach((fn) => {
      fn(value);
    });
  }
  /**
   * Provide a validation function to this class, against which all user-input data will be validated.
   * The function should take one argument (the value) and return true/false depending on whether the data
   * was valid.
   * 
   * For example, a validation function to ensure input was a Number might resemble:
   * `(value)=>{return (!isNaN(value))}`
   * 
   * If validation is enabled and input fails, then the value the user input will still wind up in
   * `this.settings.value`. However, it will not propagate upwards to `superregion.settings` until the
   * user fixes it. While the input is in this 'validation failure' mode, the configured 'validation notice'
   * element will be shown.
   * 
   * @param {Function} fn The function to validate input values with.
   * @param {string} failure_text The text that will appear in the 'error' notice given to the user.
   */
  validation_set(fn, failure_text) {
    this._val_fn = fn;
    this._val_fail_text = failure_text;
  }
  /**
   * Set the validation notice element manually. This element will be shown() when the input region is
   * in 'validation failure' state and hidden when it is not. The innerHTML of this element will be set
   * to a message describing the failure.
   * 
   * By default, all input regions have *some sort* of validation failure notice mechanism. The absolute
   * default is to automatically generate a floating <div> tag. *Good* implementations of RegIn subclasses
   * will define one in their Fabricators. However, if this method is called a custom one may be provided.
   * 
   * @param {HTMLElement} el_notice A notice element to hide() and show() as needed.
   */
  validation_notice_setup(el_notice) {
    _val_fail_notice_ovr = RHElement.wrap(el_notice);
  }
  /**
   * This will get the validation failure notice element, or generate it if it did not exist.
   * 
   * The fallbacks are as follows
   * 1. Manual override is checked (e.g. validation_notice_setup())
   * 2. Local already-set-up copy is checked (generated by Fabricator and stored at this._val_notice)
   * 3. Local copy is generated
   * 
   * @returns {RHElement} The validation notice element to use for this input.
   */
  _val_notice_get() {
    if (this._val_fail_notice_ovr) return this._val_fail_notice_ovr;
    if (this._val_fail_notice_base) return this._val_fail_notice_base;
    let notice = document.createElement("div");
    notice.style.position = "absolute";
    notice.style.backgroundColor = "white";
    notice.style.padding = "2px";
    this._val_fail_notice_base = RHElement.wrap(notice);
    return this._val_fail_notice_base;
  }
  /**
   * Set a debouncer for this input. When a debouncer is active, a series of view-value alterations that occurs
   * with no more than the debouncing delay between updates will all be considered one update. This can be
   * helpful when we don't wish to incur too many render() updates as values change.
   * 
   * @param {Number} duration_s The number of seconds to use when debouncing, or undefined to disable.
   */
  debouncer_set(duration_s) {
    this._debouncer_duration = duration_s;
  }
  /**
   * @protected
   * This is called whenever this specific region has its settings refreshed. This is the preferred location
   * to setup settings information in a Region subclass.
   */
  _on_settings_refresh() {
    this.settings.value = void 0;
    this.settings.val_failure_state = false;
  }
  /**
   * Completely redraw this region and all active subregions. Overridden here to selectively pull from
   * super-region settings value if it has changed from last time we pulled it.
   */
  render(force) {
    if (!this.settings.val_failure_state) {
      this.settings.value = this._value_ref[this._value_key];
    }
    super.render(force);
  }
  /**
   * @protected
   * This is called whenever this specific region has its settings refreshed. This is the preferred location
   * to actually place the code that will 'redraw' a region.
   * 
   * Don't forget to call super() on child classes!
   */
  _on_render() {
    this._val_notice_get().innerHTML = this._val_fail_text;
    this.settings.val_failure_state ? this._val_notice_get().show() : this._val_notice_get().hide();
  }
};

// src/regional/regions/reg_in_input.js
var RegInInput = class extends RegIn {
  /** @type {RHElement} The input tag reference */
  input;
  fab_get() {
    let css = (
      /* css */
      `
			[rfm_reg="RegInInput"] {
				/* Hold the text area and search box vertically in a column. */
				& .val-notice {
					position: absolute;
					padding: 2px;
					border: 1px solid grey;
					border-radius: 5px;
					color: red;
					background-color: white;
					display: none;
				}
			}
		`
    );
    let html = (
      /* html */
      `
			<input rfm_member='input'>
			<div rfm_member='val_notice' class='val-notice'></div>
		`
    );
    return new Fabricator(html).add_css_rule(css);
  }
  /**
   * This is called after linking is complete. It is used here to bind events.
   */
  _on_link_post() {
    this.input.addEventListener("input", () => {
      this._view_alters_value(this.input.value);
    });
  }
  /**
   * Helper method to setup validation for this input that will require the input to be a number.
   * 
   * @param {string} [failure_text] Optional special failure text to display to user. If not provided, a
   * 		generic message will be returned.
   */
  validation_set_number(failure_text) {
    if (!failure_text) failure_text = "Input must be a number.";
    this.validation_set((value) => {
      return !isNaN(value);
    }, failure_text);
  }
  /**
   * Helper method to setup validation for this input that will require the input to be a validly parsable
   * email.
   * 
   * @param {string} [failure_text] Optional special failure text to display to user. If not provided, a
   * 		generic message will be returned.
   */
  validation_set_email(failure_text) {
    if (!failure_text) failure_text = "Email is not in valid form.";
    this.validation_set(validate_email, failure_text);
  }
  /**
   * Helper method to setup validation for this input that will require the input to be a number between
   * or equal to the two provided values.
   * 
   * @param {Number} low The low value for the range this number can be
   * @param {Number} high The high value for the range this number can be
   * @param {string} [failure_text] Optional special failure text to display to user. If not provided, a
   * 		generic message will be returned.
   */
  validation_set_number_clamped(low, high, failure_text) {
    if (!failure_text) failure_text = "Input must be a number between " + low + " and " + high + ".";
    this.validation_set((value) => {
      if (isNaN(value)) return false;
      num = Number(value);
      return low <= num && num <= high;
    }, failure_text);
  }
  _on_render() {
    super._on_render();
    this.input.value = this.settings.value;
  }
};

// src/regional/regions/reg_in_checkbox.js
var RegInCheckbox = class extends RegIn {
  fab_get() {
    let css = (
      /* css */
      `
			[rfm_reg="RegInCheckbox"] {
				/* Hold the text area and search box vertically in a column. */
				& .cont {
				}
				& .checkbox {
				}
			}
		`
    );
    let html = (
      /* html */
      `
			<div rfm_member="cont">
				<input rfm_member="checkbox" type="checkbox">
			</div>
		`
    );
    return new Fabricator(html).add_css_rule(css);
  }
  /** @type {RHElement} The input with type="checkbox" */
  checkbox;
  /** @type {RHElement} The input container <div> */
  cont;
  /** @type {String} A secondary identifier that's only used when this checkbox is in a radio group */
  _radio_cb_value;
  /** @type {RadioGroup} The radio group that this checkbox belongs to, if a radio group has been setup */
  _radio_group;
  /**
   * This is called after linking is complete. It is used here to bind events.
   */
  _on_link_post() {
    this.checkbox.addEventListener("input", () => {
      this._view_alters_value(this.checkbox.checked);
    });
    this.render_checksum_add_tracked("regin_cb_radio_value_ref", () => {
      if (this._radio_group != void 0) return this._radio_group._value_ref[this._radio_group._value_key];
      return 0;
    });
  }
  _on_settings_refresh() {
    this.settings.value = false;
  }
  _on_render() {
    super._on_render();
    this.checkbox.checked = this.settings.value;
  }
  /**
   * This method will bind together a set of checkbox regions to mimic the behavior of a set of radio buttons.
   * When one is checked, the others will all be made unchecked. The value ref will always be set to the
   * currently checked checkbox's value or undefined if none are checked.
   * 
   * @param {Array.<RegInCheckbox>} checkboxes A set of checkboxes to tie together
   * @param {Array.<String>} cb_values A corresponding list of 'values' which will be used to indicate
   * 		which checkbox is currently selected.
   * @param {Object} value_ref Reference to object in which region input value is stored. See above.
   * @param {String} value_key The key in `value_ref` at which value is stored: `value_ref[value_key] = value`
   * 
   * @returns {RadioGroup} Formed of these checkboxes.
   */
  static combine_into_radio(checkboxes, cb_values, value_ref, value_key) {
    return new RadioGroup(checkboxes, cb_values, value_ref, value_key);
  }
};
var RadioGroup = class {
  /** @type {RegionSwitchyard} */
  swyd;
  /**
   * Create a new radio button group formed of the checkboxes provided.
   * 
   * @param {Array.<RegInCheckbox>} checkboxes A set of checkboxes to tie together
   * @param {Array.<String>} cb_values A corresponding list of 'values' which will be used to indicate
   * 		which checkbox is currently selected.
   * @param {Object} value_ref Reference to object in which region input value is stored. See above.
   * @param {String} value_key The key in `value_ref` at which value is stored: `value_ref[value_key] = value`
   */
  constructor(checkboxes, cb_values, value_ref, value_key) {
    if (checkboxes.length != cb_values.length) throw new Error("Number of boxes and values must match.");
    this._checkboxes = checkboxes;
    this._cb_values = cb_values;
    this._value_ref = value_ref;
    this._value_key = value_key;
    this._checkboxes[0].render_add_handler(() => {
      this._on_superregion_render();
    });
    this.swyd = this._checkboxes[0].swyd;
    this._value_update_handlers = [];
    checkboxes.forEach((checkbox, i) => {
      if (checkbox._radio_group != void 0) throw new Error("Checkbox already has radio group!");
      checkbox._radio_cb_value = cb_values[i];
      checkbox.add_value_update_handler((new_value) => {
        this._on_checkbox_value_altered(checkbox, new_value);
      });
      checkbox._radio_group = this;
    });
    this._state_set_context = false;
  }
  /**
   * Add a handler that will be called whenever the value for this input updates as a result of an action
   * taken by the user.
   * 
   * @param {Function} fn A function to call when the value for this object updates. Arg: new value
   */
  add_value_update_handler(fn) {
    this._value_update_handlers.push(fn);
  }
  /**
   * Called when the value for a checkbox updates.
   * 
   * @param {RegInCheckbox} checkbox The checkbox that changed
   * @param {*} new_value 
   */
  _on_checkbox_value_altered(checkbox, new_value) {
    if (this._state_set_context) return;
    try {
      this._state_set_context = true;
      if (new_value) {
        this._group_state_set_from_value(checkbox._radio_cb_value);
      } else {
        this._group_state_set_from_value(void 0);
      }
      let state = this._group_state_get();
      this._value_update_handlers.forEach((handler) => {
        handler(state);
      });
      this._value_ref[this._value_key] = state;
      this.swyd.render();
    } finally {
      this._state_set_context = false;
    }
  }
  /**
   * Called when the first checkbox has its _on_render() called. This is
   * used to update the checkbox group if the value_ref is changed programmatically.
   */
  _on_superregion_render() {
    if (!this._state_set_context && this._group_state_get() != this._value_ref[this._value_key]) {
      this._state_set_context = true;
      try {
        this._group_state_set_from_value(this._value_ref[this._value_key]);
      } finally {
        this._state_set_context = false;
      }
    }
  }
  /**
   * Set the states of all checkboxes on the basis of the provided 'selected' value.
   * 
   * @param {String} cb_value Value of checkbox to select, or undefined to unselect all.
   */
  _group_state_set_from_value(cb_value) {
    if (cb_value != void 0 && this._cb_values.indexOf(cb_value) == -1) {
      throw new Error(`Value ${cb_value} does not correspond to any checkboxes in group.`);
    }
    this._checkboxes.forEach((regin_cb) => {
      if (cb_value != void 0 && regin_cb._radio_cb_value == cb_value) {
        regin_cb._view_alters_value(true);
      } else {
        regin_cb._view_alters_value(false);
      }
    });
  }
  /**
   * Infer what the state of the radio group should be on the basis of what is selected.
   * 
   * @returns {String} The cb_value of the currently selected checkbox or 'undefined'.
   */
  _group_state_get() {
    let out = void 0;
    this._checkboxes.forEach((regin_cb) => {
      if (regin_cb.settings.value) {
        out = regin_cb._radio_cb_value;
      }
    });
    return out;
  }
};

// src/regional/regions/reg_in_textarea.js
var RegInTextArea = class _RegInTextArea extends RegIn {
  /** @type {RHElement} */
  textarea;
  /** @type {Boolean} Whether or not the more complex tab-behavior is enabled. */
  tab_enabled;
  /** @type {Array} A list of states, in order from newest to oldest, that this textarea has had. */
  _undo_states;
  /** @type {Array} A list of states, in order from newest to oldest, that we have 'undone'. */
  _redo_states;
  /** @type {Number} The max number of undo states that will be stored at a time */
  _undo_max_states;
  constructor(...args) {
    super(...args);
    this.tab_enabled = true;
    this._undo_states = [];
    this._undo_max_states = 20;
  }
  fab_get() {
    let css = (
      /* css */
      `
			[rfm_reg="RegInTextArea"] {
				/* Hold the text area and search box vertically in a column. */
				& .textarea {
					box-sizing: border-box;
					resize: none;
					height: 100%;
					width: 100%;
					tab-size: 4;
				}
			}
		`
    );
    let html = (
      /* html */
      `
			<textarea rfm_member='textarea' class='textarea' spellcheck="false"></textarea>
		`
    );
    return new Fabricator(html).add_css_rule(css);
  }
  /**
   * This is called after linking is complete. It is used here to bind events.
   */
  _on_link_post() {
    this.textarea.addEventListener("input", (e) => {
      this._view_alters_value(this.textarea.value);
    });
    this.textarea.addEventListener("keydown", (e) => {
      let start = this.textarea.selectionStart, end = this.textarea.selectionEnd;
      this.settings.selmem = { start, end };
      if (this.tab_enabled && e.key == "Tab") {
        e.preventDefault();
        let out;
        if (e.shiftKey) {
          out = _RegInTextArea._text_shift_tab_behavior_alter(this.textarea.value, start, end);
        } else {
          out = _RegInTextArea._text_tab_behavior_alter(this.textarea.value, start, end);
        }
        this.textarea.value = out.text;
        this.textarea.selectionEnd = out.selend;
        this.textarea.selectionStart = out.selstart;
        this._view_alters_value(this.textarea.value);
      }
      if (this.tab_enabled && e.key == "Enter") {
        e.preventDefault();
        let out = _RegInTextArea._text_newline_behavior_alter(this.textarea.value, start, end);
        this.textarea.value = out.text;
        this.textarea.selectionEnd = out.selend;
        this.textarea.selectionStart = out.selstart;
        this._view_alters_value(this.textarea.value);
      }
      if (e.ctrlKey && e.code == "KeyZ") {
        e.preventDefault();
        this.undo();
      }
      if (e.ctrlKey && e.code == "KeyY") {
        e.preventDefault();
        this.redo();
      }
    });
  }
  get sel() {
    return `<${this.textarea.selectionStart}:${this.textarea.selectionEnd}>`;
  }
  /**
   * Extended here to capture undo / redo state.
   */
  _view_alters_value_prosecute_update(value) {
    this._undo_state_add(this.settings.value);
    this._redo_states = [];
    super._view_alters_value_prosecute_update(value);
    this.settings.sel = { start: this.textarea.selectionStart, end: this.textarea.selectionEnd };
  }
  /**
   * Causes this textarea to revert to the most recent 'undo' state. This includes the content and the
   * selection locations.
   */
  undo() {
    let state = this._undo_states.shift();
    if (state == void 0) return;
    this._redo_state_add(this.settings.value);
    this.settings.value = state.value;
    this._view_alter_propagate(state.value);
    this.textarea.selectionStart = state.sel.start;
    this.textarea.selectionEnd = state.sel.end;
  }
  /**
   * Causes this textarea to re-revert back up the 'redo' chain of 'undo' states that have resulted from
   * a series of 'undo' operations. The 'redo' chain only exists after a series of consecutive undo
   * operations has occured and before further action from the view has taken place.
   */
  redo() {
    let state = this._redo_states.shift();
    if (state == void 0) return;
    this._undo_state_add(this.settings.value);
    this.settings.value = state.value;
    this._view_alter_propagate(state.value);
    this.textarea.selectionStart = state.sel.start;
    this.textarea.selectionEnd = state.sel.end;
  }
  /**
   * Add an 'undo' state to the list. This will become the most recent state. If the undo state list is long
   * enough, the oldest previous state will be removed. A true copy will be created, all references purged.
   * 
   * @param {*} value Some value, which should correspond to this.settings.value. Must be JSON-serializable
   */
  _undo_state_add(value) {
    this._undo_states.unshift(JSON.parse(JSON.stringify(
      {
        sel: { start: this.settings.selmem.start, end: this.settings.selmem.end },
        value
      }
    )));
  }
  /**
   * Add a 'redo' state to the list. The 'redo' list is only available when a series of 'undo's have just
   * occurred. The moment that another 'undo' state is added, the 'redo' state is cleared and no longer
   * available.
   * 
   * @param {*} value Some value, which should correspond to this.settings.value. Must be JSON-serializable
   */
  _redo_state_add(value) {
    this._redo_states.unshift(JSON.parse(JSON.stringify(
      {
        sel: { start: this.settings.selmem.start, end: this.settings.selmem.end },
        value
      }
    )));
  }
  /**
   * This implements a different newline event behavior for the textarea. In this behavior, newline inserts
   * a newline **followed by the same number of tabs** as the preceeding line has before any text.
   * 
   * @param {String} text Text at the start of the newline event.
   * @param {Number} selstart The index, in the string, of selection start
   * @param {Number} selend The index, in the string, of the selection end
   * 
   * @returns {Object} With keys: text, selstart, selend for the new configuration of this text selection.
   */
  static _text_newline_behavior_alter(text, selstart, selend) {
    let out = { text: "" };
    let text_i = selstart - 1, n_tabs = 0;
    while (text_i >= 0) {
      if (text[text_i] == "	") n_tabs += 1;
      if (text[text_i] == "\n") break;
      text_i--;
    }
    let inserted = "\n";
    for (let x = 0; x < n_tabs; x++) {
      inserted += "	";
    }
    out.text = text.substring(0, selstart) + inserted + text.substring(selend);
    out.selstart = selstart + inserted.length;
    out.selend = out.selstart;
    return out;
  }
  /**
   * Determine how to modify text in a textarea as the result of a tab keydown even in which SHIFT is not held.
   * 
   * If selection is a point, a tab is inserted.
   * If selection is a one-line range, then the range is deleted and tab is inserted.
   * If selection is a multi-line range, tabs are inserted at the start of all lines and no text is deleted.
   * 
   * @param {String} text The value of the text when this behavior event occurred
   * @param {Number} selstart The index, in the string, of selection start when event occurred
   * @param {Number} selend The index, in the string, of the selection end when the event occurred
   * 
   * @returns {Object} With keys: text, selstart, selend for the new configuration of this text selection.
   */
  static _text_tab_behavior_alter(text, selstart, selend) {
    let out = { text: "" };
    if (selstart == selend) {
      out.text = text.substring(0, selstart) + "	" + text.substring(selend);
      out.selstart = selstart + 1;
      out.selend = out.selstart;
      return out;
    }
    let seltext = text.substring(selstart, selend);
    if (seltext.indexOf("\n") == -1) {
      out.text = text.substring(0, selstart) + "	" + text.substring(selend);
      out.selstart = selstart + 1;
      out.selend = out.selstart;
    } else {
      let selected_lines = _RegInTextArea._text_get_selected_lines(text, selstart, selend);
      out.text = text;
      selected_lines.reverse().forEach((first_char_i) => {
        if (first_char_i == text.length) {
          out.text += "	";
        } else {
          out.text = out.text.substring(0, first_char_i) + "	" + out.text.substring(first_char_i);
        }
      });
      out.selend = selend + selected_lines.length;
      out.selstart = selstart;
    }
    return out;
  }
  /**
   * Determine how to modify text in a textarea as the result of a tab event in which SHIFT is also held.
   * 
   * If selection is a point following a tab character, the character is removed.
   * If selection is a one-line range, nothing occurs
   * If selection is a multi-line range, all lines with a tab character at the start of the line have that
   *    tab character removed.
   * 
   * @param {String} text The value of the text when this behavior event occurred
   * @param {Number} selstart The index, in the string, of selection start when event occurred
   * @param {Number} selend The index, in the string, of the selection end when the event occurred
   * 
   * @returns {Object} With keys: text, selstart, selend for the new configuration of this text selection.
   */
  static _text_shift_tab_behavior_alter(text, selstart, selend) {
    let out = { text: "" };
    if (selstart == selend) {
      if (text.indexOf("	") != -1)
        out.text = text.substring(0, selstart - 1) + text.substring(selend);
      out.selstart = selstart - 1;
      out.selend = out.selstart;
      return out;
    }
    let seltext = text.substring(selstart, selend);
    if (seltext.indexOf("\n") == -1) return { "text": text, "selstart": selstart, "selend": selend };
    let selected_lines = _RegInTextArea._text_get_selected_lines(text, selstart, selend), n_remd = 0;
    out.text = text;
    selected_lines.reverse().forEach((first_char_i) => {
      if (first_char_i == text.length) {
      } else {
        if (out.text[first_char_i] == "	") {
          n_remd += 1;
          out.text = out.text.substring(0, first_char_i) + out.text.substring(first_char_i + 1);
        }
      }
    });
    out.selend = selend - selected_lines.length;
    out.selstart = selstart;
    return out;
  }
  /**
   * Get a list of selected-line start indices.
   * 
   * A line is 'selected' if any of the selection range touches this line. This includes the final
   * 'empty string' line. If there's a trailing newline that is selected, it will be given an index
   * that's actually NOT IN THE PROVIDED 'text' string. It will be equal to the length of the string.
   * 
   * @param {String} text Text to search through
   * @param {Number} selstart The index, in the string, of selection start
   * @param {Number} selend The index, in the string, of the selection end
   * 
   * @returns {Array.<Number>} A list of indices of the first character of each selected line.
   */
  static _text_get_selected_lines(text, selstart, selend) {
    let lines = text.split("\n"), line, text_i = 0, line_contained_selection = false, sel_line_indices = [], line_start = 0;
    for (let line_i = 0; line_i < lines.length; line_i++) {
      line_contained_selection = false;
      line = lines[line_i];
      line_start = text_i;
      for (let char_i = 0; char_i < line.length; char_i++) {
        if (line[char_i] != text[text_i]) throw "DEVCHECK";
        if (selstart <= text_i && text_i <= selend + 1) line_contained_selection = true;
        text_i += 1;
      }
      if (selstart <= text_i && text_i <= selend + 1) line_contained_selection = true;
      if (line_contained_selection) {
        sel_line_indices.push(line_start);
      }
      if (line_i != lines.length - 1) {
        text_i += 1;
      }
    }
    return sel_line_indices;
  }
  /**
   * Extended to add the selection flags. These are needed for UNDO / REDO tracking.
   */
  _on_settings_refresh() {
    this.settings.selmem = { start: 0, end: 0 };
  }
  _on_render() {
    super._on_render();
    this.textarea.value = this.settings.value;
  }
};

// src/regional/lib/dispatch.js
var DispatchClientJS = class {
  /**
   * Initialize a dispatch client which can communicate with a central dispatch server. This client will be assigned
   * a unique session id and all requests to the server will have this ID associated with it.
   * This client adheres to the JSONRPC 2.0 standard for communication.
   * 
   * @param {String} server_domain The absolute URL that points to the domain of this dispatch server (e.g. https://www.theroot.tech)
   * @param {String} dispatch_route The route to the dispatch request handler. Default "/_dispatch"
   * @param {String} client_name Client namespace to operate under. Default is 'js'
   * @param {Boolean} verbose Whether or not to print log messages. Default is True
   */
  constructor(server_domain, dispatch_route = "/_dispatch", client_name = "js", verbose = 1) {
    this.dispatch_url = server_domain + dispatch_route;
    this.base_url = server_domain;
    this.verbose = verbose;
    this.client_name = client_name;
    this.session_id = this.gen_session_id();
    this.foreign_type = "js";
    this.base_data = {};
    this.client_functions = {};
    this.server_functions = [];
    this._cookies = {};
    this.csrf_token = void 0;
    this.polling_fast = 1;
    this.polling_slow = 5;
    this.request_timeout = 10;
    this.log_debug("Initialized to point at " + this.dispatch_url + " with session ID: " + this.session_id);
  }
  /**
   * Call this on a dispatch client instance only once to set up the mapping
   * of available functions on the backend.
   * 
   * It is not neccessary to use this function. It's perfectly appropriate to never call this and to use
   * call_server_function() instead.
   * 
   * @returns {Promise} A promise which will resolve when the backend functions have been queried.
   */
  setup_backend_functions() {
    return new Promise((res, rej) => {
      this.call_server_function("__dispatch__get_functions").then((result) => {
        this.server_functions = result;
        this.log_debug("Found " + this.server_functions.length + " server functions.");
        this.server_functions.forEach((fname) => {
          this[fname] = /* @__PURE__ */ function(c_ref_fname) {
            return function(...rest_args) {
              return this.call_server_function(c_ref_fname, ...rest_args);
            };
          }(fname);
          this.log_debug(fname);
        });
        res();
      }).catch((error) => {
        throw "DISPATCH ERROR: C" + error.code + ": '" + error.message + "'";
      });
    });
  }
  /**
   * Provide a csrf token to append to all requests which originate from this dispatch client.
   * 
   * @param {String} csrf_token The csrf token to append to all requests
   */
  setup_csrf(csrf_token) {
    this.log_debug("Added csrf token '" + csrf_token + "' to dispatch.");
    this.csrf_token = csrf_token;
  }
  /**
   * Call a function on the running dispatch backend associated with this client. This function call will be provided
   * with all given arguments.
   * 
   * @param {string} function_name The name of the backend function to call
   * @param  {...*} args Any number of arguments to provide to the backend function. Keyword arguments are not supported.
   * 
   * @returns {Promise} A promise that will resolve with the JSONRPC 'result' object or reject with the error
   */
  call_server_function(function_name, ...args) {
    var params = encodeURIComponent(JSON.stringify(args)), permanent_data = encodeURIComponent(JSON.stringify(this.base_data));
    var data2 = {
      "jsonrpc": "2.0",
      "method": function_name,
      "params": params,
      "id": this.session_id,
      "__dispatch__permanent_data": permanent_data
    };
    var debug_datastring = JSON.stringify(data2), mlen = Math.min(debug_datastring.length, 256);
    if (function_name != "__dispatch__client_poll") {
      this.log_debug("Calling " + function_name + " with " + debug_datastring.substring(0, mlen));
    }
    return new Promise((res, rej) => {
      this.get_json(this.dispatch_url, data2).then((response_data) => {
        var result = response_data.result;
        var error = response_data.error;
        if (result != void 0) {
          res(result);
        } else if (error != void 0) {
          console.error(error);
          rej(error);
        } else {
          console.error(response_data);
          throw "Neither result nor error defined in dispatch response.";
        }
      }).catch((code, message) => {
        if (code >= 300 && code < 500) {
          console.error("Server returns code '" + code + "' when attempting dispatch request. Check that client is configured properly.");
        } else if (code >= 500 && code < 600) {
          console.error("Server returns code '" + code + "' when attempting dispatch request. Check that server is configured properly.");
        } else {
          throw "Unhandled http response code '" + code + "'";
        }
        rej(code, message);
      });
    });
  }
  /**
   * A pure javascript method to send a POST request to a url with some data.
   * 
   * @param {String} url The url to send the post request to
   * @param {Object} data A set of key/value pairs with post parameters and data. All post parameter values
   * 	should be in forms that can be directly converted to a string (so not Object or Array)
   * 
   * @returns {Promise} A promise that will resolve upon receiving a 200 with the result data
   * 	or reject (upon non-200) with arguments (code, message)
   */
  get_json(url, data2) {
    return new Promise((res, rej) => {
      var xhr = new XMLHttpRequest();
      var param_string = "";
      for (const [key, val] of Object.entries(data2)) {
        param_string += encodeURIComponent(key) + "=" + encodeURIComponent(val) + "&";
      }
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      if (this.csrf_token != void 0) {
        xhr.setRequestHeader("X-CSRFToken", this.csrf_token);
      }
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
          if (xhr.status === 200) {
            res(JSON.parse(xhr.responseText));
          } else {
            rej(xhr.status, xhr.responseText);
          }
        }
      };
      xhr.send(param_string);
    });
  }
  /**
   * Set the polling interval.
   * 
   * @param {Number} interval Number of seconds between polls. 
   */
  polling_set_frequency(interval) {
    this._polling_enable(interval);
  }
  /**
   * Set dispatch polling to the faster rate.
   */
  polling_set_fast() {
    this.polling_set_frequency(this.polling_fast);
  }
  /**
   * Set dispatch polling to the slower rate.
   */
  polling_set_slow() {
    this.polling_set_frequency(this.polling_slow);
  }
  /**
   * Enable polling to communicate with server and check for server-initiated function calls. This function
   * may be called any number of times to change the polling interval dynamically.
   * @param {Number} poll_interval The amount of seconds between polls
   */
  _polling_enable(poll_interval) {
    this._polling_disable();
    this.polling_fn_id = window.setInterval(this._polling_function.bind(this), poll_interval * 1e3);
  }
  /**
   * Disables polling and does cleanup. Safe to call even if polling is not happening.
   */
  _polling_disable() {
    if (this.polling_fn_id != void 0) {
      window.clearInterval(this.polling_fn_id);
      this.polling_fn_id = void 0;
    }
  }
  /**
   * This is the function that is called every time the poll interval has passed. It is responsible for
   * communicating with the server to determine if any server-initiated function calls have occurred.
   */
  _polling_function() {
    this.call_server_function("__dispatch__client_poll", this.session_id, this.client_name).then((result) => {
      var function_blocks = result.queued_functions;
      function_blocks.forEach((function_block) => {
        this.client_call_bound_function(function_block.fname, function_block.args);
      });
    }).catch((e) => {
      console.warn("Standard poll has failed");
      console.warn(e);
    });
  }
  /**
   * Call a function which has been bound using client_bind_function(). This is generally called by
   * polling when the server instigates a function call.
   *
   * @param {String} function_name The name of the function to call
   * @param {Array} args A list of arguments to be provided to the function when we call it 
   */
  client_call_bound_function(function_name, args) {
    var fn = this.client_functions[function_name];
    if (fn == void 0) {
      this.log("Warning: Server attempts to call unbound frontend function '" + function_name + "'");
      return;
    }
    var print_args = JSON.stringify(args);
    if (print_args.length > 256) print_args = print_args.substring(0, 256) + "...";
    this.log_debug("Calling frontend function: " + function_name + print_args);
    fn.apply(null, args);
  }
  /**
   * Bind a function to this client so the server can call it. For now, the return value of this
   * function is entirely ignored.
   * @param {Function} frontend_fn The function to be called, with some sort of 'self' context bound
   * @param {String} function_name Can be provided to set a specific name for a function.
   * 		This must be provided for anon functions. Default is to use the given name of the provided function.
   */
  client_bind_function(frontend_fn, function_name) {
    var name = function_name || frontend_fn.name;
    if (name == "anonymous" || name == "") {
      if (function_name == void 0) {
        throw "GPQERROR: Function name not provided when binding function " + frontend_fn;
      }
      name = function_name;
    }
    if (name.substring(0, 6) == "bound ") {
      name = name.substring(6);
    }
    this.log_debug("Binding dispatch callable function '" + function_name + "'");
    this.client_functions[name] = frontend_fn;
  }
  /**
   * Modify a post request data block to have any base_data and perhaps to prevent caching.
   * 
   * @param {Object} request_data The key-value dict that is sent to the server in the POST request
   * @param {Boolean} prevent_caching OPTIONAL: If true, add a special param to prevent caching. Default True.
   */
  prep_data(request_data, prevent_caching) {
    prevent_caching = prevent_caching || 1;
    if (prevent_caching) {
      request_data.__dispatch__cache_bust = (/* @__PURE__ */ new Date()).getTime();
    }
    request_data = Object.assign({}, request_data, this.base_data);
    return request_data;
  }
  /**
   * Get a very-likely-to-be-unique hash ID for this 'session'. This hash is used on the backend to determine
   * which browser window from which a request originates. While this ID is not guaranteed to be unique,
   * it is extremely unlikely it will overlap with another. Even if it does, the problem will be temporary
   * and will be solved next time the page is refreshed.
   */
  gen_session_id() {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 25; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  /**
   * Log a message, but only in verbose mode.
   * @param {String} message A message to be printed
   */
  log_debug(message) {
    if (this.verbose) {
      console.log(message);
    }
  }
  /**
   * Log a message whether verbose or not.
   * @param {String} message A message to be printed
   */
  log(message) {
    console.log(message);
  }
};

// src/regional/regions/reg_sw.js
var RegionSwitchyard = class extends Region {
  /**
   * Instantiate a new Switchyard region. A webapp should have only one instance of this for a page at
   * a time.
   * 
   * The creation process for a Switchyard region is similar to any region, but with an extra step:
   * 1. Instantiate, which does nothing but setup memory
   * 2. Fabricate, which will often do nothing as for all but the smallest applications it makes more
   *    sense to break the visuals of the page into at least one layer of regions below the switchyard.
   * 3. Link, which is a little different from a subregion as there's no super-region for a switchyard.
   *    Literal linking-into-DOM is also optional. See link()'s description for more info.
   * 4. Load, which kicks of a chain of loading operations to pull down data, setup dispatch, etc.
   * 
   * It's good practice to extend this constructor in a child class to setup type definitions for subregions
   * and datahandlers. See example site. TODO
   */
  constructor() {
    super();
    this._loading = false;
    this.config = {
      /** @description The base z-index of an ethereal region (overlay) */
      z_index_eth_base: 100
    };
    this.dispatch_config = {
      /** @description The domain to point Dispatch requests at. Defaults to page domain. */
      domain: window.location.origin,
      /** @description The route that dispatch aims at. The default is /_dispatch. */
      route: "/_dispatch",
      /** @description The 'namespace' that this regional application operates under */
      namespace: "js",
      /** @description Whether to print logs in verbose mode. */
      verbose: false,
      /**
       * @description Whether or not to load functions from server, increasing load times but improving
       * syntax for backend calls.
       * */
      load_functions: 0
    };
    this._focus_settings = {
      /** @description The currently in-focus region. can be undefined. */
      region: void 0,
      /** @description A timestamp used to prevent focus propagation. */
      timestamp: void 0
    };
    this._id_gen_map = {};
    this._call_on_load = [];
    this._css_setup();
    this._setup_key_events();
    this.clipboard = new Clipboard(this);
    document.addEventListener("click", (e) => {
      this.clipboard.deselect();
    });
    this._dragdata = { component: void 0 };
    this._registered_anchors = {};
    window.addEventListener("hashchange", (e) => {
      this._anchor_on_hash_change(1);
    });
    this._anchors_ignore_next = 0;
    this._anchor_hash_on_load = document.location.hash.replace("#", "");
    this.anchors_disable = 0;
  }
  /**
   * Linking for a Switchyard is substantially different from regular regions. The link method
   * is entirely overridden and performs only a subset of actions. Furthermore, it's not a requirement
   * to actually have linking element in the DOM. A Switchyard can be 'DOMless' with no literal
   * DOM connection, if so desired.
   * 
   * Linking operations for the switchyard includes:
   * + Link this region to the specific element in webpage DOM that it represents.
   * + Assign a unique in-memory ID for this region and set the reg_el's ID to the same.
   * + Fabrication links (if fab() was called earlier), including links to this.$element and linking $elements
   *   to the reg_el.
   * 
   * @param {HTMLElement} reg_el The DOM element for the switchyard, or undefined to leave it 'DOMless'
   * 
   * @returns {this} itself for function call chaining
   */
  link(reg_el) {
    if (reg_el === void 0) {
      reg_el = document.createElement("div");
    }
    this.reg = reg_el;
    this.reg.setAttribute("rfm_reg", this.constructor.name);
    this.swyd = this;
    this._link_ids();
    this._link_fabricate();
    this._create_datahandlers();
    this._create_subregions();
    this._on_link_post();
    return this;
  }
  /**
   * @abstract
   * 
   * This method should create all datahandlers that are needed for this application during the link()
   * phase of overall instantiation. This is called at the same time as _create_subregions() and only exists
   * to provide extra guidance as to the 'correct' place to define datahandlers.
   * 
   * Note that this function is NOT asynchronous. If the implementation desires datahandlers to have some
   * data available upon app load, use _load_datahandlers() as well.
   * 
   * Such a function might resemble:
   * _create_datahandlers()
   * {
   *     this.dh_one = new DHREST()
   *     this.dh_two = new DHTabuler()
   * 
   *     this.datahandler_subscribe([this.dh_one, this.dh_two])
   * }
   */
  _create_datahandlers() {
  }
  /**
   * This method is the primary data loader for the region structure. It will load the following in this order:
   * + Dispatch (which is instant unless configured to pull server methods)
   * + Anything special, which would be defined in a subclass of RegionSwitchyard
   * + Datahandlers as implemented in subclass. This may or may not result in actual loading, imp. dependent.
   * 
   * @returns {Promise} A promise that resolves when the app is fully loaded.
   */
  async load() {
    this.settings_refresh();
    this._loading = true;
    return this._load_dispatch().then(() => {
      this.on_loaded_dispatch();
      return this._load_special();
    }).then(() => {
      this.on_loaded_specials();
      return this._load_datahandlers();
    }).then(() => {
      this._loading = false;
      this.on_load_complete();
      this._call_on_load.forEach((fn) => fn());
      this._anchor_on_hash_change(0);
      this.render();
    }).catch((e) => {
      this.on_load_failed(e);
      throw e;
    });
  }
  /**
   * @returns {Boolean} True if this switchyard is asynchronously loading things and false otherwise
   */
  is_loading() {
    return this._loading;
  }
  /**
   * Called to initiate the dispatch BACKEND for this app if one is used. Other backend-communication methods
   * can be easily added to the _load_special() for each app, but dispatch is so prevalent among regional
   * applications that a special function will exist for it here.
   * 
   * This function will resolve immediately unless dispatch has been configured to load functions.
   * 
   *  @returns {Promise} A promise which loads dispatch.
   */
  async _load_dispatch() {
    return new Promise((res, rej) => {
      let csrf_token = this.token_get_csrf(), cfg = this.dispatch_config;
      this.dispatch = new DispatchClientJS(cfg.domain, cfg.route, cfg.namespace, cfg.verbose);
      this.dispatch.setup_csrf(csrf_token);
      if (cfg.load_functions) {
        this.dispatch.setup_backend_functions().then(res).catch(rej);
      } else {
        res();
      }
    });
  }
  /**
   * @abstract
   * Called to load any special resources which must exist before the regional structure can operate.
   * 
   * @returns {Promise} A promise which loads special resources.
   */
  async _load_special() {
    return Promise.resolve();
  }
  /**
   * @abstract
   * Overwrite in child class to setup datahandlers for this project. Use of this method is only required
   * if certain datahandlers MUST be available when load() completes. This is ultimately a convenience method
   * which can be used to, for example:
   * + Setup any tracking that is desired so data is available on load() completion.
   * + Call pull() so that tracked data is available.
   * 
   * ```
   * _create_datahandlers()
   * {
   *     this.dh_one = new DHREST()
   *     this.dh_two = new DHTabuler()
   * 
   *     this.datahandler_subscribe([this.dh_one, this.dh_two])
   * }
   * 
   * _load_datahandlers()
   * {
   *     this.dh_one.track_ids([1, 2, 3])
   * 
   *     return this.pull()
   * }
   * ```
   * 
   * @returns {Promise} A promise that will resolve when datahandlers are setup.
   */
  async _load_datahandlers() {
    return Promise.resolve();
  }
  /**
   * @abstract
   * Called when dispatch is loaded.
   */
  on_loaded_dispatch() {
  }
  /**
   * @abstract
   * Called when all special resources are loaded
   */
  on_loaded_specials() {
  }
  /**
   * @abstract
   * Called at the end of the _load() process. All data is loaded and regions are setup.
   */
  on_load_complete() {
  }
  /**
   * @abstract
   * Called if, at any point, the load fails for some reason.
   * 
   * @param {Error} e The error that caused load failure.
   */
  on_load_failed(e) {
  }
  /**
   * Register a function to be executed when the loading stage is complete. This will fire after the
   * post-load settings_refresh() but before the post-load render().
   * 
   * @param {Function} fn A function that will execute with no arguments when the loading stage is complete.
   */
  call_on_load(fn) {
    this._call_on_load.push(fn);
  }
  /**
   * @magic
   * Inject the custom CSS classes used by regional. All of these start with 'rcss', which is a sort
   * of magic token I suppose which generally shouldn't be used for classnames to prevent overlap.
   * 
   * Prater code workday:
   * Pigeons coo from nearby tree;
   * Bumblebees drift by.
   */
  _css_setup() {
    css_inject(
      /* css */
      `
			.rcss-eth {
				width: 100vw; height: 100vh;
				position: absolute;
				top: 0; left: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: rgba(25,25,25,0.65);
			}
		`
    );
  }
  /**
   * Get a new ID for the given namespace. This will always return a unique string ID for whatever namespace
   * is given. In fact, no namespace can be given and a unique namespace will still be returned.
   * 
   * @param {String} id_namespace Some identifying information, so this ID can be human-read more clearly
   */
  _id_get_next(id_namespace) {
    if (typeof dom_src === "string") throw TypeError("Namespace ID must be string. Was " + id_namespace);
    if (!(id_namespace in this._id_gen_map)) {
      this._id_gen_map[id_namespace] = 0;
    }
    this._id_gen_map[id_namespace] += 1;
    return id_namespace + this._id_gen_map[id_namespace];
  }
  // A unique number to slap on the end of requests for anti-caching.
  static get unique() {
    return (/* @__PURE__ */ new Date()).getTime();
  }
  /**
   * Modify a $.getJSON request data block to have a unique parameter which prevents caching.
   * @param {Object} request_data The key-value dict that is sent to the server in a $.getJSON request.
   */
  anticache(request_data) {
    request_data._ = RegionApp.unique;
    return request_data;
  }
  /**
   * Modify a plain URL (e.g. not a POST url) to have some random noise on the end that prevents it from
   * pulling out of cache.
   * @param {Object} url A plain url, like a src.
   */
  anticache_url(url) {
    return url + "?_=" + RegionApp.unique;
  }
  /**
   * @abstract
   * Get a CSRF token for this app. Behavior must be implemented in child app to work.
   * 
   * A CSRF token is not required for most RMF operations, but some key ones (like dispatch) will fail without it.
   */
  token_get_csrf() {
  }
  /**
   * Get the dispatch route url for this application. This function determines whether or not a dispatch backend will be loaded for this
   * app. This function is intended to be overwritten in applications which use dispatch
   * 
   * @returns {str} The route URL for this app's dispatch. Can be a full url like "http://www.aperture.com/_dispatch" or a relative one like
   * "/_dispatch"
   */
  dispatch_get_url() {
  }
  /**
   * Get the namespace which this app's dispatch instance should operate under.
   * 
   * @returns {str} The namespace string (see dispatch documentation)
   */
  dispatch_get_namespace() {
  }
  /**
   * Return the path to the dispatch module. This is defined by default as ../lib/dispatch.js but may be overridden in the app's child
   * class.
   */
  dispatch_get_module_path() {
    return "../lib/dispatch.js";
  }
  /**
   * Get the dispatch backend for this app. This will just return this._dispatch_backend if there is one. If not, an error will be thrown
   * 
   * @return {DispatchClientJS} dispatch instance of the connected backend for this app
   */
  get dispatch_backend() {
    if (this._dispatch_backend == void 0) {
      throw "App " + this.constructor.name + " has not defined a dispatch backend. Define a dispatch_get_url() method in the application class.";
    }
    return this._dispatch_backend;
  }
  /**
   * Call this to setup the listeners for focus. This is straightforward, but it belongs in the switchyard
   * rather than base region class because it is in the switchyard that all the data lives.
   * 
   * @param {Region} region 
   */
  _focus_region_setup_listeners(region) {
    this.reg.addEventListener("click", (e) => {
      if (e != void 0) {
        if (e.timeStamp == this._focus_settings.timestamp) {
          return;
        }
        this._focus_settings.timestamp = e.timeStamp;
      }
      this.swyd.focus_region_set(this);
    });
  }
  /**
   * Get the region that has most recently been brought into 'focus'. A region can be set as 'focused' if it is
   * activated, right clicked, or clicked. Note that this focus is independent of what the browser might
   * refer to as 'focused'.
   * 
   * @returns {Region} The currently in-focus region, or undefined if there is not one.
   */
  focus_region_get() {
    return this._focus_settings.region;
  }
  /**
   * Set the current focus region. This is called by the subregions when they are activated, right clicked, or
   * clicked.
   * 
   * //TODO write tests
   * 
   * @param {Region} region The region to set as focused
   */
  focus_region_set(region) {
    this._focus_settings.region = region;
  }
  /**
   * Key events in regional are handled slightly differently than other events. Normally, when a key event
   * occurs it will apply to anything 'content editable' like an input or a textarea. If nothing of the sort
   * is 'in focus', it ripples up until it hits the document.
   * 
   * For some regions, it's handy to capture key events for certain hotkey-type functions (CTRL+S to save, for
   * example). A keydown can not be directly bound to most tags that a reg is likely to be, so region-specific
   * keypress handling requires a bit of its own logic. The Switchyard has listening methods that specifically
   * propagate the event to all regions that are currently 'active'. When a keydown event occurs, unless it
   * is captured (for instance, by a focused input box) all active regions will have this method called.
   * 
   * This method sets up the global key event handlers so that key presses propagate to active regions. This
   * can be called at any point - the regional structure does not have to be instantiated for this to work.
   */
  _setup_key_events() {
    document.addEventListener("keydown", (e) => {
      for (const [subreg_id, subreg] of Object.entries(this.subregions)) {
        subreg._key_event_prop("keydown", e);
      }
    });
    document.addEventListener("keyup", (e) => {
      for (const [subreg_id, subreg] of Object.entries(this.subregions)) {
        subreg._key_event_prop("keyup", e);
      }
    });
  }
  /**
   * Return space-separated-string list of classes to apply to the tooltip $dom object. If you want to add custom classes
   * override this function in the child app class.
   */
  tooltip_get_classes() {
    return "regcss-tooltip";
  }
  /**
   * If specifics are not important, this can be used to automatically create and append an element to
   * the <body> of the page which can be the root region element for an ethereal region.
   * 
   * @returns {RHElement} An element that has been newly created and appended to document body.
   */
  eth_reg_create() {
    let el = RHElement.wrap(document.createElement("div"));
    document.body.append(el);
    return el;
  }
  /**
   * Deactivate all associated regions.
   */
  deactivate_all() {
    for (var x = 0; x < this.subregions.length; x++) {
      this.subregions[x].deactivate();
    }
  }
  /**
   * 
   * @param {String} anchor_text The anchor text to look for
   * @param {Region} region The instance of the region that is bound to that anchor text.
   */
  _register_anchor_location(anchor_text, region) {
    if (this.anchors_disable) {
      console.warn("Anchor not registered: " + this.anchor_text + ". Anchors are disabled for this app.");
      return;
    }
    if (this._registered_anchors[anchor_text] != void 0) {
      throw "Anchor " + anchor_text + " is already registered.";
    }
    this._registered_anchors[anchor_text] = region.id;
  }
  /**
   * Called when a region that has anchors enabled has its _anchor_activate() function called.
   */
  _anchor_on_region_anchor_activate() {
    if (this.anchors_disable) return;
    this._anchors_ignore_next = 1;
  }
  /**
   * Called when the url anchor changes. This includes the inital load of the page.
   * 
   * @param {Boolean} reload_on_blank Whether to initiate a reload if the 
   */
  _anchor_on_hash_change(reload_on_blank) {
    if (this.anchors_disable) return;
    if (this._anchors_ignore_next) {
      this._anchors_ignore_next = 0;
      return;
    }
    var current_anchor_text = document.location.hash.replace("#", "");
    if (this._anchor_hash_on_load) {
      current_anchor_text = this._anchor_hash_on_load;
      this._anchor_hash_on_load = void 0;
    }
    if (current_anchor_text == "") {
      if (reload_on_blank) {
        document.location.reload();
      }
    } else {
      this.deactivate_all();
      var anchor_reg = this.r[this._registered_anchors[current_anchor_text]];
      if (anchor_reg == void 0) {
        console.error("Anchor path " + current_anchor_text + " has no region associated with it.");
        document.location.hash = "";
      } else {
        anchor_reg.anchor.setup_fn();
      }
    }
  }
  /**
   * Setup a comonent-$dom combo as draggable. Under the current system, there *must* be a component
   * tied to a $dom for it to be draggable.
   * @param {JQuery object} $dom The html object to be made draggable
   * @param {Component} component Instance of the component tied to this $dom
   * @param {Function} dragstart_fn OPTIONAL Function to be called on dragstart to set any special data,
   * provided with args: fn(e, component, $dom_comp)
   * @param {Function} dragend_fn OPTIONAL Function to be called on dragend to ensure cleanup,
   * provided with args: fn(e, component, $dom_comp)
   */
  bind_draggable($dom, component, dragstart_fn, dragend_fn) {
    $dom.attr("draggable", "true");
    $dom.on("dragstart", function(e) {
      e.stopPropagation();
      this._dragdata.component = component;
      this._dragdata.$dom = $dom;
      this._dragdata.counter = 0;
      if (dragstart_fn) dragstart_fn(e, component, $dom);
    }.bind(this)).on("dragend", function(e) {
      if (dragend_fn) dragend_fn(e, this._dragdata.component, this._dragdata.$dom);
      e.stopPropagation();
      this._dragdata.component = void 0;
      this._dragdata.$dom = void 0;
      this._dragdata.counter = 0;
    }.bind(this));
  }
  /**
   * 
   * @param {JQuery object} $dom The html region that an object can be dropped
   * @param {String} class_name A css class to be added to $dom on dragenter and removed on dragleave
   * @param {Function} catch_dropped_fn The function to be executed when the object is dropped. This function is
   * provided with args: fn(e, dropped_component, $dom_dropped)
   * @param {Function} dragover_fn OPTIONAL Function to be called every dragover event,
   * provided with args: fn(e, dropped_component, $dom_dragging)
   */
  bind_catchable($dom, class_name, catch_dropped_fn, dragover_fn) {
    $dom.on("drop", function(e) {
      $dom.removeClass(class_name);
      catch_dropped_fn(e, this._dragdata.component, this._dragdata.$dom);
      e.preventDefault();
    }.bind(this)).on("dragenter", function(e) {
      $dom.addClass(class_name);
      this._dragdata.counter++;
    }.bind(this)).on("dragleave", function(e) {
      this._dragdata.counter--;
      if (this._dragdata.counter === 0) {
        $dom.removeClass(class_name);
      }
    }.bind(this)).on("dragover", (e) => {
      e.preventDefault();
      if (dragover_fn) dragover_fn(e, this._dragdata.component, this._dragdata.$dom);
    });
  }
  /**
   * Unbind all drag/catch behaviors from the provided $dom
   * 
   *  @param {JQuery object} $dom
   */
  unbind_both($dom) {
    $dom.off("drop").off("dragenter").off("dragleave").off("dragover").off("dragstart").off("dragend");
    $dom.attr("draggable", "false");
  }
};
export {
  Clipboard,
  ColorUtil,
  Component,
  DHREST,
  DHTabular,
  DataHandler,
  ErrorREST,
  Fabricator,
  FabricatorError,
  PUSH_CONFLICT_RESOLUTIONS,
  RHElement,
  RegIn,
  RegInCheckbox,
  RegInInput,
  RegInTextArea,
  RegOneChoice,
  RegTwoChoice,
  Region,
  RegionSwitchyard,
  RegionalStructureError,
  TODOError2 as TODOError,
  b64_md5,
  bindify_console,
  bindify_number,
  blob_md5,
  checksum_json,
  css_format_as_rule,
  css_inject,
  css_selector_exists,
  download_file,
  generate_hash,
  linterp,
  path_ext,
  sentry_setup,
  serial_promises,
  str_locations,
  throttle_leading,
  validate_email
};

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/regional/lib/md5.js
var b64pad = "";
function b64_md5(s) {
  return rstr2b64(rstr_md5(str2rstr_utf8(s)));
}
__name(b64_md5, "b64_md5");
function rstr_md5(s) {
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}
__name(rstr_md5, "rstr_md5");
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
__name(rstr2b64, "rstr2b64");
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
__name(str2rstr_utf8, "str2rstr_utf8");
function rstr2binl(input) {
  var output = Array(input.length >> 2);
  for (var i = 0; i < output.length; i++)
    output[i] = 0;
  for (var i = 0; i < input.length * 8; i += 8)
    output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << i % 32;
  return output;
}
__name(rstr2binl, "rstr2binl");
function binl2rstr(input) {
  var output = "";
  for (var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode(input[i >> 5] >>> i % 32 & 255);
  return output;
}
__name(binl2rstr, "binl2rstr");
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
__name(binl_md5, "binl_md5");
function md5_cmn(q, a, b, x, s, t) {
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
}
__name(md5_cmn, "md5_cmn");
function md5_ff(a, b, c, d, x, s, t) {
  return md5_cmn(b & c | ~b & d, a, b, x, s, t);
}
__name(md5_ff, "md5_ff");
function md5_gg(a, b, c, d, x, s, t) {
  return md5_cmn(b & d | c & ~d, a, b, x, s, t);
}
__name(md5_gg, "md5_gg");
function md5_hh(a, b, c, d, x, s, t) {
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
__name(md5_hh, "md5_hh");
function md5_ii(a, b, c, d, x, s, t) {
  return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
}
__name(md5_ii, "md5_ii");
function safe_add(x, y) {
  var lsw = (x & 65535) + (y & 65535);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
__name(safe_add, "safe_add");
function bit_rol(num2, cnt) {
  return num2 << cnt | num2 >>> 32 - cnt;
}
__name(bit_rol, "bit_rol");

// src/regional/etc/util.js
function checksum_json(data) {
  return b64_md5(JSON.stringify(data));
}
__name(checksum_json, "checksum_json");
function validate_email(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
__name(validate_email, "validate_email");
function str_locations(substring, string) {
  var a = [], i = -1;
  while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i);
  return a;
}
__name(str_locations, "str_locations");

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
__name(css_selector_exists, "css_selector_exists");
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
__name(css_inject, "css_inject");

// src/regional/etc/rhtml_el.js
var RHElement = class _RHElement extends HTMLElement {
  static {
    __name(this, "RHElement");
  }
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
  static {
    __name(this, "Fabricator");
  }
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
    let traverse = /* @__PURE__ */ __name((el) => {
      for (const child of el.children) {
        if (child.hasAttribute("rfm_member")) {
          this._members[child.getAttribute("rfm_member")] = RHElement.wrap(child);
        }
        traverse(child);
      }
    }, "traverse");
    traverse(this._dom.body);
  }
};

// src/regional/etc/errors.js
var RegionalStructureError = class extends Error {
  static {
    __name(this, "RegionalStructureError");
  }
  constructor(message, options) {
    super(message, options);
  }
};
var FabricatorError = class extends Error {
  static {
    __name(this, "FabricatorError");
  }
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

// src/regional/datahandlers/dh_rest.js
var PUSH_CONFLICT_RESOLUTIONS = {
  /** This will resolve push conflicts by raising an exception and placing the burden on the developer. */
  WITH_EXCEPTION: Symbol("WITH_EXCEPTION"),
  /** This will resolve push conflicts by presuming that the server accepted changes, but did not report so. */
  KEEP_CHANGES: Symbol("KEEP_CHANGES"),
  /** This will resolve push conflicts by presuming that the server rejected changes, but did not report so. */
  DISCARD_CHANGES: Symbol("DISCARD_CHANGES")
};

// src/regional/regions/reg.js
var Region = class _Region {
  static {
    __name(this, "Region");
  }
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

// src/regional/regions/reg_in.js
var RegIn = class extends Region {
  static {
    __name(this, "RegIn");
  }
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
  static {
    __name(this, "RegInInput");
  }
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

// src/regional/lib/dispatch.js
var DispatchClientJS = class {
  static {
    __name(this, "DispatchClientJS");
  }
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
    var data = {
      "jsonrpc": "2.0",
      "method": function_name,
      "params": params,
      "id": this.session_id,
      "__dispatch__permanent_data": permanent_data
    };
    var debug_datastring = JSON.stringify(data), mlen = Math.min(debug_datastring.length, 256);
    if (function_name != "__dispatch__client_poll") {
      this.log_debug("Calling " + function_name + " with " + debug_datastring.substring(0, mlen));
    }
    return new Promise((res, rej) => {
      this.get_json(this.dispatch_url, data).then((response_data) => {
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
  get_json(url, data) {
    return new Promise((res, rej) => {
      var xhr = new XMLHttpRequest();
      var param_string = "";
      for (const [key, val] of Object.entries(data)) {
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
  static {
    __name(this, "RegionSwitchyard");
  }
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
};

// src/demo/regs/reg_sw_demo.js
var RegSWDemo = class extends RegionSwitchyard {
  static {
    __name(this, "RegSWDemo");
  }
  /** @type {Region} Telescope region */
  reg_telescope;
  /** @type {Region} Text area region */
  reg_text;
  /** @type {Region} Overlay for text area settings */
  reg_settings;
  /** @description Settings object for this region. This is local data which is erased on page refresh. */
  settings = {
    /** @description The currently active text to view and operate on. */
    text_active: void 0
  };
  constructor() {
    super();
    this.data_readonly = { text: {} };
    this.call_on_load(() => {
      this._load_available_text();
    });
  }
  /**
   * This is called after linking is complete (just after _on_link_post()). This function can be overridden
   * by child classes to explicitly instantiate subregions that are required for this region to function.
   */
  _create_subregions() {
    this.reg_telescope = new RegTelescope().link(this, document.getElementById("reg_telescope"));
    this.reg_text = new RegText().fab().link(this, document.getElementsByClassName("reg-text")[0]);
    this.reg_settings = new RegSettings().fab().link(this, this.eth_reg_create()).etherealize();
  }
  /**
   * Loads 'data' from text files that are statically available.
   */
  _load_available_text() {
    this.data_readonly.names = { "clausewitz": "Clausewitz", "robert_caro": "Robert Caro" };
    this.data_readonly.text = {};
    Object.keys(this.data_readonly.names).forEach((name) => {
      fetch("/site/assets/" + name + ".txt").then((response) => response.text()).then((data) => {
        this.data_readonly.text[name] = data;
        this._on_settings_refresh();
        this.render();
      });
    });
  }
  /**
   * Get a CSRF token for this app. Behavior must be implemented in child app to work.
   * 
   * A CSRF token is not required for most RMF operations, but some key ones (like dispatch) will fail without it.
   */
  token_get_csrf() {
    return "IRRELEVANT_FOR_DEMO";
  }
  _on_settings_refresh() {
    let texts = this.data_readonly.text;
    this.settings.text_active = texts.length == 0 ? void 0 : Object.keys(texts)[0];
  }
};

// src/demo/regs/reg_telescope.js
var RegTelescope = class extends Region {
  static {
    __name(this, "RegTelescope");
  }
  /**
   * This telescope region binds itself to pure HTML as already written in the DOM.
   */
  constructor() {
    super();
    this.portal;
    this.view;
    this.zoom_out;
    this.zoom_in;
    this.settings = {
      /** @description Level of zoom for the telescope */
      zoom_level: void 0
    };
    this.telescope_images = [
      "/site/assets/telescope_0.png",
      "/site/assets/telescope_1.png",
      "/site/assets/telescope_2.png",
      "/site/assets/telescope_3.png",
      "/site/assets/telescope_4.png"
    ];
  }
  /**
   * Fired after linking. It's safe to grab members here.
   */
  _on_link_post() {
    this.portal = this.member_get("portal");
    this.view = this.member_get("view");
    this.zoom_out = this.member_get("zoom_out");
    this.zoom_in = this.member_get("zoom_in");
    this.zoom_in.addEventListener("click", (e) => {
      this.settings_change_zoom(this.settings.zoom_level + 1);
    });
    this.zoom_out.addEventListener("click", (e) => {
      this.settings_change_zoom(this.settings.zoom_level - 1);
    });
  }
  /**
   * Change the zoom of the telescope.
   * 
   * @param {Number} new_zoom The zoom number, an integer between 0 and 4
   */
  settings_change_zoom(new_zoom) {
    if (new_zoom > 4) new_zoom = 4;
    if (new_zoom < 0) new_zoom = 0;
    this.settings.zoom_level = new_zoom;
    this.render();
  }
  /**
   * This is called whenever this specific region has its settings refreshed. This is the preferred location
   * to setup settings information in a Region subclass.
   */
  _on_settings_refresh() {
    this.settings = {
      zoom_level: 0
    };
  }
  /**
   * This is called whenever this specific region has its settings refershed. This is the preferred location
   * to actually place the code that will 'redraw' a region.
   */
  _on_render() {
    this.portal.style.borderWidth = this.settings.zoom_level + 1 + "px";
    this.view.setAttribute("src", this.telescope_images[this.settings.zoom_level]);
  }
};

// src/demo/regs/reg_text.js
var RegText = class extends Region {
  static {
    __name(this, "RegText");
  }
  fab_get() {
    let css = (
      /* css */
      `
			[rfm_reg="RegText"] {
				/* Hold the text area and search box vertically in a column. */
				& .cont_main {
					width: 100%; height: 100%;
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					justify-content: center;
				}
				& .text {
					width: calc(100% - 4px);
					flex-grow: 1;
					padding: 2px; border: 1px solid grey;
					border-radius: 5px;
					font-family: 'Courier New', sans-serif;
					overflow-y: scroll;
				}
				& .regin-search-cont {
					margin-top: 1vw;
					margin-bottom: 1vw;
				}
				& .count {
					margin-left: 1vw;
				}
				& .row {
					display: flex;
					flex-direction: row;
					align-items: center;
				}
				& .btn-settings {
					align-self: flex-end;
				}
			}
		`
    );
    let html = (
      /* html */
      `
			<div class='cont_main'>
				<label> Try out the search feature! </label>
				<div rfm_member='text' class='text'> Text loading... </div>
				<div class='row' style='width: 100%; justify-content: space-between'>
					<div class='row'>
						<div rfm_member='regin_search_cont' class='regin-search-cont'></div>
						<div class='count'>Occurrences:</div>
						<div rfm_member='count' class='count'> 0 </div>
					</div>
					<button rfm_member='settings_btn'> Settings </button>
				</div>
			</div>
		`
    );
    return new Fabricator(html).add_css_rule(css);
  }
  /** @type {RHElement} The text area where text is displayed and highlighted. */
  text;
  /** @type {RHElement} The div tag that contains the search regin.*/
  regin_search_cont;
  /** @type {RHElement} A little div tag containing the number of search occurrences.*/
  count;
  /** @type {RHElement} A button to summon the settings overlay.*/
  settings_btn;
  /** @type {RegInInput} The search regin */
  regin_search;
  /** @description Settings object for this region. This is local data which is erased on page refresh. */
  settings = {
    /** @description The text to search for and highlight */
    search_text: void 0
  };
  /**
   * Used here to load text from file and bind some handlers.
   */
  _on_link_post() {
    this.swyd.call_on_load(() => {
      fetch("/site/assets/clausewitz.txt").then((response) => response.text()).then((data) => {
        this.settings.text = data;
        this.render();
      });
    });
    this.settings_btn.addEventListener("click", () => {
      this.swyd.reg_settings.activate();
    });
    this.render_checksum_add_tracked("active_text", () => {
      return this.swyd.settings.text_active;
    });
  }
  _create_subregions() {
    this.regin_search = new RegInInput().fab().link(this, this.regin_search_cont, this.settings, "search_text");
  }
  /**
   * @returns {Number} The number of occurrences of the current search string in the main text.
   */
  get occurrences() {
    if (!this.settings.search_text) return 0;
    return this.master_text.split(this.settings.search_text).length - 1;
  }
  /**
   * NOTE: Text is stored at the swyd level because other regions at the same level as this region need
   * to access it.
   * 
   * @returns {string} Text as selected setting at swyd level or "" if none selected.
   */
  get master_text() {
    let text = this.swyd.data_readonly.text[this.swyd.settings.text_active];
    return !text ? "" : text;
  }
  _on_settings_refresh() {
    this.settings.search_text = "";
  }
  _on_render() {
    this.text.empty();
    this._draw_text_children(this.master_text, this.settings.search_text).forEach((child) => {
      this.text.append(child);
    });
    this.count.textContent = this.occurrences;
  }
  /**
   * @private
   * This draw function returns  child elements that can be placed in a <span> to read text in paragraph
   * form with some text highlighted.
   * 
   * NOTE: This winds up being a bit ugly because of the string manipulation. A more clear example
   * of a _draw function can be found in the demo regions for settings.
   * 
   * @param {string} master The master text to completely render with some highlighting
   * @param {string} search The search string. Matching text in master will be highlighted. If empty string
   * 		or undefined, do nothing.
   * 
   * @returns {Array.<RHElement>} Child elements for text box.
   */
  _draw_text_children(master, search) {
    let paras = master.split("\n");
    let paras_hl = [];
    paras.forEach((para) => {
      let para_hl = [];
      if (search) {
        para.split(search).forEach((non_higlighted_segment, i_hl, arr_hl) => {
          para_hl.push(non_higlighted_segment);
          if (i_hl + 1 < arr_hl.length) {
            let el_mark = document.createElement("mark");
            el_mark.textContent = search;
            para_hl.push(el_mark);
          }
        });
      } else {
        para_hl = [para];
      }
      paras_hl.push(para_hl);
    });
    let els = [];
    paras_hl.forEach((para_hl, i, arr) => {
      let span = document.createElement("span");
      para_hl.forEach((hl_child) => {
        span.append(hl_child);
      });
      els.push(span);
      if (i + 1 < arr.length) els.push(document.createElement("br"));
    });
    return els;
  }
};

// src/demo/regs/reg_settings.js
var RegSettings = class extends Region {
  static {
    __name(this, "RegSettings");
  }
  /** @type {RHElement} Button to activate main settings pane */
  tab_main;
  /** @type {RHElement} Button to activate creds settings pane */
  tab_creds;
  /** @type {RHElement} The area in which settings pane regions are loaded */
  pane;
  /** @type {RHElement} The subset of the pane for the main settings region */
  el_settings_main;
  /** @type {RHElement} The subset of the pane for the creds settings region */
  el_settings_creds;
  /** @type {RHElement} The exit button */
  exit;
  /** @type {Region} Subregion for main settings pane */
  reg_settings_main;
  /** @type {Region} Subregion for creds settings pane */
  reg_settings_creds;
  /** @description Settings object for this region. This is local data which is erased on page refresh. */
  settings = {
    /** @description Selective active pain by ID. */
    active_pane_id: void 0
  };
  fab_get() {
    let css = (
      /* css */
      `
			[rfm_reg="RegSettings"] {
				
				/* A side-by-side row type configuration */
				& .cont-main {
					background-color: white;
					width: 80vw; height: 80vh;
					display: flex;
					flex-direction: row;
					position: static;
				}
				& .borders {
					box-sizing: border-box;
					border: 1px solid grey;
					border-radius: 5px;
				}
				& .tab-col {
					box-sizing: border-box;
					display: flex;
					flex-direction: column;
					height: 100%;
					padding: 1vw;
					border-right: 1px solid grey
				}
				& .tab-col-left {
					width: 20%;
				}
				& .tab-col-right {
					width: 80%;
				}
				& .tab {
					padding: 1vw;
					width: 100%;
					margin-bottom: 1vw;
				}
				& .pane {
					width: 100%;
				}
				& .exit {
					padding: 0.5vw;
				}
				& .row {
					display: flex; flex-direction: row; justify-content: flex-end;
				}
			}
		`
    );
    let html = (
      /* html */
      `
			<div class='cont-main borders'>
				<div class='tab-col tab-col-left'>
					<button rfm_member='tab_main' class='tab borders'> Main Settings </button>
					<button rfm_member='tab_creds' class='tab borders'> Credentials </button>
				</div>
				<div class='tab-col tab-col-right'>
					<div class='row'>
						<button rfm_member='exit' class='exit borders'> Close </button>
					</div>
					<div rfm_member='pane' class='pane'>
						<div rfm_member='el_settings_main'></div>
						<div rfm_member='el_settings_creds'></div>
					</div>
				</div>
			</div>
		`
    );
    return new Fabricator(html, { main_text: this.settings.text }).add_css_rule(css);
  }
  _on_link_post() {
    this.exit.addEventListener("click", () => {
      this.deactivate();
    });
    this.tab_main.addEventListener("click", () => {
      this.settings.active_pane_id = this.reg_settings_main.id;
      this.render();
    });
    this.tab_creds.addEventListener("click", () => {
      this.settings.active_pane_id = this.reg_settings_creds.id;
      this.render();
    });
  }
  _create_subregions() {
    this.reg_settings_main = new RegSettingsMain().fab().link(this, this.el_settings_main);
    this.reg_settings_creds = new RegSettingsCreds().fab().link(this, this.el_settings_creds);
    this.panes = [
      this.reg_settings_main,
      this.reg_settings_creds
    ];
  }
  _on_settings_refresh() {
    this.settings.active_pane_id = 0;
  }
  _on_render() {
    this.panes.forEach((reg_pane) => {
      if (reg_pane.id == this.settings.active_pane_id) {
        reg_pane.activate();
      } else {
        reg_pane.deactivate();
      }
    });
  }
};

// src/demo/regs/reg_settings_main.js
var RegSettingsMain = class extends Region {
  static {
    __name(this, "RegSettingsMain");
  }
  fab_get() {
    let css = (
      /* css */
      `
			[rfm_reg="RegSettingsMain"] {
				
				/* A side-by-side row type configuration */
				& .cont-main {
					width: 100%; height: 100%;
					display: flex;
					flex-direction: column;
					box-sizing: border-box;
				}
				& .row {
					display: flex; flex-direction: row; justify-content: flex-start;
				}
				& .row-entry {
					margin-right: 1vw;
				}
				& .selected {
					background-color: #666666;
					color: white;
				}
			}
		`
    );
    let html = (
      /* html */
      `
			<div class='cont-main'>
				<div class='row'>
					<span class='row-entry'> Choose your hero: </span>
					<div rfm_member='hero_row' class='row row-entry'></div>
				</div>
			</div>
		`
    );
    return new Fabricator(html).add_css_rule(css);
  }
  /** @type {RHElement} Row to populate with hero choice buttons */
  hero_row;
  /** @description Settings object for this region. This is local data which is erased on page refresh. */
  settings = {};
  _on_link_post() {
    this.render_checksum_add_tracked("active_text", () => {
      return this.swyd.settings.text_active;
    });
  }
  /**
   * Call when the user selects a 'hero'. The name of this person will be key in swyd.data_readonly.texts.
   * This function will select that setting at the swyd level and re-render all.
   * 
   * @param {string} hero_name The name of the selected hero (e.g. text)
   */
  settings_select_hero(hero_name) {
    this.swyd.settings.text_active = hero_name;
    this.swyd.render();
  }
  _on_render() {
    this.hero_row.empty();
    Object.keys(this.swyd.data_readonly.names).forEach((name) => {
      this.hero_row.append(this._draw_hero_entry(name));
    });
  }
  /**
   * Draw hero entry given a hero name and whether it is selected. Binds click behavior too.
   * 
   * @param {string} hero_name The name of the hero to select
   * 
   * @returns {RHElement} Entry
   */
  _draw_hero_entry(hero_name) {
    let name = this.swyd.data_readonly.names[hero_name];
    let div = RHElement.wrap(document.createElement("button"));
    let is_selected = this.swyd.settings.text_active == hero_name;
    let classes = is_selected ? "row-entry selected" : "row-entry";
    div.setAttribute("class", classes);
    div.textContent = name;
    div.addEventListener("click", () => {
      this.settings_select_hero(hero_name);
    });
    return div;
  }
};

// src/demo/regs/reg_settings_creds.js
var RegSettingsCreds = class extends Region {
  static {
    __name(this, "RegSettingsCreds");
  }
  fab_get() {
    let css = (
      /* css */
      `
			[rfm_reg="RegSettingsCreds"] {
				
				/* A side-by-side row type configuration */
				& .cont-main {
					width: 100%; height: 100%;
					display: flex;
					flex-direction: column;
					box-sizing: border-box;
				}
				& .row {
					display: flex; flex-direction: row; justify-content: flex-start;
					margin-top: 1vh;
				}
				& .row-entry {
					margin-right: 1vw;
				}
			}
		`
    );
    let html = (
      /* html */
      `
			<div class='cont-main'>
				<div class='row'>
					<span class='row-entry'> Demo field 1: </span>
					<input>
				</div>
				<div class='row'>
					<span class='row-entry'> Demo field 2: </span>
					<input>
				</div>
				<div class='row'>
					<span class='row-entry'> Demo field 3: </span>
					<input>
				</div>
			</div>
		`
    );
    return new Fabricator(html).add_css_rule(css);
  }
};
export {
  RegSWDemo,
  RegSettings,
  RegSettingsCreds,
  RegSettingsMain,
  RegTelescope,
  RegText
};

// src/etc/fabricator.js
// Josh Reed 2024
//
// The fabricator is used to dynamically generate HTML and CSS

import {str_locations, FabricatorError, css_inject, css_selector_exists, RHElement} from "../regional.js"

/**
 * The Fabricator can dynamically generate HTML / CSS and inject those into the current document. This
 * functionality is primarily intended to be used for dynamic region generation. The use of a Fabricator
 * allows the HTML, CSS, and Javascript for a region's elements to all be written in the same file. Such
 * compartmentalization makes it more clear to work with subsets of a large web-app with many moving parts.
 * 
 * Be warned, however, that dynamic HTML and CSS can never be available on page-load. Care should be taken
 * to construct pages so that the initial view that the user sees (while the JS is loading etc.) won't
 * confusingly change shape as various HTML / CSS is loaded in.
 * 
 * (Note: All that HTML and CSS *can* in fact be available on page load with the use of pre-compilation e.g.
 * svelte. However, one of the goals of Regional is to avoid pre-compilation.)
 */
class Fabricator
{
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
	constructor(html_str, expressions)
	{
		if(!expressions) expressions = {}

		// Add in expressions.
		this.html_str = this._preprocess_expressions(html_str, expressions)

		// Setup class var definitions
		/** @type {Object.<string, RHElement>} A string-map of member names to element reference. */
		this._members = {}
		/** @type {Boolean} If true this class has had generate() called and is immutable. */
		this._immutable = false
		/** @type {Array.<string>} List of rules that have been queued up to add */
		this._css_rules = []
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
	add_css_rule(rule)
	{
		if(this._immutable) throw("Fabricator is immutable and can no longer be modified.")
		this._css_rules.push(rule)

		return this
	}

	/**
	 * Get a mapping of member names to member elements.
	 * 
	 * @returns {Object.<str, RHElement>} The member mapping.
	 */
	get_members()
	{
		if(!this._immutable) throw("Cannot call until after fabricate()")

		return this._members
	}

	/**
	 * Append all fabricated elements to the provided one.
	 * 
	 * @param {HTMLElement} el The element (presumably from the real document) to append our fabrication to
	 */
	append_to(el)
	{
		// I think it's this simple. Perhaps, I'll find in the future they should be cloned first
		for(const child of this._dom.body.children)
		{
			el.append(child)
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
	fabricate()
	{
		if(this._immutable) throw("Fabricator is immutable and can no longer be modified.")
		this._immutable = true
		this._dom = this._parse_html(this.html_str)
		this._css_inject()

		this._members_discover()

		return this
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
	_preprocess_expressions(html_str, expressions)
	{
		let open_locs = str_locations("{{", html_str)
		let close_locs = str_locations("}}", html_str)
		let html_str_out = ""

		if(open_locs.length != close_locs.length) throw(new FabricatorError(
			"Open expression count does not match close expression count. Can not parse expressions.", this
		))

		// Zero-case
		if(open_locs.length == 0 && close_locs.length == 0) return html_str

		let html_i_last_end = 0
		open_locs.forEach((html_i_open, loc_i)=>
		{
			let html_i_close = close_locs[loc_i]

			// Check that the close occurs after the open for this location
			if(html_i_close <= html_i_open) throw(new FabricatorError(
				"Expression close and open mismatch! Can not parse expressions.", this
			))

			// Check that the next open occurs after this close
			// (But only if this is not the last location)
			if((loc_i + 1) < open_locs.length)
			{
				// If next html_i_open exceeds or equals current html_i_close
				if(open_locs[loc_i + 1] <= html_i_close) throw(new FabricatorError(
					"Nested expressions are not allowed. Can not parse expressions.", this
				))
			}

			// Ok, with error checks out of the way let's perform the substitution.
			// First we need our expression name.
			// {{    name }}
			// 012
			let expression_str = html_str.substring(html_i_open + 2, html_i_close).trim()

			// Get the value, or an empty string if none match.
			let exp_value = (expression_str in expressions) ? expressions[expression_str] : ""

			// Modify the html_str copy.
			// First add everything from last close to current open.
			html_str_out += html_str.substring(html_i_last_end, html_i_open)
			// Then add the exp value
			html_str_out += exp_value
			// Lastly, if this is the very last location, add the remainder
			if((loc_i + 1) == open_locs.length)
			{
				html_str_out += html_str.substring(html_i_close + 2)
			}

			// Update rolling vars.
			html_i_last_end = html_i_close + 2 // Add 2 to get to end of brackets.
		})

		return html_str_out
	}
	

	/**
	 * @protected
	 * Inject all stored instructional information about CSS into the document.
	 */
	_css_inject()
	{
		this._css_rules.forEach((css_rule)=>
		{
			if(!css_selector_exists(css_rule))
			{
				css_inject(css_rule)
			}
		})
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
	_parse_html(html_str)
	{
		return (new DOMParser()).parseFromString(html_str, "text/html")
	}

	/**
	 * @private
	 * Investigate this.dom to discover all 'rfm_members' within. This will populate this._members.
	 */
	_members_discover()
	{
		// Recursive function to search for members.
		let traverse = (el)=>
		{
			for (const child of el.children)
			{
				if(child.hasAttribute('rfm_member'))
				{
					this._members[child.getAttribute('rfm_member')] = RHElement.wrap(child)
				}
				traverse(child)
			}
		}
		traverse(this._dom.body)
	}
}

export {Fabricator}
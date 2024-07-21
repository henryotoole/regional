


/**
 * Check whether or not a CSS rule has already been bound to the provided selector. If a rule is provided,
 * the selector will be separated from it by getting everything before the first curly brace.
 * 
 * For now, this supports nesting in the sense that it can check if the toplevel selector for the nested
 * set exists. However, it is not intelligent enough to check for collisions within a selector. This would
 * be entirely possible in the future if there was a reason to do so.
 * 
 * @param {string} rule_or_selector Either a complete CSS rule or a selector.
 */
function css_selector_exists(rule_or_selector)
{
	// First, convert rule to selector if neccessary.
	let selector = rule_or_selector
	if(rule_or_selector.indexOf('{') != -1)
	{
		selector = rule_or_selector.substring(0, rule_or_selector.indexOf('{')).trim()
		selector.trim()
	}

	let pool = [
		document.styleSheets,
		document.adoptedStyleSheets
	]
	for(let i_pool = 0; i_pool < pool.length; i_pool++)
	{
		let stylesheets = pool[i_pool]
		for(let i_sheet = 0; i_sheet < stylesheets.length; i_sheet++)
		{
			let stylesheet = stylesheets[i_sheet]
	
			for(let i_rule = 0; i_rule < stylesheet.cssRules.length; i_rule++)
			{
				let rule = stylesheet.cssRules[i_rule]
				if(rule.selectorText == selector)
				{
					return true
				}
			}
		}
	}
	return false
}

/**
 * Add a new CSS rule to this document. All css additions will be placed in a custom stylesheet that we add to the
 * document only once under adoptedStyleSheets. In fact, this method is really just a glorified wrapper
 * for CSSStyleSheet.insertRule() that ensures a special stylesheet exists and is selected.
 * 
 * WARNING! No checks are performed here for collisions. Use css_selector_exists() for that.
 * 
 * Note that, sadly, this can not yet accept a series of individual rules that have been concatenated.
 * 
 * @param {string} rule
 */
function css_inject(rule)
{
	// All css injection will occur in a custom stylesheet that we add to the document only once under
	// adoptedStyleSheets.

	// Can we get our existing stylesheet?
	/** @type {CSSStyleSheet} */
	let regss;
	document.adoptedStyleSheets.forEach((ss)=>
	{
		if(ss._regcss_name == "regcss") regss = ss
	})
	
	// Create if did not exist
	if(!regss)
	{
		regss = new CSSStyleSheet()
		regss._regcss_name = "regcss"
		document.adoptedStyleSheets.push(regss)
	}

	// Ok, now we can use insertRule to add the new rule.
	regss.insertRule(rule, regss.cssRules.length)
}

/**
 * Format the provided information as a valid CSS rule. All info, even for nested structures, will be
 * collapsed into one single line.
 * 
 * @param {str} selector The selector that is used to determine when this css is applied.
 * @param {Object.<str, str>} style_data CSS styling content
 * @param {Object.<str, Object>} [nested] An object that maps selectors to styles, to be nested under the master
 * selector. This is optional.
 * 
 * @returns {string} The rule string
 */
function css_format_as_rule(selector, style_data, nested)
{
	// Next let's format our new class and append it.
	let style_line = selector + " {"
	for(const [propname, propval] of Object.entries(style_data))
	{
		style_line += propname + ": " + propval + ";"
	}

	// If there are styles to nest under this one.
	if(nested)
	{
		for(const [nested_selector, nested_style_obj] of Object.entries(nested))
		{
			style_line += "& " + nested_selector + " {"
			for(const [nested_propname, nested_propval] of Object.entries(nested_style_obj))
			{
				style_line += nested_propname + ": " + nested_propval + ";"
			}
			style_line += "}"
		}
	}

	style_line += "}"
	return style_line
}

export {css_selector_exists, css_inject, css_format_as_rule}
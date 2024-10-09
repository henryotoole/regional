/**
 * @file Class for a RegIn that wraps an <select> element for list selection.
 * @author Josh Reed
 */

import {RegIn, RHElement, Fabricator, validate_email, RegionSwitchyard} from "../regional.js"

/**
 * The RegInSelect class wraps the generic <select> with <option>s setup. Selections by nature draw from a finite
 * pool, so no input validation is done for this RegIn. Selections are a little complex in that the options
 * themselves also should be possible to set dynamically. See `link_options()` for more details on linking option
 * set dynamically.
 * 
 * The fabricator for this input by default generates the following structure:
 * 
 * ```
 * <select class="ris-select" rfm_member="select">
 *     <option class="ris-opt" value="val1"> Val 1 Name </option>
 *     <option class="ris-opt" value="val2"> Val 2 Name </option>
 * </select>
 * ```
 * 
 * To change the styling without making a subclass, it's possible to do something like the below, perhaps with
 * class names that are scoped to the containing region:
 * 
 * ```
 * let ri_select = new RegInSelect().fab().link(...)
 * ri_select.select.setAttribute('class', 'custom-class-name')
 * ```
 * 
 * Alternatively, the 'ris-select' and 'ris-opt' classes that are always associated with the generated <select>
 * element can be given styling in the css for the containing region. They do not have default styling.
 */
class RegInSelect extends RegIn
{

	fab_get()
	{
		let html = /* html */`
			<select rfm_member="select" class="ris-select"></select>
		`
		return new Fabricator(html)
	}

	/** @type {RHElement} The <select> element */
	select

	/**
	 * @param {Object} options Key/val pairs where keys are `<option> values` and vals are `<option> names`.
	 * 						   This argument is optional, and can be omitted if the select is linked by reference
	 * 						   to a list with link_options().
	 */
	constructor(options)
	{
		super()
		this._value_update_handlers = []
		this._default_options = options || {}
		this._opts_ref = undefined
		this._opts_key = undefined
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
	 * @param {Object} opts_ref OPTIONAL: Reference to object in which region option dict is stored.
	 * @param {String} opts_key OPTIONAL: The key in `opts_ref` at which option dict is stored: `opts_ref[opts_key] = opts`
	 * 
	 * @returns {this} itself for function call chaining
	 */
	link(reg_super, reg_el, value_ref, value_key, opts_ref, opts_key)
	{
		super.link(reg_super, reg_el, value_ref, value_key)

		this._opts_ref = opts_ref
		this._opts_key = opts_key

		return this
	}

	/**
	 * This is called after linking is complete. It is used here to bind events.
	 */
	_on_link_post()
	{
		this.select.addEventListener('change', ()=>{
			this._view_alters_value(this.select.value)
		})
		this.render_checksum_add_tracked('regin_opt_ref', ()=>
		{
			if(this._opts_ref == undefined) return 0
			return this._opts_ref[this._opts_key]
		})
	}

	_on_settings_refresh()
	{
		this.settings.value = undefined
		if(this._opts_ref != undefined)
		{
			this.settings.options = this._opts_ref[this._opts_key]
		}
		else
		{
			this.settings.options = this._default_options
		}
	}

	/**
	 * Completely redraw this region and all active subregions. Overridden here to selectively pull from
	 * super-region settings value if it has changed from last time we pulled it.
	 */
	render(force)
	{
		// link_options() is not required, and may not have been called.
		if(this._opts_ref != undefined)
		{
			this.settings.options = this._opts_ref[this._opts_key]
		}

		super.render(force)
	}

	_on_render()
	{
		super._on_render()
		
		this.select.empty()
		Object.entries(this.settings.options).forEach(([k, v])=>
		{
			let opt = RHElement.wrap(document.createElement('option'))
			opt.setAttribute('value', k)
			opt.textContent = v
			this.select.append(opt)
		})
		// Handle case where the selected value no longer exists
		if(this.settings.value != "" && !this.settings.options.hasOwnProperty(this.settings.value))
		{
			// If there is no vlaue, set to empty string.
			let k = Object.keys(this.settings.options),
				v = k.length > 0 ? k[0] : ""
			// This will re-call _on_render, unfortunately, but will do so after having set this.settings.value
			// to the value here, and will miss the above function.
			this._view_alters_value(v)
		}
		// Apply value.
		this.select.value = this.settings.value
	}
}

export {RegInSelect}
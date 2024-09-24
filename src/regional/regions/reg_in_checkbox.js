/**
 * @file Class for a RegIn that wraps an <input> for checkbox.
 * @author Josh Reed
 */

import {RegIn, RHElement, Fabricator, validate_email, RegionSwitchyard} from "../regional.js"

/**
 * The RegInCheckbox class wraps the generic <input type="checkmark"> setup. To add custom styling, the HTML
 * around this checkmark is slightly more complex. Checkboxes are simple, so there's no validation for this
 * RegIn.
 * 
 * The fabricator for this input by default generates the following structure:
 * 
 * ```
 * <div class="ricb-cont" rfm_member="cont">
 *     <input class="ricb-checkbox" rfm_member="checkbox" type="checkbox">
 * </div>
 * ```
 * 
 * To have custom HTML in your own class, simply subclass RegInInput and override the fab_get() function to
 * return something with, at least, an input with rfm_member='checkbox'.
 * 
 * To change the styling without making a subclass, it's possible to do something like the below, perhaps with
 * class names that are scoped to the containing region:
 * 
 * ```
 * let ricb = new RegInCheckbox().fab().link(...)
 * ricb.cont.setAttribute('class', 'custom-class-name')
 * ricb.checkbox.setAttribute('class', 'custom-class-name')
 * ```
 */
class RegInCheckbox extends RegIn
{

	fab_get()
	{
		let css = /* css */`
			[rfm_reg="RegInCheckbox"] {
				/* Hold the text area and search box vertically in a column. */
				& .cont {
				}
				& .checkbox {
				}
			}
		`
		let html = /* html */`
			<div rfm_member="cont">
				<input rfm_member="checkbox" type="checkbox">
			</div>
		`
		return new Fabricator(html).add_css_rule(css)
	}

	/** @type {RHElement} The input with type="checkbox" */
	checkbox
	/** @type {RHElement} The input container <div> */
	cont
	/** @type {String} A secondary identifier that's only used when this checkbox is in a radio group */
	_radio_cb_value
	/** @type {RadioGroup} The radio group that this checkbox belongs to, if a radio group has been setup */
	_radio_group


	/**
	 * This is called after linking is complete. It is used here to bind events.
	 */
	_on_link_post()
	{
		this.checkbox.addEventListener('input', ()=>{
			this._view_alters_value(this.checkbox.checked)
		})
		this.render_checksum_add_tracked('regin_cb_radio_value_ref', ()=>
		{
			if(this._radio_group != undefined) return this._radio_group._value_ref[this._radio_group._value_key]
			return 0
		})
	}

	_on_settings_refresh()
	{
		this.settings.value = false
	}

	_on_render()
	{
		super._on_render()
		this.checkbox.checked = this.settings.value
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
	static combine_into_radio(checkboxes, cb_values, value_ref, value_key)
	{
		return new RadioGroup(checkboxes, cb_values, value_ref, value_key)
	}
}

/**
 * A RadioGroup is a way to collect a set of disparate checkboxes into a single unit that functions similarly
 * to a classical HTML radio group. The overall group of radio inputs has it's own internal settings
 * and an external value_ref, just like a regular RegIn. It is NOT a region however.
 */
class RadioGroup
{
	/** @type {RegionSwitchyard} */
	swyd

	/**
	 * Create a new radio button group formed of the checkboxes provided.
	 * 
	 * @param {Array.<RegInCheckbox>} checkboxes A set of checkboxes to tie together
	 * @param {Array.<String>} cb_values A corresponding list of 'values' which will be used to indicate
	 * 		which checkbox is currently selected.
	 * @param {Object} value_ref Reference to object in which region input value is stored. See above.
	 * @param {String} value_key The key in `value_ref` at which value is stored: `value_ref[value_key] = value`
	 */
	constructor(checkboxes, cb_values, value_ref, value_key)
	{
		if(checkboxes.length != cb_values.length) throw new Error("Number of boxes and values must match.")

		this._checkboxes = checkboxes
		this._cb_values = cb_values
		this._value_ref = value_ref
		this._value_key = value_key
		this._checkboxes[0].render_add_handler(()=>
		{
			this._on_superregion_render()
		})
		this.swyd = this._checkboxes[0].swyd
		this._value_update_handlers = []

		checkboxes.forEach((checkbox, i)=>
		{
			if(checkbox._radio_group != undefined) throw new Error("Checkbox already has radio group!")
			checkbox._radio_cb_value = cb_values[i]
			checkbox.add_value_update_handler((new_value)=>
			{
				this._on_checkbox_value_altered(checkbox, new_value)
			})
			checkbox._radio_group = this
		})
		
		this._state_set_context = false
	}

	/**
	 * Add a handler that will be called whenever the value for this input updates as a result of an action
	 * taken by the user.
	 * 
	 * @param {Function} fn A function to call when the value for this object updates. Arg: new value
	 */
	add_value_update_handler(fn)
	{
		this._value_update_handlers.push(fn)
	}

	/**
	 * Called when the value for a checkbox updates.
	 * 
	 * @param {RegInCheckbox} checkbox The checkbox that changed
	 * @param {*} new_value 
	 */
	_on_checkbox_value_altered(checkbox, new_value)
	{
		// This context prevents this function from being called a bunch by value update propagation.
		if(this._state_set_context) return
		try
		{
			this._state_set_context = true
			// If it was selected, make it selected and deselect all others.
			if(new_value)
			{
				this._group_state_set_from_value(checkbox._radio_cb_value)
			}
			// Otherwise unselect all
			else
			{
				this._group_state_set_from_value(undefined)
			}
			// Update external value reference.
			let state = this._group_state_get()
			this._value_update_handlers.forEach((handler)=>{handler(state)})
			this._value_ref[this._value_key] = state
			this.swyd.render()
		}
		finally
		{
			this._state_set_context = false
		}
	}

	/**
	 * Called when the first checkbox has its _on_render() called. This is
	 * used to update the checkbox group if the value_ref is changed programmatically.
	 */
	_on_superregion_render()
	{
		// Only take action if the value_ref state doesn't match the group state
		if((!this._state_set_context) && (this._group_state_get() != this._value_ref[this._value_key]))
		{
			this._state_set_context = true
			try
			{
				this._group_state_set_from_value(this._value_ref[this._value_key])
			}
			finally
			{
				this._state_set_context = false
			}
		}
	}

	/**
	 * Set the states of all checkboxes on the basis of the provided 'selected' value.
	 * 
	 * @param {String} cb_value Value of checkbox to select, or undefined to unselect all.
	 */
	_group_state_set_from_value(cb_value)
	{
		// Error checks for invalid value. Important
		if((cb_value != undefined) && (this._cb_values.indexOf(cb_value) == -1))
		{
			throw new Error(`Value ${cb_value} does not correspond to any checkboxes in group.`)
		}

		this._checkboxes.forEach((regin_cb)=>
		{
			if((cb_value != undefined) && (regin_cb._radio_cb_value == cb_value))
			{
				regin_cb._view_alters_value(true)
			}
			else
			{
				regin_cb._view_alters_value(false)
			}
		})
	}

	/**
	 * Infer what the state of the radio group should be on the basis of what is selected.
	 * 
	 * @returns {String} The cb_value of the currently selected checkbox or 'undefined'.
	 */
	_group_state_get()
	{
		let out = undefined
		this._checkboxes.forEach((regin_cb)=>
		{
			if(regin_cb.settings.value)
			{
				out = regin_cb._radio_cb_value
			}
		})
		return out
	}
}

export {RegInCheckbox}
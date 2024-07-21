// regional/regions/reg_in_input.js
// Josh Reed 2024
//
// Class for a RegIn that wraps an <input> tag.

import {RegIn, RHElement, Fabricator, validate_email} from "../regional.js"

/**
 * The somewhat confusingly named RegInInput class wraps a regular <input> tag, returning a value that
 * represents a single line of text. Built-in validators can enforce this returned text to be a valid number,
 * integer, email address, etc.
 * 
 * The fabricator for this input by default generates the following structure:
 * `<input rfm_member='input'>
 * 	<div rfm_member='val_notice' class='val-notice'> Failure text </div>
 * `
 * 
 * To have custom HTML in your own class, simply subclass RegInInput and override the fab_get() function to
 * return something with, at least, an input with rfm_member='input' and something else with
 * rfm_member='val_notice'.
 * 
 * It is recommended a debouncer be added to this type of input.
 */
class RegInInput extends RegIn
{
	/** @type {RHElement} The input tag reference */
	input

	fab_get()
	{
		let css = /* css */`
			[rfm_reg="RegInInput"] {
				/* Hold the text area and search box vertically in a column. */
				& .val-notice {
					position: absolute;
					padding: 2px;
					border: 1px solid grey;
					border-radius: 5px;
					color: red;
					background-color: white;
				}
			}
		`
		let html = /* html */`
			<input rfm_member='input'>
			<div rfm_member='val_notice' class='val-notice'></div>
		`
		return new Fabricator(html).add_css_rule(css)
	}

	/**
	 * This is called after linking is complete. It is used here to bind events.
	 */
	_on_link_post()
	{
		this.input.addEventListener('input', ()=>{
			this._view_alters_value(this.input.value)
		})
	}

	/**
	 * Helper method to setup validation for this input that will require the input to be a number.
	 * 
	 * @param {string} [failure_text] Optional special failure text to display to user. If not provided, a
	 * 		generic message will be returned.
	 */
	validation_set_number(failure_text)
	{
		if(!failure_text) failure_text = "Input must be a number."
		this.validation_set((value)=>{return (!isNaN(value))}, failure_text)
	}

	/**
	 * Helper method to setup validation for this input that will require the input to be a validly parsable
	 * email.
	 * 
	 * @param {string} [failure_text] Optional special failure text to display to user. If not provided, a
	 * 		generic message will be returned.
	 */
	validation_set_email(failure_text)
	{
		if(!failure_text) failure_text = "Email is not in valid form."
		this.validation_set(validate_email, failure_text)
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
	validation_set_number_clamped(low, high, failure_text)
	{
		if(!failure_text) failure_text = "Input must be a number between " + low + " and " + high + "."
		this.validation_set((value)=>{
			if(isNaN(value)) return false
			num = Number(value)
			return (low <= num && num <= high)
		}, failure_text)
	}

	_on_graphical_render()
	{
		super._on_graphical_render()
		this.input.value = this.settings.value
	}
}

export {RegInInput}
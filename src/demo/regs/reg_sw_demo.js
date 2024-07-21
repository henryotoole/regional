// demo/reg_sw_demo.js
// Josh Reed 2024
//
// The switchyard class for the demo module. Although it is a region, I prefer to place it at the top
// level of a module rather than in the /regs folder.

import {RegionSwitchyard} from "../../regional/regional.js";
import {RegTelescope, RegText, RegSettings} from "../demo.js"

class RegSWDemo extends RegionSwitchyard
{
	/** @type {Region} Telescope region */
	reg_telescope
	/** @type {Region} Text area region */
	reg_text
	/** @type {Region} Overlay for text area settings */
	reg_settings
	/** @description Settings object for this region. This is local data which is erased on page refresh. */
	settings = {
		/** @description The currently active text to view and operate on. */
		text_active: undefined,
	}

	constructor()
	{
		super()

		// Manual location for data. Since this demo site is backendless, all 'data' is read only.
		// This is a little readonly data block that's loaded with text asynchronously after page load.
		this.data_readonly = {text: {}}

		this.call_on_load(()=>{this._load_available_text()})
	}

	/**
	 * This is called after linking is complete (just after _on_link_post()). This function can be overridden
	 * by child classes to explicitly instantiate subregions that are required for this region to function.
	 */
	_create_subregions()
	{
		// Example of the creation of a subregion via link to ID-in-DOM
		this.reg_telescope = (new RegTelescope()).link(this, document.getElementById('reg_telescope'))
		// Example of the creation of a subregion via Fabrication
		this.reg_text = (new RegText()).fab().link(this, document.getElementsByClassName('reg-text')[0])
		// Example of a subregion that's ethereal - an overlay.
		this.reg_settings = (new RegSettings()).fab().link(this, this.eth_reg_create()).etherealize()
	}

	/**
	 * Loads 'data' from text files that are statically available.
	 */
	_load_available_text()
	{
		this.data_readonly.names = {'clausewitz': "Clausewitz", 'robert_caro': "Robert Caro"}
		this.data_readonly.text = {}
		Object.keys(this.data_readonly.names).forEach((name)=>
		{
			fetch('./assets/' + name + '.txt')
				.then(response => response.text())
				.then((data) => {
					this.data_readonly.text[name] = data
					this._on_settings_refresh()
					this.graphical_render()
				})
		})
	}

	/**
	 * Get a CSRF token for this app. Behavior must be implemented in child app to work.
	 * 
	 * A CSRF token is not required for most RMF operations, but some key ones (like dispatch) will fail without it.
	 */
	token_get_csrf()
	{
		return "IRRELEVANT_FOR_DEMO"
	}

	_on_settings_refresh()
	{
		let texts = this.data_readonly.text
		// Choose either undefined or first 
		this.settings.text_active = (texts.length == 0) ? undefined : Object.keys(texts)[0]
	}
}

export {RegSWDemo}
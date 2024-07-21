// ../demo/regs/reg_telescope.js
// Josh Reed 2024
//
// A region that wraps an in-DOM set of elements that show a sort of view through a telescope.

import {Region, RHElement} from "../../regional/regional.js";

/**
 * The 'telescope' region provides a viewport with changing images and a 'zoom' function.
 * 
 * This region demonstrates:
 * 1. In-DOM element binding.
 * 2. Basic use of settings and graphical render. */
class RegTelescope extends Region
{
	/**
	 * This telescope region binds itself to pure HTML as already written in the DOM.
	 */
	constructor()
	{
		super()

		/** @type {RHElement} The large, circular 'portal' through which the user looks. */
		this.portal
		/** @type {RHElement} The view, an <img> tag */
		this.view
		/** @type {RHElement} Button to zoom out */
		this.zoom_out
		/** @type {RHElement} Button to zoom in */
		this.zoom_in

		/** @description Settings object for this region. This is local data which is erased on page refresh. */
		this.settings = {
			/** @description Level of zoom for the telescope */
			zoom_level: undefined,
		}

		/** @type {Array.<str>} List of relative reverences to image assets for telescope view */
		this.telescope_images = [
			"./assets/telescope_0.png",
			"./assets/telescope_1.png",
			"./assets/telescope_2.png",
			"./assets/telescope_3.png",
			"./assets/telescope_4.png"
		]
	}

	/**
	 * Fired after linking. It's safe to grab members here.
	 */
	_on_link_post()
	{
		// Bind members
		this.portal = this.member_get('portal')
		this.view = this.member_get('view')
		this.zoom_out = this.member_get('zoom_out')
		this.zoom_in = this.member_get('zoom_in')

		// Bind behaviors.
		this.zoom_in.addEventListener("click", (e)=>{this.settings_change_zoom(this.settings.zoom_level + 1)})
		this.zoom_out.addEventListener("click", (e)=>{this.settings_change_zoom(this.settings.zoom_level - 1)})
	}

	/**
	 * Change the zoom of the telescope.
	 * 
	 * @param {Number} new_zoom The zoom number, an integer between 0 and 4
	 */
	settings_change_zoom(new_zoom)
	{
		if(new_zoom > 4) new_zoom = 4
		if(new_zoom < 0) new_zoom = 0
		this.settings.zoom_level = new_zoom
		this.graphical_render()
	}

	/**
	 * This is called whenever this specific region has its settings refreshed. This is the preferred location
	 * to setup settings information in a Region subclass.
	 */
	_on_settings_refresh()
	{
		this.settings = {
			zoom_level: 0,
		}
	}

	/**
	 * This is called whenever this specific region has its settings refershed. This is the preferred location
	 * to actually place the code that will 'redraw' a region.
	 */
	_on_graphical_render()
	{
		this.portal.style.borderWidth = this.settings.zoom_level + 1 + "px"
		this.view.setAttribute('src', this.telescope_images[this.settings.zoom_level])
	}
}

export {RegTelescope}
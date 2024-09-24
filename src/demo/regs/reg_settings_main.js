// demo/regs/reg_settings_main.js
// Josh Reed 2024
//
// Demo region class for main settings pain.

import {Region, RHElement, Fabricator} from "regional"

class RegSettingsMain extends Region
{
	fab_get()
	{
		// Note that the toplevel nesting selector matches attribute rfm_reg="RegText". This attribute is
		// automatically added to regions' $reg element when they are linked.
		let css = /* css */`
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
		let html = /* html */`
			<div class='cont-main'>
				<div class='row'>
					<span class='row-entry'> Choose your hero: </span>
					<div rfm_member='hero_row' class='row row-entry'></div>
				</div>
			</div>
		`
		return new Fabricator(html).add_css_rule(css)
	}

	/** @type {RHElement} Row to populate with hero choice buttons */
	hero_row
	/** @description Settings object for this region. This is local data which is erased on page refresh. */
	settings = {
	}
	
	_on_link_post()
	{
		this.render_checksum_add_tracked('active_text', ()=>{return this.swyd.settings.text_active})
	}

	/**
	 * Call when the user selects a 'hero'. The name of this person will be key in swyd.data_readonly.texts.
	 * This function will select that setting at the swyd level and re-render all.
	 * 
	 * @param {string} hero_name The name of the selected hero (e.g. text)
	 */
	settings_select_hero(hero_name)
	{
		this.swyd.settings.text_active = hero_name
		this.swyd.render()
	}

	_on_render()
	{
		this.hero_row.empty()
		Object.keys(this.swyd.data_readonly.names).forEach((name)=>
		{
			this.hero_row.append(this._draw_hero_entry(name))
		})
	}

	/**
	 * Draw hero entry given a hero name and whether it is selected. Binds click behavior too.
	 * 
	 * @param {string} hero_name The name of the hero to select
	 * 
	 * @returns {RHElement} Entry
	 */
	_draw_hero_entry(hero_name)
	{
		let name = this.swyd.data_readonly.names[hero_name]
		let div = RHElement.wrap(document.createElement("button"))
		let is_selected = (this.swyd.settings.text_active == hero_name)
		let classes = is_selected ? "row-entry selected" : "row-entry"
		div.setAttribute("class", classes)
		div.textContent = name
		div.addEventListener("click", ()=>{this.settings_select_hero(hero_name)})
		return div
	}
}

export {RegSettingsMain}
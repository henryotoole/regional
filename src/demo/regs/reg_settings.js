// demo/regs/reg_settings.js
// Josh Reed 2024
//
// A region that demonstrates overlays in the form of a 'settings' page with multiple tabs.

import {Region, Fabricator, RHElement} from "../../regional/regional.js"
import {RegSettingsMain, RegSettingsCreds} from "../demo.js"

class RegSettings extends Region
{
	/** @type {RHElement} Button to activate main settings pane */
	tab_main
	/** @type {RHElement} Button to activate creds settings pane */
	tab_creds
	/** @type {RHElement} The area in which settings pane regions are loaded */
	pane
	/** @type {RHElement} The subset of the pane for the main settings region */
	el_settings_main
	/** @type {RHElement} The subset of the pane for the creds settings region */
	el_settings_creds
	/** @type {RHElement} The exit button */
	exit
	/** @type {Region} Subregion for main settings pane */
	reg_settings_main
	/** @type {Region} Subregion for creds settings pane */
	reg_settings_creds
	/** @description Settings object for this region. This is local data which is erased on page refresh. */
	settings = {
		/** @description Selective active pain by reference. */
		active_pane: undefined
	}

	fab_get()
	{
		// Note that the toplevel nesting selector matches attribute rfm_reg="RegText". This attribute is
		// automatically added to regions' $reg element when they are linked.
		let css = /* css */`
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
		let html = /* html */`
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
		return new Fabricator(html, {main_text: this.settings.text}).add_css_rule(css)
	}

	_on_link_post()
	{
		// Bind close behavior
		this.exit.addEventListener("click", ()=>{this.deactivate()})
		this.tab_main.addEventListener("click", ()=>{
			this.settings.active_pane = this.reg_settings_main
			this.graphical_render()
		})
		this.tab_creds.addEventListener("click", ()=>{
			this.settings.active_pane = this.reg_settings_creds
			this.graphical_render()
		})
	}

	_create_subregions()
	{
		this.reg_settings_main = (new RegSettingsMain()).fab().link(this, this.el_settings_main)
		this.reg_settings_creds = (new RegSettingsCreds()).fab().link(this, this.el_settings_creds)
	}

	_on_settings_refresh()
	{
		this.settings.active_pane = this.reg_settings_main
	}

	_on_graphical_render()
	{
		[this.reg_settings_main, this.reg_settings_creds].forEach((reg_pane)=>
		{
			if(reg_pane.id == this.settings.active_pane.id)
			{
				reg_pane.activate()
			}
			else
			{
				reg_pane.deactivate()
			}
		})
	}
}

export {RegSettings}
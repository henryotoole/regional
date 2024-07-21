// demo/regs/reg_settings_creds.js
// Josh Reed 2024
//
// Actual dummy region, existing only to show nesting.

import {Region, RHElement, Fabricator} from "../../regional/regional.js"

class RegSettingsCreds extends Region
{

	fab_get()
	{
		// Note that the toplevel nesting selector matches attribute rfm_reg="RegText". This attribute is
		// automatically added to regions' $reg element when they are linked.
		let css = /* css */`
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
		let html = /* html */`
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
		return new Fabricator(html).add_css_rule(css)
	}
}

export {RegSettingsCreds}
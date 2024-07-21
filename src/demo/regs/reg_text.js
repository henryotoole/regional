// ../demo/regs/reg_text.js
// Josh Reed 2024
//
// A region that's generated via a Fabricator and contains some text and a search input.

import {Region, RHElement, Fabricator, RegInInput} from "../../regional/regional.js";

/**
 * This region contains some text and an input that allows it to be searched, highlighting matching text.
 * It will fit itself to the element it is linked into.
 * 
 * This region demonstrates:
 * 1. A fabricated region (as opposed to in-DOM)
 * 2. Little, basic input regions.
 */
class RegText extends Region
{
	/** @type {RHElement} The text area where text is displayed and highlighted. */
	text
	/** @type {RHElement} The div tag that contains the search regin.*/
	regin_search_cont
	/** @type {RHElement} A little div tag containing the number of search occurrences.*/
	count
	/** @type {RHElement} A button to summon the settings overlay.*/
	settings
	/** @type {RegInInput} The search regin */
	regin_search
	/** @description Settings object for this region. This is local data which is erased on page refresh. */
	settings = {
		/** @description The text to search for and highlight */
		search_text: undefined,
	}

	/**
	 * Used here to load text from file and bind some handlers.
	 */
	_on_link_post()
	{
		this.swyd.call_on_load(()=>
		{
			fetch('./assets/clausewitz.txt')
				.then(response => response.text())
				.then((data) => {
					this.settings.text = data
					this.graphical_render()
				})
			console.log(document)
		})
		this.settings.addEventListener("click", ()=>{
			this.swyd.reg_settings.activate()
		})
	}

	_create_subregions()
	{
		// Create regin for text input
		this.regin_search = (new RegInInput()).fab().link(this, this.regin_search_cont, "search_text")
	}

	/**
	 * @returns {Number} The number of occurrences of the current search string in the main text.
	 */
	get occurrences()
	{
		if(!this.settings.search_text) return 0
		return this.master_text.split(this.settings.search_text).length - 1
	}

	/**
	 * NOTE: Text is stored at the swyd level because other regions at the same level as this region need
	 * to access it.
	 * 
	 * @returns {string} Text as selected setting at swyd level or "" if none selected.
	 */
	get master_text()
	{
		let text = this.swyd.data_readonly.text[this.swyd.settings.text_active]
		return (!text) ? "" : text
	}

	fab_get()
	{
		// Note that the toplevel nesting selector matches attribute rfm_reg="RegText". This attribute is
		// automatically added to regions' $reg element when they are linked.
		let css = /* css */`
			[rfm_reg="RegText"] {
				/* Hold the text area and search box vertically in a column. */
				& .cont_main {
					width: 100%; height: 100%;
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					justify-content: center;
				}
				& .text {
					width: calc(100% - 4px);
					flex-grow: 1;
					padding: 2px; border: 1px solid grey;
					border-radius: 5px;
					font-family: 'Courier New', sans-serif;
					overflow-y: scroll;
				}
				& .regin-search-cont {
					margin-top: 1vw;
					margin-bottom: 1vw;
				}
				& .count {
					margin-left: 1vw;
				}
				& .row {
					display: flex;
					flex-direction: row;
					align-items: center;
				}
				& .btn-settings {
					align-self: flex-end;
				}
			}
		`
		let html = /* html */`
			<div class='cont_main'>
				<label> Try out the search feature! </label>
				<div rfm_member='text' class='text'> Text loading... </div>
				<div class='row' style='width: 100%; justify-content: space-between'>
					<div class='row'>
						<div rfm_member='regin_search_cont' class='regin-search-cont'></div>
						<div class='count'>Occurrences:</div>
						<div rfm_member='count' class='count'> 0 </div>
					</div>
					<button rfm_member='settings'> Settings </button>
				</div>
			</div>
		`
		return new Fabricator(html).add_css_rule(css)
	}
	
	_on_settings_refresh()
	{
		this.settings.search_text = ""
	}

	_on_graphical_render()
	{
		this.text.empty()
		this._draw_text_children(this.master_text, this.settings.search_text).forEach((child)=>{
			this.text.append(child)
		})
		this.count.textContent = this.occurrences
	}

	/**
	 * @private
	 * This draw function returns  child elements that can be placed in a <span> to read text in paragraph
	 * form with some text highlighted.
	 * 
	 * NOTE: This winds up being a bit ugly because of the string manipulation. A more clear example
	 * of a _draw function can be found in the demo regions for settings.
	 * 
	 * @param {string} master The master text to completely render with some highlighting
	 * @param {string} search The search string. Matching text in master will be highlighted. If empty string
	 * 		or undefined, do nothing.
	 * 
	 * @returns {Array.<RHElement>} Child elements for text box.
	 */
	_draw_text_children(master, search)
	{
		// First convert 'master' into paragraphs.
		let paras = master.split('\n')

		// Highlight sections of each para.
		let paras_hl = []
		paras.forEach((para)=>
		{
			let para_hl = []
			if(search)
			{
				para.split(search).forEach((non_higlighted_segment, i_hl, arr_hl)=>
				{
					para_hl.push(non_higlighted_segment)
					if((i_hl + 1) < arr_hl.length)
					{
						let el_mark = document.createElement("mark")
						el_mark.textContent = search
						para_hl.push(el_mark)
					}
				})
			}
			else
			{
				para_hl = [para]
			}
			paras_hl.push(para_hl)
		})

		// Now construct the elements.
		let els = []
		paras_hl.forEach((para_hl, i, arr)=>
		{
			let span = document.createElement("span")
			para_hl.forEach((hl_child)=>{span.append(hl_child)})
			els.push(span)
			if((i + 1) < arr.length) els.push(document.createElement("br"))
		})

		return els
	}
}

export {RegText}
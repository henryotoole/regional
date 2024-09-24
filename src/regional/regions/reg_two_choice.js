/**
 * @file The venerable two-choice region - similar to window.confirm()
 * @author Josh Reed
 */

import { Region, Fabricator, RHElement } from "../regional.js";

/**
 * The two-choice region is essentially just a regional implementation of window.confirm(). Rather than
 * blocking all action, however, the two-choice region issues a promise that resolves when the interface
 * is accepted, denied, or deactivated.
 * 
 * As many instances of this region as desired may be created. However, in its simplest use-case, it's enough
 * to merely call:
 * 
 * ```
 * reg_two_choice.present_choice("Title", "Message text", "Deny", "Confirm").then(()=>
 * {
 *     // Perform on-confirm action
 * }).catch(()=>
 * {
 *     // Perform on-deny action
 * })
 * ```
 * 
 * This region will likely require styling in most cases. The class may always be extended with a custom get_fab()
 * method. More conveniently, the members can be accessed directly and have their individual classes tweaked:
 * 
 * ```
 * reg_two_choice.text.classList.add('custom-class-text')
 * reg_two_choice.title.classList.add('custom-class-title')
 * ```
 */
class RegTwoChoice extends Region
{
	fab_get()
	{
		let css = /* css */`
			[rfm_reg="RegTwoChoiceNav"] {
				& .cont
				{
					max-width: 30em;
					padding: 0.5em;
					background-color: white;
				}
				& .title
				{
					
				}
				& .text
				{
					padding-top: 0.5em;
					padding-bottom: 0.5em;
				}
				& .row
				{
					display: flex; flex-direction: row; justify-content: space-between;
				}
				$ .btn
				{
					cursor: pointer;
				}
			}
		`
		let html = /* html */`
			<div rfm_member='cont' class='cont'>
				<div rfm_member="title" class='title'>Title</div>
				<div rfm_member="text" class='text'>Text</div>
				<div class='row'>
					<button class='btn' rfm_member="deny"> Deny </button>
					<div style="width: 5em"></div>
					<button class='btn' rfm_member="confirm"> Confirm </button>
				</div>
			</div>
		`
		return new Fabricator(html).add_css_rule(css)
	}
	
	/** @type {RHElement}*/
	cont
	/** @type {RHElement}*/
	title
	/** @type {RHElement}*/
	text
	/** @type {RHElement}*/
	deny
	/** @type {RHElement}*/
	confirm
	/** @type {Function} The promise resolve created when a choice is actively presented. */
	_choice_promise_res
	/** @type {Function} The promise reject created when a choice is actively presented. */
	_choice_promise_rej

	_on_link_post()
	{
		this.deny.addEventListener('click', ()=>{this.choice_deny()})
		this.confirm.addEventListener('click', ()=>{this.choice_confirm()})
	}

	/**
	 * Deny the active choice promise, if there is one.
	 */
	choice_deny()
	{
		if(this._choice_promise_rej == undefined) return
		this._choice_promise_rej()
	}

	/**
	 * Confirm the active choice promise, if there is one.
	 */
	choice_confirm()
	{
		if(this._choice_promise_res == undefined) return
		this._choice_promise_res()
	}

	/**
	 * Present the user with a choice. The choice is configured by the parameters below. This region will
	 * be re-rendered with the provided input and activated.
	 * 
	 * A promise is returned that will resolve if the user clicks the confirm button or reject if the user
	 * clicks the deny button or deactivates the region.
	 * 
	 * @param {String} title The title of the overlay
	 * @param {String} text The text of the overlay. This should explain what the user is being asked to confirm
	 * @param {String} deny_label The text of the 'deny' button. Defaults to "Deny"
	 * @param {String} confirm_label The text of the 'confirm' button. Defaults to "Confirm"
	 */
	async present_choice(title, text, deny_label="Deny", confirm_label="Confirm")
	{
		// Activate and setup
		this.activate()
		this.settings.title = title
		this.settings.text = text
		this.settings.deny = deny_label
		this.settings.confirm = confirm_label
		this.render()

		// Return new promise context.
		return new Promise((res, rej)=>
		{
			this._choice_promise_res = res
			this._choice_promise_rej = rej
		}).finally(()=>
		{
			this._choice_promise_res = undefined
			this._choice_promise_rej = undefined
			this.deactivate()
		})
	}
	
	_on_settings_refresh()
	{
		this.settings.title = "Make A Choice"
		this.settings.text = "Either confirm or deny this action."
		this.settings.deny = "Deny"
		this.settings.confirm = "Confirm"
	}

	_on_render()
	{
		this.title.text(this.settings.title)
		this.text.text(this.settings.text)
		this.deny.text(this.settings.deny)
		this.confirm.text(this.settings.confirm)
	}

	_on_deactivate()
	{
		// Call deny, won't do anything if already called.
		this.deny()
	}
}

export { RegTwoChoice }
/**
 * @file The venerable one-choice region - similar to window.alert()
 * @author Josh Reed
 */

import { Region, Fabricator, RHElement } from "../regional.js";

/**
 * The two-choice region is essentially just a regional implementation of window.alert(). Rather than
 * blocking all action, however, the one-choice region issues a promise that resolves when the interface's
 * sole button is clicked.
 * 
 * As many instances of this region as desired may be created. However, in its simplest use-case, it's enough
 * to merely call:
 * 
 * ```
 * reg_one_choice.present_choice("Title", "Message text", "Continue").then(()=>
 * {
 *     // Perform continue action.
 * })
 * ```
 * 
 * This region will likely require styling in most cases. The class may always be extended with a custom get_fab()
 * method. More conveniently, the members can be accessed directly and have their individual classes tweaked:
 * 
 * ```
 * reg_one_choice.text.classList.add('custom-class-text')
 * reg_one_choice.title.classList.add('custom-class-title')
 * ```
 */
class RegOneChoice extends Region
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
					display: flex; flex-direction: row; justify-content: flex-end;
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
					<button class='btn' rfm_member="continue"> Continue </button>
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
	continue
	/** @type {Function} The promise resolve created when a choice is actively presented. */
	_choice_promise_res

	_on_link_post()
	{
		this.continue.addEventListener('click', ()=>{this.choice_continue()})
	}

	/**
	 * Called when the user clicks the continue button.
	 */
	choice_continue()
	{
		if(this._choice_promise_res == undefined) return
		this._choice_promise_res()
	}

	/**
	 * Present the user with a message. The message is configured by the parameters below. This region will
	 * be re-rendered with the provided input and activated.
	 * 
	 * A promise is returned that will resolve when the user clicks the continue button.
	 * 
	 * @param {String} title The title of the overlay
	 * @param {String} text The text of the overlay. This should explain what the user is being asked to confirm
	 * @param {String} continue_label The text of the 'continue' button. Defaults to "Continue"
	 */
	async present_message(title, text, continue_label="Continue")
	{
		// Activate and setup
		this.activate()
		this.settings.title = title
		this.settings.text = text
		this.settings.continue = continue_label
		this.render()

		// Return new promise context.
		return new Promise((res, rej)=>
		{
			this._choice_promise_res = res
		}).finally(()=>
		{
			this._choice_promise_res = undefined
			this.deactivate()
		})
	}
	
	_on_settings_refresh()
	{
		this.settings.title = "Make A Choice"
		this.settings.text = "Either confirm or deny this action."
		this.settings.continue = "Continue"
	}

	_on_render()
	{
		this.title.text(this.settings.title)
		this.text.text(this.settings.text)
		this.continue.text(this.settings.continue)
	}

	_on_deactivate()
	{
		// Call deny, won't do anything if already called.
		this.choice_continue()
	}
}

export { RegOneChoice }
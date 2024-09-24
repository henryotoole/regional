/**
 * @file Class for a RegIn that wraps an <input> for textarea.
 * @author Josh Reed
 */

import { RegIn, RHElement, Fabricator, str_locations } from "../regional.js"

/**
 * The RegInTextarea class wraps the generic <textarea> tag. By default, the resulting textarea will not be
 * resizable and will take the width and height of its container (e.g. width/height = 100%). Also by default,
 * tab will be bound to the textarea to create a true tab.
 * 
 * Class property `tab_enabled` can be set to false to disable tab behaviors.
 * 
 * This wrapper implements its own Undo / Redo feature. When debouncing is enabled, only properly 'debounced'
 * states will actually be remembered. This is handy so that CTRL+Z does not need to be pressed for every
 * single character.
 * 
 * The fabricator for this input by default generates the following structure:
 * 
 * ```
 * <textarea rfm_member='textarea' class='textarea'></textarea>
 * ```
 * 
 * To have custom HTML in your own class, simply subclass RegInTextArea and override the fab_get() function to
 * return something with, at least, a textarea with rfm_member='textarea'.
 * 
 * To change the styling without making a subclass, it's possible to do something like the below, perhaps with
 * class names that are scoped to the containing region:
 * 
 * ```
 * let rita = new RegInTextarea().fab().link(...)
 * rita.textarea.setAttribute('class', 'custom-class-name')
 * ```
 */
class RegInTextArea extends RegIn
{
	/** @type {RHElement} */
	textarea
	/** @type {Boolean} Whether or not the more complex tab-behavior is enabled. */
	tab_enabled
	/** @type {Array} A list of states, in order from newest to oldest, that this textarea has had. */
	_undo_states
	/** @type {Array} A list of states, in order from newest to oldest, that we have 'undone'. */
	_redo_states
	/** @type {Number} The max number of undo states that will be stored at a time */
	_undo_max_states

	constructor(...args)
	{
		super(...args)
		this.tab_enabled = true
		this._undo_states = []
		this._undo_max_states = 20
	}

	fab_get()
	{
		let css = /* css */`
			[rfm_reg="RegInTextArea"] {
				/* Hold the text area and search box vertically in a column. */
				& .textarea {
					box-sizing: border-box;
					resize: none;
					height: 100%;
					width: 100%;
					tab-size: 4;
				}
			}
		`
		let html = /* html */`
			<textarea rfm_member='textarea' class='textarea' spellcheck="false"></textarea>
		`
		return new Fabricator(html).add_css_rule(css)
	}

	/**
	 * This is called after linking is complete. It is used here to bind events.
	 */
	_on_link_post()
	{
		// Adding an input event catches the regular input events. It does so *after* the keypress, which is
		// important for state management.
		this.textarea.addEventListener('input', (e)=>{
			// Note that textarea value and selection numbers have already updated as a result of the keydown
			// action by the time this code is executed.
			this._view_alters_value(this.textarea.value)
		})
		// However, keydown must also be listenend to so we can catch tab before it tabs away from the textarea.
		this.textarea.addEventListener('keydown', (e)=>{
			let start = this.textarea.selectionStart, end = this.textarea.selectionEnd

			// Part of a hack to make selection work with 'undo' properly.
			this.settings.selmem = {start: start, end: end}

			// Process events.
			if(this.tab_enabled && e.key == 'Tab')
			{
				e.preventDefault()

				let out;
				if(e.shiftKey)
				{
					out = RegInTextArea._text_shift_tab_behavior_alter(this.textarea.value, start, end)
				}
				else
				{
					out = RegInTextArea._text_tab_behavior_alter(this.textarea.value, start, end)
				}
				
				this.textarea.value = out.text
				this.textarea.selectionEnd = out.selend
				this.textarea.selectionStart = out.selstart

				// It is necessary to update the value with the new tab included.
				this._view_alters_value(this.textarea.value)
			}
			if(this.tab_enabled && e.key == 'Enter')
			{
				e.preventDefault()
				let out = RegInTextArea._text_newline_behavior_alter(this.textarea.value, start, end)
				this.textarea.value = out.text
				this.textarea.selectionEnd = out.selend
				this.textarea.selectionStart = out.selstart

				// It is necessary to update the value with the new tab included.
				this._view_alters_value(this.textarea.value)
			}
			if(e.ctrlKey && e.code == "KeyZ")
			{
				e.preventDefault()
				this.undo()
				// do NOT call view_alter function
			}
			if(e.ctrlKey && e.code == "KeyY")
			{
				e.preventDefault()
				this.redo()
				// do NOT call view_alter function
			}
		})
	}

	get sel()
	{
		return `<${this.textarea.selectionStart}:${this.textarea.selectionEnd}>`
	}

	/**
	 * Extended here to capture undo / redo state.
	 */
	_view_alters_value_prosecute_update(value)
	{
		// Catch the event
		this._undo_state_add(this.settings.value)
		// As the user has made a change, the redo stack must clear
		this._redo_states = []

		// Now that PREVIOUS state has been captured, ask for next.
		super._view_alters_value_prosecute_update(value)

		// Update the selection settings. The value was just updated in the previous step.
		this.settings.sel = {start: this.textarea.selectionStart, end: this.textarea.selectionEnd}
	}

	/**
	 * Causes this textarea to revert to the most recent 'undo' state. This includes the content and the
	 * selection locations.
	 */
	undo()
	{
		let state = this._undo_states.shift()
		if(state == undefined) return

		// Add this to the redo stack. It will persist until another undo state is added
		this._redo_state_add(this.settings.value)

		// Actually update the view.
		this.settings.value = state.value
		this._view_alter_propagate(state.value)
		this.textarea.selectionStart = state.sel.start
		this.textarea.selectionEnd = state.sel.end
	}

	/**
	 * Causes this textarea to re-revert back up the 'redo' chain of 'undo' states that have resulted from
	 * a series of 'undo' operations. The 'redo' chain only exists after a series of consecutive undo
	 * operations has occured and before further action from the view has taken place.
	 */
	redo()
	{
		let state = this._redo_states.shift()
		if(state == undefined) return

		// Add this **back** to the undo stack. Undo and redo can be chained infinitely back and forth.
		this._undo_state_add(this.settings.value)

		// Actually update the view.
		this.settings.value = state.value
		this._view_alter_propagate(state.value)
		this.textarea.selectionStart = state.sel.start
		this.textarea.selectionEnd = state.sel.end
	}


	/**
	 * Add an 'undo' state to the list. This will become the most recent state. If the undo state list is long
	 * enough, the oldest previous state will be removed. A true copy will be created, all references purged.
	 * 
	 * @param {*} value Some value, which should correspond to this.settings.value. Must be JSON-serializable
	 */
	_undo_state_add(value)
	{
		this._undo_states.unshift(JSON.parse(JSON.stringify(
		{
			sel: {start: this.settings.selmem.start, end: this.settings.selmem.end},
			value: value,
		})))
	}

	/**
	 * Add a 'redo' state to the list. The 'redo' list is only available when a series of 'undo's have just
	 * occurred. The moment that another 'undo' state is added, the 'redo' state is cleared and no longer
	 * available.
	 * 
	 * @param {*} value Some value, which should correspond to this.settings.value. Must be JSON-serializable
	 */
	_redo_state_add(value)
	{
		this._redo_states.unshift(JSON.parse(JSON.stringify(
		{
			sel: {start: this.settings.selmem.start, end: this.settings.selmem.end},
			value: value,
		})))
	}

	/**
	 * This implements a different newline event behavior for the textarea. In this behavior, newline inserts
	 * a newline **followed by the same number of tabs** as the preceeding line has before any text.
	 * 
	 * @param {String} text Text at the start of the newline event.
	 * @param {Number} selstart The index, in the string, of selection start
	 * @param {Number} selend The index, in the string, of the selection end
	 * 
	 * @returns {Object} With keys: text, selstart, selend for the new configuration of this text selection.
	 */
	static _text_newline_behavior_alter(text, selstart, selend)
	{
		let out = {text: ""}

		// Selection range is irrelevant - we care ONLY about the number of tabs in the sel-start line to
		// the left of the selection.
		let text_i = selstart - 1, n_tabs = 0
		// Simply roll back to either start of line or start of text and count tab chars.
		while(text_i >= 0)
		{
			if(text[text_i] == "\t") n_tabs += 1
			if(text[text_i] == "\n") break
			text_i--
		}

		// Now insert the newline and the number of tabs. Delete selected range.
		let inserted = "\n"
		for(let x = 0; x < n_tabs; x++)
		{
			inserted += "\t"
		}
		out.text = text.substring(0, selstart) + inserted + text.substring(selend)
		out.selstart = selstart + inserted.length
		out.selend = out.selstart

		return out
	}

	/**
	 * Determine how to modify text in a textarea as the result of a tab keydown even in which SHIFT is not held.
	 * 
	 * If selection is a point, a tab is inserted.
	 * If selection is a one-line range, then the range is deleted and tab is inserted.
	 * If selection is a multi-line range, tabs are inserted at the start of all lines and no text is deleted.
	 * 
	 * @param {String} text The value of the text when this behavior event occurred
	 * @param {Number} selstart The index, in the string, of selection start when event occurred
	 * @param {Number} selend The index, in the string, of the selection end when the event occurred
	 * 
	 * @returns {Object} With keys: text, selstart, selend for the new configuration of this text selection.
	 */
	static _text_tab_behavior_alter(text, selstart, selend)
	{
		let out = {text: ""}
		// "Point" selection
		if(selstart == selend)
		{
			out.text = text.substring(0, selstart) + "\t" + text.substring(selend)
			out.selstart = selstart + 1
			out.selend = out.selstart
			return out
		}

		// "Range" selection
		let seltext = text.substring(selstart, selend)
		// One-line
		if(seltext.indexOf("\n") == -1)
		{
			out.text = text.substring(0, selstart) + "\t" + text.substring(selend)
			out.selstart = selstart + 1
			out.selend = out.selstart
		}
		// Multi-line
		else
		{
			// Break into lines and iterate across entire string while keeping track of index.
			let selected_lines = RegInTextArea._text_get_selected_lines(text, selstart, selend)
			out.text = text
			selected_lines.reverse().forEach((first_char_i)=>
			{
				if(first_char_i == text.length)
				{
					out.text += "\t"
				}
				else
				{
					out.text = out.text.substring(0, first_char_i) + "\t" + out.text.substring(first_char_i)
				}
			})
			out.selend = selend + selected_lines.length
			out.selstart = selstart
		}
		return out
	}

	/**
	 * Determine how to modify text in a textarea as the result of a tab event in which SHIFT is also held.
	 * 
	 * If selection is a point following a tab character, the character is removed.
	 * If selection is a one-line range, nothing occurs
	 * If selection is a multi-line range, all lines with a tab character at the start of the line have that
	 *    tab character removed.
	 * 
	 * @param {String} text The value of the text when this behavior event occurred
	 * @param {Number} selstart The index, in the string, of selection start when event occurred
	 * @param {Number} selend The index, in the string, of the selection end when the event occurred
	 * 
	 * @returns {Object} With keys: text, selstart, selend for the new configuration of this text selection.
	 */
	static _text_shift_tab_behavior_alter(text, selstart, selend)
	{
		let out = {text: ""}
		// "Point" selection
		if(selstart == selend)
		{
			if(text.indexOf('\t') != -1)
			out.text = text.substring(0, selstart - 1) + text.substring(selend)
			out.selstart = selstart - 1
			out.selend = out.selstart
			return out
		}

		// "Range" selection
		let seltext = text.substring(selstart, selend)
		// One-line (do nothing)
		if(seltext.indexOf("\n") == -1) return {'text': text, 'selstart': selstart, 'selend': selend}

		// Multi-line
		// Break into lines and iterate across entire string while keeping track of index.
		let selected_lines = RegInTextArea._text_get_selected_lines(text, selstart, selend), n_remd = 0
		out.text = text
		selected_lines.reverse().forEach((first_char_i)=>
		{
			if(first_char_i == text.length)
			{
				// Do nothing, as there's no tab there. This is the special 'last line selected' case.
			}
			else
			{
				// If first char is a tab, remove it.
				if(out.text[first_char_i] == "\t")
				{
					n_remd += 1
					out.text = out.text.substring(0, first_char_i) + out.text.substring(first_char_i + 1)
				}
			}
		})
		out.selend = selend - selected_lines.length
		out.selstart = selstart

		return out
	}

	/**
	 * Get a list of selected-line start indices.
	 * 
	 * A line is 'selected' if any of the selection range touches this line. This includes the final
	 * 'empty string' line. If there's a trailing newline that is selected, it will be given an index
	 * that's actually NOT IN THE PROVIDED 'text' string. It will be equal to the length of the string.
	 * 
	 * @param {String} text Text to search through
	 * @param {Number} selstart The index, in the string, of selection start
	 * @param {Number} selend The index, in the string, of the selection end
	 * 
	 * @returns {Array.<Number>} A list of indices of the first character of each selected line.
	 */
	static _text_get_selected_lines(text, selstart, selend)
	{
		// Break into lines and iterate across entire string while keeping track of index.
		let lines = text.split("\n"), line, text_i = 0, line_contained_selection = false, sel_line_indices = [],
			line_start = 0
		for(let line_i = 0; line_i < lines.length; line_i++)
		{
			// Define our start variables
			line_contained_selection = false
			line = lines[line_i]
			line_start = text_i

			// Iterate across the whole line and see if any part of it contained the selection.
			for(let char_i = 0; char_i < line.length; char_i++)
			{
				if(line[char_i] != text[text_i]) throw "DEVCHECK"
				if(selstart <= text_i && text_i <= selend + 1) line_contained_selection = true
				text_i += 1
			}
			// Check the actual newline character too. For text where the very last char is a newline, this
			// ensures that it is given a tab.
			if(selstart <= text_i && text_i <= selend + 1) line_contained_selection = true

			// If it dis, insert a tab. As the line has not yet been appended, tab can simply be inserted
			// now.
			if(line_contained_selection)
			{
				sel_line_indices.push(line_start)
			}

			// Account for the newline char that was stripped.
			if(line_i != (lines.length - 1))
			{
				text_i += 1
			}
		}
		return sel_line_indices
	}

	/**
	 * Extended to add the selection flags. These are needed for UNDO / REDO tracking.
	 */
	_on_settings_refresh()
	{
		// Selmem is a bit of a hack. It remembers the selection state from before "input" event so that
		// it is still available in it's original form when the event fires and records the 'undo' state.
		// selmem is NOT part of a VMC cycle and should not be used to render things on the page.
		this.settings.selmem = {start: 0, end: 0}
	}

	_on_render()
	{
		super._on_render()
		this.textarea.value = this.settings.value
	}
}

export {RegInTextArea}
// src/etc/rhtml_el.js
// Josh Reed 2024
//
// A wrapper for the basic HTMLElement

// 
// I have a confession to make.
// 
// I liked JQuery. Not what many wound up creating with it, but I liked the core of the thing. Being
// able to just call hide() on an element was pretty nice. So, this is my little wrapper for the
// HTMLElement class that adds just a little spice to the mix.
// 

/**
 * The RHElement class is a simple wrapper for the normal HTMLElement class that adds just a litle bit
 * of functionality.
 */
class RHElement extends HTMLElement
{
	// Typehint declarations.
	/** @description Add a custom place to put data, tied to only one key to prevent collisions. */
	_reg_ds = {
		/** @description This remembers what display was set to before hide() was called */
		sh_display,
		/** @description Whether or not the 'hide()' behavior is currently active */
		sh_is_hidden,
	}

	/**
	 * Wrap the provided element, returning a new instance of RHElement. This is the only way, currently,
	 * to instantiate a new RHElement.
	 * 
	 * @param {HTMLElement} el Element to wrap
	 * 
	 * @returns {RHElement} The same element, but wrapped to have RHElement functionality.
	 */
	static wrap(el)
	{
		// Don't wrap if already wrapped!
		if(el._reg_ds) return el

		el._reg_ds = {
			sh_is_hidden: false,
			sh_display: undefined
		}

		// Ok some internal notes
		// Altering the prototype here would enable a better-feeling RHElement. instanceof, for example,
		// would actually work. However, prototype alteration is allegedly very slow and intensive for
		// browsers to perform on the fly. The correct method is probably to learn enough about Element's
		// to actually create a clone method with pointers, or something. For now, this sort of hack works.
		
		el.hide = RHElement.prototype.hide.bind(el)
		el.show = RHElement.prototype.show.bind(el)
		el.empty = RHElement.prototype.empty.bind(el)

		return el
	}

	/**
	 * Hide this element by applying 'display: none' to the style. The original style display, if it existed,
	 * will be remembered.
	 */
	hide()
	{
		if(this._reg_ds.sh_is_hidden) return

		this._reg_ds.sh_is_hidden = true
		this._reg_ds.sh_display = this.style.display
		this.style.display = "none"
	}

	/**
	 * Show an element that was previously hidden. This achieves this by removing display: none from
	 * the style and replacing it with whatever display was set to before (including nothing)
	 */
	show()
	{
		if(!this._reg_ds.sh_is_hidden) return

		this._reg_ds.sh_is_hidden = false
		this.style.display = this._reg_ds.sh_display
		this._reg_ds.sh_display = undefined
	}

	/**
	 * Remove all child elements of this element.
	 */
	empty()
	{
		// https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
		while (this.firstChild)
		{
			this.removeChild(this.lastChild);
		}
	}
}

export { RHElement }
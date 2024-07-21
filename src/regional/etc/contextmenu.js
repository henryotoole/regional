// contextmenu.js
// Josh Reed 2020
//
// A general purpose context menu handling class. Hope this is worth having it's own file.
// This works very closesly with RegionApp

import { Region } from "./module.js"

class ContextMenu
{
	static get base_z_index() {return Region.overlay_base_z_index + 100}

	/**
	 * Instantiate a context menu which will autobind itself to the provided DOM element.
	 * 
	 * @param {JQuery dom} $dom The graphical element which will now have a context menu
	 * @param {Region} region The region instance to which that element belongs.
	 */
	constructor($dom, region)
	{
		this.$dom = $dom
		this.app = region.app
		this.region = region

		this._customs = [] // List of custom actions that have been bound.

		$dom.contextmenu(this.menu_render.bind(this))
	}

	/**
	 * Bind an option and function call for a 'Copy' feature. If no advanced handling is needed for this then simply provide no args.
	 * @param {Function} selectall_fn Function to be called when 'Copy' is chosen. Provided with args: event, control_type.
	 */
	copy_fn(copy_fn)
	{
		if(copy_fn == undefined)
		{
			copy_fn = this.app.clipboard.copy.bind(this.app.clipboard)
		}
		this._copy_fn = copy_fn
		this._copy = 1
		return this
	}

	/**
	 * Bind an option and function call for a 'Paste' feature. If no advanced handling is needed for this then provide undefined to paste_fn
	 * @param {Function} paste_fn The function to be called when 'Paste' is chosen. Provided with args: event, control_type.
	 * @param {Function} paste_fn_val This function is called on render to determine whether the paste option is 'active' (grey or not).
	 * It should return False to greyout the option, or True to keep it active.
	 */
	paste_fn(paste_fn, paste_fn_val)
	{
		// These functions will know what is on the clipboard.
		if(paste_fn == undefined)
		{
			paste_fn = this.app.clipboard.paste.bind(this.app.clipboard)
		}
		if(paste_fn_val == undefined)
		{
			paste_fn_val = function() {return 1}
		}
		this._paste_fn = paste_fn
		this._paste_fn_val = paste_fn_val
		this._paste = 1
		return this
	}

	/**
	 * Bind an option and function call for a 'Select' feature
	 * @param {Function} selectall_fn Function to be called when 'Select' is chosen. No args provided.
	 */
	select_fn(select_fn)
	{
		this._select_fn = select_fn
		this._select = 1
		return this
	}

	/**
	 * Bind an option and function call for a 'Select All' feature
	 * @param {Function} selectall_fn Function to be called when 'Select All' is chosen. No args provided.
	 */
	selectall_fn(selectall_fn)
	{
		this._selectall_fn = selectall_fn
		this._selectall = 1
		return this
	}

	/**
	 * Bind an option and function call for a 'Delete' feature
	 * @param {Function} delete_fn Function to be called when 'Delete' is chosen. No args provided.
	 */
	delete_fn(delete_fn)
	{
		this._delete_fn = delete_fn
		this._delete = 1
		return this
	}

	/**
	 * Add a custom context menu option with a name and callback.
	 * @param {String} name The name of this cm button in the menu.
	 * @param {Function} custom_fn This function is called when this cm button is clicked. Event is provided as arg
	 * @param {Function} custom_fn_val OPTIONAL: This function is called on render to determine whether the paste option is 'active' (grey or not).
	 * It should return False to greyout the option, or True to keep it active.
	 */
	custom_fn(name, custom_fn, custom_fn_val)
	{
		// Handle defaults
		custom_fn_val = custom_fn_val || function() {return 1}
		
		// Add to list of custom functions.
		this._customs.push({
			name: name,
			fn: custom_fn,
			fn_val: custom_fn_val
		})

		return this
	}

	/**
	 * Hook so that child classes can modify the menu with css
	 * @param {JQuery DOM} $menu_dom The 
	 */
	on_menu_render($menu_dom) {}

	/**
	 * Render a simple row option with a name for the context menu.
	 * @param {String} name The name of this option
	 */
	menu_render_get_btnrow(name)
	{
		var $row = $("<div></div>")
			.addClass('regcss-ctxm-option').addClass('regcss-ctxm-ident').addClass('f-brandon-title').html(name)
		// Go ahead and bind the menu clearing to this $dom. It will stack with any others assigned with .click().
		$row.click(this.menu_clear.bind(this));
		return $row
	}

	/**
	 * Get the $dom for the main contextmenu div
	 */
	menu_render_get_main()
	{
		return $('<div></div>').addClass('regcss-ctxm-main').addClass('regcss-ctxm-ident').css('left', '-9999px').css('top', '0px').css('z-index', ContextMenu.base_z_index)
	}

	/**
	 * Render the context menu on screen at the appropriate location given the right click location.
	 * @param {Event} e The click event from $.contextmenu()
	 */
	menu_render(e)
	{
		e.stopPropagation(); e.preventDefault();
		console.log("Context menu active");

		// Make this region focused.
		this.app.focus_region_set(this.region)

		this.menu_clear(); // Clear old one if it still exists.
		var ww = window.innerWidth,
			wh = window.innerHeight,
			cx = e.clientX,
			cy = e.clientY,
			ctxt = 0, ctxl = 0;

		
		this.$ctm_main = this.menu_render_get_main(); // The menu itself
		this.$ctm_ovl = $("<div></div>").addClass('regcss-ctxm-ovl').append(this.$ctm_main); // A clear overlay that intercepts clicks.

		// Clears the whole context unless we have in fact clicked the context itself.
		var clear_fn = function(e)
		{
			e.stopPropagation(); e.preventDefault();
			// If we click anywhere in the window except a part of the context menu, clear the context menu.
			if(!$(event.target).hasClass('regcss-ctxm-ident'))
			{
				this.menu_clear()
			}
		}.bind(this)
		this.$ctm_ovl.click(clear_fn)
		this.$ctm_ovl.contextmenu(clear_fn)

		// Custom functions appear at the top
		for(var x = 0; x < this._customs.length; x++)
		{
			var custom = this._customs[x]
			var $row = this.menu_render_get_btnrow(custom.name)
			var can_click = custom.fn_val()
			if(can_click)
			{
				$row.click(function(custom_block, event)
				{
					// Call custom fn with the original 'this' context and a few arguments.
					custom_block.fn(event)
				}.bind(this, custom, e))
			}
			else
			{
				$row.addClass('regcss-ctxm-option-disabled')
			}
			this.$ctm_main.append($row)
		}

		// Add all the options individually here.
		if(this._copy)
		{
			var $row = this.menu_render_get_btnrow('Copy')
			$row.click(function()
			{
				// Call copy_fn with the original 'this' context and a few arguments.
				this._copy_fn(e, this.app.clipboard.control_types.rightclick)
			}.bind(this))
			this.$ctm_main.append($row)
		}

		if(this._paste)
		{
			// There must be something copied, and that copied thing must be valid for this paste region.
			var can_paste = this.app.clipboard.has_copied() && this._paste_fn_val()
			var $row = this.menu_render_get_btnrow('Paste')
			console.log(this.app.clipboard.has_copied())
			console.log(this._paste_fn_val())
			if(can_paste)
			{
				$row.click(function()
				{
					this._paste_fn(e, this.app.clipboard.control_types.rightclick)
				}.bind(this))
			}
			else
			{
				$row.addClass('regcss-ctxm-option-disabled')
			}
			this.$ctm_main.append($row)
		}

		if(this._select)
		{
			var $row = this.menu_render_get_btnrow('Select')
			$row.click(this._select_fn)
			this.$ctm_main.append($row)
		}

		if(this._selectall)
		{
			var $row = this.menu_render_get_btnrow('Select All')
			$row.click(this._selectall_fn)
			this.$ctm_main.append($row)
		}

		if(this._delete)
		{
			var $row = this.menu_render_get_btnrow('Delete')
			$row.click(this._delete_fn)
			this.$ctm_main.append($row)
		}

		// Hook for child classes to modify ctm_main if they want.
		this.on_menu_render(this.$ctm_main)

		//Go ahead and render it really far offscreen so we can get a width and height
		$('body').append(this.$ctm_ovl);
		var ctmw = this.$ctm_main.width(), ctmh = this.$ctm_main.height();
		
		// Flip the side of the mouse to render the menu if it exceeds page dimensions
		ctxt = ((cx + ctmw) > ww) ? cx - ctmw : cx;
		ctxl = ((cy + ctmh) > wh) ? cy - ctmh : cy;
		
		this.$ctm_main.css('left', ctxt + 'px').css('top', ctxl + 'px');
	}

	/**
	 * Close the context menu if it is open.
	 */
	menu_clear()
	{
		if(this.$ctm_ovl) this.$ctm_ovl.remove();
	}
}

export {ContextMenu}
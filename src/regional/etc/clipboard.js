// clipboard.js
// Josh Reed 2020
//
// Handles selection, copying, and pasting.

/**
 * A central-routing sort of class to handle clipboard operations
 * 
 * TODO refactor / modernize this. Perhaps link into the Clipboard API
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
 */
class Clipboard
{
	/**
	 * Setup the app-wide clipboard and selection. Only components can be copied to the clipboard.
	 */
	constructor(app)
	{
		// How the copy is interfaced with (e.g. by keystroke, rightclick, or button)
		this.control_types = {
			'keystroke': {id: 'keystroke'},
			'rightclick': {id: 'rightclick'},
			'button': {id: 'button'}
		}

		// Specific information for the current copy operation.
		this.copydata = {
			control_type: undefined, 	// The specific control method used to copy the attached object
			components: [] 		// This is where the component copy list will actually reside.
		}

		// Specific information for the current selection
		this.selection = {
			components: [],		// The components currently selected (not copies, instances)
			callback: ()=>{},	// Called when a selection is performed
		}

		this.selection_locked = 0 // If true, the current selection can not be altered.

		this.app = app
	}

	/**
	 * Copy the current selection to the clipboard.
	 * @param {Event} e The event from click or keypress
	 * @param {Object} control_type The app.clipboard.control_type for this copy operation.
	 */
	copy(e, control_type)
	{
		console.log("Copying " + this.selection.components + " to clipboard.")

		// Clear anything that used to be in here.
		this.clear()

		//Turn list of components into list of copies
		for(var x = 0; x < this.selection.components.length; x++)
		{
			this.copydata.components.push(this.selection.components[x].get_copy())
		}
		this.copydata.control_type = control_type
	}

	/**
	 * Paste whatever is on the clipboard as best possible. This is handled centrally (in the app.clipboard) to account
	 * for all the different originations of this event.
	 * @param {Event} e The event from click or keypress
	 * @param {Object} control_type The app.clipboard.control_type for this copy operation.
	 */
	paste(e, control_type)
	{
		var target_region = this.app.focus_region_get()
		if(control_type.id == this.control_types.keystroke.id) // CTRL+V
		{
			//target_region = 
		}
		else if(control_type.id == this.control_types.rightclick.id) // Rightclick -> Paste
		{

		}
		else // Must be an HTML button somewhere.
		{
			return // Not handling this case until we actually need a paste button (I don't think we will)
		}

		console.log("Pasting " + this.copydata.components.length + " objects into region " + target_region.id)

		for(var x = 0; x < this.copydata.components.length; x++)
		{
			target_region.paste_component(e, this.copydata.components[x])
		}
	}

	/**
	 * Clear the clipboard of any attached data.
	 */
	clear()
	{
		this.copydata.control_type = undefined;
		this.copydata.components = [];
	}

	/**
	 * Select a component or list of components, app wide. This is the primary function for this action.
	 * @param {*} components Component or list of components
	 */
	select(components)
	{
		// Convert to array if not already
		if(!(components instanceof Array)) components = [components]

		if(this.selection_locked)
		{
			console.log("Cannot select right now -- selection is locked.")
			return
		}
		console.log("Selecting: ")
		console.log(components)

		this.selection.components = components
		for(var x = 0; x < this.selection.components.length; x++)
		{
			this.selection.components[x].on_select()
		}

		// Process the single callback, which may or may not actually do something.
		this.selection.callback(this.selection.components)

		this.app.render();
	}

	deselect()
	{
		//console.trace()
		if(this.selection_locked)
		{
			console.log("Cannot deselect right now -- selection is locked.")
			return
		}

		if(this.has_selected())
		{
			for(var x = 0; x < this.selection.components.length; x++)
			{
				this.selection.components[x].on_deselect()
			}
			this.selection.components = []
			this.app.render();
		}
	}

	/**
	 * Return true if anything is currently selected.
	 */
	has_selected()
	{
		return this.selection.components.length > 0
	}

	/**
	 * Return true if the first AND only selected object is instanceof one of the provided component
	 * class defs.
	 * @param {Array} ClassDefs A list of ClassDefs
	 */
	has_selected_of_type(ClassDefs)
	{
		if(this.selection.components.length == 1)
		{
			return ClassDefs.some((CD)=>{return this.selection.components[0] instanceof CD})
		}
		return 0
	}

	/**
	 * Return true if anything is currently copied on clipboard.
	 */
	has_copied()
	{
		return this.copydata.components.length > 0
	}

	/**
	 * Return True if all comps on the clipboard are of the ClassDef's provided in defs
	 * @param {Array} defs A list of ClassDef's
	 */
	has_copied_of_type(defs)
	{
		if(this.copydata.components.length == 0) return 0

		var components = this.copydata.components
		// If even one of these does not fit, return False
		for(var x = 0; x < components.length; x++)
		{
			var flag = 0
			
			for(var y = 0; y < defs.length; y++)
			{
				if(components[x] instanceof defs[y])
				{
					flag = 1 // At least one match
				}
			}
			// No matches for this component
			if(flag == 0)
			{
				return 0
			}
		}
		return 1 // If they all fit, return True
	}

	/**
	 * Return 1 if the provided component is selected, 0 otherwise.
	 * @param {Component} component 
	 */
	is_selected(component)
	{
		for(var x = 0; x < this.selection.components.length; x++)
		{
			if(this.selection.components[x].type == component.type && this.selection.components[x].data.id == component.data.id)
			{
				return 1
			}
		}
		return 0
	}

	/**
	 * Return a list of current selected components.
	 */
	get_selected()
	{
		return this.selection.components
	}

	/**
	 * Lock the selection such that it cannot be unselected and no other selections can be made
	 */
	selection_lock() {
		this.selection_locked = 1}

	/**
	 * Unlock the selection such that it operates like normal.
	 */
	selection_unlock() {
		this.selection_locked = 0}

	/**
	 * Register a callback to be called on selection. There can only be one of these at a time, so binding a selection function
	 * will automatically clear the last selection function.
	 * @param {Function} fn The function to be called on select. Args: (components)
	 */
	selection_bind(fn)
	{
		this.selection.callback = fn
	}

	/**
	 * Clear whatever selection callback was bound.
	 */
	selection_bind_clear()
	{
		this.selection.callback = ()=>{}
	}

	/**
	 * Call the delete() function on every selected component
	 */
	selection_delete()
	{
		for(var x = 0; x < this.selection.components.length; x++)
		{
			this.selection.components[x].delete()
		}
	}
}

export {Clipboard}
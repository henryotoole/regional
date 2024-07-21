
class Component
{
	/**
	 * Instantiate a component.
	 * @param {Object} dataobj The data object from server data. Will be a dict with key/value pairs, usually
	 * direct from a database record. This dataobj must NEVER contain components as values.
	 * @param {RegionApp} app The instance of the app to which tihs component belongs
	 * @param {Boolean} link If true, maintain a link between this.data and the original data object.
	 */
	constructor(dataobj, app, link)
	{
		this.data = {} // This is true data that relates exactly to this device's in-server-memory representation.
		if(link)
		{
			this.data = dataobj;
		}
		else
		{
			Object.assign(this.data, dataobj) // Copy over the object key/value pairs.
		}
		// This is convinience data that is used to simplify operations on the frontend. It shouldn't link back to data-in-memory.
		this.org_data = {}
		this.settings = {}

		// The type is a code that is unique to each type of component.
		this.type = this.constructor.name.toLowerCase() // Should be the class name like 'componentfile'
		this.data._classtype = this.type
		this.app = app

		// If there's a data.id key, we want to copy it for convenience here
		this.id = dataobj.id
	}

	/**
	 * Every Component class with a constructor more complicated than constructor(data) will need to implement it's own from_json
	 * method
	 * @param {Object} data This is a 'dataobj' that contains all 'data' for this component. This is 'data' in the
	 * context of the settings vs. data regional model.
	 */
	static from_json(data)
	{
		return Component(data, false)
	}

	/**
	 * Get a TRUE COPY of the data in this component
	 */
	to_json()
	{
		return JSON.parse(JSON.stringify(this.data)) // Get a true copy of the data
	}

	/**
	 * Should return true copy of this Component.
	 */
	get_copy()
	{
		return new this.constructor(this.to_json(), 1) // Return a Component of the same type
	}

	/**
	 * Set the setting to the provided value. Remember, settings are temporal and do not survive
	 * a session.
	 * @param {String} key The setting name
	 * @param {*} val The setting value
	 */
	setting_set(key, val)
	{
		this.settings[key] = val
	}

	/**
	 * Get the setting at the provided key or undefined if it does not exist. Remember, settings are temporal and
	 * do not survive a session.
	 * @param {String} key The setting name
	 */
	setting_get(key)
	{
		return this.settings[key]
	}

	/**
	 * Convinience method to select any single component
	 */
	select()
	{
		this.app.clipboard.select([this])
	}

	/**
	 * Deselect this component
	 */
	deselect()
	{
		this.app.clipboard.deselect()
	}

	/**
	 * Always called when this component is selected by the APP.clipboard
	 */
	on_select() {}

	/**
	 * Always called when this component is deselected by the APP.clipboard
	 */
	on_deselect() {}

	/**
	 * 'Activate' a Component. By default this does nothing, but it is intended to be overwritten in some child
	 * classes. This might load a project, or preview a media.
	 */
	activate()
	{
		this.on_activate()
	}

	/**
	 * Called any time a component is activated.
	 */
	on_activate()
	{

	}

	/**
	 * Check if this component equals another component. If they are of the same ClassDef and same ID, they are
	 * equal.
	 * @param {Component} component another component instance
	 */
	equals(component)
	{
		return (component instanceof this.constructor && this.data.id == component.data.id)
	}

	/**
	 * Delete this component. Should get supercalled.
	 */
	delete()
	{
		this.on_delete()
	}

	/**
	 * Called when this component is deleted, in addition to the code that actually deletes this object.
	 */
	on_delete()
	{
		// Deselect everything if this component was selected.
		if(this.app.clipboard.is_selected(this))
		{
			this.app.clipboard.deselect()
		}
	}

	/**
	 * This method works alongside DHBundler to reformat data (see DHBundler.data_pull_reformat()) as it
	 * is pulled down. Use of this method is OPTIONAL and will only be invoked if a child of DHBundler has
	 * a data_pull_reformat() function defined (the base data_pull_reformat()  method does nothing.)
	 * 
	 * Many DHBundlerChild.data_pull_reformat() methods will do the reformatting in situ. However, in some
	 * cases where the bundled data itself has hierarchical structure with children, it can be helpful to mirror
	 * that structure with the Component class hierarchy.
	 * 
	 * In that case this method could be used.
	 * 
	 * NOTE: Under ES6, static methods like this are inherited by default (like python's @classmethods)
	 * 
	 * @param {Object} inst_data The instance data, to be reformatted
	 */
	static data_reformat_specific(inst_data)
	{
		throw("Component.data_reformat_specific() invoked, but has not been overwritten in ComponentChild class.")
	}
}

export {Component}
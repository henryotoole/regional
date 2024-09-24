/**
 * @file Contains base class for the Component
 * @author Josh Reed
 */

import { DHTabular } from "../regional.js";

/**
 * The Component is a useful additional layer of abstraction for objects brought down from the server. It is
 * not neccessary to use Components along with DataHandlers, but can be useful. The data being modelled by
 * a component must, at the very least, be 'tabular'. See the docs in DHTabular for more info.
 * 
 * The component extends the use of a record from a datahandler with two specific functionalities.
 * 1. Tie code to the data of a record from a server.
 * 2. Allow records to track their own 'settings', much like a region does.
 * 
 * The result of these two functionalities is that record data can be worked with more smoothly. Rather than
 * having to remember, for example, that some record has a mode that can be an int from 1 to 4, the data can
 * have a set_mode() function that takes an enum as an argument.
 * 
 * **On Usage**
 * Perhaps an API exists that grants access to some set of books. DataHandlerBook is responsible for keeping
 * track of some subset of books that exist by ID. A ComponentBook could be created to provide methods like:
 * + `get_author()`
 * + `copy_publishing_data(some_other_book)`
 * 
 * Furthermore, the books settings could have a key marking it as 'open'. If the application had multiple
 * regions that referenced and rendered pictures of various known books, all those marked as 'open' could be
 * rendered as literally open.
 * 
 * **On Implementation**
 * The component NEVER stores any state data in instance memory. All data **and** settings are actually stored
 * in only one spot - the originating datahandler. This allows component instances to be freely tossed about,
 * almost as if they are immutable. Changing a value in component.data or component.settings simply changes
 * a value in the datahandler.
 */
class Component
{

	/** @type {*} The ID for the record this component models. */
	id
	/** @type {DHTabular} The datahandler from which this component originated */
	datahandler

	/**
	 * Create a new component. This should generally only be called from within a datahandler class.
	 * 
	 * @param {*} id The unique ID by which we can reference the record in the datahandler
	 * @param {DHTabular} dh The Tabular DataHandler that originated this component instance.
	 */
	constructor(id, dh)
	{
		// Set our references to the proper locations
		this.id = id
		this.datahandler = dh
	}

	/**
	 * The data reference links straight into the DataHandler's component space for this data.
	 * 
	 * ```
	 * comp_instance.data.key = "val"
	 * ```
	 * is equivalent to
	 * 
	 * ```
	 * datahandler_instance._data[id].key = "val"
	 * ```
	 * 
	 * @returns {Object} A reference to a unique memory space for this object where its data may be found.
	 */
	get data()
	{
		let data = this.datahandler.data_get_ref(this.id)
		if(data == undefined) throw new Error(
			`${this.constructor.name} is stale: record no longer exists in ${this.datahandler.constructor.name} ` +
			`for ID: '${this.id}'.`
		)
		return data
	}

	/**
	 * The settings reference is unique to this record ID, but shared across all record ID's.
	 */
	get settings()
	{
		let settings = this.datahandler.settings_get_ref(this.id)
		if(settings == undefined) throw new Error(
			`${this.constructor.name} is stale: record no longer exists in ${this.datahandler.constructor.name} ` +
			`for ID: '${this.id}'.`
		)
		return settings
	}

	set data(v) {throw new Error("Can not overwrite datalink.")}
	set settings(v) {throw new Error("Can not overwrite datalink.")}

	/**
	 * Check if this component equals another component. If they are of the same ClassDef and same ID, they are
	 * equal.
	 * @param {Component} component another component instance
	 */
	equals(component)
	{
		return (component instanceof this.constructor && this.id == component.id)
	}
}

export {Component}
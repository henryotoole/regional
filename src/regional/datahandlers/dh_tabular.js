/**
 * @file Holds a direct child class of DataHandler for tabular data.
 * @author Josh Reed
 */

import { DataHandler, Component, checksum_json } from "../regional.js"

/**
 * This DataHandler is only slightly more specific than the base DataHandler class. It is intended for datasets
 * where data is 'tabular', e.g. composed of a number of records with unique ID's and similar if not identical
 * data fields. Such data will often originate from and be stored in a table, such as an SQL table.
 * 
 * Working with tabular data enables some more specific and helpful functionality, like the use of Components.
 * 
 * **On Implementation**
 * All data is stored in this._data. Keys are record ID's, and values are dicts containing the data for the
 * corresponding record.
 */
class DHTabular extends DataHandler
{
	/** @type {Object} A place for local 'settings' to tie to a record */
	_settings

	/**
	 * Create a new datahandler instance. At the base level, this merely sets up an empty data variable.
	 */
	constructor()
	{
		super()
		this._settings = {}
	}

	/**
	 * Update a record for an ID. If the record does not exist, it will be created. Existing records will
	 * have all values from 'data' assigned over on a per-key basis. This means that existing data keys
	 * for an existing record that are NOT present in the supplied data will NOT be removed.
	 * 
	 * @param {*} id The ID of the record to delete.
	 * @param {Object} data The data to set for this record.
	 */
	data_update_record(id, data)
	{
		if(this._data[id] == undefined) this._data[id] = {}
		if(this._settings[id] == undefined) this._settings[id] = {}

		Object.assign(this._data[id], data)
	}

	/**
	 * Get information for a specific record. The returned object is a reference. Modifying it will modify
	 * record data.
	 * 
	 * @param {*} id The ID of the record
	 * 
	 * @returns {Object} Data for this record or undefined if no such ID exists
	 */
	data_get_ref(id)
	{
		return this._data[id]
	}

	/**
	 * Delete all data and settings for the provided record ID.
	 * 
	 * @param {*} id The ID of the record to delete
	 */
	data_delete_record(id)
	{
		delete this._data[id]
		delete this._settings[id]
	}

	/**
	 * @returns {Array} A list of currently known ID's.
	 */
	get_all_ids()
	{
		return Object.keys(this._data)
	}
	
	/**
	 * Perform a basic operation similar to SQL's WHERE clause. For now, this only performs equality-matching.
	 * 
	 * The filter_data object should resemble:
	 * 
	 * ```
	 * {
	 *      'col_name': MATCHING_COL_VALUE,
	 *      'col2_name': MATCHING_COL2_VALUE,
	 *      ...
	 * }
	 * ```
	 * 
	 * All known records that have `col_name` value equal to `MATCHING_COL_VALUE` and col2 etc. will be returned.
	 * 
	 * @param {Object} filter_data Object with data column names to values
	 * 
	 * @returns {Object} id-mapped data for each matching tabular record. This is NOT dereferenced.
	 */
	where(filter_data)
	{
		let out = {}
		Object.entries(this._data).forEach(([id, data])=>
		{
			let all_match = true
			Object.entries(filter_data).forEach(([k, v])=>
			{
				if(data[k] != v) all_match = false
			})
			if(all_match)
			{
				out[id] = data
			}
		})
		return out
	}

	/**
	 * Get reference to settings space for the provided ID.
	 * 
	 * @param {*} id The ID of the record
	 * 
	 * @returns {Object} Settings for this record or undefined if no such ID exists
	 */
	settings_get_ref(id)
	{
		return this._settings[id]
	}

	/**
	 * TODO Checksum Caching
	 * This will be neccessary for the future. I'm not setting it up just yet because too much is on my stack
	 * already.
	 * 1. Add a Proxy for _data and _settings so that generic set operations cause checksum update.
	 * 2. Add a sort of context manager for temporarily disabling autoregen during mass operations.
	 * 3. Cause that context manager to be used during push() and pull()
	 */

	/**
	 * The checksum for a tabular datahandler is composed of both data and settings.
	 */
	generate_checksum()
	{
		return checksum_json([this._data, this._settings])
	}

	/**
	 * Get a component instance of the relevant type for this DataHandler. Component instances are really
	 * just containers for code that store both their settings and data back here in the datahandler. Multiple
	 * instances of a Component for the same ID will refer to the exact same locations in memory.
	 * 
	 * This may be called any number of times in any number of places, and all instances of a component for a
	 * certain ID will behave as if they are, in fact, the same component.
	 * 
	 * The default behavior of this function will return a generic Component instance for the indicated record.
	 * If component-specific functions are desired, a child Component class can be created and this function
	 * overridden to return it in a child datahandler class.
	 * 
	 * @param {*} id The ID to get a component for.
	 * 
	 * @returns {Component}
	 */
	comp_get(id)
	{
		return new Component(id, this)
	}
}

export {DHTabular}
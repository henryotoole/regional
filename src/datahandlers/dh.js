// rfm_core/datahandlers/dh.js
// Josh Reed 2021
//
// Core part of the regional model framework. This is the fundamental block of data. A datahandler
// is designed to communicate with a backend keep a copy of some sort of data that exists on the
// backend.
//
// To use this class, child classes must override the data_pull() functions. If the data is not
// read only, then the data_push() function must also be overridden.

class DataHandler
{
	/**
	 * 
	 * @param {RegionApp} app RegionApp object
	 */
	constructor(app)
	{
		this.data = {};
		this.app = app

		this._refreshing = 0

		this.loaded_once = 0 // Set to true after this has been loaded at least once
	}

	/**
	 * Get whether this datahandler is currently waiting on a refresh.
	 */
	data_refresh_in_progress()
	{
		return this._refreshing
	}

	/**
	 * Refresh the data associated with this data handler. This should be used sparingly as it refreshes *everything*. Intended
	 * to be called but NOT overwritten in child class.
	 * 
	 * @returns {Promise} A promise that will resolve with no arguments when the data is pulled down.
	 */
	data_refresh()
	{
		return new Promise((res, rej)=>
		{
			if(!this.data_refresh_in_progress())
			{
				this._refreshing = 1
				this.data_pull().then(()=>
				{
					this._refreshing = 0
					res()
				})
			}
			else
			{
				
			}
			res()
		})
	}

	/**
	 * Contact a server to fetch all data for this datahandler. This must be overridden in child
	 * class.
	 * 
	 * @returns {Promise} A promise that will resolve with no arguments when the data is pulled down.
	 */
	data_pull()
	{
		throw("Child datahandler provides no fetch method.")
	}

	/**
	 * Contact a server to fetch all data for this datahandler. If this is not overridden in child,
	 * then this datahandler is assumed to be read-only.
	 * 
	 * @returns {Promise} A promise that will resolve with no arguments when the data is pushed up.
	 */
	data_push()
	{
		throw("Attempted to push data on a read-only datahandler.")
	}

	/**
	 * Refresh multiple datahandlers concurrently with a single promise.
	 * 
	 * @param {Array} dh_list A list of datahandlers
	 * 
	 * @returns {Promise} A promise that will resolve with no arguments when the data is pulled down.
	 */
	static data_refresh_multiple(dh_list)
	{
		return new Promise((res, rej)=>
		{
			var all_promises = []
			dh_list.forEach((dh)=>
			{
				all_promises.push(dh.data_refresh())
			})
			Promise.all(all_promises).then(()=>
			{
				res()
			})
		})
	}

	/**
	 * Validate all data instances and remove any that are invalid. Intended to be overwritten in child. May do nothing.
	 */
	data_validate() {}
}

export {DataHandler}
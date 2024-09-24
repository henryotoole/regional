/**
 * @file Holds the core datahandler class
 * @author Josh Reed
 */

/**
 * This is the base datahandler class. It aims to be as general as possible - to expose the maximum
 * number of functions at the base level as possible without tying it to a specific model of interaction
 * with the server (e.g. REST or RPC).
 * 
 * The core behaviors that ALL datahandler should make available are as follows:
 * + Data Pull: Retrieve all 'tracked' data from the server that has not yet already been pulled down. Depending on
 * implementation, this might simply be all of the data that exists. A REST implementation may choose to track
 * certain ID's and only retrieve certain rows. However it happens, pull() should all desired data that the
 * datahandler has so far been configured to want available locally.
 * + Data Push: Update the server to match this local client. Implementations will vary. The most efficient
 * way to do this will be to only send data that has changed.
 * 
 */
class DataHandler
{
	/** @type {Object} This is where all local data for this DataHandler is stored. */
	_data

	/**
	 * Create a new datahandler instance. At the base level, this merely sets up an empty data variable.
	 */
	constructor()
	{
		this._data = {}
	}

	/**
	 * @abstract
	 * Retrieve all 'tracked' data from the server that has not yet already been pulled down. Depending on
	 * implementation, this might simply be all of the data that exists. A REST implementation may choose to track
	 * certain ID's and only retrieve certain rows. However it happens, pull() should all desired data that the
	 * datahandler has so far been configured to want available locally.
	 * 
	 * @returns {Promise} A promise that will resolve when the data pull is complete
	 */
	async pull() {}

	/**
	 * @abstract
	 * Update the server to match this local client. Implementations will vary. All data can be sent to server,
	 * or only the subset that has changed (for efficiency). As a result of calling this, the server data should
	 * match that of the local client for all data in this datahandler.
	 * 
	 * @returns {Promise} A promise that will resolve when the data push is complete
	 */
	async push() {}

	/**
	 * @abstract
	 * Get a unique string / name of some sort that signifies this datahandler. This is used for situations
	 * where a list of DH's needs to be keyed and accessed uniquely. Must be implemented in child.
	 * 
	 * @returns {String} Unique string for this TYPE of datahandler.
	 */
	get name() {}

	/**
	 * Get the current data-state checksum for this datahandler. This method may be overridden by a child
	 * to take advantage of checksum caching.
	 * 
	 * @returns {String} 32 char checksum.
	 */
	get checksum() {return this.generate_checksum()}

	/**
	 * @abstract
	 * Generate a new, unique checksum that reflects the current state of this DataHandler.
	 * 
	 * @returns {String} 32 char checksum.
	 */
	generate_checksum() {}

	/**
	 * Call pull() on multiple datahandlers in parallel. 
	 * 
	 * @param {Array} dh_list A list of datahandlers
	 * 
	 * @returns {Promise} A promise that will resolve with no arguments when all data is pulled down.
	 */
	static data_refresh_multiple(dh_list)
	{
		return new Promise((res, rej)=>
		{
			var all_promises = []
			dh_list.forEach((dh)=>
			{
				all_promises.push(dh.pull())
			})
			Promise.all(all_promises).then(()=>
			{
				res()
			})
		})
	}
}

export {DataHandler}
// rfm_core/datahandlers/dh_bundled_dispatch.js
// Josh Reed 2021
//
// This is an advanced form of datahandler which is intended to pull a set of records from a database.

import { DHBundler } from "../module.js"

class DHBundlerDispatch extends DHBundler
{	
	/**
	 * Instantiate a datahandler for bundled (e.g. tabulated) data. This sort of datahandler works very
	 * closely with dispatch and a ModelBundler enabled backend to automate the rest of the distance
	 * between this datahandler and the table-based backend database.
	 * 
	 * @param {RegionApp} app RegionApp object
	 * @param {String} model_class The model class name, like ModelUser
	 */
	constructor(app, model_class)
	{
		super(app);
		
		this.model_class = model_class
		this.dispatch_backend = app.dispatch_backend

		this.json_pull_enabled = 0
		this._json_url_key = 'bundle_json_url'
		this._json_row_key = 'bundle_json'
	}

	/**
	 * Call this function to enable 'json pulls' for this datahandler. If this is enabled, then
	 * we'll assume that each entry has some additional data stored in a JSON that can be retrieved
	 * statically from the server.
	 * 
	 * The URL for this JSON should be found in the row_data key 'bundle_json_url' when row
	 * data is pulled down.
	 * 
	 * This data will be inserted in the row_data for each entry at the 'bundle_json' key.
	 */
	enable_json_pulls()
	{
		this.json_pull_enabled = 1
	}

	/**
	 * Contact a server to fetch instances for this datahandler.
	 * 
	 * Note that this operation can, optionally, also pull down JSON's. If a JSON is missing, unparseable, or otherwise
	 * unobtainable for an instance, it's row_data.bundle_json will be set to undefined. No exceptions will be thrown.
	 * 
	 * @param {*} instance_ids List of ids to pull down. If string "ALL" is passed, pull all owned down.
	 * 
	 * @returns {Promise} A promise that will resolve with row_data for as many requested ID's as possible
	 */
	data_pull_instances(instance_ids)
	{
		console.log("Pulling " + instance_ids.length + " things.")
		return new Promise((res, rej)=>
		{
			if(instance_ids == "ALL")
			{
				instance_ids = null
			}
			// class_name (str): The string name of the class model, like ModelNasmyth or something
			// operation (str): An operation string, which can be 'create', 'delete', 'bundle_up', or 'bundle_down'
			// data (dict): A dict that should contain the neccessary data to complete the requested operation.
			this.dispatch_backend.call_server_function(
				'bundle_request',
				this.model_class,
				'bundle_down',
				{'row_ids': instance_ids}
			).then((row_data)=>
			{
				// If we aren't doing JSON pulls, just resolve now
				if(!this.json_pull_enabled)
				{
					res(row_data)
					return
				}

				var json_promises = []

				// If we ARE doing JSON pulls, then now is our chance to get them
				// Compose all request promises
				Object.keys(row_data).forEach((row_id)=>
				{
					var json_url = row_data[row_id][this._json_url_key]
					if(json_url == undefined) throw("No json url at row id '" + row_id + "' key '" + this._json_url_key + "'")

					var json_promise = new Promise((res2, rej2)=>
					{
						fetch(this.app.anticache_url(json_url)).then((response)=>
						{
							// If we can't get the JSON data, we don't interrupt the load procedure; rather we just set json
							// data to undefined and let the child class determine how to deal with it.
							if(!response.ok)
							{
								return new Promise((res, rej)=>
								{
									res(undefined)
								})
							}
							return response.json()
						}).then((data)=>
						{
							row_data[row_id][this._json_row_key] = data
							res2()
						})
					})

					json_promises.push(json_promise)
				})

				// Fire all request promises
				Promise.all(json_promises).then(()=>
				{
					res(row_data)
				})
			})
		})
	}

	/**
	 * Return a promise that resolves when the provided row_data has been sent to update the server.
	 * 
	 * @param {Object} row_data An id-map of dicts of row data to update. 
	 * 
	 * @returns {Promise} A promise that will resolve when the row data has been pushed to the server
	 */
	data_push_instances(row_data)
	{
		// class_name (str): The string name of the class model, like ModelNasmyth or something
		// operation (str): An operation string, which can be 'create', 'delete', 'bundle_up', or 'bundle_down'
		// data (dict): A dict that should contain the neccessary data to complete the requested operation.
		return this.dispatch_backend.call_server_function(
			'bundle_request',
			this.model_class,
			'bundle_up',
			{'row_data': row_data}
		)
	}
 
	/**
	 * Return a promise that resolves when the provided instance has been deleted
	 * 
	 * @param {Number} instance_id The ID to delete
	 * 
	 * @returns {Promise} A promise that will resolve when instance has been deleted
	 */
	data_delete_instance(instance_id)
	{
		throw("TODO")
	}
}

export { DHBundlerDispatch }
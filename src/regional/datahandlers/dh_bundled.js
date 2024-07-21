// rfm_core/datahandlers/dh_bundled.js
// Josh Reed 2021
//
// This is an advanced form of datahandler which is intended to pull a set of records from a database.

import { DataHandler } from "../module.js"

class DHBundler extends DataHandler
{	
	/**
	 * Instantiate a datahandler for bundled (e.g. tabulated) data. This datahandler is designed
	 * to represent a frontend copy of a backend database table. Each 'instance' referenced here
	 * corresponds to a row in the database.
	 * 
	 * This data is stored in this.data.instances. Each instance itself can be read and written to
	 * at will. It's perfectly fine to even add colname-keys and values to local instances.
	 * However, instances should ONLY be created and deleted via data_delete() and data_create()
	 * 
	 * By default, all instances available to the user are tracked. If an instance is tracked, it will
	 * always become available after a data_pull() unless the user does not have access to it
	 * 
	 * @param {RegionApp} app RegionApp object
	 */
	constructor(app)
	{
		super(app);
		// This is where the local (operations-facing) copy of the instance data is stored.
		this.data.instances = {}
		// This tracks what the server has told us, and is unchanged by any local operations.
		this._server_instances = {}

		// List of tracked instances. This is overridden by this.track_all
		this.tracked_instances = []
		// If true, we should track all instances available to this user
		this.track_all = 0
		this.track_all_known_owned = []
	}

	/**
	 * Contact a server to fetch instances for this datahandler.
	 * 
	 * @param {*} instance_ids List of ids to pull down. If string "ALL" is passed, pull all owned down.
	 * 
	 * @returns {Promise} A promise that will resolve with row_data for as many requested ID's as possible
	 */
	data_pull_instances(instance_ids)
	{
		throw("Child datahandler provides no data_pull_instances method.")
	}

	/**
	 * This is called on pull before any caching is done. This can be overwritten in a child to alter data
	 * when it comes down and do things such as convert a timestamp to a Date(), etc.
	 * 
	 * Instances should be modified in-place.
	 * 
	 * @param {Object} instances The id-mapped list of instances on pull
	 */
	data_pull_reformat(instances)
	{
		// Does nothing
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
		throw("Child datahandler provides no data_push_instances method.")
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
		throw("Child datahandler provides no data_delete_instance method.")
	}

	/**
	 * Return a promise that resolves when the provided instance has been created
	 * 
	 * @param {Object} instance_data Instance key/value data which is needed to create the new record
	 * 
	 * @returns {Promise} A promise that will resolve with a full row_data object when the new instance
	 * 	is created.
	 */
	data_create_instance(instance_data)
	{
		throw("Child datahandler provides no data_create_instance method.")
	}

	/**
	 * Refresh the data associated with this data handler. This should be used sparingly as it refreshes *everything*. Intended
	 * to be called but NOT overwritten in child class.
	 * 
	 * In the case of bundled datahandlers, this will not actually remove anything extra that exists in local
	 * data. It rather will pull everything and overwrite everything without deleting local first.
	 * 
	 * @returns {Promise} A promise that will resolve with no arguments when the data is pulled down.
	 */
	data_refresh()
	{
		// Remove all data in the server copy. Local copy will be overwritten
		this._server_instances = {}
		// Must clear instance data too in case something should be removed.
		this.data.instances = {}
		// Clearing server instances will trigger an "ALL" push_instances()
		return this.data_pull()
	}

	/**
	 * Contact a server to fetch all data for this datahandler. This must be overridden in child
	 * class.
	 * 
	 * 
	 * @param {*} specific_instances OPTIONAL: May provide a list of ID's to specifically update
	 * 	rather than the entire tracked set.
	 * 
	 * @returns {Promise} A promise that will resolve with no arguments when the data is pulled down.
	 */
	data_pull(specific_instances)
	{
		var instance_ids = []

		//console.warn(">> DATAHANDLER >> Data pull " + this.constructor.name)

		// Case 1, we've provided specific instances. These should be the only things passed on
		if(specific_instances !=  undefined)
		{
			instance_ids = specific_instances
		}
		// Case 2, we're tracking all
		else if(this.track_all)
		{
			// Alright, so if this is the first time (e.g. we have no data) we need to actually
			// prosecute the 'track all' operation.
			if(Object.keys(this._server_instances).length == 0)
			{
				instance_ids = "ALL"
			}
			// Otherwise there's nothing new to track unless the server has been updated by something
			// outside of the scope of this datahandler. In this case, we'll need to use data_refresh()
			// instead because a full refresh is the only way to get new data.
			else
			{
				// This signals 'do nothing'
				instance_ids = []
			}
		}
		// Case 3, we're proceeding 'as normal' and should only pull things that don't exist
		// in server data copy
		else
		{
			this.tracked_instances.forEach((id)=>
			{
				if(this._server_instances[id] == undefined)
				{
					instance_ids.push(id)
				}
			})
		}

		return new Promise((res, rej)=>
		{
			// If there's nothing to fetch, simply return!
			// In the case that instance_ids == "ALL", this will not be zero
			if(instance_ids.length == 0)
			{
				//console.warn(">> DATAHANDLER >> Pull complete - nothing to pull")
				res()
				return
			}

			this.data_pull_instances(instance_ids).then((row_data)=>
			{
				// Apply the row data to both copies of data
				this.data_pull_reformat(row_data)
				DHBundler._row_data_apply(row_data, this._server_instances)
				DHBundler._row_data_apply(row_data, this.data.instances)
				//console.warn(">> DATAHANDLER >> Pull complete")
				res()
			})
		})
	}

	/**
	 * Contact a server to update all data for this datahandler. If this is not overridden in child,
	 * then this datahandler is assumed to be read-only.
	 * 
	 * @returns {Promise} A promise that will resolve with no arguments when the data is pushed up.
	 */
	data_push()
	{
		var row_data_xor = this.data_xor()
		return new Promise((res, rej)=>
		{
			this.data_push_instances(row_data_xor).then(()=>
			{
				// We need to update server data copy to match what is now a part of the server.
				DHBundler._row_data_apply(row_data_xor, this._server_instances)
				res()
			})
		})
	}

	/**
	 * Delete an instance/row by its ID. This will contact the server and only make changes to local
	 * data if the delete is successful.
	 * 
	 * @param {*} instance_id Either a string or integer ID
	 * 
	 * @returns {Promise} Promise that will resolve when the data is deleted and local data is up to date
	 */
	data_delete(instance_id)
	{
		return new Promise((res, rej)=>
		{
			this.data_delete_instance(instance_id).then(()=>
			{
				delete this._server_instances[instance_id]
				delete this.data.instances[instance_id]
				this.data_tracked_remove(instance_id)
				res()
			})
		})
	}

	/**
	 * Delete an instance/row by its ID. This will contact the server and only make changes to local
	 * data if the delete is successful.
	 * 
	 * @param {Object} instance_data Instance key/value data which is needed to create the new record
	 * 
	 * @returns {Promise} Promise that will resolve when new entry is created and local data is up to date
	 */
	data_create(instance_data)
	{
		return new Promise((res, rej)=>
		{
			this.data_create_instance(instance_data).then((row_data)=>
			{
				// Apply the row data to both copies of data
				DHBundler._row_data_apply(row_data, this._server_instances)
				DHBundler._row_data_apply(row_data, this.data.instances)
				this.data_tracked_add(row_data.id)
				res()
			})
		})
	}

	/**
	 * Compare the local data to the copy of the server data and see if we've made any local
	 * changes. If we have, produce a row_data id-map which contains only those values which
	 * have changed.
	 * 
	 * @returns {Object} A id-map row_data object where vals are {colname-key: row-value} dicts
	 * 	of local changes that are not yet on the server.
	 */
	data_xor()
	{
		var row_data = {}
		Object.keys(this._server_instances).forEach((sid)=>
		{
			var server_instance = this._server_instances[sid],
				local_instance = this.data.instances[sid],
				diffs = {}

			if(local_instance == undefined)
			{
				// Probable cause is the deletion of a local record without using data_delete()
				throw("Server instance " + sid + " does not exist in local instances. Something has gone wrong.")
			}

			// We only care about colnames that originated on the server. We ignore all others.
			Object.keys(server_instance).forEach((colname)=>
			{
				// If the keys are different, use the local one
				if(server_instance[colname] != local_instance[colname])
				{
					diffs[colname] = local_instance[colname]
				}
			})

			// If there were any differences, add to master list
			if(Object.keys(diffs) > 0)
			{
				row_data[sid] = diffs
			}
		})

		return row_data
	}

	/**
	 * Apply row_data to a set of target instances. All colname-key-values present in row_data will
	 * overwrite corresponding vals in target_instances.
	 * 
	 * If there are ids in row_data that are not in target_instances, they will be added to target_instances
	 * 
	 * This is really just a fancy Object.assign()
	 * 
	 * @param {Object} row_data Standard form row_data
	 * @param {Object} target_instances An instance list, like this.data.instances
	 */
	static _row_data_apply(row_data, target_instances)
	{
		Object.keys(row_data).forEach((row_id)=>
		{
			if(target_instances[row_id] == undefined)
			{
				target_instances[row_id] = {}
			}
			Object.keys(row_data[row_id]).forEach((colname)=>
			{
				target_instances[row_id][colname] = row_data[row_id][colname]
			})
		})
	}

	/**
	 * Get a list of ID's for instances who's key-val equals val
	 * @param {string} key Check if this key equals val
	 * @param {string} val Check this val
	 * 
	 * @returns {Array} A list of ID's
	 */
	data_instances_where(key, val)
	{
		var ids = []
		//console.log("Searching WHERE " + key + " equals " + val)
		//console.log(this.data.instances)
		for(var key_id in this.data.instances)
		{
			if(this.data.instances.hasOwnProperty(key_id))
			{
				if(this.data.instances[key_id][key] == val)
				{
					// Often id's are integers. If it can be kept as an integer, do it.
					var key_int = parseInt(key_id)
					ids.push( isNaN(key_int) ? key_id : key_int)
				}
			}
		}
		return ids
	}

	/**
	 * Return a list of sorted references to a entries in a standard-format bundle-dict by a key within the bundle-dict. This will be
	 * of form [{key: val, key: val}, etc.]
	 * @param {Object} dict A dict of {id: {key: val, key: val}, id: etc.} form
	 * @param {String} key One of the keys within the id: {data} block above which should be directly comparable by > and <
	 */
	static sort_by_key(dict, key)
	{
		// Create a list of refernces to projects.
		var arr = []
		for(var key_inner in dict)
		{
			if(dict.hasOwnProperty(key_inner))
			{
				arr.push(dict[key_inner])
			}
		}
		// Sort the list of references by reference updated_at
		arr.sort(function(a, b) 
		{
			var keyA = a[key],
				keyB = b[key];
			// Compare the 2 dates
			if (keyA < keyB) return -1;
			if (keyA > keyB) return 1;
			return 0;
		});
		return arr // Return the list of references.
	}
 
	 /**
	  * Return a list of sorted references to a entries in a standard-format bundle-dict by a key within the bundle-dict. This will be
	  * of form [{key: val, key: val}, etc.]
	  * @param {Object} dict A dict of {id: {key: val, key: val}, id: etc.} form
	  * @param {String} key One of the keys within the id: {data} block above which should map to something that resolves to a Date()
	  */
	static sort_by_key_date(dict, key)
	{
		// Create a list of refernces to projects.
		var arr = []
		for(var key_inner in dict)
		{
			if(dict.hasOwnProperty(key_inner))
			{
				arr.push(dict[key_inner])
			}
		}
		// Sort the list of references by reference updated_at
		arr.sort(function(a, b) 
		{
			var keyA = new Date(a[key]),
				keyB = new Date(b[key]);
			// Compare the 2 dates
			if (keyA < keyB) return -1;
			if (keyA > keyB) return 1;
			return 0;
		});
		return arr // Return the list of references.
	}

	/**
	 * Add a tracked instance id set to this datahandler's tracked instances.
	 * 
	 * Set the instance ID's that are currently tracked by this Bundle. If an instance is 'tracked' it means that it will be
	 * automatically pulled down on data_refresh/data_pull
	 * 
	 * @param {*} ids id or list of ids
	 */
	data_tracked_add(ids)
	{
		if(!(ids instanceof Array)) ids = [ids]
		// This is fancy es6 javascript that merges two arrays without duplicates
		this.tracked_instances = [...new Set([...this.tracked_instances,...ids])]
	}

	/**
	 * Remove a tracked instance id set to this datahandler's tracked instances.
	 * 
	 * @param {*} ids id or list of ids
	 */
	data_tracked_remove(ids)
	{
		if(!(ids instanceof Array)) ids = [ids]
		for(var x = 0; x < ids.length; x++)
		{
			var index = this.tracked_instances.indexOf(ids[x])
			if(index != -1)
			{
				this.tracked_instances.splice(index, 1)
			}
		}
	}

	/**
	 * Get a list of integer ID's of current loaded instances, sorted from least to greatest
	 */
	ids_get_ordered()
	{
		return Object.keys(this.data.instances).sort(function(a,b) {return a - b})
	}
}

export { DHBundler }
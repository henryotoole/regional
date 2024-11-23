/**
 * @file Holds a REST implementation of the datahandler
 * @author Josh Reed
 */

import { DHTabular } from "../regional.js"

const PUSH_CONFLICT_RESOLUTIONS = {
	/** This will resolve push conflicts by raising an exception and placing the burden on the developer. */
	WITH_EXCEPTION: Symbol("WITH_EXCEPTION"),
	/** This will resolve push conflicts by presuming that the server accepted changes, but did not report so. */
	KEEP_CHANGES: Symbol("KEEP_CHANGES"),
	/** This will resolve push conflicts by presuming that the server rejected changes, but did not report so. */
	DISCARD_CHANGES: Symbol("DISCARD_CHANGES"),
}

const JSON_HEADERS = {
	'Accept': 'application/json',
	'Content-Type': 'application/json'
}

class ErrorREST extends Error
{
	/**
	 * Construct an error to raise when a REST operation fails. This will just auto-format the error message
	 * and add specified fields to the error for upstream reading.
	 * 
	 * @param {String} operation An informal, plain english string describing what we were attempting
	 * @param {String} method The HTTP method verb that was used e.g. GET or PUT
	 * @param {Number} http_code The response HTTP code e.g. 200, 403
	 */
	constructor(operation, method, http_code)
	{
		super(`Operation '${operation}' fails with code ${http_code}`)
		this.data = {
			operation: operation,
			method: method,
			http_code: http_code
		}
	}
}

/**
 * **Overview**
 * An implementation of a DataHandler to access data across an REST API. This implementation makes the following
 * assumptions about the data being accessed:
 * 1. That it generally follows the REST practices defined below.
 * 2. That the data behind the API is tabular in nature.
 * 3. That the API backend handles 'ownership' and 'validation'. Some form of user authentication will be
 * used to determine what subset of all 'nouns' available the current user is allowed to access. In the
 * future I will build some tooling to use real API credentials. For now, flask's login system is sufficient.
 * 
 * An instance of DHREST should refer to a single resource behind the REST API. It might be helpful to
 * subclass DHREST. For example, DHRNoun(DHREST) would refer to the 'noun' behind /api/v2/noun and
 * /api/v2/noun/<id>. The datahandler instance will hold local copies of the rows of 'nouns' that have
 * been tracked.
 * 
 * **REST Architecture**
 * This datahandler presumes the following table of rest operations, given nouns, verbs, and urls.
 * ```
 * URL                    | METHOD  | Action
 * -----------------------+---------+-----------------------------------
 * '.../noun'             | GET     # Get a list of available ID's
 * '.../noun'             | POST    # Create a new 'noun'
 * -----------------------+---------+-----------------------------------
 * '.../noun/<id>'        | GET     # Get data for a specific 'noun'
 * '.../noun/<id>'        | PUT     # Update data for a specific 'noun'
 * '.../noun/<id>'        | DELETE  # Delete a 'noun'
 * ```
 * If the API differs from this form in some way, various methods (_get, _create, etc.) may have to be
 * altered in a child class.
 * 
 * **Filtering**
 * Filtering is a way to get a subset of ID's by some means of filtering.
 * `GET /noun?filter=FILTER_DATA` is used to achieve this. The REST backend must support this.
 * This method is somewhat unique to my own systems, so when connecting to most REST backends this
 * will likely need to change a bit.
 * 
 * 
 * **Tracking**
 * By default, a DHREST will not pull anything down when pull() is called. Data must be discovered
 * with list() and then tracked accordingly. 
 * 
 * **Usage**
 * In addition to pull() and push(), this datahandler exposes the following useful functionality:
 * + create() to make a new record
 * + delete() to delete a record
 * + track_all() to track all available records for this user. Depending on the API, this could be a lot.
 * + track_ids() / untrack_ids() for more precise tracking
 * 
 * Classical rest get() and update() behavior should be accomplished, broadly, using pull() and push(). The
 * developer should not frequently need to think about such things as individual get() calls.
 * 
 * **The Future**
 * I have a lot left to learn about the quirks of REST API's. Implementations differ wildly. As I use these
 * classes more and more outside of my own walled garden, I expect some things will change. Some future features:
 * + Pagination
 * + Better function structure for custom implementation of special get_ methods.
 * + Better consideration for caching. Currently, all GET requests are cachebusted.
 */
class DHREST extends DHTabular
{
	/** @type {URL} The url at which access to this API is made */
	api_url
	/** @type {Array} The currently-tracked ID's for this datahandler instance */
	_tracked_ids
	/** @type {Array} A list of ID's that have been marked for refresh. */
	_marked_ids
	/** @type {Object} A mirror of _data that contains only data that originated from the server. No local changes. */
	_data_from_server
	/** @type {Boolean} Whether cachebusting is enabled. If so, all fetch operations will cachebust. */
	_cache_bust_enabled
	/** @type {string} The key of the ID for a record in server-returned data */
	_id_key
	/** @type {PUSH_CONFLICT_RESOLUTIONS} how this dh instance will resolve push conflicts */
	push_conflict_res

	/**
	 * Construct a new REST DataHandler that will point at the provided URL.
	 * 
	 * The api_url can be an absolute URL to another domain, or one relative to the current domain's root
	 * 
	 * @param {string} api_url The root path to the REST API routes, e.g. '/api/v2/noun'
	 * @param {string} id_key What key in record data represents the ID. Defaults to "id"
	 */
	constructor(api_url, id_key="id")
	{
		super()
		// Try to set the URL, either directly or by appending to window location.
		if(api_url.slice(-1) == "/") api_url = api_url.substring(0, api_url.length - 1)
		try
		{
			this.api_url = new URL(api_url)
		}
		catch
		{
			this.api_url = new URL(api_url, window.location.origin)
		}
		this._cache_bust_enabled = true
		this._id_key = id_key
		this.push_conflict_res = PUSH_CONFLICT_RESOLUTIONS.WITH_EXCEPTION

		// Internal tracking config
		this._tracked_ids = []
		this._marked_ids = []
		this._data_from_server = {}
	}

	/**
	 * Unique name for a REST datahandler is it's constructor name followed by api url.
	 */
	get name() {return `${this.constructor.name}_${this.api_url}`}

	/**
	 * Retrieve all 'tracked' data from the server that has not yet already been pulled down. This can be called
	 * as frequently as wished and will only bother the server when tracked data is found to be missing.
	 * 
	 * **Warning**: Any data that has changed on the server **by other clients** since the *last time* this method
	 * was called will not be updated unless they have been marked for refresh. See mark_for_refresh().
	 * 
	 * **Implementation**
	 * In this REST implementation, this looks at our tracked ID's and local cache data in _data. All tracked ID's
	 * that are not in _data will be fetched with _get_many() and stored in _data.
	 * 
	 * @returns {Promise} A promise that will resolve when the data pull is complete
	 */
	async pull()
	{
		// Collect tracked ID's that are missing.
		let ids_missing = []
		this._tracked_ids.forEach((id)=>
		{
			if(this._data[id] == undefined) ids_missing.push(id)
		})

		// Merge with marked ID's to get a full set to pull
		let ids_to_pull = [...new Set([...this._marked_ids,...ids_missing])]

		return this._get_many(ids_to_pull).then(()=>
		{
			// Clear marked ID's, as they have now been refreshed.
			this._marked_ids = []
		})
	}

	/**
	 * Update the server to match this local client. This can be called as frequently as wished, as only changes
	 * that have occurred as a result of local actions will be sent.
	 * 
	 * **Warning**: Calling this could precipitate a change in local data, as the UPDATE on the server may
	 * incur some code that makes additional changes, in this table or perhaps elsewhere. This DH's local
	 * copy will be brought up-to-date with ALL changes automaticaly. Other DH's will not.
	 * 
	 * **Implementation** In this REST implementation, this looks at a cache of local that reflects what the
	 * server ought to contain (and indeed will contain if no other clients have made independent changes).
	 * Any differences between that cache and local data will be sent to the server.
	 * 
	 * @returns {Promise} A promise that will resolve when the data push is complete
	 */
	async push()
	{
		let change_map = this._local_data_xor()
		// _put_many() stowes all returned data into 
		return this._put_many(change_map).then(()=>
		{
			// This last check is neccessary in the event that the server doesn't report a change.
			// See _push_resolve_conflict()'s docstring for more details.
			
			// Here we check the new data (from server) against the old cache. They should match.
			Object.keys(this._data).forEach((id)=>
			{
				// Get all unique keys across both
				this._all_keys = [...new Set([
					...Object.keys(this._data[id]),
					...Object.keys(this._data_from_server[id])
				])]
				this._all_keys.forEach((k)=>
				{
					// This assumes a flat datastructure, and might exhibit weird behavior otherwise.
					if(this._data[id][k] != this._data_from_server[id][k])
					{
						this._push_resolve_conflict(id, k)
					}
				})
			})
		})
	}

	/**
	 * This function is neccessary in the event that the server doesn't report a change.
	 * 
	 * Consider the following situation:
	 * 
	 * id 2 has update sent for `{k1: v1, k2: v2}`, because
	 * 		`_data[2] = {k1: v1, k2: v2}` and `_data_from_server[2] = {k1: PRE, k2: PRE}`
	 * 
	 * Perhaps the server responds with `{k1: v1}` as the 'updated' response. This is a problem,
	 * because now there's still a conflict for 'k2' and push() will trigger a request every
	 * time it is called.
	 * 
	 * To deal with this:
	 * A) An error could be raised, forcing the developer to investigate the issue.
	 * B) All effected ID's could be marked for refresh and a pull() called.
	 * C) Local cache of 'server data' could be altered to match the changes we've made, which implicitly
	 *    assumes that the server has *accepted* the new value, just not reported it.
	 * D) Local data could be made to match local cache of 'server data', which would discard any local
	 *    changes and implicitly assume that the server has rejected the new value, but not reported it.
	 * 
	 * @param {*} id The ID of the object with a conflict.
	 * @param {string} k The key to the data dict where the conflict was noticed.
	 */
	_push_resolve_conflict(id, k)
	{
		if(this.push_conflict_res == PUSH_CONFLICT_RESOLUTIONS.WITH_EXCEPTION)
		{
			throw new Error(`Push conflict when updating <${this.constructor.name}:${id}> - key '${k}'` +
				`was nominally updated but not reported by server. Value was changed from` +
				`${this._data_from_server[id][k]} to ${this._data[id][k]}`)
		}
		else if(this.push_conflict_res == PUSH_CONFLICT_RESOLUTIONS.KEEP_CHANGES)
		{
			this._data_from_server[id][k] = this._data[id][k]
		}
		else if(this.push_conflict_res == PUSH_CONFLICT_RESOLUTIONS.DISCARD_CHANGES)
		{
			this._data[id][k] = this._data_from_server[id][k]
		}
	}

	/**
	 * Mark the following ID's for refresh. Next time pull() is called, these ID's will have fresh state
	 * data pulled regardless of whether state data already exists locally.
	 * 
	 * This can be called multiple times with overlapping ID's safely.
	 * 
	 * @param {*} id_or_ids Either a single ID or a list of ID's
	 */
	mark_for_refresh(id_or_ids)
	{
		if(!(id_or_ids instanceof Array)) id_or_ids = [id_or_ids]
		let ids = id_or_ids

		// Clever ES6 to merge two lists and remove duplicates.
		this._marked_ids = [...new Set([...this._marked_ids,...ids])]
	}

	/**
	 * Mark all tracked ID's for refresh.
	 */
	mark_all_for_refresh()
	{
		this.mark_for_refresh(this._tracked_ids)
	}

	/**
	 * @param {*} id The ID to get a URL for, or undefined for base URL e.g. /api/url/
	 * @returns {URL} Of the form www.xxxxxx.com/api/url/id
	 */
	_url_for(id)
	{
		if(id)
		{
			return new URL(id, this.api_url + "/")
		}
		else
		{
			return this.api_url
		}
	}

	/**
	 * Create a new object via the API this DH points at. This will:
	 * + Fire a POST request at the 'plural' URL
	 * + Update local data with the result
	 * + Track the newly created record.
	 * 
	 * The contents of 'data' will be specific to the object being created. This can be overridden in an
	 * object-specific subclass to define arguments and provide documentation, if desired, but super() should
	 * still be called with a proper data object in the end.
	 * 
	 * @param {Object} data Key/value mapped data for new device record.
	 * 
	 * @returns {Promise} That will resolve with the new ID as an argument when the new record has been created.
	 */
	async create(data)
	{
		return new Promise((res, rej)=>
		{
			return this._create(data).then((returned_data)=>
			{
				if(!(this._id_key in returned_data)) {
					rej(`When creating new ${this.constructor.name} record, returned data did ` + 
						`not contain an ID on key '${this._id_key}'. Check that the id_key constructor param ` +
						`is correct.`
					)
				}
				let id = returned_data[this._id_key]
				this._local_data_set_from_server(id, returned_data)
				res(id)
			}).catch((e)=>{
				rej(e)
			})
		})
	}

	/**
	 * Actually do the heavy lifting to create a new object via the API this DH points at. This will:
	 * + Fire a POST request at the 'plural' URL
	 * + Update local data with the result
	 * + Track the newly created record.
	 * 
	 * @param {Object} data Key/value mapped data for new device record.
	 * 
	 * @returns {Promise} That will resolve with the returned data as an argument when the new record has been created.
	 */
	async _create(data)
	{
		return fetch(
			this._url_for(undefined),
			{
				method: "POST",
				body: JSON.stringify(data),
				headers: JSON_HEADERS,
			}
		).then((response)=>{
			if(response.status == 200)
			{
				return response.json()
			}
			else
			{
				throw new ErrorREST(
					"Create new", "POST", response.status
				)
			}
		})
	}

	/**
	 * Delete a record by ID. This will perform the deletion on the server and then update local records
	 * accordingly if successful. Data record will be deleted and ID will be untracked.
	 * 
	 * @param {*} id The ID of the record to delete.
	 * 
	 * @returns {Promise} That will resolve when the record has successfully been deleted.
	 */
	async delete(id)
	{
		return this._delete(id).then(()=>
		{
			this.data_delete_record(id)
			this.untrack_ids([id])
		})
	}
	
	/**
	 * Delete a record by ID via a DELETE request sent to the 'plural' URL. Cascading effects may need
	 * to be considered. This will not change the internal state of this datahandler - it is only concerned
	 * with prosecuting the REST operation.
	 * 
	 * @param {*} id The ID of the record to delete.
	 * 
	 * @returns {Promise} That will resolve when the record has successfully been deleted.
	 */
	async _delete(id)
	{
		return new Promise((res, rej)=>
		{
			fetch(
				this._url_for(id),
				{
					method: "DELETE"
				}
			).then((response)=>
			{
				if(response.status == 200)
				{
					res()
				}
				else
				{
					rej(`Deletion of <${this.constructor.name}:${id}> fails with code ${response.status}`)
				}
			})
		})
	}

	/**
	 * Shorthand to fire a GET request at the plural URL to get a list of available ID's.
	 * 
	 * **On Filtering**
	 * Filtering is made automatically possible via the included 'filter_data' arg. When it is provided,
	 * it will take the form {"k1": "v1", "k2": "v2", ...}. The returned ID's should all have record data
	 * rows "k1" that have value "v1" and "k2" with "v2", etc.
	 * 
	 * Record data that is excluded from serialization (for example, user passhash) is not allowed for filtering
	 * and will trip an error.
	 * 
	 * @param {Object} filter_data Optional data to filter response by.
	 * 
	 * @returns {Promise} That resolves with the list of ID's available.
	 */
	async list(filter_data)
	{
		return new Promise((res, rej)=>
		{
			let altered_url = this._url_for(undefined)
			if(filter_data)
			{
				altered_url.searchParams.append('filter', encodeURIComponent(JSON.stringify(filter_data)))
			}
			let opts = {
				method: "GET"
			}
			if(this._cache_bust_enabled)
			{
				opts.cache = "no-store"
			}
			fetch(
				altered_url, opts
			).then((response)=>
			{
				if(response.status == 200)
				{
					return response.json()
				}
				else
				{
					rej(new ErrorREST(
						"Fetch list of ID's", "GET", response.status
					))
				}
			}).then((data)=>
			{
				res(data)
			})
		})
	}

	/**
	 * Fire a classic GET request at the singular URL to get the data for the indicated instance by ID.
	 * 
	 * @param {*} id The ID to get data for
	 * 
	 * @returns {Promise} A promise that will resolve with data for this record
	 */
	async _get(id)
	{
		return new Promise((res, rej)=>
		{
			let opts = {
				method: "GET"
			}
			if(this._cache_bust_enabled)
			{
				opts.cache = "no-store"
			}
			fetch(
				this._url_for(id), opts
			).then((response)=>
			{
				if(response.status == 200)
				{
					return response.json()
				}
				else
				{
					rej(`Get data for <${this.constructor.name}:${id}> fails with code ${response.status}`)
				}
			}).then((data)=>
			{
				res(data)
			})
		})
	}

	/**
	 * Fire a classic PUT request at the singular URL to update some data for the indicated instance by ID.
	 * 
	 * @param {*} id The ID to get data for
	 * @param {Object} data Key/value pairs of data which shall be sent to the server to update this record
	 * 
	 * @returns {Promise} A promise that will resolve with new data for this record
	 */
	async _put(id, data)
	{
		return new Promise((res, rej)=>
		{
			fetch(
				this._url_for(id),
				{
					method: "PUT",
					body: JSON.stringify(data),
					headers: JSON_HEADERS,
				}
			).then((response)=>
			{
				if(response.status == 200)
				{
					return response.json()
				}
				else
				{
					rej(`Update data for <${this.constructor.name}:${id}> fails with code ${response.status}`)
				}
			}).then((data)=>
			{
				res(data)
			})
		})
	}

	/**
	 * This is an internal helper method which will contact the server to get a new, full
	 * set of data for every ID included. This will make many individual GET requests
	 * (GET /api/noun/1, GET /api/noun/2, ...).
	 * 
	 * @param {Array} ids The ID's to fetch.
	 * 
	 * @returns {Promise} A promise that will resolve without args when all id's have been gotten and stored
	 */
	async _get_many(ids)
	{
		var all_promises = []
		ids.forEach((id)=>
		{
			// Wrap the _put promise with another that sets the data when it returns.
			let get_and_set = new Promise((res, rej)=>
			{
				this._get(id).then((data_returned)=>
				{
					this._local_data_set_from_server(id, data_returned)
					res()
				})
			})
			// And add that to the big list
			all_promises.push(get_and_set)
		})
		// Execute all in the 'big list' of promises.
		return Promise.all(all_promises)
	}

	/**
	 * This is an internal helper method which will cause the server to update records for all object data
	 * in the provided data_map. This will spawn a great many individual updates.
	 * 
	 * @param {Object} data_map ID-mapped Objects which contain 'data' for classic PUT requests.
	 * 
	 * @returns {Promise} A promise that will resolve with no args when all updates are complete.
	 */
	async _put_many(data_map)
	{
		var all_promises = []
		Object.entries(data_map).forEach(([id, data])=>
		{
			// Wrap the _put promise with another that sets the data when it returns.
			let put_and_set = new Promise((res, rej)=>
			{
				this._put(id, data).then((data_returned)=>
				{
					this._local_data_set_from_server(id, data_returned)
					res()
				})
			})
			// And add that to the big list
			all_promises.push(put_and_set)
		})
		// Execute all in the 'big list' of promises.
		return Promise.all(all_promises)
	}
	
	/**
	 * This is a handy piece of automation that will track all ID's available. This might be quite a few,
	 * so beware.
	 * 
	 * Under the hood, this is achieved by firing a GET request at the plural URL and collecting the ID's
	 * that it returns.
	 * 
	 * @returns {Promise} That will resolve when all ID's have been collected for tracking.
	 */
	async track_all()
	{
		return this.list().then((ids)=>
		{
			this.track_ids(ids)
		})
	}

	data_delete_record(id)
	{
		super.data_delete_record(id)
		delete this._data_from_server[id]
	}

	/**
	 * Track the provided list of ID's.
	 * 
	 * A tracked id will automatically be pulled by pull() actions. To track an ID is, generally, to ensure
	 * that its data will always be available to the frontend more or less automatically.
	 * 
	 * @param {Array} ids A list of ID's to track. They will likely be ints, but might be strings. All unique.
	 */
	track_ids(ids)
	{
		// Clever ES6 to merge two lists and remove duplicates.
		this._tracked_ids = [...new Set([...this._tracked_ids,...ids])]
	}

	/**
	 * Untrack a set of ID's. This will:
	 * 
	 * 1. Remove the ID from tracking, ensuring that future pull()'s won't fetch data for it.
	 * 2. Remove the record data for this ID from this datahandler instance's data entirely.
	 * 
	 * @param {Array} ids A list of ID's to untrack.
	 */
	untrack_ids(ids)
	{
		// Clunky but solid method. Iterate in reverse so that if _tracked_ids
		// is the arg the length change won't disrupt iteration.
		for(var x = ids.length - 1; x >= 0; x--)
		{
			let id = ids[x]
			var index = this._tracked_ids.indexOf(id)
			if(index != -1)
			{
				this._tracked_ids.splice(index, 1)
			}
			this.data_delete_record(id)
		}
	}

	/**
	 * Untrack all currently tracked ID's. This will:
	 * 
	 * 1. Remove all IDs from tracking, ensuring that future pull()'s won't fetch data for them.
	 * 2. Remove all record data for these IDs from this datahandler instance's data entirely.
	 */
	untrack_all()
	{
		this.untrack_ids(this._tracked_ids)
	}

	/**
	 * Set data for this object in the local data cache. This should only ever be called for data that is
	 * **known to be true** from the server.
	 * 
	 * This updates both our local data (which may contain local changes) and our local cache of server data
	 * (which never contains local changes).
	 * 
	 * @param {*} id The ID of the record
	 * @param {Object} data The data that corresponds with this object (some or all)
	 */
	_local_data_set_from_server(id, data)
	{
		// Update data with traditional method
		this.data_update_record(id, data)
		
		// Perform an identical operation on the server cache.
		if(this._data_from_server[id] == undefined) this._data_from_server[id] = {}
		Object.assign(this._data_from_server[id], data)
	}

	/**
	 * Compare the local data to the local cache of server data and see if we've made any local
	 * changes. If we have, produce a data_map which contains only those values which
	 * have changed.
	 * 
	 * @returns {Object} A data_map object where vals are {colname-key: row-value} dicts
	 * 	of local changes that are not yet on the server.
	 */
	_local_data_xor()
	{
		var data_map = {}
		Object.keys(this._data_from_server).forEach((id)=>
		{
			var server_data = this._data_from_server[id],
				local_data = this._data[id],
				diffs = {}

			if(local_data == undefined)
			{
				// Probable cause is the deletion of a local record without using delete()
				throw(`Local record for '${id}' does not exist in local data. Something has gone wrong.`)
			}

			// We only care about keys that originate on the server. Anything that has been added locally, for
			// whatever reason, is ignored.
			Object.keys(server_data).forEach((k)=>
			{
				// If the keys are different, use the local one
				if(server_data[k] != local_data[k])
				{
					diffs[k] = local_data[k]
				}
			})

			// If there were any differences, add to master list
			if(Object.keys(diffs).length > 0)
			{
				data_map[id] = diffs
			}
		})

		return data_map
	}
}

export {DHREST, PUSH_CONFLICT_RESOLUTIONS, ErrorREST}
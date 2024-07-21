// rfm_core/datahandlers/dh.js
// Josh Reed 2021
//
// Core part of the regional model framework. This is the fundamental block of data. A datahandler
// is designed to communicate with a backend keep a copy of some sort of data that exists on the
// backend.
//
// To use this class, child classes must override the data_pull() functions. If the data is not
// read only, then the data_push() function must also be overridden.

/**
 * The DataHandler toolchain is still somewhat of a work in progress, reflecting my own understanding of
 * client-server API's changing over time. Originally the DataHandler developed entirely organically. I didn't
 * know much about REST, RPC, or even CRUD. I started by building really direct access-this-resource-at-this-
 * endpoint type methods, and over time wrote code to 'automate' that away.
 * 
 * I wound up, in retrospect, creating something that *resembles* REST manipulated by CRUD abstract methods that
 * are prosecuted by RPC. This is, frankly, wildy hilarious. It's a bit of a mess, but it winds up achieving
 * the same thing as a RESTful API *in a very automatic way*. As things stand, I can spin up a project and
 * essentially securely expose databases to the frontend in an abstract way such that *I don't even have
 * to think about* the abstraction layers in between.
 * 
 * So, with this big refactor to v0.1 I have to ask "what does the DataHandler really do?". What's worth
 * preserving?
 * 
 * From the client-development perspective, the DataHandler implements abstractions of POST/PUT/GET/PATCH/DELETE.
 * But it also allows for Component-wrapping of data for methods and helpful things like 'get all X where X.y
 * is true'.
 * 
 * From the API-layer level (e.g. client-to-server comms) it automatically handles transferring data to and from
 * the server. But this is tricky! We can choose modularity or integration. Integration is, of course, faster
 * to develop but modularity allows for much simpler testing and actual API behavior.
 * 
 * At the backend (switching to Bundler stuff) the advantage is the opening-up of resources like SQL tables
 * with minimal boilerplate.
 * 
 * To preserve all this, the following toolchain would work: (client to server)
 * 1. DataHandlers that still expose the same methods to the rest of regional but use actual REST methods
 *    to communicate with the server.
 * 2. Client-to-backend communication occurs across an airgap that's actually REST compliant. The server
 *    has all those ungainly /api/thing/x and /api/that endpoints that POST/PUT/ETC can fire against.
 * 3. The backend can be *whatever*, but in my development stack I'll end up using Connexion -> Marshmallow ->
 *    SQLAlchemy -> SQL on a Flask server to automate away the access. Looking into this method, it's really
 *    the ultimate conclusion my own bundling work was asymptotally converging on.
 * 
 * This toolchain has the following advantages:
 * + Server can actually be airgapped from client. I can write a regional app for someone else's REST API and
 *   someone else can write a client for my server app.
 * + Full 'automation' from regional to SQL is still just as available, if not even easier to write thanks to
 *   Connexion's automation.
 * + My code projects can be broken into a frontend codebase and a backend codebase, if I desire in the future.
 * 
 * - Josh, '24
 */
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
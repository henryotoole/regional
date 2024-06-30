class RegionAppUser extends RegionApp
{
	/**
	 * A special form of the RegionApp that has a user id attached to it.
	 * @param {String} html_id The html_id to bind this region to (toplevel)
	 */
	constructor(html_id)
	{
		super(html_id)

		this.current_user_id = undefined// Set during _load_special()
	}

	/**
	 * Called to load any special resources. This is intended to be overwritten by a child to provide functionality.
	 * This is called after modules loads but before datahandler loads.
	 * 
	 * @returns {Promise} A promise which loads special resources.
	 */
	_load_special()
	{
		return new Promise((res, rej)=>
		{
			this.fetch_user_id().then((user_id)=>
			{
				this.current_user_id = user_id
				res()
			}).catch((e)=>
			{
				rej(e)
			})
		})
	}

	/**
	 * Get the currently logged in user's ID for this page.
	 * 
	 * @return {Promimse} a promise that will resolve with the first argument as the user's ID
	 */
	fetch_user_id()
	{
		throw(this.constructor.name + " did not override get_user_id()")
	}
	
	/**
	 * Get the ID of the logged in user for this app session
	 * 
	 * @returns {Number} the ID of the currently logged in user.
	 */
	get_user_id()
	{
		return this.current_user_id
	}
}
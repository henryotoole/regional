/**
 * An App is a special sort of toplevel region of which there should be only one per webpage. It's very similar to a regular
 * region, but it has special code to handle the sort of toplevel functionality that the toplevel region needs. For instance,
 * the App level has the list of all created regions so that we can check if an html_id has already been used on init.
 * 
 * The App also handles things like binding click-events at the page level.
 */
class RegionApp extends Region
{
	constructor(html_id)
	{
		super(html_id, null)
		this.app = this

		// Setup the clipboard
		this.clipboard = new Clipboard(this)
		// Setup drag dataspot. Used by component class
		this._dragdata = {component: undefined}

		this._registered_regions = []
		this._registered_overlays = []
		this._registered_anchors = {} // See _register_anchor_location()
		this._focus_region = this // This app is focused by default
		this._focus_timestamp = undefined // Used to compare click events

		this.r = {} // A dictionary that contains references to all existing regions, for convinience of access.

		this.dynamic_imports = {} // A dict populated with all dynamic imports (if any are made)

		// Create and insert the greyout that is required for the operation of overlays.
		this.$grey = $("<div></div>")
			.addClass('regcss-ovl-greyout')
			.css('z-index', RegionApp.greyout_z_index)
		$("body").prepend(this.$grey)

		// Bind any global events
		$(window).click(this.global_click.bind(this))
		$(window).on('hashchange', this._anchor_on_hash_change.bind(this, 1))

		this._anchors_ignore_next = 0 // See _anchor_on_hash_change()
		this._anchor_hash_on_load = document.location.hash.replace('#','')
		this.anchors_disable = 0 // Set this to true in child constructor to disable anchor behavior.
		this.loading = 1
		this._load_dynamic_modules().then(()=>
		{
			// Handled in finally()
		}).catch((e)=>
		{
			console.error("Failed to load all dynamic modules. Continuing execution anyways - there may be problems.")
			console.error(e)
		})
		.finally(()=>
		{
			this.on_dynamic_modules_loaded()
			return this._load_dispatch()
		})
		.then(()=> // _load_dispatch
		{
			// Handled in finally()
		}).catch((e)=>
		{
			console.error("Failed to load dispatch: ")
			console.error(e)
		})
		.finally(()=>
		{
			this.on_dispatch_loaded()
			return this._load_special()
		})
		.then(()=> // _load_special
		{
			// Handled in finally()
		}).catch((e)=>
		{
			console.error("Failed to load specials.")
			console.error(e)
		})
		.finally(()=>
		{
			this.on_specials_loaded()
			return this._load_datahandlers()
		})
		.then(()=> // _load_datahandlers
		{
			// Nothing else to load - no more chaining. Finally() handles next step.	
		}).catch((e)=>
		{
			console.error("Failed to load all datahandlers.")
			console.error(e)
		})
		.finally(()=>
		{
			this.loading = 0
			this.on_datahandlers_loaded()
			this.on_app_load_complete()
			this._anchor_on_hash_change(0)
		})
	}


	static get greyout_z_index() {return 10}


	/**
	 * Loads all dynamic modules completely.
	 * 
	 * @returns {Promise}
	 */
	_load_dynamic_modules()
	{
		var dynamodules = this.get_dynamic_modules(),
			promises = []

		for(var x = 0; x < dynamodules.length; x++)
		{
			var promise = new Promise((res_outer, rej_outer)=>
			{
				import(dynamodules[x].path).then(function(module_name, module)
				{
					// Append to the list so that we are reachable.
					this.dynamic_imports[module_name] = module
					if(module.on_module_load == undefined)
					{
						console.warn("Module '" + module_name + "' does not define an 'on Promise load' function. Assuming load completed in this case.")
						return new Promise((res, rej)=>{res()}) // Return a promise that immediately resolves.
					}
					else
					{
						return module.on_module_load // This is a promise
					}
				}.bind(this, dynamodules[x].name)).catch((err)=>
				{
					console.error("Module load error:")
					console.error(err)
					rej_outer()
				})
				.then(function(module_name)
				{
					console.log("Loaded module " + module_name)
					res_outer()
				}.bind(this, dynamodules[x].name)).catch((e)=>
				{
					console.error("Module instantiate error:")
					console.error(e)
					rej_outer()
				})
			})
			promises.push(promise)
		}
		// Execute all module loads and wait for all to complete.
		return Promise.all(promises)
	}


	/**
	 * Called to initiate the dispatch BACKEND for this app if one is used. Other backend-communication methods can be easily
	 * added to the _load_special() for each app, but dispatch is so prevalent among RMF applications that a special function
	 * will exist for it here.
	 * 
	 * This function will do nothing unless the dispatch_get_url() function is overwritten to return a string.
	 * 
	 *  @returns {Promise} A promise which loads dispatch. Will resolve immediately if this app has no dispatch url defined.
	 */
	_load_dispatch()
	{
		return new Promise((res, rej)=>
		{
			var dispatch_domain = window.location.origin
			var dispatch_url = this.dispatch_get_url()
			var dispatch_namespace = this.dispatch_get_namespace()
			if(dispatch_url == undefined)
			{
				res() // Nothing to load, there is no dispatch defined for this application.
			}
			var csrf_token = this.token_get_csrf()
			if(csrf_token == undefined)
			{
				rej(new Error("Cannot instantiate dispatch instance because app " + this.constructor.name + " does not define a token_get_csrf() method."))
			}
			import(this.dispatch_get_module_path()).then((module_data) =>
			{
				//Setup dispatch.js
				this._dispatch_backend = new module_data.DispatchClientJS(dispatch_domain, dispatch_url, dispatch_namespace)
				this._dispatch_backend.setup_csrf(csrf_token)
				this._dispatch_backend.setup_backend_functions().then(res).catch(rej)
			}).catch(rej)
		})
	}


	/**
	 * Called to load any special resources. This is intended to be overwritten by a child to provide functionality.
	 * This is called after modules loads but before datahandler loads.
	 * 
	 * @returns {Promise} A promise which loads special resources.
	 */
	_load_special()
	{
		return new Promise((res, rej)=> {res()})
	}


	/**
	 * Called to load all datahandlers. This will load them all concurrently. If some datahandlers need to be loaded before others,
	 * this function will need to be overwritten in child app class.
	 * 
	 * @returns {Promise} A promise which loads the datahandlers.
	 */
	_load_datahandlers()
	{
		return DataHandler.data_refresh_multiple(this.datahandlers)
	}


	/**
	 * Should return the import strings needed to instantiate this region in form {path: '../module/path.js', name: 'module_name'}
	 */
	get_dynamic_modules() {return []}


	/**
	 * Called when all dynamic modules are loaded.
	 */
	on_dynamic_modules_loaded()
	{
	}


	/**
	 * Called when dispatch is loaded.
	 */
	on_dispatch_loaded()
	{
		// This will instantiate all datahandlers and regions
		console.log("On dynamic modules loaded.")
		try
		{
			this.setup_datahandlers()
			this.setup_regions()
			console.log("Instantiate and link regions and datahandlers")
		}
		catch(e)
		{
			console.error(e)
			console.error("Could not instantiate and link regions and datahandlers.")
		}
	}


	/**
	 * Called when all special resources are loaded
	 */
	on_specials_loaded() {}


	/**
	 * Helper hook for when all datahandlers are loaded.
	 */
	on_datahandlers_loaded()
	{
		// Refresh settings *after* all instantiation complete
		console.log("On datahandlers loaded.")
		try
		{
			this.settings_refresh();
			console.log("All settings refreshed.")
		}
		catch(e)
		{
			console.error(e)
			console.error("Could not refresh settings.")
		}
	}


	/**
	 * Called when all datahandlers and regions have been setup completely. This should be overwritten in a child class and used
	 * to run the first app-specific lines of code.
	 */
	on_app_load_complete()
	{
		console.log("App completely constructed.")
	}


	/**
	 * Overwrite in child class to register all datahandlers for this project
	 */
	setup_datahandlers()
	{

	}


	/**
	 * Overwrite in child class to register the regions that are directly below this region.
	 */
	setup_regions()
	{

	}


	/**
	 * Causes the entire page (except for overlays) to be greyed out and non-clickable (urn ungreyed, if 'engage' is false)
	 * @param {boolean} engage 
	 */
	set_greyout(engage)
	{
		(engage) ? this.$grey.show() : this.$grey.hide();
	}


	/**
	 * Called when the body is clicked anywhere.
	 * @param {Event} e 
	 */
	global_click(e)
	{
		this.clipboard.deselect();
	}


	// A unique number to slap on the end of requests for anti-caching.
	static get unique() {return new Date().getTime()}


	/**
	 * Modify a $.getJSON request data block to have a unique parameter which prevents caching.
	 * @param {Object} request_data The key-value dict that is sent to the server in a $.getJSON request.
	 */
	anticache(request_data)
	{
		request_data._ = RegionApp.unique
		return request_data
	}


	/**
	 * Modify a plain URL (e.g. not a POST url) to have some random noise on the end that prevents it from
	 * pulling out of cache.
	 * @param {Object} url A plain url, like a src.
	 */
	anticache_url(url)
	{
		return url + "?_=" + RegionApp.unique
	}


	/**
	 * Get a CSRF token for this app. Behavior must be implemented in child app to work.
	 * 
	 * A CSRF token is not required for most RMF operations, but some key ones (like dispatch) will fail without it.
	 */
	token_get_csrf() {}


	/**
	 * Get the dispatch route url for this application. This function determines whether or not a dispatch backend will be loaded for this
	 * app. This function is intended to be overwritten in applications which use dispatch
	 * 
	 * @returns {str} The route URL for this app's dispatch. Can be a full url like "http://www.aperture.com/_dispatch" or a relative one like
	 * "/_dispatch"
	 */
	dispatch_get_url() {}


	/**
	 * Get the namespace which this app's dispatch instance should operate under.
	 * 
	 * @returns {str} The namespace string (see dispatch documentation)
	 */
	dispatch_get_namespace() {}


	/**
	 * Return the path to the dispatch module. This is defined by default as ../lib/dispatch.js but may be overridden in the app's child
	 * class.
	 */
	dispatch_get_module_path()
	{
		return "../lib/dispatch.js"
	}


	/**
	 * Get the dispatch backend for this app. This will just return this._dispatch_backend if there is one. If not, an error will be thrown
	 * 
	 * @return {DispatchClientJS} dispatch instance of the connected backend for this app
	 */
	get dispatch_backend()
	{
		if(this._dispatch_backend == undefined)
		{
			throw("App " + this.constructor.name + " has not defined a dispatch backend. Define a dispatch_get_url() method in the application class.")
		}
		return this._dispatch_backend
	}
	

	/**
	 * Get the region that has most recently been brought into 'focus'. A region can be set as 'focused' if it is activated,
	 * right clicked, or clicked.
	 */
	get_focus_region()
	{
		return this._focus_region
	}

	/**
	 * Set the current focus region. This is called by the subregions when they are activated, right clicked, or clicked.
	 * @param {Region} region The region to set as focused
	 * @param {Event} e OPTIONAL: The event that was fired in the event of a click. This is used to ensure that only the first of
	 * nested regions in set as focused.
	 */
	_set_focus_region(region, e)
	{
		// If we have an event and it's already been used to set focus once, ignore it (but allow it to propagate)
		if(e != undefined)
		{
			// If we've already used this event to set the focus
			if(e.timeStamp == this._focus_timestamp)
			{
				return
			}
			this._focus_timestamp = e.timeStamp
		}
		//console.log("Focus region set to " + region.id)
		this._focus_region = region
	}

	/**
	 * Return space-separated-string list of classes to apply to the tooltip $dom object. If you want to add custom classes
	 * override this function in the child app class.
	 */
	tooltip_get_classes()
	{
		return 'regcss-tooltip'
	}


	/**
	 * Deactivate all associated regions.
	 */
	deactivate_all()
	{
		// Deactivate all top-level regions, which should in turn deactivate ALL regions due to nesting.
		for(var x = 0; x < this.subregions.length; x++)
		{
			this.subregions[x].deactivate();
		}
	}

	/**
	 * This registers a region to the central app registry. This serves several purposes: A) allows for easier access of the
	 * region in code, B) allows for checks that ensure two region_id's can't be registered at once.
	 * @param {Region} region Instance of a region class.
	 */
	_register_region(region)
	{
		// Check that we've not already registered this.
		for(var x = 0; x < this._registered_regions.length; x++)
		{
			if(this._registered_regions[x].id == region.id)
			{
				throw new Error("Could not register overlay " + region.id + " because it has aready been registered!")
			}
		}
		this._registered_regions.push(region)
		this.r[region.id] = region // Add link reference
	}

	/**
	 * This registers an overlay to the central app registry. We use this to handle certain overarching overlay operations, like
	 * when several overlays are open and one is closed we can recognize that some are still open and NOT disable the greyout.
	 * @param {Region} overlay Instance of a region class.
	 */
	_register_overlay(overlay)
	{
		this._registered_overlays.push(overlay)
	}


	/**
	 * 
	 * @param {String} anchor_text The anchor text to look for
	 * @param {Region} region The instance of the region that is bound to that anchor text.
	 */
	_register_anchor_location(anchor_text, region)
	{
		if(this.anchors_disable)
		{
			console.warn("Anchor not registered: " + this.anchor_text + ". Anchors are disabled for this app.")
			return
		}
		if(this._registered_anchors[anchor_text] != undefined)
		{
			throw("Anchor " + anchor_text + " is already registered.")
		}

		// Bind the region ID to this location.
		this._registered_anchors[anchor_text] = region.id
	}


	/**
	 * Called when a region that has anchors enabled has its _anchor_activate() function called.
	 */
	_anchor_on_region_anchor_activate()
	{
		if(this.anchors_disable) return
		// See _anchor_on_hash_change
		this._anchors_ignore_next = 1
	}


	/**
	 * Called when the url anchor changes. This includes the inital load of the page.
	 * 
	 * @param {Boolean} reload_on_blank Whether to initiate a reload if the 
	 */
	_anchor_on_hash_change(reload_on_blank)
	{
		if(this.anchors_disable) return
		// If we've just called _anchor_activate() for a region, this function will fire. We don't actually
		// want to do anything in that case because the change was triggered internally by our code so
		// our code is handling that change separately. So we ignore the next change in that case.
		if(this._anchors_ignore_next)
		{
			//console.warn("Anchor ignored")
			this._anchors_ignore_next = 0
			return
		}

		var current_anchor_text = document.location.hash.replace('#','')

		// If this is the one called when the app first finishes loading, check if there was a #anchor set. If there was
		// apply it here. For some apps a region will be loaded before this final step which sets the #anchor, which will clear
		// whatever anchor was there before. This handles that case.
		if(this._anchor_hash_on_load)
		{
			current_anchor_text = this._anchor_hash_on_load
			this._anchor_hash_on_load = undefined
		}

		console.warn("Anchor proceed with text: " + current_anchor_text)
		// If there's no location at all, refresh the page.
		if(current_anchor_text == "")
		{
			if(reload_on_blank)
			{
				document.location.reload()
			}
		}
		else
		{
			this.deactivate_all()
			var anchor_reg = this.r[this._registered_anchors[current_anchor_text]]
			if(anchor_reg == undefined)
			{
				console.error("Anchor path " + current_anchor_text + " has no region associated with it.")
				document.location.hash = ""

			}
			else
			{
				anchor_reg.anchor.setup_fn()
			}
		}

	}

	/**
	 * Setup a comonent-$dom combo as draggable. Under the current system, there *must* be a component
	 * tied to a $dom for it to be draggable.
	 * @param {JQuery object} $dom The html object to be made draggable
	 * @param {Component} component Instance of the component tied to this $dom
	 * @param {Function} dragstart_fn OPTIONAL Function to be called on dragstart to set any special data,
	 * provided with args: fn(e, component, $dom_comp)
	 * @param {Function} dragend_fn OPTIONAL Function to be called on dragend to ensure cleanup,
	 * provided with args: fn(e, component, $dom_comp)
	 */
	bind_draggable($dom, component, dragstart_fn, dragend_fn)
	{
		$dom.attr('draggable', 'true')
		$dom.on('dragstart', function(e) // Starts a 'relocate to' drag operation.
		{
			e.stopPropagation();
			this._dragdata.component = component
			this._dragdata.$dom = $dom
			this._dragdata.counter = 0

			if(dragstart_fn) dragstart_fn(e, component, $dom)
		}.bind(this))
		.on('dragend', function(e) // End a 'relocate to' drag operation. See $row.drop()
		{
			if(dragend_fn) dragend_fn(e, this._dragdata.component, this._dragdata.$dom)

			e.stopPropagation();
			this._dragdata.component = undefined
			this._dragdata.$dom = undefined
			this._dragdata.counter = 0
		}.bind(this))
	}
	/**
	 * 
	 * @param {JQuery object} $dom The html region that an object can be dropped
	 * @param {String} class_name A css class to be added to $dom on dragenter and removed on dragleave
	 * @param {Function} catch_dropped_fn The function to be executed when the object is dropped. This function is
	 * provided with args: fn(e, dropped_component, $dom_dropped)
	 * @param {Function} dragover_fn OPTIONAL Function to be called every dragover event,
	 * provided with args: fn(e, dropped_component, $dom_dragging)
	 */
	bind_catchable($dom, class_name, catch_dropped_fn, dragover_fn)
	{
		$dom.on('drop', function(e) // Called when we drop a dragged name on this object.
		{
			$dom.removeClass(class_name)
			catch_dropped_fn(e, this._dragdata.component, this._dragdata.$dom)
			e.preventDefault();
		}.bind(this))
		.on('dragenter', function(e)
		{
			//e.stopPropagation(); // Important NOT to do this to support nested draggables
			// CSS to highlight this tile
			$dom.addClass(class_name)
			this._dragdata.counter ++;
			
		}.bind(this))//Needed so drop will work
		.on('dragleave', function(e)
		{
			this._dragdata.counter --;
			if(this._dragdata.counter === 0)
			{
				// CSS to un-highlight this tile
				$dom.removeClass(class_name)
			}
			//e.stopPropagation(); // Important NOT to do this to support nested draggables
		}.bind(this))
		.on('dragover', (e)=>
		{
			e.preventDefault() // Must be here for drop event to fire.
			if(dragover_fn) dragover_fn(e, this._dragdata.component, this._dragdata.$dom)
		});
	}

	/**
	 * Unbind all drag/catch behaviors from the provided $dom
	 * 
	 *  @param {JQuery object} $dom
	 */
	unbind_both($dom)
	{
		$dom.off("drop").off("dragenter").off("dragleave").off("dragover").off("dragstart").off("dragend")
		$dom.attr('draggable', 'false')
	}
}
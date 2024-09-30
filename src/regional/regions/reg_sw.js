// src/regions/reg_sw.js
// Josh Reed 2024
//
// Contains the switchyard region class.

import {Region, DataHandler, css_inject, css_format_as_rule, Clipboard, RHElement} from "../regional.js"
import {DispatchClientJS} from "../lib/dispatch.js"

/**
 * The switchyard is the toplevel region and the general manager of the entire application. It acts as the
 * focal point between all regional data access and the server as well.
 * 
 * The general method for instantiating all regions from the switchyard down is as follows:
 * 1. Instantiate the Switchyard
 * >	construct(), fab(), link(), load()
 */
class RegionSwitchyard extends Region
{
	/**
	 * Instantiate a new Switchyard region. A webapp should have only one instance of this for a page at
	 * a time.
	 * 
	 * The creation process for a Switchyard region is similar to any region, but with an extra step:
	 * 1. Instantiate, which does nothing but setup memory
	 * 2. Fabricate, which will often do nothing as for all but the smallest applications it makes more
	 *    sense to break the visuals of the page into at least one layer of regions below the switchyard.
	 * 3. Link, which is a little different from a subregion as there's no super-region for a switchyard.
	 *    Literal linking-into-DOM is also optional. See link()'s description for more info.
	 * 4. Load, which kicks of a chain of loading operations to pull down data, setup dispatch, etc.
	 * 
	 * It's good practice to extend this constructor in a child class to setup type definitions for subregions
	 * and datahandlers. See example site. TODO
	 */
	constructor()
	{
		super()

		// State data internal to the Switchyard
		/** @type {Boolean} Whether or not the app is currently in the 'loading' stage of creation. */
		this._loading = false
		


		// Configurations which effect how the switchyard loads submodules and machinery
		/** @description Configuration object for regional */
		this.config = {
			/** @description The base z-index of an ethereal region (overlay) */
			z_index_eth_base: 100,
		}
		/** @description Configuration object for dispatch */
		this.dispatch_config = {
			/** @description The domain to point Dispatch requests at. Defaults to page domain. */
			domain: window.location.origin,
			/** @description The route that dispatch aims at. The default is /_dispatch. */
			route: '/_dispatch',
			/** @description The 'namespace' that this regional application operates under */
			namespace: "js",
			/** @description Whether to print logs in verbose mode. */
			verbose: false,
			/**
			 * @description Whether or not to load functions from server, increasing load times but improving
			 * syntax for backend calls.
			 * */
			load_functions: 0
		}
		/** @description Data used to keep track of region internal 'focus' */
		this._focus_settings = {
			/** @description The currently in-focus region. can be undefined. */
			region: undefined,
			/** @description A timestamp used to prevent focus propagation. */
			timestamp: undefined
		}
		/** @description Used to keep track of procedural ID generation. */
		this._id_gen_map = {}
		/** @description Used to keep a list of functions to call on load */
		this._call_on_load = []

		// Run any 'instant' setup functions
		this._css_setup()
		this._setup_key_events()
	}

	/**
	 * Linking for a Switchyard is substantially different from regular regions. The link method
	 * is entirely overridden and performs only a subset of actions. Furthermore, it's not a requirement
	 * to actually have linking element in the DOM. A Switchyard can be 'DOMless' with no literal
	 * DOM connection, if so desired.
	 * 
	 * Linking operations for the switchyard includes:
	 * + Link this region to the specific element in webpage DOM that it represents.
	 * + Assign a unique in-memory ID for this region and set the reg_el's ID to the same.
	 * + Fabrication links (if fab() was called earlier), including links to this.$element and linking $elements
	 *   to the reg_el.
	 * 
	 * @param {HTMLElement} reg_el The DOM element for the switchyard, or undefined to leave it 'DOMless'
	 * 
	 * @returns {this} itself for function call chaining
	 */
	link(reg_el)
	{
		if(reg_el === undefined)
		{
			// Create an element that we will not attach to the DOM.
			reg_el = document.createElement("div")
		}

		this.reg = reg_el
		this.reg.setAttribute('rfm_reg', this.constructor.name)

		// Helpful for operations where we don't wish to distinguish between region and switchyard.
		this.swyd = this

		// Assign a unique in-memory ID for this region and set the reg_el's ID to the same.
		this._link_ids()

		// Fabrication links (if fab() was called earlier), including links to this.$element and linking $elements
		// to the reg_el.
		this._link_fabricate()

		// Create subregions and datahandlers.
		this._create_datahandlers()
		this._create_subregions()
		// Call post hook for subclass extension, if implemented.
		this._on_link_post()

		return this
	}

	/**
	 * @abstract
	 * 
	 * This method should create all datahandlers that are needed for this application during the link()
	 * phase of overall instantiation. This is called at the same time as _create_subregions() and only exists
	 * to provide extra guidance as to the 'correct' place to define datahandlers.
	 * 
	 * Note that this function is NOT asynchronous. If the implementation desires datahandlers to have some
	 * data available upon app load, use _load_datahandlers() as well.
	 * 
	 * Such a function might resemble:
	 * _create_datahandlers()
	 * {
	 *     this.dh_one = new DHREST()
	 *     this.dh_two = new DHTabuler()
	 * 
	 *     this.datahandler_subscribe([this.dh_one, this.dh_two])
	 * }
	 */
	_create_datahandlers() {}

	/**
	 * This method is the primary data loader for the region structure. It will load the following in this order:
	 * + Dispatch (which is instant unless configured to pull server methods)
	 * + Anything special, which would be defined in a subclass of RegionSwitchyard
	 * + Datahandlers as implemented in subclass. This may or may not result in actual loading, imp. dependent.
	 * 
	 * @returns {Promise} A promise that resolves when the app is fully loaded.
	 */
	async load()
	{
		this.settings_refresh();

		this._loading = true
		return this._load_dispatch().then(()=>
		{
			this.on_loaded_dispatch()

			return this._load_special()
		}).then(()=>
		{
			this.on_loaded_specials()
			return this._load_datahandlers()
		}).then(()=>
		{
			this._loading = false
			this.on_load_complete()
			this._call_on_load.forEach((fn)=>(fn()))
			this.render()
		}).catch((e)=>
		{
			this.on_load_failed(e)
			throw e
		})
	}

	/**
	 * @returns {Boolean} True if this switchyard is asynchronously loading things and false otherwise
	 */
	is_loading() {return this._loading}

	/**
	 * Called to initiate the dispatch BACKEND for this app if one is used. Other backend-communication methods
	 * can be easily added to the _load_special() for each app, but dispatch is so prevalent among regional
	 * applications that a special function will exist for it here.
	 * 
	 * This function will resolve immediately unless dispatch has been configured to load functions.
	 * 
	 *  @returns {Promise} A promise which loads dispatch.
	 */
	async _load_dispatch()
	{
		return new Promise((res, rej)=>
		{
			let csrf_token = this.token_get_csrf(), cfg = this.dispatch_config
			this.dispatch = new DispatchClientJS(cfg.domain, cfg.route, cfg.namespace, cfg.verbose)
			this.dispatch.setup_csrf(csrf_token)
			if(cfg.load_functions)
			{
				this.dispatch.setup_backend_functions().then(res).catch(rej)
			}
			else
			{
				res()
			}
		})
	}

	/**
	 * @abstract
	 * Called to load any special resources which must exist before the regional structure can operate.
	 * 
	 * @returns {Promise} A promise which loads special resources.
	 */
	async _load_special()
	{
		return Promise.resolve()
	}

	/**
	 * @abstract
	 * Overwrite in child class to setup datahandlers for this project. Use of this method is only required
	 * if certain datahandlers MUST be available when load() completes. This is ultimately a convenience method
	 * which can be used to, for example:
	 * + Setup any tracking that is desired so data is available on load() completion.
	 * + Call pull() so that tracked data is available.
	 * 
	 * ```
	 * _create_datahandlers()
	 * {
	 *     this.dh_one = new DHREST()
	 *     this.dh_two = new DHTabuler()
	 * 
	 *     this.datahandler_subscribe([this.dh_one, this.dh_two])
	 * }
	 * 
	 * _load_datahandlers()
	 * {
	 *     this.dh_one.track_ids([1, 2, 3])
	 * 
	 *     return this.pull()
	 * }
	 * ```
	 * 
	 * @returns {Promise} A promise that will resolve when datahandlers are setup.
	 */
	async _load_datahandlers() {return Promise.resolve()}

	/**
	 * @abstract
	 * Called when dispatch is loaded.
	 */
	on_loaded_dispatch() {}

	/**
	 * @abstract
	 * Called when all special resources are loaded
	 */
	on_loaded_specials() {}

	/**
	 * @abstract
	 * Called at the end of the _load() process. All data is loaded and regions are setup.
	 */
	on_load_complete() {}

	/**
	 * @abstract
	 * Called if, at any point, the load fails for some reason.
	 * 
	 * @param {Error} e The error that caused load failure.
	 */
	on_load_failed(e) {}

	/**
	 * Register a function to be executed when the loading stage is complete. This will fire after the
	 * post-load settings_refresh() but before the post-load render().
	 * 
	 * @param {Function} fn A function that will execute with no arguments when the loading stage is complete.
	 */
	call_on_load(fn)
	{
		this._call_on_load.push(fn)
	}

	/**
	 * @magic
	 * Inject the custom CSS classes used by regional. All of these start with 'rcss', which is a sort
	 * of magic token I suppose which generally shouldn't be used for classnames to prevent overlap.
	 * 
	 * Prater code workday:
	 * Pigeons coo from nearby tree;
	 * Bumblebees drift by.
	 */
	_css_setup()
	{
		// Note: Z-index for each overlay is set by etherealize()
		css_inject(/* css */`
			.rcss-eth {
				width: 100vw; height: 100vh;
				position: absolute;
				top: 0; left: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: rgba(25,25,25,0.65);
			}
		`)
	}

	/**
	 * Get a new ID for the given namespace. This will always return a unique string ID for whatever namespace
	 * is given. In fact, no namespace can be given and a unique namespace will still be returned.
	 * 
	 * @param {String} id_namespace Some identifying information, so this ID can be human-read more clearly
	 */
	_id_get_next(id_namespace)
	{
		// Sanitize
		if(typeof dom_src === "string") throw TypeError("Namespace ID must be string. Was " + id_namespace)

		if(!(id_namespace in this._id_gen_map))
		{
			this._id_gen_map[id_namespace] = 0
		}
		this._id_gen_map[id_namespace] += 1

		return id_namespace + this._id_gen_map[id_namespace]
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
	 * @abstract
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
	 * Call this to setup the listeners for focus. This is straightforward, but it belongs in the switchyard
	 * rather than base region class because it is in the switchyard that all the data lives.
	 * 
	 * @param {Region} region 
	 */
	_focus_region_setup_listeners(region)
	{
		this.reg.addEventListener("click", (e)=>
		{
			// If we have an event and it's already been used to set focus once, ignore it (but allow it to
			// propagate)
			if(e != undefined)
			{
				// If we've already used this event to set the focus
				if(e.timeStamp == this._focus_settings.timestamp)
				{
					return
				}
				this._focus_settings.timestamp = e.timeStamp
			}

			// If we've made it this far during this event, set the focus region.
			this.swyd.focus_region_set(this)
		})
	}

	/**
	 * Get the region that has most recently been brought into 'focus'. A region can be set as 'focused' if it is
	 * activated, right clicked, or clicked. Note that this focus is independent of what the browser might
	 * refer to as 'focused'.
	 * 
	 * @returns {Region} The currently in-focus region, or undefined if there is not one.
	 */
	focus_region_get()
	{
		return this._focus_settings.region
	}

	/**
	 * Set the current focus region. This is called by the subregions when they are activated, right clicked, or
	 * clicked.
	 * 
	 * //TODO write tests
	 * 
	 * @param {Region} region The region to set as focused
	 */
	focus_region_set(region)
	{
		this._focus_settings.region = region
	}

	/**
	 * Key events in regional are handled slightly differently than other events. Normally, when a key event
	 * occurs it will apply to anything 'content editable' like an input or a textarea. If nothing of the sort
	 * is 'in focus', it ripples up until it hits the document.
	 * 
	 * For some regions, it's handy to capture key events for certain hotkey-type functions (CTRL+S to save, for
	 * example). A keydown can not be directly bound to most tags that a reg is likely to be, so region-specific
	 * keypress handling requires a bit of its own logic. The Switchyard has listening methods that specifically
	 * propagate the event to all regions that are currently 'active'. When a keydown event occurs, unless it
	 * is captured (for instance, by a focused input box) all active regions will have this method called.
	 * 
	 * This method sets up the global key event handlers so that key presses propagate to active regions. This
	 * can be called at any point - the regional structure does not have to be instantiated for this to work.
	 */
	_setup_key_events()
	{

		document.addEventListener("keydown", (e)=>
		{
			for (const [subreg_id, subreg] of Object.entries(this.subregions))
			{
				subreg._key_event_prop("keydown", e)
			}
		})

		document.addEventListener("keyup", (e)=>
		{
			for (const [subreg_id, subreg] of Object.entries(this.subregions))
			{
				subreg._key_event_prop("keyup", e)
			}
		})
	}

	/**
	 * If specifics are not important, this can be used to automatically create and append an element to
	 * the <body> of the page which can be the root region element for an ethereal region.
	 * 
	 * @returns {RHElement} An element that has been newly created and appended to document body.
	 */
	eth_reg_create()
	{
		let el = RHElement.wrap(document.createElement("div"))
		document.body.append(el)
		return el
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
}

export {RegionSwitchyard}
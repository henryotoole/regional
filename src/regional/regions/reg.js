// src/regions/reg.js
// Josh Reed 2024
//
// Main region file.

import {RegionalStructureError, DataHandler, RegionSwitchyard, RHElement, Fabricator} from "../regional.js"

/**
 * A region is the fundamental building block of a webpage. In keeping with the regional philosophy, they may be
 * used as much or as little as one desires. However, generally it is useful to make nearly every part of
 * webapp a region.
 * 
 * There is always a toplevel region called the switchyard region. This region sits at the top of a pyramid of
 * sub-regions and handles most of the data connections two and from the server. It's the focal point between
 * the server and the rendered frontend - it connects everything to everything. Usually there's only one.
 * 
 * The switchyard region is itself just a region with some extra functions. Every region has some fundamental
 * parts:
 * + A representation in the DOM	| This can be tied to something in the HTML or generated instructionally
 * + Settings						| Data that is local to the page load memory
 * + Datahandlers					| Data that originates on the server and is only stored and operated on locally
 * + Inputs							| Special 'terminal' subregions which allow the user to input something
 * + Subregions						| Regions that contained 'within' a region and update when it updates
 * + Members						| Bits of the DOM that are NOT subregions which are bound to lets-in-memory
 * (See the function headers below for each of these things for more info)
 * 
 * Regions handle interaction with the user via a VMC sort of approach. The 'model' is the settings / data.
 * Every region has code (in the 'render') function that draws the information contained in settings / data
 * into HTML - the 'view'. The user then interacts with the page by clicking buttons or taking other actions
 * which modifies the settings / data, either directly with code in the region or through inputs which automate
 * common input actions.
 * 
 * From the switchyard region all the way down, when an update is triggered (say, a graphical refresh) the
 * refresh ripples to the very bottom (terminal) regions.
 * 
 * ### DOM Structure ###
 * Every region has a toplevel DOM tag that contains it. This toplevel tag is always kept by reference in
 * this.$reg. It will automatically be assigned the attribute rfm_reg=this.constructor.name and an ID that's
 * unique within the scope of the page.
 * 
 * Some sub-elements of a region will have specific behavior that requires a reference to the element. For
 * example, a column container might need to be referenced to append column members. Including the 'rfm_member'
 * attribute exposes submembers to easy reference with this.member_get(). rfm_member names only need to be
 * unique to a region, not the page.
 * 
 * `<div id='manual_or_procedural_id' rfm_reg='RegionExample'>
 * 		<div rfm_member='col_left' class='.col-left'>
 * 			<div class='.col-member'></div>
 * 		</div>
 * 	</div>`
 */
class Region
{
	/** Get how long the mouse must hover over a tooltip to show it, in seconds.*/
	static get tooltip_hover_time() {return 2}
	/** Get the attribute name for 'member' tags. See get_member_element()*/
	static get member_attr_name() {return 'rfm_member'}
	
	/**
	 * Instantiate a new region instance. Merely constructing a region does nothing except allocate a bit of space
	 * in memory.
	 * 
	 * The region-creation toolchain is as follows:
	 * 1. Instantiate the region (constructor).
	 * 2. Fabricate the region. This is done by calling fab() on the instance. This step is technically optional;
	 *    if the DOM for this region already exists in the page then fab() shouldn't be called.
	 * 3. Link the new region to some point within the existing region heirarchy, as well as various pointers
	 *    that make working with regions convenient. This is done with link().
	 * 
	 * When creating custom region classes, it's a good idea to extend the constructor to type declare
	 * all class internal variables. See sample site for an example.
	 */
	constructor()
	{
		/** @type {Fabricator} The fabricator that this instance has been set to use. undefined it not used. */
		this._fab = undefined
		/** @type {Boolean} Whether or not this region is currently active.*/
		this._active = true

		/** @type {Object.<string, Region>} Sub-regions that are nested within this region's model. Key-value mapped on ID */
		this.subregions = {}
		/** @type {Region} This will be set if this region is linked as a subregion to a parent region. */
		this.superregion = undefined;
		/** @type {Array.<DataHandler>} List of datahandlers that this region is subscribed to. */
		this.datahandlers = [];
		// A list of allowed component classes. Inheritance works here - adding Component to this list would
		// allow all types of component whereas adding ComponentFile would only add those that extend ComponentFile
		this.paste_allowed_components = []

		/** @description Settings object for this region. This is local data which is erased on page refresh. */
		this.settings = {}
		// Note: all settings will be refreshed whenever the APP loads

		this.reginputs = []

		/** @type {RegionSwitchyard} Reference to the switchyard region. */
		this.swyd = undefined
		/** @type {RHElement} The DOM element that represents the overall container for this region. */
		this.$reg = undefined
		/** @type {Object} Key-value map on member name of members. */
		this._member_cache = {}
		/** @type {Boolean} Whether or not this region has been ethereal-enabled */
		this.ethereal = false

		// See anchor_enable()
		this.anchor = {
			enabled: 0,
			path: this.id,
		}
	}

	/**
	 * Fabricate this region's DOM. This will use the Fabricator that has been defined for this region
	 * in fab_get().
	 * 
	 * @param {Fabricator} fab The fabricator to use to generate this region's DOM structure.
	 * 
	 * @returns {Region} itself for function call chaining
	 */
	fab()
	{
		// Merely assign this._fab, and it will be used during linking.
		this._fab = this.fab_get()

		return this
	}

	/**
	 * @abstract
	 * Get an instance of a Fabricator object for this region. Not every region needs to define a fabricator.
	 * Some regions will simply bind themselves to existing code in the webpage and have no need for this method.
	 * 
	 * @returns {Fabricator}
	 */
	fab_get() {}

	/**
	 * Perform linking operations for this region:
	 * + Link this region to its super-region and vice versa
	 * + Link this region to the specific element in webpage DOM that it represents.
	 * + Link this region to the switchyard and datahandlers and setup certain events.
	 * + Assign a unique in-memory ID for this region and set the $reg_el's ID to the same.
	 * + Fabrication links (if fab() was called earlier), including links to this.$element and linking $elements
	 *   to the $reg_el.
	 * 
	 * @param {Region} reg_super The super (or parent) region that this region will be a subregion of.
	 * @param {HTMLElement} $reg_el The main element for this region, which this region will be bound to.
	 * 
	 * @returns {Region} itself for function call chaining
	 */
	link(reg_super, $reg_el)
	{
		// Back-reference to switchyard.
		this.swyd = reg_super.swyd
		this.swyd._focus_region_setup_listeners(this)

		// Link this region to the specific element in webpage DOM that it represents.
		this.$reg = RHElement.wrap($reg_el)
		this.$reg.setAttribute('rfm_reg', this.constructor.name)

		// Assign a unique in-memory ID for this region and set the $reg_el's ID to the same.
		this._link_ids()

		// Link this region to its super-region and vice versa
		this.superregion = reg_super
		reg_super._link_subregion(this)

		// Fabrication links (if fab() was called earlier), including links to this.$element and linking $elements
		// to the $reg_el.
		this._link_fabricate()

		// Call post hook for subclass extension, if implemented.
		this._on_link_post()
		// Create subregions
		this._create_subregions()

		return this
	}

	/**
	 * @protected
	 * Setup a unique ID for this region and ensure this region's $reg matches.
	 */
	_link_ids()
	{
		// Assign a unique in-memory ID for this region and set the $reg_el's ID to the same.
		this.id = this.swyd._id_get_next(this.constructor.name)
		this.$reg.id = this.id
	}

	/**
	 * @protected
	 * Use this region's _fab (if it is defined) to generate DOM elements for this region. Those elements
	 * will be appended direclty under this regions $reg object. Pointers will be created between this region
	 * instance and those members (e.g. this.member_name -> RHElm(<div rfm_member=member_name>))
	 */
	_link_fabricate()
	{
		if(this._fab === undefined) return

		this._fab.fabricate()
		this._fab.append_to(this.$reg)
		for(const [member_name, member] of Object.entries(this._fab.get_members()))
		{
			this[member_name] = member
		}
	}

	/**
	 * @abstract
	 * This is called after linking is complete. Anything which should be done as part of the creation of a region
	 * but relies on all regional structure already being setup should go here. This might include:
	 * + Manually binding DOM elements in non-fabricated regions to HTML-defined tags.
	 * + Registering events to elements.
	 */
	_on_link_post() {}

	/**
	 * @private
	 * Link the provided region to this region as a subregion. This should only be performed once per subregion,
	 * but can be performed any number of times for this region.
	 * 
	 * If the subregion has already been registered, an error will be raised.
	 * 
	 * @param {Region} reg 
	 */
	_link_subregion(reg)
	{
		// Link into subregions on id key
		this.subregions[reg.id] = reg
	}

	/**
	 * @abstract
	 * This is called after linking is complete (just after _on_link_post()). This function can be overridden
	 * by child classes to explicitly instantiate subregions that are required for this region to function.
	 */
	_create_subregions() {}

	/**
	 * Subscribe this region to a specific datahandler. By subscribing a region to a datahandler, we ensure
	 * that the region will be graphically updated if this datahandler is updated from elsehwere.
	 * 
	 * @param {DataHandler} dh 
	 */
	datahandler_subscribe(dh)
	{
		throw(TODOError("Write datahandler subscriptions into system."))
	}

	/**
	 * Ethereal regions are regions that are not embedded in the usual 'concrete' chain of DOM elements that nest
	 * up to the region element. They are 'free floating' so to speak, and can appear anywhere on screen. The
	 * point of such a region is mostly to be used as a sort of 'overlay' or in-app popup.
	 * 
	 * Regional has a bit of magic here to abstract away the bother of managing things like overlays. Calling
	 * etherealize() during the region-creation stage will result in the following behaviors for this region:
	 * 1. This region's Z-index will be set to the 'z_index_eth_base' config in the switchyard, placing it in
	 *    front of all other regions.
	 * 2. Classes will be applied to this $reg that will position it absolutely to completely fill the viewport.
	 *    The $reg will be set to a grey color with opacity so that only DOM within the region is clickable
	 *    and appears focused.
	 * 
	 * Some restrictions:
	 * 1. This function should be called AFTER link() because $reg must be available.
	 * 2. This region must be a direct child of the switchyard.
	 * 
	 * @param {Number} [z_index] An optional secondary z-index, which should be considered to be relative only to
	 * 		other etherealized regions.
	 * 
	 * @returns {Region} This, for function call chaining
	 */
	etherealize(z_index)
	{
		// Basic checks.
		if(!this.$reg) throw(new RegionalStructureError("Must link() before etherealize()"))
		if(!this.superregion instanceof RegionSwitchyard) throw(new RegionalStructureError(
			"Ethereal regions must be direct children of the Switchyard"
		))
		if(!z_index) z_index = 0

		// Mark as ethereal, for the activate() and deactivate() bonus hooks.
		this.ethereal = true
		// Add classes to this region
		this.$reg.classList.add('rcss-eth')
		this.$reg.style.zIndex = this.swyd.config.z_index_eth_base + z_index
		// Hide the overlay by default.
		this.$reg.hide()
		return this
	}

	/**
	 * Bind an input region (usually very small, like a text box or dropdown) to this region such
	 * 
	 * Should the settings key be an arg of this function??
	 * 
	 * @param {RegInput} input The input to tie into this region.
	 */
	input_add(input)
	{
		throw(TODOError("Write new Region Input mechanism. May require different args.."))
	}

	/**
	 * Get an $element for a 'member' of this region. A member is a DOM element that belongs to this region which
	 * is *unique* within this region. It may not be unique across other regions. The member 'name' is like
	 * its ID, but unique to only this region.
	 * 
	 * There should be only one member per member name. Within the DOM, a member is given a custom attribute
	 * like 'rfm_member=member_name'. This is searched by query, which is fast these days.
	 * 
	 * To keep things fast, the result of the query is cached within this region's memory against its member
	 * name. For this reason, member elements should not be deleted or hot-swapped.
	 * 
	 * @param {str} member_name The name of the member. Unique to this region.
	 * 
	 * @throws {RegionalStructureError}
	 * 
	 * @return {HTMLElement} The member element
	 */
	member_get(member_name)
	{
		if(member_name in this._member_cache)
		{
			return this._member_cache[member_name]
		}

		let statement = '[' + Region.member_attr_name + "=" + member_name + "]"
		let $el = this.$reg.querySelector(statement)

		if(!$el) throw(RegionalStructureError("Region " + this.id + " does not have member '" + member_name + "'."))

		this._member_cache[member_name] = $el

		return $el
	}

	/**
	 * Get the ClassDef for this region's context menu.
	 */
	get context_menu()
	{
		return ContextMenu
	}

	/**
	 * This initiates a reset of the settings of this region back to their default values (e.g. those present
	 * on pageload). All subregions will also have their settings refresh - this action ripples downwards.
	 */
	settings_refresh()
	{
		// Actually do the settings refresh.
		this._on_settings_refresh()
		for (const [subreg_id, subreg] of Object.entries(this.subregions))
		{
			subreg.settings_refresh()
		}
	}

	/**
	 * @abstract
	 * @protected
	 * This is called whenever this specific region has its settings refreshed. This is the preferred location
	 * to setup settings information in a Region subclass.
	 */
	_on_settings_refresh() {}
	
	/**
	 * Completely redraw this region and all active subregions.
	 */
	graphical_render()
	{
		// Don't render non-active regions.
		if(!this.is_active())
		{
			return
		}

		for (const [subreg_id, subreg] of Object.entries(this.subregions))
		{
			if(subreg.is_active())
			{
				subreg.graphical_render()
			}
		}
		this.reginputs.forEach((reginput)=>
		{
			reginput.render()
		})
		// Call this region's render methods after children.
		this._on_graphical_render()
	}

	/**
	 * @abstract
	 * @protected
	 * This is called whenever this specific region has its settings refreshed. This is the preferred location
	 * to actually place the code that will 'redraw' a region.
	 */
	_on_graphical_render() {}

	/**
	 * Return True if the current objects on the clipboard can paste here, False if even one of them can not.
	 */
	can_paste()
	{
		return this.swyd.clipboard.has_copied_of_type(this.paste_allowed_components)
	}

	/**
	 * @abstract
	 * This function should be overwritten in any child class that allows pasting. Called by app on a paste
	 * maneuver.
	 * @param {Event} e The originating event
	 * @param {Component} component
	 */
	paste_component(e, component) {}

	/**
	 * This is called by the switchyard for top-level subregions to propagate key events down the region
	 * heirarchy.
	 * 
	 * @param {str} name The name of the event that was fired. Either keyup or keydown
	 * @param {Event} e The keyboard event that was fired.
	 */
	_key_event_prop(name, e)
	{
		// Break propagation if not active.
		if(!this.is_active()) return

		// Fire this region's events
		if(name == "keydown") this.key_event_down(e)
		else if(name == "keyup") this.key_event_up(e)

		// Propagate further
		for (const [subreg_id, subreg] of Object.entries(this.subregions))
		{
			subreg._key_event_prop(e)
		}
	}

	/**
	 * @abstract
	 * Called whenever there is a keydown event. Override this in child classes to add behavior.
	 * 
	 * Key events in regional are handled slightly differently than other events. Normally, when a key event
	 * occurs it will apply to anything 'content editable' like an input or a textarea. If nothing of the sort
	 * is 'in focus', it ripples up until it hits the document.
	 * 
	 * For some regions, it's handy to capture key events for certain hotkey-type functions (CTRL+S to save, for
	 * example). A keydown can not be directly bound to most tags that a $reg is likely to be, so region-specific
	 * keypress handling requires a bit of its own logic. The Switchyard has listening methods that specifically
	 * propagate the event to all regions that are currently 'active'. When a keydown event occurs, unless it
	 * is captured (for instance, by a focused input box) all active regions will have this method called.
	 * 
	 * @param {KeyboardEvent} e The keyboard event from the native handler.
	 */
	key_event_down(e) {}

	/**
	 * @abstract
	 * Called whenever there is a keyup event. Override this in child classes to add behavior. Only called if
	 * region is active.
	 * 
	 * See docstring for key_event_down() for more info.
	 * 
	 * @param {KeyboardEvent} e The keyboard event from the native handler.
	 */
	key_event_up(e) {}

	/**
	 * Determine whether or not this region is currently active. Only active regions will have be shown and
	 * have ripple-down actions like settings_refresh() and graphical_render() propagate.
	 * 
	 * @returns {Boolean}
	 */
	is_active()
	{
		return this._active
	}

	/**
	 * Activate this region.
	 * 
	 * Regions can be 'active' or 'disactive. An active region is visible and functioning. A 'disactive' region
	 * is hidden in the DOM and effectively disabled in the regional structure. A 'disactive' region will:
	 * + Not re-render when graphical_render is called.
	 * + Have events disabled
	 * 
	 * This function is not intended to be extended by subclasses. Most of the time, activation behavior should
	 * go in on_activate().
	 */
	activate()
	{
		// First, reset all settings and mark as active.
		this.settings_refresh()
		this._active = true
		this.on_activate_pre()

		// Now propagate the change down the stack.
		for(let x = 0; x < this.subregions.length; x++)
		{
			this.subregions[x].activate()
		}

		// Anything after this point will happen AFTER all sub-activations. This is important for anything global,
		// like focus which should apply only to the top level.

		// We re-show the region AFTER all sub-regions have had a chance to reset and render.
		this.$reg.show();

		// Do not call graphical_render here. We call at the end so that all setup can occur before draw.

		// This occurs last for the highest-level region that was activated. Desired behavior.
		this.swyd.focus_region_set(this);

		if(this.anchor.enabled)
		{
			this._anchor_activate()
		}

		// Render very last.
		this.graphical_render()
		// And call post hook
		this.on_activate_post()
	}

	/**
	 * @abstract
	 * This is called when a region is activated, just before all sub-regions are activated. Any changes
	 * made to settings here will be available for subregions.
	 */
	on_activate_pre() {}

	/**
	 * @abstract
	 * This is called when a region is activated, just after the core function has finished setting it up.
	 * By the time this is called, settings_refresh and graphical_render has been called for this region
	 * and all sub-regions that have also been activated.
	 */
	on_activate_post() {}
	
	/**
	 * Deactivate this region.... TODO
	 */
	deactivate()
	{
		//console.log("Deactivating region " + this.id)
		if(this.active) this.on_deactivate()
		this.active = false
		for(let x = 0; x < this.subregions.length; x++)
		{
			this.subregions[x].deactivate()
		}
		this.$reg.hide();
	}

	/**
	 * @abstract
	 * Called on deactivate(), but ONLY if this region was actually active.
	 */
	on_deactivate() {}
}

export {Region}
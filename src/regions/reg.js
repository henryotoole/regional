/**
 * The parent class for all regions and overlays.
 */
class Region
{
	/**
	 * Instantiate a 'region'. This is an HTML block of the page that contains UI elements driven by data from a
	 * server and shown according to settings (state data) that is NOT saved on the server.
	 * 
	 * @param  {String} html_id OPTIONAL: the string ID of the main html element that contains this region. If
	 * undefined, fall back on autogen. If there's no autogen behavior defined an error will trip
	 * @param  {RegionApp} app the instance of the central app.
	 */
	constructor(html_id, app)
	{
		if(html_id == undefined)
		{
			// In the undefined case we fall back on the autogen behavior.
			html_id = this.autogen_setup()	
		}
		this.$region = $('#' + html_id) // The primary html region that all parts of this region reside within.
		this.id = html_id
		this.active = 0

		// A region can have sub-regions that are tied to the 'parent' region.
		this.subregions = [];
		this.r = {} // A convinience-mapping for connected subregions. Just makes it easier to grab a reference.
		this.superregion = undefined; // This will be set if this region is linked as a subregion to a parent region.

		// The datahandler references for this region.
		this.datahandlers = [];

		// Setup the connections to the central app. Must occur before settings_refresh()
		if(!(this instanceof RegionApp)) // Ensure this isn't the central app itself!
		{
			this.app = app // Back-reference to app.
			this.app._register_region(this); // Ensure we register this centrally.

			// Bind the click event for this HTML DOM so that it 'focuses' this region
			this.$region.click(function(e)
			{
				this.app._set_focus_region(this, e)
			}.bind(this))
		}
		// A list of allowed component classes. Inheritance works here - adding Component to this list would
		// allow all types of component whereas adding ComponentFile would only add those that extend ComponentFile
		this.paste_allowed_components = []

		// Setup the settings data block
		this.settings = {}
		// Note: all settings will be refreshed whenever the APP loads

		this.reginputs = []

		// See anchor_enable()
		this.anchor = {
			enabled: 0,
			path: this.id,
		}
	}

	/**
	 * Get how long the mouse must hover over a tooltip to show it, in seconds.
	 */
	static get tooltip_hover_time() {return 2}
	/**
	 * Get the attribute name for 'member' tags. See get_member_element()
	 */
	static get member_attr_name() {return 'rfm_member'}

	/**
	 * Link a subregion to this region. A subregion will take its cues from the parent region in regards to graphical_, settings_,
	 * and data_refreshes. In many ways the role of a parent region is simply a central mechanism.
	 * @param {} region
	 */
	subregion_link(region)
	{
		this.subregions.push(region) // Crosslink down
		region.superregion = this; // Crosslink up
		console.log("!sublink " + region.constructor.name + " as " + region.id)
		this.r[region.id] = region // Set convinience reference
	}
	/**
	 * Add an instance of a datahandler to this region which will be tracked and updated upon data_refresh().
	 * @param  {DataHandler} dh_instance
	 */
	datahandler_add(dh_instance)
	{
		this.datahandlers.push(dh_instance)
	}

	/**
	 * Bind a RegInput to this region so that it renders whenever this region is rendered.
	 * @param {RegInput} reginput A RegInput instance.
	 */
	reginput_add(reginput)
	{
		this.reginputs.push(reginput)
	}

	/**
	 * Get the reginput that corresponds to this key, or undefined if there is none
	 * @param {String} setting_key A setting key like 'name'
	 */
	reginput_get(setting_key)
	{
		for(var x = 0; x < this.reginputs.length; x++)
		{
			console.log("does " + this.reginputs[x].settings_key + " eqyal " + setting_key)
			if(this.reginputs[x].settings_key == setting_key)
			{
				return this.reginputs[x]
			}
		}
	}

	/**
	 * Enable anchor paths for this region. When this region is activated, an anchor will be appended
	 * to the url of the webpage. This way, pressing the back arrow will take the user back to the
	 * the preview app view rather than out of the app entirely.
	 * 
	 * @param {String} anchor_path The text to appear to the right of the #anchor
	 * @param {Function} setup_fn OPTIONAL: If provided, this function will be used instead of
	 * 		region.activate() to activate this region upon anchor load.
	 */
	anchor_enable(anchor_path, setup_fn)
	{
		setup_fn = setup_fn || this.activate.bind(this)
		if(!this.anchor_enabled)
		{
			this.anchor.enabled = 1
			this.anchor.path = anchor_path
			this.anchor.setup_fn = setup_fn
			this.app._register_anchor_location(this.anchor.path, this)
		}
	}

	/**
	 * Get a $element for a 'member' of this region. A member is a $dom that belongs to this region which is *unique* within this region.
	 * It may not be unique across other regions. It's like an ID, but specific to just this region.
	 * 
	 * This is now the preferred way to access *any* element within a region. Most region constructors need to establish a bunch of
	 * members upon instantiation (buttons, input fields, etc). Originally I used ID's to do this but members have some key advantages
	 * when it comes to autogenerated regions.
	 * 
	 * @param {str} member_name The name of the member (e.g. value of the rfm_member attribute)
	 * 
	 * @return {$dom} The member element if it exists
	 */
	member_get_element(member_name)
	{
		var statement = '[' + Region.member_attr_name + "=" + member_name + "]"
		var members = this.$region.find(statement)
		if(members.length > 1)
		{
			throw("Found more than one members of name " + member_name + " in region " + this.id)
		}
		if(members[0] == undefined)
		{
			var lines = [
				"Could not find member " + member_name + " for region " + this.id + ".",
				"Check that you set the " + Region.member_attr_name + " attribute rather than the id (e.g.)",
				"<div " + Region.member_attr_name + "=" + member_name + ">."
			]
			throw(lines.join(" "))
		}
		return $(members[0])
	}
	
	/**
	 * Load this anchor path into the url. Only call this if we are configured to have an anchor path.
	 */
	_anchor_activate()
	{
		this.app._anchor_on_region_anchor_activate()
		document.location.hash = this.anchor.path
	}

	/**
	 * Get the ClassDef for this region's context menu.
	 */
	get context_menu()
	{
		return ContextMenu
	}

	/**
	 * Add a tooltip to a JQuery $dom object, which will display on hover of a few seconds.
	 * @param {JQuery object} $dom The DOM to add the tooltip to
	 * @param {String} text The tooltip text
	 */
	tooltip_add($dom, text)
	{
		var tooltip = new OverlayTooltip($dom, text, Region.tooltip_hover_time, this.app.tooltip_get_classes)
	}

	/**
	 * Refresh the 'settings' that control visible display of the data in the GUI. This resets them to their default state.
	 * All subregions will also be reset.
	 */
	settings_refresh()
	{
		for(var x = 0; x < this.subregions.length; x++)
		{
			this.subregions[x].settings_refresh()
		}
	}
	
	/**
	 * Contact the server to pull new data down to update ALL the data for this region and subregions. Within the actual datahandler
	 * data_refresh() functions some caching/optimization should occur that limits how frequently we actually ping the server.
	 */
	data_refresh()
	{
		// Now loop through both the regions and datahandlers to refresh all data from server.
		DataHandler.data_refresh_multiple(this.datahandlers).then(()=>{})
		for(var x = 0; x < this.subregions.length; x++)
		{
			this.subregions[x].data_refresh(sub_callback);
		}
	}
	
	/**
	 * Re-draw the entire UI purely from the in-memory-from-server data and in-memory settings. This will re-render this region
	 * as well as any sub-regions that are 'active'.
	 */
	graphical_render()
	{
		for(var x = 0; x < this.subregions.length; x++)
		{
			if(this.subregions[x].active)
			{
				this.subregions[x].graphical_render()
			}
		}
		for(var x = 0; x < this.reginputs.length; x++)
		{
			this.reginputs[x].render()
		}
	}

	/**
	 * Return True if the current objects on the clipboard can paste here, False if even one of them can not.
	 */
	can_paste()
	{
		return this.app.clipboard.has_copied_of_type(this.paste_allowed_components)
	}

	/**
	 * This function should be overwritten in any child class that allows pasting. Called by app on a paste
	 * maneuver.
	 * @param {Event} e The originating event
	 * @param {Component} component
	 */
	paste_component(e, component) {}

	/**
	 * Print a message to the console if this region is in debug mode.
	 * @param {String} msg Message to print
	 */
	console_debug(msg)
	{
		if(this.debugging)
		{
			console.log("%cREGION " + this.id + ": " + msg, 'background: #F0DEFD')
		}
	}

	/**
	 * Apply the $main returned from autogen_apply_main() to the region it will be linked to.
	 * @param {$dom} $dom OPTOINAL: The html object to which this autogenerated region's HTML should be appended. If ommitted, 
	 * append to the body (this will work for all overlays)
	 * 
	 * @returns The ID of the $main element.
	 */
	autogen_setup($dom)
	{
		var autoid = generate_hash()
		if($dom == undefined)
		{
			$dom = $('body')
		}
		var $main = this.autogen_main() // Will be overridden if something exists to do this
		$main.attr('id', autoid)
		$dom.append($main)
		return autoid
	}

	/**
	 * Used to generate the $main of a region. This will be overwritten for Regions which have autogen behavior. It should not
	 * be supercalled.
	 */
	autogen_main()
	{
		throw("Autogeneration called by region which has no autogeneration behavior.")
	}

	/**
	 * Turn a $dom into a properly formatted member
	 * @param {$dom} $dom The element to make into a member
	 * @param {*} member_name The member's name, unique to this region
	 */
	autogen_member_create($dom, member_name)
	{
		$dom.attr(Region.member_attr_name, member_name)
	}

	/**
	 * Get the default overlay options.
	 * 	+ escape_disabled: By default, escape will deactivate the overlay. If this is set to true it won't.
	 * 	+ vertical_position: A float between 0 and 1 that determines the offset from centered. Default 0.5
	 * 	+ horizontal_pos: A float between 0 and 1 that determines the offset from centered. Default 0.5
	 * 	+ disable_greyout: If true the greyout will not be used for this overlay.
	 */
	get overlay_defaults() {
		return {
			'escape_disabled': false,
			'vertical_position': 0.5,
			'horizontal_position': 0.5,
			'disable_greyout': false,
		}
	}

	/**
	 * The base z-index for overlays
	 */
	static get overlay_base_z_index() {return 100}

	/**
	 * Call this function on module instantiation to enable slightly more advanced behavior
	 * to make this region an 'overlay'.
	 * 
	 * An 'overlay' region is outside the regular flow of html and can be brough up in front of
	 * all other regions. Clicking in the background will be disabled and a greyout will cause everything
	 * behind this overlay to appear disabled.
	 * 
	 * This will modify the css of the $region as well as the functionality of this class to
	 * 
	 * @param {Object} options OPTIONAL: A list of options which configure the overlay's behavior.
	 * 	see overlay_defaults() for more info.
	 */
	overlay_setup(options)
	{
		options = options || {}
		this._overlay_options = Object.assign(this.overlay_defaults, options)
		this._overlay_enabled = 1

		// Alter the $region css
		this.$region.css('z-index', Region.overlay_base_z_index)
		this.$region.addClass('regcss-ovl')

		// Register the overlay with the central app
		this.app._register_overlay(this); // Register the overlay to the central app

		if(!this._overlay_options.disable_escape)
		{
			//Bind the escape-key-exit sequence.
			$(window).keyup(function(evt){
				(this.active) ? (evt.which == 27) ? this.deactivate() : '' : '';
			}.bind(this));
		}
	}

	/**
	 * Set the location of this region based off the configuration
	 * @param {Number} vertical_pos On a scale from 0 to 1 (top to bottom of screen) where to position this
	 * @param {Number} horizontal_pos On a scale from 0 to 1 (left to right of screen) where to position this
	 */
	_overlay_set_location(vertical_pos, horizontal_pos)
	{
		var sh = window.innerHeight,
			sw = window.innerWidth,
			t = (sh - this.$region.outerHeight(true)) * vertical_pos,
			l = (sw - this.$region.outerWidth(true)) * horizontal_pos
		this.$region.css({top: t, left: l}); //Can't use offset cause jquery can't offset hidden stuff.
	}

	/**
	 * Enable key events for this region
	 */
	key_events_enable()
	{
		this.$region.attr('tabindex', '-1') // Make this div 'focusable' so that it can trigger keyevents.
		this.$region.css('outline-width', 0) // Hides the 'selected' outline.
		// bind handlers
		this.$region.keydown((e)=>
		{
			if(!this.active) return; // Don't fire if not active or if disabled.
			this.key_event_down(e)
		})
		this.$region.keyup((e)=>
		{
			if(!this.active) return; // Don't fire if not active or if disabled.
			this.key_event_up(e)
		})
	}

	/**
	 * Called whenever there is a keydown event. Override this in child classes to add behavior. Only called if region is active.
	 * 
	 * Key events like this are inherited up the stack of super-regions. If any parents of this region have key events enabled,
	 * they will also get their key_event_down functions called unless e.stopPropagation() is called.
	 * 
	 * @param {KeyboardEvent} e The keyboard event from the JQuery handler.
	 */
	key_event_down() {}

	/**
	 * Called whenever there is a keyup event. Override this in child classes to add behavior. Only called if region is active.
	 * 
	 * @param {KeyboardEvent} e The keyboard event from the JQuery handler.
	 */
	key_event_up() {}

	/**
	 * Called when this region is activated (e.g. made visible to the user). Settings are refreshed and the overlay
	 * will be re-rendered.
	 */
	activate()
	{
		this.settings_refresh()
		this.active = 1
		for(var x = 0; x < this.subregions.length; x++)
		{
			this.subregions[x].activate()
		}
		this.$region.show();

		// Do not call graphical_render here.

		this.app._set_focus_region(this);

		if(this.anchor.enabled)
		{
			this._anchor_activate()
		}

		// If this region has been configured as an overlay, position it in the correct position.
		if(this._overlay_enabled)
		{
			if(!this._overlay_options.disable_greyout) this.app.set_greyout(1);
			this._overlay_set_location(
				this._overlay_options.vertical_position,
				this._overlay_options.horizontal_position
				)
		}

		this.graphical_render();
	}
	
	/**
	 * Called when this region is deactivated (e.g. made invisible to the user)
	 */
	deactivate()
	{
		//console.log("Deactivating region " + this.id)
		if(this.active) this.cleanup()
		this.active = 0
		for(var x = 0; x < this.subregions.length; x++)
		{
			this.subregions[x].deactivate()
		}
		this.$region.hide();

		// If this region has been configured as an overlay, position it in the correct position.
		if(this._overlay_enabled)
		{
			var none_active = 1
			//Only remove greyout if this is the only open overlay.
			for(var x = 0; x < this.app._registered_overlays.length; x++)
			{
				//Remember, active is a Region property
				if(this.app._registered_overlays[x].active) none_active = 0;
			}
			if(none_active) this.app.set_greyout(0);
		}
	}

	/**
	 * Called on deactivate(), but ONLY if this region was actually active.
	 */
	cleanup() {}
}
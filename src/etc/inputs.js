/**inputs.js
 * Josh Reed 2020
 * 
 * Simple wrappers for common forms of HTML input which help with mundane things like
 * validation and change handling.
 */

import { ColorUtil } from "./module.js"

class RegInput
{
	/**
	 * Set up a new standard RegInput. This will automatically bind itself to the region and render upon region render.
	 * @param {JQuery} $dom The jquery input
	 * @param {Object} region The region instance reference
	 * @param {String} settings_key The key at which to store this data
	 */
	constructor($dom, region, settings_key)
	{
		this.$dom = $dom
		this.region = region
		this.settings_key = settings_key
		this.$dom.change(this._onchange.bind(this))

		this.region.reginput_add(this) // Autobind to region
	}

	_onchange(e)
	{
		var val = this.get_validated_data()
		if(val == undefined) // If it's entirely invalid
		{
			this.$dom.val(this.region.settings[this.settings_key]) // Reset to last whatever
			return
		}
		this.region.settings[this.settings_key] = val
		this.region.graphical_render() // This will set the $dom, presumably
	}

	/**
	 * Set display from settings.
	 */
	render()
	{
		//console.log("setting to: " + this.region.settings[this.settings_key] + " with key " + this.settings_key)
		this.$dom.val(this.region.settings[this.settings_key])
	}

	/**
	 * Get the validated data for this input (whatever it might be).
	 * If data is not valid, return undefined
	 */
	get_validated_data() {}
}

class RISelect extends RegInput
{
	/**
	 * Set up a new standard RegInput
	 * @param {JQuery} $dom The jquery input
	 * @param {Object} region The region instance reference
	 * @param {String} settings_key The key at which to store this data
	 */
	constructor($dom, region, settings_key)
	{
		super($dom, region, settings_key)
	}

	/**
	 * A selection dropdown can't really be wrong.
	 */
	get_validated_data()
	{
		return this.$dom.val()
	}
}

class RIString extends RegInput
{
	/**
	 * Set up a new standard RegInput
	 * @param {JQuery} $dom The jquery input
	 * @param {Object} region The region instance reference
	 * @param {String} settings_key The key at which to store this data
	 * @param {Number} max_len OPTIONAL: The maximum length this string can be. Default undefined for no limit
	 */
	constructor($dom, region, settings_key, max_len)
	{
		super($dom, region, settings_key)
		this.max_len = max_len
	}

	/**
	 * Get the validated data for this input (whatever it might be).
	 * If data is not valid, return undefined
	 */
	get_validated_data()
	{
		var val = this.$dom.val()
		if(val.length == 0) return
		if(this.max_len != undefined)
		{
			val = val.substring(0, this.max_len)
		}
		return val
	}
}

class RINumber extends RegInput
{
	/**
	 * Set up a new standard RegInput
	 * @param {JQuery} $dom The jquery input
	 * @param {Object} region The region instance reference
	 * @param {String} settings_key The key at which to store this data
	 * @param {Number} min OPTIONAL: The min this number can be. Default undefined for no limit
	 * @param {max} max OPTIONAL: The max this number can be. Default undefined for no limit
	 */
	constructor($dom, region, settings_key, min, max)
	{
		super($dom, region, settings_key)
		this.min = min
		this.max = max
	}

	/**
	 * Get the validated data for this input (whatever it might be).
	 * If data is not valid, return undefined
	 */
	get_validated_data()
	{
		var val = parseFloat(this.$dom.val())
		if(isNaN(val)) return //  Not a valid number
		if(this.min)
		{
			val = Math.max(val, this.min)
		}
		if(this.max)
		{
			val = Math.min(val, this.max)
		}
		return val
	}
}

class RIColorPickr extends RegInput
{
	/**
	 * Set up a new standard RegInput
	 * @param {JQuery} $dom The jquery input
	 * @param {Object} region The region instance reference
	 * @param {String} settings_key The key at which to store this data
	 * @param {Pickr} pickr The pickr instance for this color
	 * @param {String} default_color OPTIONAL: The default color to be used when nothing is selected. Defaults to invisible black.
	 */
	constructor($dom, region, settings_key, pickr, default_color)
	{
		super($dom, region, settings_key)
		this.pickr = pickr
		this.default_color = default_color || "rgba(0,0,0,0)"

		this.$dom.off('change') // Remove default change behavior

		this.pickr.on('save', this._onchange.bind(this)) // Add new onchange behavior
	}

	/**
	 * Called on pickr save.
	 * @param {Object} color The Pickr color object 
	 */
	_onchange(color)
	{
		if(this._programatic) return // If we are programatically setting this we don't want an infinite loop.
		// Break from regular code pattern: validation is done HERE
		var hex = String(color ? color.toHEXA() : this.default_color)
		this._last_value = hex
		
		this.region.settings[this.settings_key] = hex
		this.region.graphical_render() // This will set the $dom, presumably

		this.pickr.hide()
	}

	/**
	 * Get the validated data for this input (whatever it might be).
	 * If data is not valid, return undefined
	 */
	get_validated_data()
	{
		return this._last_value
	}

	/**
	 * Set display from settings.
	 */
	render()
	{
		this._programatic = 1 // If we are programatically setting this we don't want an infinite loop.
		if(this.region.settings[this.settings_key] != undefined)
		{
			var hsva = ColorUtil.parseToHSVA(this.region.settings[this.settings_key].toString())
			//pickr.setHSVA(h:Number,s:Number,v:Number,a:Float, silent:Boolean) - Set an color, returns true if the color has been accepted.
			this.pickr.setHSVA(
				hsva.values[0],
				hsva.values[1],
				hsva.values[2],
				hsva.values[3]
			)
		}
		this._programatic = 0 // De-set programatic flag
	}
}

class RIFontselect extends RegInput
{
	/**
	 * Set up a new standard RegInput
	 * @param {JQuery} $dom The jquery input, which should have .fontselect() called on it.
	 * @param {Object} region The region instance reference
	 * @param {String} settings_key The key at which to store this data
	 */
	constructor($dom, region, settings_key)
	{
		super($dom, region, settings_key)
	}

	/**
	 * Get the validated data for this input (whatever it might be).
	 * If data is not valid, return undefined
	 */
	get_validated_data()
	{
		// Fontselects are glorified <select> menus, so the returned value really can't be wrong.
		return this.$dom.val()
	}
}

class RITimeSpan extends RegInput
{
	/**
	 * Given a new requested start and end time, return valid start and end times that get
	 * as close to the desired behavior as possible.
	 * Rules:
	 * 	+ Start cannot be less than zero
	 *  + End cannot be greater than max
	 *  + Start must occur before max_time
	 *  + There must be at least min_width between t_start and t_end
	 * 
	 * @param {JQuery} $dom_start The jquery input for start time
	 * @param {JQuery} $dom_end The jquery input for end time
	 * @param {Object} region The region instance reference
	 * @param {String} settings_key_start The key at which to store start time
	 * @param {String} settings_key_end The key at which to store end time
	 * @param {Number} min_width
	 * @param {Function} max_time_fn A function that returns the max time of this object as a number
	 */
	constructor($dom_start, $dom_end, region, settings_key_start, settings_key_end, min_width, max_time_fn)
	{
		super($dom_start, region, settings_key_start)
		this.$dom_start = $dom_start
		this.$dom_end = $dom_end
		this.settings_key_start = settings_key_start
		this.settings_key_end = settings_key_end
		this.max_time_fn = max_time_fn
		this.min_width = min_width

		$dom_start.off('change') // Reverse the result of super()
		$dom_start.change((e)=>
		{
			this._onchange(e, 'start')
		})
		$dom_end.change((e)=>
		{
			this._onchange(e, 'end')
		})
	}

	_onchange(e, changing)
	{
		var start = parseFloat(this.$dom_start.val()),
			end = parseFloat(this.$dom_end.val()),
			span
		// If either could not be converted, reset to defaults
		if(isNaN(start) || isNaN(end))
		{
			span = {
				't_start': 0,
				't_end': this.max_time_fn()
			}
		}
		else
		{
			span = RITimeSpan.validate_times(
				start, 
				end, 
				this.max_time_fn(),
				changing)
		}
		this.$dom_start.val(span.t_start)
		this.$dom_end.val(span.t_end)
		this.region.settings[this.settings_key_start] = span.t_start
		this.region.settings[this.settings_key_end] = span.t_end
		this.region.graphical_render()
	}

	/**
	 * This span input is a little special - $dom's are always validated by other function...
	 */
	get_validated_data()
	{
		return {
			't_start': this.$dom_start.val(span.t_start),
			't_end': this.$dom_end.val(span.t_end)
		}
	}

	/**
	 * Set display from settings.
	 */
	render()
	{
		this.$dom_start.val(this.region.settings[this.settings_key_start])
		this.$dom_end.val(this.region.settings[this.settings_key_end])
	}

	/**
	 * Given a new requested start and end time, return valid start and end times that get
	 * as close to the desired behavior as possible.
	 * Rules:
	 * 	+ Start cannot be less than zero
	 *  + End cannot be greater than max
	 *  + Start must occur before end
	 *  + There must be at least min_width between t_start and t_end
	 * 
	 * Only one of the two values should change at a time. Select which one is changing with 'changing'
	 * @param {Number} t_start Must be a float
	 * @param {Number} t_end Must be a float
	 * @param {Number} t_max The maximum time (from zero to this)
	 * @param {String} changing Which value is changing 'start' for start, 'end' for end
	 * @param {Number} min_width OPTIONAL: Set the minimum width of returned timespan, default 0.1
	 */
	static validate_times(t_start, t_end, t_max, changing, min_width = 0.1)
	{
		if(changing == 'start')
		{
			if(t_start < 0)
			{
				t_start = -t_start
			}
			t_start = t_start.clamp(0, t_max - min_width)

			if(t_start > t_end - min_width)
			{
				t_end = t_start + min_width
			}
		}
		else
		{
			if(t_end < 0)
			{
				t_end = -t_end
			}
			t_end = t_end.clamp(min_width, t_max)
	
			if(t_end < t_start + min_width)
			{
				t_start = t_end - min_width
			}
		}
		return {
			't_start': t_start,
			't_end': t_end
		}
	}
}

class RIDate extends RegInput
{
	/**
	 * 
	 * @param {JQuery} $dom The jquery input
	 * @param {Object} region The region instance reference
	 * @param {String} settings_key The key at which to store this data
	 */
	constructor($dom, region, settings_key)
	{
		super($dom, region, settings_key)
	}

	get_validated_data()
	{
		var val = this.$dom.val()
		if(val == undefined || val.length == 0)
		{
			return 
		}
		return val
	}
}

class RITime extends RegInput
{
	/**
	 * 
	 * @param {JQuery} $dom The jquery input
	 * @param {Object} region The region instance reference
	 * @param {String} settings_key The key at which to store this data
	 */
	constructor($dom, region, settings_key)
	{
		super($dom, region, settings_key)
	}

	get_validated_data()
	{
		// Note the string produced here will be of form YYYY-MM-DD
		var val = this.$dom.val()
		if(val == undefined || val.length == 0)
		{
			return 
		}
		return val
	}
}

export {RegInput, RISelect, RIString, RINumber, RIColorPickr, RIFontselect, RITimeSpan, RIDate, RITime}
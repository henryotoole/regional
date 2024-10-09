/**
 * @file Test the <select> RegIn
 * @author Josh Reed
 */

import {RegInSelect, Fabricator, RegionSwitchyard, Region} from "regional"

class RSWTest extends RegionSwitchyard
{
	fab_get()
	{
		let html = /* html */`
			<div rfm_member="subreg"></div>
		`
		return new Fabricator(html)
	}

	_create_subregions()
	{
		this.rtest = new RTest().fab().link(this, this.member_get('subreg'))
	}
}

class RTest extends Region
{
	fab_get()
	{
		let html = /* html */`
			<div rfm_member=subreg1></div>
			<div rfm_member=subreg2></div>
		`
		return new Fabricator(html)
	}

	_on_settings_refresh()
	{
		this.settings.regin_key_static = undefined
		this.settings.regin_key_dynamic = undefined
		this.settings.regin_dynamic_opts = {
			'dopt1': "DOption 1",
			'dopt2': "DOption 2",
		}
	}

	_create_subregions()
	{
		let static_opts = {
			'opt1': "Option 1",
			'opt2': "Option 2",
		}
		this.regin_static = new RegInSelect(static_opts).fab().link(
			this, this.member_get('subreg1'), this.settings, "regin_key_static"
		)
		this.regin_dynamic = new RegInSelect().fab().link(
			this, this.member_get('subreg2'), this.settings, "regin_key_dynamic", this.settings, 'regin_dynamic_opts'
		)//.link_options(this.settings, 'regin_dynamic_opts')
	}
}

describe("Region Input for Select", function() {

	let rsw, rtest, regin_static, regin_dynamic
	beforeEach(async ()=>{
		rsw = new RSWTest().fab().link()
		rtest = rsw.rtest
		regin_static = rtest.regin_static
		regin_dynamic = rtest.regin_dynamic
		// document.body.append(rsw.reg) // If you want to look at the option tags.
		return rsw.load()
	})
	
	it("Can manage state in static mode", function() {
		// Graphical change
		expect(regin_static.settings.value).toBe("opt1")
		expect(rtest.settings.regin_key_static).toBe("opt1")
		regin_static.select.value = 'opt2'
		regin_static.select.dispatchEvent(new Event('change'));
		expect(regin_static.settings.value).toBe("opt2")
		expect(rtest.settings.regin_key_static).toBe("opt2")

		// Programmatic change
		rtest.settings.regin_key_static = "opt1"
		rtest.render()
		expect(regin_static.settings.value).toBe("opt1")
		expect(rtest.settings.regin_key_static).toBe("opt1")
	})

	it("Can manage state in dynamic mode", function() {
		// Graphical change
		expect(regin_dynamic.settings.value).toBe("dopt1")
		expect(rtest.settings.regin_key_dynamic).toBe("dopt1")
		regin_dynamic.select.value = 'dopt2'
		regin_dynamic.select.dispatchEvent(new Event('change'));
		expect(regin_dynamic.settings.value).toBe("dopt2")
		expect(rtest.settings.regin_key_dynamic).toBe("dopt2")

		// Programmatic change
		rtest.settings.regin_key_dynamic = "dopt1"
		rtest.render()
		expect(regin_dynamic.settings.value).toBe("dopt1")
		expect(rtest.settings.regin_key_dynamic).toBe("dopt1")

		// Now, what if we add an option
		rtest.settings.regin_dynamic_opts.dopt3 = "DOption 3"
		rtest.settings.regin_key_dynamic = "dopt3"
		rtest.render()
		expect(regin_dynamic.settings.value).toBe("dopt3")
		expect(rtest.settings.regin_key_dynamic).toBe("dopt3")

		// Next, remove it!
		delete rtest.settings.regin_dynamic_opts['dopt3']
		rtest.render()
		expect(regin_dynamic.settings.value).toBe("dopt1")
		expect(rtest.settings.regin_key_dynamic).toBe("dopt1")

		// Ensure that setting a dynamic option to undefined doesn't make infinite loop
		rtest.settings.regin_dynamic_opts['dopt1'] = undefined
		rtest.render()
	})
})
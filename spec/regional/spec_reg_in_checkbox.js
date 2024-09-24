/**
 * @file Test the checkbox reginput and its radio extension.
 * @author Josh Reed
 */

import {RegInCheckbox, Region, RegionSwitchyard, Fabricator} from "regional"

const dataref = {}

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
			<div rfm_member=subreg></div>
		`
		return new Fabricator(html)
	}

	_on_settings_refresh()
	{
		this.settings.regin_key = "Default"
		this.settings.cb1 = false
		this.settings.cb2 = false
		this.settings.cb3 = false
	}

	_create_subregions()
	{
		this.cb1 = new RegInCheckbox().fab().link(this, this.member_get('subreg'), this.settings, "cb1")
		this.cb2 = new RegInCheckbox().fab().link(this, this.member_get('subreg'), this.settings, "cb2")
		this.cb3 = new RegInCheckbox().fab().link(this, this.member_get('subreg'), this.settings, "cb3")
		this.radio = RegInCheckbox.combine_into_radio(
			[this.cb1, this.cb2, this.cb3],
			["CBR1", "CBR2", "CBR3"],
			dataref,
			'key'
		)
	}
}

describe("RegInCheckbox", function() {

	let rsw, rtest, cb1, cb2, cb3
	beforeEach(()=>{
		rsw = new RSWTest().fab().link()
		rtest = rsw.rtest
		cb1 = rtest.cb1
		cb2 = rtest.cb2
		cb3 = rtest.cb3
		return rsw.load()
	})

	it("Can bind checkboxes into a radio set", function() {
		// Initial state, NONE are checked.
		expect(dataref.key).toEqual(undefined)

		cb1._view_alters_value(true)
		expect(dataref.key).toEqual("CBR1")
		expect(cb1.settings.value).toEqual(true)
		expect(cb2.settings.value).toEqual(false)
		expect(cb3.settings.value).toEqual(false)
		expect(rtest.settings.cb1).toEqual(true)
		expect(rtest.settings.cb2).toEqual(false)
		expect(rtest.settings.cb3).toEqual(false)
		cb2._view_alters_value(true)
		expect(dataref.key).toEqual("CBR2")
		expect(cb1.settings.value).toEqual(false)
		expect(cb2.settings.value).toEqual(true)
		expect(cb3.settings.value).toEqual(false)
		expect(rtest.settings.cb1).toEqual(false)
		expect(rtest.settings.cb2).toEqual(true)
		expect(rtest.settings.cb3).toEqual(false)

		dataref.key = "CBR3"
		rtest.render()
		expect(dataref.key).toEqual("CBR3")
		expect(cb1.settings.value).toEqual(false)
		expect(cb2.settings.value).toEqual(false)
		expect(cb3.settings.value).toEqual(true)
		expect(rtest.settings.cb1).toEqual(false)
		expect(rtest.settings.cb2).toEqual(false)
		expect(rtest.settings.cb3).toEqual(true)
	})
})
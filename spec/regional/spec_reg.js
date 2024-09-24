/**
 * @file Test functionality of a Region. These tend to be complex and analyze state.
 * @author Josh Reed
 */

import {DHTabular, Region, RegionSwitchyard, Fabricator} from "regional"

class RSWTest extends RegionSwitchyard
{
	constructor()
	{
		super()
		this._just_rendered = false
	}

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

	_create_datahandlers()
	{
		this.dh = new DHTest()
		this.datahandler_subscribe(this.dh)
	}

	_on_render()
	{
		this._just_rendered = true
	}
}

class RTest extends Region
{
	constructor()
	{
		super()
		this._just_rendered = false
	}

	get_fab()
	{
		let html = /* html */`
			<div rfm_member=subreg></div>
		`
		return new Fabricator(html)
	}

	_on_render()
	{
		this._just_rendered = true
	}
}

class DHTest extends DHTabular
{
	constructor()
	{
		super()
		this._backend = {}
	}
	
	async pull()
	{
		return new Promise((res, rej)=>
		{
			Object.entries(this._backend).forEach((([id, data])=>
			{
				this.data_update_record(id, data)
			}))
			res()
		})
	}

	async push()
	{
		return new Promise((res, rej)=>
		{
			Object.entries(this._data).forEach((([id, data])=>
			{
				Object.assign(this._backend[id], data)
			}))
			res()
		})
	}
}

describe("Region", function() {

	let rsw, rtest, dh

	beforeEach(async ()=>{
		rsw = new RSWTest().fab().link()
		return rsw.load().then(()=>
		{
			rtest = rsw.rtest
			dh = rsw.dh
			dh._backend = {
				1: {"key": "val"}
			}
		})
	})

	it("correctly re-renders depending on model checksum", function() {

		return new Promise((res, rej)=>
		{
			// Creation of new app always renders after load.
			rsw._just_rendered = false
			rtest._just_rendered = false

			// Default case checks
			expect(rsw._render_has_model_changed()).toEqual(false)
			expect(rtest._render_has_model_changed()).toEqual(false)

			// If rtest settings change, it should show
			rtest.settings.key = 1
			expect(rsw._render_has_model_changed()).toEqual(false)
			expect(rtest._render_has_model_changed()).toEqual(true)

			// And of course, also re-render, but only once
			rtest.settings.key = 2
			rsw.render()
			expect(rsw._just_rendered).toEqual(false)
			expect(rtest._just_rendered).toEqual(true)
			rsw._just_rendered = false
			rtest._just_rendered = false
			rsw.render()
			expect(rsw._just_rendered).toEqual(false)
			expect(rtest._just_rendered).toEqual(false)

			// Same checks with the datahandler.
			dh.pull().then(()=>
			{
				rsw._just_rendered = false
				rtest._just_rendered = false
				rsw.render()
				expect(rsw._just_rendered).toEqual(true)
				expect(rtest._just_rendered).toEqual(false)

				res()
			})
		})
	})

	it("can track aux model for checksums", function() {

		return new Promise((res, rej)=>
		{
			// Creation of new app always renders after load.
			rsw._just_rendered = false
			rtest._just_rendered = false
			let data = {'key': 'val'}
			rtest.render_checksum_add_tracked('test_aux', ()=>
			{
				return data.key
			})

			// True at first
			expect(rtest._render_has_model_changed()).toEqual(true)
			rsw.render()

			// Then false
			expect(rtest._render_has_model_changed()).toEqual(false)

			data.key = 'val2'
			expect(rtest._render_has_model_changed()).toEqual(true)

			res()
		})
	})
})
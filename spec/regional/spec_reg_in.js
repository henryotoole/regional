import {RegIn, Region, RegionSwitchyard, Fabricator} from "regional"

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
	}

	_create_subregions()
	{
		this.regin = new RegIn().fab().link(this, this.member_get('subreg'), this.settings, "regin_key")
	}
}

describe("Region Input", function() {

	let rsw, rtest, regin
	beforeEach(async ()=>{
		rsw = new RSWTest().fab().link()
		rtest = rsw.rtest
		regin = rtest.regin
		return rsw.load()
	})
	
	it("Preserves reference correcty", function() {
		expect(regin.settings.value).toBe("Default")
		regin._view_alters_value("Otherwise")
		rsw.render()
		expect(regin.settings.value).toBe("Otherwise")
		regin._view_alters_value("Indeed")
		expect(rtest.settings.regin_key).toBe("Indeed")
	})
	
	it("debounces correctly", function(done){

		// No debouncing
		regin._view_alters_value(1)
		expect(regin.superregion.settings['regin_key']).toBe(1)
		regin._view_alters_value(2)
		expect(regin.superregion.settings['regin_key']).toBe(2)

		// Add debouncing
		regin._view_alters_value(0)
		let base_time = 0.05
		regin.debouncer_set(base_time)
		window.setTimeout(()=>{regin._view_alters_value(1)}, base_time * 1000 * (1/2))
		window.setTimeout(()=>{regin._view_alters_value(2)}, base_time * 1000 * (2/2))
		window.setTimeout(()=>{regin._view_alters_value(3)}, base_time * 1000 * (3/2))
		// Need to wait another 3/2 base_time for debouncer to complete.
		window.setTimeout(()=>
		{
			expect(regin.superregion.settings['regin_key']).toBe(0)
		}, base_time * 1000 * (3.1/2))
		window.setTimeout(()=>
		{
			expect(regin.superregion.settings['regin_key']).toBe(3)
			done()
		}, base_time * 1000 * (6/2))
	})

	it("validates correctly", function() {
		// Set a Number validator
		regin.validation_set((value)=>{return (!isNaN(value))}, "FAILURE_IN_TEST")

		// Basically works
		regin._view_alters_value(1)
		expect(regin.superregion.settings['regin_key']).toBe(1)
		expect(regin.settings.value).toBe(1)

		// Failure case
		regin._view_alters_value("1b")
		expect(regin.superregion.settings['regin_key']).toBe(1)
		expect(regin.settings.val_failure_state).toBe(true)
		expect(regin.settings.value).toBe("1b")

		// Failure case
		regin._view_alters_value(2)
		expect(regin.superregion.settings['regin_key']).toBe(2)
		expect(regin.settings.value).toBe(2)
		expect(regin.settings.val_failure_state).toBe(false)
	})
})
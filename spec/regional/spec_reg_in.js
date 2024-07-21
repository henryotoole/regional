import {RegIn} from "regional"


describe("Region Input", function() {

	/** @type {HTMLElement} */
	let el
	let regin
	let superregion = {settings: {}}
	beforeEach(function() {
		// Set up a dummy RegIn that has a fake superregion.
		el = document.createElement("div")
		el.setAttribute("class", "rhel-base")
		document.body.append(el)
		regin = new RegIn()
		regin.superregion = superregion
		regin._super_settings_key = 'skey'
	})
	
	it("debounces correctly", function(done){

		// No debouncing
		regin._view_alters_value(1)
		expect(regin.superregion.settings['skey']).toBe(1)
		regin._view_alters_value(2)
		expect(regin.superregion.settings['skey']).toBe(2)

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
			expect(regin.superregion.settings['skey']).toBe(0)
		}, base_time * 1000 * (3.1/2))
		window.setTimeout(()=>
		{
			expect(regin.superregion.settings['skey']).toBe(3)
			done()
		}, base_time * 1000 * (6/2))
	})

	it("validates correctly", function() {
		// Set a Number validator
		regin.validation_set((value)=>{return (!isNaN(value))}, "FAILURE_IN_TEST")

		// Basically works
		regin._view_alters_value(1)
		expect(regin.superregion.settings['skey']).toBe(1)
		expect(regin.settings.value).toBe(1)

		// Failure case
		regin._view_alters_value("1b")
		expect(regin.superregion.settings['skey']).toBe(1)
		expect(regin.settings.value).toBe("1b")
		expect(regin.settings.val_failure_state).toBe(true)

		// Failure case
		regin._view_alters_value(2)
		expect(regin.superregion.settings['skey']).toBe(2)
		expect(regin.settings.value).toBe(2)
		expect(regin.settings.val_failure_state).toBe(false)
	})
})
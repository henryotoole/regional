/**
 * @file Test the choices regions
 * @author Josh Reed
 */

import {RegInCheckbox, Region, RegionSwitchyard, Fabricator, RegTwoChoice} from "regional"

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
		this.r_two = new RegTwoChoice().fab().link(this, this.eth_reg_create()).etherealize()
	}
}

describe("Region Choices", function() {

	let rsw, r_two
	beforeEach(()=>{
		rsw = new RSWTest().fab().link()
		r_two = rsw.r_two
		return rsw.load()
	})

	it("Handles state properly during present_choice()", function() {
		let record = 0
		return new Promise((res, rej)=>
		{
			r_two.settings.title = "Default"
			r_two.settings.text = "Default"
			r_two.settings.deny = "Default"
			r_two.settings.confirm = "Default"
			// Must break into a thenable chain for sequence to be correct, even tho it's all sequential.
			let promise = r_two.present_choice("A", "B", "C").then(()=>{record = 1}).catch(()=>{record = 2})
			expect(r_two.settings.title).toEqual("A")
			expect(r_two.settings.text).toEqual("B")
			expect(r_two.settings.deny).toEqual("C")
			expect(r_two.settings.confirm).toEqual("Confirm")

			r_two.choice_confirm()
			
			promise.then(()=>
			{
				expect(record).toBe(1)
				promise = r_two.present_choice("A", "B", "C").then(()=>{record = 1}).catch(()=>{record = 2})
				r_two.choice_deny()
				return promise
			}).then(()=>
			{
				expect(record).toBe(2)
				res()
			})
		})
	})
})
import {Fabricator, FabricatorError} from "regional"

describe("Fabricator", function() {

	let tc_exp_basics = {
		html_str: "<div id='{{exp_id}}'> {{exp_body}} </div>",
		expressions: {exp_id: 'tgt_id', exp_body: 'tgt_body'}
	}
	let tc_exp_throw = {
		html_str: "<div id='{{exp{{_id}}'>}} {{exp_body}} </div>",
		expressions: {}
	}
	let tc_gen_complex = {
		html_str: `
			<div id='main' rfm_member='main'>
				<div id='inner' rfm_member='inner'></div>
			</div>`,
		expressions: {exp_id: 'tgt_id', exp_body: 'tgt_body'}
	}
	let css_rule = /* css */`.dummy_class {display: flex}`

	it("parses expressions", function() {
		let fab = new Fabricator(tc_exp_basics.html_str, tc_exp_basics.expressions)
		expect(fab.html_str).toBe("<div id='tgt_id'> tgt_body </div>")
	})

	it("throws errors when parsing excpressions", function() {
		expect(()=>{
			new Fabricator(tc_exp_throw.html_str, tc_exp_throw.expressions)
		}).toThrow()
	})

	it("parses expressions with missing variables", function() {
		let fab = new Fabricator(tc_exp_basics.html_str, {})
		expect(fab.html_str).toBe("<div id=''>  </div>")
	})

	it("generates a complex case and finds members", function() {
		let fab = new Fabricator(tc_gen_complex.html_str)
		fab.fabricate()
		expect(Object.keys(fab.get_members())).toEqual(['main', 'inner'])
	})

	it("does not generate duplicate CSS rules", function() {
		let fab = new Fabricator(tc_gen_complex.html_str).add_css_rule(css_rule).add_css_rule(css_rule)
		fab.fabricate()
		let stylesheets = document.adoptedStyleSheets
		let matching_sels = 0
		let selector = ".dummy_class"
		for(let i_sheet = 0; i_sheet < stylesheets.length; i_sheet++)
		{
			let stylesheet = stylesheets[i_sheet]
	
			for(let i_rule = 0; i_rule < stylesheet.cssRules.length; i_rule++)
			{
				let rule = stylesheet.cssRules[i_rule]
				if(rule.selectorText == selector) matching_sels++
			}
		}
		expect(matching_sels).toBe(1)
	})
})
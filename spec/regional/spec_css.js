import {css_selector_exists, css_inject, css_format_as_rule} from "regional"

describe("CSS Utilities", function() {

	let css_nested = {
		selector: '.test-add-nested',
		style_data: {'background-color': '#DDDDDD'},
		nested: {
			'.subclass': {'border': '1px solid black'}
		}
	}
	let css_rule = /* css */`
	.test-add-rule {
		display: flex;
		flex-direction: left;
	}`

	let css_rule_multiple = /* css */`
	.test-add-rule1 {
		display: flex;
		flex-direction: left;
	}
	.test-add-rule2 {
		display: none
	}`

	let css_rule_nested = /* css */`
	.test-add-rule-nested {
		color: #FFFFFF;
		& .subclass {
			display: flex;
			flex-direction: left;
		}
	}`

	it("can reformat complex css structures into rules", function() {
		expect(
			css_format_as_rule(css_nested.selector, css_nested.style_data)
		).toBe(
			".test-add-nested {background-color: #DDDDDD;}"
		)
		expect(
			css_format_as_rule(css_nested.selector, css_nested.style_data, css_nested.nested)
		).toBe(
			".test-add-nested {background-color: #DDDDDD;& .subclass {border: 1px solid black;}}"
		)
	})

	it("can add a simple rule", function() {
		css_inject(css_rule)
		expect(css_selector_exists('.test-add-rule')).toBe(true)
	})

	it("can add a nested rule", function() {
		css_inject(css_rule_nested)
		expect(css_selector_exists('.test-add-rule-nested')).toBe(true)
	})

	// Not supported yet.
	//it("can add a multi-selector rule", function() {
	//	css_inject(css_rule_multiple)
	//	console.log(document)
	//	expect(css_selector_exists('.test-add-rule1')).toBe(true)
	//	expect(css_selector_exists('.test-add-rule2')).toBe(true)
	//})


	it("can check for css classes in head style", function() {
		expect(css_selector_exists(".test-class")).toBe(true)
		expect(css_selector_exists(".test-class-non")).toBe(false)
	})

	it("can check for css classes in style sheet", function() {
		expect(css_selector_exists(".style-sheet-class")).toBe(true)
	})

	it("can check for nested css classes", function() {
		expect(css_selector_exists(".test-nested")).toBe(true)
	})

	it("can check for css with rule instead of selector", function() {
		expect(css_selector_exists(".test-class")).toBe(true)
		expect(css_selector_exists(".test-class {background-color: #DDDDDD;}")).toBe(true)
		expect(css_selector_exists(".test-class{background-color: #DDDDDD;}")).toBe(true)
		expect(css_selector_exists(".test-class  {background-color: #DDDDDD;}")).toBe(true)
	})

	it("can inject css and detect it", function() {
		css_inject(css_rule)
		expect(css_selector_exists('.test-add-rule')).toBe(true)
	})

	it("can inject css many times without creating multiple stylesheets", function() {
		css_inject(css_rule)
		css_inject(css_rule)
		css_inject(css_rule)
		expect(document.adoptedStyleSheets.length).toBe(1)
	})
})
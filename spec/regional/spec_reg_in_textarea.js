/**
 * @file Test the textarea reginput, primarily for tab behavior.
 * @author Josh Reed
 */

import {RegInTextArea, Region, RegionSwitchyard, Fabricator} from "regional"

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
		this.regin = new RegInTextArea().fab().link(this, this.member_get('subreg'), this.settings, "regin_key")
	}
}

describe("RegInTextArea", function() {

	let rsw, rtest, regin
	beforeEach(async ()=>{
		rsw = new RSWTest().fab().link()
		rtest = rsw.rtest
		regin = rtest.regin
		return rsw.load()
	})

	it("Can find selected lines", function() {
		
		let text = "First line\nSecond line\nThird line"

		// Single line
		expect(RegInTextArea._text_get_selected_lines(text, 5, 5)).toEqual([0])
		expect(RegInTextArea._text_get_selected_lines(text, 15, 15)).toEqual([11])

		// Multi line
		expect(RegInTextArea._text_get_selected_lines(text, 5, 15)).toEqual([0, 11])
		expect(RegInTextArea._text_get_selected_lines(text, 5, 25)).toEqual([0, 11, 23])

		// Trailing newline
		text = "First line\nSecond line\n"
		expect(RegInTextArea._text_get_selected_lines(text, 5, 15)).toEqual([0, 11])
		expect(RegInTextArea._text_get_selected_lines(text, 5, 22)).toEqual([0, 11, 23])
	})

	it("Can perform tab event correctly on text", function() {
		let text = "First line\nSecond line\nThird line"
		let point_ins = RegInTextArea._text_tab_behavior_alter(text, 5, 5)
		let single_line_range_ins = RegInTextArea._text_tab_behavior_alter(text, 2, 8)
		let multi_line_range_ins = RegInTextArea._text_tab_behavior_alter(text, 5, 15)

		expect(point_ins).toEqual({'text': "First\t line\nSecond line\nThird line", selstart: 6, selend: 6})
		expect(single_line_range_ins).toEqual({'text': "Fi\tne\nSecond line\nThird line", selstart: 3, selend: 3})
		expect(multi_line_range_ins).toEqual(
			{'text': "\tFirst line\n\tSecond line\nThird line", selstart: 5, selend: 17}
		)
		
		// Test with a trailing newline
		text = "First line\nSecond line\n"
		multi_line_range_ins = RegInTextArea._text_tab_behavior_alter(text, 5, 15)
		expect(multi_line_range_ins).toEqual(
			{'text': "\tFirst line\n\tSecond line\n", selstart: 5, selend: 17}
		)
		
		// Test with a trailing new line **that is selected**
		multi_line_range_ins = RegInTextArea._text_tab_behavior_alter(text, 5, 22)
		expect(multi_line_range_ins).toEqual(
			{'text': "\tFirst line\n\tSecond line\n\t", selstart: 5, selend: 25}
		)
	})

	it("Can perform shift-tab event correctly on text", function() {
		let text = "\tLine One\n\t\tLine Two\nTline Three"
		let multi_line = RegInTextArea._text_shift_tab_behavior_alter(text, 5, 30)
		console.log(multi_line)
		expect(multi_line).toEqual(
			{'text': "Line One\n\tLine Two\nTline Three", selstart: 5, selend: 27}
		)
	})

	it("Handles state properly with undo / redo", function() {
		regin.settings.value = undefined
		regin._view_alters_value_prosecute_update("A")
		regin._view_alters_value_prosecute_update("B")
		regin._view_alters_value_prosecute_update("C")

		expect(regin.settings.value).toBe("C")
		regin.undo()
		expect(regin.settings.value).toBe("B")
		regin.undo()
		expect(regin.settings.value).toBe("A")
		regin.undo()
		expect(regin.settings.value).toBe(undefined)
		regin.redo()
		expect(regin.settings.value).toBe("A")
		regin.redo()
		expect(regin.settings.value).toBe("B")
		regin.redo()
		expect(regin.settings.value).toBe("C")
		regin.undo()
		expect(regin.settings.value).toBe("B")
		regin._view_alters_value_prosecute_update("B1")
		regin.redo()
		expect(regin.settings.value).toBe("B1")
		regin.undo()
		expect(regin.settings.value).toBe("B")
	})

	// Tests will not work without spoofing keyboard events.
	//it("Handles selection properly with undo / redo", function() {
	//	regin.render()
	//	regin._view_alters_value_prosecute_update("AA")
	//	regin._view_alters_value_prosecute_update("AABBBB")

	//	expect(regin._undo_states).toEqual([
	//		{sel: {start: 2, end: 2}, value: "AA"},
	//		{sel: {start: 7, end: 7}, value: "Default"}
	//	])

	//	// Simulate clicking to highlight a section
	//	regin.textarea.selectionStart = 0
	//	regin.textarea.selectionEnd = 4
	//	// Now take the action of deleting those
	//	regin._view_alters_value_prosecute_update("B")
	//	expect(regin._undo_states).toEqual([
	//		{sel: {start: 0, end: 4}, value: "AABBBB"},
	//		{sel: {start: 2, end: 2}, value: "AA"},
	//		{sel: {start: 7, end: 7}, value: "Default"}
	//	])
	//})
})
import { RHElement, css_inject } from "regional";


describe("RHTML Elements", function() {

	// Inject some CSS for our classes
	css_inject(/* css */`.rhel-base {border: 1px solid black}`)

	/** @type {HTMLElement} */
	let el
	let rhel
	beforeEach(function() {
		el = document.createElement("div")
		el.setAttribute("class", "rhel-base")
		document.body.append(el)
		rhel = RHElement.wrap(el)
	})

	it("show and hide works correctly when display is not set", function (){
		rhel.hide()
		expect(el.style.display).toBe('none')
		rhel.show()
		expect(el.style.display).toBe('')
	})

	it("show and hide works correctly when display is set to none", function (){
		rhel.style.display = 'none'
		rhel.hide()
		expect(el.style.display).toBe('none')
		rhel.show()
		expect(el.style.display).toBe('none')
	})

	it("show and hide works correctly when display is set to flex", function (){
		rhel.style.display = 'flex'
		rhel.hide()
		expect(el.style.display).toBe('none')
		rhel.show()
		expect(el.style.display).toBe('flex')
	})

	it("can wrap multiple times without altering data", function (){
		rhel._reg_ds.test = 1
		rhel = RHElement.wrap(rhel)
		expect(rhel._reg_ds.test).toBe(1)
	})
})
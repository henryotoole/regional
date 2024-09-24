/**
 * @file Tests for basic utility functions.
 * @author Josh Reed
 */

import { serial_promises, path_ext } from "regional"

describe("serial_promises", function() {

	it("Basically functions", function() {
		return new Promise((res, rej)=>
		{
			let a = 0
			let b = 0
			let c = 0
			let p1 = ()=>{
				return new Promise((res, rej)=> {
					window.setTimeout(()=>
					{
						a = 1
						res(7)
					}, 5)
				})	
			}
			let p2 = ()=>{
				return new Promise((res, rej)=> {
					window.setTimeout(()=>
					{
						expect(a).toBe(1)
						b = 2
						res(8)
					}, 10)
				})
			}
			let p3 = ()=>{
				return new Promise((res, rej)=> {
					window.setTimeout(()=>
					{
						expect(b).toBe(2)
						c = 3
						res(9)
					}, 5)
				})
			}
			
			serial_promises([p1, p2, p3]).then((vals)=>
			{
				expect(c).toBe(3)
				expect(vals).toEqual([7, 8, 9])
				res()
			})
			expect(c).toBe(0)
		})
	})
})

describe("path_ext", function()
{
	it("Finds extensions", function()
	{
		expect(path_ext("filename.ext")).toEqual("ext")
		expect(path_ext("fpath/this/that/filename.ext")).toEqual("ext")
		expect(path_ext("http://whatever.web.com/fpath/this/that/filename.ext")).toEqual("ext")
		expect(path_ext("filename")).toEqual(undefined)
		expect(path_ext("fpath/this/that/filename")).toEqual(undefined)
		expect(path_ext("http://whatever.web.com/fpath/this/that/filename")).toEqual(undefined)
	})
})
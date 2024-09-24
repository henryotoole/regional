/**
 * @file Test the tabular implementation of DataHandler
 * @author Josh Reed
 */

import {DHTabular} from "regional"


describe("DataHandler Tabular", function() {


	it("performs basic WHERE properly", function() {
		let dh = new DHTabular("/api/v2")
		dh.data_update_record(1, {'a': 4, 'b': 3, 'c': 88})
		dh.data_update_record(2, {'a': 4, 'b': 9, 'c': 87})
		dh.data_update_record(3, {'a': 5, 'b': 9, 'c': 86})

		expect(dh.where({'a': 4})).toEqual({
			1: {'a': 4, 'b': 3, 'c': 88},
			2: {'a': 4, 'b': 9, 'c': 87}
		})

		expect(dh.where({'a': 4, 'b': 9})).toEqual({
			2: {'a': 4, 'b': 9, 'c': 87}
		})
	})

})
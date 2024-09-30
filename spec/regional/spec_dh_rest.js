/**
 * @file Test the REST implementation of DataHandler
 * @author Josh Reed
 */

import {DHREST, PUSH_CONFLICT_RESOLUTIONS} from "regional"

// An extremely rudimentary expression of a RESTFUL backend
let backend = {}


describe("DataHandler REST", function() {

	const _fetch = fetch

	beforeAll(function() {
		fetch = (url, options) =>
		{
			// Strip the origin portion of the URL
			return new Promise((res, rej)=>
			{
				backend.last_fetch_opts = JSON.parse(JSON.stringify(options))
				res(backend[url.pathname][options.method](options, url.searchParams))
			})
		}
	})

	afterAll(function() {
		fetch = _fetch
	})

	let api_url_thing = "/api/v2/thing"

	/** @type {DHREST} */
	let dh

	beforeEach(function() {
		dh = new DHREST(api_url_thing)

		// Setup or reset the rudimentary backend
		backend = {
			"next_id": 4,
			"data": {
				"1": {"key": "val1"},
				"2": {"key": "val2"},
				"3": {"key": "val3"}
			},
			"disable_put_return": false,
			"responsify_json": (json_data)=>{
				let body = new Blob([JSON.stringify(json_data, null, 2)], {type: 'application/json'})
				let init = {status: 200, statusText: "Success"}
				let response = new Response(body, init)
				return response
			},
			"/api/v2/thing_get_filter": {
				"GET": (fetch_opts, search_terms)=>{
					
				}
			},
			"/api/v2/thing_get_bulk": {
				"GET": (fetch_opts, search_terms)=>{
					// Complex query for bulk get
					let data_out = {}
					let ids = JSON.parse(atob(search_terms.get("ids")))
					ids.forEach((id)=>{data_out[Number(id)] = backend.data[Number(id)]})
					return backend.responsify_json(data_out)
				}
			},
			"/api/v2/thing": {
				"GET": (fetch_opts, search_terms)=>{
					// Simple query for only ID's
					let ids_num = []
					Object.keys(backend.data).forEach((id_str)=>{ids_num.push(Number(id_str))})
					return backend.responsify_json(ids_num)
				},
				"POST": (fetch_opts, search_terms)=>{
					let data = JSON.parse(fetch_opts.body)
					backend.data[backend.next_id] = data
					data['id'] = backend.next_id
					return backend.responsify_json(data)
				},
			},
			"add_id": (id)=>{
				backend["/api/v2/thing/" + id] = {
					"GET": (fetch_opts, search_terms)=>{
						return backend.responsify_json(backend.data[id])
					},
					"POST": (fetch_opts, search_terms)=>{
						throw("ILLEGAL")
					},
					"PUT": (fetch_opts, search_terms)=>{
						let data = JSON.parse(fetch_opts.body)
						Object.entries(data).forEach(([k, v])=>{
							backend.data[id][k] = v
						})
						if(backend.disable_put_return) {return backend.responsify_json({})}
						return backend.responsify_json(backend.data[id])
					},
					"DELETE": (fetch_opts, search_terms)=>{
						delete backend.data[id]
						delete backend["/api/v2/thing/" + id]
						return backend.responsify_json({})
					},
				}
			},
			"last_fetch_opts": undefined
		}
		backend.add_id(1)
		backend.add_id(2)
		backend.add_id(3)
	})

	it("constructs URL properly", function() {
		dh = new DHREST("/api/v2")
		expect(dh.api_url.toString()).toEqual(window.location.origin + "/api/v2")
		dh = new DHREST("/api/v2/")
		expect(dh.api_url.toString()).toEqual(window.location.origin + "/api/v2")
		dh = new DHREST(window.location.origin + "/api/v2/")
		expect(dh.api_url.toString()).toEqual(window.location.origin + "/api/v2")
	})

	it("can perform basic GET", function() {
		return dh._get(1).then((data)=>
		{
			expect(data).toEqual({"key": "val1"})
		})
	})

	it("can perform basic PUT", function() {
		return dh._put(1, {'new': 'val', 'key': 'valnew'}).then((data)=>
		{
			expect(data).toEqual({'new': 'val', 'key': 'valnew'})
			
		}).then(()=>
		{
			dh._put(1, {'new': 'VERY_DIFFERENT'}).then((data)=>
			{
				expect(data).toEqual({'new': 'VERY_DIFFERENT', 'key': 'valnew'})
			})
		})
	})

	it("can perform basic POST / _create", function() {
		return dh._create({'a': 'new_creation'}).then((data)=>
		{
			expect(data).toEqual({'a': 'new_creation', 'id': 4})
		})
	})

	it("can perform full create", function() {
		return dh.create({'a': 'new_creation'}).then((new_id)=>
		{
			expect(new_id).toEqual(4)
			expect(dh._data[4]).toEqual({'a': 'new_creation', 'id': 4})
		})
	})

	it("can perform basic LIST", function() {
		return dh.list().then((ids)=>
		{
			expect(ids).toEqual([1, 2, 3])
		})
	})

	it("can perform basic DELETE", function() {
		return dh._delete(3).then(()=>
		{
			return dh.list().then((ids)=>
			{
				expect(ids).toEqual([1, 2])
			})
		})
	})

	it("can perform bulk GET", function() {
		return dh._get_bulk([1, 2, 3]).then((data)=>
		{
			expect(data).toEqual({
				1: {"key": "val1"},
				2: {"key": "val2"},
				3: {"key": "val3"}
			})
		})
	})

	it("can perform track_all()", function() {
		return dh.track_all().then(()=>
		{
			expect(dh._tracked_ids).toEqual([1, 2, 3])
		})
	})

	it("can perform untrack_all()", function() {
		return dh.track_all().then(()=>
		{
			return dh.pull()
		}).then(()=>{
			expect(dh._data).toEqual({1: {key: "val1"}, 2: {key: "val2"}, 3: {key: "val3"}})

			dh.untrack_all()
			expect(dh._data).toEqual({})
		})
	})

	// Mothballed for now; I need to further consider the ramifications of mass-put when it comes to
	// errors, etc.
	//it("can perform bulk PUT", function() {
	//	return dh._put_bulk([1, 2, 3]).then((data)=>
	//	{
	//		expect(data).toEqual({
	//			1: {"key": "val1"},
	//			2: {"key": "val2"},
	//			3: {"key": "val3"}
	//		})
	//	})
	//})

	it("can perform get_many() in mass-request mode", function() {
		dh._bulk_get_enabled = true
		return dh._get_many([1, 2, 3]).then(()=>
		{
			expect(dh._data).toEqual({
				1: {"key": "val1"},
				2: {"key": "val2"},
				3: {"key": "val3"}
			})
		})
	})

	it("can perform get_many() in bulk mode", function() {
		dh._bulk_get_enabled = false
		return dh._get_many([1, 2, 3]).then(()=>
		{
			expect(dh._data).toEqual({
				1: {"key": "val1"},
				2: {"key": "val2"},
				3: {"key": "val3"}
			})
		})
	})

	it("can perform put_many() in mass-request mode", function() {
		dh._bulk_get_enabled = false
		let put_data = {
			1: {'k1': 'v1'},
			3: {'k3': 'v3'},
		}
		return dh._put_many(put_data).then(()=>
		{
			expect(dh._data).toEqual({
				1: {"key": "val1", 'k1': 'v1'},
				3: {"key": "val3", 'k3': 'v3'}
			})
		})
	})

	it("can pull() across a variety of state", function() {
		console.log(DHREST)
		return dh.pull().then(()=>
		{
			// Pulling with none tracked changes nothing
			expect(dh._data).toEqual({})
		}).then(()=>
		{
			// Tracking works
			dh.track_ids([2, 3])
			return dh.pull().then(()=>{
				expect(dh._data).toEqual({
					2: {"key": "val2"},
					3: {"key": "val3"}
				})
			})
		}).then(()=>
		{
			// Id's that have already been pulled are ignored. A sort of hack is employed here
			backend.data[2]['_pull_check'] = "PRESENT"
			dh.track_ids([1])
			return dh.pull().then(()=>{
				expect(dh._data).toEqual({
					1: {"key": "val1"},
					2: {"key": "val2"}, // 2 Was not pulled
					3: {"key": "val3"}
				})
				backend.data[2]['_pull_check'] = undefined
			})
		}).then(()=>
		{
			// Check that untrack will untrack
			dh.untrack_ids([2])
			return dh.pull().then(()=>{
				expect(dh._data).toEqual({
					1: {"key": "val1"},
					3: {"key": "val3"}
				})
			})
		})
	})

	it("can pull() marked ID's correctly", function() {
		dh.track_ids([2, 3])
		return dh.pull().then(()=>{
			expect(dh._data).toEqual({
				2: {"key": "val2"},
				3: {"key": "val3"}
			})
		}).then(()=>
		{
			backend.data[2]['_pull_check'] = "PRESENT"
			dh.mark_for_refresh(2)
			return dh.pull().then(()=>{
				expect(dh._data).toEqual({
					2: {"key": "val2", '_pull_check': "PRESENT"}, // 2 was actually pulled
					3: {"key": "val3"}
				})
			})
		})
	})

	it("performs xor()", function() {
		// Basic case, they match
		dh._data = {
			1: {'k': 'v'}
		}
		dh._data_from_server = {
			1: {'k': 'v'}
		}
		expect(dh._local_data_xor()).toEqual({})

		// Unknown key added in the client and ignored
		dh._data[1]['offroad'] = true
		expect(dh._local_data_xor()).toEqual({})

		// Make server data out of date
		dh._data_from_server[1]['k'] = 'c'
		expect(dh._local_data_xor()).toEqual({1: {'k': 'v'}})

		// Multi-id case
		dh._data = {
			1: {'k': 'v', 'k2': 'v2'},
			2: {'k': 'v', 'k2': 'v2'},
			3: {'k': 'v', 'k2': 'v2'},
		}
		dh._data_from_server = {
			1: {'k': 'v', 'k2': 'v2'},
			2: {'k': '0', 'k2': '0'},
			3: {'k': '0', 'k2': 'v2'},
		}
		expect(dh._local_data_xor()).toEqual({2: {'k': 'v', 'k2': 'v2'}, 3: {'k': 'v'}})
	})

	it("can push() when the server is behaving", function() {
		return dh.track_all().then(()=>{
			return dh.pull()
		}).then(()=>
		{
			// A little prompt for update
			dh._data[1]['key'] = 'val_new'
			// A check to ensure that ONLY the changed one is submitted
			backend.data[2]['key'] = 'value_unchanged'
			return dh.push()
		}).then(()=>
		{
			expect(backend.data[2]['key']).toEqual('value_unchanged')
			expect(backend.data[1]['key']).toEqual('val_new')
			expect(dh._data[1]['key']).toEqual('val_new')
			expect(dh._data_from_server[1]['key']).toEqual('val_new')
		})
	})

	it("can push() and handle conflict with exception mode", function() {
		// Trigger conflicts.
		backend.disable_put_return = true

		return dh.track_all().then(()=>{
			return dh.pull()
		}).then(()=>
		{
			dh._data[1]['key'] = 'val_new'
			return expectAsync(dh.push()).toBeRejected()
		})
	})

	it("can push() and handle conflict with keep changes", function() {
		// Trigger conflicts.
		backend.disable_put_return = true
		dh.push_conflict_res = PUSH_CONFLICT_RESOLUTIONS.KEEP_CHANGES

		return dh.track_all().then(()=>{
			return dh.pull()
		}).then(()=>
		{
			dh._data[1]['key'] = 'val_new'
			return dh.push()
		}).then(()=>
		{
			expect(dh._data[1]['key']).toEqual('val_new')
			expect(dh._data_from_server[1]['key']).toEqual('val_new')
		})
	})

	it("can push() and handle conflict with keep changes", function() {
		// Trigger conflicts.
		backend.disable_put_return = true
		dh.push_conflict_res = PUSH_CONFLICT_RESOLUTIONS.DISCARD_CHANGES

		return dh.track_all().then(()=>{
			return dh.pull()
		}).then(()=>
		{
			dh._data[1]['key'] = 'val_new'
			return dh.push()
		}).then(()=>
		{
			expect(dh._data[1]['key']).toEqual('val1')
			expect(dh._data_from_server[1]['key']).toEqual('val1')
		})
	})

	it("correctly handle cache bust setting", function() {
		expect(backend.last_fetch_opts).toEqual(undefined)
		return dh._get(1).then((data)=>
		{
			expect(backend.last_fetch_opts.cache).toEqual("no-store")
			dh._cache_bust_enabled = false
			return dh._get(1)
		}).then((data)=>
		{
			expect(backend.last_fetch_opts.cache).toEqual(undefined)
		})
	})
})
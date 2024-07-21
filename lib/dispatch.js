// dispatch_client.js
// Josh Reed 2021
//
// This is a script which can communicate with a dispatch server like any other client. It is intended to be run
// in the browser.

class DispatchClientJS
{
	/**
	 * Initialize a dispatch client which can communicate with a central dispatch server. This client will be assigned
	 * a unique session id and all requests to the server will have this ID associated with it.
	 * This client adheres to the JSONRPC 2.0 standard for communication.
	 * 
	 * @param {String} server_domain The absolute URL that points to the domain of this dispatch server (e.g. https://www.theroot.tech)
	 * @param {String} dispatch_route The route to the dispatch request handler. Default "/_dispatch"
	 * @param {String} client_name Client namespace to operate under. Default is 'js'
	 * @param {Boolean} verbose Whether or not to print log messages. Default is True
	 */
	constructor(server_domain, dispatch_route='/_dispatch', client_name='js', verbose=1)
	{

		// Main variables
		this.dispatch_url = server_domain + dispatch_route
		this.base_url = server_domain
		this.verbose = verbose;
		this.client_name = client_name
		this.session_id = this.gen_session_id();

		// The foreign type indicates to the backend from what client comes a poll request (js, python, etc) 
		this.foreign_type = "js"
		
		// This is a key/value pair set that will be sent along with every request.
		this.base_data = {} 

		// Frontend functions bound with client_bind_function() will be stored here by key: function_name
		this.client_functions = {}
		
		// If we choose to setup the backend functions, they will be deposited here.
		this.server_functions = []

		// These cookies will be sent with every request.
		this._cookies = {}

		// The CSRF token to use
		this.csrf_token = undefined

		// Polling variables
		this.polling_fast = 1		// Polling interval for fast polling
		this.polling_slow = 5		// Polling interval for slow polling
		this.request_timeout = 10	// How long it takes for a request to time out

		this.log_debug("Initialized to point at " + this.dispatch_url + " with session ID: " + this.session_id)
	}

	/**
	 * Call this on a dispatch client instance only once to set up the mapping
	 * of available functions on the backend.
	 * 
	 * It is not neccessary to use this function. It's perfectly appropriate to never call this and to use
	 * call_server_function() instead.
	 * 
	 * @returns {Promise} A promise which will resolve when the backend functions have been queried.
	 */
	setup_backend_functions()
	{
		return new Promise((res, rej)=>
		{
			this.call_server_function('__dispatch__get_functions').then((result)=>
			{
				this.server_functions = result
				this.log_debug("Found " + this.server_functions.length + " server functions.")
				this.server_functions.forEach((fname)=>
				{
					this[fname] = function(c_ref_fname)
					{
						return function(...rest_args)	
						{
							return this.call_server_function(c_ref_fname, ...rest_args)
						}
					}(fname)
					this.log_debug(fname)
				})
				res()
			}).catch((error)=>
			{
				throw("DISPATCH ERROR: C" + error.code + ": '" + error.message + "'")
			})
		})
	}

	/**
	 * Provide a csrf token to append to all requests which originate from this dispatch client.
	 * 
	 * @param {String} csrf_token The csrf token to append to all requests
	 */
	setup_csrf(csrf_token)
	{
		this.log_debug("Added csrf token '" + csrf_token + "' to dispatch.")
		this.csrf_token = csrf_token
	}

	/**
	 * Call a function on the running dispatch backend associated with this client. This function call will be provided
	 * with all given arguments.
	 * 
	 * @param {string} function_name The name of the backend function to call
	 * @param  {...*} args Any number of arguments to provide to the backend function. Keyword arguments are not supported.
	 * 
	 * @returns {Promise} A promise that will resolve with the JSONRPC 'result' object or reject with the error
	 */
	call_server_function(function_name, ...args)
	{
		// Pack all agruments into a JSON string
		var params = encodeURIComponent(JSON.stringify(args)),
			permanent_data = encodeURIComponent(JSON.stringify(this.base_data))

		// Base-format data block
		var data = {
			'jsonrpc': "2.0",
			'method': function_name,
			'params': params,
			'id': this.session_id,
			'__dispatch__permanent_data': permanent_data
		}

		var debug_datastring = JSON.stringify(data),
			mlen = Math.min(debug_datastring.length, 256) // The length of the datastring or 256, whichever is smaller.
		
		// Don't send polling updates, it gets tedious
		if(function_name != "__dispatch__client_poll")
		{
			this.log_debug("Calling " + function_name + " with " + debug_datastring.substring(0, mlen))
		}

		return new Promise((res, rej)=>
		{
			this.get_json(this.dispatch_url, data).then((response_data)=>
			{
				var result = response_data.result
				var error = response_data.error
				if(result != undefined)
				{
					res(result)
				}
				else if(error != undefined)
				{
					console.error(error)
					rej(error)
				}
				else
				{
					console.error(response_data)
					throw("Neither result nor error defined in dispatch response.")
				}
			}).catch((code, message)=>
			{
				// Client error
				if(code >= 300 && code < 500)
				{
					console.error("Server returns code '" + code + "' when attempting dispatch request. Check that client is configured properly.")
				}
				// Server error
				else if(code >= 500 && code < 600)
				{
					console.error("Server returns code '" + code + "' when attempting dispatch request. Check that server is configured properly.")
				}
				else
				{
					throw("Unhandled http response code '" + code + "'")
				}
				rej(code, message)
			})
		})
	}

	/**
	 * A pure javascript method to send a POST request to a url with some data.
	 * 
	 * @param {String} url The url to send the post request to
	 * @param {Object} data A set of key/value pairs with post parameters and data. All post parameter values
	 * 	should be in forms that can be directly converted to a string (so not Object or Array)
	 * 
	 * @returns {Promise} A promise that will resolve upon receiving a 200 with the result data
	 * 	or reject (upon non-200) with arguments (code, message)
	 */
	get_json(url, data)
	{
		return new Promise((res, rej)=>
		{
			var xhr = new XMLHttpRequest();
			
			var param_string = ""
			for (const [key, val] of Object.entries(data))
			{
				param_string += encodeURIComponent(key) + "=" + encodeURIComponent(val) + "&"
			}

			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
			if(this.csrf_token != undefined)
			{
				xhr.setRequestHeader("X-CSRFToken", this.csrf_token)
			}
			xhr.onreadystatechange = ()=>{
				// If this state has changed to 'done'.
				if(xhr.readyState == 4)
				{
					if(xhr.status === 200)
					{
						// If it's a 200, then the response is def a JSONIFIED string
						res(JSON.parse(xhr.responseText))
					}
					else
					{
						rej(xhr.status, xhr.responseText)
				}
				}
			};
			xhr.send(param_string);
		})
	}

	/**
	 * Set the polling interval.
	 * 
	 * @param {Number} interval Number of seconds between polls. 
	 */
	polling_set_frequency(interval)
	{
		this._polling_enable(interval)
	}

	/**
	 * Set dispatch polling to the faster rate.
	 */
	polling_set_fast()
	{
		this.polling_set_frequency(this.polling_fast)
	}

	/**
	 * Set dispatch polling to the slower rate.
	 */
	polling_set_slow()
	{
		this.polling_set_frequency(this.polling_slow)
	}

	/**
	 * Enable polling to communicate with server and check for server-initiated function calls. This function
	 * may be called any number of times to change the polling interval dynamically.
	 * @param {Number} poll_interval The amount of seconds between polls
	 */
	_polling_enable(poll_interval)
	{
		// Clear the old interval, if it exists
		this._polling_disable();
		// Setup a new polling interval.
		this.polling_fn_id = window.setInterval(this._polling_function.bind(this), poll_interval*1000)
	}

	/**
	 * Disables polling and does cleanup. Safe to call even if polling is not happening.
	 */
	_polling_disable()
	{
		// Clear the old interval, if it exists
		if(this.polling_fn_id != undefined)
		{
			window.clearInterval(this.polling_fn_id)
			this.polling_fn_id = undefined
		}
	}

	/**
	 * This is the function that is called every time the poll interval has passed. It is responsible for
	 * communicating with the server to determine if any server-initiated function calls have occurred.
	 */
	_polling_function()
	{
		this.call_server_function('__dispatch__client_poll', this.session_id, this.client_name).then((result)=>
		{
			var function_blocks = result.queued_functions

			// Function blocks is a list of form: 'queued_functions': [{
			//	'fname': fname,
			//	'args': args,
			//	}, {...}, ...],
	
			function_blocks.forEach((function_block)=>
			{
				this.client_call_bound_function(function_block.fname, function_block.args)
			})
		}).catch((e)=>
		{
			console.warn("Standard poll has failed")
			console.warn(e)
		})
	}

	/**
	 * Call a function which has been bound using client_bind_function(). This is generally called by
	 * polling when the server instigates a function call.
	 *
	 * @param {String} function_name The name of the function to call
	 * @param {Array} args A list of arguments to be provided to the function when we call it 
	 */
	client_call_bound_function(function_name, args)
	{
		var fn = this.client_functions[function_name]

		if(fn == undefined)
		{
			this.log("Warning: Server attempts to call unbound frontend function '" + function_name + "'")
			return
		}

		var print_args = JSON.stringify(args)
		if(print_args.length > 256) print_args = print_args.substring(0, 256) + "..."

		this.log_debug("Calling frontend function: " + function_name + print_args)

		fn.apply(null, args) // Call the function with the args.

		// TODO In the future I'd like to add some sort of callback mechanism, but that will require some
		// extra hoops on the server.
	}

	/**
	 * Bind a function to this client so the server can call it. For now, the return value of this
	 * function is entirely ignored.
	 * @param {Function} frontend_fn The function to be called, with some sort of 'self' context bound
	 * @param {String} function_name Can be provided to set a specific name for a function.
	 * 		This must be provided for anon functions. Default is to use the given name of the provided function.
	 */
	client_bind_function(frontend_fn, function_name)
	{
		var name = function_name || frontend_fn.name

		// If the function was anonymous and did not have a name, use the optional one provided by user
		if(name == 'anonymous' || name == '')
		{
			if(function_name == undefined)
			{
				throw("GPQERROR: Function name not provided when binding function " + frontend_fn)
			}
			name = function_name
		}
		// If the function name is 'bound somename', then it has been called with somename.bind(this)
		if(name.substring(0, 6) == 'bound ')
		{
			name = name.substring(6)
		}
		
		this.log_debug("Binding dispatch callable function '" + function_name + "'")

		this.client_functions[name] = frontend_fn
	}
	

	/**
	 * Modify a post request data block to have any base_data and perhaps to prevent caching.
	 * 
	 * @param {Object} request_data The key-value dict that is sent to the server in the POST request
	 * @param {Boolean} prevent_caching OPTIONAL: If true, add a special param to prevent caching. Default True.
	 */
	prep_data(request_data, prevent_caching)
	{
		prevent_caching = prevent_caching || 1 // Defaults to True

		if(prevent_caching)
		{
			request_data.__dispatch__cache_bust = new Date().getTime()
		}
		
		// Assign base data
		request_data = Object.assign({}, request_data, this.base_data)

		return request_data
	}

	/**
	 * Get a very-likely-to-be-unique hash ID for this 'session'. This hash is used on the backend to determine
	 * which browser window from which a request originates. While this ID is not guaranteed to be unique,
	 * it is extremely unlikely it will overlap with another. Even if it does, the problem will be temporary
	 * and will be solved next time the page is refreshed.
	 */
	gen_session_id()
	{
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for ( var i = 0; i < 25; i++ ) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	/**
	 * Log a message, but only in verbose mode.
	 * @param {String} message A message to be printed
	 */
	log_debug(message)
	{
		if(this.verbose)
		{
			console.log(message)
		}
	}

	/**
	 * Log a message whether verbose or not.
	 * @param {String} message A message to be printed
	 */
	log(message)
	{
		console.log(message)
	}
}

export {DispatchClientJS}
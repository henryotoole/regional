// src/regional.js
// Josh Reed 2024
//
// This is the core module file for regional.



export {
	bindify_console,
	bindify_number,
	sentry_setup,
	generate_hash,
	download_file,
	validate_email,
	str_locations,
	ColorUtil
} from "./etc/util.js"

export {
	css_selector_exists,
	css_inject,
	css_format_as_rule,
} from "./etc/css.js"
export {Clipboard} from "./etc/clipboard.js"
export {RHElement} from "./etc/rhtml_el.js"
export {Fabricator} from "./etc/fab.js"

export {RegionalStructureError, TODOError, FabricatorError} from "./etc/errors.js"

export {DataHandler} from "./datahandlers/dh.js"

export {Region} from "./regions/reg.js"
export {RegIn} from "./regions/reg_in.js"
export {RegInInput} from "./regions/reg_in_input.js"

export {RegionSwitchyard} from "./regions/reg_sw.js"

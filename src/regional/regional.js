// src/regional.js
// Josh Reed 2024
//
// This is the core module file for regional.

// Lib exports
export {b64_md5, blob_md5} from "./lib/md5.js"

// Module exports
export {
	bindify_console,
	bindify_number,
	sentry_setup,
	generate_hash,
	checksum_json,
	download_file,
	validate_email,
	str_locations,
	serial_promises,
	path_ext,
	throttle_leading,
	linterp,
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


export {Component} from "./components/comp.js"

export {DataHandler} from "./datahandlers/dh.js"
export {DHTabular} from "./datahandlers/dh_tabular.js"
export {DHREST, PUSH_CONFLICT_RESOLUTIONS, ErrorREST} from "./datahandlers/dh_rest.js"

export {Region} from "./regions/reg.js"
export {RegOneChoice} from "./regions/reg_one_choice.js"
export {RegTwoChoice} from "./regions/reg_two_choice.js"
export {RegIn} from "./regions/reg_in.js"
export {RegInInput} from "./regions/reg_in_input.js"
export {RegInCheckbox} from "./regions/reg_in_checkbox.js"
export {RegInTextArea} from "./regions/reg_in_textarea.js"
export {RegInSelect} from "./regions/reg_in_select.js"

export {RegionSwitchyard} from "./regions/reg_sw.js"

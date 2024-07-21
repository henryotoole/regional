// src/etc/errors.js
// Josh Reed 2024
//
// Custom error classes for regional.

/**
 * The regional structure error is a sort of general purpose error that indicates something has gone
 * wrong in the core regional machinery.
 */
class RegionalStructureError extends Error
{
	constructor(message, options)
	{
		// Need to pass `options` as the second parameter to install the "cause" property.
		super(message, options);
	}
}

/**
 * An error to trip when the Fabricator has some sort of problem.
 */
class FabricatorError extends Error
{
	/**
	 * Create a new fabricator error.
	 * @param {string} message Message to print
	 * @param {Fabricator} fab The fabricator that tripped this issue.
	 */
	constructor(message, fab)
	{
		// Need to pass `options` as the second parameter to install the "cause" property.
		super(message, {});
		this.fab = fab
	}
}

/**
 * Call this when behavior is called that is not yet implemented.
 */
class TODOError extends Error
{
	constructor(message, options)
	{
		// Need to pass `options` as the second parameter to install the "cause" property.
		super(message, options);
	}
}

export { RegionalStructureError, TODOError, FabricatorError }


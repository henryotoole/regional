# Development Flow #

# Foreword #
Everything that follows is opinionated and optional. These are, above all, notes to myself on how to set up future projects. Projects that use regional can use it in any way and do not need to setup development flow as described here.

# General #
The general development flow I have settled on flows directly from source to bin via ESBuild's bundling utility. "Output" bundled code winds up living in /bin where it can be drawn from for use in other projects.

However, during development I prefer to keep things as simple as possible. While it is possible to setup a watch state with ESBuild so that bundling/building is done automatically when code changes are detected, I find such development processes to obscure the true nature of the software. When they are not strictly neccessary, I avoid them.

I use importmaps to select whether module references point to source or to the bundled file. This import map can be controlled manually or (as I plan for javascript work that actually has a backend) controlled by the presence of a cookie. It could also be done with templating (e.g. Jinja) for projects with non-statically served pages.

# Intellisense #
ES6 libraries (like demo.js in this repository) must refer to *other* ES6 libraries via the import command. I have found two ways of doing this that work:
1. Relative imports within the 'src' folder (e.g. "../lib/dispatch.js")
2. Imports against namespaces from the importmap (e.g. "regional")

The first method seems far preferable to the second. Intellisense will simply *work* because it can follow relative paths, and there's no chance of ESBuild getting confused when bundling.

The latter method does, however, work as well if a jsconfig.json file is included in the root of the module directory. Both ESBuild and VSCode's Intellisense can leverage that file to resolve importmap paths.

I keep a record here of both usages because I suspect future development will reveal that Method 1 has some hidden drawback.

# Future Plans #
I've still managed to avoid using NodeJS or NPM so far. However, the use of npm as another pip is deeply appealing. Currently bringing regional into another project as a library involves copying and pasting the file itself. I suspect that npm can be used unobtrusively like pip for mere dependency management without ruining the rest of the workflow. One day I'll investigate.
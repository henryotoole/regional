version := "0.1.3"


# bundle source into output files in bin
bundle:
	esbuild ./src/regional/regional.js \
		--bundle \
		--outfile=./bin/regional_{{version}}.js \
		--format=esm \
		--keep-names

	esbuild ./src/demo/demo.js \
		--bundle \
		--outfile=./bin/demo_{{version}}.js \
		--format=esm \
		--keep-names

# deploy the 'demo' site, which just copies over the latest regional versions into the 'site' js folder
# and associated assets
deploy:
	cp ./bin/regional_{{version}}.js ./site/js
	cp ./bin/demo_{{version}}.js ./site/js
	cp ./src/demo/assets/* ./site/assets
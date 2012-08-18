REPORTER = spec
OPTS = --timeout 5000

test: 
	./node_modules/.bin/mocha $(OPTS) --reporter $(REPORTER)

.PHONY: test

watch: 
	./node_modules/.bin/mocha $(OPTS) --reporter min --watch --bail
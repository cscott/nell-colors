all: build-all

build/index.js: index.js # and other stuff
	mkdir -p build
	node r.js -o name=index out=$@ baseUrl=.
build/ncolors.js: ncolors.js # and other stuff
	mkdir -p build
	node r.js -o name=ncolors out=$@ baseUrl=.

build-all: build/index.js build/ncolors.js
	mkdir -p build/icons
	cp index.html ncolors.html build/
	cp require.min.js build/require.js
	cp icons/*.png icons/*.ico build/icons/

clean:
	$(RM) -rf build

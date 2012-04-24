all: build-all

#OPT=optimize=none
OPT=

build/index.js: index.js # and other stuff
	mkdir -p build
	node r.js -o name=index out=$@ baseUrl=. $(OPT)
build/ncolors.js: ncolors.js # and other stuff
	mkdir -p build
	node r.js -o name=ncolors out=$@ baseUrl=. $(OPT)
build/src/recogworker.js: src/recogworker.js # and other stuff
	mkdir -p build
	node r.js -o name=recogworker out=$@ baseUrl=src paths.json=../json paths.text=../text $(OPT)

build-all: build/index.js build/ncolors.js build/src/recogworker.js
	mkdir -p build/icons
	cp index.html ncolors.html build/
	cp require.min.js build/require.js
	cp src/worker.js build/src/
	cp icons/*.png icons/*.ico build/icons/

clean:
	$(RM) -rf build

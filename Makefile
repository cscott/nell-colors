all: build-all

#OPT=optimize=none
OPT=

build/index.js: index.js # and other stuff
	mkdir -p build
	node r.js -o name=index out=$@ baseUrl=. $(OPT)
build/ncolors.js: ncolors.js # and other stuff
	mkdir -p build
	node r.js -o name=ncolors out=$@ baseUrl=. $(OPT) include=drw!r.json
build/src/recogworker.js: src/recogworker.js # and other stuff
	mkdir -p build
	node r.js -o name=recogworker out=$@ baseUrl=src paths.json=../json paths.text=../text $(OPT)

build-all: build/index.js build/ncolors.js build/src/recogworker.js
	mkdir -p build/icons build/audio
	cp index.html ncolors.html build/
	cp require.min.js build/require.js
	cp src/worker.js build/src/
	cp icons/*.png icons/*.ico build/icons/
	cp audio/*.mp3 audio/*.ogg build/audio/
	cp *.json build/

clean:
	$(RM) -rf build

###########################################
brushes/%-129.png: brushes/%-257.png
	convert $< -resize 129x129 $@
brushes/brush-tile-129.png: brushes/hard-129.png brushes/medium-129.png \
	brushes/rough-fine-129.png brushes/rough-coarse-129.png \
	brushes/soft-129.png \
	brushes/dots-small-129.png brushes/dots-big-129.png \
	brushes/soft-rect-129.png brushes/splotch-129.png \
	brushes/splotches-coarse-129.png
	montage $^ -tile x1 -geometry +0+0 -background none $@

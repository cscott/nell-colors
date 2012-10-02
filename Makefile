all: build-all

#OPT=optimize=none
OPT=

PLUGINS=domReady font img drw json text propertyParser webfont

build/index.js: index.js # and other stuff
	mkdir -p build
	node r.js -o name=index out=$@ baseUrl=. $(foreach p,$(PLUGINS),paths.$(p)=plugins/$(p))
build/ncolors.js: ncolors.js src/audio-map.js # and other stuff
	mkdir -p build
	node r.js -o name=ncolors out=$@ baseUrl=. $(OPT) include=drw!samples/r.json $(foreach p,$(PLUGINS),paths.$(p)=plugins/$(p))
build/src/recogworker.js: src/recogworker.js # and other stuff
	mkdir -p build
	node r.js -o name=recogworker out=$@ baseUrl=src $(foreach p,$(PLUGINS),paths.$(p)=../plugins/$(p)) $(OPT)

build-all: build/index.js build/ncolors.js build/src/recogworker.js brushes/brush-tile-129.png
	mkdir -p build/icons build/audio build/brushes build/samples \
		build/fonts build/style
	for f in index.html ncolors.html install.html ; do \
	  sed -e 's/<html/<html manifest="offline.manifest" /' < $$f > build/$$f; \
	done
	cp manifest.webapp build/
	cp require.min.js build/require.js
	cp src/worker.js build/src/
	cp icons/*.png icons/*.ico icons/*.svg build/icons/
	cp audio/*.webm build/audio/
	cp brushes/brush-tile-129.png build/brushes
	cp fonts/*.eot fonts/*.ttf fonts/*.css build/fonts
	cp style/*.css build/style
	cp samples/*.json build/samples
	# 'brush' dialog demo
	cp brush.html build/
	cp src/iscroll.js src/slider.js build/src/
	# offline manifest (everything!)
	( echo "CACHE MANIFEST" ; \
	  echo -n '# ' ; find build -type f | xargs md5sum -b | md5sum; echo ; \
	  echo "CACHE:" ; \
	  cd build ; find . -type f -print | fgrep -v manifest ) \
		> build/offline.manifest
	# domain name for github pages
	echo nell-colors.github.cscott.net > build/CNAME
	# apache support for HTML5 offline manifest
	( echo "AddType text/cache-manifest .manifest" ; \
	  echo "AddType application/x-web-app-manifest+json .webapp" ) \
	  > build/.htaccess

clean:
	$(RM) -rf build

##########################################
audio/%.b64: audio/%
	base64 -w 0 < $< > $@
src/audio-map.js: $(foreach l,A B C D E F G H I J K L M N O P Q R S T U V W X Y Z,\
	audio/$(l).webm.b64)
	echo "define([], function() { return {" > $@
	for f in $^ ; do \
	echo '"audio/'`basename $$f .b64`'": "'`cat $$f`'",' >> $@ ; \
	done
	echo "}; });" >> $@

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

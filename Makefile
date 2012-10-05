all: build-all

#OPT=optimize=none
OPT=

COMPASS=$(HOME)/OLPC/Narrative/compass
PLUGINS=domReady font img drw json text propertyParser webfont
STYLES=style/brushdemo.css style/index.css style/ncolors.css

build/index.js: index.js # and other stuff
	mkdir -p build
	node r.js -o name=index out=$@ baseUrl=. $(foreach p,$(PLUGINS),paths.$(p)=plugins/$(p))
build/ncolors.js: ncolors.js src/audio-map.js # and other stuff
	mkdir -p build
	node r.js -o name=ncolors out=$@ baseUrl=. $(OPT) include=drw!samples/r.json $(foreach p,$(PLUGINS),paths.$(p)=plugins/$(p))
build/brushdemo.js: brushdemo.js # and other stuff
	mkdir -p build
	node r.js -o name=brushdemo out=$@ baseUrl=. $(OPT) $(foreach p,$(PLUGINS),paths.$(p)=plugins/$(p))
build/src/recogworker.js: src/recogworker.js # and other stuff
	mkdir -p build
	node r.js -o name=recogworker out=$@ baseUrl=src $(foreach p,$(PLUGINS),paths.$(p)=../plugins/$(p)) $(OPT)

$(STYLES): sass/*.scss
	cd $(COMPASS) ; bin/compass compile $(abspath .)

build-all: build/index.js build/ncolors.js build/brushdemo.js build/src/recogworker.js brushes/brush-tile-129.png $(STYLES)
	mkdir -p build/icons build/audio build/brushes build/samples \
		build/fonts build/style
	for f in index.html ncolors.html ; do \
	  sed -e 's/<html/<html manifest="manifest.appcache" /' < $$f > build/$$f; \
	done
	cp install.html *.webapp build/
	cp require.min.js build/require.js
	cp src/worker.js src/appcacheui.js build/src/
	cp icons/*.png icons/*.ico icons/*.svg build/icons/
	cp audio/*.webm build/audio/
	cp brushes/brush-tile-129.png build/brushes
	cp fonts/*.eot fonts/*.ttf fonts/*.css build/fonts
	cp style/*.css build/style
	cp samples/*.json build/samples
	# 'brush' dialog demo
	cp brushdemo.html build/
	# offline manifest (everything!)
	( echo "CACHE MANIFEST" ; \
	  echo -n '# ' ; find build -type f | fgrep -v manifest | \
	    fgrep -v install.html | xargs md5sum -b | md5sum; echo ; \
	  echo "CACHE:" ; \
	  cd build ; find . -type f -print | fgrep -v manifest | \
	    fgrep -v install.html ) > build/manifest.appcache
	# domain name for github pages
	echo nell-colors.github.cscott.net > build/CNAME
	# turn off jekyll for github pages
	touch build/.nojekyll
	# apache support for HTML5 offline manifest
	( echo "AddType text/cache-manifest .appcache" ; \
	  echo "AddType application/x-web-app-manifest+json .webapp" ; \
	  echo "AddType video/webm .webm" ) \
	  > build/.htaccess

clean:
	$(RM) -rf build $(STYLES)

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

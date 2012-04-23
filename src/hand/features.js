/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global
  define:true, console:false, require:false, module:false, window:false,
  Float64Array:false, Uint16Array:false
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(['../point', '../compat'], function(Point, Compat) {
    'use strict';
    // Workaround for iPhone, which is missing Float64Array
    var Float64Array = Compat.Float64Array;

    // tunable parameters
    var SMOOTH_N = 3, SMOOTH_ALPHA = 0.25;
    var RESAMPLE_INTERVAL = 1/7;//1/10;

    var DELTAWINDOW=2, ACCWINDOW=2; // should match values in HTK config

    var Box = function(tl, br) {
        this.tl = tl;
        this.br = br;
    };
    Box.prototype = {
        unionPt: function(pt) {
            if (pt.x < this.tl.x) { this.tl.x = pt.x; }
            if (pt.y < this.tl.y) { this.tl.y = pt.y; }
            if (pt.x > this.br.x) { this.br.x = pt.x; }
            if (pt.y > this.br.y) { this.br.y = pt.y; }
        },
        union: function(box) {
            this.unionPt(box.tl);
            this.unionPt(box.br);
        },
        size: function() {
            return { width: this.br.x - this.tl.x,
                     height: this.br.y - this.tl.y };
        }
    };
    Box.fromPts = function(pts) {
        // pts must have at least one element
        var b = new Box(pts[0].clone(), pts[0].clone());
        pts.forEach(function(p) { b.unionPt(p); });
        return b;
    };

    var normalize = function(data_set) {
        var ppmm = data_set.ppmm;
        var mkpt = function(p) { return new Point(p[0], p[1]); };

        // remove dups
        data_set.strokes = data_set.strokes.map(function(stroke) {
            stroke = stroke.map(mkpt);
            var nstrokes = [stroke[0]], i;
            for (i=1; i<stroke.length; i++) {
                if (stroke[i].equals(stroke[i-1])) {
                    continue;
                }
                nstrokes.push(stroke[i]);
            }
            return nstrokes;
        });
        // remove length-1 strokes (too short)
        data_set.strokes = data_set.strokes.filter(function(stroke) {
            return stroke.length > 1;
        });
        if (data_set.strokes.length === 0) {
            return; // hmm.  bad data.
        }

        // find bounding box
        var strokeBBs = data_set.strokes.map(function(stroke) {
            return Box.fromPts(stroke);
        });
        var bbox = strokeBBs[0];
        strokeBBs.forEach(function(bb) { bbox.union(bb); });

        // use correct aspect ratio (including correcting for ppmm differences)
        var size = bbox.size();
        size = Math.max(size.width/ppmm.x, size.height/ppmm.y);/* in mm */
        var norm = function(pt) {
            // map to [0-1], y=0 at bottom (math style)
            var x = (pt.x - bbox.tl.x) / (ppmm.x * size);
            var y = (pt.y - bbox.tl.y) / (ppmm.y * size);
            return new Point(x, y);
        };
        data_set.strokes = data_set.strokes.map(function(stroke) {
            return stroke.map(norm);
        });
    };

    var smooth = function(data_set) {
        data_set.strokes = data_set.strokes.map(function(stroke) {
            var nstroke = [], i, j;
            for (i=0; i<stroke.length; i++) {
                var acc = new Point(stroke[i].x * SMOOTH_ALPHA,
                                    stroke[i].y * SMOOTH_ALPHA );
                var n = SMOOTH_N;
                // [0, 1, 2, 3, 4 ] .. N = 2, length=5
                while (n>0 && (i<n || i>=(stroke.length-n))) {
                    n--;
                }
                for (j=1; j<=n; j++) {
                    acc.x += stroke[i-j].x + stroke[i+j].x;
                    acc.y += stroke[i-j].y + stroke[i+j].y;
                }
                acc.x /= (2*n + SMOOTH_ALPHA);
                acc.y /= (2*n + SMOOTH_ALPHA);
                nstroke.push(acc);
            }
            return nstroke;
        });
    };

    var singleStroke = function(data_set) {
        var nstroke = [];
        data_set.strokes.forEach(function(stroke) {
            // add "pen up" stroke.
            var first = stroke[0], j;
            nstroke.push(new Point(first.x, first.y, true/*up!*/));
            for (j = 1; j < stroke.length; j++) {
                nstroke.push(stroke[j]);
            }
        });
        data_set.strokes = [ nstroke ];
    };

    var equidist = function(data_set, dist) {
        console.assert(data_set.strokes.length===1);
        if (!dist) { dist = RESAMPLE_INTERVAL; }
        var stroke = data_set.strokes[0];
        if (stroke.length === 0) { return; /* bad data */ }
        var nstroke = [];
        var last = stroke[0];
        var d2next = 0;
        var wasPenUp=true;
        var first = true;
        stroke.forEach(function(pt) {
            var d = Point.dist(last, pt);

            while (d2next <= d) {
                var amt = (first)?0:(d2next/d);
                var npt = Point.interp(last, pt, amt);

                var segmentIsUp = pt.isUp;
                if (wasPenUp) { npt.isUp = true; }
                wasPenUp = first ? false : segmentIsUp;

                nstroke.push(npt);
                d2next += dist;
                first = false;
            }
            d2next -= d;
            last = pt;
        });
        if (nstroke[nstroke.length-1].isUp) {
            console.assert(!last.isUp, arguments[2]);
            nstroke.push(last);
        }
        /*
        // extrapolate last point an appropriate distance away
        if (d2next/dist > 0.5 && stroke.length > 1) {
        nstroke.push(last);
        var last2 = stroke[stroke.length-2];
        var namt = d2next / Point.dist(last2, last);
        if (namt < 5) {
        nstroke.push(Point.interp(last2, last, namt));
        }
        }
        */
        data_set.strokes = [ nstroke ];
    };

    var features = function(data_set) {
        var i;
        var points = data_set.strokes[0];
        var features = points.map(function() { return []; });
        for (i=0; i<points.length; i++) {
            var m2 = points[(i<2) ? 0 : (i-2)];
            var m1 = points[(i<1) ? 0 : (i-1)];
            var pt = points[i];
            var p1 = points[((i+1)<points.length) ? (i+1) : (points.length-1)];
            var p2 = points[((i+2)<points.length) ? (i+2) : (points.length-1)];

            var dx1 = p1.x - m1.x, dy1 = p1.y - m1.y;
            var ds1 = Math.sqrt(dx1*dx1 + dy1*dy1);

            var dx2 = p2.x - m2.x, dy2 = p2.y - m2.y;
            var ds2 = Math.sqrt(dx2*dx2 + dy2*dy2);

            var bb = Box.fromPts([ m2, m1, pt, p1, p2 ]).size();
            var L = m2.dist(m1) + m1.dist(pt) + pt.dist(p1) + p1.dist(p2);

            // http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
            var dist2line = function(pp) {
                // x0 = pp.x ; x1 = m2.x ; x2 = p2.x
                // y0 = pp.y ; y1 = m2.y ; y2 = p2.y
                // |(x2-x1)(y1-y0) - (x1-x0)(y2-y1)| / ds2
                // |  dx2 * (m2.y - pp.y) - (m2.x - pp.x)*dy2 | / ds2
                return Math.abs(dx2*(m2.y-pp.y) - dy2*(m2.x-pp.x)) / ds2;
            };
            var d0 = dist2line(m1), d1 = dist2line(pt), d2 = dist2line(p1);
            var dN = 3;
            if (m1.equals(m2)) { dN--; }
            if (p1.equals(p2)) { dN--; }

            features[i] = [
                // curvature (fill in in next pass)
                0,
                0,
                // writing direction
                dx1/ds1,
                dy1/ds1,
                // vertical position.
                pt.y,
                // aspect
                (bb.height - bb.width) / (bb.height + bb.width),
                // curliness
                (L / Math.max(bb.height, bb.width)) - 2,
                // linearity
                (d0*d0 + d1*d1 + d2*d2) / dN,
                // slope
                dx2/ds2,
                // pen up!
                pt.isUp ? 1 : -1
            ];
        }
        // fill in curvature features
        for (i=0; i<features.length; i++) {
            var M1 = features[(i<1) ? 0 : (i-1)];
            var ft = features[i];
            var P1 = features[((i+1)<features.length)? (i+1) : (features.length-1)];

            var cosm1 = M1[2], sinm1 = M1[3];
            var cosp1 = P1[2], sinp1 = P1[3];
            ft[0] = (cosm1*cosp1) + (sinm1*sinp1);
            ft[1] = (cosm1*sinp1) - (sinm1*cosp1);
        }
        // rescale to normalize to (approximately) [-1,1]
        for (i=0; i<features.length; i++) {
            features[i][4] = (2 * features[i][4]) - 1;
            features[i][6] = (((features[i][6] + 1) / 3.2) * 2) - 1;
            features[i][7] = (features[i][7] * 50) - 1;
        }
        // save features
        data_set.features = features;
    };

    var _zerofunc = function() { return 0; };
    var _compute_deltas = function(features, window) {
        var len_m1 = features.length - 1;
        var theta, t, tpt, tmt, i;
        var numerator, denominator;
        var dt = [];
        // from definition in section 5.9 of HTK book
        for (t=0; t <= len_m1; t++) {
            numerator = features[t].map(_zerofunc);
            denominator = 0;
            for (theta=1; theta <= window; theta++) {
                tpt = Math.min(t + theta, len_m1);
                tmt = Math.max(t - theta, 0);
                for (i = 0; i < features[t].length; i++) {
                    numerator[i] += theta*(features[tpt][i] - features[tmt][i]);
                }
                denominator += theta*theta;
            }
            denominator *= 2;

            dt[t] = [];
            for (i = 0; i < features[t].length; i++) {
                dt[t][i] = numerator[i] / denominator;
            }
        }
        return dt;
    };
    var delta_and_accel = function(data_set) {
        data_set.deltas = _compute_deltas(data_set.features, DELTAWINDOW);
        data_set.accels = _compute_deltas(data_set.deltas, ACCWINDOW);
    };
    var merge_delta_and_accel = function(data_set) {
        data_set.features = data_set.features.map(function(f, i) {
            return f.concat(data_set.deltas[i], data_set.accels[i]);
        });
        delete data_set.deltas;
        delete data_set.accels;
    };

    var make_linear_decode_func = function(codebook) {
        console.assert(codebook.Type === 'linear');
        console.assert(codebook.CovKind === 'euclidean');
        var table_for_stream = function(stream, featlen) {
            var table = [];
            codebook.Nodes.forEach(function(node) {
                var base = featlen * (node.VQ-1);
                node.Mean.forEach(function(v, j) {
                    table[base+j] = v;
                });
            });
            var _table = new Float64Array(table.length);
            table.forEach(function(v, i) { _table[i] = v; });
            return _table;
        };
        var eucl_dist2 = function(table, j, input) {
            var base = input.length * j;
            var acc = 0, d, i;
            for (i=0; i<input.length; i++) {
                d = (input[i] - table[base+i]);
                acc += d*d;
            }
            return acc;
        };
        var decode_one = function(table, input) {
            var best = 0, bestd = eucl_dist2(table, 0, input), i;
            for (i=1; i*input.length < table.length; i++) {
                var d = eucl_dist2(table, i, input);
                if (d < bestd) {
                    bestd = d;
                    best = i;
                }
            }
            return best;
        };
        var tables = codebook.Streams.map(function(width, i) {
            return table_for_stream(i+1, width);
        });
        var decodefunc = function(input, i) {
            return decode_one(tables[i], input);
        };
        var decode = function() {
            return Array.prototype.map.call(arguments, decodefunc);
        };
        return decode;
    };
    var make_tree_decode_func = function(codebook) {
        console.assert(codebook.Type === 'tree');
        console.assert(codebook.CovKind === 'euclidean');

        var tree_for_stream = function(stream, featlen) {
            var table = {};
            var tree = [], codepoint = [];
            codebook.Nodes.forEach(function(node) {
                if (node.Stream === stream) {
                    table[node.Id] = node;
                }
            });
            var recurse = function(node, i) {
                // codepoint value = one greater than VQ index; 0=nonterminal
                codepoint[i] = node.VQ;
                var base = i*featlen;
                node.Mean.forEach(function(v, j) {
                    tree[base+j] = v;
                });
                // do left and right nodes
                if (node.LeftId) {
                    recurse(table[node.LeftId], 1 + 2*i);
                }
                if (node.RightId) {
                    recurse(table[node.RightId], 2 + 2*i);
                }
            };
            // first node.Id is 1; heap is 0-based.
            recurse(table[1], 0);
            // now make nice native arrays
            var _tree = new Float64Array(tree.length);
            tree.forEach(function(v, i) { _tree[i] = v; });
            var _codepoint = new Uint16Array(codepoint.length);
            codepoint.forEach(function(v, i) { _codepoint[i] = v; });
            // done
            return [_codepoint, _tree];
        };

        var eucl_dist2 = function(tree, j, input) {
            var base = input.length * j;
            var acc = 0, d, i;
            for (i=0; i<input.length; i++) {
                d = (input[i] - tree[base+i]);
                acc += d*d;
            }
            return acc;
        };
        var decode_one = function(codepoint, tree, input) {
            var i = 0;
            while (true) {
                // if this node is terminal, this is the vq index
                if (codepoint[i] !== 0) { return codepoint[i] - 1; }
                // otherwise, is it closer to the left or right vector?
                var leftd = eucl_dist2(tree, 1 + 2*i, input);
                var rightd= eucl_dist2(tree, 2 + 2*i, input);
                i = 1 + 2*i; // left branch
                if (leftd > rightd) {
                    i++; // right branch
                }
            }
        };

        var tables = codebook.Streams.map(function(width, i) {
            return tree_for_stream(i+1, width);
        });
        var decodefunc = function(input, i) {
            return decode_one(tables[i][0], tables[i][1], input);
        };
        var decode = function() {
            return Array.prototype.map.call(arguments, decodefunc);
        };
        return decode;
    };

    var make_vq = function(codebook) {
        var decode;
        if (codebook.Type === 'tree') {
            decode = make_tree_decode_func(codebook);
        } else if (codebook.Type === 'linear') {
            decode = make_linear_decode_func(codebook);
        } else {
            console.assert(false, codebook.Type);
        }
        return function(data_set) {
            data_set.vq = [];
            var i;
            for (i=0; i<data_set.features.length; i++) {
                data_set.vq[i] = decode(data_set.features[i],
                                        data_set.deltas[i],
                                        data_set.accels[i]);
            }
        };
    };

    // exports
    return {
        // parameters
        SMOOTH_N: SMOOTH_N,
        SMOOTH_ALPHA: SMOOTH_ALPHA,
        RESAMPLE_INTERVAL: RESAMPLE_INTERVAL,
        // stroke processing functions
        normalize: normalize,
        smooth: smooth,
        singleStroke: singleStroke,
        equidist: equidist,
        features: features,
        delta_and_accel: delta_and_accel,
        merge_delta_and_accel: merge_delta_and_accel,
        make_vq: make_vq
    };
});

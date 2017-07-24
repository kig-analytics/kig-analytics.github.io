/*
  The basic rules for what needs to be availble from this student.js are:

  dataFinish: will be called once at the end of d3.csv()
  choiceSet: will be called with radioButton changes
  toggleState: will be called with clicks on states or their marks

  Beyond that, you can add and re-structure things as you see fit.
  Most of the code below is based on project 2. Places where its
  especially important to add code are marked with "(your code here)"
*/

// trying to use https://toddmotto.com/mastering-the-module-pattern/
var P3=(function () {

/* variable controlling map geometry; you can reduce this if you think
   it will help your depiction of which states are selected, while not
   creating too distracting a boundary between all the states */
var HexScaling = 1.0; // hexagon scaling (1 == touching)

/* radius of circular marks in bivariate case; change this if you
   think it will make things clearer */
var MarkRadius = 5.0;
/* CmapLegSize and PCALegSize are set in index.html since they
   shouldn't be changed */

/* duration, in milliseconds, of transitions between visualizations */
var TransitionDuration = 500;

/* other variables to track current state of visualization */
var CmapUnivariate = false; // is current colormap univariate?
/* you can add variables more here.  For example, how will you keep
   track of whether a state has been selected in the visualization?
   (your code here) */

/* utility functions that should not need changing */
var lerp = function (w,[a,b]) { return (1.0-w)*a + w*b; }
var unlerp = function (x,[x0,x1]) { return (x-x0)/(x1-x0); }
var minmax = function (arr) {
    var minval=arr[0], maxval=minval;
    arr.map(function (x) {
            minval = Math.min(x, minval);
            maxval = Math.max(x, maxval);
        });
    return [minval, maxval];
}

/* toggleState is called when you click on either a state in the map,
   or its indication in the colormap legend; the passed "state" is the
   two letter state abbreviation.  That means you can select the hexagon
   for the state with d3.select("#" + state + "hex"), and the tickmark
   for the state with d3.select("#" + state + "mark"). How you modify
   the tickmark for the state will probably depend on whether a univariate
   or a bivariate colormap is being used (CmapUnivariate) */
var toggleState = function(state) {
    console.log(switchmap.get(state));

    //check whether state is selected (1) or not (0)
    if (switchmap.get(state) === 0){
      //make border outline visible
      d3.select("#" + state + "hex")
       .data(P3.data)
          .attr("stroke", "white")
          .attr("stroke-width", 5)
          .attr("stroke-dasharray", "7,4")
          .attr("stroke-opacity", 1.0);

      //change the fill of the state on the colormap legend
      //shows up much better for bivariate than variate
      d3.select("#" + state + "mark")
        .attr("fill", "white")
        .attr("fill-opacity", 1);

      //note that switch is on
      switchmap.set(state, 1);
    } else {
      //Initialize non-visible values for the stroke of the state hexmap
      d3.select("#mapUS").selectAll("g").select("path")
        .data(P3.data)
           .attr("stroke", "white")
           .attr("stroke-width", 5)
           .attr("stroke-dasharray", "7,4")
           .attr("stroke-opacity", 0);

      //initiate some dummy value for the ellipse
      d3.select("#cmlMarks").selectAll("ellipse")
        .data(P3.data)
           .attr("fill", "pink")
           .attr("fill-opacity", 0);

      //turn the switch off
      switchmap.set(state, 0);
    }
}


/* PCA: computes PCA of given array of arrays.
   uses http://www.numericjs.com for linear algebra */
var PCA = function (dcols) {
    if (dcols.length < 3) {
        d3.select("#pcaWarning").html("PCA() needs at least 3 variables (got " + dcols.length+ ")");
        return null;
    }
    /* else got enough variables */
    d3.select("#pcaWarning").html("");
    // dcols: (short) array of (long) data arrays (each element ~ a csv column)
    // drows: (long) array of data vectors (each element ~ a csv row)
    var drows = numeric.transpose(dcols);
    // covar: covariance matrix
    var covar = numeric.dot(dcols,drows);
    /* NOTE: numeric.dot is for matrix multiplication in general,
       which includes matrix-matrix multiply (as above), and
       matrix-vector multiply, as well as
       vector-vector (inner) product, which you might want to use for
       compute coordinates in the basis of PCA eigenvectors */
    // nmeig: numeric.js's eigensystem representation of covar
    var nmeig = numeric.eig(covar);
    /* NOTE: If you see in the javascript console:
       "Uncaught Error: numeric: eigenvalue iteration does not converge -- increase maxiter?"
       then it is likely that one or more values being passed to
       numeric.eig(covar) are not numeric (e.g. "NaN"), which can happen if
       one or more values in dcols are not numeric */
    // evec: array of covariance matrix eigenvectors (unit-length)
    var evec = numeric.transpose(nmeig.E.x);
    // evec: array of corresponding eigenvalues
    var eval = nmeig.lambda.x;
    // esys: zipping up each component of eigensysem into a little object:
    // "l" for eigenvalue, "v" eigenvector, and "mm" for zero-centered range
    // of projections of data into that eigenvector
    var esys = eval.map(function (_,i) {
            var mindot = 0, maxdot = 0;
            drows.map(function (_,j) { // learn range of projections
                    var x = numeric.dot(drows[j],evec[i]);
                    mindot = Math.min(mindot, x);
                    maxdot = Math.max(maxdot, x);
                });
            // center range around zero
            var mmin = Math.min(mindot, -maxdot);
            var mmax = Math.max(-mindot, maxdot);
            // make sure the range itself is non-zero
            if (mmin == mmax) {
                mmin = -1;
                mmax = 1;
            }
            return {"l": eval[i],
                    "v": evec[i],
                    // simplify needlessly precise representation of range
                    "mm": [d3.format(".3f")(mmin), d3.format(".3f")(mmax)]};
        });
    // sort eigensystem in descending eigenvalue order
    esys.sort(function (a,b) {
            var x = a.l; var y = b.l;
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    return esys;
}

/* dataNorm should take an array of scalar data values and return an
   array resulting from two transformations:
   1) subtract out the mean
   2) make the variance 1
   Making the variance 1 means that no data variable will out an outsized
   influence on the PCA just because of a choice of units: multiplying a
   variable by 10 won't change its information content, but it would
   increase that variable's role in a PCA. */
var dataNorm = function (arr) {

    //calculate the mean
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
      sum += arr[i];
    };
    var avg = sum / arr.length;

    //find mins and maxs
    var mm = minmax(arr);
    var min = Math.min(...arr);
    var max = Math.max(...arr);

    //substract the average from every element
    arr_adjust = arr.map(function(d) {
      //large than average, adjust to [0,1]
      if (d > avg){
        var centered = d - avg;
        return unlerp(centered, [avg, max]);
      } else {
        //below average, adjust to [-1,0]
        var centered = d - avg;
        return unlerp(centered, [min, avg]) - 1;
      }
    });

    return arr_adjust;
}

/* (from Project2 solution) some stuff we can use for each
 * univariate map.  Feel free to ignore/delete this function
 * if you want to structure things differently */
var stuff = function (what, mmGiven) {
    var sel = function(d) {return +d[what]}
    var slc = P3.data.map(sel);
    var mm = ((typeof mmGiven === 'undefined')
              ? minmax(slc) // mmGiven not passed, find min,max
              : mmGiven);   // use given mmGiven
    return {"select" : sel,
            "minmax" : mm,
            "cmlscl" : d3.scale.linear().domain(mm).range([0,P3.CmapLegSize-1]),
            };
}

var dataFinish = function (data) {
    /* save data for future reference (for simplicity, from here on
       out P3.data is the only way we'll refer to the data) */
    P3.data = data;

    /* much of the code here is from Project2 reference solution
       http://people.cs.uchicago.edu/~glk/ class/DataVis/p2.js
       but you should feel free to modify/augment/edit it as you
       see fit for your work (your code here) */
    var voteTotMax = 0;
    P3.data.map(function(d) {
            var VT = +d["ObamaVotes"] + +d["RomneyVotes"];
            d["VT"] = VT;
            d["PL"] = +d["ObamaVotes"]/(1.0 + VT);
            voteTotMax = Math.max(voteTotMax, VT);
        });
    P3.data.map(function(d) {
            d["VA"] = 1 - Math.pow(1- d["VT"]/voteTotMax, 3);
        });

    /* learn earnings ranges */
    P3.earnWMinMax = minmax(P3.data.map(function(d) {return +d["WE"]}));
    P3.earnMMinMax = minmax(P3.data.map(function(d) {return +d["ME"]}));

    /* obesity-related things */
    P3.obeseStuff = stuff("OB");
    var _obeseCmap = d3.scale.linear() /* colormap prior to quantization */
        .domain([0,0.4,1])
        .range([d3.rgb(100,200,100), d3.rgb(220,220,210), d3.rgb(130,0,0)]);
    P3.obeseCmap = function(r) {
        var w0 = Math.round(lerp(unlerp(r,P3.obeseStuff["minmax"]), [-0.5, 6.5]));
        return _obeseCmap(unlerp(Math.min(6, w0),[-0.5, 6.5]));
    }

    /* create unemployment colormap */
    P3.unempStuff = stuff("UN");
    P3.unempCmap = d3.scale.linear()
        .domain([0,1/3,2/3,1].map(function(w) {return lerp(w,P3.unempStuff["minmax"]);}))
        .range([d3.rgb(0,0,0), d3.rgb(210,0,0), d3.rgb(255,210,0), d3.rgb(255,255,255)]);

    /* create infant mortality map */
    P3.imortStuff = stuff("IM");
    P3.imortCmap = function(d) {
        var scl = d3.scale.linear().domain(P3.imortStuff["minmax"]);
        return d3.hcl(scl.range([330,-15])(d),
                      25*Math.pow(Math.sin(scl.range([0,3.14159])(d)),2),
                      scl.range([0,100])(d));
    }

    /* create univariate voter maps */
    P3.pleanStuff = stuff("PL", [0,1]);
    var Dhcl = d3.hcl(d3.rgb(0,0,210));
    var Rhcl = d3.hcl(d3.rgb(210,0,0));
    P3.pleanCmap = function(x) {
        return d3.hcl(x < 0.5 ? Rhcl.h : Dhcl.h,
                      (x < 0.5 ? Rhcl.c : Dhcl.c)*
                      (1 - Math.pow(1 - (Math.abs(x-0.5)/0.5),4)),
                      lerp(x,[Rhcl.l,Dhcl.l]));
    }

    /* create bivariate voter map */
    P3.plean2Cmap = function([pl,va]) {
        var col = P3.pleanCmap(pl);
        return d3.hcl(col.h,  lerp(va,[0,col.c]),  lerp(va,[100,col.l]));
    }

    /* create bivariate earnings maps */
    P3.ERcmap = function([mm,ww]) {
        var erw = unlerp(ww,P3.earnWMinMax);
        var erm = unlerp(mm,P3.earnMMinMax);
        return d3.lab(25+40*(erw + erm), 0, 170*(erm - erw));
    }

    //Initialize non-visible values for the stroke of the state hexmap
    d3.select("#mapUS").selectAll("g").select("path")
         .data(P3.data)
         .attr("stroke", "white")
         .attr("stroke-width", 5)
         .attr("stroke-dasharray", "7,4")
         .attr("stroke-opacity", 0);

    //initiate some dummy value for the ellip
    d3.select("#cmlMarks").selectAll("ellipse")
         .data(P3.data)
         .attr("fill", "pink");

    /* New colormaps that you want to create go here ... */

    //Initialize Google Search Stuff
    P3.GSStuff = stuff("GS");

    //Initialize Facebook Stuff
    P3.FBStuff = stuff("FB");


    //create a new univariate colormap for PCA

    //create an array of the entire state column
    var states = data.map(function(d)
      {return d["State"];});
    //console.log(states);

    //Initialize a mapping from states to a switch
    //determining whether or not a given state has been selected
    //by click
    switchmap = new Map();
    for (var i = 0; i < states.length; i++) {
      var zero = new Number(0);
      switchmap.set(states[i], zero.valueOf());
    };
}

var choiceSet = function (wat,pvars) {
    console.log(wat,pvars); // feel free to remove this debugging line

    if (wat.startsWith("PC")) {
        if (pvars.length < 1) {
            d3.select("#pcaWarning").html("Select at least one variable below for PCA");
            return;
        }
        d3.select("#pcaWarning").html("");
        /* Else we have at least one variable for PCA; so we do that here,
           in the following steps:
           1) make an array (suppose its called "dcols") of the result
           of calling dataNorm() on each data variable (your code here)
           (can be as little as 3 lines) */

        var dcols = pvars.map(function(d){
          //gather column information
          var col = P3.data.map(function(c) {return +c[d]});
          //normalize the column
          return dataNorm(col);
        });

        /* 2) If less than 3 variables were selected for PCA, add to "dcols"
           one or two arrays of zeros, so that PCA() has at least three
           data variables to work on (your code here) (a few lines) */

        //create a 51 element long empty array
        var empty_col = Array.apply(null, Array(51)).map(Number.prototype.valueOf,0);
        //if one chosen variable, add one empty
        if (pvars.length == 1) {
          dcols.push(empty_col, empty_col);
        //if two, add one empty
        } else if (pvars.length == 2) {
          dcols.push(empty_col);
        }

        /* 3) call PCA(dcols), and add to P3.data the coordinates of each
           datum in the basis of the first three principle components.  Note
           that "var drows = numeric.transpose(dcols)" will get you an array
           of per-state data (row) vectors, and then with
           "P3.data.map(function(d,ii) { })" you can set PCA coordinate
           fields in per-state datum "d" from the dot product between
           drows[ii] and the PCA eigenvectors. Visualizing the PCA
           results should use these PCA coordinates in the same way that
           in the previous project you used the original data variables.
           (your code here) (roughly ~20 lines of code) */

        //apply PCA
        var results = PCA(dcols);
        //console.log(results);

        //Determine top three primary component vectors from results
        var topthree = Array.apply(null, Array(3)).map(Number.prototype.valueOf,0);
        for (var i = 0; i < 3; i++) {
          topthree[i] = results[i];
        };
        
        //dot each of the rows with these corresponding
        //primary component vectors
        var drows = numeric.transpose(dcols);
        var pcoords = P3.data.map(function(d,ii) {
          //console.log(drows[ii]);
          //console.log(evecs["v"]);
          var xc = numeric.dot(drows[ii], topthree[0].v);
          var yc = numeric.dot(drows[ii], topthree[1].v);
          var zc = numeric.dot(drows[ii], topthree[2].v);
          //console.log(coord);
          //d.pcacoord = coord;

          //memorize each of these values in the state of the data
          d.xc = xc;
          d.yc = yc;
          d.zc = zc;
        });

        //create accesible stuff objects for each of the
        //components x,y, and z
        P3.xstuff = stuff("xc");
        P3.ystuff = stuff("yc");
        P3.zstuff = stuff("zc");

        //Color maps for Univariate
        //used standard interpolation techniques from project 2
        //With a single midpoint value to illustrate an
        //idea of the median
        //PURPLE
        P3.uPCACmapx = 
          d3.scale.linear()
            .domain([0,1/2,1].map(function(w) {return lerp(w,P3.xstuff["minmax"]);}))
            .range([d3.rgb(192,4,201), d3.rgb(255,255,255), d3.rgb(192,4,201)]);

        //GREEN
        P3.uPCACmapy =
          d3.scale.linear()
            .domain([0,1/2,1].map(function(w) {return lerp(w,P3.ystuff["minmax"]);}))
            .range([d3.rgb(56,255,83), d3.rgb(255,255,255), d3.rgb(56,255,83)]);
        
        //BURNT SIENNA
        P3.uPCACmapz = 
          d3.scale.linear()
            .domain([0,1/2,1].map(function(w) {return lerp(w,P3.zstuff["minmax"]);}))
            .range([d3.rgb(255,136,56), d3.rgb(255,255,255), d3.rgb(255,136,56)]); 

        //Bivariate Color Map
        //This is the
        P3.bPCACmap = function([xx, yy]) {
          var cx = P3.uPCACmapx(xx);
          var cy = P3.uPCACmapy(yy);

          hcx = d3.hsl(cx);
          hcy = d3.hsl(cy);

          return d3.hcl(hcx.h,  lerp(yy,[0,hcy.c]),  lerp(yy,[100,hcy.l]));
        }

        /* 4) Visualize what the PCA did with the given data variables inside
           the #pcaMarks svg by changing the text element #pcaXX for
           all variables XX (selected via d3.select("#pca" + XX)):
           a) Make the text opaque for the variables actually included in
           the PCA, and transparent for the rest.
           b) For the variables in PCA, move the text to a position that
           indicates how that variable is aligned with the principle
           component(s) shown (one component for PC0, PC1, PC2, and
           two components for PC01, PC02, PC12). Compute this by forming
           a vector of length pvars.length which is all 0s except for 1 at
           the index of XX in pvars, and then using numeric.dot() to get
           the dot product with a principle component eigenvector. Since
           this is the dot product of two unit-length vectors, the result
           should be in [-1,1], which you should map to coordinates
           [30,P3.PCALegSize-30]) in X or [P3.PCALegSize-30,30]) in Y.
           Text is moved by modifying the "transform" attribute to
           "translate(cx,cy)" for position (cx,cy). For variables not
           in the PCA, the text should be moved back to the center at
           (P3.PCALegSize/2,P3.PCALegSize/2).  You can iterate over the
           #pcaXX with "P3.PCAVars.map(function(XX) { })".
           Changes to both opacity and position should also be made via a
           transition of duration TransitionDuration.  (your code here)
           (roughly ~30 lines of code) */

        //create vectors
        var vecs = Array.apply(null, Array(pvars.length)).map(Number.prototype.valueOf,0);
        //iterate over 
        for (var i = 0; i < pvars.length; i++) {
          var zeroed = Array.apply(null, Array(pvars.length)).map(Number.prototype.valueOf,0);
          zeroed[i] = 1;
          //add to list of vectors.
          //var temp = zeroed.set();

          //create each array which is all zeroes except for a single XX bit
          vecs[i] = zeroed;
          var x = numeric.dot(vecs[i], topthree[0].v);
          var y = numeric.dot(vecs[i], topthree[1].v);

          // console.log(x);
          // console.log(y);

          //generate scales to relate dot products to pixel grid
          var pcax = d3.scale.linear().domain([-1,1]).range([30,P3.PCALegSize-30]);
          var pcay = d3.scale.linear().domain([-1,1]).range([P3.PCALegSize-30,30]);

          d3.select("#pca" + pvars[i])
            .transition()
            .delay(TransitionDuration)
            .attr("transform", "translate(" + pcax(x) + "," + pcay(y) + ")")
            .attr("opacity", "1");
        };

        //Now to clean up and make the other vars transparent        
        var finishedvars = P3.PCAVars.filter(function(x) { return pvars.indexOf(x) < 0 });

        //return pca markers to their initial state
        finishedvars.map(function(d){
          d3.select("#pca" + d)
            .transition()
            .delay(TransitionDuration)
            .attr("transform", "translate(" + (P3.PCALegSize/2) + "," + (P3.PCALegSize/2) + ")")
            .attr("opacity", "0");
        });
    } else {
        d3.select("#pcaWarning").html("");
        /* else this isn't a PCA visualization, so none of the
           variables are involved in the PCA, so re-center all the PCA
           marks and make them transparent (your code here) (~10 lines) */
        
        //select and set opacity to zero
        P3.PCAVars.map(function(d){
          d3.select("#pca" + d)
            .transition()
            .delay(TransitionDuration)
            .attr("transform", "translate(" + (P3.PCALegSize/2) + "," + (P3.PCALegSize/2) + ")")
            .attr("opacity", "0");
        });
    }

    /* is this a univariate map? */
    CmapUnivariate = (["OB", "UN", "IM", "VU", "PC0", "PC1", "PC2"].indexOf(wat) >= 0);

    /* set the colormapping function */
    var colormap = {"OB" : P3.obeseCmap,
                    "UN" : P3.unempCmap,
                    "IM" : P3.imortCmap,
                    "VU" : P3.pleanCmap,
                    "VB" : P3.plean2Cmap,
                    "ER" : P3.ERcmap,
                    //newly added colormaps:
                    //one for univariate
                    //one for bivariate
                    "PC0" : P3.uPCACmapx,
                    "PC1" : P3.uPCACmapy,
                    "PC2" : P3.uPCACmapz,
                    "PC01" : P3.bPCACmap,
                    "PC02" : P3.bPCACmap,
                    "PC12" : P3.bPCACmap,
    }[wat];
    var cml, cmlx, cmly, sel, mmx, mmy;
    if (CmapUnivariate) {
        var stf = {"OB" : P3.obeseStuff,
                   "UN" : P3.unempStuff,
                   "IM" : P3.imortStuff,
                   "VU" : P3.pleanStuff,
                   //newly added:
                   "PC0" : P3.xstuff,
                   "PC1" : P3.ystuff,
                   "PC2" : P3.zstuff,
        }[wat];
        [cml,mmx,sel] = [stf["cmlscl"], stf["minmax"], stf["select"]];
        mmy = null;
    } else {
        cml = mmx = mmy = sel = null;
    }
    /* handle the bivariate cases */
    switch (wat) {
    case "VB" :
        cmlx = cmly = d3.scale.linear().domain([0, 1]).range([0,P3.CmapLegSize-1]);
        mmx = mmy = [0,1];
        sel = function(d) {return [+d.PL,+d.VA]};
        break;
    case "ER" :
        cmlx = d3.scale.linear().domain(P3.earnMMinMax).range([0,P3.CmapLegSize-1]);
        cmly = d3.scale.linear().domain(P3.earnWMinMax).range([0,P3.CmapLegSize-1]);
        mmx = P3.earnMMinMax;
        mmy = P3.earnWMinMax;
        sel = function(d) {return [+d.ME,+d.WE]};
        break;
    case "PC01" :
        mmx = minmax(P3.data.map(function(d) {return +d.xc}));
        mmy = minmax(P3.data.map(function(d) {return +d.yc}));
        //Set min and max from highest and lowest values of the result of the PCA
        cmlx = d3.scale.linear().domain(mmx).range([0,P3.CmapLegSize-1]);
        cmly = d3.scale.linear().domain(mmy).range([0,P3.CmapLegSize-1]);

        //Set min and max from highest and lowest values of the result of the PCA
        sel = function(d) {return [+d.xc,+d.yc]};
        break;
    case "PC02" :
        mmx = minmax(P3.data.map(function(d) {return +d.xc}));
        mmy = minmax(P3.data.map(function(d) {return +d.zc}));
        //Set min and max from highest and lowest values of the result of the PCA
        cmlx = d3.scale.linear().domain(mmx).range([0,P3.CmapLegSize-1]);
        cmly = d3.scale.linear().domain(mmy).range([0,P3.CmapLegSize-1]);

        //Set min and max from highest and lowest values of the result of the PCA
        sel = function(d) {return [+d.xc,+d.zc]};
        break;
    case "PC12" :
        mmx = minmax(P3.data.map(function(d) {return +d.yc}));
        mmy = minmax(P3.data.map(function(d) {return +d.zc}));
        //Set min and max from highest and lowest values of the result of the PCA
        cmlx = d3.scale.linear().domain(mmx).range([0,P3.CmapLegSize-1]);
        cmly = d3.scale.linear().domain(mmy).range([0,P3.CmapLegSize-1]);

        //Set min and max from highest and lowest values of the result of the PCA
        sel = function(d) {return [+d.yc,+d.zc]};
        break;
    }

    /* 1) reapply colorDatum to the "fill" of the states in #mapUS.
       be sure to add a transition that lasts TransitionDuration */
    d3.select("#mapUS").selectAll("path")
        .data(P3.data)
      .transition()
        .delay(TransitionDuration)
        .style("fill", function(d){ return colormap(sel(d)); });

    /* 2) reset pixels of cmlImage.data, and redisplay it with
       P3.cmlContext.putImageData(P3.cmlImage, 0, 0); */
    if (CmapUnivariate) {
        for (var j=0, k=0, c; j < P3.CmapLegSize; ++j) {
            for (var i=0; i < P3.CmapLegSize; ++i) {
                if (0 == j) {
                    c = d3.rgb(colormap(cml.invert(i)));
                    P3.cmlImage.data[k++] = c.r;
                    P3.cmlImage.data[k++] = c.g;
                    P3.cmlImage.data[k++] = c.b;
                    P3.cmlImage.data[k++] = 255;
                } else {
                    P3.cmlImage.data[k] = P3.cmlImage.data[(k++)-4*P3.CmapLegSize];
                    P3.cmlImage.data[k] = P3.cmlImage.data[(k++)-4*P3.CmapLegSize];
                    P3.cmlImage.data[k] = P3.cmlImage.data[(k++)-4*P3.CmapLegSize];
                    P3.cmlImage.data[k] = 255; k++;
                }
            }
        }
    } else {
        for (var j=0, k=0, c; j < P3.CmapLegSize; ++j) {
            for (var i=0; i < P3.CmapLegSize; ++i) {
                c = d3.rgb(colormap([cmlx.invert(i),
                                     cmly.invert(P3.CmapLegSize-1-j)]));
                P3.cmlImage.data[k++] = c.r;
                P3.cmlImage.data[k++] = c.g;
                P3.cmlImage.data[k++] = c.b;
                P3.cmlImage.data[k++] = 255;
            }
        }
    }
    P3.cmlContext.putImageData(P3.cmlImage, 0, 0);

    /* 3) set d3.select("#xminlabel").html(), and similarly for the other
       three labels, to reflect the range of values that are
       colormapped when displaying "wat".  For univariate maps,
       set xminlabel and yminlabel to show the range, and set
       yminlabel and ymaxlabel to an empty string.  For bivariate
       maps, set all labels to show the X and Y ranges. */
    d3.select("#xminlabel").html("<text>" + mmx[0] + "</text>");
    d3.select("#xmaxlabel").html("<text>" + mmx[1] + "</text>");
    if (CmapUnivariate) {
        d3.select("#yminlabel").html("<text></text>");
        d3.select("#ymaxlabel").html("<text></text>");
    } else {
        d3.select("#yminlabel").html("<text>" + mmy[0] + "</text>");
        d3.select("#ymaxlabel").html("<text>" + mmy[1] + "</text>");
    }

    /* 4) update the geometric attributes (rx, ry, cx, cy) of the #cmlMarks
       to indicate the data variables, and any other attributes you want
       to control according to whether the state is selected. Changes should
       happen with a transition of duration TransitionDuration.
       (your code here) (or interspersed below) */
    if (CmapUnivariate) {
        d3.select("#cmlMarks").selectAll("ellipse")
            .data(P3.data)
            .transition()
            .delay(TransitionDuration)
            .attr("rx", 0.05) // if zero, outline may disappear
            .attr("ry", P3.CmapLegSize/4)
            .attr("cx", function(d) { return 0.5+cml(sel(d)); })
            .attr("cy", P3.CmapLegSize/2);
    } else {
        d3.select("#cmlMarks").selectAll("ellipse")
            .data(P3.data)
            .transition()
            .delay(TransitionDuration)
            .attr("rx", MarkRadius).attr("ry", MarkRadius)
            .attr("cx", function(d) { return 0.5+cmlx(sel(d)[0]); })
            .attr("cy", function(d) { return P3.CmapLegSize-0.5-cmly(sel(d)[1]); });
    }
}

/* shouldn't have to change anything from here on */
return { // the P3 "API"
    HexScaling: HexScaling,
    choiceSet: choiceSet,
    dataFinish: dataFinish,
    toggleState: toggleState,
};

})(); // end "var P3=(function () {" module container

/* Answer questions here. Each should be no more than ~40 words.

#1) Concisely describe and justify your method of indicating, in the map
and in the colormap, whether a state is selected.

In dataFinish(), I created a Map between states and 0/1, on or off
switch. Initially, all states are initialized to off. Subsequently,
if toggleState() is called, I will first check if that particular
state is on or off - if on, then turn off. If off, then turn on.
Obtaining and switching the select state is as easy as using
the set and get functions in Map.


#2) In the terminology of "An Algebraic Process for Visualization
Design" (class May 26), what is one "confuser" for PCA as it it used
in this project (i.e. a particular change in the data that will have
no significant effect on the PCA result)?  (hint: think about what
dataNarm() does, and how the covariance matrix is computed).  There
are at least three possible answers.

One potential confuser is since dataNorm scales the distribution down
to -1 to 1, the exact magnitude and effect of specific outliers is
reduced.

#3) Concisely describe and justify your design of colormaps for the
univariate and bivarite cases of PCA visualization.

Univariate: Since the goal is to determine the variance, a nice way
to show the spread of values from the mean is to have a different
color for the midpoint - delineating colors that are closer (lower
variance) and those that are farther (higher)

Bivariate: Since there is less variance when data are clumped together
on the horizontal midline, this colormap highlights the difference
between the those at high variance (white/black) and low (grey).

#4) Based on exploring the data with PCA, what was a result that you found
from PCA of three or four variables?  Describe your result in terms of
which variables had similar vs complementary contributions to the PCA,
or the geographic trend you saw in the map.

Obesity and Unemployment often had similar contributions, and were often
complementary to political leaning and womens earnings. Geographic trends
tend to clump in either the South, East Coast, or Midwest for multiple
PCA.

(extra credit) #5) How did you maximize visual consistency when switching
between PCA and other radio buttons?

used transitions in both the color legend and in both the movement/fade away
of the PCA chart.



*/

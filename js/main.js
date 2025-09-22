var env={};

if(window){
  Object.assign(env, window.__env);
}

//for scale
//dimensions of the digram
var w = window.innerWidth*0.9
var h = window.innerHeight*0.98
let val = ((h/2)-5)/(w/2)
var ang= (Math.atan(val) * 180) / Math.PI;
let prefix=""






var app = angular.module('template',['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap']);

/*app.config(function($routeProvider) {

    //configure the routes

    $routeProvider
    .when("/", {
        templateUrl : "../views/home.html",
    })

});

//to enable lodash
/*
app.constant('_', window._)
  .run(function ($rootScope) {
     $rootScope._ = window._;
});*/



//d3 integration taken from http://www.ng-newsletter.com.s3-website-us-east-1.amazonaws.com/posts/d3-on-angular.html
angular.module('d3', [])
  .factory('d3Service', ['$document', '$q', '$rootScope',
    function($document, $q, $rootScope) {
      var d = $q.defer();
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { d.resolve(window.d3); });
      }
      // Create a script tag with d3 as the source
      // and call our onScriptLoad callback when it
      // has been loaded
      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.src = prefix + 'js/d3.min.js';
      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      }
      scriptTag.onload = onScriptLoad;

      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);

      return {
        d3: function() { return d.promise; }
      };
}]);



app.controller('ctrl', function($scope, apiService, $window, $document, $uibModal, $location, $anchorScroll, $sce, $timeout) {

  //such a shitty way to do q width but the stupid conditional styles aren't working
  $scope.model = {
    facets: [
      { name:"Negative Knowledge",
        //colour:"#FFBF00",
        fill_colour: "#33EEFF",//"#FFD147",
        rgb:[],
        questions:[{"text":"What problem or question dimensions are not represented or could not be captured? Why?", modal:"examples/nn1.html", w:20, "answer":""},
        {"text":"What information or outlooks were made invisible? How and why?", modal:"examples/nn2.html", w:30, "answer":""},
        {"text":"What dimensions could be revived or revealed by digital intervention? How?", modal:"examples/nn3.html", w:36, "answer":""}],
        index:0,
        top: '25vh',
        left: '52vw'
      },
      { name:"Positionality and Context",
        //colour:"#E83F6F",
        fill_colour:"#FA8261",//"#349AD5" ,
        questions:[{"text":"What is the context of the work? How is that context represented or occluded?", modal:"examples/pc1.html", w:36, "answer":""},
        {"text":"What perspectives and corresponding values and beliefs are represented? How?", modal:"examples/pc2.html", w:30, "answer":""},
        {"text":"To what extent is positionality highlighted or hidden?", modal:"examples/pc3.html", w:20, "answer":""}],
        index:1,
        top:'52vh',
        left:'52vw'
      },
      { name:"Relationship to Tools",
        //colour:"#2274A5",
        fill_colour:"#FBD774",//"#F07F9F",
        questions:[{"text":"In what way has the intervention of the digital impacted/altered research questions?", modal:"examples/rt1.html", w:36, "answer":""},
        {"text":"What parts of the work are being done by machines? What is the impact of this?", modal:"examples/rt2.html", w:30, "answer":""},
        {"text":"What assumptions are being made about the data or tools in the context of their use? ", modal:"examples/rt3.html", w:20, "answer":""}],//I think I need to rethink this question
        index:2,
        top:'52vh',
        left:'17vw'
      },
      { name:"Hermeneutic Attention",
        //color:"#32936F",
        fill_colour:"#D6C5FC",//"#49C195",
        questions:[{"text":"At what points is interpretation happening?", modal:"examples/ha1.html", w:20, "answer":""},
        {"text":"In what ways are computers ‘participating’ in the interpretation process?", modal:"examples/ha2.html", w:30, "answer":""},
        {"text":"How is interpretation (human or machine) made visible or invisible?", modal:"examples/ha3.html", w:36, "answer":""}],
        index:3,
        top:'25vh',
        left:'17vw'
      }

    ],
    panelOpen: false,
    active_facet: 0


  }

  $scope.getOffset= function(w) {
    let x = 33-w
    return x.toString() + 'vw'
  }

  $scope.openModal = function(q) {
    $scope.model.active_q = q
    $scope.model.modalInstance = $uibModal.open({
       templateUrl: prefix + q.modal,
       scope: $scope,
       size: 'lg'
     });
  }

  $scope.closeModal = function() {
    $scope.model.modalInstance.close();
  }

  $scope.togglePanel= function(){
    $scope.model.panelOpen = !$scope.model.panelOpen
  }

  $scope.changeActiveFacet = function(f) {
    $scope.model.active_facet = f
  }

  //this is not well though through but at thia point it just need to work
  function update_pages(tentative, d){
    if(tentative > 287) {
      d.addPage()
      return 20
    }
    return tentative
  }

  $scope.downloadForm = function() {
    //build up the pdf
    var doc = new jsPDF();
    let verticalOffset = 10
    doc.setFontSize(16)
    doc.text("Facets of Epistemological Friction", 10, verticalOffset)
    verticalOffset += 20
    for(let i=0;i<$scope.model.facets.length;i++) {
      doc.setFontSize(14)
      doc.setTextColor($scope.model.facets[i].fill_colour)
      doc.text($scope.model.facets[i].name, 10, verticalOffset)
      let t = update_pages(verticalOffset + 10, doc)
      verticalOffset = t
      doc.setFontSize(12)
      doc.setTextColor("#000000")

      for(let j=0;j<$scope.model.facets[i].questions.length;j++) {
        let q_lines = doc.splitTextToSize($scope.model.facets[i].questions[j].text, 200);
        t= update_pages(verticalOffset + ((q_lines.length + 1) * 5), doc)
        if (t==20) {
          verticalOffset=20
        }
        doc.setFontStyle('bold')
        doc.text(q_lines, 10, verticalOffset);
        verticalOffset = t
        doc.setFontStyle('regular')
        let a_lines = doc.splitTextToSize($scope.model.facets[i].questions[j].answer, 200);
        t= update_pages(verticalOffset + ((a_lines.length + 1) * 6), doc)
        if (t==20) {
          verticalOffset=20
        }
        doc.text(10, verticalOffset, a_lines);
        verticalOffset = t
      }

      t = update_pages(verticalOffset + 5, doc)
      if (t==20) {
        verticalOffset=20
      }
      verticalOffset = t
    }

    doc.save(`facets_${Date.now()}.pdf`)






  }









  var draw = function() {
    svg = d3.select("#diagram")
      .append("svg")
      .attr("width", w)
      .attr("height", h)


      //if I were cleverer, I would do this with a loop, but  whatever
      let center = [w/2, h/2]
      let top = [w/2, 5]
      let right = [w, h/2]
      let bottom = [w/2, h-5]
      let left = [0, h/2]



      //yes I could have done this with modulo, but this is more readable
      $scope.model.facets[0].points = [center, top, right]
      $scope.model.facets[1].points = [center,  bottom, right]
      $scope.model.facets[2].points = [center, bottom, left]
      $scope.model.facets[3].points = [center,  top, left]



      //select all at once
      var triangles= svg.selectAll("g")
     .data($scope.model.facets)
     .enter().append("polygon")
     //.style("stroke", function(d) {return d.colour})  // colour the line
     //.style("stroke-width", 2)
      .style("fill", function(d) {return d.fill_colour})     // remove any fill colour
      .attr("points", function(d) {return d.points})  // x,y points
     .attr("class", "facet-triangle")
     .attr("id", function(d) {return "facet-" + d.index.toString()});

     var labels = svg.selectAll("g")
     .data($scope.model.facets).enter()
     .append('text') //labels for facets
     .attr('x', function(d) {
       if(d.index < 2) {
         return d.points[1][0] + 0.2*w
       }
       return d.points[2][0] + 0.1 * w
     })//function(d){return Math.round((d.points[0][0] + d.points[2][0])/2) + (d.index<2? 25:-25)})
     .attr('y', function(d){
       start = Math.round((d.points[0][1] + d.points[1][1])/2)
       shift = 0.1*h
       if(d.index%2==0){
         shift *= -1
       }
       start+=shift
       if(d.index%3==1) {
         start += 5
       }
       return start
     })
     .text(function(d){return d.name})
     .style('fill',  function(d) {return d.fill_colour})
     .attr('class', 'facet-label')
     .attr("index", function(d){return d.index});


     //rotate labels
     svg.selectAll('text')
     .attr("transform", function(d){

       let rot = d.index%2==0? ang:-1 * ang
       return `rotate(${rot}, ${d3.select(this).attr("x")}, ${d3.select(this).attr("y")})`
     });








  }

  var onResize = function() {
    w = window.innerWidth*0.9
    h = window.innerHeight*0.98
    let val = ((h/2)-5)/(w/2)
    var ang= (Math.atan(val) * 180) / Math.PI;

    d3.select("#diagram").selectAll("*").remove();
    draw()

    //rotate labels
    //haven't quite figured out why this needs its own redraw, but anyway
    svg.selectAll('text')
    .attr("transform", function(d){

      let rot = d.index%2==0? ang:-1 * ang
      return `rotate(${rot}, ${d3.select(this).attr("x")}, ${d3.select(this).attr("y")})`
    });



  }

  angular.element($window).on('resize', function(e){
    $document.ready(function() {
      onResize()
    })
  });

  //init the diagram
  draw()


})


//for interacting with an api
//this could (should) probably live in its own file...
app.service('apiService', function($http, $q) {
  return ({
  //getComponent: getComponent,
  });
  /*
  function getComponent(slug) {
          var request = $http({
            method: "get",
            url: __env.apiUrl + slug + '?_limit=300'
          });
          return( request.then( handleSuccess, handleError ) );
  }*/

  function handleError( response ) {
    if (! angular.isObject( response.data ) ||! response.data.message) {
      return( $q.reject( "An unknown error occurred." ) );
    }
    // Otherwise, use expected error message.
    return( $q.reject( response.data.message ) );
  }

  function handleSuccess( response ) {
    return( response.data );
  }
});

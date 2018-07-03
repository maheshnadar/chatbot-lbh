myApp.directive('img', function ($compile, $parse) {
        return {
            restrict: 'E',
            replace: false,
            link: function ($scope, element, attrs) {
                var $element = $(element);
                if (!attrs.noloading) {
                    $element.after("<img src='img/loading.gif' class='loading' />");
                    var $loading = $element.next(".loading");
                    $element.load(function () {
                        $loading.remove();
                        $(this).addClass("doneLoading");
                    });
                } else {
                    $($element).addClass("doneLoading");
                }
            }
        };
    })

    .directive('hideOnScroll', function ($document) {
        return {
            restrict: 'EA',
            replace: false,
            link: function (scope, element, attr) {
                var $element = $(element);
                var lastScrollTop = 0;
                $(window).scroll(function (event) {
                    var st = $(this).scrollTop();
                    if (st > lastScrollTop) {
                        $(element).addClass('nav-up');
                    } else {
                        $(element).removeClass('nav-up');
                    }
                    lastScrollTop = st;
                });
            }
        };
    })


    .directive('fancybox', function ($document) {
        return {
            restrict: 'EA',
            replace: false,
            link: function (scope, element, attr) {
                var $element = $(element);
                var target;
                if (attr.rel) {
                    target = $("[rel='" + attr.rel + "']");
                } else {
                    target = element;
                }

                target.fancybox({
                    //arrows: true,
                    openEffect: 'fade',
                    closeEffect: 'fade',
                    closeBtn: true,
                    padding: 0,
                    helpers: {
                        media: {},
                        title: {
                            type: 'inside',
                            position: 'bottom'
                        },
                        //buttons   : {}
                    }
                });
                
            }
        };
    })

    .directive('autoHeight', function ($compile, $parse) {
        return {
            restrict: 'EA',
            replace: false,
            link: function ($scope, element, attrs) {
                var $element = $(element);
                var windowHeight = $(window).height();
                $element.css("min-height", windowHeight);
            }
        };
    })


    .directive('replace', function () {
        return {
            require: 'ngModel',
            scope: {
                regex: '@replace',
                with: '@with'
            },
            link: function (scope, element, attrs, model) {
                model.$parsers.push(function (val) {
                    if (!val) {
                        return;
                    }
                    var regex = new RegExp(scope.regex);
                    var replaced = val.replace(regex, scope.with);
                    if (replaced !== val) {
                        model.$setViewValue(replaced);
                        model.$render();
                    }
                    return replaced;
                });
            }
        };
    })

    .directive('compTranslate', function ($compile, apiService,$sce) {
        return {
            restrict: 'A',
            scope: true,
            priority: 0,
            compile: function (element, attrs) {
                var originalText = element.text();
                //var originalTooltip = attrs['tooltip'];
                //console.log(originalText);
                return {
                    pre: function (scope, element, attrs) {
                        scope.originalText = originalText;
                        //scope.originalTooltip = originalTooltip;
                    
                        
                        var translationChangeOccurred = function () {
                            attrs.$observe('compTranslate', function(value) {
                                var languageid = $.jStorage.get("language");
                                var formData = { "text": value,"language":languageid };
                                //console.log(element);
                                //element.text(value);
                                //element.html(apiService.translate(formdata));
                                if(languageid == "en")
                                {
                                    
                                    hcont=$.parseHTML(value);
                                    element.html(hcont);
                                }
                                else 
                                {
                                    apiService.translate(formData).then( function (response) {
                                        // html =$sce.trustAsHtml(response.data.data);
                                        // bindhtml = "<span ng-bind-html='"+html+"'>{{"+html+"}}<span>";
                                        //console.log(response.data.data);
                                        element.html(response.data.data);
                                    });
                                }
                                    // if (scope.originalTooltip) {
                                //     attrs.$set('tooltip', translationService.translate(scope.originalTooltip));
                                // }
                                $compile(element.contents())(scope);
                                
                            });
                        };
                        //translation changes by default while linking!
                        translationChangeOccurred();
            
                        scope.$on('$translationLanguageChanged', translationChangeOccurred);
                    },
                    post: function () {
                    }
                };
            }
        };
    })
    .directive('filterTranslate', function ($compile, apiService,$sce) {
        return {
            restrict: 'A',
            scope: true,
            priority: 0,
            compile: function (element, attrs) {
                var originalText = element.text();
                //var originalTooltip = attrs['tooltip'];
                //console.log(originalText);
                return {
                    pre: function (scope, element, attrs) {
                        scope.originalText = originalText;
                        //scope.originalTooltip = originalTooltip;
                    
                        var translationChangeOccurred = function () {
                            attrs.$observe('filterTranslate', function(value) {
                                var languageid = $.jStorage.get("language");
                                value = value.replace(new RegExp('('+$(".chatinput").val()+')', 'gi'),
                                    '<span class="highlighted"> $& </span>');
                                var formData = { "text": value,"language":languageid };
                                //console.log(element);
                                //element.text(value);
                                //element.html(apiService.translate(formdata));
                                
                                //console.log(value);
                                if(languageid == "en")
                                {
                                    
                                    hcont=$.parseHTML(value);
                                    element.html(hcont);
                                }
                                else 
                                {
                                    apiService.translate(formData).then( function (response) {
                                        // html =$sce.trustAsHtml(response.data.data);
                                        // bindhtml = "<span ng-bind-html='"+html+"'>{{"+html+"}}<span>";
                                        //console.log(response.data.data);
                                        texttoreplace = response.data.data;
                                        texttoreplace=texttoreplace.replace('<span class = \"highlighted\">', '<span class = "highlighted">'); 
                                        texttoreplace=texttoreplace.replace('</ span>', '</span>'); 
                                        element.html(texttoreplace);
                                    });
                                }
                                    // if (scope.originalTooltip) {
                                //     attrs.$set('tooltip', translationService.translate(scope.originalTooltip));
                                // }
                                $compile(element.contents())(scope);
                                
                            });
                        };
                        //translation changes by default while linking!
                        translationChangeOccurred();
            
                        scope.$on('$translationLanguageChanged', translationChangeOccurred);
                    },
                    post: function () {
                    }
                };
            }
        };
    })
    .directive('compTranslater', function ($compile, apiService,$sce) {
        return {
            restrict: 'EA',
            scope: true,
            priority: 0,
            compile: function (element, attrs) {
                var originalText = element.text();
                //var originalTooltip = attrs['tooltip'];
                //console.log(originalText);
                return {
                    pre: function (scope, element, attrs) {
                        scope.originalText = originalText;
                        //scope.originalTooltip = originalTooltip;
                    
                        var hcont = "";
                        var translationChangeOccurred = function () {
                            attrs.$observe('compTranslater', function(value) {
                                var languageid = $.jStorage.get("language");
                                contents = attrs.content;  
                                contents=contents.replace('↵',' <br> ');  
                                //contents=contents.replace(" ",' <br> '); 
                                contents = contents.replace("\n","<br>");     
                                contents = contents.replace(new RegExp("../static/data_excel/", 'g'), adminurl2+'static/data_excel/');     
                                var formData = { "text": contents,"language":languageid };
                                //element.text(value);
                                //element.html(apiService.translate(formdata));
                                if(languageid == "en")
                                {
                                    hcont=$.parseHTML(contents);
                                    element.html(hcont);
                                }
                                else 
                                {
                                    apiService.translate(formData).then( function (response) {
                                        // html =$sce.trustAsHtml(response.data.data);
                                        // bindhtml = "<span ng-bind-html='"+html+"'>{{"+html+"}}<span>";
                                        //hcont = $sce.trustAsHtml(response.data.data);
                                        hcont=$.parseHTML(response.data.data);
                                        
                                        //hcont= $compile(hcont)(scope);
                                        element.html(hcont);
                                        
                                    });
                                // if (scope.originalTooltip) {
                                //     attrs.$set('tooltip', translationService.translate(scope.originalTooltip));
                                // }
                                }
                                $compile(element.contents())(scope);
                                
                            });
                            // scope.$watch(
                            //     function(scope) {
                            //         return scope.$eval(attrs.compile);
                            //         //$compile(element.contents())(scope);
                            //     },
                            //     function(value) {
                            //         // when the 'compile' expression changes
                            //         // assign it into the current DOM
                            //         element.html(hcont);

                            //         // compile the new DOM and link it to the current
                            //         // scope.
                            //         // NOTE: we only compile .childNodes so that
                            //         // we don't get into infinite loop compiling ourselves
                            //         $compile(element.contents())(scope);
                            //     }                                    
                            // );
                        };
                        //translation changes by default while linking!
                        translationChangeOccurred();
            
                        scope.$on('$translationLanguageChanged', translationChangeOccurred);
                    },
                    post: function () {
                    }
                };
            }
        };
    })

    myApp.directive('animatefade', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $timeout(function(){
                    var fadeDuration = 2000;
                    //var onEvent = attrs.fade || "mouseover";
                    var targetElement = $(this);
                    //setInterval(anim.bind(this),800);
                    // targetElement.fadeOut(fadeDuration, function(){
                        targetElement.fadeIn(fadeDuration);                   
                    // });  
                    // See how the directive alone controls the events, not the scope
                    // element.on(onEvent, function() {
                    //     var targetElement = $('#' + attrs.fadeTarget);
                    //     targetElement.fadeOut(fadeDuration, function(){
                    //         targetElement.fadeIn(fadeDuration);                   
                    //     });                
                    // });
                },2000);
                
            }
        };
    })
    myApp.directive('formatPolicy', function(){
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        if (text.length > 16)
                        {
                            alert("Please Enter 16 Digit Order No");
                            mString = text.substring(0,text.length-1)
                            //console.log(mString);
                            $(element).val(mString);
                            return mString;
                        }
                        else
                             {
                            var transformedInput = text.replace(/[^0-9-]/g, '');
                            if (transformedInput !== text) {
                                ngModelCtrl.$setViewValue(transformedInput);
                                ngModelCtrl.$render();
                            }
                            return transformedInput;
                        }
                    }
                    return undefined;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    })
;
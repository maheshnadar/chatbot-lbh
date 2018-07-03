/**
 * Author: Nizar BOUSEBSI
 * Description: AngularJS directive to process Speech Recognition in your Cordova & Web application.
 * Usage: Add this directive in your Directives folder.
 */

angular.module('app.directives', []).directive('ngSpeechRecognitionStart', function ($timeout, $rootScope,apiService) {
	return {
		restrict: 'A',
		link: function ($scope, $element, $attrs) {
			
			// if (typeof Windows !== 'undefined' &&
			// 	typeof Windows.UI !== 'undefined' &&
			// 	typeof Windows.ApplicationModel !== 'undefined') 
			//{
			// Subscribe to the Windows Activation Event
				// $element.bind('touchstart mousedown', function (event) {
				
				// Window.UI.WebUI.WebUIApplication.addEventListener("activated", function (args) {
				// 	var activation = Window.ApplicationModel.Activation;
				// 	// Check to see if the app was activated by a voice command
				// 	if (args.kind === activation.ActivationKind.voiceCommand) {
				// 	// Get the speech reco
				// 	var speechRecognitionResult = args.result;
				// 	var textSpoken = speechRecognitionResult.text;
				// 	// Determine the command type {search} defined in vcd
				// 	if (speechRecognitionResult.rulePath[0] === "search") {
				// 		// Determine the stream name specified
				// 		if (textSpoken.includes('foo') || textSpoken.includes('Foo')) {
				// 		console.log("The user is searching for foo");
				// 		}
				// 		else if (textSpoken.includes('bar') || textSpoken.includes('Bar') ) {
				// 		console.log("The user is searching for a bar");
				// 		}
				// 		else {
				// 		console.log("Invalid search term specified by user");
				// 		}
				// 	}
				// 	else { 
				// 		console.log("No valid command specified");
				// 	}
				// 	}
				// });
				// });
			//} 
			// else {
			// console.log("Windows namespace is unavaiable");
			// }
			//if($rootScope.browser=="safari") 
			{

			if($rootScope.browser=="chrome") {
				var recognition = new window.webkitSpeechRecognition();
			} else if($rootScope.browser=="firefox") {
				//var recognition = new ( SpeechRecognition || webkitSpeechRecognition || mozSpeechRecognition)();
				var recognition = new SpeechRecognition();
			} else if($rootScope.browser=="safari") {
				var recognition = new window.msSpeechRecognition();
			}
			else if($rootScope.browser=="opera") {
				var recognition = new window.oSpeechRecognition();
			}
			else if($rootScope.browser=="msie") {
				var recognition = new window.msSpeechRecognition();
			}
			else if($rootScope.browser=="android") {
				//alert("android");
				var recognition = new window.webkitSpeechRecognition();
			}
			else if($rootScope.browser=="ios") {
				var recognition = new window.webkitSpeechRecognition();
			}
			//var recognition = new window.webkitSpeechRecognition();
			var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;

			var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
			recognition.continuous = true;
			recognition.interimResults = false;
			ignore_onend = false;
			final_transcript = '';
			recognition.lang = 'en-us';
			
			var recognitionIsAlreadyCalled = false;

			$element.bind('touchstart mousedown', function (event) {
				$scope.isHolded = true;
				$(this).addClass('hover_effect');
				// document.addEventListener("DOMContentLoaded", function(e) {
				// //window.addEventListener('permissionrequest', function(e) {
				//   console.log(e.permission);
				//   if (e.permission === 'media') {
				// 	e.request.allow();
				// 	console.log("Allow");
				//   }
				// });
				// window.AudioContext = window.AudioContext || window.webkitAudioContext;
				// var context = new AudioContext();
				// if (!navigator.getUserMedia || !navigator.webkitGetUserMedia || !navigator.mozGetUserMedia) {
				// 	navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.getUserMedia;
				// }
				// navigator.webkitGetUserMedia({audio:true}, function() {
				// 	//event.target.textContent = 'OK';
				// 	var microphone = context.createMediaStreamSource(stream);
				// 	var filter = context.createBiquadFilter();

				// 	// microphone -> filter -> destination.
				// 	microphone.connect(filter);
				// 	filter.connect(context.destination);
				// 	console.log("Allow");
				// }, function() {
				// 	console.log("Error");
				// 	//event.target.textContent = 'ERROR';
				// });
				// if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
				// 	// Firefox 38+ seems having support of enumerateDevicesx
				// 	navigator.enumerateDevices = function(callback) {
				// 		navigator.mediaDevices.enumerateDevices().then(callback);
				// 	};
				// }
				/*
				var MediaDevices = [];
				var isHTTPs = location.protocol === 'https:';
				var canEnumerate = false;

				if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
					canEnumerate = true;
				} else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
					canEnumerate = true;
				}

				var hasMicrophone = false;
				var hasSpeakers = false;
				var hasWebcam = false;

				var isMicrophoneAlreadyCaptured = false;
				var isWebcamAlreadyCaptured = false;

				function checkDeviceSupport(callback) {
					if (!canEnumerate) {
						return;
					}

					if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
						navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
					}

					if (!navigator.enumerateDevices && navigator.enumerateDevices) {
						navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
					}

					if (!navigator.enumerateDevices) {
						if (callback) {
							callback();
						}
						return;
					}

					MediaDevices = [];
					navigator.enumerateDevices(function(devices) {
						devices.forEach(function(_device) {
							var device = {};
							for (var d in _device) {
								device[d] = _device[d];
							}

							if (device.kind === 'audio') {
								device.kind = 'audioinput';
							}

							if (device.kind === 'video') {
								device.kind = 'videoinput';
							}

							var skip;
							MediaDevices.forEach(function(d) {
								if (d.id === device.id && d.kind === device.kind) {
									skip = true;
								}
							});

							if (skip) {
								return;
							}

							if (!device.deviceId) {
								device.deviceId = device.id;
							}

							if (!device.id) {
								device.id = device.deviceId;
							}

							if (!device.label) {
								device.label = 'Please invoke getUserMedia once.';
								if (!isHTTPs) {
									device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
								}
							} else {
								if (device.kind === 'videoinput' && !isWebcamAlreadyCaptured) {
									isWebcamAlreadyCaptured = true;
								}

								if (device.kind === 'audioinput' && !isMicrophoneAlreadyCaptured) {
									isMicrophoneAlreadyCaptured = true;
								}
							}

							if (device.kind === 'audioinput') {
								hasMicrophone = true;
							}

							if (device.kind === 'audiooutput') {
								hasSpeakers = true;
							}

							if (device.kind === 'videoinput') {
								hasWebcam = true;
							}

							// there is no 'videoouput' in the spec.

							MediaDevices.push(device);
						});

						if (callback) {
							callback();
						}
					});
				}

				// check for microphone/camera support!
				checkDeviceSupport(function() {
					console.log('hasWebCam: ', hasWebcam, '<br>');
					console.log('hasMicrophone: ', hasMicrophone, '<br>');
					console.log('isMicrophoneAlreadyCaptured: ', isMicrophoneAlreadyCaptured, '<br>');
					console.log('isWebcamAlreadyCaptured: ', isWebcamAlreadyCaptured, '<br>');
				});
				if (!navigator.mediaDevices.getUserMedia || !navigator.mediaDevices.webkitGetUserMedia || !navigator.mediaDevices.mozGetUserMedia) {
					navigator.mediaDevices.getUserMedia = navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.getUserMedia;
				}
				navigator.mediaDevices.getUserMedia({audio:true}, function() {
					//event.target.textContent = 'OK';
					var microphone = context.createMediaStreamSource(stream);
					var filter = context.createBiquadFilter();

					// microphone -> filter -> destination.
					microphone.connect(filter);
					filter.connect(context.destination);
					console.log("Allow");
				}, function() {
					console.log("Error");
					//event.target.textContent = 'ERROR';
				});*/
				
				$timeout(function () {
					if ($scope.isHolded) {
						$scope.$apply(function () {

							if ($attrs.ngSpeechRecognitionStart) {
								$scope.$eval($attrs.ngSpeechRecognitionStart)
								
							}

							if (recognitionIsAlreadyCalled === false) {
								recognitionIsAlreadyCalled = true;
								recognition.start();
								
								recognition.onstart = function() {
									recognizing = true;
									console.log("Started event");
								};
							}
						});
					}
				}, 600);
			});

			$element.bind('touchend mouseup', function (event) {
				$scope.isHolded = false;
				$(this).removeClass('hover_effect');
                console.log($attrs.ngSpeechRecognitionEnd);
				if ($attrs.ngSpeechRecognitionEnd) {
					
					$scope.$apply(function () {
						
						recognition.onerror = function(event) {
							if (event.error == 'no-speech') {
							ignore_onend = true;
							console.log("No speech");
							}
							if (event.error == 'audio-capture') {
							ignore_onend = true;
							console.log("No mic");
							}
							if (event.error == 'not-allowed') {
								// if (event.timeStamp - start_timestamp < 100) {
								// 	//showInfo('info_blocked');
								// } else {
								// 	//showInfo('info_denied');
								// }
								ignore_onend = true;
							}
						};
						recognition.onresult = function (event) {
                            console.log("display+--",event);
							if (event.results[0][0].transcript !== undefined) {
								$rootScope.transcript = event.results[0][0].transcript;
                                console.log($rootScope.transcript);
								if (typeof $rootScope.transcript === 'string') {
									 for (var i = event.resultIndex; i < event.results.length; ++i) {
										if (event.results[i].isFinal) {
											final_transcript += event.results[i][0].transcript;
										} else {
											interim_transcript += event.results[i][0].transcript;
										}
									}
                                    $scope.$eval($attrs.ngSpeechRecognitionEnd);
                                     console.log($attrs.ngSpeechRecognitionEnd);
								}
							}
						}
						recognition.stop();
						recognitionIsAlreadyCalled = false;
					});
				}
			});
			}
			// /else
			// {
			// 	$element.bind('touchstart mousedown', function (event) {
			// 		apiService.startRecording("").then(function (response){
            //            // console.log(response.data);
			// 			//$rootScope.autocompletelist = response.data.data;
			// 		});
			// 	});
			// 	$element.bind('touchend mouseup', function (event) {
			// 		// apiService.stopRecording("").then(function (response){
            //         //    // console.log(response.data);
			// 		// 	//$rootScope.autocompletelist = response.data.data;
			// 		// });
			// 	});
			// }
		}
	};
})
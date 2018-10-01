module.exports = function (app) {
//angular.module('window.steem.controllers', [])
console.log('controllers.js');
app.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $state, $ionicHistory, $cordovaSocialSharing, ImageUploadService, $cordovaCamera, $ionicSideMenuDelegate, $ionicPlatform, $filter, APIs, $window, $ionicPopover, $cordovaBarcodeScanner, $cordovaSplashscreen, $ionicActionSheet) {

  console.log('AppCtrl ready');

  $scope.loginData = {};

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope  }).then(function(modal) {
    $scope.loginModal = modal;
  });
  
  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.menupopover = popover;
  });

  $scope.qrScanL = function(type) {
    $ionicPlatform.ready(function() {
      $cordovaBarcodeScanner.scan({
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : false, // iOS and Android
          "prompt" : $filter('translate')('QR_TEXT'), // supported on Android only
          "formats" : "QR_CODE" // default: all but PDF_417 and RSS_EXPANDED
          //"orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
        }).then(function(barcodeData) {
        //alert(barcodeData);
        if (barcodeData.text) {
          //console.log(barcodeData);
          if (type == 'posting') {
            $scope.loginData.privatePostingKey = barcodeData.text;
          } else {
            $scope.loginData.privateActiveKey = barcodeData.text;
          }
        }

      }, function(error) {
        $rootScope.showMessage('Error',angular.toJson(error));
      });
    });
  };

  $scope.openMenuPopover = function($event) {
    //$scope.$evalAsync(function($scope){
      $scope.menupopover.show($event);
    //});
  };
  $scope.closeMenuPopover = function() {
    //$scope.$evalAsync(function($scope){
      $scope.menupopover.hide();
    //});
  };

  $rootScope.$on('close:popover', function(){
    console.log('close:popover');
    //$scope.$evalAsync(function($scope){
      $scope.menupopover.hide();
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $scope.closeMenuPopover();
    //});
    //$scope.closeMenuPopover();
    //$scope.fetchPosts();
  });

  $scope.$on('$destroy', function() {
    //$scope.menupopover.remove();
  });

  $scope.changeUsername = function(){
    $scope.loginData.username = $scope.loginData.username.replace(/@/g,'');
    $scope.loginData.username = angular.lowercase($scope.loginData.username);
    $scope.$applyAsync();
  }
  $scope.open = function(item) {
    console.log(item);
    //item.body = "";
    $rootScope.sitem = item;
    //setTimeout(function() {
    $state.go('app.post', {category: $rootScope.sitem.category, author: $rootScope.sitem.author, permlink: $rootScope.sitem.permlink});  
    //}, 1);
  };

  $rootScope.$on('openComments', function(e, args) {
    $scope.open(args.data);
  });


  $scope.advancedChange = function() {
    $rootScope.log(angular.toJson($scope.loginData.advanced));
    if ($scope.loginData.advanced) {
      $scope.loginData.password = null;
    }
  }
  $scope.closeLogin = function() {
    $scope.loginModal.hide();
  };
  
  $scope.openSignUP = function() {
    $scope.chainurl = "https://signup.steemit.com/?ref=esteem";
    window.open($scope.chainurl, '_system', 'location=yes');
    return false;  
  }
  
  $scope.openLogin = function() {
    /*if ($rootScope.$storage.language == 'ru-RU') {
      $scope.loginData.chain = "golos";
    } else {
      $scope.loginData.chain = "steem";
    }*/
    $scope.loginData.chain = "steem";
    $scope.loginModal.show();
  };

  $scope.goProfile = function() {
    $state.go("app.profile", {username:$rootScope.user.username});
    //$ionicSideMenuDelegate.toggleLeft();
  }
  $scope.sharing = function(){
    var shareSheet = $ionicActionSheet.show({
     buttons: [
       { text: $filter('translate')('REBLOG') },
       { text: $filter('translate')('INVITES') },
       { text: $filter('translate')('SHARE') },
       { text: $filter('translate')('OTHER') }
     ],
     titleText: 'eSteem',
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
        if (index === 0) {
          //$scope.share('reblog');
          $rootScope.reBlog($rootScope.sitem.author, $rootScope.sitem.permlink);
        } else if (index === 1) {
          $scope.share('invites');
        } else if (index===2){
          $scope.share('share');
        } else {
          $scope.share('other');
        }
        return true;
     }
   });
  }
  $scope.otherlinks = function(link){
    var shareSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'steemit.com' },
       { text: 'busy.org' },
       { text: 'steemd.com' },
       { text: 'steemdb.com' },
       { text: 'phist.steemdata.com' }
     ],
     titleText: 'Open',
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
        if (index === 0) {
          window.open('https://steemit.com/'+link,'_system');
        } else if (index===1){
          window.open('https://busy.org/'+link,'_system');
        } else if (index===2){
          window.open('https://steemd.com/'+link,'_system');
        } else if (index===3){
          window.open('https://steemdb.com/'+link,'_system');
        } else if (index===4){
          window.open('https://phist.steemdata.com/history?identifier=steemit.com/'+link,'_system');
        } 
        return true;
     }
   });
  }
  $scope.share = function(type) {
    var host = "";
    if ($rootScope.$storage.chain == 'steem') {
      //host = "esteem://";
      host = "esteem://";
    } else {
      host = "esteem://";
    }
    var link = host+$rootScope.sitem.category+"/@"+$rootScope.sitem.author+"/"+$rootScope.sitem.permlink;
    var message = "Hey! Checkout blog post on eSteem!";
    var subject = "Sharing via eSteem Mobile";
    var file = null;
   
    $ionicPlatform.ready(function() {

      if (type === 'invites' && window.cordova) {
        window.cordova.plugins.firebase.dynamiclinks.sendInvitation({
            deepLink: link,
            title: subject,
            message: message,
            callToActionText: 'Join'
        }, function(res){
          //console.log(res);
        }, function(err){
          //console.log(err);
        });
      } else if (type === 'share' && window.cordova) {
        $cordovaSocialSharing.share(message, subject, file, link) // Share via native share sheet
        .then(function(result) {
          // Success!
          $rootScope.log("shared");
        }, function(err) {
          // An error occured. Show a message to the user
          $rootScope.log("not shared");
        });
      } else {
        $scope.otherlinks($rootScope.sitem.category+"/@"+$rootScope.sitem.author+"/"+$rootScope.sitem.permlink);
      }
    });
    //});
  }


  $scope.loginChain = function(x){
    //console.log(x);
    $scope.loginData.chain = x;
    $rootScope.$storage.chain = x;

    localStorage.socketUrl = $rootScope.$storage["socket"+$scope.loginData.chain];
    
    //console.log(localStorage.socketUrl);

    //window.steem.config.set('websocket',localStorage.socketUrl);
    window.steem.api.setOptions({ url: localStorage.socketUrl });

    window.steem.config.set('chain_id',localStorage[$scope.loginData.chain+"Id"]);

    if ($scope.loginData.chain == 'golos') {
      window.steem.config.set('address_prefix','GLS');  
    } else {
      window.steem.config.set('address_prefix','STM');  
    }
    window.steem.api.stop();
    $rootScope.$emit('changedCurrency',{currency: $rootScope.$storage.currency, enforce: true});
  }
  
  $scope.doLogin = function() {
    $rootScope.log('Doing login');
    if ($scope.loginData.password || $scope.loginData.privatePostingKey) {
      $rootScope.$broadcast('show:loading');
      $scope.loginData.username = $scope.loginData.username.trim();
      
      if ($scope.loginData.chain !== $rootScope.$storage.chain) {
        
        var socketUrl = $rootScope.$storage["socket"+$rootScope.$storage.chain];
        
        window.steem.api.setOptions({ url: socketUrl });

      }
      var loginSuccess = false;
      window.steem.api.getAccountsAsync([$scope.loginData.username], function(err, dd){
          //console.log(err, dd);
          if (dd) {
            //$scope.$evalAsync(function( $scope ) {
            dd = dd[0];
            //console.log(dd);
            if (dd) {
              $scope.loginData.id = dd.id;
              $scope.loginData.owner = dd.owner;
              $scope.loginData.active = dd.active;
              $scope.loginData.reputation = dd.reputation;
              $scope.loginData.posting = dd.posting;
              $scope.loginData.memo_key = dd.memo_key;
              $scope.loginData.post_count = dd.post_count;
              $scope.loginData.voting_power = dd.voting_power;
              $scope.loginData.witness_votes = dd.witness_votes;
              var roles = ['posting', 'active', 'owner'];

              if ($scope.loginData.password) {

                var wif = window.steem.auth.toWif($scope.loginData.username, $scope.loginData.password, roles[0]);

                var wifIsValid = false;
                var publicWif = window.steem.auth.wifToPublic(wif);

                roles.map(function(role) {
                  if (dd[role].key_auths[0][0] === publicWif) {
                    wifIsValid = true;
                  }
                }); 

                //console.log(wifIsValid); 

                if (!wifIsValid) {
                  $rootScope.$broadcast('hide:loading');
                  $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('PASSWORD_INCORRECT'));
                } else {
                  $rootScope.$storage.user = $scope.loginData;
                  $rootScope.user = $scope.loginData;

                  $scope.loginData = {};
                  var found = false;

                  if ($rootScope.$storage.users.length>0){
                    for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
                      var v = $rootScope.$storage.users[i];
                      if (v.username == $rootScope.user.username && v.chain == $rootScope.user.chain){
                        found = true;
                      }
                    }
                  }
                  if (found) {

                  } else {
                    $rootScope.$storage.users.push($rootScope.user);  
                  }
                  $rootScope.$storage.mylogin = $scope.login;
                  $rootScope.$broadcast('hide:loading');
                  $scope.loginModal.hide();
                  
                  if (!$scope.$$phase) {
                    $scope.$apply();
                  }
                  
                  $rootScope.$broadcast('refreshLocalUserData');

                  APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.user.username, {device: ionic.Platform.platform(), timestamp: $filter('date')(new Date(), 'medium'), appversion: $rootScope.$storage.appversion}).then(function(res){  
                      
                    if ($rootScope.$storage.chain !== $rootScope.user.chain) {
                      $rootScope.$storage.chain = $rootScope.user.chain;  
                      $rootScope.$emit('changedChain');
                      $rootScope.$emit('changedCurrency', {currency: $rootScope.$storage.currency, enforce: true});
                    }
                    //$scope.$applyAsync();

                    $scope.$evalAsync( function() {
                      $window.location.reload(true);  
                    });
                    
                    //Buffer = require('buffer').Buffer;
                    //$state.go('app.posts',{renew:true},{reload: true});
                    
                    $rootScope.$broadcast('fetchPosts');
                  });
                  
                }
              } else {

                var wif = window.steem.auth.isWif($scope.loginData.privatePostingKey)
                  ? $scope.loginData.privatePostingKey
                  : '';

                var wifIsValid = false;
                var publicWif = window.steem.auth.wifToPublic(wif);

                roles.map(function(role) {
                  if (dd[role].key_auths[0][0] === publicWif) {
                    wifIsValid = true;
                  }
                }); 

                //console.log(wifIsValid);


                if (wifIsValid) {
                  loginSuccess=true;
                } else {
                  loginSuccesss=false;
                }
                if (!loginSuccess) {
                    $rootScope.$broadcast('hide:loading');
                    $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('PASSWORD_INCORRECT'));
                } else {
                  $rootScope.$storage.user = $scope.loginData;
                  $rootScope.user = $scope.loginData;

                  $scope.loginData = {};
                  var found = false;

                  if ($rootScope.$storage.users.length>0){
                    for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
                      var v = $rootScope.$storage.users[i];
                      if (v.username == $rootScope.user.username && v.chain == $rootScope.user.chain){
                        found = true;
                      }
                    }
                  }
                  if (found) {

                  } else {
                    $rootScope.$storage.users.push($rootScope.user);  
                  }
                  if (!$scope.$$phase) {
                    $scope.$apply();
                  }
                  
                  $rootScope.$storage.mylogin = $scope.login;
                  $rootScope.$broadcast('refreshLocalUserData');

                  APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.user.username, {device: ionic.Platform.platform(), timestamp: $filter('date')(new Date(), 'medium'), appversion: $rootScope.$storage.appversion}).then(function(res){
                    $rootScope.$broadcast('hide:loading');
                    $scope.$applyAsync();
                    $scope.loginModal.hide();
                    
                      
                    if ($rootScope.$storage.chain !== $rootScope.user.chain) {
                      $rootScope.$storage.chain = $rootScope.user.chain;  
                      $rootScope.$emit('changedChain');
                      $rootScope.$emit('changedCurrency', {currency: $rootScope.$storage.currency, enforce: true});
                    }

                    //setTimeout(function() {
                      //$window.location.reload(true);
                      $state.go('app.posts',{renew:true},{reload: true});
                      $rootScope.$broadcast('fetchPosts');
                    //}, 100);

                  });
                  $scope.$applyAsync();
                }
              }
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('PASSWORD_INCORRECT'));
            }
            
          //});
        }
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });      
    } else {
      $scope.loginModal.hide();
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_FAIL'));
    }
  };

  $scope.selectAccount = function(user) {
    $rootScope.$storage.user = user;
    $rootScope.user = user;

    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    if ($rootScope.$storage.chain !== user.chain) {
      $scope.data = {};
      $rootScope.$storage.chain = user.chain;  
      $rootScope.$broadcast('changedChain');
    }
    setTimeout(function() {
    //$scope.$evalAsync(function( $scope ) {
      $rootScope.$emit('changedCurrency', {currency: $rootScope.$storage.currency, enforce: true});
    
      $rootScope.$broadcast('refreshLocalUserData');  
    //});
    }, 10);
    
    
    setTimeout(function() {
    //$scope.$evalAsync(function( $scope ) {
      //$window.location.reload(true);
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
      $state.go('app.posts',{renew:true},{reload: true});
    //});
    }, 2);
  }

  $rootScope.$on('refreshLocalUserData', function() {
    $rootScope.log('refreshLocalUserData');
    if ($rootScope.user && $rootScope.user.username && $rootScope.user.chain == $rootScope.$storage.chain) {
      window.steem.api.getAccountsAsync([$rootScope.user.username], function(err, dd){
        if (dd) {
          dd = dd[0];
          if (dd && dd.json_metadata) {
            dd.json_metadata = angular.fromJson(dd.json_metadata);
          }
          angular.merge($rootScope.$storage.user, dd);
          $rootScope.user = $rootScope.$storage.user;

          $scope.mcss = ($rootScope.user.json_metadata && $rootScope.user.json_metadata.profile && $rootScope.user.json_metadata.profile.cover_image) ? {'background': 'url('+$rootScope.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'center center', 'color': 'white', 'box-shadow':'inset 0 0 0 2000px rgba(41,75,120,0.7)'} : {'background-color': '#284b78', 'color': 'white'};

          //full-image
          
          $scope.$applyAsync();

        }
      });
    }
  })

  $scope.openPostModal = function() {
    $state.go('app.posts');
    $rootScope.$broadcast('openPostModal');
  }
  $scope.changeFeed = function() {
    if ($rootScope.$storage.feedview) {
      $scope.changeView('compact');
    } else {
      $scope.changeView('card');
    }
  }
  $scope.changeView = function(view) {
    $rootScope.$broadcast('changeView');
    $rootScope.$storage.view = view;
  }
  $scope.changeTheme = function(){
    if ($rootScope.$storage.mode) {
      $scope.changeLight('night');
    } else {
      $scope.changeLight('day');
    }
  }
  $scope.changeLight = function(light) {
    $rootScope.$storage.theme = light;
    $rootScope.$broadcast('changeLight');
  }

  $scope.$on("$ionicView.loaded", function(){
    $scope.theme = $rootScope.$storage.theme||'day';
    console.log('loaded');
  });

  // get app version
  $ionicPlatform.ready(function(){
    if (window.cordova) {
      cordova.getAppVersion.getVersionNumber(function (version) {
        $rootScope.$storage.appversion = version;
      });
    } else {
      $rootScope.$storage.appversion = '1.6.0';
    }
  });

  $scope.logout = function() {
    for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
      var v = $rootScope.$storage.users[i];
      $rootScope.user = $rootScope.$storage.user;
      if (v.chain == $rootScope.user.chain && v.username == $rootScope.user.username) {
        $rootScope.$storage.users.splice(i,1);
      }
    };
    if ($rootScope.$storage.users.length>1) {
      $rootScope.$storage.user = $rootScope.$storage.users[0];  
      $rootScope.user = $rootScope.$storage.user;

      for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
        var v = $rootScope.$storage.users[i];
        if (v.chain == $rootScope.$storage.chain) {
          $rootScope.$storage.user = $rootScope.$storage.users[i];  
          $rootScope.user = $rootScope.$storage.user;
        }
      }
    } else {
      $rootScope.$storage.user = undefined;
      $rootScope.$storage.user = null;
      $rootScope.user = undefined;
      $rootScope.user = null;

      $rootScope.$storage.mylogin = undefined;
      $rootScope.$storage.mylogin = null;
    }
    //make sure user credentials cleared.
    if ($rootScope.$storage.deviceid) {
      APIs.deleteSubscription($rootScope.$storage.deviceid).then(function(res){
        $ionicSideMenuDelegate.toggleLeft();
        //$window.location.reload(true);
        $state.go('app.posts',{renew:true},{reload: true});
      });
    } else {
      $ionicSideMenuDelegate.toggleLeft();
      //$window.location.reload(true);
      $state.go('app.posts',{renew:true},{reload: true});
    }
    $rootScope.$storage.filter = undefined;
    $rootScope.$storage.tag = undefined;

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
  };
  $scope.data = {};
  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope,
    animation: 'slide-in-down'
  }).then(function(modal) {
    $scope.smodal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeSmodal = function() {
    $scope.smodal.hide();
    $scope.$applyAsync();
  };

  // Open the login modal
  $scope.openSmodal = function() {
    //if(!$scope.smodal) return;
    $scope.data.searchResult = [];
    $rootScope.$broadcast('close:popover');
    setTimeout(function() {
    //$scope.$evalAsync(function( $scope ) {
      $scope.data.type="tag";
      //console.log($scope.data.searchResult);
      window.steem.api.getStateAsync("/tags", function(err, res) {
        $scope.smodal.show();
        if (res) {
          angular.forEach(res.tags, function(k,v){
            if (v) {
              if (!(v.indexOf("'")>-1 || v.indexOf("#")>-1)) {
                $scope.data.searchResult.push(k);
              }
            }
          });
        }
      });
    //});
    });
    
  };
  $scope.clearSearch = function() {
    if ($rootScope.$storage.tag) {
      console.log('clear tag');
      $rootScope.$storage.tag = undefined;
      $rootScope.$storage.taglimits = undefined;
      $scope.mymenu?$scope.mymenu.shift():true;
      $rootScope.$broadcast('close:popover');
      //$rootScope.$broadcast('fetchPosts');
      $rootScope.$broadcast('filter:change');
    }
  };
  $scope.showMeExtra = function() {
    if ($scope.showExtra) {
      $scope.showExtra = false;
    } else {
      $scope.showExtra = true;
    }
  }
  $scope.search = function() {
    $rootScope.log('Doing search '+$scope.data.search);
    $scope.data.search = angular.lowercase($scope.data.search);
    setTimeout(function() {
    //$scope.$evalAsync(function( $scope ) {
      if ($scope.data.search.length > 1) {
        if ($scope.data.type == "tag"){
          window.steem.api.getTrendingTagsAsync($scope.data.search, 15, function(err, result) {
            //console.log(err, result);
            $scope.data.searchResult = result;
            $scope.$applyAsync();
          });
        }
        if ($scope.data.type == "user"){
          var ee = [];
          window.steem.api.lookupAccountsAsync($scope.data.search, 15, function(err, result) {
            //console.log(err, result);
            if (result){
              $scope.data.searchResult = result;
            }
            $scope.$applyAsync();
          });
        }
        if ($scope.data.type == "posts"){
          APIs.search($scope.data.search).then(function(res){
            //console.log(res);
            if (res.data.results.length>0){
              console.log(res);
              $scope.data.searchResult = res.data.results;
            }
          });
        }
      }
    //});
    });

  };
  $scope.typechange = function() {
    $scope.data.searchResult = undefined;
    $scope.$applyAsync();
    $rootScope.log("changing search type");
  }
  $scope.openTag = function(xx, yy) {
    $rootScope.log("opening tag "+xx);
    $rootScope.$storage.tag = xx;
    $rootScope.$storage.filter = 'created';
    $rootScope.$storage.taglimits = yy;
    if ($scope.smodal.isShown()){
      $scope.closeSmodal();
    }
    if ($scope.mymenu) {
      $scope.mymenu.unshift({text:'#'+xx, custom:'tag'});  
    }
    $rootScope.$broadcast('close:popover');
    //$rootScope.$broadcast('filter:change');
    $state.go("app.posts", {tags: xx});
  };
  $scope.openUser = function(xy) {
    $rootScope.log("opening user "+xy);
    $scope.closeSmodal();
    $rootScope.$broadcast('close:popover');
    $state.go("app.profile", {username: xy});
  };

  $scope.isBookmarked = function() {
    var bookm = $rootScope.$storage.bookmark || undefined;
    if (bookm && $rootScope.sitem) {
      var len = bookm.length;
      for (var i = 0; i < len; i++) {
        if (bookm[i] && bookm[i].permlink === $rootScope.sitem.permlink) {
          return true;
        }
      }
    } else {
      return false;
    }
  };
  $scope.bookmark = function() {
    var book = $rootScope.$storage.bookmark;
    if ($scope.isBookmarked()) {
      var len = book.length;
      var id = undefined;
      for (var i = 0; i < len; i++) {
        if (book[i].permlink === $rootScope.sitem.permlink) {
          id = book[i]._id;
          book.splice(i, 1);
        }
      }
      if (id){
        APIs.removeBookmark(id,$rootScope.user.username).then(function(res){
          $rootScope.$storage.bookmark = book;
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_UNBOOKMARK'));
        });
      }
    } else {
      if (book) {
        var oo = { author:$rootScope.sitem.author,permlink:$rootScope.sitem.permlink};
        $rootScope.$storage.bookmark.push(oo);
        APIs.addBookmark($rootScope.user.username, oo ).then(function(res){
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
        });
      } else {
        var oo = { author:$rootScope.sitem.author,permlink:$rootScope.sitem.permlink, timestamp: (new Date()).getTime()};
        $rootScope.$storage.bookmark = [oo];

        APIs.addBookmark($rootScope.user.username, oo ).then(function(res){
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
        });
      }
      //$rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
    }
  };
  $scope.favor = function() {
    var fav = $rootScope.$storage.fav;
    if ($scope.isfavor()) {
      var len = fav.length;
      var id = undefined;
      for (var i = 0; i < len; i++) {
        if (fav[i].account === $rootScope.sitem.author) {
          id = fav[i]._id;
          fav.splice(i, 1);
        }
      }
      if (id){
        APIs.removeFavorite($rootScope.user.username,id).then(function(res){
          $rootScope.$storage.fav = fav;
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('FAVORITE_REMOVED'));
        });
      }
    } else {
      if (fav) {
        var oo = { account:$rootScope.sitem.author};
        $rootScope.$storage.fav.push(oo);
        APIs.addFavorite($rootScope.user.username, oo.account ).then(function(res){
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('FAVORITE_ADDED'));
        });
      } else {
        var oo = { account:$rootScope.sitem.author};
        $rootScope.$storage.fav = [oo];

        APIs.addFavorite($rootScope.user.username, oo.account ).then(function(res){
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('FAVORITE_ADDED'));
        });
      }
      //$rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
    }
  }
  $scope.isfavor = function() {
    var isfav = $rootScope.$storage.fav || undefined;
    if (isfav && $rootScope.sitem) {
      var len = isfav.length;
      for (var i = 0; i < len; i++) {
        if (isfav[i] && isfav[i].account === $rootScope.sitem.author) {
          return true;
        }
      }
    } else {
      return false;
    }
  }

})
//eappctrl
app.controller('SendCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval, $filter, $q, $cordovaBarcodeScanner, $ionicPlatform, $ionicModal, APIs) {

  if ($rootScope.$storage.chain == "steem") {
    $scope.data = {types: [{type: "steem", name:"Steem", id:1},{type: "sbd", name:"Steem Dollar", id:2}, {type: "sp", name:"Steem Power", id:3}], type: "steem", amount: 0.001, etypes: [{type: "approve", name: $filter('translate')("APPROVE"), id:1},{type: "dispute", name: $filter('translate')("DISPUTE"), id:2},{type: "release", name: $filter('translate')("RELEASE"), id:3}]};
  } else {
    $scope.data = {types: [{type: "golos", name: "ГОЛОС", id:1},{type: "gbg", name:"ЗОЛОТОЙ", id:2}, {type: "golosp", name:"СИЛА ГОЛОСА", id:3}], type: "golos", amount: 0.001, etypes: [{type: "approve", name: $filter('translate')("APPROVE"), id:1},{type: "dispute", name: $filter('translate')("DISPUTE"), id:2},{type: "release", name: $filter('translate')("RELEASE"), id:3}]};
  }
  $scope.ttype = 'transfer';
  $scope.changeTransfer = function(type){
    $scope.ttype = type;
    $scope.data.advanced = false;
  }
  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openUModal = function() {
    $scope.modal.show();
  };
  $scope.closeUModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  $scope.showLiquid = function (token) {
    return token.type !== $filter('lowercase')($rootScope.$storage.platformpunit);
  }
  $scope.searchUser = function(query) {
    return window.steem.api.lookupAccounts(query, 15, function(err, result) {
      if (result){
        return result;
      }
    });
  }
  $scope.selectAgent = function(agent) {
    $scope.data.agent = agent;
    $scope.$applyAsync();
    $scope.closeUModal();
  }
  $scope.getUserAgent = function(query){
    query = angular.lowercase(query);
    $scope.res = [];
    if (query) {
      window.steem.api.lookupAccountNames([query], function(err, result) {
        //console.log(err, result);
        if (result) {
          var dd = result[0];
          if (dd && dd.json_metadata) {
            var vv = angular.fromJson(dd.json_metadata);
            if (vv.escrow) {
              console.log('escrow');
              $scope.res.push({name: query, escrow: vv.escrow});
            } else {
              console.log('noescrow');
              $scope.res.push({name: query, escrow: {terms: "-", fees: {"STEEM": 0.001, "SBD": 0.001, "GBG": 0.001, "GOLOS": 0.001}} });
            }
          }
        }
      });
     
      //$scope.$evalAsync(function( $scope ) {
        if (query && $scope.res) {
          $scope.data.searchResult = $scope.res;
        } else {
          $scope.data.searchResult = [];  
        }
      //});
    }
  }
  $scope.changeUsername = function(typed) {
    $rootScope.log('searching');
    $scope.data.username = angular.lowercase($scope.data.username);
    window.steem.api.lookupAccountNames([$scope.data.username], function(err, result) {
      //console.log(err, result);
      if (result) {
        $scope.susers = result[0];
        $scope.$applyAsync(); 
      }
    });
  }
  $scope.qrScan = function() {
    $ionicPlatform.ready(function() {
      $cordovaBarcodeScanner.scan({
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : false, // iOS and Android
          "prompt" : $filter('translate')('QR_TEXT'), // supported on Android only
          "formats" : "QR_CODE" // default: all but PDF_417 and RSS_EXPANDED
          //"orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
        }).then(function(barcodeData) {
        //alert(barcodeData);
        if (barcodeData.text.indexOf('?amount')>-1) {
          //steem dollar:blocktrades?amount=12.080

          $scope.data.username = barcodeData.text.split(':')[1].split('?')[0].trim();
          $scope.data.amount = Number(barcodeData.text.split('=')[1]);
          if (barcodeData.text.split(':')[0]==='steem dollar') {
            $scope.data.type = 'sbd';
          }
          if (barcodeData.text.split(':')[0]==='steem') {
            $scope.data.type = 'steem';
          }
          if (barcodeData.text.split(':')[0]==='steem power') {
            $scope.data.type = 'sp';
          }

        } else {
          $scope.data.username = barcodeData.text;
        }
        $scope.changeUsername();
      }, function(error) {
        $rootScope.showMessage('Error',angular.toJson(error));
      });
    });
  };
  $scope.advancedEChange = function(){
    console.log('advancedEChange', $scope.data.advanced);
    $scope.data.etype = "";
    $scope.escrow = {};
    $scope.$applyAsync();
  }
  $scope.actionEChange = function(){
    console.log('actionEChange', $scope.data.etype);
    $scope.$applyAsync();
  }

  $scope.escrowAction = function(){
    //console.log($scope.data.etype);
    if ($scope.data.etype && $scope.escrow.escrow_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('CONFIRMATION'),
        template: ""
      });
      confirmPopup.then(function(res) {
        if(res) {
          $rootScope.log('You are sure');
          $rootScope.$broadcast('show:loading');

          var wif = $rootScope.user.password
          ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
          : $rootScope.user.privateActiveKey;

          if ($scope.data.etype == "approve") {

            window.steem.broadcast.escrowApprove(wif, $scope.escrow.from, $scope.escrow.to, $scope.escrow.agent, $rootScope.user.username, $scope.escrow.escrow_id, true, function(err, result) {
              //console.log(err, result);
              if (err) {
                var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message);
              } else {
                $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                  $scope.data.type=$rootScope.$storage.chain;
                  $scope.data.amount= 0.001;
                });
              }
            });
          } else if ($scope.data.etype == "dispute") {
            window.steem.broadcast.escrowDispute(wif, $scope.escrow.from, $scope.escrow.to, $scope.escrow.agent, $rootScope.user.username, $scope.escrow.escrow_id, function(err, result) {
              //console.log(err, result);
              if (err) {
                var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message);
              } else {
                $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                  $scope.data.type=$rootScope.$storage.chain;
                  $scope.data.amount= 0.001;
                });
              }
            });
          } else if ($scope.data.etype == "release") {
            window.steem.broadcast.escrowRelease(wif, $scope.escrow.from, $scope.escrow.to, $scope.escrow.agent, $rootScope.user.username, $scope.escrow.receiver, $scope.escrow.escrow_id, $scope.escrow.sbd_amount+" "+angular.uppercase($rootScope.$storage.platformdunit),
              $scope.escrow.steem_amount+" "+angular.uppercase($rootScope.$storage.platformlunit), function(err, result) {
              //console.log(err, result);
              if (err) {
                var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message);
              } else {
                $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                  $scope.data.type=$rootScope.$storage.chain;
                  $scope.data.amount= 0.001;
                });
              }
            });
          }
        }
      });
    } 
  }
  $scope.escrow = {};
  $scope.searchEscrowID = function(id){
    if (id.length>3){
      APIs.searchEscrow(id).then(function(res){
        console.log(res);
        if (res.data.length>0) {
          $scope.escrow = res.data[0];
          $scope.escrow.json_meta = angular.fromJson($scope.escrow.json_meta);  
        }
      });  
    }
  }
  $scope.transfer = function (type) {
    if ($rootScope.user) {

      if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('ACTIVE_KEY_REQUIRED_TEXT'));
      } else {
        if ($scope.data.type === 'sbd' || $scope.data.type === 'gbg') {
          if ($scope.data.amount > Number($scope.balance.sbd_balance.split(" ")[0])) {
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('BALANCE_TEXT'));
          } else {
            $scope.okbalance = true;
          }
        }
        if ($scope.data.type === 'sp' || $scope.data.type === 'steem' || $scope.data.type === 'golos' || $scope.data.type === 'golosp') {
          if ($scope.data.amount > Number($scope.balance.balance.split(" ")[0])) {
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('BALANCE_TEXT'));
          } else {
            $scope.okbalance = true;
          }
        }
        if (!$scope.susers || $scope.susers.name !== $scope.data.username) {
          $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('NONEXIST_USER'));
        } else {
          $scope.okuser = true;
        }
        if ($scope.okbalance && $scope.okuser) {
          var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('CONFIRMATION'),
            template: $filter('translate')('TRANSFER_TEXT')
          });

          confirmPopup.then(function(res) {
            if(res) {
              $rootScope.log('You are sure');
              $rootScope.$broadcast('show:loading');
              
              if (type == 'transfer') {
                var wif = $rootScope.user.password
                ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
                : $rootScope.user.privateActiveKey;

                if ($scope.data.type !== 'sp' && $scope.data.type !== 'golosp') {
                  var tt = $filter('number')($scope.data.amount, 3) +" "+angular.uppercase($scope.data.type);
                  window.steem.broadcast.transferAsync(wif, $rootScope.user.username, $scope.data.username, tt, $scope.data.memo || "", function(err, result) {
                    //console.log(err, result);
                    if (err) {
                      var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                      $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
                    } else {
                      $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                        $scope.data.type=$rootScope.$storage.chain;
                        $scope.data.amount= 0.001;
                      });
                    }
                  });
                } else {
                  var tt = $filter('number')($scope.data.amount, 3) + " "+$filter('uppercase')($rootScope.$storage.chain);
                  
                  window.steem.broadcast.transferToVesting(wif, $rootScope.user.username, $scope.data.username, tt, function(err, result) {
                    //console.log(err, result);
                    if (err) {
                      var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                      $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
                    } else {
                      $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                        $scope.data.type=$rootScope.$storage.chain;
                        $scope.data.amount= 0.001;
                      });
                    }
                });
              }
            }
            if (type == 'escrow') {
              var wif = $rootScope.user.password
              ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
              : $rootScope.user.privateActiveKey;
               
              var escrow_id = (new Date().getTime())>>>0;
              var tt = $filter('number')($scope.data.amount, 3) +" "+angular.uppercase($scope.data.type);
              var sbd = ($scope.data.type=='sbd'||$scope.data.type=='gbg')?tt:("0.000 "+angular.uppercase($rootScope.$storage.platformdunit));
              var stem = ($scope.data.type=='steem'||$scope.data.type=='golos')?tt:("0.000 "+angular.uppercase($rootScope.$storage.platformlunit));
              var fe = $scope.data.agent.escrow.fees[angular.uppercase($scope.data.type)]+" "+angular.uppercase($scope.data.type);
              var rt = new Date($scope.data.ratification);
              var et = new Date($scope.data.expiration);
              var jn = {
                terms: $scope.data.agent.escrow.terms, 
                memo: ($scope.data.memo||"")+" "+escrow_id
              }
              
              window.steem.broadcast.escrowTransfer(wif, $rootScope.user.username, $scope.data.username, $scope.data.agent.name, escrow_id, sbd, stem, fe, rt, et, angular.toJson(jn), function(err, result) {
                //console.log(err, result);
                if (err) {
                  var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                  $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message);
                } else {
                  $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED') + " "+$filter('translate')('ESCROW')+" "+$filter('translate')('ID')+": "+escrow_id).then(function(){
                    $scope.data.type=$rootScope.$storage.chain;
                    $scope.data.amount= 0.001;
                  });
                }
              });
            } 
            $rootScope.$broadcast('hide:loading');
          }
        });
      }
    }
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  };


  $scope.refresh = function() {
    $rootScope.$broadcast('show:loading');
    window.steem.api.getAccountsAsync([$rootScope.user.username], function(err, dd){
        //console.log(err, dd);
        $scope.balance = dd[0];
        //console.log($scope.balance);
        $rootScope.$broadcast('hide:loading');
        $scope.$applyAsync();
    });
    $rootScope.$broadcast('hide:loading');
  }
  $scope.$on('$ionicView.beforeEnter', function(){
    window.steem.api.getAccountsAsync([$rootScope.user.username], function(err, dd){
      $scope.balance = dd[0];
      $scope.$applyAsync();
    });
  });

});
app.controller('PostsCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval, $ionicScrollDelegate, $ionicModal, $filter, $stateParams, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicPlatform, $cordovaCamera, ImageUploadService, $filter, $ionicHistory, APIs, $translate, $compile) {

  console.log('PostsCtrl ready');

  $scope.translations = {};

  $scope.translations.menu = $translate.instant('MENU');
  $scope.translations.options = $translate.instant('OPTIONS');
  $scope.translations.pull = $translate.instant('PULL_DOWN_TO_REFRESH');
  $scope.translations.resteem = $translate.instant('RESTEEMED_BY');
  $scope.translations.by = $translate.instant('BY');
  $scope.translations.in = $translate.instant('IN');
  $scope.translations.min = $translate.instant('MIN_READ');
  $scope.translations.upvote = $translate.instant('UPVOTE');
  $scope.translations.unvote = $translate.instant('UNVOTE');
  $scope.translations.bookmark = $translate.instant('BOOKMARK');
  $scope.translations.favoriteAuthor = $translate.instant('FAVORITE_AUTHOR');
  $scope.translations.share = $translate.instant('SHARE');


  var formatToPercentage = function (value) {
    return value + '%';
  };

  $scope.pslider = {
    value: $rootScope.$storage.voteWeight/100,
    options: {
      floor: 1,
      ceil: 100,
      hideLimitLabels: true
      //translate: formatToPercentage,
      //showSelectionBar: true,
    }
  };

  $ionicPopover.fromTemplateUrl('popoverSlider.html', {
      scope: $scope
  }).then(function(popover) {
      $scope.tooltipSlider = popover;
  });
  
  $scope.openSlider = function($event, d) {
    $scope.votingPost = d;
    $scope.$applyAsync();
    $scope.rangeValue = $rootScope.$storage.voteWeight/100;
    $scope.tooltipSlider.show($event);
  };
  $scope.drag = function(v) {
    //console.log(v);
    $rootScope.$storage.voteWeight = v*100;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    if (!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  }
  $scope.votePostS = function() {
    $scope.tooltipSlider.hide();
    $scope.votePost($scope.votingPost);
  }
  $scope.closeSlider = function() {
    $scope.tooltipSlider.hide();
  };

  $scope.options = {
    loop: false,
    speed: 500,
    /*pagination: false,*/
    showPager: false,
    slidesPerView: 3,
    spaceBetween: 20,
    breakpoints: {
      1024: {
          slidesPerView: 5,
          spaceBetween: 15
      },
      768: {
          slidesPerView: 4,
          spaceBetween: 10
      },
      640: {
          slidesPerView: 3,
          spaceBetween: 5
      },
      320: {
          slidesPerView: 3,
          spaceBetween: 3
      }
    }
  }


  $rootScope.$on('filter:change', function() {
    //$rootScope.$broadcast('show:loading');
    $rootScope.log($rootScope.$storage.filter);
    var type = $rootScope.$storage.filter || "trending";
    var tag = $rootScope.$storage.tag || "";
    console.log(type, $scope.limit, tag);
    $scope.fetchPosts(type, $scope.limit, tag);
  });

  $scope.filterChanged = function(t) {
    var fil = $scope.mymenu[t].custom;
    if (fil == 'tag'){
      //$rootScope.$storage.tag = $scope.mymenu[t].text.substring(1);
      $rootScope.$storage.tag = undefined
      $scope.mymenu.shift();
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    } else {
      $rootScope.$storage.filter = fil;
      for (var i = 0, len = $scope.mymenu.length; i < len; i++) {
        var v = $scope.mymenu[i];
        if (v.custom == fil) {
          $rootScope.$storage.filterName = v.text;
        }
      }
    }
    $scope.data = [];
    $scope.error = false;
    $rootScope.$broadcast('filter:change');
  }
  $scope.showFilter = function() {
    var filterSheet = $ionicActionSheet.show({
     buttons: $scope.mymenu,
     titleText: $filter('translate')('SORT_POST_BY'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
        $scope.filterChanged(index);
        return true;
     }
    });
  }

  $ionicPopover.fromTemplateUrl('popoverT.html', {
      scope: $scope
  }).then(function(popover) {
    $scope.tooltip = popover;
  });

  $scope.openTooltip = function($event, d) {
    var tppv = Number(d.pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
    var tpv = Number(d.total_payout_value.split(' ')[0]+d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var ar = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var pout = d.last_payout=="1970-01-01T00:00:00"?d.cashout_time:d.last_payout;
    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PROMOTED')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(p,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('AUTHOR_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(ar,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('CURATION_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(crp,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(pout, true)+"</div></div>";
    $scope.tooltipText = texth;
    $scope.$applyAsync();
    $scope.tooltip.show($event);
  };

  $scope.closeTooltip = function() {
      $scope.tooltip.hide();
  };

  $ionicPopover.fromTemplateUrl('extraMenu.html', {
      scope: $scope
  }).then(function(popover) {
    $scope.extras = popover;
  });

  $scope.openExtraMenu = function($event, d) {
    console.log(d);
    $rootScope.sitem = d;
    $scope.extras.show($event);
  };

  $scope.closeExtraMenu = function() {
      $scope.extras.hide();
  };


   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.tooltip.remove();
      $scope.extras.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
      $scope.tooltipText = undefined;
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });


  


  $ionicModal.fromTemplateUrl('templates/story.html', { scope: $scope  }).then(function(modal) {
      $scope.modalp = modal;
  });
  $scope.lastFocused;

  $rootScope.$on('openPostModal', function() {

    $rootScope.$broadcast('close:popover');

    $scope.spost = $rootScope.$storage.spost || $scope.spost;

    $scope.spost.permission=$scope.hasPermission($rootScope.user);

    setTimeout(function(){
    //$scope.$evalAsync(function( $scope ) {
      if (!$scope.spost.operation_type) {
        $scope.spost.operation_type = 'default';
      }
      $scope.tagsChange();

      $scope.modalp.show();
      /*angular.element("textarea").focus(function() {
        $scope.lastFocused = document.activeElement;
        //console.log(document);
      });*/
    //});
    }, 1);
    //$scope.modalp.show();
  });

  $rootScope.$on('closePostModal', function() {

    if ($scope.pmodal)
      $scope.pmodal.hide();
    if ($scope.modalp)
      $scope.modalp.hide();
  });

  $scope.closePostModal = function() {
    //$rootScope.$broadcast('hide:loading');
    //$scope.closePostModal();

    $rootScope.$emit('closePostModal');
    $rootScope.$broadcast('close:popover');

    if ($scope.pmodal)
      $scope.pmodal.hide();
    if ($scope.modalp)
      $scope.modalp.hide();
  };


  $scope.cfocus = function(){
    console.log('cfocus');
    $scope.lastFocused = document.activeElement;
  }

  //http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
  $scope.insertText = function(text, position) {
    var input = $scope.lastFocused;
    //console.log(input);
    input.focus();
    if (input == undefined) { return; }
    var scrollPos = input.scrollTop;
    var pos = 0;
    var browser = ((input.selectionStart || input.selectionStart == "0") ?
                   "ff" : (document.selection ? "ie" : false ) );
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart ("character", -input.value.length);
      pos = range.text.length;
    }
    else if (browser == "ff") { pos = input.selectionStart };

    var front = (input.value).substring(0, pos);
    var back = (input.value).substring(pos, input.value.length);
    input.value = front+text+back;
    pos = pos + text.length;
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart ("character", -input.value.length);
      range.moveStart ("character", pos);
      range.moveEnd ("character", 0);
      range.select();
    }
    else if (browser == "ff") {
      input.selectionStart = pos;
      input.selectionEnd = pos;
      input.focus();
    }
    //input.focus();
    input.scrollTop = scrollPos;
    angular.element(input).trigger('input');
  }


  $scope.showImg = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: $filter('translate')('CAPTURE_PICTURE') },
       { text: $filter('translate')('SELECT_PICTURE') },
       { text: $filter('translate')('SET_CUSTOM_URL') },
       { text: $filter('translate')('GALLERY') }
     ],
     titleText: $filter('translate')('INSERT_PICTURE'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
        $scope.insertImage(index);
        return true;
     }
   });
  };
  $scope.insertImage = function(type) {
    var options = {};

    if (type == 0 || type == 1) {
      options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: (type===0)?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: (type===0)?true:false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        //$scope.$evalAsync(function( $scope ) {
          ImageUploadService.uploadImage(imageData).then(function(result) {
            //var url = result.secure_url || '';
            console.log(result);
            var url = result.url || '';
            var final = " ![image](" + url + ")";
            
            
            if (url) {
                APIs.addMyImage($rootScope.user.username, url).then(function(res){
                  if (res)
                    console.log('saved image to db');
                });
              }

            $scope.insertText(final);
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          },
          function(err) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('UPLOAD_ERROR'));
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          });
        //});
      }, function(err) {
        $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('CAMERA_CANCELLED'));
      });
    } else if (type == 2){
      $ionicPopup.prompt({
        title: $filter('translate')('SET_URL'),
        template: $filter('translate')('DIRECT_LINK_PICTURE'),
        inputType: 'text',
        inputPlaceholder: 'http://example.com/image.jpg'
      }).then(function(res) {
        $rootScope.log('Your url is' + res);
        if (res) {
          var url = res.trim();
          var final = " ![image](" + url + ")";
          /*if ($scope.spost.body) {
            $scope.spost.body += final;
          } else {
            $scope.spost.body = final;
          }*/
          $scope.insertText(final);
        }
      });
    } else {
      $scope.gallery = [];
      APIs.fetchImages($rootScope.user.username).then(function(res){
        var imgs = res.data;
        if (imgs.length>0){
          $scope.showgallery = true;
          $scope.gallery.images = imgs;
        } else {
          $scope.showgallery = false;
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('NO_IMAGE'));
          console.log('no images available')
        }
      });
    }
  };
  $scope.closeGallery = function(){
    $scope.showgallery = false;
  }
  $scope.manageGallery = function(){
    $rootScope.$emit('closePostModal');
    $state.go('app.images');
  }
  function slug(text) {
    return getSlug(text, {truncate: 128});
  };
  function makernd() {
    return (Math.random()+1).toString(16).substring(2);
  }
  function createPermlink(title) {
    var permlink;
    var t = new Date();
    var timeformat = makernd();//t.getFullYear().toString()+(t.getMonth()+1).toString()+t.getDate().toString()+"t"+t.getHours().toString()+t.getMinutes().toString()+t.getSeconds().toString()+t.getMilliseconds().toString()+"z";

    if (title && title.trim() !== '') {
      var s = slug(title);
      permlink = s.toString()+"-"+timeformat;
      if(permlink.length > 255) {
        // STEEMIT_MAX_PERMLINK_LENGTH
        permlink = permlink.substring(permlink.length - 255, permlink.length)
      }
      // only letters numbers and dashes shall survive
      permlink = permlink.toLowerCase().replace(/[^a-z0-9-]+/g, '')
      return permlink;
    }
  };
  //$scope.operation_type = 'default';
  $scope.spost = {};
  $scope.changePostLanguage = function(x) {
    //console.log(x);
    if ($scope.spost.tags) {
      $scope.spost.tags += " "+x;  
    } else {
      $scope.spost.tags = x;
    }
    
    $scope.tagsChange();
  }
  $scope.tagsChange = function() {
    $rootScope.log("tagsChange");
    if ($scope.spost.tags) {
      //$scope.spost.tags = $scope.spost.tags.replace(/#/g,'');
      //$scope.spost.tags = $filter('lowercase')($scope.spost.tags);
      $scope.spost.tags = $scope.spost.tags.toLowerCase().replace(/[^a-z0-9- ]+/g, '');
      $scope.spost.category = $scope.spost.tags?$scope.spost.tags.split(" "):[];
      for (var i = 0, len = $scope.spost.category.length; i < len; i++) {
        var v = $scope.spost.category[i];
        if(/^[а-яё]/.test(v)) {
          v = 'ru--' + $filter('detransliterate')(v, true);
          $scope.spost.category[i] = v;
        }
      }

      //console.log($scope.spost.category);
      if ($scope.spost.category.length > 5) {
        $scope.disableBtn = true;
      } else {
        $scope.disableBtn = false;
      }
    } else {
      $scope.spost.category = [];
    }
    if (!$scope.$$phase){
      $scope.$apply();
    }  
  }
  $scope.contentChanged = function (editor, html, text) {
    //console.log($scope.spost.body);
    //console.log('editor: ', editor, 'html: ', html, 'text:', text);
  };

  $scope.scheduleStory = function() {
    $scope.tagsChange();
    $scope.$applyAsync();
    if (!$scope.spost.title) {
      $rootScope.showAlert('Missing', 'Title');
      return;
    }
    if ($scope.spost.category.length<1) {
      $rootScope.showAlert('Missing', 'Tags');
      return;
    }
    $rootScope.$broadcast('show:loading');
    if ($rootScope.user) {
      $scope.spost.schedule = new Date($scope.spost.schedule).toISOString();

      $scope.spost.permlink = createPermlink($scope.spost.title);
      $scope.spost.json = $filter("metadata")($scope.spost.body);
      angular.merge($scope.spost.json, {tags: $scope.spost.category, app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' });

      $scope.spost.json = angular.toJson($scope.spost.json);
      
      if (!$scope.spost.operation_type) {
        $scope.spost.post_type = 'default';
      } else {
        $scope.spost.post_type = $scope.spost.operation_type;
      }

      APIs.schedulePost($rootScope.user.username, $scope.spost).then(function(res){
        //console.log(res.data);
        $rootScope.$broadcast('hide:loading');
        $scope.closePostModal();

        $rootScope.$emit('closePostModal');
        $rootScope.$broadcast('close:popover');
        //$scope.menupopover.hide();

        $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_SUBMITTED'));
        
        $scope.$applyAsync();
      });
      $rootScope.$broadcast('hide:loading');
    }
    //console.log($scope.spost);
  };

  // 포스트 올리기 1 (글 올릴떄 호출됨)
  $scope.submitStory = function() {
    $rootScope.log('submitStory 1');
    //console.log($scope.spost.body);
    if (!$scope.spost.title) {
      $rootScope.showAlert('Missing', 'Title');
      return;
    }
    if ($scope.spost.category.length<1) {
      $rootScope.showAlert('Missing', 'Tags');
      return;
    }
    $scope.tagsChange();
    //$scope.$applyAsync();
    
    $rootScope.$broadcast('show:loading');
    if ($rootScope.user) {
      var wif = $rootScope.user.password
      ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
      : $rootScope.user.privatePostingKey;

      var permlink = createPermlink($scope.spost.title);
      if(permlink.length < 5) permlink = `${permlink}-${new Date().toISOString().replace(/[^0-9]/g,'')}`;
      var json = $filter("metadata")($scope.spost.body);
      angular.merge(json, {tags: $scope.spost.category, app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' });

      if (!$scope.spost.operation_type) {
        $scope.spost.operation_type = 'default';
      }

      var operations_array = [];
      if ($scope.spost.operation_type !== 'default') {
        operations_array = [
          ['comment', {
            parent_author: "",
            parent_permlink: $scope.spost.category[0],
            author: $rootScope.user.username,
            permlink: permlink,
            title: $scope.spost.title,
            body: $scope.spost.body.trim(),
            json_metadata: angular.toJson(json)
          }],
          ['comment_options', {
            allow_curation_rewards: true,
            allow_votes: true,
            author: $rootScope.user.username,
            permlink: permlink,
            max_accepted_payout: $scope.spost.operation_type==='sp'?"1000000.000 "+$rootScope.$storage.platformdunit:"0.000 "+$rootScope.$storage.platformdunit,
            percent_steem_dollars: $scope.spost.operation_type==='sp'?0:10000,
            extensions: $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":1000 }] }]]
          }]
          ];
          if ($scope.spost.upvote_this) {
            var vote = ['vote', {
              voter: $rootScope.user.username, 
              author: $rootScope.user.username, 
              permlink: permlink, 
              weight: $rootScope.$storage.voteWeight || 10000
            }];
            operations_array.push(vote);
          }
      } else {
        operations_array = [
          ['comment', {
            parent_author: "",
            parent_permlink: $scope.spost.category[0],
            author: $rootScope.user.username,
            permlink: permlink,
            title: $scope.spost.title,
            body: $scope.spost.body.trim(),
            json_metadata: angular.toJson(json)
          }],
          ['comment_options', {
            allow_curation_rewards: true,
            allow_votes: true,
            author: $rootScope.user.username,
            permlink: permlink,
            max_accepted_payout: "1000000.000 "+$rootScope.$storage.platformdunit,
            percent_steem_dollars: 10000,
            // [수정] beneficiaries 제거
            // extensions: $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":1000 }] }]]
          }]
          ];
          if ($scope.spost.upvote_this) {
            var vote = ['vote', {
              voter: $rootScope.user.username, 
              author: $rootScope.user.username, 
              permlink: permlink, 
              weight: $rootScope.$storage.voteWeight || 10000
            }];
            operations_array.push(vote);
          }
      }
     
      window.steem.broadcast.sendAsync({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
        //console.log(err, result);
        $scope.replying = false;
        $rootScope.$broadcast('hide:loading');
        if (err) {
          var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
        } else {
          $scope.spost = {body:"", body2:"", title:"", tags:""};
          $rootScope.$storage.spost = {body:"", body2:"", title:"", tags:""};
          if (!$scope.$$phase){
            $scope.$apply();
          }
          $scope.closePostModal();
          $rootScope.$emit('closePostModal');
          $rootScope.$broadcast('close:popover');
          //$scope.menupopover.hide();
          
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_SUBMITTED'));
          //$scope.closeMenuPopover();
          $state.go("app.profile", {username: $rootScope.user.username});
        }
      });
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  }

  // 포스트 Draft 저장
  $scope.savePost = function() {
    //console.log($scope.modalp);
    console.log('save post');
    $rootScope.$storage.spost = $scope.spost;
    //adddraft
    var dr = {
      title:$scope.spost.title, 
      body: $scope.spost.body, 
      tags: $scope.spost.tags, 
      post_type: $scope.spost.operation_type
    };
    // Draft에 추가
    APIs.addDraft($rootScope.user.username, dr).then(function(res){
      //console.log(res.data);
      //$scope.drafts = res.data;
    });
    $rootScope.$emit('closePostModal');
    $rootScope.$broadcast('close:popover');
    $scope.modalp.hide();
    $rootScope.showMessage($filter('translate')('SAVED'), $filter('translate')('POST_LATER'));
  }
  $scope.clearPost = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: ""
    });
    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.log('You are sure');
        $rootScope.$storage.spost = {};
        $scope.spost.title = "";
        $scope.spost.body = "";
        $scope.spost.tags = "";
        $scope.spost.schedule = undefined;
        $rootScope.showMessage($filter('translate')('CLEARED'), $filter('translate')('POST'));
      } else {
        $rootScope.log('You are not sure');
      }
    });
  }


  $rootScope.$on('fetchPosts', function(){
    $scope.fetchPosts();
  });

  $rootScope.$on('fetchContent', function(event, args) {
    var post = args.any;
    //console.log(post);
    $scope.fetchContent(post.author, post.permlink);
  });

  $scope.votePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'fetchContent');
    $scope.$applyAsync();
  };

  $scope.downvotePost = function(post) {

    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: $filter('translate')('FLAGGING_TEXT')
    });
    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.log('You are sure');
        $rootScope.votePost(post, 'downvote', 'fetchContent');
      } else {
        $rootScope.log('You are not sure');
      }
    });

  };

  $scope.unvotePost = function(post) {
    $rootScope.votePost(post, 'unvote', 'fetchContent');
  };


  $rootScope.$on("user:logout", function(){
    $scope.fetchPosts();
    $rootScope.$broadcast('filter:change');
  });

  $scope.loadMore = function() {
    //$rootScope.$broadcast('show:loading');
    console.log('loadmore');
    //console.log($scope.data.length);
    $scope.limit += 5;
    if (!$scope.error) {
      $scope.fetchPosts(null, $scope.limit, null);
    }
  };
  $scope.refresh = function(){
    $scope.limit = 10;
    console.log('refresh');
    //if (!$scope.error) {
    $scope.fetchPosts(null, $scope.limit, null);
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
    console.log('stateChangeSuccess '+from.name);

    if (from.name === 'app.posts' && to.name === 'app.post') {
      
    } else {
      if (from.name == 'app.post' && to.name == 'app.posts') {
        //console.log($scope.data, $rootScope.sitem);
        if ($scope.data.length>0) {
            for (var i = 0; i < $scope.data.length; i++) {
              var v = $scope.data[i];
              if (v.author == $rootScope.sitem.author && v.permlink == $rootScope.sitem.permlink) {
                $scope.data[i].active_votes = $rootScope.sitem.active_votes;
              }
            }
        }
        //$scope.$applyAsync();
        $rootScope.sitem = null;
      }
      if (from.name !== 'app.post' && to.name === 'app.posts') {
        if ($stateParams.renew) {
          $scope.data = null;
          $scope.data = [];
        }
        //$rootScope.$broadcast('refreshLocalUserData');
        console.log('loadmore');
        
        $rootScope.user = $rootScope.$storage.user || undefined;

        $scope.loadMore();
      }
    }
    $rootScope.$broadcast('refreshLocalUserData');
  });

  $scope.moreDataCanBeLoaded = function(){
    return !$scope.error;
  }

  $rootScope.$on('changeView', function(){
    //$scope.menupopover.hide();
    //$rootScope.$broadcast('close:popover');
    $scope.menupopover.hide();
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  });

  $rootScope.$on('changeLight', function(){
    $scope.menupopover.hide();
    //$rootScope.$broadcast('close:popover');
    $scope.$applyAsync();
  });


  //check if permission is already enabled
  $scope.hasPermission = function(account) {
    var hasPermission = false;
    account.posting.account_auths.forEach(function(auth) {
        if (auth[0] === "esteemapp") {
            hasPermission = true;
        }
    });
    return hasPermission;
  };
  //change permission
  $scope.changePermission = function() {
    if ($rootScope.user && $scope.hasPermission($rootScope.user)){
      window.steem.api.getAccountsAsync([$rootScope.user.username], function(err, response){
        //console.log(err, response);
        if (response) {
          var account = response[0];
          var postingAuth = account.posting;

          
          //removing permission
          for (var i = 0; i < postingAuth.account_auths.length; i++) {
              if (postingAuth.account_auths[i][0] === 'esteemapp') {
                  break;
              }
          }
          postingAuth.account_auths.splice(i, 1);
          //--------
          var wif = $rootScope.user.password
          ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
          : $rootScope.$storage.user.privateActiveKey;
          //steem.broadcast.accountUpdate(wif, account, owner, active, posting, memoKey, jsonMetadata, function(err, result) {
          if (wif) {
            window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, postingAuth, $rootScope.user.memo_key, account.json_metadata, function(err, result) {
             
              if (err) {
                //console.log(err);
                var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message).then(function(){
                  $scope.spost.permission = true;  
                });
              } else {
                console.log('removed permission');
                //$rootScope.$broadcast('refreshLocalUserData');
                $scope.spost.permission = false;
              }
            });
          } else {
            $rootScope.$broadcast('hide:loading');
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
          }
        }
      });
    } else {

      window.steem.api.getAccountsAsync([$rootScope.user.username], function(err, response){
        //console.log(err, response);
        if (response) {
          var account = response[0];
          var postingAuth = account.posting;

          //adding permission
          postingAuth.account_auths.push(['esteemapp', postingAuth.weight_threshold]);


          var wif = $rootScope.user.password
          ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
          : $rootScope.$storage.user.privateActiveKey;
          //steem.broadcast.accountUpdate(wif, account, owner, active, posting, memoKey, jsonMetadata, function(err, result) {
          if (wif) {
            window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, postingAuth, $rootScope.user.memo_key, account.json_metadata, function(err, result) {
              //$rootScope.$storage.user.memo_key
              //console.log(err, result);
              //$scope.modalEdit.hide();
              if (err) {
                var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message).then(function(){
                  $scope.spost.permission = false;  
                });
              } else {
                console.log('set permission');
                //$rootScope.$broadcast('refreshLocalUserData');
                $scope.spost.permission = true;
              }
            });
          } else {
            $rootScope.$broadcast('hide:loading');
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
          }
        }
      });
    }
  };



  function arrayObjectIndexOf(myArray, searchTerm, property) {
    var llen = myArray.length;
    for(var i = 0; i < llen; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
  }
  $scope.data = [];
  $scope.tempData = [];

  $scope.dataChanged = function(newValue) {
    if (newValue) {
      var lenn = newValue.length;
      //var user = $rootScope.$storage.user || null;
      var view = $rootScope.$storage.view;

      if ($rootScope.user){
        for (var i = 0; i < lenn; i++) {
          if (newValue[i] && newValue[i].active_votes) {
            var len = newValue[i].active_votes.length-1;
            for (var j = len; j >= 0; j--) {
              if (newValue[i].active_votes[j].voter === $rootScope.user.username) {
                if (newValue[i].active_votes[j].percent > 0) {
                  newValue[i].upvoted = true;
                } else if (newValue[i].active_votes[j].percent < 0) {
                  newValue[i].downvoted = true;
                } else {
                  newValue[i].downvoted = false;
                  newValue[i].upvoted = false;
                }
              }
            }
          }
         
        }
      } 
      return newValue;
    }
  }

  $scope.fetchContent = function(author, permlink) {
    window.steem.api.getContentAsync(author, permlink, function(err, result) {
      console.log('getContentA1',err, result);
      var len = result.active_votes.length;
      //var user = $rootScope.$storage.user;
      if ($rootScope.user) {
        for (var j = len - 1; j >= 0; j--) {
          if (result.active_votes[j].voter === $rootScope.user.username) {
            if (result.active_votes[j].percent > 0) {
              result.upvoted = true;
            } else if (result.active_votes[j].percent < 0) {
              result.downvoted = true;
            } else {
              result.downvoted = false;
              result.upvoted = false;
            }
          }
        }
      }
     
      
      for (var i = 0, len = $scope.data.length; i < len; i++) {
        var v = $scope.data[i];
        if (v.permlink === result.permlink) {
          $scope.data[i] = result;
        }
      }
      $rootScope.$broadcast('hide:loading');
      $scope.$applyAsync();
    });
  }
  $scope.ifExists = function(xx){
    for (var i = 0; i < $scope.data.length; i++) {
      if ($scope.data[i].permlink === xx){
        return true;
      }
    }
    return false;
  }
  var snakeCaseRe = /_([a-z])/g;

  function camelCase(str) {
    return str.replace(snakeCaseRe, function (_m, l) {
      return l.toUpperCase();
    });
  }
  
  $scope.fetchPosts = function(type, limit, tag) {
    type = type || $rootScope.$storage.filter || "trending";
    tag = tag || $rootScope.$storage.tag || "";
    limit = 10;//limit || $scope.limit || 10;

    var params = {};

    if (type === "feed" && $rootScope.user) {
      params = {tag: $rootScope.user.username, limit: limit, filter_tags:[]};
    } else {
      if ($rootScope.$storage.filter === "feed") {
        $rootScope.$storage.filter = "trending";
        type = "trending";
      }
      params = {tag: tag, limit: limit, filter_tags:[]};
    }
    if ($scope.data && $scope.data.length>0) {
      params.start_author = $scope.data[$scope.data.length-1].author;
      params.start_permlink = $scope.data[$scope.data.length-1].permlink;
    }
    if ($scope.error) {
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.log("fetching..."+type+" "+limit+" "+tag);
       
      if ($rootScope.$storage.chain == 'golos' && type == 'feed') {
        params.select_authors = [$rootScope.user.username]; 
        delete params.tags; 
      }
      params.truncate_body = 200;

      window.steem.api.setOptions({ url: localStorage.socketUrl });

      var xyz = camelCase("get_discussions_by_"+type) + "Async";
      //window.steem.api.getDiscussionsBy
      window.steem.api[xyz](params, function(err, response) {
        
        if (response) {

          //$scope.$evalAsync(function($scope){
            if (response.length <= 1) {
              $scope.error = true;
            }
            for (var i = 0; i < response.length; i++) {
              if ($rootScope.$storage.view !== 'compact') {
                //response[i].json_metadata = response[i].json_metadata?angular.fromJson(response[i].json_metadata):response[i].json_metadata;
              }
              var permlink = response[i].permlink;
              if (!$scope.ifExists(permlink)) {
                //var user = $rootScope.$storage.user || undefined;
                if ($rootScope.user) {
                  //console.log('exist');
                  if (response[i] && response[i].active_votes) {
                    var len = response[i].active_votes.length-1;
                    for (var j = 0; j < len; j++) {
                      if (response[i].active_votes[j].voter === $rootScope.user.username) {
                        if (response[i].active_votes[j].percent > 0) {
                          response[i].upvoted = true;
                        } else if (response[i].active_votes[j].percent < 0) {
                          response[i].downvoted = true;
                        } else {
                          response[i].downvoted = false;
                          response[i].upvoted = false;
                        }
                      }
                    }
                  }
                }
                //response[i].body = "";
                $scope.data.push(response[i]);
                $scope.to = $scope.data.length;
                
              }
            }
          //});
        }
        if (!$scope.$$phase){
          $scope.$apply();
        }
        //$scope.$applyAsync();
        //console.log($scope.data.length);
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $rootScope.$broadcast('hide:loading');
      });
    }
    if (!$scope.$$phase){
      $scope.$apply();
    }
  };

  $scope.$on('$ionicView.loaded', function(){
    $scope.limit = 10;
    //$rootScope.$broadcast('show:loading');
    if (!$rootScope.$storage["socket"+$rootScope.$storage.chain]) {
      $rootScope.$storage["socket"+$rootScope.$storage.chain] = localStorage.socketUrl;
    }
    if (!$rootScope.$storage.view) {
      $rootScope.$storage.view = 'card';
    }
    if (!$rootScope.$storage.filter) {
      $rootScope.$storage.filter = "trending";
    }
  });
  
  $scope.$on('$ionicView.beforeEnter', function(){
    console.log('beforeEnter PostsCtrl');
    $scope.theme = $rootScope.$storage.theme;
    if ($stateParams.tags) {
      $rootScope.$storage.tag = $stateParams.tags;
    }
    $rootScope.user = $rootScope.$storage.user || undefined;
    
    if (!angular.isDefined($rootScope.$storage.language)) {
      if(typeof navigator.globalization !== "undefined") {
          navigator.globalization.getPreferredLanguage(function(language) {
              $translate.use((language.value).split("-")[0]).then(function(data) {
                  console.log("SUCCESS -> " + data);
                  $rootScope.$storage.language = language.value;
              }, function(error) {
                  console.log("ERROR -> " + error);
              });
          }, null);
      } else {
        $rootScope.$storage.language = 'en-US';
      }
    } else {
      $translate.use($rootScope.$storage.language);
    }

    $scope.activeMenu = $rootScope.$storage.filter || "trending";
    $scope.mymenu = $rootScope.user ? [
    {text: $filter('translate')('FEED'), custom:'feed'}, 
    {text: $filter('translate')('TRENDING'), custom:'trending'}, 
    {text: $filter('translate')('HOT'), custom:'hot'}, 
    {text: $filter('translate')('NEW'), custom:'created'}, 
    {text: $filter('translate')('ACTIVE'), custom:'active'}, 
    {text: $filter('translate')('PROMOTED'), custom: 'promoted'}, 
    {text: $filter('translate')('VOTES'), custom:'votes'}, 
    {text: $filter('translate')('COMMENTS'), custom:'children'}
    ] : 
    [ 
    {text: $filter('translate')('TRENDING'), custom:'trending'}, 
    {text: $filter('translate')('HOT'), custom:'hot'}, 
    {text: $filter('translate')('NEW'), custom:'created'}, 
    {text: $filter('translate')('ACTIVE'), custom:'active'}, 
    {text: $filter('translate')('PROMOTED'), custom: 'promoted'}, 
    {text: $filter('translate')('VOTES'), custom:'votes'}, 
    {text: $filter('translate')('COMMENTS'), custom:'children'}, 
    ];

    if ($rootScope.$storage.tag && $scope.mymenu) {
      $scope.mymenu.unshift({text:$filter('translate')('REMOVE')+' #'+$rootScope.$storage.tag, custom:'tag'});
    }

    for (var i = 0, len = $scope.mymenu.length; i < len; i++) {
      var v = $scope.mymenu[i];
      if (v.custom === $rootScope.$storage.filter) {
        $rootScope.$storage.filterName = v.text;
      }
    }

  });

  $scope.showStats = function(user) {
    console.log(user);
    //$scope.modalStats.show();
    $state.go('app.activity',{username:user});
  }

})
//epostsctrl
//spostctrl
app.controller('PostCtrl', function($scope, $stateParams, $rootScope, $interval, $ionicScrollDelegate, $ionicModal, $filter, $ionicActionSheet, $cordovaCamera, $ionicPopup, ImageUploadService, $ionicPlatform, $ionicSlideBoxDelegate, $ionicPopover, $filter, $state, APIs, $ionicHistory, $ionicPosition, $cordovaFileTransfer, $ionicLoading, $translate, $ionicBody) {
  $scope.post = $rootScope.sitem;
  $scope.data = {};
  $scope.spost = {};
  $scope.translations = {};

  $scope.translations.menu = $translate.instant('MENU');
  $scope.translations.bookmark = $translate.instant('BOOKMARK');
  $scope.translations.translate = $translate.instant('TRANSLATE');
  $scope.translations.share = $translate.instant('SHARE');
  $scope.translations.reply = $translate.instant('REPLY');
  $scope.translations.by = $translate.instant('BY');
  $scope.translations.in = $translate.instant('IN');
  $scope.translations.min = $translate.instant('MIN_READ');
  $scope.translations.upvote = $translate.instant('UPVOTE');
  $scope.translations.unvote = $translate.instant('UNVOTE');
  $scope.translations.downvote = $translate.instant('DOWNVOTE');
  $scope.translations.undownvote = $translate.instant('UNVOTE_DOWNVOTED');
  $scope.translations.unupvote = $translate.instant('UNVOTE_UPVOTED');
  $scope.translations.edit = $translate.instant('EDIT');
  $scope.translations.gallery = $translate.instant('GALLERY');
  $scope.translations.reblog = $translate.instant('REBLOG');

  $scope.translations.view = $translate.instant('VIEW_CONTEXT');
  $scope.translations.comments = $translate.instant('FETCHCOMMENTS');

  $scope.replying = false;

  $ionicPopover.fromTemplateUrl('popoverSliderr.html', {
      scope: $scope
  }).then(function(popover) {
      $scope.tooltipSliderr = popover;
  });
  
  $scope.openSliderr = function($event, d) {
    $scope.votingPost = d;
    $scope.$applyAsync();
    $scope.rangeValue = $rootScope.$storage.voteWeight/100;
    $scope.tooltipSliderr.show($event);
  };
  $scope.votePostS = function() {
    $scope.tooltipSliderr.hide();
    $scope.upvotePost($scope.votingPost);
  }
  $scope.drag = function(v) {
    //console.log(v);
    $rootScope.$storage.voteWeight = v*100;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    if (!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  };

  $scope.closeSliderr = function() {
    $scope.tooltipSliderr.hide();
  };

  $scope.options = {
    loop: false,
    speed: 500,
    /*pagination: false,*/
    showPager: false,
    slidesPerView: 3,
    spaceBetween: 20,
    breakpoints: {
      1024: {
          slidesPerView: 5,
          spaceBetween: 15
      },
      768: {
          slidesPerView: 4,
          spaceBetween: 10
      },
      640: {
          slidesPerView: 3,
          spaceBetween: 5
      },
      320: {
          slidesPerView: 3,
          spaceBetween: 3
      }
    }
  }

  $scope.lastFocused;


  //http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
  $scope.insertText = function(text) {
    //console.log(text);
    var input = $scope.lastFocused;
    //console.log(input);
    input.focus();
    if (input == undefined) { return; }
    var scrollPos = input.scrollTop;
    var pos = 0;
    var browser = ((input.selectionStart || input.selectionStart == "0") ?
                   "ff" : (document.selection ? "ie" : false ) );
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart ("character", -input.value.length);
      pos = range.text.length;
    }
    else if (browser == "ff") { pos = input.selectionStart };

    var front = (input.value).substring(0, pos);
    var back = (input.value).substring(pos, input.value.length);
    input.value = front+text+back;
    pos = pos + text.length;
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart ("character", -input.value.length);
      range.moveStart ("character", pos);
      range.moveEnd ("character", 0);
      range.select();
    }
    else if (browser == "ff") {
      input.selectionStart = pos;
      input.selectionEnd = pos;
      input.focus();
    }
    //input.focus();
    input.scrollTop = scrollPos;
    //console.log(angular.element(input).val());
    angular.element(input).trigger('input');
  }

  $ionicPopover.fromTemplateUrl('popoverTr.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.tooltip = popover;
   });

   $scope.openTooltip = function($event, d) {
    var tppv = Number(d.pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
    var tpv = Number(d.total_payout_value.split(' ')[0]+d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var ar = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var pout = d.last_payout=="1970-01-01T00:00:00"?d.cashout_time:d.last_payout;
    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PROMOTED')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(p,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('AUTHOR_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(ar,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('CURATION_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(crp,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(pout, true)+"</div></div>";
    $scope.tooltipText = texth;
    $scope.tooltip.show($event);
   };

   $scope.closeTooltip = function() {
      $scope.tooltip.hide();
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.tooltip.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });


  $scope.isImages = function() {
    if ($rootScope.sitem) {

      var len = ($rootScope.sitem.json_metadata&&$rootScope.sitem.json_metadata.image)?$rootScope.sitem.json_metadata.image.length:0;
      if (len > 0) {
        $scope.images = $rootScope.sitem.json_metadata.image;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
  $scope.zoomMin = 1;
  $scope.showImages = function(index) {
    $scope.activeSlide = index;
    $rootScope.log(angular.toJson($scope.images[index]));
    $scope.showGalleryModal('templates/gallery_images.html');
  };

  $scope.showGalleryModal = function(templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope
    }).then(function(modal) {
      $scope.modalg = modal;
      $scope.modalg.show();
    });
  }

  $scope.closeGalleryModal = function() {
    $scope.modalg.hide();
    $ionicBody.removeClass('modal-open');
  };

  $scope.updateSlideStatus = function(slide) {
    var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
    if (zoomFactor == $scope.zoomMin) {
      $ionicSlideBoxDelegate.enableSlide(true);
    } else {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
  };

  $scope.downloadImage = function(img) {
    //window.open(img, '_system');
    $ionicPlatform.ready(function() {
    
      // File name only
      var filename = img.split("/").pop();
      var path;
      // Save location
      if (ionic.Platform.isAndroid()) {
        if (cordova.plugins.permissions) {

          var permissions = cordova.plugins.permissions;
          
          permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, function( status ){
            if ( status.hasPermission ) {
              console.log("Yes :D ");
              path = cordova.file.externalRootDirectory + 'Download/';
              var targetPath = path + filename;
              
              $cordovaFileTransfer.download(img, targetPath, {}, true).then(function (result) {
                  console.log('Success');
                  refreshMedia.refresh(targetPath);
                  $ionicLoading.show({template : $filter('translate')('DOWNLOAD_COMPLETED'), duration: 1000});
              }, function (error) {
                  console.log('Error');
              }, function (progress) {
                  // PROGRESS HANDLING GOES HERE
                percentage = Math.floor((progress.loaded / progress.total) * 100);
                $ionicLoading.show({template : $filter('translate')('DOWNLOADING_PICTURE') +' '+ percentage + '%'});
              });
            }
            else {
              console.warn("No :( ");
              permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, success, error);
              function error() {
                console.warn('WRITE_EXTERNAL_STORAGE permission is not turned on');
              }

              function success( status ) {
                if( !status.hasPermission ) error();

                path = cordova.file.externalRootDirectory + 'Download/';
                var targetPath = path + filename;
                
                $cordovaFileTransfer.download(img, targetPath, {}, true).then(function (result) {
                    console.log('Success');
                    refreshMedia.refresh(targetPath);
                    $ionicLoading.show({template : $filter('translate')('DOWNLOAD_COMPLETED'), duration: 1000});
                }, function (error) {
                    console.log('Error');
                }, function (progress) {
                    // PROGRESS HANDLING GOES HERE
                  percentage = Math.floor((progress.loaded / progress.total) * 100);
                  $ionicLoading.show({template : $filter('translate')('DOWNLOADING_PICTURE') +' '+ percentage + '%'});
                });
              }
            }
          });
        }        
      } else {
        window.plugins.socialsharing.share(null, null, img, null);
      }
      

    });
  }

  $scope.hideKeyboard = function(){
    $ionicPlatform.ready(function() {  
      if (window.cordova && window.cordova.plugins.Keyboard) {
        if(cordova.plugins.Keyboard.isVisible){
            window.cordova.plugins.Keyboard.close();
        } else {
            window.cordova.plugins.Keyboard.show();
        }
      }
    });
  }

  $scope.showImg = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: $filter('translate')('CAPTURE_PICTURE') },
       { text: $filter('translate')('SELECT_PICTURE') },
       { text: $filter('translate')('SET_CUSTOM_URL') },
       { text: $filter('translate')('GALLERY') }
     ],
     titleText: $filter('translate')('INSERT_PICTURE'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
        $scope.insertImage(index);
        return true;
     }
   });
  };
  $scope.insertImage = function(type) {
    var options = {};
    if ($scope.edit) {
      if (type == 0 || type == 1) {
        options = {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: (type===0)?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: (type===0)?true:false,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation:true
        };
        $cordovaCamera.getPicture(options).then(function(imageData) {
          //setTimeout(function() {
          //$scope.$evalAsync(function( $scope ) {
            ImageUploadService.uploadImage(imageData).then(function(result) {
              //var url = result.secure_url || '';
              var url = result.url || '';
              var final = " ![image](" + url + ")";
              $rootScope.log(final);
             
              if (url) {
                APIs.addMyImage($rootScope.user.username, url).then(function(res){
                  if (res)
                    console.log('saved image to db');
                });
              }
              $scope.insertText(final);
              if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
                $cordovaCamera.cleanup();
              }
            },
            function(err) {
              $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('UPLOAD_ERROR'));
              if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
                $cordovaCamera.cleanup();
              }
            });
          //});
        }, function(err) {
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('CAMERA_CANCELLED'));
        });
      } else if (type == 2){
        $ionicPopup.prompt({
          title: $filter('translate')('SET_URL'),
          template: $filter('translate')('DIRECT_LINK_PICTURE'),
          inputType: 'text',
          inputPlaceholder: 'http://example.com/image.jpg'
        }).then(function(res) {
          $rootScope.log('Your url is' + res);
          if (res) {
            var url = res.trim();
            var final = " ![image](" + url + ")";
            $rootScope.log(final);
           
            $scope.insertText(final);
          }
        });
      } else {
        $scope.gallery = [];
        APIs.fetchImages($rootScope.user.username).then(function(res){
          var imgs = res.data;
          if (imgs.length>0){
            $scope.showgallery = true;
            $scope.gallery.images = imgs;
          } else {
            $scope.showgallery = false;
            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('NO_IMAGE'));
            console.log('no images available')
          }
        });
      }
    } else {
      if (type == 0 || type == 1) {
        options = {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: (type===0)?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: (type===0)?true:false,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation:true
        };
        $cordovaCamera.getPicture(options).then(function(imageData) {
          //setTimeout(function() {
          //$scope.$evalAsync(function( $scope ) {
            ImageUploadService.uploadImage(imageData).then(function(result) {
              //var url = result.secure_url || '';
              var url = result.url || '';
              var final = " ![image](" + url + ")";
              $rootScope.log(final);
              
              if (url) {
                APIs.addMyImage($rootScope.user.username, url).then(function(res){
                  if (res)
                    console.log('saved image to db');
                });
              }
              $scope.insertText(final);
              if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
                $cordovaCamera.cleanup();
              }
            },
            function(err) {
              $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('UPLOAD_ERROR'));
              if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
                $cordovaCamera.cleanup();
              }
            });
          //});
        }, function(err) {
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('CAMERA_CANCELLED'));
        });
      } else if (type == 2){
        $ionicPopup.prompt({
          title: $filter('translate')('SET_URL'),
          template: $filter('translate')('DIRECT_LINK_PICTURE'),
          inputType: 'text',
          inputPlaceholder: 'http://example.com/image.jpg'
        }).then(function(res) {
          $rootScope.log('Your url is' + res);
          if (res) {
            var url = res.trim();
            var final = " ![image](" + url + ")";
            $rootScope.log(final);
            
            $scope.insertText(final);
          }
        });
      } else {
        $scope.gallery = [];
        APIs.fetchImages($rootScope.user.username).then(function(res){
          var imgs = res.data;
          if (imgs.length>0){
            $scope.showgallery = true;
            $scope.gallery.images = imgs;
          } else {
            $scope.showgallery = false;
            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('NO_IMAGE'));
            console.log('no images available')
          }
        });
      }
    }
  };

  $ionicModal.fromTemplateUrl('templates/story.html', {
    scope: $scope  }).then(function(modal) {
    $scope.pmodal = modal;
  });
  $scope.openPostModal = function() {
    //if(!$scope.pmodal) return;
    setTimeout(function() {
    //$scope.$evalAsync(function( $scope ) {
      $scope.pmodal.show();
    }, 1);
  };

  $rootScope.$on('closePostModal', function(){
    if ($scope.pmodal) {
      $scope.pmodal.hide();
    }
    if ($scope.modalp) {
      $scope.modalp.hide();
    }
    $ionicBody.removeClass('modal-open');
  });

  $scope.closeGallery = function(){
    $scope.showgallery = false;
  }
  $scope.manageGallery = function(){
    $scope.modal.hide();
    $ionicBody.removeClass('modal-open');
    $state.go('app.images');
  }
  var dmp = new window.diff_match_patch();

  function createPatch(text1, text2) {
      if (!text1 && text1 === '') return undefined;
      var patches = dmp.patch_make(text1, text2);
      var patch = dmp.patch_toText(patches);
      return patch;
  }
  $scope.cfocus = function(){
    $scope.lastFocused = document.activeElement;
  }
  $scope.deletePost = function(xx) {
    $rootScope.log('delete post '+ angular.toJson(xx));
    var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('DELETE_COMMENT')
    });
    confirmPopup.then(function(res) {
        if(res) {
            $rootScope.log('You are sure');
            $rootScope.$broadcast('show:loading');
            if ($rootScope.user) {
              var wif = $rootScope.user.password
              ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
              : $rootScope.user.privatePostingKey;

              window.steem.broadcast.deleteComment(wif, xx.author, xx.permlink, function(err, result) {
                //console.log(err, result);
                if (err) {
                  var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                  $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
                } else {
                  $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('DELETED_COMMENT'));
                  $state.go('app.posts');
                }
                $rootScope.$broadcast('hide:loading');
              });
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
            }
        } else {
          $rootScope.log('You are not sure');
        }
    });
  }
  $scope.tagsChange = function() {
    $rootScope.log("tagsChange");
    if ($scope.spost.tags) {
      //$scope.spost.tags = $scope.spost.tags.replace(/#/g,'');
      //$scope.spost.tags = $filter('lowercase')($scope.spost.tags);
      $scope.spost.tags = $scope.spost.tags.toLowerCase().replace(/[^a-z0-9- ]+/g, '');
      $scope.spost.category = $scope.spost.tags?$scope.spost.tags.split(" "):[];
      for (var i = 0, len = $scope.spost.category.length; i < len; i++) {
        var v = $scope.spost.category[i];
        if(/^[а-яё]/.test(v)) {
          v = 'ru--' + $filter('detransliterate')(v, true);
          $scope.spost.category[i] = v;
        }
      }

      //console.log($scope.spost.category);
      if ($scope.spost.category.length > 5) {
        $scope.disableBtn = true;
      } else {
        $scope.disableBtn = false;
      }
    } else {
      $scope.spost.category = [];
    }
    if (!$scope.$$phase){
      $scope.$apply();
    }  
  }
  $scope.edit = false;
  $scope.editPost = function(xx) {
    console.log(xx);
    $scope.edit = true;
    $scope.spost.advanced = false;
    if (xx.parent_author !== "") {
      $scope.isreplying(xx, true, true);
    } else {
      $scope.openPostModal();  
    }
    //$rootScope.sitem = xx;
    $scope.$evalAsync(function(){
      if (!$scope.spost.body) {
        $scope.spost = xx;
        $scope.patchbody = xx.body;
      }
      var ts = angular.fromJson(xx.json_metadata).tags;
      if (Array.isArray(ts)) {
        //console.log(ts);
        $scope.spost.tags = ts.join().replace(/\,/g,' ');  
      } else {
        $scope.spost.tags = ts;
      }
      $scope.tagsChange();
    })
    //console.log($scope.spost.operation_type);
  }

  // 포스트 올리기 2 (아마도 댓글?)
  $scope.submitStory = function() {
    $rootScope.log('submitStory 2');
    if (!$scope.spost.title) {
      $rootScope.showAlert('Missing', 'Title');
      return;
    }
    if ($scope.spost.category.length<1) {
      $rootScope.showAlert('Missing', 'Tags');
      return;
    }
    //$scope.$applyAsync();
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $rootScope.$broadcast('show:loading');
    $scope.bexist = false;

    if ($scope.edit) {
      var patch = createPatch($scope.patchbody, $scope.spost.body)
      // Putting body into buffer will expand Unicode characters into their true length
      if (patch && patch.length < new Buffer($scope.spost.body, 'utf-8').length) {
        $scope.spost.body2 = patch;
      }
      $rootScope.log(patch);

      angular.forEach($scope.spost.beneficiaries, function(v,k){
        if (v && v.account === "esteemapp") {
          $scope.bexist = true;
        }
      });
    } else {
      $scope.spost.body2 = undefined;
    }

    if ($rootScope.user) {

      var wif = $rootScope.user.password
      ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
      : $rootScope.user.privatePostingKey;

      var permlink = $scope.spost.permlink;
      var jjson = $filter("metadata")($scope.spost.body);
      //console.log(jjson);
      //$scope.spost.tags = $filter('lowercase')($scope.spost.tags);
      var ttags = $scope.spost.tags.split(" ");
      if (ttags.length>5) {
        ttags = ttags.slice(0,5);
      }
      var json = angular.merge(jjson, {tags: ttags, app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' });


      var operations_array = [];
      //simultaneously
      if (!$scope.spost.operation_type) {
        operations_array = [
        ['comment', {
          parent_author: "",
          parent_permlink: $scope.spost.parent_permlink,
          author: $rootScope.user.username,
          permlink: $scope.spost.permlink,
          title: $scope.spost.title,
          body: $scope.spost.body2?$scope.spost.body2.trim():$scope.spost.body.trim(),
          json_metadata: angular.toJson(json)
        }]
        ];
      } else {
        operations_array = [
        ['comment', {
          parent_author: "",
          parent_permlink: $scope.spost.parent_permlink,
          author: $rootScope.user.username,
          permlink: $scope.spost.permlink,
          title: $scope.spost.title,
          body: $scope.spost.body2?$scope.spost.body2.trim():$scope.spost.body.trim(),
          json_metadata: angular.toJson(json)
        }]
        ];
      }
      if (!$scope.edit) {
        var xx = ['comment_options', {
          allow_curation_rewards: true,
          allow_votes: true,
          author: $rootScope.user.username,
          permlink: $scope.spost.permlink,
          max_accepted_payout: "1000000.000 "+$rootScope.$storage.platformdunit,
          percent_steem_dollars: 10000,
          // [수정] beneficiaries 제거
          // extensions: $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":1000 }] }]]
          extensions: []
        }];
        operations_array.push(xx);
      }
      
      window.steem.broadcast.sendAsync({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
        
        //console.log(err, result);
        
        $scope.replying = false;
        $rootScope.$broadcast('hide:loading');
        if (err) {
          var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
        } else {
          //$scope.closePostModal();
          $scope.spost = {body:"", body2:"", title:"", tags:""};
          $rootScope.$storage.spost = {body:"", body2:"", title:"", tags:""};

          if (!$scope.$$phase){
            $scope.$apply();
          }
          
          $rootScope.$emit('closePostModal');
          $rootScope.$broadcast('close:popover');
          //$scope.menupopover.hide();
          
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_SUBMITTED'));
          //$scope.closeMenuPopover();
          if ($scope.edit) {
            $rootScope.$broadcast('update:content');
          } else {
            $scope.spost = {};
            $state.go("app.profile", {username: $rootScope.user.username});  
          }
        }
      });
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  }
  $scope.addImage = function(url) {
    $scope.data.comment += ' ![image]('+url+') ';
  }
  $scope.reply = function (xx) {
    //$rootScope.log(xx);
    //$scope.$applyAsync();
    $rootScope.$broadcast('show:loading');
    if ($rootScope.user) {
      if ($scope.editreply) {
        var wif = $rootScope.user.password
        ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
        : $rootScope.user.privatePostingKey;
        
        //check if beneficiary exist when editing
        $scope.bexist = false;
        angular.forEach($scope.post.beneficiaries, function(v,k){
          if (v && v.account === "esteemapp") {
            $scope.bexist = true;
          }
        });

        //var ts = angular.fromJson($scope.post.json_metadata).tags;
        var json;
      
        json = {tags: $scope.post.json_metadata?angular.fromJson($scope.post.json_metadata).tags:["esteem"] , app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' };
      
        var operations_array = [];
        operations_array = [
          ['comment', {
            parent_author: $scope.post.parent_author,
            parent_permlink: $scope.post.parent_permlink,
            author: $rootScope.user.username,
            permlink: $scope.post.permlink,
            title: "",
            body: $scope.data.comment.trim(),
            json_metadata: angular.toJson(json)
          }]
          ];
        if (!$scope.bexist) {
          var xx = ['comment_options', {
            allow_curation_rewards: true,
            allow_votes: true,
            author: $rootScope.user.username,
            permlink: $scope.post.permlink,  
            max_accepted_payout: "1000000.000 "+$rootScope.$storage.platformdunit,
            percent_steem_dollars: 10000,
            extensions: $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":1000 }] }]]
          }];
          operations_array.push(xx);
        }
        window.steem.broadcast.send({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
          //console.log(err, result);
          $rootScope.$broadcast('hide:loading');
          if (err) {
            var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
          } else {
            $scope.closeModal();
            $scope.data.comment = "";

            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('COMMENT_SUBMITTED'));
          }
        });
      } else {
        var wif = $rootScope.user.password
        ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
        : $rootScope.user.privatePostingKey;

        var t = new Date();
        var timeformat = t.getFullYear().toString()+(t.getMonth()+1).toString()+t.getDate().toString()+"t"+t.getHours().toString()+t.getMinutes().toString()+t.getSeconds().toString()+t.getMilliseconds().toString()+"z";
        //console.log($scope.post);
        var json = {tags: $scope.post.json_metadata?angular.fromJson($scope.post.json_metadata).tags:["esteem"] , app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' };

        var operations_array = [];
        operations_array = [
          ['comment', {
            parent_author: $scope.post.author,
            parent_permlink: $scope.post.permlink,
            author: $rootScope.user.username,
            permlink: "re-"+$scope.post.author.replace(/\./g, "")+"-"+timeformat,
            title: "",
            body: $scope.data.comment.trim(),
            json_metadata: angular.toJson(json)
          }],
          ['comment_options', {
            allow_curation_rewards: true,
            allow_votes: true,
            author: $rootScope.user.username,
            permlink: "re-"+$scope.post.author.replace(/\./g, "")+"-"+timeformat,  
            max_accepted_payout: "1000000.000 "+$rootScope.$storage.platformdunit,
            percent_steem_dollars: 10000,
            extensions: $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":1000 }] }]]
          }]
          ];
        window.steem.broadcast.send({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
          //console.log(err, result);
          $rootScope.$broadcast('hide:loading');
          if (err) {
            var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
          } else {
            $scope.closeModal();
            $scope.data.comment = "";

            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('COMMENT_SUBMITTED'));
          }
        });
      }
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  }
  $rootScope.$on("update:content", function(event, data){
    //console.log(event);
    //event.stopPropagation();
    event.preventDefault();
    $rootScope.log("update:content");
    $rootScope.$broadcast('hide:loading');
    //console.log($scope.post);
    //setTimeout(function() {
    $scope.$evalAsync(function($scope) {
      $scope.getContent($scope.post.author, $scope.post.permlink);    
    });
    //});
    
  });
  $ionicModal.fromTemplateUrl('templates/reply.html', {
    scope: $scope  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(item) {
    //if(!$scope.modal) return;
    setTimeout(function() {
    //$scope.$evalAsync(function( $scope ) {
      $scope.modal.show();
    //});
    }, 1);
  };

  $scope.closeModal = function() {
    $scope.replying = false;
    $rootScope.sitem.body = $scope.spost.comment;
    $rootScope.sitem.category = $scope.spost.category[0];

    console.log($rootScope.sitem, $scope.spost);
    $scope.modal.hide();
    $ionicBody.removeClass('modal-open');
  };
  $scope.translateMe = function(item, check){
    if (item.body) {
      window.limitless.translate(item.body, {to: 'pt'}).then( function(result) {
        console.log( result.text );
      })
      .catch( function(err) {
        console.log( new Error(err) );
      });
    }
  }
  $scope.isreplying = function(cho, xx, edit) {
    $scope.replying = xx;
    //console.log(cho, $scope.post);
    angular.merge($scope.post, cho);
    if (edit) {
      //$scope.post.author = $scope.post.parent_author;
      $scope.editreply = true;
      $scope.data.comment = cho.body;
      $scope.post.body = "";
    } else {
      $scope.post.author = $scope.post.author;
      $scope.data.comment = "";    
      $scope.editreply = false;
    }
    $scope.$applyAsync();
    if (xx) {
      $scope.openModal();
    } else {
      $scope.closeModal();
    }
  };
  $scope.accounts = {};

  // 포스트 내용 가져온다.
  $scope.getContent = function(author, permlink) {
    window.steem.api.setOptions({ url: localStorage.socketUrl });

    window.steem.api.getContentAsync(author, permlink, function(err, result) {
      console.log('getContentA',err, result);
      if (result) {
        var len = result.active_votes.length;
        
        if ($rootScope.user) {
          for (var j = len - 1; j >= 0; j--) {
            if (result.active_votes[j].voter === $rootScope.user.username) {
              if (result.active_votes[j].percent > 0) {
                result.upvoted = true;
              } else if (result.active_votes[j].percent < 0) {
                result.downvoted = true;
              } else {
                result.downvoted = false;
                result.upvoted = false;
              }
            }
          }
        }
        if ((typeof result.json_metadata === 'string' || result.json_metadata instanceof String)&&result.json_metadata) {
          result.json_metadata = angular.fromJson(result.json_metadata);
        }
        $scope.post = result;
        //console.log(result);
        $rootScope.sitem = result;
        $scope.post = result;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    });
  };
  var checkVote = function(post) {
    var len = post.active_votes.length;
    if ($rootScope.user) {
      for (var j = len - 1; j >= 0; j--) {
        if (post.active_votes[j].voter === $rootScope.user.username) {
          if (post.active_votes[j].percent > 0) {
            post.upvoted = true;
          } else if (post.active_votes[j].percent < 0) {
            post.downvoted = true;
          } else {
            post.downvoted = false;
            post.upvoted = false;
          }
        }
      }
    }
    return post;
  }
  var paginate = function (array, page_size, page_number) {
    --page_number; // because pages logically start with 1, but technically with 0
    console.log(array);
    return array.slice(page_number * page_size, (page_number + 1) * page_size);
  }
  var Paginator = function (items, page, per_page) {
    var page = page || 1,
    per_page = per_page || 10,
    offset = (page - 1) * per_page,
   
    paginatedItems = items.slice(offset).slice(0, per_page),
    total_pages = Math.ceil(items.length / per_page);
    return {
    page: page,
    per_page: per_page,
    pre_page: page - 1 ? page - 1 : null,
    next_page: (total_pages > page) ? page + 1 : null,
    total: items.length,
    total_pages: total_pages,
    data: paginatedItems
    };
  }

  $scope.fetchComments = function(author, permlink){
    $rootScope.fetching = true;
    //console.log(author,permlink);

    window.steem.api.getContentReplies(author, permlink, function(err, dd) {
      console.log(err, dd);
      if (dd) {
        $scope.mycomments = dd;
        $scope.comments = [];
        $scope.page_number = 0;
        $scope.comments_loaded = true;
        $rootScope.fetching = false;
        $scope.addMoreComments();
        if (!$scope.$$phase){
          $scope.$apply();
        }
      }
    });
  }
  $scope.addMoreComments = function() {
    console.log('addMoreComments', $scope.page_number);
    if ($scope.comments_loaded) {
      //var page = paginate($scope.mycomments, 5, $scope.page_number++)
      var page = Paginator($scope.mycomments, ++$scope.page_number, 5);
      console.log(page);
      $scope.comments = $scope.comments.concat(page.data)
      console.log($scope.comments);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    }
    if ($scope.comments.length >= $scope.mycomments.length) {
      $scope.comments_loaded = false;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.$on('postAccounts', function(event, data){
    console.log('postAccounts');
  });
  
  $scope.$on('$ionicView.afterEnter', function(ev){
    $rootScope.log('enter postctrl');
    $rootScope.postAccounts = [];
    $rootScope.paccounts = [];
    if ($stateParams.category === '111') {
      var ttemp = $rootScope.sitem;
      $scope.post = ttemp;
      
     
      $scope.$evalAsync(function($scope){
        $rootScope.$emit('update:content');
      });
    } else {
      if ($stateParams.author.indexOf('@')>-1){
        $stateParams.author = $stateParams.author.substr(1);
      }
      $scope.$evalAsync(function($scope){
        $scope.getContent($stateParams.author, $stateParams.permlink);    
      });      
    }
  });
  
  $scope.upvotePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'getContent');
  };
  $rootScope.$on('getContent', function() {
    setTimeout(function() {
      $scope.getContent($rootScope.sitem.author, $rootScope.sitem.permlink);  
    }, 1);
  });
  $scope.downvotePost = function(post) {
    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: $filter('translate')('FLAGGING_TEXT')
    });
    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.log('You are sure');
        $rootScope.votePost(post, 'downvote', 'getContent');
      } else {
        $rootScope.log('You are not sure');
      }
    });
  };
  $scope.unvotePost = function(post) {
    $rootScope.votePost(post, 'unvote', 'getContent');
  };


  $scope.pauseVideo = function() {
    var fr = document.getElementsByTagName("iframe")[0];
    if (fr) {
      var iframe = fr.contentWindow;
      iframe.postMessage('{"event":"command","func":"' + 'pauseVideo' +   '","args":""}', '*');
    }
  }


  $scope.playVideo = function() {
    var fr = document.getElementsByTagName("iframe")[0];
    if (fr) {
      var iframe = fr.contentWindow;
      iframe.postMessage('{"event":"command","func":"' + 'playVideo' +   '","args":""}', '*');
    }
  }


  $scope.$on('$ionicView.beforeLeave', function(){
    $scope.pauseVideo();
    //localStorage.openurl = undefined;
  });

})
//epostctrl

app.controller('FavoritesCtrl', function($scope, $stateParams, APIs, $rootScope){
  //JSON.stringify({
  $scope.removeFavorite = function(_id) {
    APIs.removeFavorite($rootScope.user.username,_id).then(function(res){
      APIs.getFavorites($rootScope.user.username).then(function(res){
        console.log(res);
        angular.forEach(res.data, function(v,k){
          v.timestamp = new Date(v.timestamp);
        })
        $scope.favorites = res.data;
      });
      $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('FAVORITE_REMOVED'));
    });
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    APIs.getFavorites($rootScope.user.username).then(function(res){
      $scope.favorites = res.data;
      $rootScope.$storage.fav = res.data;
    });
  });

})

app.controller('WelcomeCtrl', function($scope, $http, $ionicSlideBoxDelegate, $ionicSideMenuDelegate, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {

  $scope.options = {
    loop: false,
    //effect: 'fade',
    speed: 500,
  }

  $scope.skipSlides = function(){
    $rootScope.$storage.welcome = true;
    $state.go('app.posts');
  }
  $scope.nextSlide = function(){
    $scope.slider.slideNext();
  }

  // [수정] Welcome 데이터 - 2018.09.28
   $scope.slides = [
    {
      "name": "Welcome home",
      "background": "https://img.esteem.ws//suebyo7vji.png",
      "description": "We have been waiting you <br> Happy to have you with us, please come in..."
    },
    {
      "name": "Start exploring",
      "background": "https://img.esteem.ws//1rbl57vauq.png",
      "description": "Share your moments, experiences and skills with community"
    },
    {
      "name": "Get rewarded",
      "background": "https://img.esteem.ws//iuvvfjn68m.png",
      "description": "Each contribution is rewarded by community with tokens and of course with friendship"
    }
  ];
  // APIs.getWelcome().then(function(res){
  //   $scope.slides = res.data;
  // });

  $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
    // data.slider is the instance of Swiper
    $scope.slider = data.slider;
  });

  $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
    console.log('Slide change is beginning');
  });

  $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
    // note: the indexes are 0-based
    console.log('Slide change is ended');
    $scope.activeIndex = data.slider.activeIndex;
    $scope.previousIndex = data.slider.previousIndex;
    $scope.isEnd = data.slider.isEnd;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  });

  $scope.$on('$ionicView.afterEnter', function(event) { 
    $ionicSideMenuDelegate.canDragContent(false); 
  })


  /*
  $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
    // grab an instance of the slider
    $scope.slider = data.slider;
  });

  function dataChangeHandler(){
    // call this function when data changes, such as an HTTP request, etc
    if ( $scope.slider ){
      $scope.slider.updateLoop();
    }
  }
  */


})

app.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {

  $scope.removeBookmark = function(index) {
    if ($rootScope.$storage.bookmark) {
      APIs.removeBookmark(index,$rootScope.user.username).then(function(res){
        for (var i = $rootScope.$storage.bookmark.length - 1; i >= 0; i--) {
          if ($rootScope.$storage.bookmark[i]._id && $rootScope.$storage.bookmark[i]._id == index) {
            $rootScope.$storage.bookmark.splice(i,1);
          }
        }
        $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_UNBOOKMARK'));
      });
    }
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    APIs.getBookmarks($rootScope.user.username).then(function(res){
      //console.log(res);
      $rootScope.$storage.bookmark = res.data;
    });
  });
});

app.controller('DraftsCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {
  //JSON.stringify({
  $scope.removeDraft = function(_id) {
    APIs.removeDraft(_id,$rootScope.user.username).then(function(res){
      APIs.getDrafts($rootScope.user.username).then(function(res){
        //console.log(res);
        angular.forEach(res.data, function(v,k){
          v.created = new Date(v.created);
        })
        $scope.drafts = res.data;
      });
      $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_UNDRAFT'));
    });
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    APIs.getDrafts($rootScope.user.username).then(function(res){
      //console.log(res);
      angular.forEach(res.data, function(v,k){
        v.created = new Date(v.created);
      });
      $scope.drafts = res.data;
    });
  });
});

app.controller('SchedulesCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {
  //JSON.stringify({
  $scope.removeSchedule = function(_id) {
    if ($rootScope.user) {
      APIs.removeSchedule(_id, $rootScope.user.username).then(function(res){
        //APIs.getSchedules($rootScope.user.username).then(function(res){
          //console.log(res);
          $scope.schedules = res.data.schedules;
        //});
        $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('DELETED_SCHEDULE'));
      });
    }
  };

  $scope.moveSchedule = function(_id) {
    if ($rootScope.user) {
      APIs.moveSchedule(_id, $rootScope.user.username).then(function(res){
        //APIs.removeSchedule(_id, $rootScope.user.username).then(function(res){
          //APIs.getSchedules($rootScope.user.username).then(function(res){
            //console.log(res);
            $scope.schedules = res.data.schedules;

          //});
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('MOVED_SCHEDULE'));
        //});
      });
    }
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    if ($rootScope.user) {
      APIs.getSchedules($rootScope.user.username).then(function(res){
        console.log(res);
        $scope.schedules = res.data;
      });
    }
  });
});

app.controller('ImagesCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {
  //JSON.stringify({
  $scope.removeImage = function(_id) {
    APIs.removeImage(_id,$rootScope.user.username).then(function(res){
      APIs.fetchImages($rootScope.user.username).then(function(res){
        //console.log(res);
        $scope.images = res.data;
      });
      $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('IMAGE_REMOVED'));
    });
  };
  $scope.copyImage = function(url){
    cordova.plugins.clipboard.copy(url);
  };
  $scope.$on('$ionicView.beforeEnter', function(){
    APIs.fetchImages($rootScope.user.username).then(function(res){
      //console.log(res);
      $scope.images = res.data;
    });
  });
});

app.controller('NotificationsCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate) {

  $scope.removeNotification = function(index) {
    if ($rootScope.$storage.notifications) {
      $rootScope.$storage.notifications.splice(index,1);
    }
  };
})
app.controller('FollowCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate) {
  $scope.searchu = {};

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.active = "followers";
    $scope.followers = [];
    $scope.following = [];
    $scope.limit = 100;
    $scope.tt = {ruser:"", duser:""};

    $scope.rfetching = function(){
      window.steem.api.getFollowers($rootScope.user.username, $scope.tt.ruser, "blog", $scope.limit, function(err, res) {
        //console.log(err, res);
        if (res && res.length===$scope.limit) {
          $scope.tt.ruser = res[res.length-1].follower;
        }
        //console.log(res);
        var ll = res.length;
        for (var i = 0; i < ll; i++) {
          res[i].id += 1;
          $scope.followers.push(res[i]);
        }
        if (res.length < $scope.limit) {
          
          $scope.$applyAsync();
        } else {
          $scope.$evalAsync($scope.rfetching);
          //setTimeout($scope.rfetching, 2);
        }
      });
    };

    $scope.dfetching = function(){
      window.steem.api.getFollowing($rootScope.user.username, $scope.tt.duser, "blog", $scope.limit, function(err, res) {
        //console.log(err, res);
        if (res && res.length===$scope.limit) {
          $scope.tt.duser = res[res.length-1].following;
        }
        var ll = res.length;

        //console.log(res);
        for (var i = 0; i < ll; i++) {
          res[i].id += 1;
          $scope.following.push(res[i]);
        }
        if (res.length<$scope.limit) {
          
          $scope.$applyAsync();
        } else {
          $scope.$evalAsync($scope.dfetching);
          //setTimeout($scope.dfetching, 20);
        }
      });
    };

    $scope.rfetching();
    $scope.dfetching();

    window.steem.api.getFollowCountAsync($rootScope.user.username, function(err, res) {
      //console.log(err, res);
      if (res) {
        $scope.followdetails = res;
      }
    });

  });

  $scope.$on('$ionicView.leave', function(){
  });
  $scope.isFollowed = function(x) {
    var len = $scope.following.length;
    for (var i = 0; i < len; i++) {
      if ($scope.following[i].following == x) {
        return true;
      }
    }
    return false;
  };
  $scope.isFollowing = function(x) {

    var len = $scope.followers.length;
    for (var i = 0; i < len; i++) {
      if ($scope.followers[i].follower == x) {
        return true;
      }
    }
    return false;
  };
  $scope.change = function(type){
    $scope.active = type;
    console.log(type);
    //$scope.$applyAsync();
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $ionicScrollDelegate.$getByHandle('listScroll').scrollTop();
    //$scope.loadMore(type);
  }

  $scope.$on('current:reload', function(){
    $rootScope.log('current:reload');
    $state.go($state.current, {}, {reload: true});
    $scope.followers = [];
    $scope.following = [];
    //$scope.rfetching();
    //$scope.dfetching();
  });

  $scope.unfollowUser = function(xx){
    $rootScope.following(xx, "unfollow");
  };
  $scope.followUser = function(xx){
    $rootScope.following(xx, "follow");
  };
  $scope.muteUser = function(xx){
    $rootScope.following(xx, "mute");
  };
  $scope.unmuteUser = function(xx){
    $rootScope.following(xx, "unfollow");
  };
  $scope.profileView = function(xx){
    $state.go('app.profile', {username: xx});
  };

})
//sprofilectrl
app.controller('ProfileCtrl', function($scope, $stateParams, $rootScope, $ionicActionSheet, $cordovaCamera, ImageUploadService, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory, $state, APIs, $ionicPopover, $filter, $ionicModal, $ionicBody) {

  $ionicPopover.fromTemplateUrl('popoverSliderrp.html', {
      scope: $scope
  }).then(function(popover) {
      $scope.tooltipSlider = popover;
  });
  
  $scope.openSlider = function($event, d) {
    $scope.votingPost = d;
    $scope.$applyAsync();
    $scope.rangeValue = $rootScope.$storage.voteWeight/100;
    $scope.tooltipSlider.show($event);
  };

  $scope.drag = function(v) {
    //console.log(v);
    $rootScope.$storage.voteWeight = v*100;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    if (!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  }
  $scope.votePostS = function() {
    $scope.tooltipSlider.hide();
    $scope.upvotePost($scope.votingPost);
  };

  $scope.closeSlider = function() {
    $scope.tooltipSlider.hide();
  };

  $scope.translationData = { platformname: $rootScope.$storage.platformname, platformpower: $rootScope.$storage.platformpower, platformsunit:"$1.00" };

  $scope.goBack = function() {
    var viewHistory = $ionicHistory.viewHistory();
    if (!viewHistory.backView) {
      $scope.openMenu();
    } else {
      $ionicHistory.goBack();
    }
  };
  $scope.followUser = function(xx){
    $rootScope.following(xx, "follow");
  };
  $scope.unfollowUser = function(xx){
    $rootScope.log(xx);
    $rootScope.following(xx, "unfollow");
  };
  
  $scope.muteUser = function(xx){
    $rootScope.following(xx, "mute");
  };
  $scope.$on('current:reload', function(){
    $state.go($state.current, {}, {reload: true});
  });

  $ionicPopover.fromTemplateUrl('popoverPTr.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.tooltip = popover;
   });

   $scope.openTooltip = function($event, d) {
    var tppv = Number(d.pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
    var tpv = Number(d.total_payout_value.split(' ')[0]+d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var ar = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var pout = d.last_payout=="1970-01-01T00:00:00"?d.cashout_time:d.last_payout;
    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PROMOTED')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(p,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('AUTHOR_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(ar,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('CURATION_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(crp,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(pout, true)+"</div></div>";
    $scope.tooltipText = texth;
    $scope.tooltip.show($event);
   };

   $scope.closeTooltip = function() {
      $scope.tooltip.hide();
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.tooltip.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });

  $ionicModal.fromTemplateUrl('my-edit.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalEdit = modal;
  });
  $scope.closeEdits = function() {
    $scope.modalEdit.hide();
    $ionicBody.removeClass('modal-open');
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modalEdit.remove();
    //$scope.modalStats.remove();
  });
  
  $scope.navPost = function(xy) {
    $scope.closeStats();
    var at = xy.author?xy.author:$scope.user.username;
    $state.go('app.post',{category:'tag',author:at, permlink:xy.permlink});
  }
  $scope.showStats = function(user) {
    console.log(user);
    //$scope.modalStats.show();
    $state.go('app.activity',{username:user});
  }
  $scope.edit = {};
  $scope.showEdits = function() {
    //showedits
    $scope.edit = {};
    $scope.edit = $rootScope.user.json_metadata || {};
    $scope.modalEdit.show();
  }
  
  $scope.saveEdit = function(){
    //console.log($scope.edit);
    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: ""
    });
    confirmPopup.then(function(res) {
      if(res) {
        if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
          $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
        } else {
          var update = $rootScope.user.json_metadata;
          angular.merge(update, $scope.edit);
          if (update.profilePicUrl) {delete update.profilePicUrl;}
          $rootScope.log('You are sure');
          if ($rootScope.user) {

            var wif = $rootScope.user.password
            ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
            : $rootScope.$storage.user.privateActiveKey;

            window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
              //$rootScope.$storage.user.memo_key
              //console.log(err, result);
              $scope.modalEdit.hide();
              if (err) {
                var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
              } else {
                $rootScope.$broadcast('refreshLocalUserData');
              }
            });
            $rootScope.$broadcast('hide:loading');
          } else {
            $rootScope.$broadcast('hide:loading');
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
          }
        }
      }
    });
  }
  $scope.showProfile = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: $filter('translate')('CAPTURE_PICTURE') },
       { text: $filter('translate')('SELECT_PICTURE') },
       { text: $filter('translate')('SET_CUSTOM_URL') },
     ],
     destructiveText: $filter('translate')('RESET'),
     titleText: $filter('translate')('MODIFY_PICTURE'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
      if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
      } else {
        $scope.changeProfileInfo(index, 'profile');
      }
      return true;
     },
     destructiveButtonClicked: function(index){
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('RESET_PICTURE_TEXT')
      });
      confirmPopup.then(function(res) {
        if(res) {
          if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
            $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
          } else {
            var update = {profile: {profile_image:""} };
            angular.merge(update, $rootScope.user.json_metadata);
            if (update.profilePicUrl) {delete update.profilePicUrl;}

            update.profile.profile_image = "";

            $rootScope.log('You are sure');
            if ($rootScope.user) {
              
              var wif = $rootScope.user.password
              ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
              : $rootScope.user.privateActiveKey;

              window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
                //console.log(err, result);
                $scope.modalEdit.hide();
                if (err) {
                  var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                  $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
                } else {
                  $rootScope.$broadcast('refreshLocalUserData');
                }
              });
              $rootScope.$broadcast('hide:loading');
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
            }
          }
        } else {
          $rootScope.log('You are not sure');
        }
      });
      return true;
     }
   });
  };


  $scope.changeProfileInfo = function(type, which) {
    if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
      $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
    } else {
      var options = {};
      if (type == 0 || type == 1) {
        options = {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: (type===0)?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: (type===0)?true:false,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: which==='profile'?500:1000,
          targetHeight: 500,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation:true
        };
        $cordovaCamera.getPicture(options).then(function(imageData) {
          ImageUploadService.uploadImage(imageData).then(function(result) {
            //var url = result.secure_url || '';
            var url = result.url || '';
            var update = { profile: { cover_image: "", profile_image: ""} };
            if (which === 'profile') {
              angular.merge(update, $rootScope.user.json_metadata);
              if (update.profilePicUrl) {delete update.profilePicUrl;}
              update.profile.profile_image = url;
            } else {
              angular.merge(update, $rootScope.user.json_metadata);
              update.profile.cover_image = url;
            }

            setTimeout(function() {
              $rootScope.$broadcast('show:loading');
              if ($rootScope.user) {

                var wif = $rootScope.user.password
                ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
                : $rootScope.user.privateActiveKey;

                window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
                  //console.log(err, result);
                  $scope.modalEdit.hide();
                  if (err) {
                    var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                    $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message);
                  } else {
                    $rootScope.$broadcast('refreshLocalUserData');
                  }
                });
              $rootScope.$broadcast('hide:loading');
              } else {
                $rootScope.$broadcast('hide:loading');
                $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
              }
            }, 5);
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          },
          function(err) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('UPLOAD_ERROR'));
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          });
        }, function(err) {
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('CAMERA_CANCELLED'));
        });
      } else {
        $ionicPopup.prompt({
          title: $filter('translate')('SET_URL'),
          template: $filter('translate')('DIRECT_LINK_PICTURE'),
          inputType: 'text',
          inputPlaceholder: 'http://example.com/image.jpg'
        }).then(function(res) {
          $rootScope.log('Your url is'+ res);
          if (res) {
            var update = { profile: { profile_image: "", cover_image:"" } };
            if (which==="profile") {
              angular.merge(update, $rootScope.user.json_metadata);
              if (update.profilePicUrl) {delete update.profilePicUrl;}
              update.profile.profile_image = res;
            } else {
              angular.merge(update, $rootScope.user.json_metadata);
              update.profile.cover_image = res;
            }

            setTimeout(function() {
              if ($rootScope.user) {

                var wif = $rootScope.user.password
                ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
                : $rootScope.user.privateActiveKey;
                //console.log($rootScope.user.memo_key);
                window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
                  //console.log(err, result);
                  $scope.modalEdit.hide();
                  if (err) {
                    var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                    $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
                  } else {
                    //$scope.refreshLocalUserData();
                    $rootScope.$broadcast('refreshLocalUserData');
                  }
                });
                $rootScope.$broadcast('hide:loading');
              } else {
                $rootScope.$broadcast('hide:loading');
                $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
              }
            }, 5);
          }
        });
      }
    }
  };

  $scope.showCover = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: $filter('translate')('CAPTURE_PICTURE') },
       { text: $filter('translate')('SELECT_PICTURE') },
       { text: $filter('translate')('SET_CUSTOM_URL') },
     ],
     destructiveText: $filter('translate')('RESET'),
     titleText: $filter('translate')('MODIFY_COVER_PICTURE'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
      if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
      } else {
        $scope.changeProfileInfo(index, 'cover');
      }
      return true;
     },
     destructiveButtonClicked: function(index){
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('RESET_COVER_PICTURE_TEXT')
      });
      confirmPopup.then(function(res) {
        if(res) {
          if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
            $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
          } else {
            var update = {profile: {cover_image:""} };
            angular.merge(update, $rootScope.user.json_metadata);
            update.profile.cover_image = "";

            $rootScope.log('You are sure');
            if ($rootScope.user) {

              var wif = $rootScope.user.password
              ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'owner')
              : $rootScope.user.privateOwnerKey;

              window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
                //console.log(err, result);
                $scope.modalEdit.hide();
                if (err) {
                  var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                  $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
                } else {
                  //$scope.refreshLocalUserData();
                  $rootScope.$broadcast('refreshLocalUserData');
                }
              });
              $rootScope.$broadcast('hide:loading');
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
            }
          }
        } else {
          $rootScope.log('You are not sure');
        }
      });
      return true;
     }
   });
  };


  $rootScope.$on('profileRefresh', function(){
    console.log('profileRefresh');
    $scope.refresh();
  });
  $scope.upvotePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'profileRefresh');
  };
  $scope.downvotePost = function(post) {
    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: $filter('translate')('FLAGGING_TEXT')
    });
    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.log('You are sure');
        $rootScope.votePost(post, 'downvote', 'profileRefresh');
      } else {
        $rootScope.log('You are not sure');
      }
    });
  };
  $scope.unvotePost = function(post) {
    $rootScope.votePost(post, 'unvote', 'profileRefresh');
  };

  $scope.isAmFollowing = function(xx) {
    //console.log($scope.following);
    if ($scope.following && $scope.following.indexOf(xx)!==-1) {
      return true;
    } else {
      return false;
    }
  };
  
  $scope.isAmMuting = function(xx) {
    //console.log($scope.muting);
    if ($scope.muting && $scope.muting.indexOf(xx)!==-1) {
      return true;
    } else {
      return false;
    }
  };
  
  $scope.ifExists = function(xx){
    for (var i = 0; i < $scope.data.profile.length; i++) {
      if ($scope.data.profile[i].permlink === xx){
        return true;
      }
    }
    return false;
  }
  $scope.end = false;
  $scope.clen = 20;
  $scope.moreDataCanBeLoaded = function(){
    return ($scope.data.profile && $scope.data.profile.length>0) && !$scope.end;
  }
  var processData = function(response) {
    for (var j = 0; j < response.length; j++) {
      var v = response[j];
      
      var found = false;
      for (var i = $scope.data.profile.length-1; i >= 0; i--) {
        if ($scope.data.profile[i].id === v.id){
          found = true;
          //console.log($scope.data.profile[i].id, v.id);
        }
      }
      if (!found){
        //console.log(v.id);
        if ($rootScope.user){
          if ($rootScope.user.username !== v.author) {
            v.reblogged = true;
          }
          var len = v.active_votes.length;
          for (var j = len - 1; j >= 0; j--) {
            if (v.active_votes[j].voter === $rootScope.user.username) {
              if (v.active_votes[j].percent > 0) {
                v.upvoted = true;
              } else if (v.active_votes[j].percent < 0) {
                v.downvoted = true;
              } else {
                v.upvoted = false;
                v.downvoted = false;
              }
            }
          }
        }
        $scope.data.profile.push(v);  
      }
      
      $scope.$applyAsync();
    }
  }
  $scope.loadmore = function() {
    //console.log('loadmore');
    var params = {tag: $stateParams.username, limit: 20, filter_tags:[]};
    var len = $scope.data.profile?$scope.data.profile.length:0;

    $scope.$applyAsync();
    /*if (!$scope.$$phase) {
      $scope.$apply();
    }*/
    if (len < 20) {
      $scope.end = true;
    }
    if (len>0) {
      //delete params.limit;
      //console.log($scope.data.profile);
      var ll = $scope.data.profile.length;
      params.start_author = $scope.data.profile[ll-1].author;
      params.start_permlink = $scope.data.profile[ll-1].permlink;

      if ($scope.end) {
        //$rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('REQUEST_LIMIT_TEXT'));
        $scope.$broadcast('scroll.infiniteScrollComplete');
        //$rootScope.$broadcast('hide:loading');
      } else {
        //console.log(params);
        //$rootScope.log("fetching profile...blog 20 ");
        if ($scope.active == 'blog') {
          if ($rootScope.$storage.chain == 'golos') {
            params.select_authors = [$stateParams.username];
            delete params.tags;   
          }
          window.steem.api.getDiscussionsByBlog(params, function(err, response) {
            //console.log(err, response, params);
            if (response) {
              if (response.length <= 1) {
                $scope.end = true;
              } else {
                $scope.end = false;
              }
              processData(response);
            }
            
            $scope.$applyAsync();
            $scope.$broadcast('scroll.infiniteScrollComplete');
          });
        }
        if ($scope.active == 'posts') {
          window.steem.api.getDiscussionsByComments(params, function(err, response) {
            //console.log(err, response);
            if (response) {
              if (response.length <= 1) {
                $scope.end = true;
              } else {
                $scope.end = false;
              }
              for (var j = 0; j < response.length; j++) {
                var v = response[j];

                //v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):v.json_metadata;
                $scope.$applyAsync();
                var found = false;
                for (var i = $scope.data.profile.length-1; i >= 0; i--) {
                  if ($scope.data.profile[i].id === v.id){
                    found = true;
                    //console.log($scope.data.profile[i].id, v.id);
                  }
                }
                if (!found){
                  //console.log(v.id);
                  if ($rootScope.user){
                    if ($rootScope.user.username !== v.author) {
                      v.reblogged = true;
                    }
                    var len = v.active_votes.length;
                    for (var j = len - 1; j >= 0; j--) {
                      if (v.active_votes[j].voter === $rootScope.user.username) {
                        if (v.active_votes[j].percent > 0) {
                          v.upvoted = true;
                        } else if (v.active_votes[j].percent < 0) {
                          v.downvoted = true;
                        } else {
                          v.upvoted = false;
                          v.downvoted = false;
                        }
                      }
                    }
                  }
                  $scope.data.profile.push(v);
                }
                if (response.length <= 1) {
                  $scope.end = true;
                } else {
                  $scope.end = false;
                }
              }
            }
          });
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        if ($scope.active == 'recent-replies') {
          var pp = [, , 20];

          window.steem.api.getRepliesByLastUpdate($scope.data.profile[$scope.data.profile.length-1].author, $scope.data.profile[$scope.data.profile.length-1].permlink, 20, function(err, response) {
            //console.log(err, response);
            if (response) {
              if (response.length <= 1) {
                $scope.end = true;
              } else {
                $scope.end = false;
              }
              for (var j = 0; j < response.length; j++) {
                var v = response[j];
                //v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):v.json_metadata;
                $scope.$applyAsync();
                var found = false;
                for (var i = $scope.data.profile.length-1; i >= 0; i--) {
                  if ($scope.data.profile[i].id === v.id){
                    found = true;
                    //console.log($scope.data.profile[i].id, v.id);
                  }
                }
                if (!found){
                  //console.log(v.id);
                  if ($rootScope.user){
                    if ($rootScope.user.username !== v.author) {
                      v.reblogged = true;
                    }
                    var len = v.active_votes.length;
                    for (var j = len - 1; j >= 0; j--) {
                      if (v.active_votes[j].voter === $rootScope.user.username) {
                        if (v.active_votes[j].percent > 0) {
                          v.upvoted = true;
                        } else if (v.active_votes[j].percent < 0) {
                          v.downvoted = true;
                        } else {
                          v.upvoted = false;
                          v.downvoted = false;
                        }
                      }
                    }
                  }
                  $scope.data.profile.push(v);
                }
                if (response.length <= 1) {
                  $scope.end = true;
                } else {
                  $scope.end = false;
                }
              }
            }
          });
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        //console.log($scope.profile);
      }
    }

  }

  $scope.dfetching = function(){
    if ($rootScope.user) {
      window.steem.api.getFollowing($rootScope.user.username, $stateParams.username, "blog", $scope.limit, function(err, res) {
        console.log(err, res);
        var len = res.length;
        for (var i = 0; i < len; i++) {
          $scope.following.push(res[i].following);
        }
        $scope.$applyAsync();
      });
    }
      
    };
    $scope.mfetching = function(){
      if ($rootScope.user) {
        window.steem.api.getFollowing($rootScope.user.username, $stateParams.username, "ignore", $scope.limit, function(err, res) {
          console.log(err, res);
          var len = res.length;
          for (var i = 0; i < len; i++) {
            $scope.muting.push(res[i].following);
          }
          $scope.$applyAsync();
        });
      }
    };
    $scope.rfetching = function(){
      window.steem.api.getFollowers($rootScope.user.username, $stateParams.username, "blog", $scope.limit, function(err, res) {
        console.log(err, res);
        var len = res.length;
        for (var i = 0; i < len; i++) {
          $scope.follower.push(res[i].follower);
        }
        $scope.$applyAsync();
      });
    };
    $scope.getFollows = function(r,d, m) {      
      if (r) {
        $rootScope.log("rfetching");
        $scope.rfetching();
      }
      if (d) {
        $rootScope.log("dfetching");
        $scope.dfetching();
      }
      if (m) {
        $rootScope.log("mfetching");
        $scope.mfetching();
      }
    };
    $scope.getOtherUsersData = function() {
      console.log("getOtherUsersData");
      window.steem.api.getAccountsAsync([$stateParams.username], function(err, dd){
        //console.log(err, dd);
        if (dd) {
          $scope.$evalAsync(function($scope){
            dd = dd[0];
            if (dd && dd.json_metadata) {
              dd.json_metadata = angular.fromJson(dd.json_metadata);
            }
            angular.merge($scope.user, dd);
            //console.log(angular.toJson($scope.user));
            //console.log($scope.user.json_metadata.profile.cover_image);

            if ($rootScope.user) {
              $scope.css = ($rootScope.user.username === $scope.user.username && $rootScope.user.json_metadata.profile.cover_image) ? {'background': 'url('+$rootScope.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed', 'box-shadow':'inset 0 0 0 2000px rgba(41,75,120,0.7)' } : ($rootScope.user.username !== $scope.user.username && ($scope.user.json_metadata && $scope.user.json_metadata.profile && $scope.user.json_metadata.profile.cover_image)) ? {'background': 'url('+$scope.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed', 'box-shadow':'inset 0 0 0 2000px rgba(0,0,0,0.5)'} : null;
            } else {
              $scope.css = null;
            }
            //console.log($scope.css);
          });
        }
      });

      $scope.$evalAsync(function($scope){
        window.steem.api.getFollowCountAsync($stateParams.username, function(err, res) {
          //console.log(err, res);
          if (res) {
            $scope.followdetails = res;
          }
        });
        $scope.getFollows(null, "d", "m");
      });
    };
  $scope.$on('$ionicView.beforeEnter', function(){

    $scope.user = {username: $stateParams.username};
    $scope.follower = [];
    $scope.following = [];
    $scope.muting = [];
    $scope.limit = 15;
    $scope.tt = {duser: "", ruser: ""};

    if ($rootScope.user) {
      if ($rootScope.user.username !== $stateParams.username) {
        $scope.getOtherUsersData();
      } else {
        $rootScope.log("get follows counts");
        $scope.$evalAsync(function($scope){
          window.steem.api.getFollowCountAsync($stateParams.username, function(err, res) {
            //console.log(err, res);
            if (res)
              $scope.followdetails = res;
          });
        });
      }
    } else {
      if ($stateParams.username) {
        $scope.getOtherUsersData();
      }
    }

    $scope.refresh = function() {
      if (!$scope.active) {
        $scope.active = "blog";
      }
      if ($scope.active != "blog") {
        $scope.rest = "/"+$scope.active;
      } else {
        $scope.rest = "";
      }
      console.log('refresh profile '+$scope.active);
      $scope.nonexist = false;

      window.steem.api.getState("/@"+$stateParams.username+$scope.rest, function(err, res) {
        //console.log(err, res);
        if (res && res.content) {
          $scope.data = {profile: []};
            angular.forEach(res.content, function(v,k){
              
              if ($rootScope.user){
                if ($rootScope.user.username !== v.author) {
                  v.reblogged = true;
                }
                var len = v.active_votes.length;
                for (var j = len - 1; j >= 0; j--) {
                  if (v.active_votes[j].voter === $rootScope.user.username) {
                    if (v.active_votes[j].percent > 0) {
                      v.upvoted = true;
                    } else if (v.active_votes[j].percent < 0) {
                      v.downvoted = true;
                    } else {
                      v.upvoted = false;
                      v.downvoted = false;
                    }
                  }
                }
              }
              $scope.data.profile.push(v);
              //$scope.$applyAsync();
            });
            $scope.nonexist = false;
            //$scope.$applyAsync();
            if (!$scope.$$phase){
              $scope.$apply();
            }
          //});
          } else {
            $scope.nonexist = true;
          }
      });
      //var today = new Date();
      $scope.$evalAsync(function($scope){
        if ($rootScope.user && $stateParams.username == $rootScope.user.username) {
          APIs.getVotes($stateParams.username).then(function(res){
            if (res) {
              $rootScope.log(angular.toJson(res.data));
              $scope.votecount = res.data.count;
            }
            //$scope.$applyAsync();
          });
        } else {
          $scope.votecount = 0;
        }
      });
    };
    if ($stateParams.username !== $rootScope.user.username) {
       $rootScope.isfavor($stateParams.username);
    }
    $scope.refresh();
  });
  $scope.openMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  }
  $scope.change = function(type){
    $scope.data = undefined;

    $scope.data = {profile: []};
    $scope.accounts = [];
    $scope.active = type;
    $scope.end = false;
    
    //$scope.$applyAsync();
    if (type != "blog") {
      $scope.rest = "/"+type;
    } else {
      $scope.rest = "";
    }
    window.steem.api.getStateAsync("/@"+$stateParams.username+$scope.rest, function(err, res) {
      //console.log(err, res);
      if (res && res.content) {
        
        angular.forEach(res.content, function(v,k){
          
          if ($rootScope.user){
            if ($rootScope.user.username !== v.author) {
              v.reblogged = true;
            }
            var len = v.active_votes.length;
            for (var j = len - 1; j >= 0; j--) {
              if (v.active_votes[j].voter === $rootScope.user.username) {
                if (v.active_votes[j].percent > 0) {
                  v.upvoted = true;
                } else if (v.active_votes[j].percent < 0) {
                  v.downvoted = true;
                } else {
                  v.upvoted = false;
                  v.downvoted = false;
                }
              }
            }
          }
          $scope.data.profile.push(v);
        });
        $scope.nonexist = false;

        if (!$scope.$$phase){
          $scope.$apply();
        }
        //});
      } else {
        $scope.nonexist = true;
      }
      
      
      if (type==="transfers" || type==="permissions") {
        //$scope.$evalAsync(function($scope){
          console.log(res);
          if (res) {
            for (var property in res.accounts) {
              if (res.accounts.hasOwnProperty(property)) {
                $scope.accounts = res.accounts[property];
                //$rootScope.log(angular.toJson(res.accounts[property].transfer_history));

                $scope.transfers = res.accounts[property].transfer_history.slice(Math.max(res.accounts[property].transfer_history.length - 50, 0))//res.accounts[property].transfer_history;
                //console.log(res.transfers);
                $scope.nonexist = false;
              }
            }  
          }
        //});
        //$scope.$applyAsync();
        if (!$scope.$$phase){
          $scope.$apply();
        }
      }
      
    });
  }
  $scope.claim_rewards = function(){
    if ($rootScope.user) {

      var wif = $rootScope.user.password
      ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
      : $rootScope.user.privatePostingKey;

      window.steem.broadcast.claimRewardBalanceAsync(wif, $rootScope.user.username, $scope.accounts.reward_steem_balance, $scope.accounts.reward_sbd_balance, $scope.accounts.reward_vesting_balance, function(err, result) {
        //console.log(err, result);
        if (err) {
          var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message);
          } else {
            $scope.change('transfers');
          }
          $rootScope.$broadcast('hide:loading');
      });

      $rootScope.$broadcast('hide:loading');
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    } else {
      $rootScope.$broadcast('hide:loading');
      post.invoting = false;
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  }
})
//eprofilectrl

app.controller('ExchangeCtrl', function($scope, $stateParams, $rootScope, $filter) {
  $scope.username = $stateParams.username;

  var power = 100;
  var precision = 1000;

  function generateBidAsk(bidsArray, asksArray) {
    // Input raw orders (from TOP of order book DOWN), output grouped depth
    function aggregateOrders(orders) {
        if(typeof orders == 'undefined') {
          return [];
        }
        var ttl = 0
        return orders.map( function(o) {
            ttl += o.sbd;
            return [parseFloat(o.real_price) * power, ttl]
        }).sort(function(a, b) { // Sort here to make sure arrays are in the right direction for HighCharts
            return a[0] - b[0];
        });
    }
    var bids = aggregateOrders(bidsArray);

    // Insert a 0 entry to make sure the chart is centered properly
    bids.unshift([0, bids[0][1]]);
    var asks = aggregateOrders(asksArray);
    // Insert a final entry to make sure the chart is centered properly
    asks.push([asks[asks.length - 1][0] * 4, asks[asks.length - 1][1]]);
    
    return {bids, asks};
  }

  function getMinMax(bids, asks) {
      var highestBid = bids.length ? bids[bids.length-1][0] : 0;
      var lowestAsk = asks.length ? asks[0][0] : 1;

      var middle = (highestBid + lowestAsk) / 2;

      return {
          min: Math.max(middle * 0.65, bids[0][0]),
          max: Math.min(middle * 1.35, asks[asks.length-1][0])
      }
  }

  function generateDepthChart(bidsArray, asksArray) {
    var dd = generateBidAsk(bidsArray, asksArray);
    var series = [];
    //console.log(dd);

    var mm = getMinMax(dd.bids, dd.asks);
    
    var depth_chart_config = {
        title:    {text: null},
        subtitle: {text: null},
        chart:    {type: 'area', zoomType: 'x'},
        //chartType: 'stock',
        xAxis:    {
            min: mm.min,
            max: mm.max,
            labels: {
                formatter: function() {return this.value / power;}
            },
            ordinal: false,
            lineColor: "#000000",
            title: {
                text: null
            }
        },
        yAxis:    {
            title: {text: null},
            lineWidth: 2,
            labels: {
                //align: "left",
                formatter: function () {
                  //console.log(this.value, precision);
                    var value = this.value/precision;
                    return '$' + (value > 10e6 ? (value/10e6) + "M" :
                        value > 10000 ? (value/10e3) + "k" :
                        value);
                }
            },
            gridLineWidth: 1,
        },
        legend: {enabled: false},
        credits: {
            enabled: false
        },
        rangeSelector: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        dataGrouping: {
            enabled: false
        },
        plotOptions: {series: {animation: false}},
        //series,
        series: [{
            type: 'area',
            step: 'right', 
            name: $filter('translate')('BUY'), 
            color: 'rgba(0,150,0,1.0)', 
            fillColor: 'rgba(0,150,0,0.2)', 
            tooltip: {
              shared: false,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              headerFormat: null,
              pointFormatter: function() {
                var ll = '<span>\u25CF</span><span>'+$filter('translate')('PRICE')+': '+(this.x / power).toFixed(6)+' '+$filter('getCurrencySymbol')($rootScope.$storage.currency)+'/'+$rootScope.$storage.platformlunit+'</span><br/><span>\u25CF</span>'+this.series.name+': <b>'+(this.y / 1000).toFixed(3)+' '+$filter('getCurrencySymbol')($rootScope.$storage.currency)+ '('+$rootScope.$storage.platformdunit+')</b>';
                return ll;
              }
            },
            data:  dd.bids,
            style: {
                color: "#FFFFFF"
            }
          },
          {
            type: 'area',
            step: 'left', 
            name: $filter('translate')('SELL'), 
            color: 'rgba(150,0,0,1.0)', 
            fillColor: 'rgba(150,0,0,0.2)', 
            tooltip: {
              shared: false,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              headerFormat: null,
              pointFormatter: function() {
              var ll = '<span>\u25CF</span><span>'+$filter('translate')('PRICE')+': '+(this.x / power).toFixed(6)+' '+$filter('getCurrencySymbol')($rootScope.$storage.currency)+'/'+$rootScope.$storage.platformlunit+'</span><br/><span>\u25CF</span>'+this.series.name+': <b>'+(this.y / 1000).toFixed(3)+' '+$filter('getCurrencySymbol')($rootScope.$storage.currency)+ '('+$rootScope.$storage.platformdunit+')</b>';
              return ll;
              }
            },
            data: dd.asks,
            style: {
                color: "#FFFFFF"
            }
          }]
    };
    //------------------------------
    return depth_chart_config;
  }

  function generateHistory(historyArray){
    if(typeof historyArray == 'undefined') {
      return [];
    }

    var nh = historyArray.map(function(h) {
        //console.log(h);
        var o = parseFloat(h.open_pays.split(' ')[0]);
        var c = parseFloat(h.current_pays.split(' ')[0]);
        var p = c/o;
        h.price = p;
      return h;
    });
    var prices = [];
    var dates = [];
    for (var i = 0; i < nh.length; i++) {
      dates.push($filter('timeago')(nh[i].date));
      prices.push(nh[i].price);
    }
    var x = dates.reverse();
    var y = prices.reverse();
    return {x, y};
  };
  
  function generateHistoryChart(historyArray) {
    
    var ddd = generateHistory(historyArray);
    

    var history_chart_config = {
        title:    {text: null},
        subtitle: {text: null},
        //chart:    {type: 'area', zoomType: 'x'},
        //chartType: 'stock',
        xAxis: {
            categories: ddd.x
        },
        yAxis: {
          title: {
                text: null
            }
        },
        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat: '<small>{point.key}</small><table>',
            pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                '<td style="text-align: right"><b>{point.y} EUR</b></td></tr>',
            footerFormat: '</table>',
            valueDecimals: 2
        },

        series: [{
            name: 'Price',
            data: ddd.y
        }],
        legend: {enabled: false},
        credits: {
            enabled: false
        },
        rangeSelector: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        dataGrouping: {
            enabled: false
        },
        plotOptions: {series: {animation: false}},
    };
    //------------------------------
    return history_chart_config;
  }


  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.active = 'buy';
    $scope.orders = [];
    window.steem.api.getOrderBook(25, function(err, result) {
      //console.log(err, result);
      $scope.orders = result;

      //$scope.$evalAsync(function($scope){
        $scope.depth_chart_config = generateDepthChart($scope.orders.bids, $scope.orders.asks);
      //});
    });
    $scope.change = function(type){
      $scope.active = type;
      if (type == "open"){
        window.steem.api.getOpenOrders($stateParams.username, function(err, result) {
          //console.log(err, result);
          $scope.openorders = result;
          
          $scope.$applyAsync();
        });
      }
      if (type == "history"){
        $scope.history = [];
        window.steem.api.getRecentTrades(25, function(err, result) {
          $scope.recent_trades = result;
          //console.log(result);

          //$scope.$evalAsync(function($scope){
            $scope.history_chart_config = generateHistoryChart($scope.recent_trades);
          //})
        });
      }
    };
  });

});
app.controller('MarketCtrl', function($scope, $rootScope, $state, $ionicPopover, $ionicPopup, $filter, $translate, $ionicPlatform, $window) {

  $scope.requestApp = function(name) {
    $ionicPlatform.ready(function() {
      if (name == 'New') {
        window.open("mailto:info@esteem.ws?subject=Suggesting%20New%20App%20for%20Market%20Place&body=Hello!%0D%0A%0D%0AAppName:%0D%0AAppAuthor:%0D%0AAppLink:%0D%0A%0D%0A", "_system");
      }
      if (ionic.Platform.isIOS() || ionic.Platform.isIPad()) {
        if (name == 'SteemMonitor') {
          //cordova.plugins.market.open('id1158918690');
          window.open("itms-apps://itunes.apple.com/app/id1158918690", "_system");
        }
        if (name == 'SteemFest') {
          //cordova.plugins.market.open('id1171371708');
          window.open("itms-apps://itunes.apple.com/app/id1171371708", "_system");
        }
      } else {
        if (name == 'SteemMonitor') {
          //cordova.plugins.market.open('com.netsolutions.esteemwitness');
          window.open("market://details?id=com.netsolutions.esteemwitness", "_system");
        }
        if (name == 'SteemFest') {
          //cordova.plugins.market.open('com.netsolutions.steemfest');
          window.open("market://details?id=com.netsolutions.steemfest", "_system");
        }
      }
    });
  }

});

app.controller('ActivityCtrl', function($scope, $rootScope, APIs, $stateParams, $ionicNavBarDelegate, $ionicActionSheet, $filter){
  $scope.filter = {activity: 'votes'};
  $scope.activities=[{text:'Votes', value:'votes' },{text:'Replies',value:'replies'},{text:'Mentions',value:'mentions'},{text:'Follows',value:'follows'},{text:'Reblogs',value:'reblogs'},{text:'Leaderboard',value:'leaderboard'},{text:'Achievements',value:'achievements'}];
  $scope.data = {loading:false};

  $scope.showActivityFilters = function() {
    var filterSheet = $ionicActionSheet.show({
     buttons: $scope.activities,
     //titleText: $filter('translate')('SORT_POST_BY'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
      $scope.filter.activity = $scope.activities[index].value;
      $scope.changeType();
      return true;
     }
    });
  }

  $scope.changeType = function() {
    //$scope.data = {};
    $scope.data.loading = true;
    if (!$scope.$$phase){
      $scope.$apply();
    }
    if ($scope.filter.activity == 'votes') {
      APIs.getMyVotes($stateParams.username).then(function(res){
        if (res) {
          //$rootScope.log(angular.toJson(res.data));
          if (res.data.fatal) {
            //$scope.showVotes();
            $scope.data.loading = false;
          } else {
            $scope.data.votes = build(res.data);  
            $scope.data.loading = false;
          }
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      });
    } else if ($scope.filter.activity == 'replies') {
      APIs.getMyReplies($stateParams.username).then(function(res){
        if (res) {
          $rootScope.log(angular.toJson(res.data));
          if (res.data.fatal) {
            //$scope.showMentions();
            $scope.data.loading = false;
          } else {
            $scope.data.replies = build(res.data);  
            $scope.data.loading = false;
          }
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      });
    } else if ($scope.filter.activity == 'mentions') {
      APIs.getMyMentions($stateParams.username).then(function(res){
        if (res) {
          //$rootScope.log(angular.toJson(res.data));
          if (res.data.fatal) {
            //$scope.showMentions();
            $scope.data.loading = false;
          } else {
            $scope.data.mentions = build(res.data);  
            $scope.data.loading = false;
          }
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      });
    } else if ($scope.filter.activity == 'follows') {
      APIs.getMyFollows($stateParams.username).then(function(res){
        if (res) {
          $rootScope.log(angular.toJson(res.data));
          if (res.data.fatal) {
            //$scope.showMentions();
            $scope.data.loading = false;
            console.log(res);
          } else {
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].json = angular.fromJson(res.data[i].json);
            }
            $scope.data.follows = build(res.data);
            $scope.data.loading = false;
          }
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      });
    } else if ($scope.filter.activity == 'reblogs') {
      APIs.getMyReblogs($stateParams.username).then(function(res){
        if (res) {
          //$rootScope.log(angular.toJson(res.data));
          if (res.data.fatal) {
            //$scope.showMentions();
            console.log(res);
            $scope.data.loading = false;
          } else {
            for (var i = 0; i < res.data.length; i++) {
              res.data[i].json = angular.fromJson(res.data[i].json);
            }
            $scope.data.reblogs = build(res.data); 
            $scope.data.loading = false; 
          }
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      });
    } else if ($scope.filter.activity == 'leaderboard') {
      APIs.getLeaderboard().then(function(res){
        if (res) {
          //$rootScope.log(angular.toJson(res.data));
          if (res.data.fatal) {
            //$scope.showMentions();
            console.log(res);
            $scope.data.loading = false;
          } else {
            $scope.data.leaderboard = res.data;  
            $scope.data.loading = false;
          }
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      });
    } else if ($scope.filter.activity == 'achievements') {
      $scope.data.loading = false;
      /*APIs.getMyAchievements($stateParams.username).then(function(res){
        if (res) {
          //$rootScope.log(angular.toJson(res.data));
          if (res.data.fatal) {
            //$scope.showMentions();
            console.log(res);
            $scope.data.loading = false;
          } else {
            $scope.data.achievements = res.data;  
            $scope.data.loading = false;
          }
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      });*/
    }
  }
  
  var date2key = function (s){
      return moment(s).calendar(null, {
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'DD/MM/YYYY'
      });
  }
  var maxGroup = 20;
  var build = function(rawData){
      var dateList = [];
      
      for(var i = 0; i<rawData.length; i++){
          var k = date2key(rawData[i].timestamp);
          if(dateList.indexOf(k) == -1){
               dateList.push(k);
          }
      }
      
      var data = [];
      for(var m = 0; m < dateList.length; m++){
          var k = dateList[m];
          var records = [];
          
          for(var l = 0; l<rawData.length; l++){
              if(date2key(rawData[l].timestamp) === k){
                  records.push(rawData[l]);
              }
          }
          
          data.push({'key': k, 'records': records});
          
          if(data.length >= maxGroup){
              if( m < (dateList.length-1)){
                      $scope.hasMore = true;
              }
              break;
          }
      }
      return data;
  }
  
  $scope.$on('$ionicView.beforeEnter', function(){
    $ionicNavBarDelegate.showBar(true);
    $scope.changeType();
  });

});

app.controller('SettingsCtrl', function($scope, $stateParams, $rootScope, $ionicHistory, $state, $ionicPopover, $ionicPopup, APIs, $filter, $translate, $window, $ionicSideMenuDelegate) {

   $ionicPopover.fromTemplateUrl('popover.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.tooltip = popover;
   });
  APIs.getNodes().then(function(res){
    console.log(res);
    if ($rootScope.$storage.chain == 'steem'){
      $scope.options = res.data.steemd;
    } else {
      $scope.options = res.data.golosd;
    }
  });
   

   $scope.openTooltip = function($event, d) {
      var texth = d;
      $scope.tooltipText = texth;
      $scope.tooltip.show($event);
   };

  function getDate(xx) {
    for (var i = 0, len = $rootScope.$storage.currencies.length; i < len; i++) {
      var v = $rootScope.$storage.currencies[i];
      if (v.id == xx) {
        return true;
      }
    }
  }

  function searchObj(nameKey, myArray) {
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === nameKey) {
            return myArray[i];
        }
    }
  }

  $scope.changeCurrency = function(xx, ignore) {
    $rootScope.$emit('changedCurrency', {currency: xx, enforce: ignore});
  }
  $scope.changeChain = function() {
    $scope.restart = true;
    if ($rootScope.$storage.chain == 'steem'){
      $rootScope.$storage.platformname = "Steem";
      $rootScope.$storage.platformpower = "Steem Power";
      $rootScope.$storage.platformsunit = "Steem";
      $rootScope.$storage.platformdollar = "Steem Dollar";
      $rootScope.$storage.platformdunit = "SBD";
      $rootScope.$storage.platformpunit = "SP";
      $rootScope.$storage.platformlunit = "STEEM";
      $rootScope.$storage.socketsteem = "https://api.steemit.com";
      $scope.socket = "https://api.steemit.com";
    } else {
      $rootScope.$storage.platformname = "ГОЛОС";
      $rootScope.$storage.platformpower = "СИЛА ГОЛОСА";
      $rootScope.$storage.platformsunit = "Голос";
      $rootScope.$storage.platformdollar = "ЗОЛОТОЙ";
      $rootScope.$storage.platformdunit = "GBG";
      $rootScope.$storage.platformpunit = "GOLOSP";
      $rootScope.$storage.platformlunit = "GOLOS";
      $rootScope.$storage.socketgolos = "https://ws.golos.io/";
      $scope.socket = "https://ws.golos.io/";
    }
    $rootScope.chain = $rootScope.$storage.chain;
    window.steem.config.set('chain_id',localStorage[$rootScope.$storage.chain+"Id"]);
    if ($rootScope.$storage.chain == 'golos') {
      window.steem.config.set('address_prefix','GLS');  
    } else {
      window.steem.config.set('address_prefix','STM');  
    }
    window.steem.api.stop();

    $scope.changeCurrency($rootScope.$storage.currency, true);
  }
  $scope.restart = false;
  $scope.closeTooltip = function() {
    $scope.tooltip.hide();
  };

  $scope.$on('socketCheck', function(){
    window.steem.api.setOptions({ url: localStorage.socketUrl });
    window.steem.config.set('chain_id',localStorage.steemId);
    window.steem.config.set('address_prefix','STM');  

    window.steem.api.getDynamicGlobalProperties(function(err, r) {
      if (r){
        var received_msg = r;
        var local_time = new Date(new Date().toISOString().split('.')[0]);
        var server_time = new Date(received_msg.time);
        console.log("Message is received...",local_time,server_time,local_time-server_time>15000);
        $scope.alive = local_time-server_time<15000;
        if(!$scope.$$phase){
          $scope.$apply();
        }
      }
      if (err) {
        $scope.alive = false;
        window.steem.api.stop();
      }
    });
  });

  $scope.changeLanguage = function(locale){
    setTimeout(function() {
    //$scope.$evalAsync(function( $scope ) {
      if (locale == 'ar-SA' || locale == 'he-IL' || locale == 'fa-IR' || locale == 'ur-PK') {
        $rootScope.$storage.dir = 'rtl';
      } else {
        $rootScope.$storage.dir = 'ltr';
      }
      $translate.use(locale);
    //});
    }, 1);
  }
  $scope.drag = function(v) {
    $rootScope.$storage.voteWeight = v*100;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    if (!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  }
  $scope.$on('$ionicView.beforeEnter', function(){
    $rootScope.$storage["socket"+$rootScope.$storage.chain] = localStorage.socketUrl;
    $scope.data = {};
    if (!$rootScope.$storage.voteWeight){
      $rootScope.$storage.voteWeight = 10000;
      $scope.vvalue = 100;
    } else {
      $scope.vvalue = $rootScope.$storage.voteWeight/100;
    }
    
    $scope.$applyAsync();
    if ($rootScope.$storage.pincode) {
      $scope.data = {pin: true};
    } else {
      $scope.data = {pin: false};
    }

    if ($rootScope.user && $rootScope.$storage.deviceid) {
      APIs.getSubscriptions($rootScope.$storage.deviceid).then(function(res){
        $rootScope.log(angular.toJson(res.data));
        var d = res.data;
        //angular.forEach(d, function(v,k){
        for (var i = 0, len = d.length; i < len; i++) {
          var v = d[i];
          if (v.username == $rootScope.user.username) {
            angular.merge($scope.data, {vote: v.subscription.vote, follow: v.subscription.follow, comment: v.subscription.comment, mention: v.subscription.mention, resteem: v.subscription.resteem});    
          }          
        }
        
        $scope.$applyAsync();
      });
    }
    $scope.$applyAsync();
    $scope.$emit('socketCheck');
  });

  $scope.notificationChange = function() {
    $rootScope.$storage.subscription = {
      vote: $scope.data.vote,
      comment: $scope.data.comment,
      follow: $scope.data.follow,
      mention: $scope.data.mention,
      resteem: $scope.data.resteem,
      device: ionic.Platform.platform(),
      timestamp: $filter('date')(new Date(), 'medium'),
      appversion: '1.6.0'
    }
    APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.user.username, $rootScope.$storage.subscription).then(function(res){
      //console.log(angular.toJson(res));
    });

  }

  $scope.$watch('alive', function (value) {
      if (value) {
          console.log(value);
      }
  });

  $scope.pinChange = function() {
    $rootScope.log("pinChange");
    if ($rootScope.$storage.pincode) {
      $rootScope.$broadcast("pin:check");
    } else {
      $rootScope.$broadcast("pin:new");
    }
  }

  $rootScope.$on("pin:correct", function(){
    $rootScope.log("pin:correct " + $scope.data.pin);
    if (!$scope.data.pin) {
        $rootScope.$storage.pincode = undefined;
    }
    if ($rootScope.$storage.pincode) {
      $scope.data.pin = true;
    } else {
      $scope.data.pin = false;
    }
    $scope.$applyAsync();
  });

  $rootScope.$on("pin:failed", function(){
    $rootScope.log("pin:failed");
    //$scope.$evalAsync(function($scope){
      if ($rootScope.$storage.pincode) {
        $scope.data.pin = true;
      } else {
        $scope.data.pin = false;
      }
    //});

  });
  $scope.logouts = function() {
    $rootScope.$storage.user = undefined;
    $rootScope.$storage.user = null;
    $rootScope.user = undefined;
    $rootScope.user = null;
    
    $rootScope.$storage.mylogin = undefined;
    $rootScope.$storage.mylogin = null;
    //make sure user credentials cleared.
    if ($rootScope.$storage.deviceid) {
      APIs.deleteSubscription($rootScope.$storage.deviceid).then(function(res){
        $ionicSideMenuDelegate.toggleLeft();
        //$window.location.reload(true);
        $state.go('app.posts',{renew:true},{reload: true});
      });
    } else {
      $ionicSideMenuDelegate.toggleLeft();
      //$window.location.reload(true);
      $state.go('app.posts',{renew:true},{reload: true});
    }
    $rootScope.$storage.filter = undefined;
    $rootScope.$storage.tag = undefined;

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    //setTimeout(function() {
    //$scope.$evalAsync(function( $scope ) {
      ionic.Platform.exitApp(); // stops the app
    //});
    //}, 100);
  };
  $scope.socket = $rootScope.$storage["socket"+$rootScope.$storage.chain];
  $scope.socketChange = function(xx){
    console.log(xx);
    
    $rootScope.$storage["socket"+$rootScope.$storage.chain] = xx;
    localStorage.socketUrl = xx;
    $scope.restart = true;
    setTimeout(function() {
      //$scope.$evalAsync(function( $scope ) {
        var socketUrl = $rootScope.$storage["socket"+$rootScope.$storage.chain];
       
        window.steem.config.set('chain_id',localStorage[$rootScope.$storage.chain+"Id"]);
        
        //window.steem.config.set('websocket',socketUrl); 
        window.steem.api.setOptions({ url: socketUrl });
        
        window.steem.config.set('address_prefix','STM');  
        if ($rootScope.user.chain != $rootScope.$storage.chain) {
          for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
            var v = $rootScope.$storage.users[i];
            if (v.chain == $rootScope.$storage.chain){
              $rootScope.$storage.user = v;
              $rootScope.user = v;
            }
          }
        }
      //});
      }, 1);
  }
  $scope.save = function(){
    if ($scope.restart) {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('UPDATE_REQUIRES_RESTART')
      });
      confirmPopup.then(function(res) {
        if(res) {
          $rootScope.log('You are sure');
          localStorage.socketUrl = $rootScope.$storage["socket"+$rootScope.$storage.chain];
          //$scope.logouts();
          setTimeout(function() {
          //$scope.$evalAsync(function( $scope ) {
            var socketUrl = $rootScope.$storage["socket"+$rootScope.$storage.chain];
           
            window.steem.config.set('chain_id',localStorage[$rootScope.$storage.chain+"Id"]);
            
            //window.steem.config.set('websocket',socketUrl); 
            window.steem.api.setOptions({ url: socketUrl });
            
            window.steem.config.set('address_prefix','STM');  
            if ($rootScope.user.chain != $rootScope.$storage.chain) {
              for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
                var v = $rootScope.$storage.users[i];
                if (v.chain == $rootScope.$storage.chain){
                  $rootScope.$storage.user = v;
                  $rootScope.user = v;
                }
              }
            }
            $state.go('app.posts',{renew:true},{reload: true});
          //});
          }, 1);
        } else {
          $rootScope.log('You are not sure');
        }
      });
    } else {
      $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('SETTINGS_UPDATED'));
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      //$window.location.reload(true);  
      $state.go('app.posts',{renew:true},{reload: true});
    }
  };

});
}

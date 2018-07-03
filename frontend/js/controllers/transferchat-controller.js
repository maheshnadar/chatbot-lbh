myApp.controller('TrasferchatCtrl', function ($scope, TemplateService, apiService, NavigationService, $timeout,$rootScope,items ) {
    // $scope.template = TemplateService.getHTML("content/hotkeys.html");
        // TemplateService.title = "Hotkeys";
        $scope.navigation = NavigationService.getNavigation();
        $scope.items = items;
        console.log("itemitemitem",items)
        

       
});
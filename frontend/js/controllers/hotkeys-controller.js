myApp.controller('HotKeysCtrl', function ($scope, TemplateService, apiService, NavigationService, $timeout,$rootScope) {
    $scope.template = TemplateService.getHTML("content/hotkeys.html");
        TemplateService.title = "Hotkeys";
        $scope.navigation = NavigationService.getNavigation();

        $rootScope.hotkeymsg = [{
            'keyname': "Alt H",
            'msg': "Hello! Thank you for contacting Ross-Simons. I am a customer service representative and I am here to assist you. How may I help you today?",
        },
        {
            'keyname': "Alt G",
            'msg': " Thank you for chatting with Ross-Simons. We value your feedback. Please click the “End Chat” button at the top right of your Visitor Chat Window to answer a few questions about your experience with us today.",
        },
        {
            'keyname': "Alt Z ",
            'msg': "Sorry we are not able to continue our chat. Since I have not heard from you for some time, I am going to close this chat. If you need any help in the future, please do not hesitate to chat with us again.",
        },
        {
            'keyname': "Alt T",
            'msg': "Thank you!",
        },
        {
            'keyname': "Alt W",
            'msg': "You’re welcome.",
        },
        {
            'keyname': "Alt X",
            'msg': "You’re welcome. Is there anything else I can help you with today?",
        },
        {
            'keyname': "Alt Q ",
            'msg': "Have a nice day!",
        },
        {
            'keyname': "Alt R",
            'msg': "Do you have the order number? If not, I can use your email address to access the order.",
        },
        {
            'keyname': "Alt B",
            'msg': "Can you please verify your billing address?",
        },
        {
            'keyname': "Alt I",
            'msg': "Can I have the item number please?",
        },
        {
            'keyname': "Alt F",
            'msg': "Is there anything else I can help you with today?",
        },
        {
            'keyname': "Alt Y",
            'msg': "I have not heard from you for a few moments. Are you still with me?",
        }, 
        {
            'keyname': "Alt S",
            'msg': "One moment please while I look that up for you.",
        },  

        {
            'keyname': "Alt U",
            'msg': "If there is anything else we can help you with, please not hesitate to contact us again.",
        }, 
        {
            'keyname': "Alt V",
            'link':"http://www.ross-simons.com/content/vip",
            'msg': "We wanted to take this opportunity to introduce our VIP Rewards Club Membership. This program offers benefits such as free upgraded shipping, free returns, $150 in coupons to be used on future orders and other exclusive offers. Click the link below to read more about this membership program.",
        }, {
            'keyname': "Alt C",
             'msg': " If you purchase an item and something should happen to that item outside of our 30 day return policy but within 12 months from the date of purchase, you can return the item to our Repair Department. We would be happy to see if it may be repairable or replaceable at no cost to you. If it is outside of 12 months, you can still return the item to our Repair Department and we will be happy to see if the item is repairable.",
        }, {
            'keyname': "Alt M",
             'msg': " If for any reason you are not 100% satisfied with your purchase within 30 days of receipt, youmay return any unused merchandise that has not been engraved or customized for a refund, credit or exchange (minus shipping &amp; handling). Merchandise returned must be in its original condition and credit is subject to merchandise being reviewed by our Quality Assurance Specialists. Merchandise that is damaged or altered in any way by a Jeweler other than Ross-Simons cannot be returned. A merchandise credit will be issued if merchandise received as a gift is returned by the recipient. Items that have been personalized cannot be returned. Items may be returned by any shipping method you prefer, but for your security, please be sure to insure your package for the full value of the items.",
        },
        {
            'keyname': "Alt J",
            'address':"Ross-Simons Returns 9 Ross-Simons Drive Cranston, RI 02920",
            'msg': "Thank you for your patience. Your RA # is (insert number). Please note RAs expire after 30 days and your return will take approximately 2-3 weeks to process. Please be sure to fill out your packing slip indicating that you wish to return your item for exchange or for refund. You should also note the RA# on the outside of the package. Please send your items back fully insured to:",
        },
        {
            'keyname': "Alt K",
            'address':"Ross-Simons Returns 9 Ross-Simons Drive Cranston, RI 02920",
            'msg': "I apologize for the issues you are having with your (ITEM). Our records indicate that your order was shipped on (date of shipping), and is outside of our 30 day return policy. However, if you would like to send your item to our Repairs Department, we would be happy to see if it may be repairable. Your original order number is, (ORDER NUMBER). Please take this information and put it on a plain sheet of paper along with your name, address, daytime phone number, and a brief description of the item and why it is coming back. Please note, this process may take up to 4-6 weeks. When you return this item, please make sure that it is insured and return to:",
        },
    ]
});
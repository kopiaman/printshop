/**
 * The checkout screen + stripe integration
 */
angular.module('app').controller('BuyCheckoutController', function( $scope, $location, $urlRouter, $stateParams, $http, ApiService, PriceService, $state, CanvasService, ProductService, CartService, localStorageService, stripe_publishable_key, currency_code, settings, $modal, $modalInstance, $rootScope, $window, $q) {
	this.name = "BuyCheckoutController";
	this.params = $stateParams;
	$scope.totalPrice = 0;
	$scope.orderId = 0;
	$scope.zoom = 75/460;
	$scope.customer_details = {};
    $scope.checkout_details = {};
    $scope.settings = settings;
	$scope.selectedCountry = {};
    $scope.postageTypes = null;
    $scope.postageOption = 0;
	$scope.PriceService = PriceService;
    $scope.ProductService = ProductService;
    $scope.CartService = CartService;
	$scope.localStorageService = localStorageService;
    $scope.stripe_publishable_key = stripe_publishable_key;
    $scope.currency_code = currency_code;
    $scope.purchase = false;

    $scope.word = /^[a-z0-9\-\s]+$/i;
  $scope.countries = [ // Taken from https://gist.github.com/unceus/6501985
    {name: 'Afghanistan', code: 'AF'},
    {name: 'Åland Islands', code: 'AX'},
    {name: 'Albania', code: 'AL'},
    {name: 'Algeria', code: 'DZ'},
    {name: 'American Samoa', code: 'AS'},
    {name: 'Andorra', code: 'AD'},
    {name: 'Angola', code: 'AO'},
    {name: 'Anguilla', code: 'AI'},
    {name: 'Antarctica', code: 'AQ'},
    {name: 'Antigua and Barbuda', code: 'AG'},
    {name: 'Argentina', code: 'AR'},
    {name: 'Armenia', code: 'AM'},
    {name: 'Aruba', code: 'AW'},
    {name: 'Australia', code: 'AU'},
    {name: 'Austria', code: 'AT'},
    {name: 'Azerbaijan', code: 'AZ'},
    {name: 'Bahamas', code: 'BS'},
    {name: 'Bahrain', code: 'BH'},
    {name: 'Bangladesh', code: 'BD'},
    {name: 'Barbados', code: 'BB'},
    {name: 'Belarus', code: 'BY'},
    {name: 'Belgium', code: 'BE'},
    {name: 'Belize', code: 'BZ'},
    {name: 'Benin', code: 'BJ'},
    {name: 'Bermuda', code: 'BM'},
    {name: 'Bhutan', code: 'BT'},
    {name: 'Bolivia', code: 'BO'},
    {name: 'Bosnia and Herzegovina', code: 'BA'},
    {name: 'Botswana', code: 'BW'},
    {name: 'Bouvet Island', code: 'BV'},
    {name: 'Brazil', code: 'BR'},
    {name: 'British Indian Ocean Territory', code: 'IO'},
    {name: 'Brunei Darussalam', code: 'BN'},
    {name: 'Bulgaria', code: 'BG'},
    {name: 'Burkina Faso', code: 'BF'},
    {name: 'Burundi', code: 'BI'},
    {name: 'Cambodia', code: 'KH'},
    {name: 'Cameroon', code: 'CM'},
    {name: 'Canada', code: 'CA'},
    {name: 'Cape Verde', code: 'CV'},
    {name: 'Cayman Islands', code: 'KY'},
    {name: 'Central African Republic', code: 'CF'},
    {name: 'Chad', code: 'TD'},
    {name: 'Chile', code: 'CL'},
    {name: 'China', code: 'CN'},
    {name: 'Christmas Island', code: 'CX'},
    {name: 'Cocos (Keeling) Islands', code: 'CC'},
    {name: 'Colombia', code: 'CO'},
    {name: 'Comoros', code: 'KM'},
    {name: 'Congo', code: 'CG'},
    {name: 'Congo, The Democratic Republic of the', code: 'CD'},
    {name: 'Cook Islands', code: 'CK'},
    {name: 'Costa Rica', code: 'CR'},
    {name: 'Cote D\'Ivoire', code: 'CI'},
    {name: 'Croatia', code: 'HR'},
    {name: 'Cuba', code: 'CU'},
    {name: 'Cyprus', code: 'CY'},
    {name: 'Czech Republic', code: 'CZ'},
    {name: 'Denmark', code: 'DK'},
    {name: 'Djibouti', code: 'DJ'},
    {name: 'Dominica', code: 'DM'},
    {name: 'Dominican Republic', code: 'DO'},
    {name: 'Ecuador', code: 'EC'},
    {name: 'Egypt', code: 'EG'},
    {name: 'El Salvador', code: 'SV'},
    {name: 'Equatorial Guinea', code: 'GQ'},
    {name: 'Eritrea', code: 'ER'},
    {name: 'Estonia', code: 'EE'},
    {name: 'Ethiopia', code: 'ET'},
    {name: 'Falkland Islands (Malvinas)', code: 'FK'},
    {name: 'Faroe Islands', code: 'FO'},
    {name: 'Fiji', code: 'FJ'},
    {name: 'Finland', code: 'FI'},
    {name: 'France', code: 'FR'},
    {name: 'French Guiana', code: 'GF'},
    {name: 'French Polynesia', code: 'PF'},
    {name: 'French Southern Territories', code: 'TF'},
    {name: 'Gabon', code: 'GA'},
    {name: 'Gambia', code: 'GM'},
    {name: 'Georgia', code: 'GE'},
    {name: 'Germany', code: 'DE'},
    {name: 'Ghana', code: 'GH'},
    {name: 'Gibraltar', code: 'GI'},
    {name: 'Greece', code: 'GR'},
    {name: 'Greenland', code: 'GL'},
    {name: 'Grenada', code: 'GD'},
    {name: 'Guadeloupe', code: 'GP'},
    {name: 'Guam', code: 'GU'},
    {name: 'Guatemala', code: 'GT'},
    {name: 'Guernsey', code: 'GG'},
    {name: 'Guinea', code: 'GN'},
    {name: 'Guinea-Bissau', code: 'GW'},
    {name: 'Guyana', code: 'GY'},
    {name: 'Haiti', code: 'HT'},
    {name: 'Heard Island and Mcdonald Islands', code: 'HM'},
    {name: 'Holy See (Vatican City State)', code: 'VA'},
    {name: 'Honduras', code: 'HN'},
    {name: 'Hong Kong', code: 'HK'},
    {name: 'Hungary', code: 'HU'},
    {name: 'Iceland', code: 'IS'},
    {name: 'India', code: 'IN'},
    {name: 'Indonesia', code: 'ID'},
    {name: 'Iran, Islamic Republic Of', code: 'IR'},
    {name: 'Iraq', code: 'IQ'},
    {name: 'Ireland', code: 'IE'},
    {name: 'Isle of Man', code: 'IM'},
    {name: 'Israel', code: 'IL'},
    {name: 'Italy', code: 'IT'},
    {name: 'Jamaica', code: 'JM'},
    {name: 'Japan', code: 'JP'},
    {name: 'Jersey', code: 'JE'},
    {name: 'Jordan', code: 'JO'},
    {name: 'Kazakhstan', code: 'KZ'},
    {name: 'Kenya', code: 'KE'},
    {name: 'Kiribati', code: 'KI'},
    {name: 'Korea, Democratic People\'s Republic of', code: 'KP'},
    {name: 'Korea, Republic of', code: 'KR'},
    {name: 'Kuwait', code: 'KW'},
    {name: 'Kyrgyzstan', code: 'KG'},
    {name: 'Lao People\'s Democratic Republic', code: 'LA'},
    {name: 'Latvia', code: 'LV'},
    {name: 'Lebanon', code: 'LB'},
    {name: 'Lesotho', code: 'LS'},
    {name: 'Liberia', code: 'LR'},
    {name: 'Libyan Arab Jamahiriya', code: 'LY'},
    {name: 'Liechtenstein', code: 'LI'},
    {name: 'Lithuania', code: 'LT'},
    {name: 'Luxembourg', code: 'LU'},
    {name: 'Macao', code: 'MO'},
    {name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK'},
    {name: 'Madagascar', code: 'MG'},
    {name: 'Malawi', code: 'MW'},
    {name: 'Malaysia', code: 'MY'},
    {name: 'Maldives', code: 'MV'},
    {name: 'Mali', code: 'ML'},
    {name: 'Malta', code: 'MT'},
    {name: 'Marshall Islands', code: 'MH'},
    {name: 'Martinique', code: 'MQ'},
    {name: 'Mauritania', code: 'MR'},
    {name: 'Mauritius', code: 'MU'},
    {name: 'Mayotte', code: 'YT'},
    {name: 'Mexico', code: 'MX'},
    {name: 'Micronesia, Federated States of', code: 'FM'},
    {name: 'Moldova, Republic of', code: 'MD'},
    {name: 'Monaco', code: 'MC'},
    {name: 'Mongolia', code: 'MN'},
    {name: 'Montserrat', code: 'MS'},
    {name: 'Morocco', code: 'MA'},
    {name: 'Mozambique', code: 'MZ'},
    {name: 'Myanmar', code: 'MM'},
    {name: 'Namibia', code: 'NA'},
    {name: 'Nauru', code: 'NR'},
    {name: 'Nepal', code: 'NP'},
    {name: 'Netherlands', code: 'NL'},
    {name: 'Netherlands Antilles', code: 'AN'},
    {name: 'New Caledonia', code: 'NC'},
    {name: 'New Zealand', code: 'NZ'},
    {name: 'Nicaragua', code: 'NI'},
    {name: 'Niger', code: 'NE'},
    {name: 'Nigeria', code: 'NG'},
    {name: 'Niue', code: 'NU'},
    {name: 'Norfolk Island', code: 'NF'},
    {name: 'Northern Mariana Islands', code: 'MP'},
    {name: 'Norway', code: 'NO'},
    {name: 'Oman', code: 'OM'},
    {name: 'Pakistan', code: 'PK'},
    {name: 'Palau', code: 'PW'},
    {name: 'Palestinian Territory, Occupied', code: 'PS'},
    {name: 'Panama', code: 'PA'},
    {name: 'Papua New Guinea', code: 'PG'},
    {name: 'Paraguay', code: 'PY'},
    {name: 'Peru', code: 'PE'},
    {name: 'Philippines', code: 'PH'},
    {name: 'Pitcairn', code: 'PN'},
    {name: 'Poland', code: 'PL'},
    {name: 'Portugal', code: 'PT'},
    {name: 'Puerto Rico', code: 'PR'},
    {name: 'Qatar', code: 'QA'},
    {name: 'Reunion', code: 'RE'},
    {name: 'Romania', code: 'RO'},
    {name: 'Russian Federation', code: 'RU'},
    {name: 'Rwanda', code: 'RW'},
    {name: 'Saint Helena', code: 'SH'},
    {name: 'Saint Kitts and Nevis', code: 'KN'},
    {name: 'Saint Lucia', code: 'LC'},
    {name: 'Saint Pierre and Miquelon', code: 'PM'},
    {name: 'Saint Vincent and the Grenadines', code: 'VC'},
    {name: 'Samoa', code: 'WS'},
    {name: 'San Marino', code: 'SM'},
    {name: 'Sao Tome and Principe', code: 'ST'},
    {name: 'Saudi Arabia', code: 'SA'},
    {name: 'Senegal', code: 'SN'},
    {name: 'Serbia and Montenegro', code: 'CS'},
    {name: 'Seychelles', code: 'SC'},
    {name: 'Sierra Leone', code: 'SL'},
    {name: 'Singapore', code: 'SG'},
    {name: 'Slovakia', code: 'SK'},
    {name: 'Slovenia', code: 'SI'},
    {name: 'Solomon Islands', code: 'SB'},
    {name: 'Somalia', code: 'SO'},
    {name: 'South Africa', code: 'ZA'},
    {name: 'South Georgia and the South Sandwich Islands', code: 'GS'},
    {name: 'Spain', code: 'ES'},
    {name: 'Sri Lanka', code: 'LK'},
    {name: 'Sudan', code: 'SD'},
    {name: 'Suriname', code: 'SR'},
    {name: 'Svalbard and Jan Mayen', code: 'SJ'},
    {name: 'Swaziland', code: 'SZ'},
    {name: 'Sweden', code: 'SE'},
    {name: 'Switzerland', code: 'CH'},
    {name: 'Syrian Arab Republic', code: 'SY'},
    {name: 'Taiwan, Province of China', code: 'TW'},
    {name: 'Tajikistan', code: 'TJ'},
    {name: 'Tanzania, United Republic of', code: 'TZ'},
    {name: 'Thailand', code: 'TH'},
    {name: 'Timor-Leste', code: 'TL'},
    {name: 'Togo', code: 'TG'},
    {name: 'Tokelau', code: 'TK'},
    {name: 'Tonga', code: 'TO'},
    {name: 'Trinidad and Tobago', code: 'TT'},
    {name: 'Tunisia', code: 'TN'},
    {name: 'Turkey', code: 'TR'},
    {name: 'Turkmenistan', code: 'TM'},
    {name: 'Turks and Caicos Islands', code: 'TC'},
    {name: 'Tuvalu', code: 'TV'},
    {name: 'Uganda', code: 'UG'},
    {name: 'Ukraine', code: 'UA'},
    {name: 'United Arab Emirates', code: 'AE'},
    {name: 'United Kingdom', code: 'GB'},
    {name: 'United States', code: 'US'},
    {name: 'United States Minor Outlying Islands', code: 'UM'},
    {name: 'Uruguay', code: 'UY'},
    {name: 'Uzbekistan', code: 'UZ'},
    {name: 'Vanuatu', code: 'VU'},
    {name: 'Venezuela', code: 'VE'},
    {name: 'Vietnam', code: 'VN'},
    {name: 'Virgin Islands, British', code: 'VG'},
    {name: 'Virgin Islands, U.S.', code: 'VI'},
    {name: 'Wallis and Futuna', code: 'WF'},
    {name: 'Western Sahara', code: 'EH'},
    {name: 'Yemen', code: 'YE'},
    {name: 'Zambia', code: 'ZM'},
    {name: 'Zimbabwe', code: 'ZW'}
  ];

    window.scope = $scope;
	window.scopeCheckout = $scope;

    $scope.$watchCollection('customer_details', function(newValue, oldValue) {
        var customer_details = localStorageService.set('customer_details', $scope.customer_details);
    });

    $scope.$watch('postageOption', function(newValue, oldValue) {
        PriceService.setPostage(newValue); //remember choice for next time
        $scope.postageOption = newValue;
    });
      
    $scope.imageUrl = function(data) {
        return ApiService.imageUrl(data);
    };
    
    $scope.getCheckoutDetails = function() {
        
        var items = CartService.getItems();
        $scope.totalPrice = CartService.getTotalPrice();
        
        $scope.checkout_details['title'] = items.length + " items";        
        $scope.checkout_details['quantity'] = items.length;

        $scope.checkout_details['price'] = accounting.formatMoney(CartService.sumTotalPrice(), PriceService.getCurrencySymbol());
        $scope.checkout_details['amount'] = $scope.totalPrice;
        $scope.checkout_details['description'] = items.length + " items";
        $scope.checkout_details['postage'] = PriceService.getPostage();        
        $scope.checkout_details['currency'] = PriceService.getCurrency();
        $scope.checkout_details['postage_description'] = PriceService.getPostageDescription();
        $scope.checkout_details['items'] = items;
        
        console.log('checkout_details', $scope.checkout_details);
    };
    
    $scope.calcTotalPrice = function(){
        var price = accounting.unformat($scope.checkout_details.price);
        if($scope.postageTypes != null) {
            price += accounting.unformat($scope.postageTypes[$scope.postageOption].price);
        }
        return $scope.formatMoney(price);
    };

    $scope.sumQuantities = function(quantities){
        var quantity =  _.reduce(quantities, function(memo, num){
                            num = parseInt(num);
                            return memo + num;
                        }, 0);
        return quantity;
    };

    $scope.formatMoney = function(price) {
        return accounting.formatMoney(price, PriceService.getCurrencySymbol());
    };

    $scope.dismiss = function() {
        $scope.$dismiss();
    };
    
    $scope.calcLeft = function(width, offsetWidth) {
        return (-width/2) + (offsetWidth/2);
    };
    
    $scope.handlePaypalToken = function(token) {
        show_indicator();
        $http({method: 'POST', url: ApiService.Url("paypal/checkout_confirm.php"), data: {token:token, orderId:$scope.orderId}, cache: false}).
            success(function(data, status, headers, config) {
                $scope.order = data;

                $modalInstance.close(true);
                hide_indicator();
                
                //Thank you for your order
                var modalInstance = $modal.open({
                  templateUrl: 'buy.confirmation.html',
                  controller: 'BuyConfirmationController',
                  backdrop: true,
                  size: 'lg',
                  resolve: {
                    order: function () {
                        return $scope.order;
                    }
                  }
                });

            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    $scope.handleConfirmation = function(params) {
        //Thank you for your order
        show_indicator();
        $http({method: 'POST', url: ApiService.Url("checkout.php"), data: params, cache: false}).
            success(function(data, status, headers, config) {
                $scope.order = data;

                $modalInstance.close(true);
                hide_indicator();
                
                //Thank you for your order
                var modalInstance = $modal.open({
                  templateUrl: 'buy.confirmation.html',
                  controller: 'BuyConfirmationController',
                  backdrop: true,
                  size: 'lg',
                  resolve: {
                    order: function () {
                        return $scope.order;
                    }
                  }
                });

            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    $scope.handleCustomPayment = function(orderId) {
        var params = {};
        params.orderId = orderId;
        $scope.handleConfirmation(params);
    };

    $scope.handleStripeToken = function(token, args) {
        var params = {};
        params.token = token;
        params.args = args;
        params.orderId = $scope.orderId;
        $scope.handleConfirmation(params);
    };
        
    $scope.saving = false;
    $scope.selectedMethod = null;
    $scope.showMethodChoices = function() {
        
        var modalInstance = $modal.open({
          templateUrl: 'buy.payment-method.html',
          controller: 'BuyPaymentMethodController',
          backdrop: true,
          size: 'md',
          resolve: {
            paymentMethods: function () {
                return $scope.settings.paymentMethods;
            }
          }
        });

        modalInstance.result.then(function (selectedMethod) {
            $scope.selectedMethod = selectedMethod;
            $scope.startPayment();
        }, function () {
          console.log('Modal dismissed at: ' + new Date());
        });

    };

    // function to submit the form after all validation has occurred            
    $scope.submitForm = function(isValid) {
        console.log('isValid', isValid);
        // check to make sure the form is completely valid
        if (isValid) {
            //save form
            if( _.size($scope.settings.paymentMethods) > 1 ) {
                $scope.showMethodChoices();
            } else {
                $scope.startPayment();
            }
            //$scope.payWithStripe();
        }

    };
    
    $scope.preCheckout = function() {
        var deferred = $q.defer();

        //save customer details
        var params = {};
        params['customer_details'] = $scope.customer_details;
        params['amount'] =  CartService.getTotalPrice();
        params['cart'] =  CartService.getItems();
        params['checkout_details'] =  $scope.checkout_details;
        params['postage'] =  PriceService.getPostage();
        params['payment_method'] = $scope.selectedMethod;
        console.log('postage', params['amount'], params['postage'], $scope.postageOption);
        $scope.saving = true;

        $http({method: 'POST', url: ApiService.Url("checkout_pre.php"), data: params, cache: false}).
            success(function(data, status, headers, config) {
                $scope.orderId = data.order.id;
                $scope.saving = false;
                deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                $scope.saving = false;
                deferred.reject(data);
            });
        return deferred.promise;
    };

    $scope.startPayment = function() {

        //only stripe and bank transfer are integrated 
        if( $scope.selectedMethod != 'stripe' && $scope.selectedMethod != 'bank_transfer') {
            openCustomWindow(ApiService.Url("processors/please_wait.html"));
        }

        //out-of-the-box others are custom methods
        $scope.preCheckout().then(function(data) {
            //console.log('startPayment', data.order.payment_method);

            if( data.order.payment_method == 'stripe' ) {
                // Open Checkout with further options
                $scope.stripeHandler.open({
                    email: $scope.customer_details.email,
                    name: $scope.site_name,
                    description: $scope.checkout_details['title'],
                    amount: accounting.toFixed(data.order.amount*100),
                    currency: PriceService.getCurrency()
                });
            } else if( data.order.payment_method == 'bank_transfer' ) {
                //bank transfer      
                var params = {};
                params.orderId = $scope.orderId;
                $scope.handleConfirmation(params);
            } else {
                
                //Unfortunately paypal has to open in a new window for now :(
                var customUrl = ApiService.Url("processors/" + data.order.payment_method + "/start.php?id=" + $scope.orderId);
                var customInfo = $scope.getPaymentMethodInfo(data.order.payment_method);

                if (customWindow && !customWindow.closed) {
                    customWindow.focus();
                    customWindow.location.href = customUrl;
                    /*if($scope.settings.paypal_environment == 'sandbox') {
                        paypalUrl = "https://www.sandbox.paypal.com";
                    }
                    customWindow.location.href = paypalUrl + "/cgi-bin/webscr?cmd=_express-checkout&force_sa=true&token="+ data.order.token;*/
                } else {
                    var modalInstance = $modal.open({
                        scope: $scope,
                        templateUrl: 'buy.custom.html',
                        controller: 'BuyCustomController',
                        backdrop: true,
                        size: 'sm',
                        resolve: {
                            title: function () {
                                return customInfo.name;
                            },
                            customUrl: function () {
                                return customUrl;
                            }
                        }
                    });
                }


            }

        });

    };

    $scope.stripeHandler = null;
    $scope.init = function() {

        $scope.postageOption = PriceService.getPostage();

        $scope.customer_details.country = _.find($scope.countries, {'code':'GB'});

        var customer_details = localStorageService.get('customer_details');
        if(customer_details != null) {
            $scope.customer_details = customer_details;
            console.log($scope.customer_details.country);
            if(!angular.isUndefined($scope.customer_details.country.code)) {
                $scope.customer_details.country = _.find($scope.countries, {'code':$scope.customer_details.country.code});
            }
        }

        //load pricing
        $http({method: 'GET', url: ApiService.Url("get_pricing.php"), cache: false}).
        success(function(data, status, headers, config) {
            $scope.pricing = data.pricing;
            $scope.postageTypes = data.delivery_types;
            console.log(data);
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        
        $scope.selectedMethod = _.first($scope.settings.paymentMethods).slug;
        //console.log($scope.settings);

        //init stripe
        if(_.indexOf(_.pluck($scope.settings.paymentMethods, 'slug'), 'stripe') > -1) {
            var stripeInfo = $scope.getPaymentMethodInfo('stripe');
            $scope.stripeHandler = StripeCheckout.configure({
                key: stripeInfo.publishable_key,
                image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
                token: function(token, args) {
                    // Use the token to create the charge with a server-side script.
                    // You can access the token ID with `token.id`
                    $scope.handleStripeToken(token, args);
                }
            });
        }
        
        $scope.getCheckoutDetails();
	};  

    $scope.getPaymentMethodInfo = function(methodName) {
        return _.findWhere(scopeCheckout.settings.paymentMethods, {slug:methodName});
    };

    $scope.init();
    
});

function stripeResponseHandler(status, response) {
    console.log('stripeResponseHandler', status, response);
}

var customWindow;
function openCustomWindow(url) {
    var w = 1024;
    var h = 768;
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);

    if (typeof (customWindow) == 'undefined' || customWindow.closed) {
        customWindow = window.open(url,"customOpener","width="+w+",height="+h+",location=1,resizable=1,scrollbars=1,status=1, top="+top+",left="+left,true);
        customWindow.focus();
    } else {
        if (typeof (customWindow) == 'undefined' || customWindow.closed) {
            //create new, since none is open
            customWindow = window.open(url,"customOpener","width="+w+",height="+h+",location=1,resizable=1,scrollbars=1,status=1, top="+top+",left="+left,true);
        }
        else {
            try {
                customWindow.document; //if this throws an exception then we have no access to the child window - probably domain change so we open a new window
            }
            catch (e) {
                customWindow = window.open(url,"customOpener","width="+w+",height="+h+",location=1,resizable=1,scrollbars=1,status=1, top="+top+",left="+left,true);
                customWindow.focus();
            }

            //IE doesn't allow focus, so I close it and open a new one
            if (navigator.appName == 'Microsoft Internet Explorer') {
                customWindow.close();
                customWindow = window.open(url,"customOpener","width="+w+",height="+h+",location=1,resizable=1,scrollbars=1,status=1, top="+top+",left="+left,true);
                customWindow.focus();
            }
            else {
                //give it focus for a better user experience
                customWindow.focus();
            }
        }
    }
}
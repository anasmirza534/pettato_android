document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    myApp.showIndicator();
    user_data = token;
    if (token === undefined) {
        myApp.hideIndicator();
        goto_page('index.html');
    } else {
        account_default_id = user_data.id;

        if (user_data.user_type == 'User') {
            myApp.hideIndicator();
            mainView.router.load({
                url: 'feeds.html',
                query: {
                    id: token
                },
                ignoreCache: true,
            });
        } else {
            myApp.hideIndicator();
            mainView.router.load({
                url: 'feeds.html',
                query: {
                    id: token
                },
                ignoreCache: true,
            });
        }
    }

    document.addEventListener("backbutton", function(e) {
        e.preventDefault();
        var page = myApp.getCurrentView().activePage;
        myApp.hideIndicator();
        image_from_device = '';
        if (page.name == "feeds" || page.name == "index") {
            myApp.confirm('would you like to exit app.', function() {
                navigator.app.clearHistory();
                navigator.app.exitApp();
            });
        } else {
            mainView.router.back({});
        }
    }, false);
}

function j2s(json) {
    return JSON.stringify(json);
}

function goto_page(page) {
    mainView.router.load({
        url: page,
        ignoreCache: false,
    });
}

function goto_before_add_account() {
    mainView.router.load({
        url: 'before_add_account.html',
        ignoreCache: false,
    });
}

function make_call(number) {
    window.open('tel:' + number);
}

function sendEmail() {
    window.open('mailto:' + $(".business_email_to").html());
}

function locatioRoute() {
    // window.open('email:' + $(".business_email_to").html());
    directions.navigateTo($(".business_email_to").data('businesslat'), $(".business_email_to").data('businesslong'));
}

function logout() {
    Lockr.flush();
    token = false;
    mainView.router.load({
        url: 'index.html',
        ignoreCache: false,
    });
}

function load_city(selecter) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_city_master',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {},
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            html = '<option value="">Select City</option>';
            $.each(res.response, function(index, val) {
                html += '<option value="' + val.id + '" >' + val.city + '</option>';
            });
            $(selecter).append(html)
        } else {}
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always();
}

function load_category(selector, afterCallback) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_category',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {},
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, val) {
                html += '<option value="' + val.id + '" >' + val.category_name + '</option>';
            });
            $(selector).html(html);
            afterCallback();
        } else {
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always();
}

function load_pet_categories(dropdown_id) {
    $.ajax({
        url: base_url + 'get_pet_type_list',
        type: 'POST',
        crossDomain: true,
    }).done(function(res){
        var html = '';
        if (res.status == 'Success') {
            html += '<option>Select Pet Type</option>';
            $.each(res.response, function(index, value){
                html += '<option value="'+value.id+'">'+value.pet_type+'</option>';
            })
        }
        $(dropdown_id).html(html);
    }).error(function(res){
        $(dropdown_id).html('');
    })
}

function load_breed_dropdown(dropdown_value, dropdown_id) {
    $.ajax({
        url: base_url + 'get_breeds_list',
        type: 'POST',
        crossDomain: true,
        data: {
            pet_type: dropdown_value,
        }
    }).done(function(res){
        var html = '';
        if (res.status == 'Success') {
            html += '<option>Select Pet Type</option>';
            $.each(res.response, function(index, value) {
                html += '<option value="'+value.id+'">'+value.breed+'</option>';
            })
        }
        $(dropdown_id).html(html);
    }).error(function(res){
        $(dropdown_id).html('');
    })
}

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng('19.113645', '72.869734'),
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var geocoder = new google.maps.Geocoder();
    var infoWindow = new google.maps.InfoWindow();
    var latlngbounds = new google.maps.LatLngBounds();
    var map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);

    if (lat) {
        if (lng) {
            var myLatLng = {lat: lat, lng: lng};

            var map = new google.maps.Map(document.getElementById('mapCanvas'), {
                zoom: 17,
                center: myLatLng
            });

            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                draggable: true,
                title: 'Business Location'
            });

            marker.addListener('click', toggleBounce);

            google.maps.event.addListener(marker, 'dragend', function (e) {
                lat = e.latLng.lat();
                lng = e.latLng.lng();
                $("#business_register-lat, #business_register_add-lat").val(lat);
                $("#business_register-lng, #business_register_add-lng").val(lng);

                geocoder.geocode({'location': {lat: lat, lng: lng}}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            $("#business_register-address, #business_register_add-address").val(results[0].formatted_address);
                        } else {
                            myApp.alert('No results found');
                        }
                    } else {
                        myApp.alert('Geocoder failed due to: ' + status);
                    }
                });
            });
        }
    }

    google.maps.event.addListener(map, 'click', function (e) {
        lat = e.latLng.lat();
        lng = e.latLng.lng();
        $("#business_register-lat, #business_register_add-lat").val(lat);
        $("#business_register-lng, #business_register_add-lng").val(lng);

        geocoder.geocode({'location': {lat: lat, lng: lng}}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    $("#business_register-address, #business_register_add-address").val(results[0].formatted_address);
                } else {
                    myApp.alert('No results found');
                }
            } else {
                myApp.alert('Geocoder failed due to: ' + status);
            }
        });
        initialize();
    });
}

function toggleBounce() {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

/* camera functionality */

// selection for image upload type
function open_dialog_for_image(type) {
    image_upload_type = type;
    var buttons1 = [{
        text: 'choose source',
        label: true
    }, {
        text: 'Camera',
        bold: true,
        onClick: image_camera,
    }, {
        text: 'Gallery',
        bold: true,
        onClick: image_gallery,
    }];
    var buttons2 = [{
        text: 'Cancel',
        color: 'red'
    }];
    var groups = [buttons1, buttons2];
    myApp.actions(groups);
}

// on Selection of camera
function image_camera() {
    var img_width = 500;
    var img_height = 500;
    if (image_upload_type == 'pet_profile' || image_upload_type == 'user_profile' || image_upload_type == 'business_profile') {
        img_width = 720;
        img_height = 640;
    } else if (image_upload_type == 'feed_image') {
        img_width = 500;
        img_height = 500;
    } else {
        img_width = 720;
        img_width = 500;
    }

    navigator.camera.getPicture(shopper_register_onSuccess, shopper_register_onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        targetWidth: img_width,
        targetHeight: img_height,
        correctOrientation: true,
        allowEdit: true,
    });
}

// on Selection of gallery
function image_gallery() {
    var img_width = 500;
    var img_height = 500;
    if (image_upload_type == 'pet_profile' || image_upload_type == 'user_profile' || image_upload_type == 'business_profile') {
        img_width = 720;
        img_height = 640;
    } else if (image_upload_type == 'feed_image') {
        img_width = 500;
        img_height = 500;
    } else {
        img_width = 720;
        img_width = 500;
    }

    navigator.camera.getPicture(shopper_register_onSuccess, shopper_register_onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        targetWidth: img_width,
        targetHeight: img_height,
        correctOrientation: true,
        allowEdit: true,
    });
}

// image selection success function
function shopper_register_onSuccess(fileURL) {
    var uri = encodeURI(base_url + "upload_user");
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    var headers = {
        'headerParam': 'headerValue'
    };
    options.headers = headers;
    new FileTransfer().upload(fileURL, uri, shopper_register_onSuccess_file, shopper_register_onError_file, options);
}

// image selection Fail function
function shopper_register_onFail(message) {
    myApp.alert('Failed because: ' + message);
}

// image upload success function
function shopper_register_onSuccess_file(res) {
    myApp.hidePreloader();
    if (res.responseCode == 200) {
        uploaded_image = res.response.replace(/\"/g, "");
        if (image_upload_type == 'pet_profile') {
            profile_image_link = uploaded_image;
        } else if (image_upload_type == 'pet_cover') {
            profile_cover_image_link = uploaded_image;
        } else if (image_upload_type == 'user_profile') {
            profile_image_link = uploaded_image;
        } else if (image_upload_type == 'user_cover') {
            profile_cover_image_link = uploaded_image;
        } else if (image_upload_type == 'business_profile') {
            profile_image_link = uploaded_image;
        } else if (image_upload_type == 'business_cover') {
            profile_cover_image_link = uploaded_image;
        } else {
            feed_image_upload = uploaded_image;
        }

        myApp.alert("Image Uploaded Successfully");
    } else {
        myApp.hidePreloader();
        myApp.alert('Some error occurred on uploading');
    }
}

// image upload fail function
function shopper_register_onError_file(error) {
    myApp.hidePreloader();
    myApp.alert("Some Error Occured While image upload please try again");
}

/* camera functionality */

function continue_btn_signin() {
    if (!token == false) {
        myApp.showIndicator();
        $.ajax({
            url: base_url + 'get_user',
            type: 'POST',
            crossDomain: true,
            data: {
                user_id: token.id
            },
        })
        .done(function(res) {
            myApp.hideIndicator();
            if (res.status = 'success') {
                user_data = res.data;
                mainView.router.load({
                    url: 'feeds.html',
                    ignoreCache: false,
                });
            } else {
                mainView.router.load({
                    url: 'login.html',
                    ignoreCache: false,
                });
            }
        }).fail(function(err) {
            myApp.hideIndicator();
            myApp.alert('Some error occurred!');
        }).always();
    } else {
        myApp.hideIndicator();
        mainView.router.load({
            url: 'login.html',
            ignoreCache: false,
        });
    }
}

function continue_btn_signup() {
    if (!token == false) {
        myApp.showIndicator();
        $.ajax({
            url: base_url + 'get_user',
            type: 'POST',
            crossDomain: true,
            data: {
                user_id: token.id
            },
        })
        .done(function(res) {
            myApp.hideIndicator();
            if (res.status = 'success') {
                user_data = res.data;
                mainView.router.load({
                    url: 'feeds.html',
                    ignoreCache: false,
                });
            } else {
                mainView.router.load({
                    url: 'before_register.html',
                    ignoreCache: false,
                });
            }
        }).fail(function(err) {
            myApp.hideIndicator();
            myApp.alert('Some error occurred');
        }).always();
    } else {
        mainView.router.load({
            url: 'before_register.html',
            ignoreCache: false,
        });
    }
}

function goto_register(type) {
    myApp.showIndicator();
    if (type == 'shopper') {
        mainView.router.load({
            url: 'shopper_register.html',
            ignoreCache: false,
        });
    } else {
        mainView.router.load({
            url: 'business_register.html',
            ignoreCache: false,
        });
    }
}

function login() {
    var email = $('#login-username').val().trim();
    var password = $('#login-password').val().trim();
    if (email == '') {
        myApp.alert('Please enter email id');
        return false;
    }

    if (password == '') {
        myApp.alert('Please enter password');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'login',
        type: 'POST',
        crossDomain: true,
        data: {
            "identity": email,
            "password": password,
        },
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'success') {
            Lockr.set('token', res.response);
            token = res.response;
            user_data = res.response;
            account_default_id = user_data.id;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert(res.api_msg);
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occured while processing your request, Please try again later.');
    })
    .always(function() {});
}

function register_shopper() {
    var name = $('#shopper_register-name').val().trim();
    var username = $('#shopper_register-username').val().trim();
    var email = $('#shopper_register-email').val().trim();
    var password = $('#shopper_register-password').val().trim();
    var confirm_password = $('#shopper_register-confirm_password').val().trim();
    var city_id = $('#shopper_register-city_select').val();
    // var profile_image = image_from_device.trim();

    if (name == '') {
        myApp.alert('Please enter name');
        return false;
    }

    if (username == '') {
        myApp.alert('Please enter username');
        return false;
    }

    if (email == '') {
        myApp.alert('Please enter email id');
        return false;
    }

    if (!email.match(email_regex)) {
        myApp.alert('Please enter valid email id');
        return false;
    }

    if (password == '') {
        myApp.alert('Please enter password');
        return false;
    }

    if (confirm_password == '') {
        myApp.alert('Please confirm password');
        return false;
    }

    if (password!=confirm_password) {
        myApp.alert('Password does not match');
        return false;
    }

    if (city_id == '') {
        myApp.alert('Please select city');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'create_user',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            first_name: name,
            username: username,
            email: email,
            password: password,
            city_id: city_id,
            medium: 'register',
            user_type: 'User',
        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'success') {
            Lockr.set('token', res.response);
            user_data = res.response;
            account_default_id = user_data.id;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
                query: {
                    register: true
                },
            });
        } else {
            myApp.alert(res.api_msg);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occured while processing your request, Please try again later.');
    }).always(function() {
        console.log("complete");
    });
}

function register_business() {
    var name = $('#business_register-name').val().trim();
    var username = $('#business_register-username').val().trim();
    var business_name = $('#business_register-buissness').val().trim();
    var category = $('#business_register-category').val();
    var email = $('#business_register-email').val().trim();
    var phone = $('#business_register-phone').val().trim();
    var password = $('#business_register-password').val().trim();
    var confirm_password = $('#business_register-confirm_password').val().trim();
    var city_id = $('#business_register-city_select').val().trim();
    var address = $('#business_register-address').val().trim();
    var lat_add = $('#business_register-lat').val().trim();
    var lng_add = $('#business_register-lng').val().trim();
    var business_category = '';
    // var profile_image = image_from_device.trim();

    if (name == '') {
        myApp.alert('Please provide name.');
        return false;
    }
    if (username == '') {
        myApp.alert('Please provide username.');
        return false;
    }
    if (business_name == '') {
        myApp.alert('Please provide business name.');
        return false;
    }
    if (!category) {
        myApp.alert('Please select category.');
        return false;
    }
    if (email == '') {
        myApp.alert('Please provide email id.');
        return false;
    }
    if (phone == '') {
        myApp.alert('Please provide email id.');
        return false;
    }
    if (!phone.match(phone_regex)) {
        myApp.alert('Please enter valid phone number.');
        return false;
    }
    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid email id.');
        return false;
    }
    if (password == '') {
        myApp.alert('Please provide password.');
        return false;
    }
    if (confirm_password == '') {
        myApp.alert('Please confirm password.');
        return false;
    }
    if (!password == confirm_password) {
        myApp.alert('Password mismatch.');
        return false;
    }
    if (city_id == '') {
        myApp.alert('Please provide city.');
        return false;
    }
    if (!address) {
        myApp.alert('Please provide location.');
        return false;
    }

    // business_category = business_category.slice(0, -1);

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'create_business',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            username: username,
            business_name: business_name,
            email:email,
            first_name: name,
            password: password,
            category: category,
            city_id: city_id,
            address: address,
            lat: lat_add,
            lng: lng_add,
            medium: 'register',
            user_type: 'Business',
            phone: phone,
        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'success') {
            Lockr.set('token', res.response);
            user_data = res.response;
            account_default_id = user_data.id;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
                query: {
                    register: true
                },
            });
        } else {
            myApp.alert(res.api_msg);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occured while processing your request, Please try again later.');
    }).always(function() {
        console.log("complete");
    });
}

function register_pet() {
    var name = $("#pet_register-name").val();
    var username = $("#pet_register-username").val();
    var pettype = $("#pet_register-pettype").val();
    var breed = $("#pet_register-breed").val();
    var age = $("#pet_register-age").val();
    var description = $("#pet_register-description").val();
    var profile_btn = profile_image_link;
    var cover_btn = profile_cover_image_link;

    if (!name) {
        myApp.alert("Please provide Pet Name");
        return false;
    } else if (!username) {
        myApp.alert("Please provide Pet Username");
        return false;
    } else if (!pettype) {
        myApp.alert("Please provide Pet type");
        return false;
    } else if (!breed) {
        myApp.alert("Please provide Pet Breed");
        return false;
    } else if (!age) {
        myApp.alert("Please provide Pet Age");
        return false;
    } else if (!profile_btn) {
        myApp.alert("Please provide Pet Profile Image");
        return false;
    } else if (!cover_btn) {
        myApp.alert("Please provide Pet Cover Image");
        return false;
    } else if (!description) {
        myApp.alert("Please provide Pet Description");
        return false;
    } else {
        $.ajax({
            url: base_url + 'upload_pet_profile',
            type: 'post',
            crossDomain: true,
            data: {
                name: name,
                username: username,
                pettype: pettype,
                breed: breed,
                age: age,
                profile_btn: profile_btn,
                cover_btn: cover_btn,
                parent_user_id: token.id,
                description: description,
            }
        }).done(function(res){
            if (res.status == 'Success') {
                goto_page('profile_pet.html');
            } else {
                myApp.alert("Some Error Occured while processing the request, Please try again later");
                return false;
            }
        }).error(function(res){
            myApp.alert("Some Error Occured while processing the request, Please try again later");
            return false;
        })
    }
}

function upload_business() {
    var name = $("#business_register_add-name").val();
    var username = $("#business_register_add-username").val();
    var buissness_name = $("#business_register_add-buissness").val();
    var category = $("#business_register_add-category").val();
    var email = $("#business_register_add-email").val();
    var phone = $("#business_register_add-phone").val();
    var city_id = $("#business_register_add-city_select").val();
    var address = $("#business_register_add-address").val();
    var lat_add = $("#business_register_add-lat").val();
    var lng_add = $("#business_register_add-lng").val();
    var description = $("#business_register_add-description").val();
    var profile_image = profile_image_link;
    var cover_image = profile_cover_image_link;

    var business_category = '';
    // var profile_image = image_from_device.trim();

    if (name == '') {
        myApp.alert('Please provide name.');
        return false;
    }
    if (username == '') {
        myApp.alert('Please provide username.');
        return false;
    }
    if (buissness_name == '') {
        myApp.alert('Please provide business name.');
        return false;
    }
    if (!category) {
        myApp.alert('Please select category.');
        return false;
    }
    if (email == '') {
        myApp.alert('Please provide email id.');
        return false;
    }
    if (phone == '') {
        myApp.alert('Please provide email id.');
        return false;
    }
    if (!phone.match(phone_regex)) {
        myApp.alert('Please enter valid phone number.');
        return false;
    }
    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid email id.');
        return false;
    }
    if (city_id == '') {
        myApp.alert('Please provide city.');
        return false;
    }
    if (!address) {
        myApp.alert('Please provide location.');
        return false;
    }

    if (!profile_image) {
        myApp.alert('Please provide Profile Picture.');
        return false;
    }

    if (!cover_image) {
        myApp.alert('Please provide Cover Picture.');
        return false;
    }

    if (!description) {
        myApp.alert('Please provide Description.');
        return false;
    }

    // business_category = business_category.slice(0, -1);

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'upload_business',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            username: username,
            business_name: buissness_name,
            email:email,
            first_name: name,
            category: category,
            city_id: city_id,
            address: address,
            lat: lat_add,
            lng: lng_add,
            user_type: 'Business',
            phone: phone,
            parent_user_id: token.id,
            profile_image: profile_image,
            cover_image: cover_image,
            description: description,

        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            profile_goto_id = res.response;
            goto_page('profile_business_sub.html');
        } else {
            myApp.alert(res.api_msg);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occured while processing your request, Please try again later.');
    }).always(function() {
        console.log("complete");
    });
}

function loadFeeds() {
    myApp.showIndicator();

    var tabs_active = 0;

    $.ajax({
        url: base_url+'feeds',
        type: 'POST',
        data: {
            user_id: token.id,
        },
    }).done(function(res){
        var html = '';
        var feed_type = 'Feeds';

        if (res.status == 'Success') {
            $.each(res.response, function(index, value){
                var share_image_link = image_url+value.image;
                var share_image_title = value.feeds_content.substring(0, 50);
                html += '<div class="card c_ard ks-facebook-card">'+
                        '<div class="black_overlay"></div>'+
                        '<a href="#" class="card-header no-border pro_view">'+
                        '<div class="ks-facebook-avatar pro_pic">'+
                        '<img src="'+image_url+value.profile_image+'" width="34" height="34">'+
                        '</div>';
                if (value.user_type == 'Business') {
                    html += '<div class="ks-facebook-name pro_name" onclick="goto_business_page('+value.user_id+')">'+value.first_name+'</div>';
                } else {
                    html += '<div class="ks-facebook-name pro_name" onclick="goto_user_page('+value.user_id+')">'+value.first_name+'</div>';
                }
                html += '<div class="ks-facebook-date pro_tag">'+share_image_title+'</div>'+
                        '<div class="ks-facebook-date pro_tag">0 Comments 0 Likes</div>'+
                        '</a>'+
                        '<a class="card-content" onclick="load_feed_page('+value.feed_id+');" href="javascript:void(0)">'+
                        '<img data-src="'+share_image_link+'" src="'+share_image_link+'" width="100%" class="lazy lazy-fadein">'+
                        '</a>'+
                        '<div class="card-footer no-border like_share">'+
                        '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk"><i onclick="feedShareStatusChng('+value.feed_id+')" data-title="'+share_image_title+'" data-image_link="'+share_image_link+'" class="share_feeds_'+value.feed_id+' material-icons white_heart white_heart_bubble bg_grren1" style="font-size:20px !important;">share</i></a>'+
                        '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk"><i class="material-icons white_heart white_heart_bubble bg_grren2" style="font-size:20px !important;">comment</i></a>'+
                        '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk" style="" onclick="chngSaveStatus('+value.feed_id+');"><i class="material-icons white_heart white_heart_bubble bg_grren3" style="font-size:20px !important;">save</i></a>'+
                        '<a href="javascript:void(0);" class="add_clk" style="z-index: 999"><i class="material-icons white_heart">add_circle</i></a>';

                if (value.like_status == 1) {
                    html += '<a href="javascript:void(0);" data-liked="0" onclick="chngLikeStatus('+value.feed_id+');" class="like_block_chng_active'+value.feed_id+'"><i class="material-icons white_heart white_heart_active">favorite</i></a>';
                } else {
                    html += '<a href="javascript:void(0);" data-liked="0" onclick="chngLikeStatus('+value.feed_id+');" class="like_block_chng_active'+value.feed_id+'"><i class="material-icons white_heart white_heart_active">favorite_border</i></a>';
                }

                html += '</div>'+
                        '</div>';
            });

            $("#feeds-container").append(html);

            $(".add_clk").click(function(e) {
                e.preventDefault();
                if (tabs_active == 0) {
                    tabs_active = 1;
                    $(".shr_lnk").css('opacity', 0);
                    $(".shr_lnk").css('top', 0);

                    $(this).prev(".shr_lnk").animate({
                        top: '-=65%',
                        opacity: 1,
                    });

                    $(this).prev(".shr_lnk").prev(".shr_lnk").animate({
                        top: '-=145%',
                        opacity: 1,
                    });

                    $(this).prev(".shr_lnk").prev(".shr_lnk").prev(".shr_lnk").animate({
                        top: '-=230%',
                        opacity: 1,
                    });
                } else {
                    tabs_active = 0;
                    $(".shr_lnk").animate({opacity: 0, top: '0px'});
                }
            });

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
        }
    }).error(function(res){
        myApp.hideIndicator();
    })
}

function chngLikeStatus(feed_id) {
    $.ajax({
        url: base_url+'like_feeds',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: feed_id,
            feed_type: "Feed",
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            if (res.response.like_status == 0) {
                $(".feedDetailsLike, .like_block_chng_active"+res.response.category_id).html('<i class="material-icons white_heart white_heart_active">favorite_border</i>');
            } else {
                $(".feedDetailsLike, .like_block_chng_active"+res.response.category_id).html('<i class="material-icons white_heart white_heart_active">favorite</i>');
            }
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res) {
        myApp.alert("Some error occured, please try again later!");
    }).always(function(res) {
    })
}

function chngSaveStatus(feed_id) {
    $.ajax({
        url: base_url+'save_feeds',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: feed_id,
            feed_type: "Feed",
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            myApp.alert("Feed Added to your list!");
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res) {
        myApp.alert("Some error occured, please try again later!");
    }).always(function(res) {
    })
}

function load_feed_page(feed_id) {
    feed_details_fetch_id = feed_id;
    mainView.router.load({
        url: 'feed.html',
        ignoreCache: false,
    });
}

function sharePetProfile() {
    var title = $(".share_profileButtonhide").data('title');
    var share_image_link = $(".share_profileButtonhide").data('image_link');

    myApp.modal({
        title: title,
        text: '<img src="'+share_image_link+'" width="100%;">',
        verticalButtons: true,
        buttons: [{
                text: 'Share on Social Media',
                onClick: function() {
                    window.plugins.socialsharing.share(title, title, share_image_link, '');
                }
            },
            {
                text: 'Share on Pettato',
                onClick: function() {
                    share_with_freinds();
                }
            },
            {
                text: 'Cancel',
                onClick: function() {
                    myApp.closeModal();
                }
            },
        ]
    })
}

function feedShareStatusChng(id) {
    var title, share_image_link = '';
    if (id == 0) {
        title = $(".feedDetailsShare").data('title');
        share_image_link = $(".feedDetailsShare").data('image_link');
    } else {
        title = $(".share_feeds_"+id).data('title')+'...';
        share_image_link = $(".share_feeds_"+id).data('image_link');
    }

    var share_link = 'http://pettato.com';

    myApp.modal({
        title: title,
        text: '<img src="'+share_image_link+'" width="100%;">',
        verticalButtons: true,
        buttons: [{
                text: 'Share on Social Media',
                onClick: function() {
                    window.plugins.socialsharing.share(title, title, share_image_link, share_link);
                }
            },
            {
                text: 'Share on Pettato',
                onClick: function() {
                    share_with_freinds();
                }
            },
            {
                text: 'Cancel',
                onClick: function() {
                    myApp.closeModal();
                }
            },
        ]
    })
}

function share_with_freinds(title, title, share_image_link, share_link) {
    myApp.alert("Shared with your friends!");
}

function feedSaveStatusChng() {
    var feed_id = $('.feedDetailsSave').data('feed_id');
    chngSaveStatus(feed_id);
}

function loadFeedsDetails() {
    $(".feed_image").attr("src", image_url+'cover_pic.jpg');
    $(".inner_pro_pic").attr("src", image_url+'profile_dummy.jpg');
    $(".feed_creator").html('');
    $(".feed_comment_like").html('');
    $(".feed_desc").html('');
    $(".feed_comments_container").html('');

    $.ajax({
        url: base_url+'get_feed_data',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            feed_id: feed_details_fetch_id,
            user_id: token.id,
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            $(".feed_image").attr("src", image_url+res.response.image);
            $(".inner_pro_pic").attr("src", image_url+res.response.profile_image);

            if (res.response.user_type == 'Business') {
                $(".feed_creator").html('<span onclick="goto_business_page('+res.response.user_id+')">'+res.response.first_name+'</span>');
            } else {
                $(".feed_creator").html('<span onclick="goto_user_page('+res.response.user_id+')">'+res.response.first_name+'</span>');
            }

            $(".feed_comment_like").html('9 Comments 5 Likes');
            $(".feed_desc").html(res.response.feeds_content);
            // $("#feedDetailsMessagesContainer").html('');

            var comments = '';

            $.each(res.comments_response, function(index, value){
                comments += '<div class="message message-with-avatar message-received"> '+
                                '<div class="message-name">'+value.first_name+'</div>'+
                                '<div class="message-text-new">'+value.comment+'</div>'+
                            '</div>';
            })

            $("#feedDetailsMessagesContainer").html(comments);

            $(".feedDetailsLike").attr('data-feed_id', res.response.feed_id);
            $(".feedDetailsShare").attr('data-feed_id', res.response.feed_id);
            $(".feedDetailsShare").attr('data-title', res.response.feeds_content.substring(0, 50));
            $(".feedDetailsShare").attr('data-image_link', image_url+res.response.image);
            $(".feedDetailsSave").attr('data-feed_id', res.response.feed_id);

            if (res.like_save_response.like_status == 1) {
                $(".feedDetailsLike").html('<i class="material-icons white_heart white_heart_active">favorite</i>');
            } else {
                $(".feedDetailsLike").html('<i class="material-icons white_heart white_heart_active">favorite_border</i>');
            }
        } else {
            myApp.alert('Please provide all the details!');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
        console.log("complete");
    });
}

function add_comment_feed() {
    if (!$("#feed_comment").val()) {
        myApp.alert("Please enter the comment!");
        return false;
    }

    $.ajax({
        url: base_url+'add_comment_feed',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: $(".feedDetailsLike").data('feed_id'),
            comment: $("#feed_comment").val(),
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var comments = '<div class="message message-with-avatar message-received"> '+
                            '<div class="message-name">'+token.first_name+'</div>'+
                            '<div class="message-text-new">'+$("#feed_comment").val()+'</div>'+
                        '</div>';

            $("#feedDetailsMessagesContainer").prepend(comments);

            $("#feed_comment").val('');
        } else {
            myApp.alert("Unbale to upload comment, Please try again later!");
        }
    }).error(function(res){
        myApp.alert("Unbale to upload comment, Please try again later!");
    }).always(function(res){
    })
}

function add_feed() {
    var feed_image = feed_image_upload.trim();
    var description = $('#create_feed-description').val().trim();
    var location_id = $('#create_feed-location').val();
    var post_create_id = 0;

    if (feed_image == '') {
        myApp.alert('Please upload image.');
        return false;
    }
    if (description == '') {
        myApp.alert('Please provide description.');
        return false;
    }
    if (!location_id) {
        myApp.alert('Please select location.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url+'get_users_business_acc',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token.id,
        }
    }).done(function(res){
        var json_data = [];
        if (res.status == 'Success') {
            $.each(res.response, function(index, value){
                post_create_id = value.id;
                json_data.push({text: '@'+value.username, onClick: function() { create_feed(post_create_id, feed_image, description, location_id); }});
            })

            myApp.hideIndicator();

            myApp.modal({
                verticalButtons: true,
                buttons: json_data
            })
        } else {
            myApp.hideIndicator();
            myApp.alert("Unable to fetch user's list!");
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert("Unable to fetch user's list!");
    })
}

function create_feed(post_create_id, feed_image, description, location_id) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'create_feed',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: post_create_id,
            description: description,
            image: feed_image,
            location: location_id,
        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert('Please provide all the details!');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
        console.log("complete");
    });
}

function goto_profile() {
    account_id = token.id;
    if (user_data.user_type == 'User') {
        mainView.router.load({
            url: 'profile_shopper.html',
            query: {
                id: token
            },
            ignoreCache: true,
        });
    } else {
        mainView.router.load({
            url: 'profile_business.html',
            query: {
                id: token
            },
            ignoreCache: true,
        });
    }
}

function loadUsersPageContent(user_id) {
    myApp.showIndicator();
    $(".cover_image").attr("src", image_url+'cover_pic.jpg');
    $(".profie_image").attr("src", image_url+'profile_dummy.jpg');
    $(".p_name_business_sub").html('');
    $(".p_name1_business_sub").html('');
    $(".followers").text('0');
    $(".followings").text('0');
    $(".unfollow, .follow, .chat").hide();

    $.ajax({
        url: base_url + 'get_user_profile',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id, token_profile_id: token.id,
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            $('.cover_image_btn').show();

            $(".cover_image").attr("src", image_url+res.response.user_details.cover_pic);
            $(".profie_image").attr("src", image_url+res.response.user_details.profile_image);
            $('.followers').text(res.followers);
            $('.followings').text(res.followings);
            $('.p_name').html(res.response.user_details.first_name);
            $('.p_name').attr('data-business_id', res.response.user_details.id);
            $('.make_unfollow, .make_follow, .make_chat').attr('data-userid', res.response.user_details.id);

            $("#pets_and_business_profiles_list").html('');
            var profiles_list = '';

            $.each(res.response.pet_list, function(index, value){
                if (value.user_type == 'Pet') {
                    profiles_list += '<div class="change_width-20 text-center" onclick="goto_profile_shopper_pet('+value.id+')">'+
                                        '<img src="'+image_url+value.profile_image+'" width="70%" style="border-radius: 5px">'+
                                        '<p class="mrg0 color_757575">'+value.first_name+'</p>'+
                                    '</div>';
                } else {
                    profiles_list += '<div class="change_width-20 text-center" onclick="goto_business_page('+value.id+')">'+
                                        '<img src="'+image_url+value.profile_image+'" width="70%" style="border-radius: 5px">'+
                                        '<p class="mrg0 color_757575">'+value.first_name+'</p>'+
                                    '</div>';
                }
            })

            profiles_list += '<div class="change_width-20 text-center" onclick="goto_before_add_account();">'+
                                '<img src="img/create-group-button.png" width="60%" style="border-radius: 5px; padding: 5%;">'+
                                '<p class="mrg0 color_757575">Add Acount</p>'+
                            '</div>';

            $("#pets_and_business_profiles_list").html(profiles_list);

            var feeds_html = '';
            var save_feeds_html = '';

            $(".profile-feed-container, .profile-save-feed-container").html('Loading Feeds...');

            $.each(res.response.feeds, function(index, value){
                var title = value.description;
                var share_image_link = image_url+value.image;
                var share_link = 'http://pettato.com';

                feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                '<div class="black_overlay"></div>'+
                                '<a class="card-content" onclick="load_feed_page('+value.id+')">'+
                                '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                '</a>'+
                                '<div class="card-footer no-border like_share">'+
                                '<a href="javascript:void(0);" data-liked="0" onclick="window.plugins.socialsharing.share("'+title+'", "'+title+'", "'+share_image_link+'", "'+share_link+'")" class=""><i class="material-icons white_heart">share</i></a>'+
                                '</div>'+
                                '</div>';
            })

            $.each(res.response.saved_feeds, function(index, value){
                var title = value.description;
                var share_image_link = image_url+value.image;
                var share_link = 'http://pettato.com';

                save_feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                '<div class="black_overlay"></div>'+
                                '<a class="card-content" onclick="load_feed_page('+value.id+')">'+
                                '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                '</a>'+
                                '<div class="card-footer no-border like_share">'+
                                '<a href="javascript:void(0);" data-liked="0" onclick="window.plugins.socialsharing.share("'+title+'", "'+title+'", "'+share_image_link+'", "'+share_link+'")" class=""><i class="material-icons white_heart">share</i></a>'+
                                '</div>'+
                                '</div>';
            })

            if (feeds_html) {
                feeds_html += '<br><br>';
                $(".profile-feed-container").html(feeds_html);
            } else {
                $(".profile-feed-container").html('There are no feeds created by this account!');
            }

            if (save_feeds_html) {
                save_feeds_html += '<br><br>';
                $(".profile-save-feed-container").html(save_feeds_html);
            } else {
                $(".profile-save-feed-container").html('There are no feeds created by this account!');
            }

            if (token.id !== res.response.user_details.id) {
                if (res.response.follower_status == 'Unfollow') {
                    $(".follow").show();
                } else {
                    $(".unfollow").show();
                }

                $(".chat").show();
            }
        }
        myApp.hideIndicator();
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function() {
        console.log("complete");
    });
}

function make_unfollow(type) {
    var fieldtoget = '.'+type+'_make_follow';
    myApp.showIndicator();
    $.ajax({
        url: base_url+'make_unfollow',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: $(fieldtoget).data('userid'), user_token_id: token.id,
        }
    }).done(function(res){
        myApp.hideIndicator();
        if (res.status == 'Success') {
            $(".unfollow").hide();
            $(".follow").show();
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Unbale to update, Please try again later!');
    }).always(function(res){
        myApp.hideIndicator();
    })
}

function make_follow(type) {
    var fieldtoget = '.'+type+'_make_follow';
    myApp.showIndicator();
    $.ajax({
        url: base_url+'make_follow',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: $(fieldtoget).data('userid'), user_token_id: token.id,
        }
    }).done(function(res){
        myApp.hideIndicator();
        if (res.status == 'Success') {
            $(".follow").hide();
            $(".unfollow").show();
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Unbale to update, Please try again later!');
    }).always(function(res){
        myApp.hideIndicator();
    })
}

function make_chat(type) {
    var user_id = 0;

    if (type == 'business_sub') {
        user_id = $(".business_sub_make_chat").data('userid');
    } else {
        user_id = $(".user_sub_make_chat").data('userid');
    }
    goto_chat_inner(user_id);
}

function add_review_business() {
    var html_count = $(".addBusinessReview_active").length;

    if (!html_count || html_count == 0) {
        myApp.alert("Please add Review");
        return false;
    }

    if (!$("#review_comments").val()) {
        myApp.alert("Please add comments!");
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url+'add_review_business',
        type: 'POST',
        crossDomain: true,
        data: {
            business_id: $(".p_name_business_sub").data('business_id'),
            user_id: token.id,
            comment: $("#review_comments").val(),
            review: html_count
        }
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            myApp.alert('Thank you for reviewing the Business!');
            $(".addBusinessReview").removeClass('addBusinessReview_active');
            $("#review_comments").val('');
            $(".close-popup").click();
        } else {
            myApp.alert(res.api_msg);
            return false;
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function() {
        console.log("complete");
    });
}

function loadBusinessPageContent(user_id) {
    myApp.showIndicator();
    $(".cover_image").attr("src", image_url+'cover_pic.jpg');
    $(".profie_image").attr("src", image_url+'profile_dummy.jpg');
    $(".p_name_business_sub").html('');
    $(".p_name1_business_sub").html('');
    $(".followers").text('0');
    $(".followings").text('0');
    $(".unfollow, .follow, .chat").hide();

    $.ajax({
        url: base_url + 'get_user_profile',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id, token_profile_id: token.id,
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            if (res.response.user_details.linked_acc_id !== token.id) {
                $(".edit_profileButtonhide").hide();
            }

            $(".cover_image").attr("src", image_url+res.response.user_details.cover_pic);
            $(".profie_image").attr("src", image_url+res.response.user_details.profile_image);

            $('.cover_image_btn').show();

            $('.followers').text(res.followers);
            $('.followings').text(res.followings);

            var stars_html = '';
            var stars_count = Math.round(res.response.stars_count);

            for (var i = 0; i < stars_count; i++) {
                stars_html += '<i class="material-icons">star_rate</i>';
            }

            var append_p_name = res.response.user_details.first_name+'<br>'+res.response.user_details.company+'<br>'+stars_html+'<br><p class="color_757575 mrg0" style="font-size: 13px">'+res.response.reviews_count+' Reviews &nbsp;&nbsp;&nbsp;<a href="#" data-popup=".popup-review" class="open-popup color_757575 mrg0" style="font-size: 13px">Add Review</a></p>';

            $('.p_name_business_sub').html(append_p_name);
            $('.p_name_business_sub').attr('data-business_id', res.response.user_details.id);
            $('.make_unfollow, .make_follow, .make_chat').attr('data-userid', res.response.user_details.id);

            $(".business_make_call").attr('data-businessnumber', res.response.user_details.phone);
            $(".business_email_to").attr('data-businessemail', res.response.user_details.email);
            $(".business_location_to").attr('data-businesslat', res.response.user_details.lat);
            $(".business_location_to").attr('data-businesslong', res.response.user_details.lng);

            $(".business_make_call").click(function(e){
                e.preventDefault();
                make_call($(this).data('businessnumber'));
            })

            var feeds_html, reviews_html = '';

            $(".profile-feed-container").html('Loading Feeds...');
            $(".profile-reviews_container").html('Loading Reviews...');

            $.each(res.response.feeds, function(index, value) {
                var title = value.description;
                var share_image_link = image_url+value.image;
                var share_link = 'http://pettato.com';

                feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                '<div class="black_overlay"></div>'+
                                '<a class="card-content" onclick="load_feed_page('+value.id+')">'+
                                '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                '</a>'+
                                '<div class="card-footer no-border like_share">'+
                                '<a href="javascript:void(0);" data-liked="0" onclick="window.plugins.socialsharing.share("'+title+'", "'+title+'", "'+share_image_link+'", "'+share_link+'")" class=""><i class="material-icons white_heart">share</i></a>'+
                                '</div>'+
                                '</div>';
            })

            if (feeds_html) {
                $(".profile-feed-container").html(feeds_html);
            } else {
                $(".profile-feed-container").html('There are no feeds created by this account!');
            }

            $.each(res.response.business_reviews, function(index, value){
                reviews_html += '<div class="card">'+
                                    '<div class="card-header">'+value.first_name+'</div>'+
                                    '<div class="card-content">'+
                                        '<div class="card-content-inner text-left">'+value.comments+'</div>'+
                                    '</div>'+
                                    '<div class="card-footer">'+
                                    '<p class="reviews_star">';

                for (var i = 0; i < value.rating; i++) {
                    reviews_html += '<i class="material-icons">star_rate</i>';
                }

                reviews_html += '</p>'+
                                '</div>'+
                                '</div>';
            })

            if (reviews_html) {
                $(".profile-reviews_container").html(reviews_html);
            } else {
                $(".profile-reviews_container").html('There are no reviews created by this account!');
            }

            if (token.id !== res.response.user_details.id) {
                if (res.response.follower_status == 'Unfollow') {
                    $(".follow").show();
                } else {
                    $(".unfollow").show();
                }

                $(".chat").show();
            }
        }

        myApp.hideIndicator();
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function() {
        console.log("complete");
    });
}

function loadBusinessPageContentSub(user_id) {
    myApp.showIndicator();
    $(".cover_image").attr("src", image_url+'cover_pic.jpg');
    $(".profie_image").attr("src", image_url+'profile_dummy.jpg');
    $(".p_name_business_sub").html('');
    $(".p_name1_business_sub").html('');
    $(".followers").text('0');
    $(".followings").text('0');
    $(".unfollow, .follow, .chat").hide();

    $.ajax({
        url: base_url + 'get_user_profile',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id, token_profile_id: token.id,
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            if (res.response.user_details.linked_acc_id !== token.id) {
                $(".edit_profileButtonhide").hide();
            }

            $(".cover_image").attr("src", image_url+res.response.user_details.cover_pic);
            $(".profie_image").attr("src", image_url+res.response.user_details.profile_image);

            $('.cover_image_btn').show();

            $('.followers').text(res.followers);
            $('.followings').text(res.followings);

            $(".business_email_to").html(res.email);
            $(".business_location_to").attr('data-businesslat', res.lat);
            $(".business_location_to").attr('data-businesslong', res.lng);

            var stars_html = '';
            var stars_count = Math.round(res.response.stars_count);

            for (var i = 0; i < stars_count; i++) {
                stars_html += '<i class="material-icons">star_rate</i>';
            }

            var append_p_name = res.response.user_details.first_name+'<br>'+res.response.user_details.company+'<br>'+stars_html+'<br><p class="color_757575 mrg0" style="font-size: 13px">'+res.response.reviews_count+' Reviews &nbsp;&nbsp;&nbsp;<a href="#" data-popup=".popup-review" class="open-popup color_757575 mrg0" style="font-size: 13px">Add Review</a></p>';

            $('.p_name_business_sub').html(append_p_name);
            $('.p_name_business_sub').attr('data-business_id', res.response.user_details.id);
            $('.business_sub_make_unfollow, .business_sub_make_follow, .business_sub_make_chat').attr('data-userid', res.response.user_details.id);

            $(".business_make_call").attr('data-businessnumber', res.response.user_details.phone);
            $(".business_email_to").attr('data-businessemail', res.response.user_details.email);
            $(".business_location_to").attr('data-businesslat', res.response.user_details.lat);
            $(".business_location_to").attr('data-businesslong', res.response.user_details.lng);

            $(".business_make_call").click(function(e){
                e.preventDefault();
                make_call($(this).data('businessnumber'));
            })

            var feeds_html, reviews_html = '';

            $(".profile-feed-container").html('Loading Feeds...');
            $(".profile-reviews_container").html('Loading Reviews...');

            $.each(res.response.feeds, function(index, value) {
                var title = value.description;
                var share_image_link = image_url+value.image;
                var share_link = 'http://pettato.com';

                feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                '<div class="black_overlay"></div>'+
                                '<a class="card-content" onclick="load_feed_page('+value.id+')">'+
                                '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                '</a>'+
                                '<div class="card-footer no-border like_share">'+
                                '<a href="javascript:void(0);" data-liked="0" onclick="window.plugins.socialsharing.share("'+title+'", "'+title+'", "'+share_image_link+'", "'+share_link+'")" class=""><i class="material-icons white_heart">share</i></a>'+
                                '</div>'+
                                '</div>';
            })

            if (feeds_html) {
                $(".profile-feed-container").html(feeds_html);
            } else {
                $(".profile-feed-container").html('There are no feeds created by this account!');
            }

            $.each(res.response.business_reviews, function(index, value){
                reviews_html += '<div class="card">'+
                                    '<div class="card-header">'+value.first_name+'</div>'+
                                    '<div class="card-content">'+
                                        '<div class="card-content-inner text-left">'+value.comments+'</div>'+
                                    '</div>'+
                                    '<div class="card-footer">'+
                                    '<p class="reviews_star">';

                for (var i = 0; i < value.rating; i++) {
                    reviews_html += '<i class="material-icons">star_rate</i>';
                }

                reviews_html += '</p>'+
                                '</div>'+
                                '</div>';
            })

            if (reviews_html) {
                $(".profile-reviews_container").html(reviews_html);
            } else {
                $(".profile-reviews_container").html('There are no reviews created by this account!');
            }

            if (token.id !== res.response.user_details.id) {
                if (res.response.follower_status == 'Unfollow') {
                    $(".follow").show();
                } else {
                    $(".unfollow").show();
                }

                $(".chat").show();
            }
        }

        myApp.hideIndicator();
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function() {
        console.log("complete");
    });
}

function goto_profile_shopper_pet(pet_id) {
    account_id = pet_id;
    mainView.router.load({
        url: 'profile_shopper_pet.html',
        ignoreCache: false,
    });
}

function goto_business_page(business_id) {
    account_id = business_id;
    mainView.router.load({
        url: 'profile_business_sub.html',
        ignoreCache: false,
    });
}

function loadPetPageContent(pet_id) {
    $(".cover_image").attr("src", image_url+'cover_pic.jpg');
    $(".profie_image").attr("src", image_url+'profile_dummy.jpg');

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_pet_profile_data',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: pet_id,
        },
    }).done(function(res) {
        $(".pet_details_profile_tb_row").html('Loading Details...');

        if (res.response.linked_acc_id !== token.id) {
            $(".edit_profileButtonhide").hide();
            $(".hideforOthers").hide();
        }

        $(".share_profileButtonhide").attr('data-title', res.response.first_name);
        $(".share_profileButtonhide").attr('data-image_link', image_url+res.response.profile_image);

        // owners_name

        $(".cover_image").attr("src", image_url+res.response.cover_pic);
        $(".profie_image").attr("src", image_url+res.response.profile_image);

        var html = '<div class="row">'+
                    '<div class="col-33">Name</div>'+
                    '<div class="col-66">'+res.response.first_name+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Username</div>'+
                    '<div class="col-66">'+res.response.username+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Owner</div>'+
                    '<div class="col-66" onclick="goto_user_page('+res.response.owners_id+');">'+res.response.owners_name+' (@'+res.response.owners_username+')</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Type of Pet</div>'+
                    '<div class="col-66">'+res.response.pet_type+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Breed Name</div>'+
                    '<div class="col-66">'+res.response.pet_breed+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Age</div>'+
                    '<div class="col-66">'+res.response.age+'</div>'+
                    '</div>'+
                    // '<div class="row">'+
                    // '<div class="col-33">Gender</div>'+
                    // '<div class="col-66">'+res.response.gender+'</div>'+
                    // '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Location</div>'+
                    '<div class="col-66">'+res.response.pet_city+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">About Pet</div>'+
                    '<div class="col-66">'+res.response.description+'</div>'+
                    '</div>';
        $(".pet_details_profile_tb_row").html(html);
        myApp.hideIndicator();
    }).error(function(res) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(res) {
        console.log("complete");
    })
}

function add_to_become_parent() {
    var pettype = $("#become_parent_create-pettype").val();
    var age = $("#become_parent_create-age").val();
    var description = $("#become_parent_create-description").val();

    if (!pettype) {
        myApp.alert("Enter all the details!");
        return false;
    }
    if (!pettype == 'Select Pet Type') {
        myApp.alert("Enter all the details!");
        return false;
    }
    if (!age) {
        myApp.alert("Enter all the details!");
        return false;
    }
    if (!description) {
        myApp.alert("Enter all the details!");
        return false;
    }

    myApp.showIndicator();

    $.ajax({
        url: base_url+'add_become_parent',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            pettype: pettype,
            age: age,
            description: description,
            user_id: token.id
        }
    }).done(function(res){
        if (res.status == 'Success') {
            mainView.router.load({
                url: 'find_parent_list.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert('Please provide all the details!');
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
        console.log("complete");
    });

}

function add_to_find_parent() {
    var name = $("#find_parent_create-name").val();
    var pettype = $("#find_parent_create-pettype").val();
    var breed = $("#find_parent_create-breed").val();
    var age = $("#find_parent_create-age").val();
    var description = $("#find_parent_create-description").val();
    var gender = '';

    if ($("#find_parent_create-Male").is(":checked")) {
        gender = 'Male';
    }

    if ($("#find_parent_create-Female").is(":checked")) {
        gender = 'Female';
    }

    var profile_btn = profile_image_link;
    var cover_btn = profile_cover_image_link;

    if (!name) {
        myApp.alert('Please provide pet name.');
        return false;
    }

    if (!pettype || pettype == "Select Pet Type") {
        myApp.alert('Please provide Pet Type.');
        return false;
    }

    if (!breed || breed == "Select Pet Type") {
        myApp.alert('Please provide Breed.');
        return false;
    }

    if (!age) {
        myApp.alert('Please provide age.');
        return false;
    }

    if (!description) {
        myApp.alert('Please provide description.');
        return false;
    }

    if (!gender) {
        myApp.alert('Please provide gender.');
        return false;
    }

    if (!profile_btn) {
        myApp.alert('Please provide Profile Picture.');
        return false;
    }

    if (!cover_btn) {
        myApp.alert('Please provide Cover Picture.');
        return false;
    }

    myApp.showIndicator();

    $.ajax({
        url: base_url + 'add_find_parent',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            name: name,
            pettype: pettype,
            breed: breed,
            age: age,
            description: description,
            gender: gender,
            profile_btn: profile_btn,
            cover_btn: cover_btn,
            user_id: token.id,
        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            mainView.router.load({
                url: 'become_parent_list.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert('Please provide all the details!');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
        console.log("complete");
    });

}

function loadBecomeParentContent(user_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_become_parent_list',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value){
                html += '<div class="item">'+
                        '<a class="card-content color_8ac640" onclick="goto_becomeParentDetails('+value.id+');">'+
                        '<div class="profile_photo">'+
                        '<img src="'+image_url+value.profile_pic+'" width="100%">'+
                        '</div>'+
                        '<div class="content_blocker">'+
                        '<h3 class="mrg0">'+value.pet_name+'</h3>'+
                        '<p class="mrg0">'+value.pet_type+'</p>'+
                        '<p class="mrg0">Age: '+value.age+'</p>'+
                        '<p class="mrg0">'+value.gender+'</p>'+
                        '</div>'+
                        '</a>'+
                        '</div>';
            })

            $("#become_parent_listDyn").html(html);

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#become_parent_listDyn").html(html);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
        console.log("complete");
    });
}

function goto_becomeParentDetails(adoption_id) {
    account_id = adoption_id;
    mainView.router.load({
        url: 'become_parent_disp.html',
        ignoreCache: false,
    });
}

function loadBecomeParentDetails(account_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_become_parent_details',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token.id,
            adoption_id: account_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            myApp.hideIndicator();
            $(".becomeParentDetailsImage").attr("src", image_url+res.response.profile_pic);
            $(".becomeParentDetailsName").html(res.response.pet_name);
            $(".becomeParentDetailsInfo").html('Breed: '+res.response.breed+', '+res.response.pet_type+' Age: '+res.response.age);
            $(".becomeParentDetailsContent").html(res.response.description);
        } else {
            $(".becomeParentDetailsImage").attr('src', image_url+'cover_pic.jpg');
            $(".becomeParentDetailsName").html('');
            $(".becomeParentDetailsInfo").html('');
            $(".becomeParentDetailsContent").html('');
            myApp.hideIndicator();
            myApp.alert("Something went wrong, Please try agian later!")
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
        console.log("complete");
    });
}

function loadFindParentContent(user_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_find_parent_list',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value){
                html += '<div class="card facebook-card">'+
                            '<div class="card-header">'+
                                '<div class="facebook-avatar"><img src="'+image_url+value.profile_pic+'" width="50" height="50"></div>'+
                                '<div class="facebook-name" onclick="goto_user_page('+value.user_id+')">'+value.first_name+'</div>'+
                                '<div class="facebook-date">@'+value.username+'</div>'+
                            '</div>'+
                            '<div class="card-content">'+
                                '<div class="card-content-inner">'+
                                    '<p>'+value.description+'</p>'+
                                    '<p class="color-gray">Likes: 112</p>'+
                                '</div>'+
                            '</div>'+
                            '<div class="card-footer">'+
                                '<a href="#" class="link"><i class="material-icons color_8ac640">favorite_border</i></a>'+
                                '<a href="#" class="link"><i class="material-icons color_8ac640">save</i></a>'+
                            '</div>'+
                        '</div>';
            })

            $("#find_parent_listDyn").html(html);

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#find_parent_listDyn").html(html);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
        console.log("complete");
    });
}

function loadLostFoundContent(user_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_lost_found',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value) {
                html += '<div class="card demo-card-header-pic">'+
                            '<div style="background-image:url('+image_url+value.cover_pic+')" valign="bottom" class="card-header color-white no-border"></div>'+
                            '<div class="card-content">'+
                                '<div class="card-content-inner">'+
                                    '<h2 class="mrg0">'+value.first_name+', '+value.breed_name+', '+value.age+'</h2>'+
                                    '<p class="color-gray mrg0">Posted By @'+value.parent_username+'</p>'+
                                    '<p class="text_expand text_expand_'+index+'">'+value.description+'</p>'+
                                '</div>'+
                            '</div>'+
                            '<div class="card-footer">'+
                                '<a href="#" class="link"><i class="material-icons white_heart">share</i></a>'+
                                '<a href="#" class="link color-white click_to_expand" data-trigger=".text_expand_'+index+'">Read More</a>'+
                            '</div>'+
                        '</div>';
            })

            myApp.hideIndicator();
            $("#lost_found_dynamic").html(html);

            $(".click_to_expand").click(function(e){
                $(".text_expand").css('height', '20px');
                var trigger_id = $(this).data('trigger');
                $(trigger_id).css('height', 'auto');
            })
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#lost_found_dynamic").html(html);
        }
    }).error(function(err){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
        console.log("complete");
    });
}

function goto_profile_list(account_type) {
    account_id = token.id;
    profile_list_type = account_type;
    mainView.router.load({
        url: 'profiles.html',
        ignoreCache: false,
    });
}

function goto_profile_list_follow(type) {
    profile_list_type = type;
    mainView.router.load({
        url: 'profiles.html',
        ignoreCache: false,
    });
}

function loadProfilesList(account_default_id, profile_list_type) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'list_profiles',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: account_default_id,
            account_type: profile_list_type,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            myApp.hideIndicator();
            var html = '';

            $.each(res.response, function(index, value){

                var onclick_html = '';

                if (value.user_type == 'Pet') {
                    onclick_html = 'onclick="goto_profile_shopper_pet('+value.id+');"';
                } else if (value.user_type == 'Business') {
                    onclick_html = 'onclick="goto_business_page('+value.id+')"';
                } else {
                    onclick_html = 'onclick="goto_user_page('+value.id+')"';
                }

                html += '<li class="swipeout item-content read_active">'+
                            '<div class="swipeout-content item-content">'+
                                '<div class="item-media pad0">'+
                                    '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title-row">'+
                                        '<div class="item-title">'+value.first_name+'</div>'+
                                    '</div>'+
                                    '<div class="item-subtitle">'+value.username+'</div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="swipeout-actions-right">'+
                                '<a href="#" class="action1" '+onclick_html+'>Edit</a>'+
                                '<a href="#" class="action2" '+onclick_html+'>View</a>'+
                            '</div>'+
                        '</li>';

            })

            $("#list_profiles_dynamic").html(html);

        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#list_profiles_dynamic").html(html);
        }
    }).error(function(err){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
        console.log("complete");
    });
}

function loadSearchList() {
    myApp.showIndicator();
    $.ajax({
        url: base_url+'search_list',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id
        }
    }).done(function(res){
        myApp.hideIndicator();
        $("#search-list-users > ul").html('Loading users...');
        var html = '';
        $.each(res.response.users_list, function(index, value){
            html += '<li class="item-content pad0">'+
                        '<div class="item-inner">';

            if (value.user_type == 'Pet') {
                html += '<div class="item-content" onclick="goto_profile_shopper_pet('+value.id+');">';
            } else if (value.user_type == 'Business') {
                html += '<div class="item-content" onclick="goto_business_page('+value.id+');">';
            } else {
                html += '<div class="item-content" onclick="goto_user_page('+value.id+');">';
            }
                        html += '<div class="item-media pad0">'+
                                    '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title-row">'+
                                        '<div class="item-title">'+value.first_name+'</div>'+
                                        '<div class="item-subtitle">'+value.user_type+' Profile</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</li>';
        })

        $("#search-list-users > ul").html(html);

        var html = '';
        $("#search-list-feeds > ul").html('Loading feeds...');
        $.each(res.response.feeds_list, function(index, value){
            html += '<li class="item-content">'+
                        '<div class="item-inner">'+
                            '<div class="card c_ard ks-facebook-card">'+
                                '<div class="black_overlay"></div>'+
                                    '<a href="#" class="card-header no-border pro_view">'+
                                        '<div class="ks-facebook-avatar pro_pic">'+
                                            '<img src="'+image_url+value.profile_image+'" width="34" height="34">'+
                                        '</div>'+
                                        '<div class="ks-facebook-name pro_name item-title">'+value.first_name+'</div>'+
                                        '<div class="ks-facebook-date pro_tag item-title">'+value.feeds_content.substring(0, 50)+'</div>'+
                                        '<div class="ks-facebook-date pro_tag">0 Comments 0 Likes</div>'+
                                    '</a>'+
                                    '<a class="card-content" onclick="load_feed_page('+value.feed_id+');" href="javascript:void(0)">'+
                                        '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                    '</a>'+
                                    '<div class="card-footer no-border like_share">';

                            html += '</div>'+
                                '</div>'+
                            '</div>'+
                        '</li>';
        })

        $("#search-list-feeds > ul").html(html);

        var html = '';
        $("#search-list-breeds > ul").html('Loading breeds...');
        $.each(res.response.breeds_list, function(index, value){
            html += '<li class="item-content">'+
                        '<div class="item-inner">'+
                            '<div class="item-title">'+value.breed+'</div>'+
                        '</div>'+
                    '</li>';
        })

        $("#search-list-breeds > ul").html(html);
    }).error(function(res){
        myApp.hideIndicator();
    }).always(function(res){
        myApp.hideIndicator();
    })
}

function goto_user_page(user_id) {
    account_id = user_id;
    mainView.router.load({
        url: 'profile_shopper_sub.html',
        ignoreCache: false,
    });
}

function loadChatsList() {
    myApp.showIndicator();
    $.ajax({
        url: base_url+'load_chat_list',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';

            $("#dyn_chats_list > ul").html('Loading Chat List...');

            $.each(res.response.chats_list, function(index, value) {
                var time = new Date(value.created_date);
                var timechng = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                if (value.read_status == 1) {
                    html += '<li class="swipeout item-content messages_from_id_'+value.id+'" onclick="goto_chat_inner('+value.user_id+')">';
                } else {
                    html += '<li class="swipeout item-content messages_from_id_'+value.id+' read_active" onclick="goto_chat_inner('+value.user_id+')">';
                }
                    html += '<div class="swipeout-content item-content">'+
                                '<div class="item-media pad0">'+
                                    '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title-row">'+
                                        '<div class="item-title">'+value.first_name+'<span class="time-text">'+timechng+'</span>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="item-subtitle">'+value.messages+'</div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="swipeout-actions-right">'+
                                '<a href="#" data-messageid="'+value.id+'" class="action1 change_message_read_status">Mark Read</a>'+
                            '</div>'+
                        '</li>';
            })

            if (html) {
                $("#dyn_chats_list > ul").html(html);
            } else {
                $("#dyn_chats_list > ul").html('You do not have chat list.');
            }

            $(".change_message_read_status").click(function(e){
                e.preventDefault();
                var chng_status_clas = ".messages_from_id_"+$(this).data('messageid');
                $.ajax({
                    url: base_url+'change_message_read_status',
                    type: 'POST',
                    crossDomain: true,
                    data: {
                        message_id: $(this).data('messageid'),
                        user_id: token.id,
                    }
                }).done(function(res){
                    if (res.status == 'Success') {
                        $(chng_status_clas).removeClass('read_active');
                    } else {
                        myApp.alert('Some error occured while updating the status!');
                    }
                }).error(function(res){
                    myApp.alert('Some error occured while updating the status!');
                })
            })

            myApp.hideIndicator();
        } else {
            myApp.alert(res.api_msg);
            myApp.hideIndicator();
        }
    }).error(function(res){
        myApp.alert('Something went wrong, Please check your connection!');
        myApp.hideIndicator();
    }).always(function(res){
        myApp.hideIndicator();
    })
}

function goto_chat_inner(user_id) {
    account_id = user_id;
    mainView.router.load({
        url: 'chat.html',
        ignoreCache: false,
    });
}

function send_chat() {
    var user_id = token.id;
    var acc_id = $(".chat_reviever_id").html();
    var message = $("#mesage_sent").val();
    console.log(message);
    if (!message) {
        return false;
    } else {
        myApp.showIndicator();

        $.ajax({
            url: base_url + 'creat_chat',
            type: 'POST',
            crossDomain: true,
            data: {
                user_id: user_id, acc_id: acc_id, message: message,
            }
        }).done(function(res){
            if (res.status == 'Success') {
                myApp.hideIndicator();
                html = '<div class="message message-sent">'+
                            '<div class="message-text">'+message+'</div>'+
                            '<div style="background-image:url('+image_url+token.profile_image+')" class="message-avatar"></div>'+
                        '</div>';
                $("#messages_box_dyn").append(html);

                $("#mesage_sent").val('');
            } else {
                myApp.hideIndicator();
                myApp.alert("Network Error Occured, Please try again later!");
            }
        }).error(function(res){
            myApp.hideIndicator();
            myApp.alert("Network Error Occured, Please try again later!");

        })
    }
}

function loadChatMessages(user_id) {
    myApp.showIndicator();

    $(".chat_reviever_id").html(user_id);
    
    $.ajax({
        url: base_url+'load_chat_messages',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            acc_id: user_id,
        }
    }).done(function(res){
        var html = '';

        $("#messages_box_dyn").html('');

        if (res.status == 'Success') {
            var receiver_name = res.users_details.first_name;
            var receiver_profile = image_url+res.users_details.profile_image;

            $(".chat_reviever_img").attr('src', receiver_profile);
            $(".chat_reviever_name").html(receiver_name);

            $.each(res.response, function(index, value) {
                if (value.sender_id == token.id) {
                    html += '<div class="message message-sent">'+
                                '<div class="message-text">'+value.messages+'</div>'+
                                '<div style="background-image:url('+image_url+value.sender_profile_image+')" class="message-avatar"></div>'+
                            '</div>';
                } else {
                    html += '<div class="message message-received">'+
                                '<div class="message-text">'+value.messages+'</div>'+
                                '<div style="background-image:url('+receiver_profile+')" class="message-avatar"></div>'+
                            '</div>';
                }

                // <div class="messages-date">Sunday, Feb 9 <span>12:58</span></div>
                // <div class="message message-sent">
                //     <div class="message-text">Yo!</div>
                //     <div style="background-image:url(img/twinkle_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-sent">
                //     <div class="message-text">I went to the adoption center yesterday</div>
                //     <div style="background-image:url(img/twinkle_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-received">
                //     <div class="message-text">Yo</div>
                //     <div style="background-image:url(img/sid_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-received">
                //     <div class="message-text">did you find something?</div>
                //     <div style="background-image:url(img/sid_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="messages-date">Sunday, Feb 10 <span>11:58</span></div>
                // <div class="message message-sent">
                //     <div class="message-text">Yes, I ll Send you a pic</div>
                //     <div style="background-image:url(img/twinkle_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-sent message-pic">
                //     <div class="message-text"><img src="https://pawsforprogress.co.uk/wp-content/uploads/2018/03/26233171-10154962083821455-5547238076054156425-o_1_orig-225x300.jpg"></div>
                //     <div style="background-image:url(img/twinkle_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-received">
                //     <div class="message-text">Wow, awesome!</div>
                //     <div style="background-image:url(img/sid_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-received">
                //     <div class="message-text">Yo</div>
                //     <div style="background-image:url(img/sid_profile_pic.png)" class="message-avatar"></div>
                // </div>
            })

            $("#messages_box_dyn").html(html);
        }
        
        myApp.hideIndicator();
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert("Some error occured, Please try again later!");
    })
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function load_edit_profile_shopper() {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_user',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {
            user_id: token.id
        },
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status = 'Success') {
            user_data = res.response.user_details;

            // calendarDefault = myApp.calendar({
            //     input: '.calendar-default',
            //     maxDate: new Date(),
            //     value: [new Date(user_data.dob)],
            // });

            load_city('#edit_profile_shopper-city_select');

            // $('#edit_profile_shopper-city_select').change(function(event) {
            //     var city_id = $(this).val();
            //     console.log('city_id: ' + city_id);
            //     load_location('#edit_profile_shopper-location_select', city_id, function(){});
            // });
            // load_location('#edit_profile_shopper-location_select', user_data.city_id, load_location_after_city_load_for_edit_profile_shopper);

            $('#edit_profile_shopper-username').val(user_data.username);
            $('#edit_profile_shopper-name').val(user_data.first_name);
            $('#edit_profile_shopper-email').val(user_data.email);
            $('#edit_profile_shopper-phone').val(user_data.phone);
            $('#edit_profile_shopper-city_select').val(user_data.city_id);
            // $('#edit_profile_shopper-location_select').val(user_data.location_id);
            $('input[name=edit_profile_shopper-gender][value='+user_data.gender+']').attr('checked', true); 
            image_from_device = user_data.image;

        } else {
            myApp.alert('Some error occurred');
        }        
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred');
    }).always();
}


function update_shopper_profile() {
}
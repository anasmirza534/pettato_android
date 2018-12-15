var base_url = 'http://notchitup.in/pettato_ci/index.php/api/';
var image_url = 'http://notchitup.in/pettato_ci/assets/uploads/upload_image/';

var token = Lockr.get('token');
var user_data;
var email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
var phone_regex = /^\d{10}$/;
var image_from_device = '';
var profile_goto_id, profile_id_data = '';

var lat, lng, marker;
var time = '';
var profile_image_link = '';
var profile_cover_image_link = '';
var image_upload_type = '';
var feed_image_upload = '';

var new_comment_interval = null;
var comment_time = '';
var comment_type = '';
var comment_post_id = '';
var myComment = null;
var new_comment_time = null;

var new_chat_interval = null;
var chat_time = '';
var chat_type = '';
var chat_post_id = '';
var myChat = null;
var myChatMessagebar = null;
var new_chat_time = null;
var feed_details_fetch_id = 0;
var account_default_id = 0;
var account_id = 0;
var profile_list_type = 0;
var edit_profile_id = 0;

openFB.init('2106128496268926', '', window.localStorage);

var calendarDefault;

var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

var myApp = new Framework7({
    swipePanel: 'left',
    material: true,
    preloadPreviousPage: false,
    uniqueHistory: true,
    uniqueHistoryIgnoreGetParameters: true,
    modalTitle: 'Pettato',
    imagesLazyLoadPlaceholder: 'img/lazyload.jpg',
    imagesLazyLoadThreshold: 50,
});

// $$(document).on('pageAfterAnimation', function(e) { if (e.detail.page.name == "index" || e.detail.page.name == "login" || e.detail.page.name == "before_register" || e.detail.page.name == "shopper_register" || e.detail.page.name == "business_register" || e.detail.page.name == "forgot_password") { myApp.allowPanelOpen = false; } else { myApp.allowPanelOpen = true; } });


var mainView = myApp.addView('.view-main', {});

// index Page with Account Options
myApp.onPageInit('index', function(page) {
});

// login page
myApp.onPageInit('login', function(page) {
});

// account registration type selection
myApp.onPageInit('before_register', function(page) {
});

// pet account registration
myApp.onPageInit('shopper_register', function(page) {
    calendarDefault = myApp.calendar({
        input: '.calendar-default',
        maxDate: new Date(),
    });

    load_city('#shopper_register-city_select');

    $('#shopper_register-city_select').change(function(event) {
        var city_id = $(this).val();
        console.log('city_id: ' + city_id);
        load_location('#shopper_register-location_select', city_id, function(){});
    });

    var rightNow = new Date();
    console.log('rightNow: '+rightNow);
    var res = rightNow.toISOString().slice(0,10).replace(/-/g,"-");
    console.log('res: '+res);
    $('#shopper_register-dob').attr('max', res);
});

// business account registration
myApp.onPageInit('business_register', function(page) {
    load_city('#business_register-city_select');
    initialize();
    load_category('#business_register-category', function(){});
});

// feeds listing
myApp.onPageInit('feeds', function(page) {
    loadFeeds();
});

// create feed
myApp.onPageInit('create_feed', function(page) {
    load_city('#create_feed-location');
});

// feed detail page
myApp.onPageInit('feed', function(page) {
    loadFeedsDetails();
});

// users account profile
myApp.onPageInit('profile_shopper', function(page) {
    loadUsersPageContent(account_default_id);
});

// users account profile
myApp.onPageInit('profile_shopper_sub', function(page) {
    loadUsersPageContent(account_id);
});

// business account profile
myApp.onPageInit('profile_business', function(page) {
    loadBusinessPageContent(account_default_id);
});

// pet profile
myApp.onPageInit('profile_shopper_pet', function(page) {
    loadPetPageContent(account_id);
});

// business page sub profile
myApp.onPageInit('profile_business_sub', function(page) {
    loadBusinessPageContentSub(account_id);

    $("#addBusinessReview1").click(function(e){
        e.preventDefault();
        $(".addBusinessReview").removeClass('addBusinessReview_active');
        $("#addBusinessReview1").addClass('addBusinessReview_active');
    })
    $("#addBusinessReview2").click(function(e){
        e.preventDefault();
        $(".addBusinessReview").removeClass('addBusinessReview_active');
        $("#addBusinessReview1, #addBusinessReview2").addClass('addBusinessReview_active');
    })
    $("#addBusinessReview3").click(function(e){
        e.preventDefault();
        $(".addBusinessReview").removeClass('addBusinessReview_active');
        $("#addBusinessReview1, #addBusinessReview2, #addBusinessReview3").addClass('addBusinessReview_active');
    })
    $("#addBusinessReview4").click(function(e){
        e.preventDefault();
        $(".addBusinessReview").removeClass('addBusinessReview_active');
        $("#addBusinessReview1, #addBusinessReview2, #addBusinessReview3, #addBusinessReview4").addClass('addBusinessReview_active');
    })
    $("#addBusinessReview5").click(function(e){
        e.preventDefault();
        $(".addBusinessReview").removeClass('addBusinessReview_active');
        $("#addBusinessReview1, #addBusinessReview2, #addBusinessReview3, #addBusinessReview4, #addBusinessReview5").addClass('addBusinessReview_active');
    })
});

// become a parent list
myApp.onPageInit('become_parent_list', function(page) {
    loadBecomeParentContent(account_default_id);
});

// become a parent list
myApp.onPageInit('become_parent_disp', function(page) {
    loadBecomeParentDetails(account_id);
});

// find parent upload details
myApp.onPageInit('find_parent_create', function(page) {
    load_pet_categories('#find_parent_create-pettype');
    $("#find_parent_create-pettype").change(function(e) {
        e.preventDefault();
        if ($("#find_parent_create-pettype").val() == 'Select Pet Type') {
            myApp.alert("Please select the Pet Type");
        } else {
            load_breed_dropdown($("#find_parent_create-pettype").val(), '#find_parent_create-breed');
        }
    })
});

// filter find parent details
myApp.onPageInit('become_parent_filter', function(page) {
    load_pet_categories('#find_parent_filter-pettype');
    $("#find_parent_filter-pettype").change(function(e) {
        e.preventDefault();
        if ($("#find_parent_filter-pettype").val() == 'Select Pet Type') {
            myApp.alert("Please select the Pet Type");
        } else {
            load_breed_dropdown($("#find_parent_filter-pettype").val(), '#find_parent_filter-breed');
        }
    })
});

// find parent list
myApp.onPageInit('find_parent_list', function(page) {
    loadFindParentContent(account_default_id);
});

// become parent upload details
myApp.onPageInit('become_parent_create', function(page) {
    load_pet_categories('#become_parent_create-pettype');
});

// profile settings
myApp.onPageInit('settings', function(page) {
    $("#username_disp_dyn").html(token.username);
    $("#username_disp_dyn1").html(token.username);
});

// add account type selection
myApp.onPageInit('before_add_account', function(page) {
});

// pet add account page
myApp.onPageInit('pet_register', function(page) {
    load_pet_categories('#pet_register-pettype');
    $("#pet_register-pettype").change(function(e) {
        e.preventDefault();
        if ($("#pet_register-pettype").val() == 'Select Pet Type') {
            myApp.alert("Please select the Pet Type");
        } else {
            load_breed_dropdown($("#pet_register-pettype").val(), '#pet_register-breed');
        }
    })
});

// business add account page
myApp.onPageInit('business_register_add', function(page) {
    load_city('#business_register_add-city_select');
    initialize();
    load_category('#business_register_add-category', function(){});
});

// ambulance listing page
myApp.onPageInit('ambulance', function(page) {
});

// lost and found listing page
myApp.onPageInit('lost_and_found', function(page) {
    loadLostFoundContent(account_default_id);
});

// lost and found listing page
myApp.onPageInit('profiles', function(page) {
    loadProfilesList(account_id, profile_list_type);
});

// search listing page
myApp.onPageInit('search', function(page) {
    loadSearchList();
});

// chats listing page
myApp.onPageInit('chats', function(page) {
    loadChatsList();
});

// chats listing page
myApp.onPageInit('chat', function(page) {
    loadChatMessages(account_id);

    var chatroom_id = account_id;

    setInterval(function(){
        $.ajax({
            url: base_url + 'check_new_chat',
            type: 'POST',
            crossDomain: true,
            data: {
                user_id: token.id,
                acc_id: chatroom_id
            }
        }).done(function(res){
            if (res.status == 'Success') {
                var html = '';
                $.each(res.response, function(index, value){
                    var receiver_profile = $(".chat_reviever_img").attr('src');
                    html += '<div class="message message-received">'+
                                '<div class="message-text">'+value.messages+'</div>'+
                                '<div style="background-image:url('+receiver_profile+')" class="message-avatar"></div>'+
                            '</div>';
                })

                $("#messages_box_dyn").append(html);
            } else {
            }
        }).error(function(res){
        })
    }, 2000);
});

// edit business details page
myApp.onPageInit('edit_profile_business', function(page) {
});

// edit users details page
myApp.onPageInit('edit_profile_shopper', function(page) {
    load_edit_profile_shopper();
});

// edit pet details page
myApp.onPageInit('edit_profile_pet', function(page) {
    // load_edit_profile_shopper();
});

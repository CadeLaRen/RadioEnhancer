var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-26372393-2']);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var bgPage = chrome.extension.getBackgroundPage();
var debugLog = function(text)
{
    bgPage.debugLog(text);
};
function param(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

var loadCurrentOptions = function()
{
    //load options and set values
    $("input").each(function(index){
        var name = $(this).prop("name");
        var value = localStorage[name];

        if (value != "true" || value != "false" && $(this).prop('type') != 'checkbox'){
            $(this).val(value);
        } else if (value == "true"){
            $(this).prop('checked', true);
        } else {
            $(this).prop("checked", false);
        }             
    });

    if(localStorage['scrobble_session_key'] && localStorage['scrobble_session_key'] != 'null')
        {
        $('#scrobbleLoginButton').css('display', 'none');
        $('#scrobbleTokenContainer').css('display', 'block');
        $('#scrobbleToken').text(localStorage['scrobble_session_name']);// + ' (' + session['name'] + ')');
    }

    if (localStorage['notification_always_show'] == "true")
        {
        $("#notification_timeout").attr("disabled", "disabled");
    }
};

var saveCurrentOptions = function()
{
    if (isNaN($('input[name="notification_timeout"]').val()))
        {
        alert("Display length must be a number.");
        $('input[name="notification_timeout"]').val('').focus();
        return false;
    } 

    //load options and set values
    $("input").each(function(index){
        var name = $(this).prop("name");
        var value = false;

        if($(this).prop('type') == 'checkbox')
            {
            value = $(this).prop('checked');
        }

        if($(this).prop('type') == 'text')
            {
            value = $(this).val();
        }

        localStorage[name] = value;          
    });

    return true;
};

var enableSaveButton = function()
{
    $('#saveButton').prop('disabled', false);
    $("#saveButton").click(function(){
        var saved = saveCurrentOptions();

        if(saved)
        {
            debugLog("saved settings");
            _gaq.push(['_trackEvent', 'Settings', 'saved settings']);
            bgPage.window.refreshPandora();
            window.close();
        } else {
            debugLog("did not save settings - uh oh!");
        }
    });
}

var disableSaveButton = function()
{
    $('#saveButton').prop('disabled', true);
}

$(document).ready(function(){
    loadCurrentOptions();
    var ext = chrome.app.getDetails();

    $(".setting_checkbox").live('change', function(){
        enableSaveButton();
    });

    $(".setting_textbox").keypress(function(){
        enableSaveButton();
    });

    $("#cancelButton").click(function(){
        window.close();
    });

    $(".PE-version").html(ext.version);

    $(".link").click(function(){
        var person = $(this).prop("id");
        bgPage.ourWebsites(person);
    });

    $('#scrobbleLoginButton').click(function(){
        var username = $('#scrobble_username').val();
        bgPage.responseDispatcher('requestAuthentication', username);
    });

    $('#scrobbleLogoutButton').click(function(){
        bgPage.responseDispatcher('scrobbleLogout');

        $('#scrobbleTokenContainer').css('display', 'none');
        $('#scrobbleToken').text('');
        $('#scrobbleLoginButton').css('display', 'block');
    });

    $("ul.tabs > li").click(function(){
        var tab = $(this).attr("id");

        if ($(this).hasClass("selected")){
            return false;
        }

        //active tab
        $("ul.tabs > li.selected").removeClass("selected");
        $("ul.tabs > li#"+tab).addClass("selected");

        //active content
        $(".content > div.active").removeClass("active");
        $(".content > div#"+tab).addClass("active");
    });

    $("#notification_always_show").click(function(){
        if ($(this).prop("checked")){
            $("#notification_timeout").attr("disabled", "disabled");
        } else {
            $("#notification_timeout").removeAttr("disabled");
        }
    });
    
    //first run
    if (localStorage["first_run"] == "true")
    {
        localStorage["first_run"] = false;
        $(".first_run").fadeIn("slow");
    }
    
    _gaq.push(['_trackPageview']);
});
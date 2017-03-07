// AcapelaBox helper script

var audioMP3 = false;
var audioOGG = false;
var audioWav = false;
var canDownload = true;
var firefoxmobile = false;

function document_ready() {
    try {
        FilterVoices();
        language_dd = $("#acaboxlanguage_cb").msDropDown();
        //		voice_dd=$("#acaboxvoice_cb").msDropDown({mainCSS:'blue'});
        //		voice_dd=$("#acaboxvoice_cb").msDropDown();
    } catch (e) {
        alert(e.message);
    }
    audioMP3 = hasFeatureAudioMP3() && !firefoxmobile;
    audioOGG = hasFeatureAudioOGG();
    audioWav = hasFeatureAudioWav();

    $('input,textarea').placeholder();
    $("#jquery_jplayer_1").jPlayer({
        ready: function() {},
        swfPath: "js/jquery-jplayer",
        supplied: audioMP3 ? "mp3" : "oga",
        wmode: "window"
    });

    OnLogin();
    OnAcaboxTextChange();
}

// Is user logged ?
function user_logged() {
    var logged = 0;
    $.ajax({
        async: false,
        processData: "true",
        type: "POST",
        url: "user.php",
        dataType: "json",
        data: "function=islogged",
        success: function(data) {
            logged = data.logged;
            return logged;
        }
    });
    return logged;
}


// Enable/disable buttons when listening/downloading
function enable_UI(enable) {
    //  voice_dd.data("dd").disabled(!enable);
    if (typeof voice_dd != 'undefined')
        voice_dd.data("dd").set("disabled", !enable);
    language_dd.data("dd").set("disabled", !enable);
    document.getElementById("showAdvancedSettingsButton").disabled = !enable;
    document.getElementById("listen_button").disabled = !enable;
    document.getElementById("download_button").disabled = !enable;
    document.getElementById("audioformat_cb").disabled = !enable;

}

function show_msg_login() {
    //	showErrorPopup("<p>Feature only available when logged in</p>");
    showErrorPopup(loc_featurenotlogged);
}

function show_msg_download_notlogged() {
    showErrorPopup(loc_downloadnotlogged);
    //    showErrorPopup("To be able to download a text as audio file, you need to login and purchase credits.<br/><br/>Look <a href='acabox-prices.php'>here</a> for more information.");
}


function OnLogin() // When user logs in
{
    if (!user_logged()) {
        $("#download_button").css({
            'opacity': 0.5
        });
        $("#pronunciation_button").css({
            'opacity': 0.5
        });
        $("#demo_span").show();
        $("#settingsdiv").hide();
    } else {
        $("#download_button").css({
            'opacity': 1.0
        });
        $("#pronunciation_button").css({
            'opacity': 1.0
        });
        $("#demo_span").hide();
        $("#settingsdiv").show();
    }
    $.ajax({
        processData: "true",
        type: "POST",
        url: "user.php",
        dataType: "json",
        data: "function=info",
        success: function(data) {
            transaction_id = data.transaction_id;
            boxname = data.boxname;
            acaboxfilename = data.acaboxfilename;
        }
    });
    $.ajax({
        processData: "true",
        type: "POST",
        url: "acabox-flashsession.php",
        dataType: "json",
        data: "session=load",
        async: "false",
        success: function(data) {
            var txt = data.text;
            var rate = parseInt(data.speechrate);
            var shaping = parseInt(data.vocaltract);
            var voice = data.voice;
            var languageid = data.languageid;
            var audiofmt = parseInt(data.audioformat);
            var fontsize = parseInt(data.fontsize);
            var automatictextname = parseInt(data.automatictextname);

            $("#rate_slider").val(rate - 180);
            OnRateChange();
            $("#shaping_slider").val(shaping - 100);
            OnShapingChange();

            var cssfontSize = parseInt($('#acaboxText').css("font-size"));
            var csslineheight = parseInt($('#acaboxText').css("line-height"));
            var change = fontsize - cssfontSize;
            csslineheight = csslineheight + change;
            $('#acaboxText').css({
                'font-size': fontsize + "px"
            });
            $('#acaboxText').css({
                'font-size': csslineheight + "px"
            });


            $('#audioformat_cb').prop("selectedIndex", audiofmt);

            $('#automatictextname_checkbox').prop("checked", automatictextname);
            var idx = 0;
            $('#acaboxlanguage_cb option').each(function() {
                if (languageid == $(this).attr("data-id")) {
                    $(this).prop("selected", true);

                    if (typeof voice_dd != 'undefined') {
                        language_dd.data('dd').set("selectedIndex", idx);
                        FilterVoices(voice);
                    }
                }
                idx++;

            });
            idx = 0;
            $('#acaboxvoice_cb option').each(function() {
                if (voice == $(this).attr("data-id")) {
                    $(this).prop("selected", true);

                    if (typeof voice_dd != 'undefined')
                        voice_dd.data('dd').set("selectedIndex", idx);
                }
                idx++;

            });
            $("#acaboxText").text(txt);
            $("#acaboxText").val(txt);
            OnAcaboxTextChange();
            OnVoiceChanged();
            check_pronunciation();
        }
    });
}

// When user logs out
function OnLogout() {}


// UI events handler
// display only voices in a specific ISOCode
function FilterVoices(selected) {
    var langid = $("#acaboxlanguage_cb option:selected").data("id");
    var langiso = $("#acaboxlanguage_cb option:selected").data("language");
    var sel = "";
    if (typeof(selected) != 'undefined') {
        sel = "&voice=" + selected;
    }
    $.ajax({
        processData: true,
        async: false,
        type: "POST",
        url: "filtervoices.php",
        dataType: "html",
        data: "ISO=" + langiso + sel,
        success: function(data) {
            $("#acaboxvoice_div").empty().append(data);
            voice_dd = $("#acaboxvoice_cb").msDropDown();
        }
    });
}

function OnLanguageChanged() {
    phonemelanguage = $("#acaboxlanguage_cb option:selected").attr("data-language");
    FilterVoices();
    OnVoiceChanged();
    SaveState();
    if ($("#acaboxdiv3").css("display") != "none") {
        load_entry_list();
    }
}

function OnVoiceChanged() {
    phonemelanguage = $("#acaboxvoice_cb option:selected").attr("data-language");
    features = $("#acaboxvoice_cb option:selected").attr("data-features");
    a_features = features.split(',');
    cbbs = ["FMT_MP3", "FMT_WAV22K", "FMT_WAV8KA", "FMT_WAV8KU", "FMT_WAV8K"];
    fallback = 0;

    for (idx = 0; idx < cbbs.length; idx++) {
        if ($.inArray(cbbs[idx], a_features) >= 0) {
            $("#" + cbbs[idx]).show();
        } else {
            if ($("#" + cbbs[idx]).is(':selected')) {
                fallback = 1;
            }
            $("#" + cbbs[idx]).hide();
        }
    }
    if (fallback) {
        $('#audioformat_cb').prop("selectedIndex", 0); // Fallback to MP3 if one of the now hidden options was selected
    }
    OnAcaboxTextChange();
    if ($("#acaboxdiv3").css("display") != "none") {
        load_entry_list();
    }
    /*
    if (document.getElementById("acaboxdiv3").className === "shown")
    load_entry_list();*/

}

function OnAcaboxTextChange() {
    textChanged = true;
    var text = $("#acaboxText").val();
    var voice = $("#acaboxvoice_cb").val();
    var voiceid = $("#acaboxvoice_cb option:selected").attr("data-id");

    text = encodeURIComponent(text);
    voice = encodeURIComponent(voice);

    $.ajax({
        processData: "true",
        async: "true",
        type: "POST",
        url: 'GetTextInfo.php',
        dataType: "json",
        data: "text=" + text + "&voice=" + voice + "&voiceid=" + voiceid,
        success: function(data) {
            response = data;
            var txt = loc_textinfo.replace("&amp;", response.input_characters);
            txt = txt.replace("&amp;", response.replaced_characters);
            txt = txt.replace("&amp;", response.cost);
            //txt="Text Size:"+response.input_characters+" Characters:"+response.replaced_characters+" Credits:"+response.cost;
            if (response.voicecost > 1) {
                txt = txt + " (Premium)";
            }
            if (response.hasOwnProperty("remaining")) {
                //				txt=txt+" ("+response.remaining +" credits on your account)";
                txt = txt + loc_textinforemaining.replace("&amp;", response.remaining);
            }
            $("#TextLength").text(txt);
            if (response.remaining < response.cost) {
                $("#TextLength").css('color', 'red');
                //			  document.getElementById("download_button").disabled=true;

            } else {
                $("#TextLength").css('color', '#6599B7');
                document.getElementById("download_button").disabled = false;
            }
        }
    });
}

function changefont(id, change) {
    var fontSize = Math.round(parseFloat($(id).css("font-size"), 10));
    fontSize = fontSize + change;
    if (fontSize < 5) {
        fontSize = 5;
    }
    $(id).css({
        'font-size': fontSize + "px"
    });
    var lineheight = Math.round(parseFloat($(id).css("line-height"), 10));
    lineheight = lineheight + change;
    $(id).css({
        'line-height': lineheight + "px"
    });
}

// Settings handlers
function OnRateChange() {
    var valof = $("#rate_slider").val();
    if (parseInt(valof) > 0)
        valof = "+" + valof;
    $('#rate_output').text(valof);
    textChanged = true;
}

function OnShapingChange() {
    var valof = $("#shaping_slider").val();
    if (parseInt(valof) > 0)
        valof = "+" + valof;
    $('#shaping_output').text(valof);
    textChanged = true;
}

function toggle_advanced_Settings() {
    $("#acaboxdiv3").hide();
    $("#acaboxdiv2").toggle(); // .toggle('show') to add a visual effect
    //	$("#hideAdvancedSettingsButton").toggle();
    //	$("#showAdvancedSettingsButton").toggle();
}

// Pronunciation Editor handlers
function close_pronunciation_editor() {
    toggle_advanced_Settings();
    /*
	$("#acaboxdiv3").hide();
	$("#acaboxdiv2").show(); // .toggle('show') to add a visual effect
	*/
}

function show_pronunciation_editor() {
    if (user_logged()) {
        $("#acaboxdiv2").hide();
        //	  $("#hideAdvancedSettingsButton").toggle();
        //	  $("#showAdvancedSettingsButton").toggle();
        $("#acaboxdiv3").show();
        load_entry_list();
    } else {
        show_msg_login();
    }
}

function play_word() {
    var word = encodeURIComponent($("#newword").val());
    play_text(word);
}

function play_pronunciation() {
    var pronunciation = $("#newpronunciation").val();
    var usephonetic = $("#usephonetic").is(':checked');
    if (usephonetic) {
        pronunciation = "\\prn=" + pronunciation + "\\";
    }
    play_text(pronunciation);
}

function play_text(txt) {
    var voice = $("#acaboxvoice_cb").val();
    var voiceid = $("#acaboxvoice_cb option:selected").attr("data-id");

    text = "\\vct=100\\ \\spd=180\\ " + txt;
    text = encodeURIComponent(text);
    voice = encodeURIComponent(voice);

    var codecMP3 = "0";
    if (audioMP3)
        codecMP3 = "1";

    $.ajax({
        processData: "true",
        async: true,
        type: "POST",
        url: 'dovaas.php',
        dataType: "json",
        data: "text=" + text + "&voice=" + voiceid + "&listen=" + 1 + "&lexmode=true&codecMP3=" + codecMP3,
        success: function(data) {
            response = data;
            ListenLex(response.snd_url);
        }
    });
}
// play the word/transcription
function ListenLex(url) {
    var playerlex = document.createElement("audio");
    playerlex.setAttribute('src', url);
    playerlex.play();
}

// show/hide the phonetic help
function toggle_phonetics() {
    if ($("#phoneme_div").css("visibility") == "hidden" && phonemelanguage != "close") {
        {
            $.ajax({
                processData: "true",
                type: "GET",
                url: "help/phonetable.php",
                dataType: "html",
                data: "language=" + phonemelanguage,
                success: function(data) {
                    $("#phoneme_dlg_div").html(data);
                }
            });
            $("#phoneme_div").css({
                visibility: 'visible'
            });
            lang = phonemelanguage;
        }
    } else {
        $("#phoneme_div").css({
            visibility: 'hidden'
        });
    }

    $("#showPhonetics").toggle();
    $("#hidePhonetics").toggle();
}

function enable_addword(enable) {
    var word = $("#newword").val();

    if (!enable || word.length == 0) {
        $("#addword").css({
            opacity: '0.5'
        });
        $("#addword").attr("disabled", "disabled");
    } else {
        $("#addword").css({
            opacity: '1'
        });
        $("#addword").removeAttr("disabled");
    }
}

function check_pronunciation() {
    var usephonetic = $("#usephonetic").is(':checked');
    if (usephonetic) {

        var phonetic = encodeURIComponent($("#newpronunciation").val());
        $.ajax({
            processData: "true",
            type: "GET",
            url: "ValidatePhonetic.php",
            dataType: "html",
            data: "ISOCode=" + phonemelanguage + "&phonetic=" + phonetic,
            success: function(data) {
                $("#newprononciation_result").html(data);
                enable_addword(data.indexOf("'invalid'") < 0 && data.indexOf("'valid'") > -1);
            }
        });
    } else {
        $("#newprononciation_result").html("&nbsp;");
        enable_addword(true);
    }
}

function load_entry_list() {
    var voiceid = $("#acaboxvoice_cb option:selected").attr("data-id");

    $.ajax({
        processData: "true",
        type: "POST",
        url: 'LexiconEditor.php',
        dataType: "json",
        data: "lexicon=get&voice=" + voiceid,
        success: function(returneddata) {
            entriesarray = returneddata;

            table = '<table id="entrylisttable"><tr><th>Word</th><th>Pronunciation</th><th></th></tr>';
            for (var i = 0; i < entriesarray.length; i++) {
                entry = entriesarray[i];
                table += '<tr><td>' + entry.word + '</td><td>' + entry.transcription + '</td><td><button type="button" onclick="editLexiconEntry(' + entry.id + ')"><img src="Elements/b_edit.png" alt="Edit"/></button><button type="button" onclick="removeLexiconEntry(' + entry.id + ')"><img src="Elements/cross.png" alt="Remove"/></button></td></tr>';
            }
            table += '</table>';

            document.getElementById("entrylistdiv").innerHTML = table;
        }
        /*error: function(data)
	 {
		displayError("ERREUR");
	 }*/
    });
}

function add_entry() {
    var voiceid = $("#acaboxvoice_cb option:selected").attr("data-id");
    var word = encodeURIComponent($("#newword").val());
    var pronunciation = $("#newpronunciation").val();
    var usephonetic = $("#usephonetic").is(':checked');
    pronunciation = encodeURIComponent(pronunciation);
    $.ajax({
        processData: "true",
        type: "POST",
        url: 'LexiconEditor.php',
        dataType: "html",
        data: "lexicon=addword&voice=" + voiceid + "&word=" + word + "&pronunciation=" + pronunciation + "&phonetic=" + (usephonetic ? "1" : "0"),
        success: function(data) {
            load_entry_list();
        }
        /*error: function(data)
	 {
		displayError("ERREUR");
	 }*/
    });
}

function editLexiconEntry(entryid) {
    var voiceid = $("#acaboxvoice_cb option:selected").attr("data-id");
    $.ajax({
        processdata: "true",
        type: "POST",
        url: "LexiconEditor.php",
        dataType: "json",
        data: "lexicon=getword&voice=" + voiceid + "&entry=" + entryid,
        success: function(data) {
            $("#newword").val(data.word);
            var prn = data.transcription;

            if (prn.indexOf("\\prn=") >= 0) {
                prn = prn.substring(5, prn.length - 1);
                $("#newpronunciation").val(prn);

                $("#usephonetic").attr('checked', true);
            } else {
                $("#newpronunciation").val(data.transcription);
                $("#usephonetic").attr('checked', false);
            }
            check_pronunciation();
        }
    });
}

function removeLexiconEntry(entryid) {
    var voiceid = $("#acaboxvoice_cb option:selected").attr("data-id");

    $.ajax({
        processData: "true",
        type: "POST",
        url: 'LexiconEditor.php',
        dataType: "html",
        data: "lexicon=removeword&voice=" + voiceid + "&entry=" + entryid,
        success: function(data) {
            load_entry_list();
        }
        /*error: function(data)
	 {
		displayError("ERREUR");
	 }*/
    });
}



// Save the state of the box: current text, voice, settings... to DB
function SaveState() {
    var text = $("#acaboxText").val();
    var voice = $("#acaboxvoice_cb").val();
    var voiceid = $("#acaboxvoice_cb option:selected").attr("data-id");
    var rate = parseInt($("#rate_slider").val()) + 180;
    var shaping = parseInt($("#shaping_slider").val()) + 100;
    var fontsize = parseInt($('#acaboxText').css("font-size"));
    var audiofmt = $("#audioformat_cb").prop("selectedIndex");
    var automatictextname = $("#automatictextname_checkbox").prop("checked") ? "1" : "0";

    var myObj = {
        voice: voiceid,
        speechrate: rate,
        vocaltract: shaping,
        fontsize: fontsize,
        audioformat: audiofmt,
        automatictextname: automatictextname,
        text: text,
        session: "save"
    };
    $.ajax({
        processData: "true",
        type: "POST",
        async: true,
        url: "acabox-flashsession.php",
        dataType: "xml",
        data: myObj,
        success: function(data) {

        }
    });
}

// Listen/Download functions
function SendToVaaS(listenmode) {
    if (!listenmode && !user_logged()) {
        show_msg_download_notlogged();
        return;
    }
    var text = $("#acaboxText").val();
    if (listenmode) {
        var selectedrange = $("#acaboxText").textrange('get');
        if (selectedrange.length > 0) {
            text = selectedrange.text;
        }

    }
    var voice = $("#acaboxvoice_cb").val();
    var voiceid = $("#acaboxvoice_cb option:selected").attr("data-id");
    var rate = parseInt($("#rate_slider").val()) + 180;
    var shaping = parseInt($("#shaping_slider").val()) + 100;
    var format = $("#audioformat_cb option:selected").text();


    text = "\\vct=" + shaping + "\\ \\spd=" + rate + "\\ " + text;
    text = encodeURIComponent(text);
    voice = encodeURIComponent(voice);

    enable_UI(false);
    showWaitPopup(loc_processingtext);

    var codecMP3 = "0";
    if (audioMP3)
        codecMP3 = "1";
    $.ajax({
        processData: "true",
        async: listenmode == true ? true : true,
        type: "POST",
        url: 'dovaas.php',
        dataType: "json",
        data: "text=" + text + "&voice=" + voiceid + "&listen=" + listenmode + "&format=" + format + "&codecMP3=" + codecMP3 + "&spd=" + rate + "&vct=" + shaping,
        success: function(data) {
            hideWaitPopup();
            response = data;
            if (listenmode) {
                if (!response.hasOwnProperty("err_msg")) {
                    Listen(response.snd_url);
                } else {
                    showErrorPopup(response.err_msg);
                    //					  showErrorPopup(JSON.stringify(response,null,2));
                }
            } else {
                if (!response.hasOwnProperty('error')) {
                    Download(response.id, response.cost);
                } else // Error
                {
                    showErrorPopup(response.error);
                }
            }
            enable_UI(true);
        },
        error: function(e) {
            hideWaitPopup();
            var msg = "Error" + e.status + " " + e.statusText;
            showErrorPopup(msg);
        }
    });
}

function jquery_download() {
    $.fileDownload(downloadurl)
        .done(function() {
            hideDownload();
            OnAcaboxTextChange();
        })
        .fail(function() {
            hideDownload();
            alert("Problem downloading");
        });
    event.preventDefault();
    return false;
}

function generate_file() {
    $.ajax({
        processData: "true",
        async: true,
        type: "GET",
        url: downloadurl,
        dataType: "json",
        success: function(data) {
            $('#generate_confirm').show();
            setTimeout(function() {
                $('#generate_confirm').hide();
            }, 2000);
        },
        error: function(e) {
            alert("error");
        }

    });
}

function Listen(url) {
    if (audioMP3) {
        $("#jquery_jplayer_1").jPlayer("setMedia", {
            mp3: url
        }).jPlayer("play");
    } else if (audioOGG) {
        $("#jquery_jplayer_1").jPlayer("setMedia", {
            oga: url
        }).jPlayer("play");
    }
    textChanged = false;

    if (0) // Not using anymore the audio tag
    {
        $('#player').attr("src", url);
        document.getElementById("player").load();
        showElementWithId("player");
        $("#player").bind("contextmenu", function() {
            return false;
        });
        document.getElementById("player").play();
        $("#player").bind("contextmenu", function() {
            return false;
        });
    }
}

/* Show confirmation dialog */
function Download(id, cost) {
    if (canDownload) {
        //	  downloadurl="https://box.acapela-box.com/AcaBox/getaudio.php?id="+id+"&download=1";
        downloadurl = acaboxserver + "/getaudio.php?id=" + id + "&download=1";
        showDownload(id, cost);
    } else {
        //	  downloadurl="https://box.acapela-box.com/AcaBox/getaudio.php?id="+id+"&download=0";
        downloadurl = acaboxserver + "/getaudio.php?id=" + id + "&download=0";
        showGenerate(id, cost);
    }
}

function DoDownload() {
    if (canDownload) {
        jquery_download();
    } else {
        generate_file();
    }
    hideDownload();
}

function CancelDownload() {
    hideDownload();
}


// Error popup functions
function showErrorPopup(text) {
    $("#errorMsg").html(text);
    $("#error_div").css({
        visibility: 'visible'
    });
    showElementWithId("error_div");
    //document.getElementById("acabox").className = "overlay";
}

function hideErrorPopup() {
    hideElementWithId("error_div");
    //document.getElementById("acabox").className = "overlay";
}


// Wait popup functions
function showWaitPopup(text) {
    $("#waitMsg").text(text);
    $("#wait_div").css({
        visibility: 'visible'
    });
    showElementWithId("wait_div");
    //document.getElementById("acabox").className = "overlay";
}

function hideWaitPopup() {
    hideElementWithId("wait_div");
    //document.getElementById("acabox").className = "overlay";
}

// Display the confirmation dialog
function showDownload(id, cost) {
    var msg = loc_downloadconfirm.replace("&amp;", cost);
    $("#downloadMsg").html(msg);

    //	  $("#downloadMsg").html("Click 'OK' to confirm the download.<br/>Your account will be debited of:<br/> "+cost+" credits");
    $("#download_div").css({
        visibility: 'visible'
    });
    showElementWithId("download_div");
}

function showGenerate(id, cost) {
    $("#downloadMsg").html("Click 'OK' to confirm the generation.<br/>The file will be available in 'myAccount'.<br/>Your account will be debited of:<br/> " + cost + " credits");
    $("#download_div").css({
        visibility: 'visible'
    });
    showElementWithId("download_div");
}

function hideDownload() {
    hideElementWithId("download_div");
}

function doListenTOS() {
    var chk = $("#TOSAccepted").prop("checked") ? true : false;
    if (!chk) // Not accepted
    {
        showErrorPopup("Before you can listen to your text, you'll have to either<ul><li>accept the <a href='/wp/?page_id=302#contentconduct'>Terms of Use</a> or</li><li><a href='/AcaBox/acabox-user-signup.php'>create</a> an account</li></ul>");

    } else {
        SendToVaaS(1);
        SaveState();
        reTOS();
    }
}

function TOSlink() // :D
{
    $("#TOS_div").dialog({
        width: 600,
        height: 400,
        position: {
            my: "left bottom",
            at: "left top",
            of: "#TOSAccepted"
        }
    });
    $("#contentconduct").get(0).scrollIntoView();
}

function onTOSChange() {
    var chk = $("#TOSAccepted").prop("checked") ? true : false;
    $("#listen_button").css({
        opacity: chk ? 1.0 : 0.5
    });
}

function ShowTOS() {
    $("#TOS_div").css({
        visibility: 'visible'
    });
    showElementWithId("TOS_div");
}

function closeTOS() {
    /*
    	var chk=$("#TOSAccepted").prop("checked") ? "1":"0";
    	if(chk!=0)
    	{
    	  $("#listen_button_tos").hide();
    	  $("#listen_button").show()
    	}
    	*/
    hideElementWithId("TOS_div");
}

function reTOS() {
    $("#TOSAccepted").attr("checked", false);
    $("#listen_button").css({
        opacity: 0.5
    });
}
// Bug report

function showBugReport() {
    var bugvalue = "";
    var voiceid = $("#acaboxvoice_cb option:selected").attr("data-id");
    var text = $("#acaboxText").val();
    var langue = $("#acaboxlanguage_cb option:selected").val();
    bugvalue = "voice=" + voiceid + "&langue=" + langue + "&texte=" + text;
    $.colorbox({
        href: "demo_reportabug.php?" + bugvalue,
        width: "330",
        height: "540",
        showOverlay: true,
        overlayClose: true,
        opacity: 0.6,
        iframe: true,
        open: true
    });
}


// Helpers
function showElementWithId(identifier) {
    document.getElementById(identifier).className = "shown";
}

function hideElementWithId(identifier) {
    document.getElementById(identifier).className = "hidden";
}

function toggleElementWithId(identifier) {
    var item = document.getElementById(identifier);
    item.className = (item.className == 'hidden') ? 'shown' : 'hidden';
}


function hasFeatureAudio() {
    return !!document.createElement('audio').canPlayType;
}

function hasFeatureAudioMP3() {
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/mpeg').replace(/no/, ''));
}

function hasFeatureAudioOGG() {
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
}

function hasFeatureAudioWav() {
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
}

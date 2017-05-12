$(document).ready(function() {
    /* =========================================== */
    /* ============= INITIALIZATIONS ============= */
    /* =========================================== */
    
    'use strict';
    
    var h, th, desktopArea, appHeight, appName, update, s, arranged, showIcons = true;
    
    function checkSize() {
        h = window.innerHeight;
        th = $('.taskbar').css('height');
        th = th.substring(0, th.length - 2);
        desktopArea = (100 - (th * 100 / h)) + 'vh';
        appHeight = 500 + 'px';

        $('.desktop-area').css({
            'height': desktopArea
        });
    }
    
    checkSize();
    
    $(window).resize(function() {
        checkSize();
    });
    
    // TIME AND DATE
    
    update = setInterval(function() {
        
        var d, suffix, hours, min, list_days, dayNum, dayName, list_months, monthNum, monthName, date;
        d = new Date();
        
        hours = d.getHours();
        if(hours >= 12) {
            hours -= 12;
            suffix = "PM";
        }
        else
            suffix = "AM";
        if(hours == 0)
            hours = 12;
        
        min = d.getMinutes();
        if(min < 10)
            min = "0" + min;
        
        list_days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        dayNum = d.getDay();
        dayName = list_days[dayNum];
        
        list_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthNum = d.getMonth();
        monthName = list_months[monthNum];
        
        date = d.getDate();
        
        $('.logon-splash-screen .time').html(hours + ":" + min);
        $('.logon-splash-screen .date').html(dayName + ", " + monthName + " " + date);
        
        $('.taskbar .time').html(hours + ":" + min + " " + suffix);
        $('.taskbar .date').html((monthNum+1) + "/" + date + "/" + d.getFullYear());
        
        $('.charms-info .time').html(hours + ":" + min);
        $('.charms-info .date').html(dayName + "<br>" + monthName + " " + date);
        
    }, 500);
    
    // CAPS LOCK STATE
    
    (function($) {
        var capsLockState = "unknown";
        var methods = {
            init : function(options) {
                var settings = $.extend({}, options);
                var capsLockForcedUppercase = /MacPPC|MacIntel/.test(window.navigator.platform) === true;

                var helpers = {
                    isCapslockOn : function(event) {
                        var shiftOn = false;
                        if (event.shiftKey) {
                            shiftOn = event.shiftKey;
                        } else if (event.modifiers) {
                            shiftOn = !!(event.modifiers & 4);
                        }
                        var keyString = String.fromCharCode(event.which);
                        if (keyString.toUpperCase() === keyString.toLowerCase()) {
                        } else if (keyString.toUpperCase() === keyString) {
                            if (capsLockForcedUppercase === true && shiftOn) {
                            } else {
                                capsLockState = !shiftOn;
                            }
                        } else if (keyString.toLowerCase() === keyString) {
                            capsLockState = shiftOn;
                        }
                        return capsLockState;
                    },

                    isCapslockKey : function(event) {

                        var keyCode = event.which;
                        if (keyCode === 20) {
                            if (capsLockState !== "unknown") {
                                capsLockState = !capsLockState;
                            }
                        }

                        return capsLockState;

                    },

                    hasStateChange : function(previousState, currentState) {

                        if (previousState !== currentState) {
                            $('body').trigger("capsChanged");

                            if (currentState === true) {
                                $('body').trigger("capsOn");
                            } else if (currentState === false) {
                                $('body').trigger("capsOff");
                            } else if (currentState === "unknown") {
                                $('body').trigger("capsUnknown");
                            }
                        }
                    }
                };

                $('body').bind("keypress.capslockstate", function(event) {
                    var previousState = capsLockState;
                    capsLockState = helpers.isCapslockOn(event);
                    helpers.hasStateChange(previousState, capsLockState);
                });

                $('body').bind("keydown.capslockstate", function(event) {
                    var previousState = capsLockState;
                    capsLockState = helpers.isCapslockKey(event);
                    helpers.hasStateChange(previousState, capsLockState);
                });

                $(window).bind("focus.capslockstate", function() {
                    var previousState = capsLockState;
                    capsLockState = "unknown";
                    helpers.hasStateChange(previousState, capsLockState);
                });

                helpers.hasStateChange(null, "unknown");

                return this.each(function() {});

            },
            state : function() {
                return capsLockState;
            },
            destroy : function() {
                return this.each(function() {
                    $('body').unbind('.capslockstate');
                    $(window).unbind('.capslockstate');
                })
            }
        }

        jQuery.fn.capslockstate = function(method) {

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Error');
            }

        };
    })(jQuery);
    
    // REAL TIME CAPS LOCK MONITORING
    
    $(window).bind("capsOn", function(event) {
        if ($(".password-field:focus").length > 0) {
            $(".caps-warning").show();
        }
    });
    $(window).bind("capsOff capsUnknown", function(event) {
        $(".caps-warning").hide();
    });
    $(".password-field").bind("focusout", function(event) {
        $(".caps-warning").hide();
    });
    $("password-field").bind("focusin", function(event) {
        if ($(window).capslockstate("state") === true) {
            $(".caps-warning").show();
        }
    });
    $(window).capslockstate();
    
    // LOGON AUDIO
    
    for(var a=0;a<document.getElementsByTagName('audio').length;a++) {
        var aud = document.getElementsByTagName('audio').item(a);
        aud.autoplay = false;
        aud.controls = false;
    }
    
    
    // SHUTDOWN
    
    function shutdown() {
        $('html').fadeOut('slow', function() {
            $('html').remove();
            /*$('html').html('<span class="dead">Good Bye!</span>');
            $('.dead').css({
                'position': 'absolute',
                'top': '50vh',
                'left': '50vw',
                'margin-top': '-41px',
                'margin-left': '-159px',
                'font-family': 'Segoe UI',
                'font-size': '72px'
            });
            $('.dead').delay(1000).fadeOut();*/
        });
        document.getElementById('windows-shutdown-audio').play();
    }
    
    function restart() {
        $('body').fadeOut('slow', function() {
            location.reload();
        });
        document.getElementById('windows-shutdown-audio').play();
    }
    
    function lock() {
        $('.context-menu').css({'z-index':'-10'});
        $('.success-box, .desktop-element, .app, .charms-bar, .charms-info, .desktop').hide();
        $('.password-holder, .logon-splash-screen, .user-logon-screen').show();
        $('.logon-splash-screen').css({'top':'0vh'});
        $('.taskbar').css({'bottom':'0px'});
        $('.start-menu').fadeOut('slow', function() {
            document.getElementById('windows-logoff-audio').play();
        });
    }
    
    
    /* =================================== */
    /* ============= SCREENS ============= */
    /* =================================== */
    
    // BOOT SCREEN
    
    s = setInterval(function() {
        if($('body').hasClass('pace-done')) {
            $('.boot-screen').fadeOut('slow',function() {
                $('.logon-splash-screen').fadeIn('fast');
            });
            clearInterval(s);
        }
    }, 100);
    
    
    // USER LOGON SCREEN
    
    function showUserScreen() {
        if($('.logon-splash-screen').css('display')=="block") {
            $('.user-logon-screen').fadeIn('fast',function() {
                $('.logon-splash-screen').css({'top':'-100vh'});
            });
        }
    }
    $('body').keydown(function(e) {
        if((e.which>64&&e.which<91)||(e.which>96&&e.which<106)||(e.which>30&&e.which<41)||e.which==13)
        showUserScreen();
    });
    $('.logon-splash-screen').click(function() {
        showUserScreen();
    });
    
    
    // DESKTOP SCREEN AFTER EVALUATING PASSWORD
    function evaluatePassword() {
        var password = "admin";
        var $enter = $('.password-field').val();
        if($enter==password) {
            $('.logon-splash-screen').hide();
            $('.password-holder').hide();
            $('.success-box').fadeIn();
            $('.user-logon-screen').delay(2000).fadeOut('fast', function(){
                $('.desktop').fadeIn('slow', function() {
                    $('.desktop-element').fadeIn('show');
                    if(window.innerWidth > 480)
                        $('.app:not(.alert)').delay(600).fadeIn();
                    else {
                        $('.copyright').delay(600).fadeIn();
                        $('.taskbar .app-icon-set li').removeClass('active');
                    }
                    $('.context-menu').css({
                        'z-index': '8',
                        'visibility': 'visible'
                    });
                });
                document.getElementById('windows-logon-audio').play();
            });
        }
        else if($enter=='') {
            $('.password-holder').hide();
            $('.error-box .error-msg').html('Please enter your sign-in information and try again');
            $('.error-box').fadeIn(function() {
                document.getElementById('windows-error-audio').play();
            });
        }
        else {
            $('.password-holder').hide();
            $('.error-box .error-msg').html('The password is incorrect. Try Again');
            $('.error-box').fadeIn(function() {
                document.getElementById('windows-error-audio').play();
            });
        }
        $('.password-field').val('');
    }
    $('.enter-password').click(function() {
        evaluatePassword();
    });
    $('.password-field').keydown(function(e) {
        if(e.which==13)
            evaluatePassword();
    });
    $('.error-box .btn-error').click(function() {
        $('.error-box').fadeOut(function(){
                $('.password-holder').show();
            });
    });

   
    /* ==================================== */
    /* ============= CONTROLS ============= */
    /* ==================================== */
    
    
    /* ====================================================== */
    /* ============= USER LOGON SCREEN CONTROLS ============= */
    /* ====================================================== */
    
    // POWER BUTTON
    
    $('.power-button').click(function() {
        $('.power-dropdown').toggleClass('show-power-dropdown');
    });
    $('.power-dropdown').mouseleave(function() {
        $('.power-dropdown').removeClass('show-power-dropdown');
    });
    $('.shutdown').click(function() {
        shutdown();
    });
    $('.restart').click(function() {
        restart();
    });
    
    
    // BACK BUTTON
    
    function showSplashScreen() {
        $('.logon-splash-screen').css({'display':'block'});
        $('.logon-splash-screen').css({'top':'0vh'});
    }
    $('.back').click(function() {
        showSplashScreen();
    });
    
    
    // CHECK FOR CAPS LOCK ON/OFF
    
    
    
    
    /* ============================================ */
    /* ============= DESKTOP CONTROLS ============= */
    /* ============================================ */
    
    
    // DESKTOP CONTEXT MENU
    
    $(document).bind('contextmenu', function(e) {
        event.preventDefault();
        
        $('.context-menu').finish().toggle(100).css({
            top: event.pageY+"px",
            left: event.pageX+"px"
        });
    });
    $(document).bind('mousedown', function(e) {
        if(!$(e.target).parents('.context-menu').length > 0)
            $('.context-menu').hide();
    });
    
    
    
    // ICON SETTINGS
    
    $('.icon-grid-set li').click(function() {
        $('.icon-grid-set li').removeClass('active');
        $(this).toggleClass('active');
    });
    
    $('.icon-grid-set li').draggable();
    
    arranged = true;
    
    
    // CHARMS BAR
    
    $('.charms-bar-activator-top, .charms-bar-activator-bottom').mouseenter(function() {
        $('.charms-bar').show();
        $('.charms-bar').delay(400).animate({right:'0px'});
    });
    $('.charms-bar').mouseleave(function() {
        $('.charms-bar').fadeOut(function() {
            $('.charms-bar').animate({right:'-85px'});
        });
        $('.charms-info').fadeOut('fast');
    });
    
    $('.charms-bar').mouseenter(function() {
        $('.charms-info').fadeIn('fast');
    });
    
    
    // APPS INACCESSIBLE
    
    $('.desktop .icon-grid-set li').dblclick(function() {
        $('.alert').fadeIn();
    });
    
    
    
    /* =============================================== */
    /* ============= START MENU CONTROLS ============= */
    /* =============================================== */
    
    $('.start-button, .show-start-menu').click(function() {
        $('.start-menu').fadeIn('fast', function() {
            $('.metro-ui-grid').addClass('activate-metro-ui-grid');
            $('.taskbar').css({'bottom':'-40px'});
            $('.taskbar').hide();
        });
    });
    
    $('.desktop-tile, .desktop-activator').click(function() {
        $('.start-menu').fadeOut('slow', function() {
            $('.metro-ui-grid').removeClass('activate-metro-ui-grid');
            $('.taskbar').css({'bottom':'0px'});
            $('.taskbar').fadeIn();
        });
    });
    
    // METRO UI APPS

    $('.metro-ui-grid').sortable({
        revert: 'invalid',
        start: function (e, ui) {
            $(ui.placeholder).hide(300);
        },
        change: function (e, ui) {
            $(ui.placeholder).hide().show(300);
        }
    });
    $('.metro-ui-grid').disableSelection();
   
    // DROPDOWN
    
    $('.start-menu .user').click(function() {
        $('.start-menu .user-menu-dropdown').toggleClass('show-user-menu-dropdown');
    });
    $('.user-menu-dropdown').mouseleave(function() {
        $('.start-menu .user-menu-dropdown').removeClass('show-user-menu-dropdown');
    });
    
    $('.user-menu-dropdown .lock, .user-menu-dropdown .signout').click(function() {
        lock();
    });
    
    
    
    /* ======================================== */
    /* ============= APP CONTROLS ============= */
    /* ======================================== */
    
    $('.app .action-buttons .close:not(.disabled), .app .btn-ok').click(function() {
        $(this).parent().parent().fadeOut('fast');
        appName = '.'+$(this).parent().parent().attr('id');
        $('.taskbar .app-icon-set').find(appName).removeClass('active');
    });
    
    $('.app .action-buttons .minimize:not(.disabled)').click(function() {
        $(this).parent().parent().css({
            '-webkit-transform': 'scale(0)',
            '-moz-transform': 'scale(0)',
            'transform': 'scale(0)'
        });
        appName = '.'+$(this).parent().parent().attr('id');
        $('.taskbar .app-icon-set').find(appName).addClass('minimized');
    });
    
    $('.app .action-buttons .maximize:not(.disabled)').click(function() {
        var temp = (100-(th*100/h))*(h/100)+'px';
        if($(this).parent().parent().css('height')!=temp)
            $(this).parent().parent().css({
                'width': '100%',
                'height': desktopArea,
                'top': '0',
                'left': '0'
            });
        else
            $(this).parent().parent().css({
                'width': '104vh',
                'height': '65vh',
                'top': '5vh',
                'left': '35vw'
            });
    });
    
    $('.taskbar .app-icon-set li').click(function() {
        if(!$(this).hasClass('active')) {
            appName = 'body .'+$(this).attr('class');
            $(appName).fadeIn();
            $(this).addClass('active');
        }
        else if($(this).hasClass('minimized')) {
            $(this).removeClass('minimized');
            $(this).removeClass('active');
            appName = 'body .'+$(this).attr('class').substring();
            $(appName).css({
                '-webkit-transform': 'scale(1)',
                '-moz-transform': 'scale(1)',
                'transform': 'scale(1)'
            });
            $(this).addClass('active');
        }
    });
    
    $('.app').draggable({
        handle: '.title',
        containment: '.desktop'
    });
    
    $('.app').click(function() {
        $(this).parent().children('.app').addClass('inactive');
        $(this).parent().children('.app').css({'z-index':'4'});
        $(this).removeClass('inactive');
        $(this).css({'z-index':'5'});
    });
    
    
    /* ====================================================== */
    /* ============= CONTEXT MENU CONTROLS ============= */
    /* ====================================================== */
    
    $('.context-menu #largeIcons').click(function() {
        $('.desktop .icon-grid-set').removeClass('medium-icons');
        $('.desktop .icon-grid-set').removeClass('small-icons');
        $('.desktop .icon-grid-set').addClass('large-icons');
        $('.context-menu #mediumIcons, .context-menu #smallIcons').children('input').prop('checked', false);
        $(this).children('input').prop('checked', true);
    });
    
    $('.context-menu #mediumIcons').click(function() {
        $('.desktop .icon-grid-set').removeClass('large-icons');
        $('.desktop .icon-grid-set').removeClass('small-icons');
        $('.desktop .icon-grid-set').addClass('medium-icons');
        $('.context-menu #largeIcons, .context-menu #smallIcons').children('input').prop('checked', false);
        $(this).children('input').prop('checked', true);
    });
    
    $('.context-menu #smallIcons').click(function() {
        $('.desktop .icon-grid-set').removeClass('medium-icons');
        $('.desktop .icon-grid-set').removeClass('large-icons');
        $('.desktop .icon-grid-set').addClass('small-icons');
        $('.context-menu #mediumIcons, .context-menu #largeIcons').children('input').prop('checked', false);
        $(this).children('input').prop('checked', true);
    });
    
    $('.context-menu #arrangeIcons').click(function() {
        if(arranged) {
            $('.icon-grid-set li').css({
                'position': 'static'
            });
            arranged = false;
            $(this).children('input').prop('checked', true);
        } else {
            $('.icon-grid-set li').css({
                'position': 'relative'
            });
            arranged = true;
            $(this).children('input').prop('checked', false);
        }
    });
    
    $('.context-menu #toggleIcons').click(function() {
        $('.desktop .icon-grid-set').toggle();
        showIcons = !showIcons;
        $(this).children('input').prop('checked', showIcons);
    });
    
});
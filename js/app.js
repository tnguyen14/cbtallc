define(function (require) {
	var $ = require('jquery'),
		config = require('json!config'),
		moment = require('moment');

	require('gcal');
	require('form');
	require('validate');
	require('fancybox');

	// DOM Manipulation
	$(document).ready( function() {
		$(".therapist-stubs .stub a").click(function(e){
			e.preventDefault();
			var $stub = $(this).parent(".stub"),
				therapist_id = $(this).attr('href'),
				therapist_on = ($stub.hasClass("active")) ? true : false;

			// remove any other current states
			$(".therapist-stubs .stub").removeClass("active");
			$(".therapist-viewers .viewer").removeClass("active");

			// activate clicked-on therapist if it was originally not activated
			if (!therapist_on) {
				$stub.toggleClass("active");
				$(therapist_id).toggleClass("active");

				// Scroll to the viewer
				var scrollPos = $(".therapist-viewers").offset().top;
				$('html,body').animate({
					scrollTop: scrollPos - 200
				}, 'slow');
			}
		});

		$(".therapist-viewers .close-button").click(function(e){
			e.preventDefault();
			// Close all viewer, remove current states
			$(".therapist-stubs .stub").removeClass("active");
			$(".therapist-viewers .viewer").removeClass("active");
		});

		// FORMS
		$("#contact-form").validate({
			ignore: "input[type='hidden']",
			messages: {
				name: "Please specify your name.",
				email: {
					required: "We need your email address to contact you."
				},
				message: "Please tell us what your message is about."
			},
			submitHandler: function(form) {
				$(form).ajaxSubmit({
					dataType: 'json',
					beforeSubmit: function(arr, $form) {
						// concat phone partials into full phone numbers
						var tel1, tel2, tel3, telIndex;
						for (var i = 0, n = arr.length; i < n; i++) {
							switch(arr[i].name) {
								case 'tel-1':
									tel1 = arr[i].value;
									telIndex = i;
									break;
								case 'tel-2':
									tel2 = arr[i].value;
									break;
								case 'tel-3':
									tel3 = arr[i].value;
									break;
								default:
									continue;
							}
						}

						arr.push({
							name: "phone",
							value: '(' + tel1 + ') ' + tel2 +  '-' + tel3
						});
						// remove the phone partials from telIndex
						arr.splice(telIndex, 3);
					},
					success: function(responseText, statusText, xhr, $form) {
						$form.empty();
						$form.html('<p>Thank you for contacting us. We will be in touch shortly.</p>')
					}
				});
			}
		});

		// initialize full calendar
		var calendarView = 'agendaDay';
		if (window.matchMedia("(min-width: 800px)").matches) {
			calendarView = 'agendaWeek';
		}
		$('.calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
			eventSources: [
				{
					url: "http://www.google.com/calendar/feeds/cep1ta6rnrasr0h68a9f3qir80%40group.calendar.google.com/public/basic",
					className: 'jvermilyea'
				},
				{
					url: "http://www.google.com/calendar/feeds/8fe01o3ivjvd9tomq8o7obub20%40group.calendar.google.com/public/basic",
					className: 'ehiggins'
				}
			],
			defaultView: calendarView,
			eventClick: function(calEvent, jsEvent, view) {
				var $form = $('.appointment-form'),
					start = moment(calEvent.start),
					end = moment(calEvent.end),
					therapist = calEvent.source.className[0];
				// check for therapist from selected appointment, select the right therapist
				$("option", "#therapist").each(function(){
					if ($(this).val() === therapist) {
						$(this).prop('selected', true);
						// since the select element is disabled, copy the value to the hidden therapist-input field
						$("#therapist-input", $form).val($(this).text());
					}
				});
				// bring over correct date and time to form
				$("#app-date", $form).val(start.format("MMM D, YYYY"));
				$("#app-time", $form).val(start.format("h:mm A") + " - " + end.format("h:mm A"));
				// open the fancybox overlay
				$.fancybox($form);
				return false;
			}
		});

		// tabs
		$('.tabs-menu li').click(function(e){
			e.preventDefault();
			var a = $('a', this);
			var tabID = a.attr('href');

			$(this).addClass('active'); // add class .active to the clicked button
			$(this).siblings().removeClass('active'); // remove the .active class from sibling buttons
			$(tabID).addClass('active');
			$(tabID).siblings().removeClass('active');
		});
	});
});
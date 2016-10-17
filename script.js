var originalCard = $('.card').clone();
var txtValue = $("#txt_value");

function copyCard(array, callingFlag) { // "f" call from streams/featured / "s" call from search/channels
  var logo = "";
  var displayName = "";
  var title = "";
  var channelName = "";
  var url = "";
  var setOnline = function(data) { // "data" from the getJSON call (https://api.twitch.tv/kraken/streams/ + channelName +)
    console.log(data);
    if (data.stream) {
      $(this.copiedCard).find('.status').addClass('online');
      $(this.copiedCard).find('.channel-info').text(data.stream.channel.status);
    } else {
      $(this.copiedCard).find('.channel-info').text('');
    }
  }

  for (var i = 0; i < array.length; i++) {
    var channelInfo = callingFlag === "f" ? array[i].stream.channel : array[i];
    logo = channelInfo.logo;
    displayName = channelInfo.display_name;
    channelName = channelInfo.name;
    url = channelInfo.url;
    title = array[i].title;

    var copiedCard = originalCard.clone();
    if (!logo) {
      var span = document.createElement("span");
      $(span).html('<i class="fa fa-user" aria-hidden="true"></i>');
      $(span).addClass('default-logo');
      $(copiedCard).find('.picture').html("");
      $(copiedCard).find('.picture').append(span);
    } else {
      $(copiedCard).find('.img-circle').attr('src', logo);
    }
    $(copiedCard).find('.channel-name').text(displayName);
    $(copiedCard).appendTo('.list-unstyled');
    $(copiedCard).on('click', { // Passing data to the handler (closure)
      channelName: channelName,
      url: url
    }, function(event) {
      if ($(window).width() < 992) {
        window.open('https://www.twitch.tv/' + event.data.channelName);
        return null;
      }
      var embedVideo = 'https://player.twitch.tv/?channel=' + event.data.channelName;
      var iframe = document.createElement("iframe");
      if (event.data.channelName) {
        $('.content').html("");
        $(iframe).attr("width", "100%");
        $(iframe).attr("height", "100%");
        $(iframe).attr("scrolling", "no");
        $(iframe).attr("frameborder", "0");
        $(iframe).attr("src", embedVideo);
        $('.content').append(iframe);
      }
    });
    if (callingFlag === "f") {
      $(copiedCard).find('.status').addClass('online');
      $(copiedCard).find('.channel-info').text(title);
    } else {
      $.getJSON('https://api.twitch.tv/kraken/streams/' + channelName + '?client_id=hypftx411y3f3a8a7o2vabcl6727ctc&callback=?', setOnline.bind({ copiedCard: copiedCard }));
      // The bind() method creates a new function that, *when called*, has its "this" keyword set to the provided value, with a given sequence of arguments preceding any provided *when the new function is called*.
    }
  }
  if (array.length === 0) {
    var li = document.createElement("li");
    $(li).addClass('notResult-msg');
    $(li).html("Oh! Unfortunately, no results were found.");
    $('.list-unstyled').append(li);
  }
}

function callFeatured() {
  $.getJSON('https://api.twitch.tv/kraken/streams/featured' + '?client_id=hypftx411y3f3a8a7o2vabcl6727ctc&callback=?', function(data) {
    console.log(data);
    var array = data.featured;
    copyCard(array, "f");
  });
}

function callSearch(search) {
  $('#featured').removeClass('hidden');
  if (!search) {
    $('li').remove();
    return null;
  }
  $('.tab').removeClass('selected');
  $('#all-tab').addClass('selected');
  $.getJSON('https://api.twitch.tv/kraken/search/channels?q=' + search + '&client_id=hypftx411y3f3a8a7o2vabcl6727ctc&callback=?', function(data) {
    console.log(data);
    var array = data.channels;
    $('.list-unstyled').html("");
    copyCard(array, "s");
  });
}

$(document).ready(function() {
  callFeatured();

  $('#featured').on('click', function() {
    $('#featured').addClass('hidden');
    $('li').remove();
    $('.tab').removeClass('selected');
    $('#all-tab').addClass('selected');
    callFeatured();
  });

  $('.tab').on('click', function() {
    $('.tab').removeClass('selected');
    $(this).addClass('selected');
    var status = $(this).data().status;
    $('.card').removeClass('hidden');
    if (status === 'online') {
      $('.card .status').not('.online').closest('.card').addClass('hidden');
    } else if (status === 'offline') {
      $('.card').has('.online').addClass('hidden');
    }
  });

  $("#search").click(function() {
    var search = txtValue.val();
    callSearch(search);
  });
  txtValue.keyup(function(event){
    if(event.keyCode == 13) {
      var search = txtValue.val();
      callSearch(search);
    }
  });
});

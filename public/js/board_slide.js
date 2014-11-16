$(document).ready(function()
{
    $('.triangle').addClass('arrow-left');
  $('.sidebar-button').click(function() {
    if($(this).css("margin-right") == "400px")
    {
        $('.sidebar').animate({"margin-right": '-=400'});
        $('.sidebar-button').animate({"margin-right": '-=400'});
    }
    else
    {
        $('.sidebar').animate({"margin-right": '+=400'});
        $('.sidebar-button').animate({"margin-right": '+=400'});
    }

    $('.triangle').toggleClass('arrow-left');
    $('.triangle').toggleClass('arrow-right');
});

  });
 // });     
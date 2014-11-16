$(document).ready(function()
{
    $('.triangle').addClass('arrow-left');
  $('.sidebar-button').click(function() {
    if($(this).css("margin-right") == "250px")
    {
        $('.sidebar').animate({"margin-right": '-=250'});
        $('.sidebar-button').animate({"margin-right": '-=250'});
    }
    else
    {
        $('.sidebar').animate({"margin-right": '+=250'});
        $('.sidebar-button').animate({"margin-right": '+=250'});
    }

    $('.triangle').toggleClass('arrow-left');
    $('.triangle').toggleClass('arrow-right');
});

  });
 // });     
$(function(){
    $("#navbar").load("navbar.html");
});
$('form').submit(function(event) {
  event.preventDefault();

  var email = $('input[name="email"]').val();
  var password = $('input[name="password"]').val();

  $.ajax({
    url: '/signin',
    method: 'POST',
    data: {
      email: email,
      password: password
    },
    success: function(response) {
      if (response.status === 200) {
        window.location.href = 'profile.html';
      } else {
        alert('Invalid email or password');
      }
    },
    error: function() {
      alert('Error occurred during login');
    }
  });
});

  $(function() {
    $(document).on('submit', 'form', function(event) {
      event.preventDefault();

      var username = $('input[name="username"]').val();
      var name = $('input[name="name"]').val();
      var breed = $('input[name="breed"]').val();
      var email = $('input[name="email"]').val();
      var password = $('input[name="password"]').val();
      var repeatPassword = $('input[name="repeatPassword"]').val();

      $.ajax({
        url: '/signup',
        method: 'POST',
        data: {
          username: username,
          name: name,
          breed: breed,
          email: email,
          password: password,
          repeatPassword: repeatPassword
        },
        success: function(response) {
          if (response.status === 200) {
            alert('Sign-up successful');
            window.location.href = '/public/profile.html';
          } else {
            alert('Sign-up failed: ' + response.message);
          }
        },
        error: function() {
          alert('Error occurred during sign-up' );
        }
      });
    });
  });
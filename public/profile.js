$(function() {
    $("#navbar").load("navbar.html");

    loadAvatar();
    loadUserData();
  });

  function loadAvatar() {
    $.ajax({
      url: '/avatar',
      method: 'GET',
      success: function(response) {
        if (response.success) {
          $('#avatar-img').attr('src', response.avatarUrl);
        } else {
          console.log('Failed to load avatar:', response.error);
        }
      },
      error: function() {
        console.log('Error occurred while loading avatar');
      }
    });
  }

  function loadUserData() {
    $.ajax({
      url: '/userdata',
      method: 'GET',
      success: function(response) {
        if (response.success) {
          // Update the user data fields
          $('#name').val(response.name);
          $('#breed').val(response.breed);
          $('#description').val(response.description);
          $('#links').val(response.links.join(', '));
        } else {
          console.log('Failed to load user data:', response.error);
        }
      },
      error: function() {
        console.log('Error occurred while loading user data');
      }
    });
  }

  function uploadAvatar() {
    var avatarFile = $('#picture-input').prop('files')[0];
    var formData = new FormData();
    formData.append('avatar', avatarFile);

    $.ajax({
      url: '/uploadavatar',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        if (response.success) {
          loadAvatar();
          alert('Avatar uploaded successfully!');
        } else {
          alert('Failed to upload avatar');
        }
      },
      error: function() {
        alert('Error occurred during avatar upload');
      }
    });
  }

  function saveUserData() {
    var name = $('#name').val();
    var breed = $('#breed').val();
    var description = $('#description').val();
    var links = $('#links').val().split(',').map(link => link.trim());

    $.ajax({
      url: '/savedata',
      method: 'POST',
      data: {
        name: name,
        breed: breed,
        description: description,
        links: links
      },
      success: function(response) {
        if (response.success) {
          alert('User data saved successfully!');
        } else {
          alert('Failed to save user data');
        }
      },
      error: function() {
        alert('Error occurred while saving user data');
      }
    });
  }
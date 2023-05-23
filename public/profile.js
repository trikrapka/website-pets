$(function() {
  $('#navbar').load('navbar.html');
  $.ajax({
    url: 'http://localhost:3000/profile',
    method: 'GET',
    success: function(response) {
      $('#name').val(response.name);
      $('#breed').val(response.breed);
      $('#description').val(response.description);
    },
    error: function() {
      alert('Error occurred while loading user data');
    }
  });

  function saveUserData() {
    var name = $('#name').val();
    var breed = $('#breed').val();
    var description = $('#description').val();

    $.ajax({
      url: 'http://localhost:3000/profile',
      method: 'POST',
      data: {
        name: name,
        breed: breed,
        description: description
      },
      success: function(response) {
        alert('User data saved successfully');
      },
      error: function() {
        alert('Error occurred while saving user data');
      }
    });
  }
  function saveAvatar() {
    var avatarFile = $('#avatar-input')[0].files[0];
    var formData = new FormData();
    formData.append('avatar', avatarFile);

    $.ajax({
      url: 'http://localhost:3000/avatar',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        alert('Avatar saved successfully');
      },
      error: function() {
        alert('Error occurred while saving the avatar');
      }
    });
  }

  $(document).on('click', '#name + .btn-2', saveUserData);
  $(document).on('click', '#breed + .btn-2', saveUserData);
  $(document).on('click', '#description + .btn-2', saveUserData);
});

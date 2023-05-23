$(function() {
    $("#navbar").load("navbar.html");

    loadAvatar();
    loadUserData();
  });
  $(document).ready(function() {
    // Load user data on page load
    $.ajax({
      url: 'http://localhost:3000/profile',
      method: 'GET',
      success: function(response) {
        // Update the DOM with the user data
        $('#name').val(response.name);
        $('#breed').val(response.breed);
        $('#description').val(response.description);
      },
      error: function() {
        alert('Error occurred while loading user data');
      }
    });
  
    // Save user data
    function saveUserData() {
      var name = $('#name').val();
      var breed = $('#breed').val();
      var description = $('#description').val();
  
      // Send the updated data to the server
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
  // Function to save the avatar
function saveAvatar() {
  // Get the selected avatar file
  var avatarFile = $('#avatar-input')[0].files[0];

  // Create a new FormData object
  var formData = new FormData();
  formData.append('avatar', avatarFile);

  // Send the avatar data to the server
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

    // Attach event handlers to the save buttons
    $('#name + .btn-2').click(saveUserData);
    $('#breed + .btn-2').click(saveUserData);
    $('#description + .btn-2').click(saveUserData);
  });
  
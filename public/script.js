$(function () {
  $("#uploadForm").on("submit", function (event) {
    event.preventDefault();
    var formData = new FormData(this);

    $.ajax({
      url: "http://localhost:3000/upload",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false, 
      success: function(response) {
        if (response.success) {
          var imageUrl = response.imageUrl;
          var description = formData.get("description");
          displayImage(imageUrl, description);
          clearForm(); 
        } else {
          console.error("Error uploading image.");
        }
      },
      error: function(xhr, status, error) {
        console.error("Error:", error);
      }
    });
  });

  loadGallery();

  function displayImage(imageUrl, description) {
    var imageElement = $("<div class='image'>")
      .append($("<img>").attr("src", imageUrl))
      .append($("<p>").text(description));

    $("#imageContainer").prepend(imageElement);
  }

  function loadGallery() {
    $.ajax({
      url: 'http://localhost:3000/upload',
      method: 'GET',
      success: function (response) {
        var imageContainer = $('#imageContainer');
        imageContainer.empty();
        var galleryData = Array.isArray(response) ? response : Object.values(response);
        galleryData.forEach(function (item) {
          var imageUrl = item.imageUrl;
          var description = item.description;
  
          var image = $('<img>').attr('src', imageUrl);
  
          var descParagraph = $('<p>').text(description);
  
          imageContainer.append(image, descParagraph);
        });
      },
      error: function (error) {
        console.error('Error loading gallery:', error);
      }
    });
  }
  
  
  function clearForm() {
    $("#imageInput").val("");
    $("#captionInput").val("");
  }
});

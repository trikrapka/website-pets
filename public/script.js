$(function () {
  $("#uploadForm").on("submit", function (event) {
    event.preventDefault();
    var formData = new FormData(this);

    $.ajax({
      url: "http://localhost:3000/gallery",
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
  
  function clearForm() {
    $("#imageInput").val("");
    $("#captionInput").val("");
  }
});

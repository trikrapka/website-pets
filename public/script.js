$(function () {
  var signedInAsAdmin = localStorage.getItem('isLoggedInAdmin'); 

  $("#uploadForm").on("submit", function (event) {
    event.preventDefault();
    var formData = new FormData(this);

    $.ajax({
      url: "http://localhost:3000/gallery",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (response) {
        if (response.success) {
          var imageUrl = response.imageUrl;
          var description = formData.get("description");
          displayImage(imageUrl, description);
          clearForm();
        } else {
          console.error("Error uploading image.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      }
    });
  });

  loadGallery();

  function displayImage(imageUrl, description) {
    var imageElement = $("<div class='image'>")
      .append($("<img>").attr("src", imageUrl))
      .append($("<p>").text(description));

    if (signedInAsAdmin) {
      var deleteButton = $("<button>")
        .text("Delete")
        .addClass("deleteButton")
        .on("click", function () {
          deleteImage(imageUrl);
        });

      imageElement.append(deleteButton);
    }

    $("#imageContainer").prepend(imageElement);
  }

  function clearForm() {
    $("#imageInput").val("");
    $("#captionInput").val("");
  }

  function deleteImage(imageUrl) {
    $.ajax({
      url: "http://localhost:3000/gallery",
      type: "DELETE",
      data: { imageUrl: imageUrl },
      success: function (response) {
        if (response.success) {
          $("img[src='" + imageUrl + "']").parent().remove();
        } else {
          console.error("Error deleting image.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      }
    });
  }
    $("#commentForm").on("submit", function (event) {
      event.preventDefault();
      var formData = new FormData(this);
  
      $.ajax({
        url: "http://localhost:3000/comments",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
          if (response.success) {
            var comment = response.comment;
            displayComment(comment);
            clearForm();
          } else {
            console.error("Error submitting comment.");
          }
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        }
      });
    });

    loadComments();
  
    function displayComment(comment) {
      var commentElement = $("<div class='comment'>")
        .append($("<p>").text(comment.content))
        .append($("<span>").text("By: " + comment.author));
  
      $("#commentContainer").prepend(commentElement);
    }
  
    function clearForm() {
      $("#commentInput").val("");
      $("#authorInput").val("");
    }
});

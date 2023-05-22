const addPictureBtn = document.querySelector('.add-picture-btn');
    const pictureInput = document.querySelector('#picture-input');
    
    addPictureBtn.addEventListener('click', () => {
    pictureInput.click();
    });
    $(function(){
        $("#navbar").load("navbar.html");
    });

    document.getElementById('uploadForm').addEventListener('submit', function(event) {
      event.preventDefault();
    
      var imageFile = document.getElementById('imageInput').files[0];
      var description = document.getElementById('descriptionInput').value;
    
      var formData = new FormData();
      formData.append('image', imageFile);
      formData.append('description', description);
    
      fetch('/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Reload the gallery to display the updated images
          loadGallery();
          alert('Picture uploaded successfully!');
          // Additional code here for success handling
        } else {
          alert('Upload failed. Please try again.');
          // Additional code here for error handling
        }
      })
      .catch(error => {
        alert('Upload failed. Please try again.');
        // Additional code here for error handling
      });
    });
    
    function loadGallery() {
      fetch('/gallery')
        .then(response => response.json())
        .then(data => {
          var gallery = document.getElementById('gallery');
          gallery.innerHTML = '';
    
          data.forEach(item => {
            var image = document.createElement('img');
            image.src = item.imageUrl;
            gallery.appendChild(image);
    
            var description = document.createElement('p');
            description.textContent = item.description;
            gallery.appendChild(description);
          });
        })
        .catch(error => {
          console.error('Error loading gallery:', error);
        });
    }
    
    // Load the gallery on initial page load
    loadGallery();
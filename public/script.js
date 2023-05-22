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
          loadGallery();
          alert('Picture uploaded successfully!');
        } else {
          alert('Upload failed. Please try again.');
        }
      })
      .catch(error => {
        alert('Upload failed. Please try again.');
      });
    });
    
    function loadGallery() {
      const collection = db.collection('gallery');
    
      collection.find().toArray()
        .then((data) => {
          var gallery = document.getElementById('gallery');
          gallery.innerHTML = '';
    
          data.forEach((item) => {
            var image = document.createElement('img');
            image.src = item.imageUrl;
            gallery.appendChild(image);
    
            var description = document.createElement('p');
            description.textContent = item.description;
            gallery.appendChild(description);
          });
        })
        .catch((error) => {
          console.error('Error loading gallery:', error);
        });
    }
    
    loadGallery();